import type { ProfileIssue } from "./mobileconfig";
import { bytesToHex } from "./opencore";
import type { PValue } from "./types";

const BARE = /^[A-Za-z0-9_$+\-./:]+$/;

function quote(s: string): string {
  if (s && BARE.test(s)) return s;
  let out = '"';
  for (const ch of s) {
    if (ch === '"') out += '\\"';
    else if (ch === "\\") out += "\\\\";
    else if (ch === "\n") out += "\\n";
    else if (ch === "\t") out += "\\t";
    else if (ch === "\r") out += "\\r";
    else out += ch;
  }
  return `${out}"`;
}

function quoteAlways(s: string): string {
  const q = quote(s);
  return q.startsWith('"') ? q : `"${q}"`;
}

/**
 * Write an OpenStep (ASCII) property list. OpenStep only knows strings, data,
 * arrays and dicts, so numbers, booleans and dates are written as strings —
 * that is inherent to the format (same as `plutil`'s old-style output).
 */
export function buildOpenStepPlist(v: PValue, indent = ""): string {
  const inner = `${indent}    `;
  switch (v.type) {
    case "dict":
      if (!v.value.length) return "{ }";
      return (
        "{\n" +
        v.value
          .map((e) => `${inner}${quote(e.key)} = ${buildOpenStepPlist(e.value, inner)};\n`)
          .join("") +
        indent +
        "}"
      );
    case "array":
      if (!v.value.length) return "( )";
      return (
        "(\n" +
        v.value.map((x) => inner + buildOpenStepPlist(x, inner)).join(",\n") +
        "\n" +
        indent +
        ")"
      );
    case "data":
      return `<${bytesToHex(v.value).toLowerCase()}>`;
    case "string":
      return quote(v.value);
    case "boolean":
      return v.value ? "YES" : "NO";
    case "date":
      return quote(v.value.toISOString());
    default:
      return quote(String(v.value));
  }
}

/** True when the root is a flat dict of strings — i.e. representable as .strings. */
export function isStringsTable(v: PValue | null): boolean {
  return !!v && v.type === "dict" && v.value.every((e) => e.value.type === "string");
}

/** Write a `.strings` localization table: `"key" = "value";` per line, order kept. */
export function buildStringsFile(v: PValue): string {
  if (v.type !== "dict") throw new Error(".strings files must be a dictionary of strings.");
  return `${v.value
    .map((e) => {
      if (e.value.type !== "string")
        throw new Error(`"${e.key}" is not a string — .strings only holds strings.`);
      return `${quoteAlways(e.key)} = ${quoteAlways(e.value.value)};`;
    })
    .join("\n")}\n`;
}

/* ------------------------------ .strings checks ----------------------------- */

const FMT = /%#@([A-Za-z0-9_]+)@/g;

export function validateStrings(doc: PValue): ProfileIssue[] {
  const out: ProfileIssue[] = [];
  if (doc.type !== "dict")
    return [{ level: "error", where: "root", message: "A .strings file must be a dictionary." }];
  const seen = new Set<string>();
  for (const e of doc.value) {
    if (seen.has(e.key))
      out.push({
        level: "warning",
        where: e.key,
        message: "Duplicate key — the later value silently wins.",
      });
    seen.add(e.key);
    if (e.value.type !== "string")
      out.push({
        level: "error",
        where: e.key,
        message: `Value is ${e.value.type}; .strings only holds strings.`,
      });
    else if (!e.value.value.trim())
      out.push({ level: "warning", where: e.key, message: "Empty translation." });
  }
  return out;
}

export function isStringsdict(doc: PValue | null): boolean {
  if (doc?.type !== "dict" || !doc.value.length) return false;
  return doc.value.every(
    (e) =>
      e.value.type === "dict" && e.value.value.some((x) => x.key === "NSStringLocalizedFormatKey"),
  );
}

const PLURAL = ["zero", "one", "two", "few", "many", "other"];

export function validateStringsdict(doc: PValue): ProfileIssue[] {
  const out: ProfileIssue[] = [];
  if (doc.type !== "dict")
    return [
      { level: "error", where: "root", message: "A .stringsdict root must be a dictionary." },
    ];
  for (const entry of doc.value) {
    const where = entry.key;
    if (entry.value.type !== "dict") {
      out.push({ level: "error", where, message: "Each entry must be a dictionary." });
      continue;
    }
    const d = entry.value.value;
    const fmt = d.find((x) => x.key === "NSStringLocalizedFormatKey");
    if (fmt?.value.type !== "string") {
      out.push({ level: "error", where, message: "Missing NSStringLocalizedFormatKey string." });
      continue;
    }
    const vars = [...fmt.value.value.matchAll(FMT)].map((m) => m[1]).filter(Boolean) as string[];
    if (!vars.length)
      out.push({
        level: "warning",
        where,
        message: "NSStringLocalizedFormatKey has no %#@variable@ reference.",
      });
    for (const name of vars) {
      const rule = d.find((x) => x.key === name);
      const w = `${where} › ${name}`;
      if (!rule) {
        out.push({
          level: "error",
          where: w,
          message: `Variable "${name}" is referenced but not defined.`,
        });
        continue;
      }
      if (rule.value.type !== "dict") {
        out.push({
          level: "error",
          where: w,
          message: "Variable definition must be a dictionary.",
        });
        continue;
      }
      const r = rule.value.value;
      const get = (k: string) => r.find((x) => x.key === k)?.value;
      const spec = get("NSStringFormatSpecTypeKey");
      if (spec?.type !== "string" || spec.value !== "NSStringPluralRuleType")
        out.push({
          level: "error",
          where: w,
          message: "NSStringFormatSpecTypeKey must be NSStringPluralRuleType.",
        });
      const vt = get("NSStringFormatValueTypeKey");
      if (vt?.type !== "string" || !vt.value)
        out.push({
          level: "error",
          where: w,
          message: "Missing NSStringFormatValueTypeKey (e.g. d, ld, lu).",
        });
      if (!get("other"))
        out.push({ level: "error", where: w, message: 'Missing required "other" plural form.' });
      for (const x of r) {
        if (x.key.startsWith("NSString")) continue;
        if (!PLURAL.includes(x.key))
          out.push({
            level: "warning",
            where: `${w} › ${x.key}`,
            message: `Unknown plural category (expected ${PLURAL.join(", ")}).`,
          });
        else if (x.value.type !== "string")
          out.push({
            level: "error",
            where: `${w} › ${x.key}`,
            message: "Plural form must be a string.",
          });
      }
    }
  }
  return out;
}

/** Starter Localizable.strings table. */
export const sampleStrings = (): PValue => {
  const s = (value: string): PValue => ({ type: "string", value });
  return {
    type: "dict",
    value: [
      { key: "welcome_title", value: s("Welcome back, %@!") },
      { key: "settings_logout", value: s("Log Out") },
      { key: "settings_delete_account", value: s("Delete Account") },
      {
        key: "error_network",
        value: s("Couldn't reach the server. Check your connection and try again."),
      },
      { key: "onboarding_continue", value: s("Continue") },
    ],
  };
};

export const sampleStringsdict = (): PValue => {
  const s = (value: string): PValue => ({ type: "string", value });
  return {
    type: "dict",
    value: [
      {
        key: "%d files",
        value: {
          type: "dict",
          value: [
            { key: "NSStringLocalizedFormatKey", value: s("%#@files@") },
            {
              key: "files",
              value: {
                type: "dict",
                value: [
                  { key: "NSStringFormatSpecTypeKey", value: s("NSStringPluralRuleType") },
                  { key: "NSStringFormatValueTypeKey", value: s("d") },
                  { key: "zero", value: s("No files") },
                  { key: "one", value: s("%d file") },
                  { key: "other", value: s("%d files") },
                ],
              },
            },
          ],
        },
      },
    ],
  };
};
