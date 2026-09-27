import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { localizeDiagnostic } from "@/lib/diagnostics";
import { useLocale, useT } from "@/lib/i18n";

import { buildXmlPlist, type PValue, parsePlist, redactProfile } from "@/lib/plist";
import { analyzeProfile, type ProfileAnalysis } from "@/lib/profile-ai.functions";
import { cn } from "@/lib/utils";

const SEV: Record<string, string> = {
  high: "bg-destructive/15 text-destructive border-destructive/40",
  medium: "bg-primary/15 text-primary border-primary/40",
  low: "bg-accent text-foreground border-border",
  info: "bg-surface-raised text-muted-foreground border-border",
};

/** AI explanation of a configuration profile. Pass `doc` to analyze the editor's profile; otherwise the user pastes or picks a file. */
export function ProfileAnalyzer({
  doc,
  signedBy,
}: {
  doc?: PValue | null;
  signedBy?: string[] | null;
}) {
  const t = useT();
  const locale = useLocale();
  const analyze = useServerFn(analyzeProfile);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProfileAnalysis | null>(null);

  const run = async (source: PValue | null) => {
    setError(null);
    setResult(null);
    let value = source;
    try {
      if (!value) value = parsePlist(text).value;
    } catch (e) {
      setError(
        t.profile_error({
          detail: e instanceof Error ? localizeDiagnostic(e.message, locale) : "",
        }),
      );
      return;
    }
    setLoading(true);
    try {
      const note = signedBy
        ? `<!-- Note: the original file was CMS-signed; signature removed for display. Certificate names: ${signedBy.join(", ") || "unknown"}. Signature not verified. -->\n`
        : "<!-- Note: signing status unknown (content may have been pasted). -->\n";
      setResult(
        await analyze({ data: { locale, profile: note + buildXmlPlist(redactProfile(value)) } }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : t.ai_failed());
    } finally {
      setLoading(false);
    }
  };

  const onFile = async (f: File) => {
    try {
      const parsed = parsePlist(new Uint8Array(await f.arrayBuffer()));
      setText(buildXmlPlist(parsed.value));
      setError(null);
    } catch (e) {
      setError(
        t.file_error({
          name: f.name,
          detail: e instanceof Error ? localizeDiagnostic(e.message, locale) : "",
        }),
      );
    }
  };

  return (
    <div className="rounded-md border border-border bg-surface p-3 text-[13px]">
      {!doc && (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            placeholder={t.paste_profile()}
            className="h-40 w-full resize-y rounded border border-border bg-background px-2 py-1.5 font-mono text-[12px] outline-none focus:border-ring"
          />
          <label className="mt-2 inline-block cursor-pointer text-muted-foreground hover:text-foreground">
            {t.choose_profile()}
            <input
              type="file"
              accept=".mobileconfig,.plist,.xml"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onFile(f);
                e.target.value = "";
              }}
            />
          </label>
        </>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={loading || (!doc && !text.trim())}
          onClick={() => void run(doc ?? null)}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Sparkles className="size-3.5" />
          )}
          {loading ? t.analyzing() : t.analyze_ai()}
        </button>
        <span className="text-[12px] text-muted-foreground">{t.ai_privacy()}</span>
      </div>

      {error && <p className="mt-3 text-destructive">{localizeDiagnostic(error, locale)}</p>}

      {result && (
        <div className="mt-4 space-y-4">
          <p className="leading-relaxed">{result.summary}</p>
          <div>
            <h3 className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {t.security_review()}
            </h3>
            <ul className="space-y-2">
              {result.risks.map((r, i) => (
                <li key={i} className="rounded border border-border bg-background p-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase",
                        SEV[r.severity],
                      )}
                    >
                      {
                        {
                          high: t.severity_high(),
                          medium: t.severity_medium(),
                          low: t.severity_low(),
                          info: t.severity_info(),
                        }[r.severity]
                      }
                    </span>
                    <span className="font-medium">{r.title}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{r.detail}</p>
                  <p className="mt-1">
                    <span className="text-muted-foreground">{t.fix()}</span>
                    {r.recommendation}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {t.settings_explained()}
            </h3>
            <dl className="space-y-2">
              {result.settings.map((s, i) => (
                <div key={i}>
                  <dt className="font-mono text-[12px] text-primary">{s.payload}</dt>
                  <dd className="text-foreground/90">{s.explanation}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="text-[11px] text-muted-foreground">{t.ai_caveat()}</p>
        </div>
      )}
    </div>
  );
}
