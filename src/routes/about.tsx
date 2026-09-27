import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: ({ match }) => pageHead("/about", match.context.locale),
  component: () => <InfoPage path="/about" />,
});
