import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/content/pages/mobileconfig-editor";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/mobileconfig-editor")({
  head: ({ match }) => pageHead("/mobileconfig-editor", match.context.locale),
  component: Page,
});
