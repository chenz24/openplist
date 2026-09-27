import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/content/pages/binary-plist-viewer";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/binary-plist-viewer")({
  head: ({ match }) => pageHead("/binary-plist-viewer", match.context.locale),
  component: Page,
});
