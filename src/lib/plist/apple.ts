import { certCommonNames } from "./cms";
import type { ProfileIssue } from "./mobileconfig";
import type { PValue } from "./types";

export type AppleKind = "entitlements" | "provision" | "opencore";

function get(d: PValue | undefined, key: string): PValue | undefined {
  return d?.type === "dict" ? d.value.find((e) => e.key === key)?.value : undefined;
}
const str = (v?: PValue) => (v?.type === "string" ? v.value : "");

export function isProvisioningProfile(doc: PValue | null): boolean {
  return (
    !!doc &&
    doc.type === "dict" &&
    !!get(doc, "Entitlements") &&
    !!get(doc, "ExpirationDate") &&
    !!get(doc, "TeamIdentifier")
  );
}

export function isEntitlements(doc: PValue | null): boolean {
  if (doc?.type !== "dict" || doc.value.length === 0) return false;
  return doc.value.every((e) =>
    /^(com\.apple\.|application-identifier|get-task-allow|keychain-access-groups|aps-environment|beta-reports-active|inter-app-audio)/.test(
      e.key,
    ),
  );
}

/* ------------------------------ entitlements ----------------------------- */

const BOOL_KEYS =
  /^(get-task-allow|beta-reports-active|com\.apple\.security\.(app-sandbox|network\.|files\.|device\.|personal-information\.|print|cs\.|get-task-allow|automation\.apple-events|inherit)|com\.apple\.developer\.(healthkit|homekit|siri|game-center|networking\.wifi-info|in-app-payments-disabled|usernotifications\.time-sensitive|kernel\.))/;
const STRING_ARRAY_KEYS = [
  "keychain-access-groups",
  "com.apple.security.application-groups",
  "com.apple.developer.associated-domains",
  "com.apple.developer.icloud-container-identifiers",
  "com.apple.developer.icloud-services",
  "com.apple.developer.ubiquity-container-identifiers",
  "com.apple.developer.in-app-payments",
  "com.apple.developer.applesignin",
];
const DOMAIN_PREFIXES = ["applinks:", "webcredentials:", "activitycontinuation:", "appclips:"];
const RISKY: Record<string, string> = {
  "com.apple.security.cs.disable-library-validation":
    "lets the app load code signed by anyone — a common code-injection vector.",
  "com.apple.security.cs.allow-unsigned-executable-memory":
    "allows unsigned executable memory, weakening the hardened runtime.",
  "com.apple.security.cs.allow-dyld-environment-variables":
    "allows DYLD_* variables, enabling library injection.",
  "com.apple.security.cs.disable-executable-page-protection":
    "disables executable page protection entirely.",
  "com.apple.security.cs.allow-jit": "allows JIT-compiled code; only needed by browsers/runtimes.",
  "com.apple.security.cs.debugger": "lets the app attach to other processes as a debugger.",
};

export function validateEntitlements(
  doc: PValue,
  where = "entitlements",
  teamIds: string[] = [],
): ProfileIssue[] {
  const issues: ProfileIssue[] = [];
  const err = (w: string, m: string) => issues.push({ level: "error", where: w, message: m });
  const warn = (w: string, m: string) => issues.push({ level: "warning", where: w, message: m });
  if (doc.type !== "dict") {
    err(where, "The top level of an entitlements file must be a dictionary.");
    return issues;
  }
  const seen = new Set<string>();
  for (const { key, value } of doc.value) {
    const w = `${where} › ${key}`;
    if (seen.has(key)) err(w, "Duplicate key — only one value will be used.");
    seen.add(key);
    if (BOOL_KEYS.test(key) && value.type !== "boolean")
      err(w, `Must be a boolean, found ${value.type}.`);
    if (STRING_ARRAY_KEYS.includes(key)) {
      if (value.type !== "array") err(w, `Must be an array of strings, found ${value.type}.`);
      else if (value.value.some((x) => x.type !== "string")) err(w, "Every item must be a string.");
    }
    if (
      key === "application-identifier" ||
      key === "com.apple.application-identifier" ||
      key === "com.apple.developer.team-identifier"
    ) {
      if (value.type !== "string") err(w, `Must be a string, found ${value.type}.`);
    }
    if (RISKY[key] && value.type === "boolean" && value.value) warn(w, `Security: ${RISKY[key]}`);
  }

  const gta = get(doc, "get-task-allow") ?? get(doc, "com.apple.security.get-task-allow");
  if (gta?.type === "boolean" && gta.value)
    warn(
      where,
      "get-task-allow is true (debug build). App Store and TestFlight uploads will be rejected.",
    );

  const aps = get(doc, "aps-environment") ?? get(doc, "com.apple.developer.aps-environment");
  if (aps) {
    if (aps.type !== "string" || !["development", "production"].includes(aps.value))
      err(`${where} › aps-environment`, 'Must be "development" or "production".');
  }

  const domains = get(doc, "com.apple.developer.associated-domains");
  if (domains?.type === "array")
    domains.value.forEach((d) => {
      if (
        d.type === "string" &&
        d.value !== "*" &&
        !DOMAIN_PREFIXES.some((p) => d.value.startsWith(p))
      )
        err(
          `${where} › associated-domains`,
          `"${d.value}" needs a service prefix such as applinks: or webcredentials:.`,
        );
      else if (d.type === "string" && /https?:\/\//.test(d.value))
        err(
          `${where} › associated-domains`,
          `"${d.value}" must be a bare domain, without http(s)://.`,
        );
    });

  const groups = get(doc, "com.apple.security.application-groups");
  if (groups?.type === "array")
    groups.value.forEach((g) => {
      if (
        g.type === "string" &&
        !g.value.startsWith("group.") &&
        !teamIds.some((t) => g.value.startsWith(`${t}.`)) &&
        !/^[A-Z0-9]{10}\./.test(g.value) &&
        !g.value.includes("$(")
      )
        warn(
          `${where} › application-groups`,
          `"${g.value}" should start with "group." (iOS) or your Team ID (macOS).`,
        );
    });

  const appId = str(
    get(doc, "application-identifier") ?? get(doc, "com.apple.application-identifier"),
  );
  if (
    appId &&
    teamIds.length &&
    !appId.includes("$(") &&
    !teamIds.some((t) => appId.startsWith(`${t}.`))
  )
    err(
      `${where} › application-identifier`,
      `"${appId}" does not start with the Team ID (${teamIds.join(", ")}).`,
    );

  const sandbox = get(doc, "com.apple.security.app-sandbox");
  const hasSandboxKeys = doc.value.some((e) =>
    /^com\.apple\.security\.(network|files|device|personal-information)\./.test(e.key),
  );
  if (hasSandboxKeys && !(sandbox?.type === "boolean" && sandbox.value))
    warn(
      where,
      "Sandbox permission keys are set but com.apple.security.app-sandbox is not true — they have no effect.",
    );
  return issues;
}

/* ------------------------- provisioning profiles ------------------------- */

export interface ProvisionSummary {
  name: string;
  appId: string;
  teamName: string;
  teamIds: string[];
  uuid: string;
  kind: "Development" | "Ad Hoc" | "App Store" | "Enterprise";
  platforms: string[];
  expires: Date | null;
  devices: number;
  certificates: { name: string }[];
}

export function summarizeProvision(doc: PValue): ProvisionSummary {
  const ent = get(doc, "Entitlements");
  const arr = (k: string) => {
    const v = get(doc, k);
    return v?.type === "array"
      ? v.value.filter((x) => x.type === "string").map((x) => (x as { value: string }).value)
      : [];
  };
  const devices = arr("ProvisionedDevices").length;
  const all = get(doc, "ProvisionsAllDevices");
  const gta = get(ent, "get-task-allow");
  const kind: ProvisionSummary["kind"] =
    all?.type === "boolean" && all.value
      ? "Enterprise"
      : devices > 0
        ? gta?.type === "boolean" && gta.value
          ? "Development"
          : "Ad Hoc"
        : "App Store";
  const exp = get(doc, "ExpirationDate");
  const certs = get(doc, "DeveloperCertificates");
  return {
    name: str(get(doc, "Name")),
    appId: str(get(ent, "application-identifier") ?? get(ent, "com.apple.application-identifier")),
    teamName: str(get(doc, "TeamName")),
    teamIds: arr("TeamIdentifier"),
    uuid: str(get(doc, "UUID")),
    kind,
    platforms: arr("Platform"),
    expires: exp?.type === "date" ? exp.value : null,
    devices,
    certificates:
      certs?.type === "array"
        ? certs.value.map((c) => ({
            name:
              c.type === "data"
                ? (certCommonNames(c.value).at(-1) ?? "Unknown certificate")
                : "Invalid entry",
          }))
        : [],
  };
}

export function validateProvision(doc: PValue): ProfileIssue[] {
  const issues: ProfileIssue[] = [];
  const err = (w: string, m: string) => issues.push({ level: "error", where: w, message: m });
  const warn = (w: string, m: string) => issues.push({ level: "warning", where: w, message: m });
  if (doc.type !== "dict") {
    err("profile", "The top level of a provisioning profile must be a dictionary.");
    return issues;
  }
  const need = (k: string, t: PValue["type"]) => {
    const v = get(doc, k);
    if (!v) err("profile", `Missing required key ${k}.`);
    else if (v.type !== t) err("profile", `${k} must be a ${t}, found ${v.type}.`);
    return v?.type === t ? v : undefined;
  };
  need("Name", "string");
  need("AppIDName", "string");
  need("TeamIdentifier", "array");
  need("ApplicationIdentifierPrefix", "array");
  const uuid = need("UUID", "string");
  if (
    uuid?.type === "string" &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid.value)
  )
    warn("profile", `UUID "${uuid.value}" is not a standard UUID.`);
  const created = need("CreationDate", "date");
  const expires = need("ExpirationDate", "date");
  need("Version", "integer");
  const certs = need("DeveloperCertificates", "array");
  const ent = need("Entitlements", "dict");

  if (expires?.type === "date") {
    const ms = expires.value.getTime() - Date.now();
    if (ms < 0)
      err(
        "profile",
        `Expired on ${expires.value.toISOString().slice(0, 10)} — builds signed with it will not install.`,
      );
    else if (ms < 30 * 864e5)
      warn(
        "profile",
        `Expires in ${Math.ceil(ms / 864e5)} days (${expires.value.toISOString().slice(0, 10)}).`,
      );
    if (created?.type === "date" && created.value > expires.value)
      err("profile", "CreationDate is after ExpirationDate.");
  }
  if (certs?.type === "array") {
    if (certs.value.length === 0)
      err("profile", "DeveloperCertificates is empty — no certificate can sign with it.");
    if (certs.value.some((c) => c.type !== "data"))
      err("profile", "Every DeveloperCertificates item must be data.");
  }
  const devices = get(doc, "ProvisionedDevices");
  const all = get(doc, "ProvisionsAllDevices");
  if (devices && devices.type !== "array") err("profile", "ProvisionedDevices must be an array.");
  if (devices?.type === "array" && all?.type === "boolean" && all.value)
    warn("profile", "Both ProvisionedDevices and ProvisionsAllDevices are set.");
  if (devices?.type === "array") {
    const seen = new Set<string>();
    devices.value.forEach((d) => {
      if (d.type !== "string") return;
      if (seen.has(d.value)) warn("profile", `Device ${d.value} is listed twice.`);
      seen.add(d.value);
    });
  }
  const teamIds = summarizeProvision(doc).teamIds;
  if (ent) issues.push(...validateEntitlements(ent, "Entitlements", teamIds));
  return issues;
}

/* --------------------------------- samples -------------------------------- */

const s = (value: string): PValue => ({ type: "string", value });
const b = (value: boolean): PValue => ({ type: "boolean", value });
const a = (...v: string[]): PValue => ({ type: "array", value: v.map(s) });

export function sampleEntitlements(): PValue {
  return {
    type: "dict",
    value: [
      { key: "application-identifier", value: s("ABCDE12345.com.example.app") },
      { key: "com.apple.developer.team-identifier", value: s("ABCDE12345") },
      { key: "aps-environment", value: s("development") },
      {
        key: "com.apple.developer.associated-domains",
        value: a("applinks:example.com", "webcredentials:example.com"),
      },
      { key: "com.apple.security.application-groups", value: a("group.com.example.app") },
      { key: "keychain-access-groups", value: a("ABCDE12345.com.example.app") },
      { key: "get-task-allow", value: b(true) },
    ],
  };
}

export function sampleProvision(): PValue {
  const now = Date.now();
  return {
    type: "dict",
    value: [
      { key: "AppIDName", value: s("Example App") },
      { key: "ApplicationIdentifierPrefix", value: a("ABCDE12345") },
      { key: "CreationDate", value: { type: "date", value: new Date(now - 30 * 864e5) } },
      { key: "Platform", value: a("iOS") },
      { key: "DeveloperCertificates", value: { type: "array", value: [] } },
      { key: "Entitlements", value: sampleEntitlements() },
      { key: "ExpirationDate", value: { type: "date", value: new Date(now + 335 * 864e5) } },
      { key: "Name", value: s("Example App Development") },
      { key: "ProvisionedDevices", value: a("00008110-001A2B3C4D5E6F70") },
      { key: "TeamIdentifier", value: a("ABCDE12345") },
      { key: "TeamName", value: s("Example Inc.") },
      { key: "TimeToLive", value: { type: "integer", value: 365 } },
      { key: "UUID", value: s("3F2504E0-4F89-41D3-9A0C-0305E82C3301") },
      { key: "Version", value: { type: "integer", value: 1 } },
    ],
  };
}
