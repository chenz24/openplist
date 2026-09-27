import { ToolPage } from "@/components/site/ToolPage";

export function Page() {
  return (
    <ToolPage
      h1="Plist Viewer"
      tagline="Drop a .plist file and read it as a clean key / type / value tree, or as formatted XML and JSON."
      bullets={[
        "XML, binary and OpenStep",
        "Tree and source view",
        "Search keys and values",
        "Nothing is uploaded",
      ]}
      sections={[
        {
          heading: "Why a .plist file looks like garbage when you open it",
          body: (
            <p>
              A property list can be stored as XML or as a compact binary format. Binary plists
              start with the bytes <code className="font-mono text-foreground">bplist00</code>, and
              a text editor will show them as unreadable characters. This viewer detects the format
              and renders either one as a readable tree.
            </p>
          ),
        },
        {
          heading: "Finding a key quickly",
          body: (
            <p>
              Use the search box in the toolbar to highlight every key or value matching your text —
              handy in large Info.plist or OpenCore config.plist files.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Can I edit the file too?",
          a: "Yes — every row is editable, and you can download the result as XML, binary or JSON.",
        },
        {
          q: "Is there a size limit?",
          a: "There is no fixed upload limit because files are processed locally. Practical limits depend on file size, nesting depth, browser memory and device speed; large files may be slow.",
        },
      ]}
      related={[
        { to: "/plist-editor", label: "Plist editor" },
        { to: "/binary-plist-viewer", label: "Binary plist viewer" },
        { to: "/what-is-a-plist-file", label: "What is a plist file?" },
      ]}
    />
  );
}
