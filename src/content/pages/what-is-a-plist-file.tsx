import { ToolPage } from "@/components/site/ToolPage";

export function Page() {
  return (
    <ToolPage
      h1="What is a .plist file?"
      tagline="A property list is Apple's standard serialization format for structured settings — app metadata, user defaults, entitlements and configuration profiles. Open one below to see how it is built."
      bullets={[
        "Three storage formats",
        "Typed keys and values",
        "Used across macOS and iOS",
        "Open yours below",
      ]}
      sections={[
        {
          heading: "The short answer",
          body: (
            <p>
              A property list — .plist for short — is Apple's standard file format for storing
              structured data: a dictionary of keys and typed values. It is the same format Apple's
              own frameworks use everywhere, described in Apple's Property List Programming Guide.
              Every macOS and iOS app ships one as its Info.plist, user defaults (the{" "}
              <code className="font-mono text-foreground">defaults</code> system) live in plist
              files under ~/Library/Preferences, and launchd jobs, entitlements and configuration
              profiles are all property lists.
            </p>
          ),
        },
        {
          heading: "The seven property list types",
          body: (
            <>
              <p>
                Apple's documentation defines a closed set of primitive types. In Core Foundation
                they map to CF types; in Foundation, to NS classes:
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <strong className="text-foreground">string</strong> (CFString / NSString) — text,
                  stored as UTF-8.
                </li>
                <li>
                  <strong className="text-foreground">integer</strong> and{" "}
                  <strong className="text-foreground">real</strong> (CFNumber / NSNumber) — whole
                  numbers and floating point, and they are <em>different</em> types.
                </li>
                <li>
                  <strong className="text-foreground">boolean</strong> — true / false.
                </li>
                <li>
                  <strong className="text-foreground">date</strong> (CFDate / NSDate) — a timestamp.
                </li>
                <li>
                  <strong className="text-foreground">data</strong> (CFData / NSData) — raw binary,
                  shown Base64-encoded in XML.
                </li>
                <li>
                  <strong className="text-foreground">array</strong> and{" "}
                  <strong className="text-foreground">dictionary</strong> (CFArray / NSArray,
                  CFDictionary / NSDictionary) — ordered lists and ordered key/value maps that can
                  nest to any depth.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "XML vs binary vs OpenStep",
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-foreground">XML (xml1)</strong> — human-readable markup
                starting with {"<?xml"}, conforming to Apple's PropertyList-1.0 DTD. This is what
                you normally see in a source repository.
              </li>
              <li>
                <strong className="text-foreground">Binary (binary1)</strong> — a compact encoding
                starting with the bytes bplist00; smaller and faster to parse, but unreadable in a
                text editor. macOS writes user defaults and many system files in this format.
              </li>
              <li>
                <strong className="text-foreground">OpenStep / ASCII</strong> — the older{" "}
                {'{ Key = "Value"; }'} style, still used by .strings localization files and readable
                by Apple's APIs for compatibility.
              </li>
            </ul>
          ),
        },
        {
          heading: "How Apple tools convert between them",
          body: (
            <p>
              On a Mac, <code className="font-mono text-foreground">plutil -convert xml1</code> and{" "}
              <code className="font-mono text-foreground">plutil -convert binary1</code> convert a
              plist between formats, and{" "}
              <code className="font-mono text-foreground">plutil -lint</code> validates it. In code,
              NSPropertyListSerialization (Swift) or CFPropertyList (Core Foundation) read and write
              all three formats. This editor does the same job in the browser: drop a file above and
              download it back as XML, binary or JSON.
            </p>
          ),
        },
        {
          heading: "Why types matter",
          body: (
            <p>
              A property list records whether 1 is an integer, a real or a string, and keeps
              dictionary keys in their written order. Tools that convert through generic JSON
              objects lose that distinction and reorder keys, which produces noisy diffs and
              occasionally broken builds — Xcode will happily reject an Info.plist where a
              CFBundleVersion drifted from string to real. This editor preserves both.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "What opens a .plist file?",
          a: "Xcode's Property List Editor on macOS, a text editor for XML plists, plutil on the command line, or this browser editor for all three formats on any operating system.",
        },
        {
          q: "Can I convert a plist to JSON?",
          a: "Yes, though dates, data and the integer/real distinction do not survive JSON, which only knows one number type.",
        },
        {
          q: "Is a .mobileconfig a plist?",
          a: "Yes — Apple configuration profiles are property lists with a defined set of payload keys, optionally wrapped in a CMS signature.",
        },
        {
          q: "How do I validate a plist on a Mac?",
          a: "Run plutil -lint file.plist. In this editor, invalid files are rejected with the exact offset of the problem.",
        },
      ]}
      related={[
        { to: "/plist-viewer", label: "Plist viewer" },
        { to: "/xml-vs-binary-plist", label: "XML vs binary plist" },
        { to: "/how-to-open-plist-on-windows", label: "Open a plist on Windows" },
        { to: "/plist-to-json", label: "Plist to JSON" },
      ]}
    />
  );
}
