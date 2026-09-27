import { Link } from "@tanstack/react-router";
import { trustPages } from "@/content/trust";
import { FEEDBACK_URL, feedbackCopy } from "@/lib/feedback";
import { useLocale } from "@/lib/i18n";
import { localizedPath } from "@/lib/locales";
import { SiteShell } from "./SiteShell";

export function InfoPage({ path }: { path: "/about" | "/privacy" }) {
  const locale = useLocale();
  const page = trustPages[locale][path];
  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <h1 className="text-3xl font-semibold tracking-tight">{page.h1}</h1>
        <p className="mt-4 text-muted-foreground">{page.tagline}</p>
        <div className="mt-10 space-y-8">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold">{section.heading}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{section.body}</p>
            </section>
          ))}
          {page.faq.map((faq) => (
            <section key={faq.q}>
              <h2 className="text-lg font-medium">{faq.q}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{faq.a}</p>
            </section>
          ))}
          {path === "/about" && (
            <section>
              <h2 className="text-xl font-semibold">{feedbackCopy[locale].heading}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {feedbackCopy[locale].body}
              </p>
              <a
                href={FEEDBACK_URL}
                className="mt-3 inline-block text-primary underline underline-offset-4"
              >
                {feedbackCopy[locale].label} · GitHub Issues
              </a>
            </section>
          )}
        </div>
        <nav className="mt-10 flex flex-wrap gap-5 border-t border-border pt-6">
          {(["/about", "/privacy"] as const)
            .filter((to) => to !== path)
            .map((to) => (
              <Link
                key={to}
                className="text-primary underline underline-offset-4"
                to={localizedPath(to, locale)}
              >
                {trustPages[locale][to].h1}
              </Link>
            ))}
          <Link
            className="text-primary underline underline-offset-4"
            to={localizedPath("/", locale)}
          >
            {{ en: "Open the editor", zh: "打开编辑器", ja: "エディターを開く" }[locale]}
          </Link>
        </nav>
      </article>
    </SiteShell>
  );
}
