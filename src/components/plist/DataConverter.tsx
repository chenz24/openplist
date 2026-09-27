import { Copy } from "lucide-react";
import { useMemo } from "react";
import { localizeDiagnostic } from "@/lib/diagnostics";
import { useEditorState } from "@/lib/editor-session";
import { useLocale, useT } from "@/lib/i18n";

import { base64ToBytes, bytesToBase64 } from "@/lib/plist";
import { bytesToHex, hexToBytes } from "@/lib/plist/opencore";

type Mode = "hex" | "base64" | "int";

function decode(mode: Mode, text: string): Uint8Array {
  const t = text.trim();
  if (mode === "hex") return hexToBytes(t);
  if (mode === "base64") {
    if (!/^[A-Za-z0-9+/=\s]*$/.test(t)) throw new Error("Not valid Base64");
    return base64ToBytes(t.replace(/\s/g, ""));
  }
  const n = t.toLowerCase().startsWith("0x") ? BigInt(t) : BigInt(t || "0");
  if (n < 0n || n > 0xffffffffn) throw new Error("Integer must be between 0 and 0xFFFFFFFF");
  const out = new Uint8Array(4);
  for (let i = 0; i < 4; i++) out[i] = Number((n >> BigInt(8 * i)) & 0xffn);
  return out;
}

function leInt(b: Uint8Array) {
  if (b.length === 0 || b.length > 8) return "—";
  let n = 0n;
  b.forEach((x, i) => {
    n |= BigInt(x) << BigInt(8 * i);
  });
  return `0x${n.toString(16).toUpperCase()} (${n})`;
}

/** Base64 ⇄ Hex ⇄ little-endian integer converter for plist <data> values. */
export function DataConverter() {
  const t = useT();
  const locale = useLocale();
  const [mode, setMode] = useEditorState<Mode>("DataConverter.mode", "hex");
  const [text, setText] = useEditorState("DataConverter.text", "07009B3E");

  const res = useMemo(() => {
    try {
      const b = decode(mode, text);
      return {
        rows: [
          ["Hex", bytesToHex(b)],
          [t.base64_data(), bytesToBase64(b)],
          [t.little_endian(), leInt(b)],
          [
            "ASCII",
            Array.from(b, (x) => (x >= 32 && x < 127 ? String.fromCharCode(x) : "·")).join(""),
          ],
          [t.length(), t.bytes_count({ count: b.length })],
        ] as [string, string][],
      };
    } catch (e) {
      return { error: e instanceof Error ? e.message : t.invalid_input() };
    }
  }, [mode, text, t]);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap gap-1 border-b border-border bg-surface-raised px-2 py-1.5">
        {(
          [
            ["hex", t.from_hex()],
            ["base64", t.from_base64()],
            ["int", t.from_integer()],
          ] as [Mode, string][]
        ).map(([m, l]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded px-2 py-1 font-mono text-[11px] uppercase tracking-wider ${mode === m ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="p-3">
        <input
          aria-label={t.converter_input()}
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          placeholder={mode === "hex" ? "07009B3E" : mode === "base64" ? "BwCbPg==" : "0x3E9B0007"}
          className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-[13px] text-foreground outline-none focus:border-primary"
        />
        {"error" in res ? (
          <p className="mt-2 font-mono text-[12px] text-destructive">
            {localizeDiagnostic(res.error ?? "", locale)}
          </p>
        ) : (
          <dl className="mt-3 space-y-1.5 font-mono text-[12px]">
            {res.rows?.map(([k, v]) => (
              <div key={k} className="flex items-center gap-3">
                <dt className="w-48 shrink-0 text-muted-foreground">{k}</dt>
                <dd className="min-w-0 flex-1 truncate text-foreground" title={v}>
                  {v || "—"}
                </dd>
                <button
                  type="button"
                  aria-label={t.copy_value({ name: k })}
                  onClick={() => void navigator.clipboard.writeText(v)}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Copy className="size-3.5" />
                </button>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
