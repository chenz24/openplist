import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/content/pages/how-to-open-plist-on-windows";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/how-to-open-plist-on-windows")({
  head: ({ match }) => pageHead("/how-to-open-plist-on-windows", match.context.locale),
  component: Page,
});
