import { m } from "@/paraglide/messages";
import { diagnosticTemplates } from "./diagnostic-templates";
import type { Locale } from "./locales";

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const patterns = Object.entries(diagnosticTemplates)
  .sort((a, b) => Number(a[1].includes("{p")) - Number(b[1].includes("{p")))
  .map(([key, template]) => ({
    key: key as keyof typeof diagnosticTemplates,
    regex: new RegExp(
      `^${template
        .split(/\{p\d+\}/)
        .map(escapeRegex)
        .join("(.*?)")}$`,
      "s",
    ),
  }));
/** Translate at the presentation boundary, leaving parser output and imported data unchanged. */
export function localizeDiagnostic(message: string, locale: Locale): string {
  if (locale === "en") return message;
  for (const { key, regex } of patterns) {
    const match = regex.exec(message);
    if (!match) continue;
    const params = Object.fromEntries(match.slice(1).map((value, i) => [`p${i}`, value]));
    return (m[key] as (input: Record<string, string>, options: { locale: Locale }) => string)(
      params,
      { locale },
    );
  }
  // Native browser / third-party parser details are intentionally preserved verbatim.
  return message;
}
