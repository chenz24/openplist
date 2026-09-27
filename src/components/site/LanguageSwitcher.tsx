import { useLocation, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Languages } from "lucide-react";
import { useLocale, useT } from "@/lib/i18n";
import {
  HTML_LANG,
  isLocale,
  LANGUAGE_NAMES,
  LOCALES,
  localizedPath,
  splitLocalePath,
} from "@/lib/locales";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useT();
  const location = useLocation();
  const navigate = useNavigate();
  const { path } = splitLocalePath(location.pathname);

  return (
    <div className="relative w-28 shrink-0 sm:w-36">
      <Languages
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-3 hidden size-3.5 text-muted-foreground sm:block"
      />
      <select
        aria-label={t.language_switch()}
        lang={HTML_LANG[locale]}
        value={locale}
        className="h-10 w-full cursor-pointer appearance-none rounded-md border border-input bg-background py-2 pl-3 pr-8 text-[13px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring sm:pl-9"
        onChange={(event) => {
          const target = event.target.value;
          if (!isLocale(target) || target === locale) return;
          // Commit a focused editor field before changing routes can unmount its draft.
          event.currentTarget.focus();
          void navigate({
            to: localizedPath(path, target),
            search: (previous) => previous,
            hash: location.hash,
            resetScroll: false,
          });
        }}
      >
        {LOCALES.map((target) => (
          <option key={target} value={target} lang={HTML_LANG[target]}>
            {LANGUAGE_NAMES[target]}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground"
      />
    </div>
  );
}
