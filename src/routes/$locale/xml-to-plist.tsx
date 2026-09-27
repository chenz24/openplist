import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/content/pages/xml-to-plist";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/$locale/xml-to-plist")({
  head: ({ match }) => pageHead("/xml-to-plist", match.context.locale),
  component: Page,
});
