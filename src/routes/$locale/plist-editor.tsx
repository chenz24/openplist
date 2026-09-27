import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/content/pages/plist-editor";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/$locale/plist-editor")({
  head: ({ match }) => pageHead("/plist-editor", match.context.locale),
  component: Page,
});
