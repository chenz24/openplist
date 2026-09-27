import { ToolPage } from "@/components/site/ToolPage";

export function Page() {
  return (
    <ToolPage
      h1="XML vs binary plist"
      tagline="The same property list can be stored as human-readable XML or compact binary. The data is identical — only the serialization differs. Drop a file below to see it as XML and convert it back."
      bullets={[
        "Same data, two encodings",
        "Convert both ways",
        "Types and key order preserved",
        "Nothing uploaded",
      ]}
      sections={[
        {
          heading: "Two serializations of the same thing",
          body: (
            <p>
              Apple's Property List Programming Guide defines the property list as an abstract
              object graph — dictionaries, arrays, strings, numbers, booleans, dates and data — that
              can be serialized in more than one way. NSPropertyListSerialization names the two
              modern formats <code className="font-mono text-foreground">xml1</code> and{" "}
              <code className="font-mono text-foreground">binary1</code>. Whichever one a file uses,
              reading it produces exactly the same object graph.
            </p>
          ),
        },
        {
          heading: "XML plist (xml1)",
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Starts with {"<?xml"} and declares Apple's{" "}
                <code className="font-mono text-foreground">PropertyList-1.0.dtd</code>.
              </li>
              <li>Readable and editable in any text editor; diffs cleanly in git.</li>
              <li>
                Used for files developers maintain by hand: Info.plist in source control,
                .entitlements, most OpenCore config.plist setups.
              </li>
              <li>Larger on disk — every value carries markup around it.</li>
            </ul>
          ),
        },
        {
          heading: "Binary plist (binary1 / bplist00)",
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Starts with the magic bytes{" "}
                <code className="font-mono text-foreground">bplist00</code>, followed by an object
                table and a trailer.
              </li>
              <li>Smaller and much faster to parse — no text scanning.</li>
              <li>
                macOS writes user defaults (~/Library/Preferences), many system caches and most
                .mobileprovision profiles in binary.
              </li>
              <li>Unreadable in a text editor — you must convert it first.</li>
            </ul>
          ),
        },
        {
          heading: "How to convert between them",
          body: (
            <>
              <p>
                On a Mac, Apple's own tool is plutil:{" "}
                <code className="font-mono text-foreground">plutil -convert xml1 file.plist</code>{" "}
                turns binary into XML,{" "}
                <code className="font-mono text-foreground">
                  plutil -convert binary1 file.plist
                </code>{" "}
                goes the other way, and Xcode converts Info.plist files automatically when building.
              </p>
              <p>
                Without a Mac, use the editor above: it detects the format on open, always shows the
                file as XML, and Download saves it as either xml1 or binary1. Conversion is lossless
                — types (integer vs real, dates, data) and dictionary key order are preserved
                exactly, so a round trip produces a file Apple's tools accept.
              </p>
            </>
          ),
        },
        {
          heading: "Which should you choose?",
          body: (
            <p>
              Keep XML in source control — it diffs and reviews well. Let binary stay where the
              system put it — preferences and profiles are rewritten by macOS anyway, and parsing
              speed matters there. When you need to inspect a binary file, convert a copy to XML
              rather than editing the original by hand.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Is a binary plist a different file format?",
          a: "No — it is the same property list object graph with a different serialization. Apple's PropertyListSerialization reads both transparently.",
        },
        {
          q: "Does converting binary to XML lose anything?",
          a: "Not with a correct converter. Types and dictionary key order survive the round trip; this editor guarantees both.",
        },
        {
          q: "Why does git show my plist as binary?",
          a: "Because it is a binary1 file. Convert it to xml1 to get readable diffs.",
        },
        {
          q: "Can Xcode open binary plists?",
          a: "Yes — Xcode's Property List Editor opens both formats and can save either.",
        },
      ]}
      related={[
        { to: "/binary-plist-to-xml", label: "Binary → XML converter" },
        { to: "/xml-to-plist", label: "XML → plist converter" },
        { to: "/binary-plist-viewer", label: "Binary plist viewer" },
        { to: "/what-is-a-plist-file", label: "What is a plist file?" },
      ]}
    />
  );
}
