import type { PValue } from "./types";

export type IssueLevel = "error" | "warning";
export interface ProfileIssue {
  level: IssueLevel;
  where: string;
  message: string;
}

const UUID_RE = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;
const SCOPES = ["System", "User"];

function get(d: PValue, key: string): PValue | undefined {
  return d.type === "dict" ? d.value.find((e) => e.key === key)?.value : undefined;
}

export function isConfigurationProfile(doc: PValue | null): boolean {
  if (doc?.type !== "dict") return false;
  const t = get(doc, "PayloadType");
  return (
    (t?.type === "string" && t.value === "Configuration") ||
    (!!get(doc, "PayloadContent") && !!get(doc, "PayloadUUID"))
  );
}

export function validateProfile(doc: PValue): ProfileIssue[] {
  const issues: ProfileIssue[] = [];
  const uuids = new Map<string, string>();
  const ids = new Map<string, string>();
  const err = (where: string, message: string) => issues.push({ level: "error", where, message });
  const warn = (where: string, message: string) =>
    issues.push({ level: "warning", where, message });

  if (doc.type !== "dict") {
    err("root", "The top level of a configuration profile must be a dictionary.");
    return issues;
  }

  const checkCommon = (d: PValue, where: string, top: boolean) => {
    const need = (key: string, type: PValue["type"]) => {
      const v = get(d, key);
      if (!v) err(where, `Missing required key ${key}.`);
      else if (v.type !== type) err(where, `${key} must be a ${type}, found ${v.type}.`);
      return v && v.type === type ? v : undefined;
    };
    const type = need("PayloadType", "string");
    if (top && type && type.type === "string" && type.value !== "Configuration")
      err(where, `Top-level PayloadType must be "Configuration", found "${type.value}".`);
    const id = need("PayloadIdentifier", "string");
    if (id?.type === "string") {
      if (!id.value.trim()) err(where, "PayloadIdentifier is empty.");
      else if (ids.has(id.value))
        err(where, `PayloadIdentifier "${id.value}" is also used by ${ids.get(id.value)}.`);
      else ids.set(id.value, where);
      if (/\s/.test(id.value))
        warn(where, "PayloadIdentifier should not contain spaces (reverse-DNS style is expected).");
    }
    const uuid = need("PayloadUUID", "string");
    if (uuid?.type === "string") {
      if (!UUID_RE.test(uuid.value))
        warn(where, `PayloadUUID "${uuid.value}" is not a standard UUID.`);
      if (uuids.has(uuid.value.toUpperCase()))
        err(where, `PayloadUUID duplicates the one in ${uuids.get(uuid.value.toUpperCase())}.`);
      else uuids.set(uuid.value.toUpperCase(), where);
    }
    const ver = need("PayloadVersion", "integer");
    if (ver?.type === "integer" && ver.value !== 1)
      warn(where, `PayloadVersion is usually 1, found ${ver.value}.`);
    const dn = get(d, "PayloadDisplayName");
    if (dn && dn.type !== "string") err(where, "PayloadDisplayName must be a string.");
    else if (!dn && top)
      warn(where, "No PayloadDisplayName — the profile will show a generic name in Settings.");
  };

  checkCommon(doc, "profile", true);

  const scope = get(doc, "PayloadScope");
  if (scope && (scope.type !== "string" || !SCOPES.includes(scope.value)))
    err("profile", 'PayloadScope must be "System" or "User".');
  const rd = get(doc, "PayloadRemovalDisallowed");
  if (rd && rd.type !== "boolean") err("profile", "PayloadRemovalDisallowed must be a boolean.");
  const exp = get(doc, "PayloadExpirationDate");
  if (exp && exp.type !== "date") err("profile", "PayloadExpirationDate must be a date.");
  else if (exp?.type === "date" && new Date(exp.value).getTime() < Date.now())
    warn("profile", "PayloadExpirationDate is in the past — the profile is already expired.");

  const content = get(doc, "PayloadContent");
  if (!content) {
    err("profile", "Missing PayloadContent (the list of payloads).");
  } else if (content.type !== "array") {
    err("profile", `PayloadContent must be an array, found ${content.type}.`);
  } else {
    if (content.value.length === 0)
      warn("profile", "PayloadContent is empty — the profile installs nothing.");
    content.value.forEach((p, i) => {
      const t = get(p, "PayloadType");
      const where = `payload ${i + 1}${t?.type === "string" ? ` (${t.value})` : ""}`;
      if (p.type !== "dict") {
        err(where, "Each payload must be a dictionary.");
        return;
      }
      checkCommon(p, where, false);
    });
  }
  return issues;
}

export interface PayloadSummary {
  type: string;
  name: string;
  identifier: string;
}

export function summarizePayloads(doc: PValue): PayloadSummary[] {
  const c = get(doc, "PayloadContent");
  if (c?.type !== "array") return [];
  const s = (d: PValue, k: string) => {
    const v = get(d, k);
    return v?.type === "string" ? v.value : "";
  };
  return c.value.map((p) => ({
    type: s(p, "PayloadType"),
    name: s(p, "PayloadDisplayName"),
    identifier: s(p, "PayloadIdentifier"),
  }));
}

const uuid = () =>
  (globalThis.crypto?.randomUUID?.() ?? "00000000-0000-4000-8000-000000000000").toUpperCase();

export function newProfile(): PValue {
  const s = (value: string): PValue => ({ type: "string", value });
  return {
    type: "dict",
    value: [
      {
        key: "PayloadContent",
        value: {
          type: "array",
          value: [
            {
              type: "dict",
              value: [
                { key: "PayloadDisplayName", value: s("Wi-Fi") },
                { key: "PayloadIdentifier", value: s("com.example.profile.wifi") },
                { key: "PayloadType", value: s("com.apple.wifi.managed") },
                { key: "PayloadUUID", value: s(uuid()) },
                { key: "PayloadVersion", value: { type: "integer", value: 1 } },
                { key: "SSID_STR", value: s("Office") },
                { key: "EncryptionType", value: s("WPA2") },
                { key: "AutoJoin", value: { type: "boolean", value: true } },
              ],
            },
          ],
        },
      },
      { key: "PayloadDisplayName", value: s("Example Profile") },
      { key: "PayloadIdentifier", value: s("com.example.profile") },
      { key: "PayloadRemovalDisallowed", value: { type: "boolean", value: false } },
      { key: "PayloadType", value: s("Configuration") },
      { key: "PayloadUUID", value: s(uuid()) },
      { key: "PayloadVersion", value: { type: "integer", value: 1 } },
    ],
  };
}

const SENSITIVE = /pass(word)?|secret|psk|token|privatekey|sharedsecret|pin$|credential/i;

/** Copy with credential-like strings and binary blobs replaced, safe to send off-device. */
export function redactProfile(v: PValue, key = ""): PValue {
  switch (v.type) {
    case "dict":
      return {
        type: "dict",
        value: v.value.map((e) => ({ key: e.key, value: redactProfile(e.value, e.key) })),
      };
    case "array":
      return { type: "array", value: v.value.map((x) => redactProfile(x, key)) };
    case "string":
      return SENSITIVE.test(key) && v.value ? { type: "string", value: "[REDACTED]" } : v;
    case "data":
      return { type: "string", value: `[REDACTED data, ${v.value.length} bytes]` };
    default:
      return v;
  }
}
