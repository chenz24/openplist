/**
 * A type-preserving, order-preserving property list model.
 *
 * We deliberately do NOT round-trip through plain JS objects: doing so loses
 * dictionary key order (numeric-looking keys get reordered) and collapses
 * integer/real into a single `number` type. Both matter for git diffs and for
 * Apple tooling, so every node carries an explicit type tag.
 */

export type PlistFormat = "xml" | "binary" | "openstep";

export interface PDictEntry {
  key: string;
  value: PValue;
}

export type PValue =
  | { type: "string"; value: string }
  | { type: "integer"; value: number }
  | { type: "real"; value: number }
  | { type: "boolean"; value: boolean }
  | { type: "date"; value: Date }
  | { type: "data"; value: Uint8Array }
  | { type: "array"; value: PValue[] }
  | { type: "dict"; value: PDictEntry[] }
  | { type: "uid"; value: number };

export type PType = PValue["type"];

export const P_TYPES: PType[] = [
  "string",
  "integer",
  "real",
  "boolean",
  "date",
  "data",
  "array",
  "dict",
  "uid",
];

export const isContainer = (v: PValue): v is Extract<PValue, { type: "array" | "dict" }> =>
  v.type === "array" || v.type === "dict";

export function emptyOf(type: PType): PValue {
  switch (type) {
    case "string":
      return { type: "string", value: "" };
    case "integer":
      return { type: "integer", value: 0 };
    case "real":
      return { type: "real", value: 0 };
    case "boolean":
      return { type: "boolean", value: false };
    case "date":
      return { type: "date", value: new Date() };
    case "data":
      return { type: "data", value: new Uint8Array() };
    case "array":
      return { type: "array", value: [] };
    case "dict":
      return { type: "dict", value: [] };
    case "uid":
      return { type: "uid", value: 0 };
  }
}

/** Best-effort conversion when the user switches a node's type in the editor. */
export function coerce(value: PValue, type: PType): PValue {
  if (value.type === type) return value;
  const asText = displayValue(value);
  switch (type) {
    case "string":
      return { type: "string", value: asText };
    case "integer": {
      const n = Number(asText);
      return { type: "integer", value: Number.isFinite(n) ? Math.trunc(n) : 0 };
    }
    case "real": {
      const n = Number(asText);
      return { type: "real", value: Number.isFinite(n) ? n : 0 };
    }
    case "boolean":
      return {
        type: "boolean",
        value: asText === "true" || asText === "1" || asText === "YES",
      };
    case "date": {
      const d = new Date(asText);
      return { type: "date", value: Number.isNaN(d.getTime()) ? new Date() : d };
    }
    default:
      return emptyOf(type);
  }
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return typeof btoa === "function" ? btoa(bin) : Buffer.from(bytes).toString("base64");
}

export function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/\s+/g, "");
  const bin =
    typeof atob === "function" ? atob(clean) : Buffer.from(clean, "base64").toString("binary");
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Scalar value rendered as editable text. Containers return a summary. */
export function displayValue(v: PValue): string {
  switch (v.type) {
    case "string":
      return v.value;
    case "integer":
      return String(v.value);
    case "real":
      return Number.isInteger(v.value) ? v.value.toFixed(1) : String(v.value);
    case "boolean":
      return v.value ? "true" : "false";
    case "date":
      return v.value.toISOString();
    case "data":
      return bytesToBase64(v.value);
    case "uid":
      return String(v.value);
    case "array":
      return `${v.value.length} ${v.value.length === 1 ? "item" : "items"}`;
    case "dict":
      return `${v.value.length} ${v.value.length === 1 ? "key" : "keys"}`;
  }
}

/** Parse edited text back into the node's existing type. */
export function parseScalar(type: PType, text: string, previous: PValue): PValue {
  switch (type) {
    case "string":
      return { type: "string", value: text };
    case "integer": {
      const n = Number(text);
      return { type: "integer", value: Number.isFinite(n) ? Math.trunc(n) : 0 };
    }
    case "real": {
      const n = Number(text);
      return { type: "real", value: Number.isFinite(n) ? n : 0 };
    }
    case "boolean":
      return { type: "boolean", value: text === "true" };
    case "date": {
      const d = new Date(text);
      return Number.isNaN(d.getTime()) ? previous : { type: "date", value: d };
    }
    case "data":
      try {
        const hex = /^\s*(?:0x([0-9a-f\s]*)|<([0-9a-f\s]*)>)\s*$/i.exec(text);
        if (hex) {
          const h = (hex[1] ?? hex[2] ?? "").replace(/\s/g, "");
          if (h.length % 2) return previous;
          return {
            type: "data",
            value: Uint8Array.from(h.match(/../g) ?? [], (x) => parseInt(x, 16)),
          };
        }
        return { type: "data", value: base64ToBytes(text) };
      } catch {
        return previous;
      }
    case "uid": {
      const n = Number(text);
      return { type: "uid", value: Number.isFinite(n) ? Math.trunc(n) : 0 };
    }
    default:
      return previous;
  }
}
