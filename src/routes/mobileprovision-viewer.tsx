import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/content/pages/mobileprovision-viewer";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/mobileprovision-viewer")({
  head: ({ match }) => pageHead("/mobileprovision-viewer", match.context.locale),
  component: Page,
});
