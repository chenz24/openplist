export const LOCALES = ["en", "zh", "ja"] as const;
export type Locale = (typeof LOCALES)[number];
export const HTML_LANG: Record<Locale, string> = { en: "en", zh: "zh-CN", ja: "ja" };
export const OG_LOCALE: Record<Locale, string> = { en: "en_US", zh: "zh_CN", ja: "ja_JP" };
export const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  zh: "简体中文",
  ja: "日本語",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && LOCALES.includes(value as Locale);
}

export function splitLocalePath(pathname: string): { locale: Locale; path: string } {
  const segments = pathname.split("/");
  const first = segments[1];
  if (isLocale(first))
    return { locale: first, path: `/${segments.slice(2).join("/")}`.replace(/\/+$/, "") || "/" };
  return { locale: "en", path: pathname.replace(/\/+$/, "") || "/" };
}

export function localizedPath(path: string, locale: Locale): string {
  const normalized = splitLocalePath(path).path;
  return locale === "en" ? normalized : `/${locale}${normalized === "/" ? "" : normalized}`;
}
