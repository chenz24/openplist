import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/content/pages/strings-editor";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/strings-editor")({
  head: ({ match }) => pageHead("/strings-editor", match.context.locale),
  component: Page,
});
