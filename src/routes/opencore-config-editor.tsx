import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/content/pages/opencore-config-editor";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/opencore-config-editor")({
  head: ({ match }) => pageHead("/opencore-config-editor", match.context.locale),
  component: Page,
});
