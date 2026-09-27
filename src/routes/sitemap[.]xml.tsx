import { createFileRoute } from "@tanstack/react-router";
import { HTML_LANG, LOCALES } from "@/lib/locales";

import { canonicalUrl, INDEXABLE_PAGES } from "@/lib/site";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${INDEXABLE_PAGES.map(({ path, locale }) => `  <url><loc>${canonicalUrl(path, locale)}</loc>${[...LOCALES.map((language) => `<xhtml:link rel="alternate" hreflang="${HTML_LANG[language]}" href="${canonicalUrl(path, language)}"/>`), `<xhtml:link rel="alternate" hreflang="x-default" href="${canonicalUrl(path)}"/>`].join("")}</url>`).join("\n")}
</urlset>
`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
