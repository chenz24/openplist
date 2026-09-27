import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: ({ match }) => pageHead("/privacy", match.context.locale),
  component: () => <InfoPage path="/privacy" />,
});
