import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/content/pages/plist-to-xml";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/plist-to-xml")({
  head: ({ match }) => pageHead("/plist-to-xml", match.context.locale),
  component: Page,
});
