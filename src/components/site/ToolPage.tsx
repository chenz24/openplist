import { Link, useLocation } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { type ReactNode, useState } from "react";
import {
  type EditorTab,
  emptyPlistSnapshot,
  PlistEditor,
  type PlistSnapshot,
} from "@/components/plist/PlistEditor";
import { getLocalizedPage } from "@/content/localized";
import { createHistory, type EditorHistory } from "@/lib/editor-history";
import { useEditorState } from "@/lib/editor-session";
import { useLocale, useT } from "@/lib/i18n";
import { localizedPath, splitLocalePath } from "@/lib/locales";
import type { AppleKind } from "@/lib/plist";
import type { ConversionMode } from "@/lib/plist/conversion";
import { PAGES, type PagePath } from "@/lib/site";
import { cn } from "@/lib/utils";
import { SiteShell } from "./SiteShell";
import { TaskDetails } from "./TaskDetails";

export interface FaqItem {
  q: string;
  a: ReactNode;
}

export interface Section {
  heading: string;
  body: ReactNode;
}

export function ToolPage({
  h1,
  tagline,
  bullets,
  editorTab = "xml",
  profile = false,
  kind,
  loc,
  sections = [],
  faq = [],
  related = [],
  editor,
  conversion,
  sectionWidgets = {},
}: {
  h1: string;
  tagline: string;
  bullets: string[];
  editorTab?: EditorTab;
  profile?: boolean;
  kind?: AppleKind;
  loc?: "strings" | "stringsdict";
  sections?: Section[];
  faq?: FaqItem[];
  related?: { to: string; label: string }[];
  editor?: ReactNode;
  conversion?: ConversionMode;
  sectionWidgets?: Partial<Record<number, ReactNode>>;
}) {
  const [history] = useEditorState<EditorHistory<PlistSnapshot>>(
    "PlistEditor.history",
    createHistory({ ...emptyPlistSnapshot, tab: editorTab }),
  );
  const [focusMode] = useEditorState("PlistEditor.focused", false);
  const hasDocument = !editor && !!history.present.doc;
  const focused = hasDocument && focusMode;
  const [showDetails, setShowDetails] = useState(false);
  const locale = useLocale();
  const t = useT();
  const { pathname } = useLocation();
  const path = splitLocalePath(pathname).path;
  const copy = path in PAGES ? getLocalizedPage(path as PagePath, locale) : undefined;
  if (copy) ({ h1, tagline, bullets, sections, faq } = copy);
  return (
    <SiteShell focused={focused}>
      <section className="border-b border-border">
        <div
          className={cn(
            "mx-auto max-w-7xl px-4 pb-8 sm:px-6",
            hasDocument ? "pt-3" : "pt-7 sm:pt-9",
            focused && "max-w-none p-0 sm:px-0",
          )}
        >
          <div className={focused ? "hidden" : undefined}>
            <div className="flex items-center justify-between gap-3">
              <h1
                className={cn(
                  "max-w-3xl font-semibold tracking-tight",
                  hasDocument ? "text-lg" : "text-2xl sm:text-3xl",
                )}
              >
                {h1}
              </h1>
              {hasDocument && (
                <button
                  type="button"
                  className="editor-action shrink-0"
                  aria-expanded={showDetails}
                  aria-controls="tool-introduction"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? t.hide_details() : t.show_details()}
                </button>
              )}
            </div>
            <div id="tool-introduction" hidden={hasDocument && !showDetails}>
              <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-muted-foreground">
                {tagline}
              </p>
              <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2 xl:flex xl:flex-wrap">
                {bullets.map((b) => (
                  <li
                    key={b}
                    className="inline-flex items-start gap-2 text-[12px] text-foreground/90"
                  >
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className={focused ? "" : hasDocument ? "mt-3" : "mt-6"}>
            {editor ?? (
              <PlistEditor
                initialTab={editorTab}
                profile={profile}
                kind={kind}
                loc={loc}
                conversion={conversion}
              />
            )}
          </div>
        </div>
      </section>

      {!focused && sections.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 py-12">
          <div className="space-y-10">
            {sections.map((s, index) => (
              <article key={s.heading}>
                <h2 className="text-xl font-semibold tracking-tight">{s.heading}</h2>
                <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground">
                  {s.body}
                  {sectionWidgets[index]}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {!focused && <TaskDetails path={path} />}
      {!focused && faq.length > 0 && (
        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-3xl px-4 py-12">
            <h2 className="text-xl font-semibold tracking-tight">{t.faq()}</h2>
            <dl className="mt-6 space-y-6">
              {faq.map((f) => (
                <div key={f.q}>
                  <dt className="font-medium text-foreground">{f.q}</dt>
                  <dd className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
                    {f.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {!focused && related.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {t.related_tools()}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {related.map((r) => (
                <Link
                  key={r.to}
                  to={localizedPath(r.to, locale)}
                  className="rounded-md border border-border bg-card px-3 py-1.5 text-[13px] transition-colors hover:border-primary hover:text-primary"
                >
                  {getLocalizedPage(r.to as PagePath, locale)?.h1 ?? r.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
