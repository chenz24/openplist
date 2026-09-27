import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { FEEDBACK_URL, feedbackCopy } from "@/lib/feedback";
import { useLocale, useT } from "@/lib/i18n";
import { localizedPath } from "@/lib/locales";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function SiteShell({
  children,
  focused = false,
}: {
  children: ReactNode;
  focused?: boolean;
}) {
  const t = useT();
  const locale = useLocale();
  const TOOLS = [
    { to: "/plist-viewer", label: t.viewer() },
    { to: "/plist-editor", label: t.editor() },
    { to: "/binary-plist-viewer", label: t.binary_viewer() },
    { to: "/binary-plist-to-xml", label: t.binary_xml() },
    { to: "/plist-to-json", label: "Plist → JSON" },
    { to: "/json-to-plist", label: "JSON → Plist" },
    { to: "/mobileconfig-editor", label: "Mobileconfig" },
    { to: "/entitlements-editor", label: t.entitlements() },
    { to: "/mobileprovision-viewer", label: t.provisioning() },
    { to: "/xcconfig-editor", label: "xcconfig" },
    { to: "/opencore-config-editor", label: "OpenCore" },
    { to: "/strings-editor", label: ".strings" },
    { to: "/stringsdict-editor", label: ".stringsdict" },
  ] as const;

  const GUIDES = [
    { to: "/how-to-open-plist-on-windows", label: t.windows_guide() },
    { to: "/what-is-a-plist-file", label: t.what_plist() },
    { to: "/xml-vs-binary-plist", label: t.xml_binary() },
  ] as const;

  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useRef<HTMLElement>(null);
  useEffect(() => {
    const close = (event: PointerEvent | KeyboardEvent) => {
      const nav = navigation.current;
      if (!nav) return;
      if (event instanceof KeyboardEvent) {
        if (event.key !== "Escape") return;
        const active = nav.querySelector<HTMLDetailsElement>("details[open]");
        if (active?.contains(document.activeElement)) active.querySelector("summary")?.focus();
      } else if (nav.contains(event.target as Node)) return;
      for (const details of nav.querySelectorAll("details[open]"))
        (details as HTMLDetailsElement).open = false;
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, []);

  const navLinks = (extraClass = "") =>
    [...TOOLS.slice(0, 2), ...TOOLS.slice(2), ...GUIDES].map((t) => (
      <Link
        key={t.to}
        to={localizedPath(t.to, locale)}
        className={`block rounded px-3 py-2 text-[14px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&.active]:text-primary ${extraClass}`}
        onClick={() => setMenuOpen(false)}
      >
        {t.label}
      </Link>
    ));

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-primary focus:p-3 focus:text-primary-foreground"
      >
        {t.skip_content()}
      </a>
      <header
        hidden={focused}
        className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 px-4 py-2.5 sm:flex sm:gap-4 sm:px-6">
          <Link
            to={localizedPath("/", locale)}
            className="min-w-0 font-mono text-[15px] font-semibold tracking-tight"
          >
            openplist<span className="text-primary">.com</span>
          </Link>
          <nav ref={navigation} className="hidden items-center gap-1 lg:flex">
            {TOOLS.slice(0, 2).map((t) => (
              <Link
                key={t.to}
                to={localizedPath(t.to, locale)}
                className="rounded px-2.5 py-1 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&.active]:text-primary"
              >
                {t.label}
              </Link>
            ))}
            {[
              { title: t.convert(), items: TOOLS.slice(2, 6) },
              { title: t.apple_files(), items: TOOLS.slice(6) },
              { title: t.guides(), items: GUIDES },
            ].map((g) => (
              <details
                key={g.title}
                className="group relative"
                onToggle={(event) => {
                  const current = event.currentTarget;
                  if (!current.open) return;
                  for (const other of navigation.current?.querySelectorAll("details[open]") ?? []) {
                    if (other !== current) (other as HTMLDetailsElement).open = false;
                  }
                }}
              >
                <summary className="flex min-h-9 cursor-pointer list-none items-center gap-1.5 rounded px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline focus-visible:outline-ring group-open:bg-accent group-open:text-foreground [&::-webkit-details-marker]:hidden">
                  {g.title}
                  <ChevronDown className="size-3" aria-hidden="true" />
                </summary>
                <div className="absolute left-0 top-full z-40 mt-1 min-w-52 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
                  {g.items.map((item) => (
                    <Link
                      key={item.to}
                      to={localizedPath(item.to, locale)}
                      className="flex min-h-10 items-center rounded px-3 text-[13px] hover:bg-accent focus-visible:bg-accent focus-visible:outline focus-visible:outline-ring [&.active]:text-primary"
                      onClick={(event) => {
                        const details = event.currentTarget.closest("details");
                        if (details) details.open = false;
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
          </nav>
          <LanguageSwitcher />
          <div className="flex items-center gap-1 lg:hidden">
            {TOOLS.slice(0, 2).map((t) => (
              <Link
                key={t.to}
                to={localizedPath(t.to, locale)}
                className="hidden min-[480px]:block rounded px-2 py-1 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&.active]:text-primary"
              >
                {t.label}
              </Link>
            ))}
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={t.open_menu()}
              className="rounded p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav
            id="mobile-navigation"
            className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-background px-4 pb-3 pt-2 lg:hidden"
          >
            {navLinks()}
          </nav>
        )}
      </header>

      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>

      <footer hidden={focused} className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:grid-cols-[2fr_1fr] lg:grid-cols-[1fr_2fr_1fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-mono text-sm font-semibold">
              openplist<span className="text-primary">.com</span>
            </p>
            <p className="mt-2 text-[13px] text-muted-foreground">{t.footer_privacy()}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <Link className="py-1 hover:text-primary" to={localizedPath("/about", locale)}>
                {{ en: "About", zh: "关于", ja: "このサイトについて" }[locale]}
              </Link>
              <Link className="py-1 hover:text-primary" to={localizedPath("/privacy", locale)}>
                {{ en: "Privacy", zh: "隐私", ja: "プライバシー" }[locale]}
              </Link>
              <a className="py-1 hover:text-primary" href={FEEDBACK_URL}>
                {feedbackCopy[locale].label}
              </a>
            </div>
          </div>
          <FooterList
            title={t.tools()}
            multiColumn
            items={[
              ...TOOLS,
              { to: "/binary-plist-editor", label: t.binary_editor() },
              { to: "/plist-to-xml", label: "Plist → XML" },
              { to: "/xml-to-plist", label: "XML → Plist" },
            ]}
          />
          <FooterList title={t.guides()} items={GUIDES} />
        </div>
      </footer>
    </div>
  );
}

function FooterList({
  title,
  items,
  multiColumn = false,
}: {
  title: string;
  items: readonly { to: string; label: string }[];
  multiColumn?: boolean;
}) {
  const locale = useLocale();
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <ul
        className={`mt-2 grid gap-x-5 gap-y-1 ${multiColumn ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
      >
        {items.map((i) => (
          <li key={i.to}>
            <Link
              to={localizedPath(i.to, locale)}
              className="inline-flex min-h-8 items-center py-1 text-[13px] leading-5 text-foreground/80 transition-colors hover:text-primary sm:min-h-7"
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
