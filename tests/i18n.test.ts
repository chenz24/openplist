import { readdir, readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";
import { getLocalizedPage } from "../src/content/localized";
import { HTML_LANG, LOCALES, localizedPath, splitLocalePath } from "../src/lib/locales";
import { pageHead } from "../src/lib/seo";
import { canonicalUrl, getPageMeta, INDEXABLE_PATHS, PAGE_PATHS } from "../src/lib/site";

const params = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
describe("multilingual pages", () => {
  test("every message is translated with matching placeholders", async () => {
    const catalogs = await Promise.all(
      LOCALES.map(
        async (locale) =>
          JSON.parse(await readFile(`messages/${locale}.json`, "utf8")) as Record<string, string>,
      ),
    );
    const base = catalogs[0];
    if (!base) throw new Error("Missing English catalog");
    for (const catalog of catalogs) {
      expect(Object.keys(catalog).sort()).toEqual(Object.keys(base).sort());
      for (const [key, value] of Object.entries(base)) {
        expect(catalog[key]?.trim().length).toBeGreaterThan(0);
        expect(params(catalog[key] ?? "")).toEqual(params(value));
      }
    }
    const settings = JSON.parse(await readFile("project.inlang/settings.json", "utf8"));
    expect(settings.locales).toEqual([...LOCALES]);
  });
  test("locale prefixes respect path boundaries and normalize the English base", () => {
    expect(splitLocalePath("/zh/plist-editor")).toEqual({ locale: "zh", path: "/plist-editor" });
    expect(splitLocalePath("/ja/")).toEqual({ locale: "ja", path: "/" });
    expect(splitLocalePath("/zhongwen")).toEqual({ locale: "en", path: "/zhongwen" });
    expect(localizedPath("/zh/plist-editor", "ja")).toBe("/ja/plist-editor");
    expect(localizedPath("/en/", "en")).toBe("/");
  });
  test("all page routes have localized counterparts and substantial content", async () => {
    const routes = (await readdir("src/routes/$locale"))
      .filter((p) => p.endsWith(".tsx"))
      .map((p) => (p === "index.tsx" ? "/" : `/${p.slice(0, -4)}`));
    expect(routes.sort()).toEqual([...PAGE_PATHS].sort());
    expect(new Set(INDEXABLE_PATHS).size).toBe(PAGE_PATHS.length * LOCALES.length);
    for (const locale of ["zh", "ja"] as const) {
      for (const path of PAGE_PATHS) {
        const page = getLocalizedPage(path, locale);
        if (!page) throw new Error(`Missing ${locale}:${path}`);
        expect(page.h1.length).toBeGreaterThan(3);
        expect(page.sections.length).toBeGreaterThanOrEqual(2);
        expect(page.faq.length).toBeGreaterThanOrEqual(2);
        expect(page.description).not.toBe(getPageMeta(path, "en").description);
      }
    }
  });
  test("each language has its own canonical, metadata and reciprocal alternatives", () => {
    for (const path of PAGE_PATHS)
      for (const locale of LOCALES) {
        const head = pageHead(path, locale);
        expect(head.links.filter((link) => link.rel === "canonical")).toEqual([
          { rel: "canonical", href: canonicalUrl(path, locale) },
        ]);
        for (const language of LOCALES)
          expect(head.links).toContainEqual({
            rel: "alternate",
            hrefLang: HTML_LANG[language],
            href: canonicalUrl(path, language),
          });
        expect(head.links).toContainEqual({
          rel: "alternate",
          hrefLang: "x-default",
          href: canonicalUrl(path),
        });
        const graph = JSON.parse(head.scripts[0]?.children ?? "")["@graph"] as Record<
          string,
          unknown
        >[];
        expect(graph.find((node) => node["@type"] === "WebPage")?.["inLanguage"]).toBe(
          HTML_LANG[locale],
        );
      }
  });
});

// The parsers remain language-neutral. Translate only diagnostics, never user values.
test("diagnostic translations preserve interpolated technical values", async () => {
  const { localizeDiagnostic } = await import("../src/lib/diagnostics");
  const { diagnosticTemplates } = await import("../src/lib/diagnostic-templates");
  for (const template of Object.values(diagnosticTemplates)) {
    const message = template.replace(/\{p(\d+)\}/g, (_, index: string) => `VALUE_${index}`);
    for (const locale of ["zh", "ja"] as const) {
      const translated = localizeDiagnostic(message, locale);
      expect(translated).not.toBe(message);
      for (const [, index] of template.matchAll(/\{p(\d+)\}/g))
        expect(translated).toContain(`VALUE_${index}`);
    }
    expect(localizeDiagnostic(message, "en")).toBe(message);
  }
  expect(localizeDiagnostic("PayloadUUID duplicates the one in payload 2.", "zh")).toContain(
    "payload 2",
  );
  expect(localizeDiagnostic("Unexpected character (at character 7)", "ja")).toBe(
    "予期しない文字です（7 文字目）",
  );
  expect(localizeDiagnostic("Native parser detail: 123", "zh")).toBe("Native parser detail: 123");
});

test("SSR message rendering isolates each locale", async () => {
  const { createElement } = await import("react");
  const { renderToString } = await import("react-dom/server");
  const { LocaleProvider, useT } = await import("../src/lib/i18n");
  const Message = () => createElement("span", null, useT().open_file());
  const outputs = await Promise.all(
    LOCALES.map(async (locale) =>
      renderToString(createElement(LocaleProvider, { locale, children: createElement(Message) })),
    ),
  );
  expect(outputs).toEqual([
    "<span>Open file</span>",
    "<span>打开文件</span>",
    "<span>ファイルを開く</span>",
  ]);
});
