import { ToolPage } from "@/components/site/ToolPage";

export function Index() {
  return (
    <ToolPage
      h1="Plist Viewer & Editor"
      tagline="Open, view and edit XML, binary and OpenStep plist files directly in your browser. Works on Windows, macOS and Linux — no Xcode, no install, no upload."
      bullets={[
        "XML, binary (bplist00) and OpenStep",
        "Edit in tree or source view",
        "Key order and value types preserved",
        "Local parsing, editing and export",
      ]}
      sections={[
        {
          heading: "What this editor does differently",
          body: (
            <>
              <p>
                Property lists distinguish integers, real numbers, dates and binary data. A plain
                JSON conversion cannot preserve all of these types. This editor keeps an explicit
                type for each value and preserves dictionary key order.
              </p>
              <p>
                This editor preserves value types and dictionary key order in its data model. Export
                regenerates the file, so formatting and whitespace may change, and source comments
                are not preserved.
              </p>
            </>
          ),
        },
        {
          heading: "Tree view and source view, side by side",
          body: (
            <p>
              Edit keys, values and types in the tree on the left, or type directly into the XML or
              JSON source on the right. Both views stay in sync, and you can download the result as
              an XML plist, a binary plist or JSON.
            </p>
          ),
        },
        {
          heading: "Formats it understands",
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>XML property lists (the familiar {'<plist version="1.0">'} files)</li>
              <li>Binary property lists starting with the bplist00 magic bytes</li>
              <li>OpenStep / ASCII plists and .strings files</li>
              <li>Info.plist, entitlements, preferences and OpenCore config.plist</li>
            </ul>
          ),
        },
      ]}
      faq={[
        {
          q: "Are my files uploaded anywhere?",
          a: "Parsing, editing and export run locally in your browser. Optional AI profile review sends redacted content only when you explicitly request it.",
        },
        {
          q: "Can it open binary plist files?",
          a: "Yes. Binary plists are detected automatically and shown as a readable tree, and you can save them back out as XML, binary or JSON.",
        },
        {
          q: "Do I need Xcode?",
          a: "No. That is the point — this works the same on Windows, Linux and macOS in any modern browser.",
        },
      ]}
      related={[
        { to: "/binary-plist-viewer", label: "Binary plist viewer" },
        { to: "/binary-plist-to-xml", label: "Binary plist to XML" },
        { to: "/plist-to-json", label: "Plist to JSON" },
        { to: "/how-to-open-plist-on-windows", label: "Open a plist on Windows" },
      ]}
    />
  );
}
