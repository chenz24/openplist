import { getErrorLocation } from "../source-location";
import { base64ToBytes, bytesToBase64, type PDictEntry, type PValue } from "./types";

const HEADER = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">`;

export function parseXmlPlist(text: string): PValue {
  if (typeof DOMParser === "undefined") {
    throw new Error("XML plist parsing is only available in the browser.");
  }
  const doc = new DOMParser().parseFromString(text, "application/xml");
  const err = doc.getElementsByTagName("parsererror")[0];
  if (err) {
    throw Object.assign(new Error("This file is not valid XML."), {
      sourceLocation: getErrorLocation(err.textContent ?? "", text),
    });
  }
  const root = doc.documentElement;
  const top = root.nodeName === "plist" ? firstElement(root) : root.nodeName ? root : null;
  if (!top) throw new Error("The plist is empty — no root value found.");
  return readElement(top);
}

function firstElement(el: Element): Element | null {
  for (let i = 0; i < el.childNodes.length; i++) {
    const n = el.childNodes[i]!;
    if (n.nodeType === 1) return n as Element;
  }
  return null;
}

function childElements(el: Element): Element[] {
  const out: Element[] = [];
  for (let i = 0; i < el.childNodes.length; i++) {
    const n = el.childNodes[i]!;
    if (n.nodeType === 1) out.push(n as Element);
  }
  return out;
}

function readElement(el: Element): PValue {
  const tag = el.nodeName.toLowerCase();
  const text = el.textContent ?? "";
  switch (tag) {
    case "string":
      return { type: "string", value: text };
    case "integer":
      return { type: "integer", value: Math.trunc(Number(text.trim())) || 0 };
    case "real":
      return { type: "real", value: Number(text.trim()) || 0 };
    case "true":
      return { type: "boolean", value: true };
    case "false":
      return { type: "boolean", value: false };
    case "date": {
      const d = new Date(text.trim());
      return { type: "date", value: Number.isNaN(d.getTime()) ? new Date(0) : d };
    }
    case "data":
      return { type: "data", value: base64ToBytes(text) };
    case "array":
      return { type: "array", value: childElements(el).map(readElement) };
    case "dict": {
      const entries: PDictEntry[] = [];
      const kids = childElements(el);
      for (let i = 0; i < kids.length; i++) {
        const k = kids[i]!;
        if (k.nodeName.toLowerCase() !== "key") continue;
        const v = kids[i + 1];
        if (!v) break;
        entries.push({ key: k.textContent ?? "", value: readElement(v) });
        i++;
      }
      return { type: "dict", value: entries };
    }
    default:
      return { type: "string", value: text };
  }
}

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function isoDate(d: Date) {
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function realText(n: number) {
  if (!Number.isFinite(n)) return String(n);
  return Number.isInteger(n) ? n.toFixed(1) : String(n);
}

function writeValue(v: PValue, indent: string, lines: string[]) {
  switch (v.type) {
    case "string":
      lines.push(`${indent}<string>${escapeXml(v.value)}</string>`);
      break;
    case "integer":
      lines.push(`${indent}<integer>${Math.trunc(v.value)}</integer>`);
      break;
    case "real":
      lines.push(`${indent}<real>${realText(v.value)}</real>`);
      break;
    case "boolean":
      lines.push(`${indent}${v.value ? "<true/>" : "<false/>"}`);
      break;
    case "date":
      lines.push(`${indent}<date>${isoDate(v.value)}</date>`);
      break;
    case "data": {
      const b64 = bytesToBase64(v.value);
      if (!b64) {
        lines.push(`${indent}<data></data>`);
        break;
      }
      lines.push(`${indent}<data>`);
      for (let i = 0; i < b64.length; i += 60) lines.push(`${indent}${b64.slice(i, i + 60)}`);
      lines.push(`${indent}</data>`);
      break;
    }
    case "uid":
      lines.push(`${indent}<dict>`);
      lines.push(`${indent}\t<key>CF$UID</key>`);
      lines.push(`${indent}\t<integer>${v.value}</integer>`);
      lines.push(`${indent}</dict>`);
      break;
    case "array":
      if (v.value.length === 0) {
        lines.push(`${indent}<array/>`);
        break;
      }
      lines.push(`${indent}<array>`);
      for (const item of v.value) writeValue(item, `${indent}\t`, lines);
      lines.push(`${indent}</array>`);
      break;
    case "dict":
      if (v.value.length === 0) {
        lines.push(`${indent}<dict/>`);
        break;
      }
      lines.push(`${indent}<dict>`);
      for (const e of v.value) {
        lines.push(`${indent}\t<key>${escapeXml(e.key)}</key>`);
        writeValue(e.value, `${indent}\t`, lines);
      }
      lines.push(`${indent}</dict>`);
      break;
  }
}

export function buildXmlPlist(value: PValue): string {
  const lines: string[] = [HEADER];
  writeValue(value, "", lines);
  lines.push("</plist>", "");
  return lines.join("\n");
}
