import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/content/pages/entitlements-editor";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/entitlements-editor")({
  head: ({ match }) => pageHead("/entitlements-editor", match.context.locale),
  component: Page,
});
