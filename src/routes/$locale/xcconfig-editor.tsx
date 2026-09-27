import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/content/pages/xcconfig-editor";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/$locale/xcconfig-editor")({
  head: ({ match }) => pageHead("/xcconfig-editor", match.context.locale),
  component: Page,
});
