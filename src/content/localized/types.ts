import type { PagePath } from "@/lib/site";

export interface LocalizedPage {
  title: string;
  description: string;
  h1: string;
  tagline: string;
  bullets: string[];
  sections: { heading: string; body: string }[];
  faq: { q: string; a: string }[];
}
export type PageCatalog = Record<PagePath, LocalizedPage>;
