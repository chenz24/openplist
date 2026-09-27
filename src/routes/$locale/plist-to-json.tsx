import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/content/pages/plist-to-json";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/$locale/plist-to-json")({
  head: ({ match }) => pageHead("/plist-to-json", match.context.locale),
  component: Page,
});
