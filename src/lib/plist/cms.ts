/**
 * Minimal reader for signed configuration profiles (.mobileconfig).
 * A signed profile is a CMS / PKCS#7 SignedData blob (DER) whose
 * encapsulated content is the plain plist. We walk the ASN.1 tree and pick
 * the OCTET STRING that holds a plist, and collect certificate common names.
 */

interface Node {
  tag: number;
  start: number; // content start
  end: number; // content end
  constructed: boolean;
}

function readNode(b: Uint8Array, pos: number, limit: number): Node & { next: number } {
  const tag = b[pos] ?? 0;
  let p = pos + 1;
  if (p >= limit) throw new Error("truncated");
  let len = b[p++] ?? 0;
  let indefinite = false;
  if (len === 0x80) {
    indefinite = true;
    len = 0;
  } else if (len & 0x80) {
    const n = len & 0x7f;
    if (n > 4) throw new Error("length too large");
    len = 0;
    for (let i = 0; i < n; i++) len = len * 256 + (b[p++] ?? 0);
  }
  const constructed = (tag & 0x20) !== 0;
  if (indefinite) {
    // walk children until end-of-contents 00 00
    let q = p;
    while (q < limit && !(b[q] === 0 && b[q + 1] === 0)) q = readNode(b, q, limit).next;
    return { tag, start: p, end: q, constructed, next: q + 2 };
  }
  if (p + len > limit) throw new Error("truncated");
  return { tag, start: p, end: p + len, constructed, next: p + len };
}

function walk(b: Uint8Array, start: number, end: number, visit: (n: Node) => void, depth = 0) {
  if (depth > 40) return;
  let p = start;
  while (p < end) {
    const n = readNode(b, p, end);
    visit(n);
    if (n.constructed) walk(b, n.start, n.end, visit, depth + 1);
    p = n.next;
  }
}

const ascii = (b: Uint8Array) => new TextDecoder().decode(b);

function looksLikePlist(b: Uint8Array): boolean {
  const head = ascii(b.subarray(0, 64))
    .replace(/^\uFEFF/, "")
    .trimStart();
  return (
    head.startsWith("<?xml") ||
    head.startsWith("<plist") ||
    head.startsWith("<!DOCTYPE") ||
    head.startsWith("bplist")
  );
}

export interface SignedProfile {
  content: Uint8Array;
  signers: string[];
}

/** Returns null if the bytes aren't a CMS blob containing a plist. */
export function unwrapSignedProfile(b: Uint8Array): SignedProfile | null {
  if (b.length < 16 || b[0] !== 0x30) return null;
  let content: Uint8Array | null = null;
  const chunks: Uint8Array[] = [];
  const signers: string[] = [];
  try {
    walk(b, 0, b.length, (n) => {
      if (n.tag === 0x04 && !n.constructed) {
        const slice = b.subarray(n.start, n.end);
        if (!content && looksLikePlist(slice)) content = slice;
        chunks.push(slice);
      }
      // OID 2.5.4.3 (commonName) followed by a string
      if (
        n.tag === 0x06 &&
        n.end - n.start === 3 &&
        b[n.start] === 0x55 &&
        b[n.start + 1] === 0x04 &&
        b[n.start + 2] === 0x03
      ) {
        const s = readNode(b, n.end, b.length);
        if ([0x0c, 0x13, 0x14, 0x16].includes(s.tag)) {
          const cn = ascii(b.subarray(s.start, s.end));
          if (!signers.includes(cn)) signers.push(cn);
        }
      }
    });
  } catch {
    return null;
  }
  if (!content) {
    // BER constructed OCTET STRING split into chunks
    const total = chunks.reduce((a, c) => a + c.length, 0);
    const joined = new Uint8Array(total);
    let o = 0;
    for (const c of chunks) {
      joined.set(c, o);
      o += c.length;
    }
    const txt = ascii(joined);
    const i = txt.indexOf("<?xml");
    if (i < 0) return null;
    content = joined.subarray(i);
  }
  return { content, signers };
}

/** Common names found in a DER certificate (subject CN is usually the last one). */
export function certCommonNames(b: Uint8Array): string[] {
  const out: string[] = [];
  try {
    walk(b, 0, b.length, (n) => {
      if (
        n.tag === 0x06 &&
        n.end - n.start === 3 &&
        b[n.start] === 0x55 &&
        b[n.start + 1] === 0x04 &&
        b[n.start + 2] === 0x03
      ) {
        const s = readNode(b, n.end, b.length);
        if ([0x0c, 0x13, 0x14, 0x16].includes(s.tag)) out.push(ascii(b.subarray(s.start, s.end)));
      }
    });
  } catch {
    /* ignore */
  }
  return out;
}
