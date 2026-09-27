import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/content/pages/binary-plist-to-xml";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/binary-plist-to-xml")({
  head: ({ match }) => pageHead("/binary-plist-to-xml", match.context.locale),
  component: Page,
});
