import { ToolPage } from "@/components/site/ToolPage";

export function Page() {
  return (
    <ToolPage
      h1="Binary Plist Viewer"
      tagline="Open a binary property list — the bplist00 kind your text editor shows as gibberish — and read it as a plain key / value tree."
      bullets={[
        "Full bplist00 decoding",
        "Dates, data blobs and UIDs",
        "Export to XML or JSON",
        "Runs locally",
      ]}
      sections={[
        {
          heading: "What a binary plist is",
          body: (
            <p>
              Apple stores most runtime property lists in a compact binary encoding: an object table
              plus an offset table, with the magic bytes{" "}
              <code className="font-mono text-foreground">bplist00</code> at the start. It is
              smaller and faster to read than XML, but it is not text, so Notepad, VS Code or a web
              editor show only noise.
            </p>
          ),
        },
        {
          heading: "Everything decoded, not just strings",
          body: (
            <p>
              Integers, reals, booleans, dates (stored as seconds since 2001), data blobs, UIDs,
              arrays and nested dictionaries are all decoded with their real types shown next to
              each key.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Is this the same as running plutil?",
          a: "It produces the same readable result, but you do not need macOS or a terminal — and you also get an editable tree.",
        },
        {
          q: "Can I save it back as binary?",
          a: "Yes. Choose Download → Binary plist to write a valid bplist00 file again.",
        },
      ]}
      related={[
        { to: "/binary-plist-to-xml", label: "Binary plist to XML" },
        { to: "/binary-plist-editor", label: "Binary plist editor" },
        { to: "/plist-viewer", label: "Plist viewer" },
      ]}
    />
  );
}
