import { readdir } from "node:fs/promises";
import { describe, expect, test } from "vitest";
import { canonicalPathname } from "../src/lib/canonical-path";
import { serializeJsonLd } from "../src/lib/seo";
import { PAGE_PATHS, PAGES } from "../src/lib/site";

describe("public routes and metadata", () => {
  test("canonical aliases normalize in one step without changing locale boundaries", () => {
    for (const [input, expected] of [
      ["/", "/"],
      ["/en", "/"],
      ["/en/", "/"],
      ["/en/plist-editor/", "/plist-editor"],
      ["/plist-editor/", "/plist-editor"],
      ["/zh/", "/zh"],
      ["/ja/plist-editor/", "/ja/plist-editor"],
      ["/entitlements-editor", "/entitlements-editor"],
      ["/enjoy/", "/enjoy"],
      ["/en//example.com///", "/example.com"],
      ["//example.com/", "/example.com"],
    ] as const) {
      expect(canonicalPathname(input)).toBe(expected);
      expect(canonicalPathname(expected)).toBe(expected);
    }
  });

  test("every public file route is registered for the sitemap", async () => {
    const routes = (await readdir("src/routes"))
      .filter(
        (name) =>
          name.endsWith(".tsx") &&
          !name.startsWith("_") &&
          !name.startsWith("$") &&
          !name.includes("[.]"),
      )
      .map((name) => (name === "index.tsx" ? "/" : `/${name.replace(/\.tsx$/, "")}`));
    expect(routes.sort()).toEqual([...PAGE_PATHS].sort());
    expect(new Set(Object.values(PAGES).map((page) => page.title)).size).toBe(routes.length);
    expect(new Set(Object.values(PAGES).map((page) => page.description)).size).toBe(routes.length);
  });

  test("JSON-LD content cannot break out of its script element", () => {
    const value = { name: "</script><script>alert('x')</script>", description: "A & B" };
    const json = serializeJsonLd(value);
    expect(json).not.toContain("<");
    expect(JSON.parse(json)).toEqual(value);
  });
});
