import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/content/pages/xml-vs-binary-plist";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/xml-vs-binary-plist")({
  head: ({ match }) => pageHead("/xml-vs-binary-plist", match.context.locale),
  component: Page,
});
