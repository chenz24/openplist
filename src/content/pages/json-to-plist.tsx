import { ToolPage } from "@/components/site/ToolPage";

export function Page() {
  return (
    <ToolPage
      conversion="json-to-plist"
      h1="JSON to Plist"
      tagline="Paste or open JSON and get a valid Apple property list back — as XML or as binary — with every value's type visible before you save."
      bullets={[
        "JSON in, plist out",
        "Fix types in the tree",
        "XML or binary download",
        "Browser-only",
      ]}
      editorTab="xml"
      sections={[
        {
          heading: "How to use it",
          body: (
            <ol className="list-decimal space-y-1.5 pl-5">
              <li>
                Paste JSON into the input above, or open a .json file, then preview the conversion.
              </li>
              <li>Check the types in the tree — whole numbers become integers, others reals.</li>
              <li>
                Adjust any value that should be a date, data blob or real, then download XML. Use
                Other formats for binary output.
              </li>
            </ol>
          ),
        },
        {
          heading: "Why the type check matters",
          body: (
            <p>
              JSON cannot express the difference between{" "}
              <code className="font-mono text-foreground">{"<integer>1</integer>"}</code> and{" "}
              <code className="font-mono text-foreground">{"<real>1.0</real>"}</code>, and it has no
              date or data type at all. The tree lets you set the right plist type per key before
              exporting.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Will key order be kept?",
          a: "Ordinary unique keys follow JavaScript object order. Numeric-looking keys may reorder, and duplicate JSON keys collapse during parsing. Keep the source if those distinctions matter.",
        },
        { q: "Can I output a binary plist?", a: "Yes, choose Download → Binary plist." },
      ]}
      related={[
        { to: "/plist-to-json", label: "Plist to JSON" },
        { to: "/xml-to-plist", label: "XML to plist" },
        { to: "/plist-editor", label: "Plist editor" },
      ]}
    />
  );
}
