import { createFileRoute } from "@tanstack/react-router";
import { Index } from "@/content/pages/index";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: ({ match }) => pageHead("/", match.context.locale),
  component: Index,
});
