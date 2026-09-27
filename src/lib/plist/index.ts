import { buildBinaryPlist, isBinaryPlist, parseBinaryPlist } from "./binary";
import { parseOpenStepPlist } from "./openstep";
import { bytesToBase64, type PlistFormat, type PValue } from "./types";
import { buildXmlPlist, parseXmlPlist } from "./xml";

export * from "./apple";
export { buildBinaryPlist, isBinaryPlist, parseBinaryPlist } from "./binary";
export * from "./mobileconfig";
export * from "./opencore";
export { parseOpenStepPlist } from "./openstep";
export * from "./types";
export { buildXmlPlist, parseXmlPlist } from "./xml";

import { unwrapSignedProfile } from "./cms";
import { buildOpenStepPlist, buildStringsFile } from "./strings";

export * from "./strings";

export interface ParsedPlist {
  value: PValue;
  format: PlistFormat;
  /** Set when the file was a signed (CMS) configuration profile. */
  signedBy?: string[];
}

/** Detect the plist flavour and parse it without losing types or key order. */
export function parsePlist(input: Uint8Array | string): ParsedPlist {
  if (typeof input !== "string") {
    const signed = unwrapSignedProfile(input);
    if (signed) return { ...parsePlist(signed.content), signedBy: signed.signers };
  }
  if (typeof input !== "string" && isBinaryPlist(input)) {
    return { value: parseBinaryPlist(input), format: "binary" };
  }
  const text = typeof input === "string" ? input : new TextDecoder().decode(input);
  const trimmed = text.replace(/^\uFEFF/, "").trimStart();
  if (!trimmed) throw new Error("The file is empty.");
  if (
    trimmed.startsWith("<?xml") ||
    trimmed.startsWith("<!DOCTYPE") ||
    trimmed.startsWith("<plist")
  ) {
    return { value: parseXmlPlist(text), format: "xml" };
  }
  if (trimmed.startsWith("{") || trimmed.startsWith("(")) {
    try {
      return { value: parseOpenStepPlist(text), format: "openstep" };
    } catch (e) {
      // A JSON file also starts with "{" — try JSON before giving up.
      try {
        return { value: fromJsonValue(JSON.parse(text)), format: "openstep" };
      } catch {
        throw e;
      }
    }
  }
  if (trimmed.startsWith("<")) return { value: parseXmlPlist(text), format: "xml" };
  return { value: parseOpenStepPlist(text), format: "openstep" };
}

/* ------------------------------ JSON bridge ------------------------------ */

export function toJsonValue(v: PValue): unknown {
  switch (v.type) {
    case "string":
      return v.value;
    case "integer":
    case "real":
    case "uid":
      return v.value;
    case "boolean":
      return v.value;
    case "date":
      return v.value.toISOString();
    case "data":
      return bytesToBase64(v.value);
    case "array":
      return v.value.map(toJsonValue);
    case "dict": {
      const out: Record<string, unknown> = Object.create(null);
      for (const e of v.value) out[e.key] = toJsonValue(e.value);
      return out;
    }
  }
}

export function toJson(v: PValue): string {
  return `${JSON.stringify(toJsonValue(v), null, 2)}\n`;
}

export function fromJsonValue(input: unknown): PValue {
  if (input === null) return { type: "string", value: "" };
  if (typeof input === "string") return { type: "string", value: input };
  if (typeof input === "boolean") return { type: "boolean", value: input };
  if (typeof input === "number")
    return Number.isInteger(input)
      ? { type: "integer", value: input }
      : { type: "real", value: input };
  if (Array.isArray(input)) return { type: "array", value: input.map(fromJsonValue) };
  if (typeof input === "object") {
    return {
      type: "dict",
      value: Object.entries(input as Record<string, unknown>).map(([key, value]) => ({
        key,
        value: fromJsonValue(value),
      })),
    };
  }
  return { type: "string", value: String(input) };
}

/* ------------------------------ serializing ------------------------------ */

export type OutputFormat = "xml" | "binary" | "json" | "openstep" | "strings";

export function serialize(value: PValue, format: OutputFormat): Uint8Array {
  if (format === "binary") return buildBinaryPlist(value);
  const text =
    format === "json"
      ? toJson(value)
      : format === "openstep"
        ? `${buildOpenStepPlist(value)}\n`
        : format === "strings"
          ? buildStringsFile(value)
          : buildXmlPlist(value);
  return new TextEncoder().encode(text);
}

/* ---------------------------- tree edit helpers --------------------------- */

export type Path = number[];

function cloneShallow(v: PValue): PValue {
  if (v.type === "array") return { type: "array", value: [...v.value] };
  if (v.type === "dict") return { type: "dict", value: v.value.map((e) => ({ ...e })) };
  return { ...v };
}

export function getAt(root: PValue, path: Path): PValue | undefined {
  let node: PValue | undefined = root;
  for (const idx of path) {
    if (!node) return undefined;
    if (node.type === "array") node = node.value[idx];
    else if (node.type === "dict") node = node.value[idx]?.value;
    else return undefined;
  }
  return node;
}

/** Immutably replace the child at `path` using `fn` on its parent container. */
function updateParent(
  root: PValue,
  path: Path,
  fn: (parent: PValue, index: number) => PValue,
): PValue {
  if (path.length === 0) return root;
  const walk = (node: PValue, depth: number): PValue => {
    const idx = path[depth]!;
    const copy = cloneShallow(node);
    if (depth === path.length - 1) return fn(copy, idx);
    if (copy.type === "array") {
      const child = copy.value[idx];
      if (!child) return copy;
      copy.value[idx] = walk(child, depth + 1);
    } else if (copy.type === "dict") {
      const entry = copy.value[idx];
      if (!entry) return copy;
      copy.value[idx] = { ...entry, value: walk(entry.value, depth + 1) };
    }
    return copy;
  };
  return walk(root, 0);
}

export function setValueAt(root: PValue, path: Path, value: PValue): PValue {
  if (path.length === 0) return value;
  return updateParent(root, path, (parent, idx) => {
    if (parent.type === "array") parent.value[idx] = value;
    else if (parent.type === "dict" && parent.value[idx])
      parent.value[idx] = { ...parent.value[idx]!, value };
    return parent;
  });
}

export function setKeyAt(root: PValue, path: Path, key: string): PValue {
  if (path.length === 0) return root;
  return updateParent(root, path, (parent, idx) => {
    if (parent.type === "dict" && parent.value[idx])
      parent.value[idx] = { ...parent.value[idx]!, key };
    return parent;
  });
}

export function removeAt(root: PValue, path: Path): PValue {
  if (path.length === 0) return root;
  return updateParent(root, path, (parent, idx) => {
    if (parent.type === "array" || parent.type === "dict") parent.value.splice(idx, 1);
    return parent;
  });
}

export function duplicateAt(root: PValue, path: Path): PValue {
  if (path.length === 0) return root;
  return updateParent(root, path, (parent, idx) => {
    if (parent.type === "array") {
      const item = parent.value[idx];
      if (item) parent.value.splice(idx + 1, 0, deepClone(item));
    } else if (parent.type === "dict") {
      const entry = parent.value[idx];
      if (entry)
        parent.value.splice(idx + 1, 0, {
          key: uniqueKey(
            parent.value.map((e) => e.key),
            entry.key,
          ),
          value: deepClone(entry.value),
        });
    }
    return parent;
  });
}

export function moveAt(root: PValue, path: Path, delta: number): PValue {
  if (path.length === 0) return root;
  return updateParent(root, path, (parent, idx) => {
    if (parent.type !== "array" && parent.type !== "dict") return parent;
    const target = idx + delta;
    if (target < 0 || target >= parent.value.length) return parent;
    const arr = parent.value as unknown[];
    const [item] = arr.splice(idx, 1);
    arr.splice(target, 0, item);
    return parent;
  });
}

/** Append a child into the container at `path` (empty path = root). */
export function appendChild(root: PValue, path: Path, key: string, value: PValue): PValue {
  const insert = (container: PValue): PValue => {
    const copy = cloneShallow(container);
    if (copy.type === "dict")
      copy.value.push({
        key: uniqueKey(
          copy.value.map((e) => e.key),
          key,
        ),
        value,
      });
    else if (copy.type === "array") copy.value.push(value);
    return copy;
  };
  if (path.length === 0) return insert(root);
  return updateParent(root, path, (parent, idx) => {
    if (parent.type === "array") {
      const child = parent.value[idx];
      if (child) parent.value[idx] = insert(child);
    } else if (parent.type === "dict") {
      const entry = parent.value[idx];
      if (entry) parent.value[idx] = { ...entry, value: insert(entry.value) };
    }
    return parent;
  });
}

export function deepClone(v: PValue): PValue {
  switch (v.type) {
    case "array":
      return { type: "array", value: v.value.map(deepClone) };
    case "dict":
      return {
        type: "dict",
        value: v.value.map((e) => ({ key: e.key, value: deepClone(e.value) })),
      };
    case "date":
      return { type: "date", value: new Date(v.value.getTime()) };
    case "data":
      return { type: "data", value: new Uint8Array(v.value) };
    default:
      return { ...v };
  }
}

function uniqueKey(existing: string[], base: string): string {
  if (!existing.includes(base)) return base;
  let n = 2;
  while (existing.includes(`${base} ${n}`)) n++;
  return `${base} ${n}`;
}

/** Depth-first search: returns the paths of nodes whose key or value matches. */
export function searchPaths(root: PValue, query: string): Set<string> {
  const q = query.trim().toLowerCase();
  const hits = new Set<string>();
  if (!q) return hits;
  const walk = (node: PValue, path: Path, key?: string) => {
    let matched = key?.toLowerCase().includes(q);
    if (!matched && node.type === "string" && node.value.toLowerCase().includes(q)) matched = true;
    if (
      !matched &&
      (node.type === "integer" || node.type === "real" || node.type === "uid") &&
      String(node.value).includes(q)
    )
      matched = true;
    if (!matched && node.type === "boolean" && String(node.value).includes(q)) matched = true;
    if (matched) hits.add(path.join("."));
    if (node.type === "array")
      node.value.forEach((c, i) => {
        walk(c, [...path, i]);
      });
    if (node.type === "dict")
      node.value.forEach((e, i) => {
        walk(e.value, [...path, i], e.key);
      });
  };
  walk(root, []);
  return hits;
}
