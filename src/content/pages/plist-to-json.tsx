import { ToolPage } from "@/components/site/ToolPage";

export function Page() {
  return (
    <ToolPage
      conversion="plist-to-json"
      h1="Plist to JSON"
      tagline="Convert any property list — XML, binary or OpenStep — to clean, indented JSON you can paste straight into code."
      bullets={[
        "Binary plists supported",
        "Indented JSON output",
        "Copy or download",
        "Runs in your browser",
      ]}
      editorTab="json"
      sections={[
        {
          heading: "How types are mapped",
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>string, integer, real and boolean map to their JSON equivalents</li>
              <li>date becomes an ISO 8601 string</li>
              <li>data becomes a base64 string</li>
              <li>
                dict and array become objects and arrays; duplicate dictionary keys collapse and
                numeric-looking keys may reorder
              </li>
            </ul>
          ),
        },
        {
          heading: "Careful with round-trips",
          body: (
            <p>
              JSON has no separate integer and real types and no date or data type, so converting to
              JSON and back is lossy by nature. If you need to edit a plist and keep it a plist,
              edit it in the tree and download it as XML or binary instead.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Does it handle binary plists?",
          a: "Yes — many converters only accept XML. Binary bplist00 files work here too.",
        },
        { q: "Can I go the other way?", a: "Yes, use the JSON to Plist page." },
      ]}
      related={[
        { to: "/json-to-plist", label: "JSON to plist" },
        { to: "/binary-plist-to-xml", label: "Binary plist to XML" },
        { to: "/plist-viewer", label: "Plist viewer" },
      ]}
    />
  );
}
