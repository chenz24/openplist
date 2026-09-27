import { ToolPage } from "@/components/site/ToolPage";

export function Page() {
  return (
    <ToolPage
      h1=".strings File Editor"
      tagline="Open a Localizable.strings file, edit translations in a tree, catch formatting mistakes before they ship, and download a clean file with key order and quoting preserved."
      loc="strings"
      bullets={[
        "Strings, OpenStep & plist formats",
        "Duplicate-key detection",
        "Key order preserved",
        "Never uploaded",
      ]}
      sections={[
        {
          heading: "What gets checked",
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Every value is a string — .strings tables can't hold numbers, arrays or nested dicts
              </li>
              <li>Duplicate keys, which silently override earlier translations</li>
              <li>Format placeholders like %@ and %d stay intact across edits</li>
              <li>
                Files saved as XML or binary plist are still read and can be converted back to plain
                .strings
              </li>
            </ul>
          ),
        },
        {
          heading: "About the .strings format",
          body: (
            <p>
              A .strings file is Apple's classic localization format: pairs of{" "}
              <code>"key" = "value";</code> lines in OpenStep property-list syntax, one per language
              inside each <code>.lproj</code> folder. Modern Xcode projects may use String Catalogs
              (.xcstrings) instead, but .strings files still power most apps — and genstrings,
              NSLocalizedString and SwiftUI all read them at runtime. Because the format is a
              property list, this editor reads it with the same parser that handles OpenStep plists,
              keeps your key order and comments-friendly layout, and writes valid .strings output on
              download.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Can I edit a .strings file saved as a binary plist?",
          a: "Yes. Xcode sometimes stores .strings as binary plists. Open it here, edit, and download either as a plain .strings text file or back as XML/binary plist.",
        },
        {
          q: "Why must every value be a string?",
          a: "The .strings format maps keys to localized text only. Anything else is a structural error that makes NSLocalizedString return the key itself at runtime.",
        },
        { q: "Is my file uploaded anywhere?", a: "No. Everything runs locally in your browser." },
      ]}
      related={[
        { to: "/stringsdict-editor", label: ".stringsdict editor" },
        { to: "/plist-editor", label: "Plist editor" },
        { to: "/entitlements-editor", label: "Entitlements editor" },
        { to: "/xcconfig-editor", label: "xcconfig editor" },
      ]}
    />
  );
}
