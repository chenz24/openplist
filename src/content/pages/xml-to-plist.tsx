import { ToolPage } from "@/components/site/ToolPage";

export function Page() {
  return (
    <ToolPage
      h1="XML to Plist"
      tagline="Paste XML property list markup to check it parses, inspect it as a tree, and export it as a binary plist or JSON."
      bullets={["Instant parse errors", "Tree inspection", "Binary or JSON export", "Local only"]}
      sections={[
        {
          heading: "A quick validity check",
          body: (
            <p>
              If the XML is malformed or a value element is misplaced, the source pane reports it as
              you type instead of failing later in a build or at app launch.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Why would I want a binary plist?",
          a: "Binary plists are smaller and load faster; some Apple tooling and runtime caches expect them.",
        },
      ]}
      related={[
        { to: "/plist-to-xml", label: "Plist to XML" },
        { to: "/json-to-plist", label: "JSON to plist" },
        { to: "/plist-editor", label: "Plist editor" },
      ]}
    />
  );
}
