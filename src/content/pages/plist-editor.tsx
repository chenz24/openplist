import { ToolPage } from "@/components/site/ToolPage";

export function Page() {
  return (
    <ToolPage
      h1="Plist Editor"
      tagline="Edit property lists in an Xcode-style key / value tree — add, rename, retype and delete entries, then save as XML or binary."
      bullets={[
        "Inline tree editing",
        "Change a value's type safely",
        "Diff-friendly output",
        "No Xcode, no install",
      ]}
      sections={[
        {
          heading: "Diff-friendly by design",
          body: (
            <p>
              Keys stay in the order they were written, and types are never guessed on save: an
              integer stays an integer, a real stays a real, and dates and data blobs keep their own
              tags. Export regenerates the file, so formatting and whitespace may change, and source
              comments are not preserved. Review the diff before replacing the original.
            </p>
          ),
        },
        {
          heading: "Typical edits",
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Bump CFBundleShortVersionString in an Info.plist</li>
              <li>Add a usage-description key required by App Review</li>
              <li>Toggle a boolean in a preferences or LaunchAgent plist</li>
              <li>Fix a value inside an OpenCore config.plist</li>
            </ul>
          ),
        },
      ]}
      faq={[
        {
          q: "Can I create a plist from scratch?",
          a: "Yes — click New for an empty dictionary, then add keys with the plus button on any container row.",
        },
        {
          q: "Can I edit the raw XML?",
          a: "Yes. The source pane is editable and the tree updates as you type; invalid XML is reported instead of silently discarded.",
        },
      ]}
      related={[
        { to: "/binary-plist-editor", label: "Binary plist editor" },
        { to: "/plist-viewer", label: "Plist viewer" },
        { to: "/plist-to-json", label: "Plist to JSON" },
      ]}
    />
  );
}
