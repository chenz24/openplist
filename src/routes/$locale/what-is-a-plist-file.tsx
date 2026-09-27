import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/content/pages/what-is-a-plist-file";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/$locale/what-is-a-plist-file")({
  head: ({ match }) => pageHead("/what-is-a-plist-file", match.context.locale),
  component: Page,
});
