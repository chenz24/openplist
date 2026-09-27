import { ToolPage } from "@/components/site/ToolPage";

export function Page() {
  return (
    <ToolPage
      h1="Plist to XML"
      tagline="Turn any property list — binary, OpenStep or already-XML — into standard, tab-indented XML plist output."
      bullets={[
        "Any input format",
        "Apple-style formatting",
        "Types preserved",
        "Nothing uploaded",
      ]}
      sections={[
        {
          heading: "Output format",
          body: (
            <p>
              The result uses the standard XML declaration and Apple DTD, tab indentation and the
              same element names Xcode writes. Export normalizes formatting and does not preserve
              source comments, so review the diff before replacing a file in your repository.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Is OpenStep input supported?",
          a: 'Yes — the older { Key = "Value"; } format and .strings files are parsed too.',
        },
      ]}
      related={[
        { to: "/xml-to-plist", label: "XML to plist" },
        { to: "/binary-plist-to-xml", label: "Binary plist to XML" },
        { to: "/plist-editor", label: "Plist editor" },
      ]}
    />
  );
}
