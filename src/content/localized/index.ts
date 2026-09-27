import type { Locale } from "@/lib/locales";
import type { PagePath } from "@/lib/site";
import { ja } from "./ja";
import { zh } from "./zh";

export function getLocalizedPage(path: PagePath, locale: Locale) {
  return locale === "en" ? undefined : { zh, ja }[locale][path];
}
