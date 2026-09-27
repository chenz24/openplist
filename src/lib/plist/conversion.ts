import { fromJsonValue } from "./index";
import type { PValue } from "./types";

export type ConversionMode = "binary-to-xml" | "plist-to-json" | "json-to-plist";

export class JsonPlistInputError extends Error {
  constructor(public readonly reason: "null" | "number") {
    super(reason);
  }
}

/** Refuse silent null coercion and numbers outside the editor's numeric range. */
export function parseJsonForPlist(text: string): PValue {
  const input: unknown = JSON.parse(text);
  const validate = (value: unknown): void => {
    if (value === null) throw new JsonPlistInputError("null");
    if (
      typeof value === "number" &&
      (!Number.isFinite(value) || (Number.isInteger(value) && !Number.isSafeInteger(value)))
    )
      throw new JsonPlistInputError("number");
    if (Array.isArray(value)) value.forEach(validate);
    else if (typeof value === "object") Object.values(value).forEach(validate);
  };
  validate(input);
  return fromJsonValue(input);
}

export const JSON_SAMPLE = '{\n  "Name": "Example",\n  "Enabled": true,\n  "Count": 3\n}';
export const CONVERSION_SAMPLE: PValue = {
  type: "dict",
  value: [
    { key: "Name", value: { type: "string", value: "Example" } },
    { key: "Enabled", value: { type: "boolean", value: true } },
    { key: "Count", value: { type: "integer", value: 3 } },
    { key: "Created", value: { type: "date", value: new Date("2026-01-01T00:00:00Z") } },
    { key: "Data", value: { type: "data", value: new Uint8Array([72, 105]) } },
  ],
};
