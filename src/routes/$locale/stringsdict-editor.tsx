import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/content/pages/stringsdict-editor";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/$locale/stringsdict-editor")({
  head: ({ match }) => pageHead("/stringsdict-editor", match.context.locale),
  component: Page,
});
