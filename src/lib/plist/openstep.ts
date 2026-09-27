import type { PDictEntry, PValue } from "./types";

/**
 * Minimal OpenStep / ASCII property list reader (the `{ Key = "Value"; }`
 * format still used by .strings files and older config files).
 */
export function parseOpenStepPlist(text: string): PValue {
  let i = 0;

  const skip = () => {
    for (;;) {
      while (i < text.length && /\s/.test(text[i]!)) i++;
      if (text.startsWith("//", i)) {
        const nl = text.indexOf("\n", i);
        i = nl === -1 ? text.length : nl + 1;
        continue;
      }
      if (text.startsWith("/*", i)) {
        const end = text.indexOf("*/", i + 2);
        i = end === -1 ? text.length : end + 2;
        continue;
      }
      return;
    }
  };

  const fail = (msg: string): never => {
    throw new Error(`${msg} (at character ${i + 1})`);
  };

  const readQuoted = (): string => {
    const quote = text[i]!;
    i++;
    let out = "";
    while (i < text.length && text[i] !== quote) {
      if (text[i] === "\\") {
        i++;
        const c = text[i]!;
        if (c === "n") out += "\n";
        else if (c === "t") out += "\t";
        else if (c === "r") out += "\r";
        else if (c === "U" || c === "u") {
          out += String.fromCharCode(parseInt(text.slice(i + 1, i + 5), 16));
          i += 4;
        } else out += c;
        i++;
      } else {
        out += text[i];
        i++;
      }
    }
    i++;
    return out;
  };

  const readBare = (): string => {
    const start = i;
    while (i < text.length && /[A-Za-z0-9_$+\-./:]/.test(text[i]!)) i++;
    if (i === start) fail("Unexpected character");
    return text.slice(start, i);
  };

  const readValue = (): PValue => {
    skip();
    const c = text[i];
    if (c === undefined) fail("Unexpected end of file");
    if (c === "{") {
      i++;
      const entries: PDictEntry[] = [];
      for (;;) {
        skip();
        if (text[i] === "}") {
          i++;
          break;
        }
        if (i >= text.length) fail("Missing closing }");
        const key = text[i] === '"' || text[i] === "'" ? readQuoted() : readBare();
        skip();
        if (text[i] !== "=") fail("Expected = after key");
        i++;
        const value = readValue();
        entries.push({ key, value });
        skip();
        if (text[i] === ";") i++;
      }
      return { type: "dict", value: entries };
    }
    if (c === "(") {
      i++;
      const items: PValue[] = [];
      for (;;) {
        skip();
        if (text[i] === ")") {
          i++;
          break;
        }
        if (i >= text.length) fail("Missing closing )");
        items.push(readValue());
        skip();
        if (text[i] === ",") i++;
      }
      return { type: "array", value: items };
    }
    if (c === "<") {
      i++;
      const end = text.indexOf(">", i);
      const hex = text.slice(i, end === -1 ? text.length : end).replace(/\s+/g, "");
      i = end === -1 ? text.length : end + 1;
      const bytes = new Uint8Array(Math.floor(hex.length / 2));
      for (let k = 0; k < bytes.length; k++) bytes[k] = parseInt(hex.substr(k * 2, 2), 16);
      return { type: "data", value: bytes };
    }
    if (c === '"' || c === "'") return { type: "string", value: readQuoted() };
    return { type: "string", value: readBare() };
  };

  skip();
  // A bare `.strings` file is a dictionary without braces.
  if (text[i] !== "{" && text[i] !== "(") {
    const entries: PDictEntry[] = [];
    while (i < text.length) {
      skip();
      if (i >= text.length) break;
      const key = text[i] === '"' || text[i] === "'" ? readQuoted() : readBare();
      skip();
      if (text[i] !== "=") fail("Expected = after key");
      i++;
      entries.push({ key, value: readValue() });
      skip();
      if (text[i] === ";") i++;
    }
    return { type: "dict", value: entries };
  }
  return readValue();
}
