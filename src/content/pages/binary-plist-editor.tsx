import { ToolPage } from "@/components/site/ToolPage";

export function Page() {
  return (
    <ToolPage
      h1="Binary Plist Editor"
      tagline="Open a bplist00 file, change what you need in a key / value tree, and write it straight back out as binary — or as XML if you prefer a readable file."
      bullets={[
        "Decode and re-encode bplist00",
        "Type-safe editing",
        "Save as binary, XML or JSON",
        "Entirely offline in your browser",
      ]}
      sections={[
        {
          heading: "Round-trip without surprises",
          body: (
            <p>
              The file is decoded into a typed model, so re-encoding keeps integers, reals, dates,
              data blobs and dictionary order intact. Only what you edit changes.
            </p>
          ),
        },
        {
          heading: "When you would use this",
          body: (
            <p>
              Preferences files under Library/Preferences, cached app configuration, game save
              settings and iOS backup artefacts are usually binary. Editing them normally means
              macOS plus plutil or Xcode; here it is a drag and drop.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Will macOS still read the file I save?",
          a: "Yes — the output is a standard bplist00 file with the same structure Apple's own tools write.",
        },
        {
          q: "Can I convert it to XML instead?",
          a: "Yes, choose Download → XML plist, or use the dedicated binary-to-XML page.",
        },
      ]}
      related={[
        { to: "/binary-plist-viewer", label: "Binary plist viewer" },
        { to: "/binary-plist-to-xml", label: "Binary plist to XML" },
        { to: "/plist-editor", label: "Plist editor" },
      ]}
    />
  );
}
