import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/content/pages/plist-viewer";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/plist-viewer")({
  head: ({ match }) => pageHead("/plist-viewer", match.context.locale),
  component: Page,
});
