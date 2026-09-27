import { getLocalizedPage } from "../content/localized";
import { trustPages } from "../content/trust";
import { LOCALES, type Locale, localizedPath } from "./locales";
/** Production identity: never derive canonical URLs from an untrusted request host. */
export const SITE_URL = "https://openplist.com";
export const SITE_NAME = "openplist.com";
export const SOCIAL_IMAGE = `${SITE_URL}/og.png`;

/** The indexable pages; shared by route metadata and the sitemap. */
export const PAGES = {
  "/about": trustPages.en["/about"],
  "/privacy": trustPages.en["/privacy"],
  "/binary-plist-editor": {
    title: "Binary Plist Editor — Edit bplist00 Files Online Free",
    description:
      "Edit binary property list (bplist00) files online. Open, change keys and values in a tree, and save back as binary or XML plist. No Xcode, no command line, no upload.",
  },
  "/binary-plist-to-xml": {
    title: "Binary Plist to XML — Free Online bplist00 Converter",
    description:
      "Convert binary plist (bplist00) files to readable XML online. A browser-based alternative to plutil -convert xml1 — instant, free, and your file never leaves your device.",
  },
  "/binary-plist-viewer": {
    title: "Binary Plist Viewer — Open bplist00 Files Online",
    description:
      "View binary property list (bplist00) files online without a Mac. This free binary plist viewer renders bplist00 as a readable key / value tree in your browser — no plutil, no upload.",
  },
  "/entitlements-editor": {
    title: "Entitlements Editor — Edit & Validate .entitlements Online",
    description:
      "Open, edit and validate Xcode .entitlements files in your browser. Catches wrong types, bad associated domains, get-task-allow in release builds and risky hardened-runtime exceptions.",
  },
  "/how-to-open-plist-on-windows": {
    title: "How to open a .plist file on Windows (including binary plists)",
    description:
      "Windows has no built-in plist support. Here is how to open, read and edit XML and binary .plist files on Windows — including binary bplist00 files — without installing anything.",
  },
  "/": {
    title: "Plist Viewer & Editor — Open, Edit & Convert .plist Online",
    description:
      "Free online plist viewer and editor. Open XML, binary (bplist00) and OpenStep property lists, edit keys and values, and convert to XML, binary or JSON — all in your browser, nothing uploaded.",
  },
  "/json-to-plist": {
    title: "JSON to Plist Converter — Create XML or Binary Plists",
    description:
      "Turn JSON into a valid Apple property list online. Export as XML or binary plist (bplist00), with full control over each value's type before you download. Free, no upload.",
  },
  "/mobileconfig-editor": {
    title: "Mobileconfig Viewer & Editor — Validate .mobileconfig Online",
    description:
      "View, edit and validate Apple configuration profiles (.mobileconfig) in your browser, including signed profiles. Check PayloadUUID, identifiers and required keys, then download.",
  },
  "/mobileprovision-viewer": {
    title: "Mobileprovision Viewer — Inspect Provisioning Profiles Online",
    description:
      "Open .mobileprovision and .provisionprofile files in your browser. See expiry, team, App ID, devices, certificates and entitlements, catch problems, and extract the entitlements.",
  },
  "/opencore-config-editor": {
    title: "OpenCore config.plist Editor & Validator — Online, No Upload",
    description:
      "View, edit and validate your OpenCore config.plist in the browser. Drag & drop, checks kext order, patches, SMBIOS, SIP and security settings, with a built-in Base64 ⇄ Hex converter. Works on Windows, Linux and macOS.",
  },
  "/plist-editor": {
    title: "Plist Editor Online — Edit .plist Files Without Xcode",
    description:
      "Free online plist editor for XML and binary property lists. Edit keys, values and types in an Xcode-style tree, then save as XML or binary plist. Key order and value types preserved.",
  },
  "/plist-to-json": {
    title: "Plist to JSON Converter — XML & Binary Plist to JSON",
    description:
      "Convert XML, binary (bplist00) and OpenStep plist files to clean JSON online. Free, fast and private — your property list is converted entirely in your browser.",
  },
  "/plist-to-xml": {
    title: "Plist to XML Converter — Binary & OpenStep to XML",
    description:
      "Convert any Apple property list — binary bplist00 or OpenStep — to clean, indented XML plist format online. Types and key order preserved; nothing is uploaded.",
  },
  "/plist-viewer": {
    title: "Plist Viewer — Open & View .plist Files Online Free",
    description:
      "View XML, binary (bplist00) and OpenStep .plist files as a clean key / type / value tree. Free online plist viewer that runs entirely in your browser — no Xcode, no upload.",
  },
  "/strings-editor": {
    title: ".strings Editor — Edit & Validate Localizable.strings Online",
    description:
      "Open, edit and validate iOS/macOS .strings localization files in your browser. Catches non-string values, duplicate keys and broken placeholders, then downloads a clean file with key order preserved.",
  },
  "/stringsdict-editor": {
    title: ".stringsdict Editor — Edit iOS Plural Rules Online",
    description:
      "Open, edit and validate .stringsdict plural-rule files in your browser. Checks NSStringLocalizedFormatKey, plural categories and format specs, with key order and types preserved.",
  },
  "/what-is-a-plist-file": {
    title: "What is a .plist file? XML vs binary property lists explained",
    description:
      "A plain-English explanation of Apple property list files: what they store, the difference between XML, binary and OpenStep formats, and how to open one.",
  },
  "/xcconfig-editor": {
    title: "xcconfig Editor — View, Edit & Validate Xcode Build Settings Online",
    description:
      "Open, edit and validate Xcode .xcconfig build configuration files in your browser. Checks syntax, conditions, #include, YES/NO values, deployment targets, Team IDs and risky settings. Nothing is uploaded.",
  },
  "/xml-to-plist": {
    title: "XML to Plist Converter — Validate & Export Binary Plist",
    description:
      "Convert XML property list markup to a valid plist online. Validate the syntax, browse it as a tree, and export as binary plist (bplist00) or JSON — free, in your browser.",
  },
  "/xml-vs-binary-plist": {
    title: "XML vs binary plist: differences, and how to convert between them",
    description:
      "Apple property lists come as readable XML (xml1) or compact binary (binary1 / bplist00). Learn how they differ, which one your file is, and convert between them in your browser.",
  },
} as const;

export type PagePath = keyof typeof PAGES;
export const PAGE_PATHS = Object.keys(PAGES) as PagePath[];
export const GUIDE_PATHS: readonly PagePath[] = [
  "/how-to-open-plist-on-windows",
  "/what-is-a-plist-file",
  "/xml-vs-binary-plist",
];
export const INFORMATION_PATHS: readonly PagePath[] = [...GUIDE_PATHS, "/about", "/privacy"];

export const INDEXABLE_PAGES = LOCALES.flatMap((locale) =>
  PAGE_PATHS.map((path) => ({ locale, path, pathname: localizedPath(path, locale) })),
);
export const INDEXABLE_PATHS = INDEXABLE_PAGES.map(({ pathname }) => pathname);
export function getPageMeta(path: PagePath, locale: Locale = "en") {
  return getLocalizedPage(path, locale) ?? PAGES[path];
}
export function canonicalUrl(path: PagePath, locale: Locale = "en"): string {
  return `${SITE_URL}${localizedPath(path, locale)}`;
}
