import { HTML_LANG, LOCALES, type Locale, OG_LOCALE } from "./locales";
import {
  canonicalUrl,
  getPageMeta,
  INFORMATION_PATHS,
  type PagePath,
  SITE_NAME,
  SOCIAL_IMAGE,
} from "./site";

/** Prevent script termination if future content includes user-controlled text. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function pageHead(path: PagePath, locale: Locale = "en") {
  const { title, description } = getPageMeta(path, locale);
  const url = canonicalUrl(path, locale);
  const home = canonicalUrl("/", locale);
  const isGuide = INFORMATION_PATHS.includes(path);
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      "@id": `${home}#website`,
      name: SITE_NAME,
      url: home,
      inLanguage: HTML_LANG[locale],
    },
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: title,
      description,
      inLanguage: HTML_LANG[locale],
      isPartOf: { "@id": `${home}#website` },
      ...(path === "/" ? {} : { breadcrumb: { "@id": `${url}#breadcrumb` } }),
      ...(isGuide ? {} : { mainEntity: { "@id": `${url}#application` } }),
    },
  ];

  if (!isGuide) {
    graph.push({
      "@type": "SoftwareApplication",
      "@id": `${url}#application`,
      name: title.split(" — ")[0],
      url,
      description,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Windows, macOS, Linux",
      browserRequirements: "Requires a modern browser with JavaScript enabled",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    });
  }
  if (path !== "/") {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: { en: "Home", zh: "首页", ja: "ホーム" }[locale],
          item: home,
        },
        { "@type": "ListItem", position: 2, name: title.split(" — ")[0], item: url },
      ],
    });
  }

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: OG_LOCALE[locale] },
      { property: "og:url", content: url },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: SOCIAL_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: title,
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: SOCIAL_IMAGE },
      { name: "twitter:image:alt", content: title },
    ],
    links: [
      { rel: "canonical", href: url },
      ...LOCALES.map((language) => ({
        rel: "alternate",
        hrefLang: HTML_LANG[language],
        href: canonicalUrl(path, language),
      })),
      { rel: "alternate", hrefLang: "x-default", href: canonicalUrl(path) },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: serializeJsonLd({ "@context": "https://schema.org", "@graph": graph }),
      },
    ],
  };
}
