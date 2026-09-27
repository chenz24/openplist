import { expect, test } from "vitest";
import { buildBinaryPlist, parseBinaryPlist } from "../src/lib/plist/binary";
import type { PValue } from "../src/lib/plist/types";

test("binary round trips preserve key order and distinct plist value types", () => {
  const doc: PValue = {
    type: "dict",
    value: [
      { key: "z-first", value: { type: "integer", value: 1 } },
      { key: "a-second", value: { type: "real", value: 1 } },
      { key: "unicode", value: { type: "string", value: "你好 🍎" } },
      {
        key: "nested",
        value: {
          type: "array",
          value: [
            { type: "boolean", value: false },
            { type: "date", value: new Date("2026-01-01T00:00:00Z") },
            { type: "data", value: new Uint8Array([0, 128, 255]) },
            { type: "uid", value: 42 },
          ],
        },
      },
    ],
  };
  expect(parseBinaryPlist(buildBinaryPlist(doc))).toEqual(doc);
});
