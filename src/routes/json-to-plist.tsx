import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/content/pages/json-to-plist";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/json-to-plist")({
  head: ({ match }) => pageHead("/json-to-plist", match.context.locale),
  component: Page,
});
