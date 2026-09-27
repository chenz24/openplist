import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/content/pages/binary-plist-editor";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/$locale/binary-plist-editor")({
  head: ({ match }) => pageHead("/binary-plist-editor", match.context.locale),
  component: Page,
});
