import { ToolPage } from "@/components/site/ToolPage";

export function Page() {
  return (
    <ToolPage
      conversion="binary-to-xml"
      h1="Binary Plist to XML"
      tagline="Drop a binary property list and get readable XML back — the browser equivalent of plutil -convert xml1, without macOS."
      bullets={[
        "bplist00 → XML plist",
        "Copy or download the result",
        "Inspect types before export",
        "No upload, no install",
      ]}
      sections={[
        {
          heading: "How to convert",
          body: (
            <ol className="list-decimal space-y-1.5 pl-5">
              <li>Drop your binary .plist file onto the editor above.</li>
              <li>The XML pane on the right shows the converted output immediately.</li>
              <li>Select and copy it, or click Download XML plist.</li>
            </ol>
          ),
        },
        {
          heading: "The macOS equivalent",
          body: (
            <p>
              On macOS you would run{" "}
              <code className="font-mono text-foreground">plutil -convert xml1 file.plist</code>. On
              Windows or Linux there is no built-in equivalent, which is why this page exists.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Can I convert XML back to binary?",
          a: "Yes — open any plist and choose Download → Binary plist.",
        },
        {
          q: "Does converting lose anything?",
          a: "Ordinary plist types are retained within the editor’s supported numeric range. UID values become CF$UID dictionaries in XML. Formatting and cryptographic signatures are not preserved; keep the original.",
        },
      ]}
      related={[
        { to: "/binary-plist-viewer", label: "Binary plist viewer" },
        { to: "/plist-to-xml", label: "Plist to XML" },
        { to: "/plist-to-json", label: "Plist to JSON" },
      ]}
    />
  );
}
