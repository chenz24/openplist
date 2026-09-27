// Xcode build configuration (.xcconfig) parser, serializer and validator.
// Every line is kept (comments, blank lines, includes) so a round-trip is byte-faithful
// apart from edited settings.

export type XcLine =
  | { kind: "blank"; raw: string }
  | { kind: "comment"; raw: string }
  | { kind: "include"; raw: string; path: string; optional: boolean }
  | {
      kind: "setting";
      raw: string;
      key: string;
      conditions: string;
      value: string;
      comment: string;
    }
  | { kind: "invalid"; raw: string };

export interface XcIssue {
  level: "error" | "warning";
  where: string;
  message: string;
}

const SETTING_RE = /^\s*([A-Za-z_][A-Za-z0-9_]*)((?:\[[^\]]*\])*)\s*=\s*(.*?)\s*$/;
const INCLUDE_RE = /^\s*#include(\?)?\s+"([^"]*)"\s*$/;

function splitComment(v: string): [string, string] {
  // `//` starts a comment unless it is part of a URL scheme (e.g. https://)
  const m = /(^|[^:])\/\//.exec(v);
  if (!m) return [v, ""];
  const i = m.index + (m[1] ?? "").length;
  return [v.slice(0, i).trimEnd(), v.slice(i)];
}

export function parseXcconfig(text: string): XcLine[] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  if (lines.length > 1 && lines.at(-1) === "") lines.pop();
  return lines.map((raw): XcLine => {
    const t = raw.trim();
    if (!t) return { kind: "blank", raw };
    if (t.startsWith("//")) return { kind: "comment", raw };
    if (t.startsWith("#include")) {
      const m = INCLUDE_RE.exec(raw);
      return m
        ? { kind: "include", raw, path: m[2] ?? "", optional: !!m[1] }
        : { kind: "invalid", raw };
    }
    const m = SETTING_RE.exec(raw);
    if (!m) return { kind: "invalid", raw };
    const [value, comment] = splitComment(m[3] ?? "");
    return {
      kind: "setting",
      raw,
      key: m[1] ?? "",
      conditions: m[2] ?? "",
      value: value.replace(/;\s*$/, ""),
      comment,
    };
  });
}

export function lineText(l: XcLine): string {
  if (l.kind !== "setting") return l.raw;
  return `${l.key}${l.conditions} = ${l.value}${l.comment ? ` ${l.comment}` : ""}`;
}

export function buildXcconfig(lines: XcLine[]): string {
  return `${lines.map((l) => (l.kind === "setting" && l.raw ? l.raw : lineText(l))).join("\n")}\n`;
}

/** Rebuilds a setting line after an edit (drops the cached raw text). */
export function editSetting(
  l: XcLine & { kind: "setting" },
  patch: Partial<Pick<typeof l, "key" | "conditions" | "value">>,
) {
  const next = { ...l, ...patch };
  return { ...next, raw: lineText(next) };
}

const COND_KEYS = ["sdk", "arch", "config"];
const BOOL_KEYS = new Set([
  "ENABLE_BITCODE",
  "ENABLE_TESTABILITY",
  "ONLY_ACTIVE_ARCH",
  "ENABLE_HARDENED_RUNTIME",
  "CODE_SIGNING_ALLOWED",
  "CODE_SIGNING_REQUIRED",
  "ENABLE_USER_SCRIPT_SANDBOXING",
  "GCC_TREAT_WARNINGS_AS_ERRORS",
  "SWIFT_TREAT_WARNINGS_AS_ERRORS",
  "CLANG_ENABLE_MODULES",
  "CLANG_ENABLE_OBJC_ARC",
  "ENABLE_NS_ASSERTIONS",
  "SKIP_INSTALL",
  "GENERATE_INFOPLIST_FILE",
  "DEAD_CODE_STRIPPING",
  "STRIP_INSTALLED_PRODUCT",
  "VALIDATE_PRODUCT",
  "COPY_PHASE_STRIP",
  "ENABLE_STRICT_OBJC_MSGSEND",
  "BUILD_LIBRARY_FOR_DISTRIBUTION",
  "SWIFT_EMIT_LOC_STRINGS",
]);
const VERSION_KEYS = [
  "IPHONEOS_DEPLOYMENT_TARGET",
  "MACOSX_DEPLOYMENT_TARGET",
  "TVOS_DEPLOYMENT_TARGET",
  "WATCHOS_DEPLOYMENT_TARGET",
  "XROS_DEPLOYMENT_TARGET",
  "SWIFT_VERSION",
];
const SECRET_RE = /(SECRET|PASSWORD|PASSWD|API_?KEY|PRIVATE_?KEY|ACCESS_?TOKEN|AUTH_?TOKEN)/i;

export function validateXcconfig(lines: XcLine[]): XcIssue[] {
  const issues: XcIssue[] = [];
  const seen = new Map<string, number>();
  const push = (level: XcIssue["level"], n: number, message: string) =>
    issues.push({ level, where: `line ${n + 1}`, message });

  lines.forEach((l, n) => {
    if (l.kind === "invalid") {
      push(
        "error",
        n,
        l.raw.trim().startsWith("#include")
          ? 'Malformed #include — use #include "Other.xcconfig" (or #include? for optional)'
          : "Not a valid setting — expected KEY = value, a // comment or an #include",
      );
      return;
    }
    if (l.kind === "include") {
      if (!l.path) push("error", n, "#include has an empty path");
      else if (!/\.xcconfig$/.test(l.path))
        push("warning", n, `Included file "${l.path}" does not end in .xcconfig`);
      return;
    }
    if (l.kind !== "setting") return;
    const { key, conditions, value } = l;

    for (const c of conditions.match(/\[[^\]]*\]/g) ?? []) {
      const parts = c.slice(1, -1).split(",");
      for (const p of parts) {
        const m = /^\s*(\w+)\s*=\s*([^\s]+)\s*$/.exec(p);
        if (!m)
          push(
            "error",
            n,
            `Malformed condition ${c} — expected [sdk=iphoneos*], [arch=arm64] or [config=Release]`,
          );
        else if (!COND_KEYS.includes(m[1] ?? ""))
          push("warning", n, `Unknown condition "${m[1]}" — Xcode supports sdk, arch and config`);
      }
    }

    let depth = 0;
    for (const ch of value.replace(/\$\(/g, "(")) {
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      if (depth < 0) break;
    }
    if (depth !== 0 || /\$\{[^}]*$/.test(value))
      push("error", n, `Unbalanced variable reference in ${key}`);

    const id = key + conditions.replace(/\s/g, "");
    if (seen.has(id) && !/\$\(inherited\)/.test(value))
      push(
        "warning",
        n,
        `${key}${conditions} is already set on line ${seen.get(id)! + 1}; this later value wins`,
      );
    seen.set(id, n);

    const v = value.replace(/^"(.*)"$/, "$1");
    if (BOOL_KEYS.has(key) && !/^(YES|NO|\$\(.+\))$/.test(v))
      push("error", n, `${key} must be YES or NO (got "${value}")`);
    if (VERSION_KEYS.includes(key) && !/^(\d+(\.\d+){0,2}|\$\(.+\))$/.test(v))
      push("error", n, `${key} must be a version number such as 16.0`);
    if (key === "DEVELOPMENT_TEAM" && v && !/^([A-Z0-9]{10}|\$\(.+\))$/.test(v))
      push("error", n, "DEVELOPMENT_TEAM must be a 10-character Team ID");
    if (
      key === "PRODUCT_BUNDLE_IDENTIFIER" &&
      v &&
      !/^[A-Za-z0-9.-]*$/.test(v.replace(/\$[({][^)}]*[)}]/g, ""))
    )
      push(
        "error",
        n,
        "PRODUCT_BUNDLE_IDENTIFIER may only contain letters, digits, hyphens and dots",
      );

    const release = /config=Release/i.test(conditions);
    if (key === "ENABLE_BITCODE" && v === "YES")
      push("warning", n, "Bitcode is deprecated since Xcode 14 and rejected by the App Store");
    if (key === "ENABLE_HARDENED_RUNTIME" && v === "NO")
      push("warning", n, "Hardened Runtime off — macOS apps need it for notarization");
    if (key === "CODE_SIGNING_ALLOWED" && v === "NO")
      push(
        "warning",
        n,
        "Code signing disabled — the product cannot be installed on devices or distributed",
      );
    if (key === "ENABLE_USER_SCRIPT_SANDBOXING" && v === "NO")
      push(
        "warning",
        n,
        "Build-phase scripts run unsandboxed and can read or modify anything on disk",
      );
    if (key === "SWIFT_OPTIMIZATION_LEVEL" && v === "-Onone" && release)
      push("warning", n, "Release builds with -Onone ship unoptimised code");
    if (key === "ENABLE_TESTABILITY" && v === "YES" && release)
      push(
        "warning",
        n,
        "Testability in Release exposes internal symbols and disables some optimisations",
      );
    if (key === "GCC_PREPROCESSOR_DEFINITIONS" && /\bDEBUG=1\b/.test(v) && release)
      push("warning", n, "DEBUG=1 is defined for Release builds");
    if (SECRET_RE.test(key) && v && !/^\$\(.+\)$/.test(v))
      push(
        "warning",
        n,
        `${key} looks like a secret stored in plain text — .xcconfig files are usually committed to source control`,
      );
  });
  return issues;
}

export const SAMPLE_XCCONFIG = `// Shared.xcconfig — base settings for all configurations
#include "Base.xcconfig"
#include? "Local.xcconfig"

PRODUCT_NAME = MyApp
PRODUCT_BUNDLE_IDENTIFIER = com.example.$(PRODUCT_NAME:rfc1034identifier)
DEVELOPMENT_TEAM = ABCDE12345
IPHONEOS_DEPLOYMENT_TARGET = 16.0
SWIFT_VERSION = 5.0

OTHER_LDFLAGS = $(inherited) -ObjC
SWIFT_ACTIVE_COMPILATION_CONDITIONS[config=Debug] = DEBUG
SWIFT_OPTIMIZATION_LEVEL[config=Release] = -O
ENABLE_TESTABILITY[config=Release] = YES
ENABLE_BITCODE = YES
API_BASE_URL = https://api.example.com // backend endpoint
EXCLUDED_ARCHS[sdk=iphonesimulator*] = i386
`;

export const NEW_XCCONFIG = `// New.xcconfig\n\n`;
