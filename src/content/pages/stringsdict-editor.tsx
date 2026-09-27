import { ToolPage } from "@/components/site/ToolPage";

export function Page() {
  return (
    <ToolPage
      h1=".stringsdict Editor"
      tagline="Open a .stringsdict file, edit plural rules for every language, catch broken format specs before runtime, and download a clean plist with key order and types preserved."
      loc="stringsdict"
      bullets={[
        "Plural categories validated",
        "Format-spec structure checked",
        "Key order preserved",
        "Never uploaded",
      ]}
      sections={[
        {
          heading: "What gets checked",
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Each entry has an NSStringLocalizedFormatKey and at least one variable dictionary
              </li>
              <li>
                Every variable declares NSStringFormatSpecTypeKey: NSStringPluralRuleType and an
                NSStringFormatValueTypeKey
              </li>
              <li>Plural categories are valid CLDR forms: zero, one, two, few, many, other</li>
              <li>
                Plural forms are strings; the %#@variable@ placeholder in the format key matches a
                declared variable
              </li>
            </ul>
          ),
        },
        {
          heading: "About the .stringsdict format",
          body: (
            <p>
              A .stringsdict file is an XML or binary property list that teaches iOS and macOS how
              to pluralize a string. Each entry pairs an <code>NSStringLocalizedFormatKey</code>{" "}
              like <code>%#@files@</code> with a variable dictionary declaring{" "}
              <code>NSStringPluralRuleType</code> and the CLDR plural categories your language needs
              — English uses <em>one</em> and <em>other</em>, Russian needs <em>few</em> and{" "}
              <em>many</em> too. At runtime, <code>String.localizedStringWithFormat</code> picks the
              right form for the number. Because it is a property list, this editor opens it in the
              same tree view as any plist, validates the plural structure, and preserves your key
              order and value types on download.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Do I still need a .strings file alongside .stringsdict?",
          a: "Yes — .stringsdict only covers pluralized entries. Ordinary keys stay in Localizable.strings.",
        },
        {
          q: "Which plural categories does my language need?",
          a: "That comes from the Unicode CLDR rules. English needs one/other; Arabic uses all six. This editor flags unknown categories but doesn't tell you which your language requires — check the CLDR plural rules chart.",
        },
        { q: "Is my file uploaded anywhere?", a: "No. Everything runs locally in your browser." },
      ]}
      related={[
        { to: "/strings-editor", label: ".strings editor" },
        { to: "/plist-editor", label: "Plist editor" },
        { to: "/plist-viewer", label: "Plist viewer" },
        { to: "/what-is-a-plist-file", label: "What is a .plist file?" },
      ]}
    />
  );
}
