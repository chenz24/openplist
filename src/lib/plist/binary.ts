import type { PDictEntry, PValue } from "./types";

const APPLE_EPOCH = 978307200000; // 2001-01-01T00:00:00Z in ms

/* ------------------------------- parsing -------------------------------- */

export function isBinaryPlist(bytes: Uint8Array): boolean {
  if (bytes.length < 8) return false;
  return String.fromCharCode(...bytes.subarray(0, 6)) === "bplist";
}

export function parseBinaryPlist(bytes: Uint8Array): PValue {
  if (!isBinaryPlist(bytes)) throw new Error("Not a binary plist (missing bplist header).");
  if (bytes.length < 40) throw new Error("Binary plist is truncated.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const trailer = bytes.length - 32;
  const offsetSize = view.getUint8(trailer + 6);
  const refSize = view.getUint8(trailer + 7);
  const numObjects = Number(view.getBigUint64(trailer + 8));
  const topObject = Number(view.getBigUint64(trailer + 16));
  const offsetTableOffset = Number(view.getBigUint64(trailer + 24));

  const offsets: number[] = new Array(numObjects);
  for (let i = 0; i < numObjects; i++) {
    offsets[i] = readUInt(view, offsetTableOffset + i * offsetSize, offsetSize);
  }

  const cache = new Map<number, PValue>();

  const readRef = (pos: number) => readUInt(view, pos, refSize);

  function readObject(index: number): PValue {
    if (index >= numObjects) throw new Error("Binary plist references a missing object.");
    const cached = cache.get(index);
    if (cached) return cached;
    let pos = offsets[index]!;
    const marker = view.getUint8(pos);
    pos += 1;
    const hi = marker >> 4;
    const lo = marker & 0x0f;

    const readLength = (): number => {
      if (lo !== 0x0f) return lo;
      const m = view.getUint8(pos);
      pos += 1;
      const n = 1 << (m & 0x0f);
      const len = readUInt(view, pos, n);
      pos += n;
      return len;
    };

    switch (hi) {
      case 0x0:
        if (lo === 0x08) return { type: "boolean", value: false };
        if (lo === 0x09) return { type: "boolean", value: true };
        if (lo === 0x00) return { type: "string", value: "" }; // null
        return { type: "string", value: "" };
      case 0x1: {
        const n = 1 << lo;
        let value: number;
        if (n === 8) {
          value = Number(view.getBigInt64(pos));
        } else if (n === 16) {
          value = Number(view.getBigInt64(pos + 8));
        } else {
          value = readUInt(view, pos, n);
        }
        return { type: "integer", value };
      }
      case 0x2: {
        const n = 1 << lo;
        const value = n === 4 ? view.getFloat32(pos) : view.getFloat64(pos);
        return { type: "real", value };
      }
      case 0x3:
        return { type: "date", value: new Date(view.getFloat64(pos) * 1000 + APPLE_EPOCH) };
      case 0x4: {
        const len = readLength();
        return { type: "data", value: bytes.slice(pos, pos + len) };
      }
      case 0x5: {
        const len = readLength();
        let s = "";
        for (let i = 0; i < len; i++) s += String.fromCharCode(view.getUint8(pos + i));
        return { type: "string", value: s };
      }
      case 0x6: {
        const len = readLength();
        let s = "";
        for (let i = 0; i < len; i++) s += String.fromCharCode(view.getUint16(pos + i * 2));
        return { type: "string", value: s };
      }
      case 0x8: {
        const n = lo + 1;
        return { type: "uid", value: readUInt(view, pos, n) };
      }
      case 0xa: {
        const len = readLength();
        const node: PValue = { type: "array", value: [] };
        cache.set(index, node);
        for (let i = 0; i < len; i++) {
          node.value.push(readObject(readRef(pos + i * refSize)));
        }
        return node;
      }
      case 0xd: {
        const len = readLength();
        const entries: PDictEntry[] = [];
        const node: PValue = { type: "dict", value: entries };
        cache.set(index, node);
        for (let i = 0; i < len; i++) {
          const keyNode = readObject(readRef(pos + i * refSize));
          const valNode = readObject(readRef(pos + (len + i) * refSize));
          entries.push({
            key: keyNode.type === "string" ? keyNode.value : String(keyNode.value),
            value: valNode,
          });
        }
        return node;
      }
      default:
        throw new Error(`Unsupported binary plist marker 0x${marker.toString(16)}.`);
    }
  }

  return readObject(topObject);
}

function readUInt(view: DataView, pos: number, size: number): number {
  let n = 0;
  for (let i = 0; i < size; i++) n = n * 256 + view.getUint8(pos + i);
  return n;
}

/* ------------------------------ serializing ------------------------------ */

type Slot = { kind: "key"; key: string } | { kind: "node"; node: PValue };

export function buildBinaryPlist(root: PValue): Uint8Array {
  const slots: Slot[] = [];
  const nodeIndex = new Map<PValue, number>();
  const keyIndex = new Map<string, number>();

  const indexKey = (key: string): number => {
    const existing = keyIndex.get(key);
    if (existing !== undefined) return existing;
    const i = slots.length;
    slots.push({ kind: "key", key });
    keyIndex.set(key, i);
    return i;
  };

  const indexNode = (node: PValue): number => {
    const existing = nodeIndex.get(node);
    if (existing !== undefined) return existing;
    const i = slots.length;
    slots.push({ kind: "node", node });
    nodeIndex.set(node, i);
    if (node.type === "dict") {
      for (const e of node.value) indexKey(e.key);
      for (const e of node.value) indexNode(e.value);
    } else if (node.type === "array") {
      for (const item of node.value) indexNode(item);
    }
    return i;
  };

  const topIndex = indexNode(root);
  const count = slots.length;
  const refSize = byteWidth(count);

  const out: number[] = [];
  for (const c of "bplist00") out.push(c.charCodeAt(0));

  const offsets: number[] = new Array(count);

  const writeLen = (base: number, len: number) => {
    if (len < 15) {
      out.push(base | len);
    } else {
      out.push(base | 0x0f);
      writeIntObject(out, len);
    }
  };

  const writeRef = (index: number) => writeUInt(out, index, refSize);

  for (let i = 0; i < count; i++) {
    offsets[i] = out.length;
    const slot = slots[i]!;
    if (slot.kind === "key") {
      writeString(out, slot.key, writeLen);
      continue;
    }
    const node = slot.node;
    switch (node.type) {
      case "boolean":
        out.push(node.value ? 0x09 : 0x08);
        break;
      case "integer":
        writeIntObject(out, Math.trunc(node.value));
        break;
      case "real":
        out.push(0x23);
        pushDouble(out, node.value);
        break;
      case "date":
        out.push(0x33);
        pushDouble(out, (node.value.getTime() - APPLE_EPOCH) / 1000);
        break;
      case "data":
        writeLen(0x40, node.value.length);
        for (const b of node.value) out.push(b);
        break;
      case "string":
        writeString(out, node.value, writeLen);
        break;
      case "uid": {
        const width = byteWidth(node.value + 1);
        out.push(0x80 | (width - 1));
        writeUInt(out, node.value, width);
        break;
      }
      case "array":
        writeLen(0xa0, node.value.length);
        for (const item of node.value) writeRef(nodeIndex.get(item)!);
        break;
      case "dict":
        writeLen(0xd0, node.value.length);
        for (const e of node.value) writeRef(keyIndex.get(e.key)!);
        for (const e of node.value) writeRef(nodeIndex.get(e.value)!);
        break;
    }
  }

  const offsetTableOffset = out.length;
  const offsetSize = byteWidth(offsetTableOffset + 1);
  for (const off of offsets) writeUInt(out, off, offsetSize);

  // trailer
  for (let i = 0; i < 5; i++) out.push(0);
  out.push(0, 0); // sort version + unused
  out.push(offsetSize, refSize);
  pushUInt64(out, count);
  pushUInt64(out, topIndex);
  pushUInt64(out, offsetTableOffset);

  return Uint8Array.from(out);
}

function byteWidth(n: number) {
  if (n <= 0xff) return 1;
  if (n <= 0xffff) return 2;
  if (n <= 0xffffffff) return 4;
  return 8;
}

function writeUInt(out: number[], value: number, size: number) {
  for (let i = size - 1; i >= 0; i--) out.push(Math.floor(value / 256 ** i) % 256);
}

function pushUInt64(out: number[], value: number) {
  writeUInt(out, value, 8);
}

function pushDouble(out: number[], value: number) {
  const buf = new DataView(new ArrayBuffer(8));
  buf.setFloat64(0, value);
  for (let i = 0; i < 8; i++) out.push(buf.getUint8(i));
}

function writeIntObject(out: number[], value: number) {
  if (value >= 0 && value <= 0xff) {
    out.push(0x10);
    out.push(value);
  } else if (value >= 0 && value <= 0xffff) {
    out.push(0x11);
    writeUInt(out, value, 2);
  } else if (value >= 0 && value <= 0xffffffff) {
    out.push(0x12);
    writeUInt(out, value, 4);
  } else {
    out.push(0x13);
    const buf = new DataView(new ArrayBuffer(8));
    buf.setBigInt64(0, BigInt(Math.trunc(value)));
    for (let i = 0; i < 8; i++) out.push(buf.getUint8(i));
  }
}

function writeString(out: number[], s: string, writeLen: (base: number, len: number) => void) {
  let ascii = true;
  for (let i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) > 0x7f) {
      ascii = false;
      break;
    }
  }
  if (ascii) {
    writeLen(0x50, s.length);
    for (let i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
  } else {
    writeLen(0x60, s.length);
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      out.push(c >> 8, c & 0xff);
    }
  }
}
