import {
  createRootRoute,
  type ErrorComponentProps,
  HeadContent,
  Link,
  Outlet,
  redirect,
  Scripts,
  useRouter,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { canonicalPathname } from "@/lib/canonical-path";
import { EditorSessionProvider } from "@/lib/editor-session";
import { LocaleProvider, useLocale, useT } from "@/lib/i18n";
import { HTML_LANG, localizedPath, splitLocalePath } from "@/lib/locales";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  const t = useT();
  const locale = useLocale();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <meta name="robots" content="noindex, nofollow" />
        <title>{t.not_found_title()}</title>
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t.not_found()}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t.not_found_detail()}</p>
        <div className="mt-6">
          <Link
            to={localizedPath("/", locale)}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.home()}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const t = useT();
  const locale = useLocale();
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <meta name="robots" content="noindex, nofollow" />
        <title>{t.error_title()}</title>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {t.error_heading()}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.error_detail()}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.try_again()}
          </button>
          <a
            href={localizedPath("/", locale)}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t.home()}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const path = canonicalPathname(location.pathname);
    if (path !== location.pathname) {
      throw redirect({
        href: path + location.searchStr + (location.hash ? `#${location.hash}` : ""),
        statusCode: 308,
      });
    }
    return { locale: splitLocalePath(location.pathname).locale };
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#171d27" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { rel: "icon", href: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const { locale = "en" } = Route.useRouteContext();
  return (
    <html lang={HTML_LANG[locale]}>
      <head>
        <HeadContent />
      </head>
      <body>
        <LocaleProvider locale={locale}>
          <EditorSessionProvider>{children}</EditorSessionProvider>
        </LocaleProvider>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
