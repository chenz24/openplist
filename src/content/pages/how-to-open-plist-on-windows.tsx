import { ToolPage } from "@/components/site/ToolPage";

export function Page() {
  return (
    <ToolPage
      h1="How to open a .plist file on Windows"
      tagline="Windows has no built-in property list support, and binary plists look like gibberish in Notepad. Drop the file below to read and edit it right away."
      bullets={[
        "Works with binary plists",
        "No install, no Xcode",
        "Edit and save back",
        "Nothing uploaded",
      ]}
      sections={[
        {
          heading: "Option 1 — open it here",
          body: (
            <ol className="list-decimal space-y-1.5 pl-5">
              <li>Drop the .plist file onto the editor above.</li>
              <li>Read it as a key / type / value tree, or as XML on the right.</li>
              <li>Edit any value, then use Download to save it as XML or binary.</li>
            </ol>
          ),
        },
        {
          heading: "First, check which format you have",
          body: (
            <p>
              Apple property lists come in two common serializations. If the file starts with{" "}
              <code className="font-mono text-foreground">{"<?xml"}</code> and mentions the
              PropertyList-1.0 DTD, it is an XML plist (Apple calls this format{" "}
              <code className="font-mono text-foreground">xml1</code>). If the first bytes are{" "}
              <code className="font-mono text-foreground">bplist00</code> followed by unreadable
              symbols, it is a binary plist (
              <code className="font-mono text-foreground">binary1</code>) — a text editor cannot
              help with those.
            </p>
          ),
        },
        {
          heading: "Option 2 — a text editor (XML plists only)",
          body: (
            <p>
              XML plists open fine in Notepad, Notepad++ or VS Code. Be careful editing by hand:
              every <code className="font-mono text-foreground">&lt;key&gt;</code> must be followed
              by exactly one value element, tags are case-sensitive, and{" "}
              <code className="font-mono text-foreground">&lt;integer&gt;1&lt;/integer&gt;</code>{" "}
              and <code className="font-mono text-foreground">&lt;real&gt;1.0&lt;/real&gt;</code>{" "}
              are different types that Apple's PropertyListSerialization treats differently. A
              misplaced tag makes the whole file unreadable to macOS.
            </p>
          ),
        },
        {
          heading: "Option 3 — the command line",
          body: (
            <p>
              On a Mac you would run{" "}
              <code className="font-mono text-foreground">plutil -convert xml1 file.plist</code> to
              turn a binary plist into readable XML — but plutil does not exist on Windows. With
              Python installed, the standard library reads both formats:{" "}
              <code className="font-mono text-foreground">
                python -c "import plistlib,sys;print(plistlib.load(open(sys.argv[1],'rb')))"
                file.plist
              </code>
              . Useful in scripts, less pleasant for editing by hand — which is what the editor
              above is for.
            </p>
          ),
        },
        {
          heading: "Which files you are likely dealing with",
          body: (
            <p>
              An Info.plist or .entitlements file from an iOS or macOS project, an OpenCore
              config.plist for a Hackintosh build, a .mobileconfig configuration profile, a
              .mobileprovision provisioning profile, or user defaults copied out of
              ~/Library/Preferences on a Mac. All of them are property lists and open here,
              including signed profiles.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Is there a plist editor for Windows I need to install?",
          a: "There are desktop options, but for viewing and small edits this browser editor covers both XML and binary files with nothing to install.",
        },
        {
          q: "Will my file be uploaded?",
          a: "No. It is parsed and written entirely inside your browser — the same job plutil does on a Mac, without sending the file anywhere.",
        },
        {
          q: "Can I save it back in the original format?",
          a: "Yes — download it again as an XML plist (xml1) or a binary plist (binary1).",
        },
        {
          q: "Why does Notepad show bplist00 and garbage?",
          a: "That is a binary plist, Apple's compact serialization. Convert it to XML first — the editor above does that on open.",
        },
      ]}
      related={[
        { to: "/plist-editor", label: "Plist editor" },
        { to: "/binary-plist-viewer", label: "Binary plist viewer" },
        { to: "/what-is-a-plist-file", label: "What is a plist file?" },
        { to: "/xml-vs-binary-plist", label: "XML vs binary plist" },
      ]}
    />
  );
}
