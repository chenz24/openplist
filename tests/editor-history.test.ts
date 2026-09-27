import { expect, test } from "vitest";
import { createHistory, recordEdit, redoEdit, undoEdit } from "../src/lib/editor-history";
import type { PValue } from "../src/lib/plist/types";
import { getErrorLocation } from "../src/lib/source-location";

test("undo and redo restore typed values without a JSON round trip", () => {
  const doc: PValue = {
    type: "dict",
    value: [
      { key: "date", value: { type: "date", value: new Date("2026-09-27T00:00:00Z") } },
      { key: "bytes", value: { type: "data", value: new Uint8Array([0, 128, 255]) } },
    ],
  };
  const deleted: PValue = { type: "dict", value: [] };
  const changed = recordEdit(createHistory(doc), deleted);
  expect(undoEdit(changed).present).toBe(doc);
  expect(redoEdit(undoEdit(changed)).present).toBe(deleted);
});

test("source typing groups into one undo, but tree edits and pauses start separate steps", () => {
  let h = createHistory("initial");
  h = recordEdit(h, "a", "source:xml", 1000);
  h = recordEdit(h, "ab", "source:xml", 1100);
  expect(undoEdit(h).present).toBe("initial");
  h = recordEdit(h, "abc", "source:xml", 2000);
  expect(undoEdit(h).present).toBe("ab");
  h = recordEdit(h, "tree change", null, 2100);
  expect(undoEdit(h).present).toBe("abc");
});

test("editing after undo replaces the redo branch and does not coalesce with old typing", () => {
  let h = recordEdit(createHistory("start"), "old", "source:xml", 1000);
  h = undoEdit(h);
  h = recordEdit(h, "new", "source:xml", 1100);
  expect(h.future).toEqual([]);
  expect(redoEdit(h).present).toBe("new");
  expect(undoEdit(h).present).toBe("start");
});

test("typing immediately after a save can undo back to the saved content", () => {
  const edited = recordEdit(createHistory("original"), "saved", "source:xml", 1000);
  const saved = { ...edited, group: null };
  const resumed = recordEdit(saved, "new typing", "source:xml", 1050);
  expect(undoEdit(resumed).present).toBe("saved");
});

test("invalid drafts and their last valid tree survive undo and redo together", () => {
  const valid = { doc: 1, draft: "<integer>1</integer>", error: null as string | null };
  const invalid = { doc: 1, draft: "<integer>", error: "Invalid XML" };
  const h = recordEdit(createHistory(valid), invalid);
  expect(undoEdit(h).present).toEqual(valid);
  expect(redoEdit(undoEdit(h)).present).toEqual(invalid);
});

test("history is bounded and resetting a document cannot undo into another file", () => {
  let h = createHistory(0);
  for (let i = 1; i <= 150; i++) h = recordEdit(h, i);
  expect(h.past).toHaveLength(100);
  const reset = createHistory(500);
  expect(undoEdit(reset)).toBe(reset);
  expect(redoEdit(reset)).toBe(reset);
});

test("error positions handle native XML, JSON offsets, EOF and unknown messages", () => {
  expect(getErrorLocation("error on line 4 at column 9: mismatch", "")).toEqual({
    line: 4,
    column: 9,
  });
  expect(getErrorLocation(new Error("bad JSON at position 4"), "{\n  ?}")).toEqual({
    line: 2,
    column: 3,
  });
  expect(getErrorLocation(new Error("Unexpected end of JSON input"), "{\n")).toEqual({
    line: 2,
    column: 1,
  });
  expect(getErrorLocation(new Error("Invalid source"), "test")).toBeNull();
  expect(getErrorLocation({ sourceLocation: { line: 3, column: 2 } }, "")).toEqual({
    line: 3,
    column: 2,
  });
});
