import { createContext, type ReactNode, useContext, useMemo } from "react";
import { m } from "@/paraglide/messages";
import type { Locale } from "./locales";

const LocaleContext = createContext<Locale>("en");
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}
export const useLocale = () => useContext(LocaleContext);

/** Bind every compiled message explicitly. Never mutate a shared SSR locale. */
export function useT(): typeof m {
  const locale = useLocale();
  return useMemo(
    () =>
      new Proxy({} as typeof m, {
        get(_target, key: string) {
          const message = m[key as keyof typeof m];
          return (params: Record<string, unknown> = {}) =>
            (message as (params: Record<string, unknown>, options: { locale: Locale }) => string)(
              params,
              { locale },
            );
        },
      }),
    [locale],
  );
}
