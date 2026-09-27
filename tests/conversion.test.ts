import { readFile } from "node:fs/promises";
import { expect, test } from "vitest";
import { buildXmlPlist, parseBinaryPlist, serialize, toJson } from "../src/lib/plist";
import {
  CONVERSION_SAMPLE,
  JSON_SAMPLE,
  JsonPlistInputError,
  parseJsonForPlist,
} from "../src/lib/plist/conversion";

test("JSON conversion accepts arrays and scalar roots, preserving value types", () => {
  expect(parseJsonForPlist('[true, "2026-01-01", 1, 1.5]')).toEqual({
    type: "array",
    value: [
      { type: "boolean", value: true },
      { type: "string", value: "2026-01-01" },
      { type: "integer", value: 1 },
      { type: "real", value: 1.5 },
    ],
  });
  expect(parseJsonForPlist('"hello"')).toEqual({ type: "string", value: "hello" });
  expect(parseJsonForPlist("false")).toEqual({ type: "boolean", value: false });
  expect(parseJsonForPlist("9007199254740991")).toEqual({
    type: "integer",
    value: 9007199254740991,
  });
});

test("JSON conversion refuses silent null and unsafe-number coercion", () => {
  for (const text of [
    "null",
    '{"nested":[null]}',
    "9007199254740993",
    "-9007199254740992",
    "1e400",
  ])
    expect(() => parseJsonForPlist(text)).toThrow(JsonPlistInputError);
  for (const text of ["", '{"a":}', "undefined"])
    expect(() => parseJsonForPlist(text)).toThrow(SyntaxError);
});

test("JSON output preserves prototype-like keys as ordinary data", () => {
  const text = '{"__proto__":{"safe":true},"constructor":"value","toString":3}';
  expect(JSON.parse(toJson(parseJsonForPlist(text)))).toEqual(JSON.parse(text));
  expect(toJson(CONVERSION_SAMPLE)).toContain('"Created": "2026-01-01T00:00:00.000Z"');
  expect(toJson(CONVERSION_SAMPLE)).toContain('"Data": "SGk="');
});

test("downloadable examples match the actual converter sample and outputs", async () => {
  const binary = new Uint8Array(await readFile("public/examples/example-binary.plist"));
  expect(new TextDecoder().decode(binary.slice(0, 8))).toBe("bplist00");
  expect(parseBinaryPlist(binary)).toEqual(CONVERSION_SAMPLE);
  expect(await readFile("public/examples/example-xml.plist", "utf8")).toBe(
    buildXmlPlist(CONVERSION_SAMPLE),
  );
  expect(await readFile("public/examples/example.json", "utf8")).toBe(`${JSON_SAMPLE}\n`);
  expect(await readFile("public/examples/plist-output.json", "utf8")).toBe(
    toJson(CONVERSION_SAMPLE),
  );
  const value = parseJsonForPlist(JSON_SAMPLE);
  expect(parseBinaryPlist(serialize(value, "binary"))).toEqual(value);
});
