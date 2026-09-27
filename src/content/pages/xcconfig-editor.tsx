import { ToolPage } from "@/components/site/ToolPage";
import { XcconfigEditor } from "@/components/xcconfig/XcconfigEditor";

export function Page() {
  return (
    <ToolPage
      h1="xcconfig Editor"
      tagline="Open an Xcode build configuration file, edit settings in a table or as text, catch mistakes before the build breaks, and download it with comments, includes and line order untouched."
      bullets={[
        "Checks syntax & values",
        "Flags risky settings",
        "Comments & order preserved",
        "Never uploaded",
      ]}
      editor={<XcconfigEditor />}
      sections={[
        {
          heading: "What gets checked",
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Every line is a KEY = value setting, a {"//"} comment or an #include / #include?
                directive
              </li>
              <li>
                Conditions use Xcode's sdk, arch and config keys, e.g. [sdk=iphoneos*] or
                [config=Release]
              </li>
              <li>
                Balanced $(VARIABLE) references; duplicate settings that silently override earlier
                ones
              </li>
              <li>
                YES/NO settings, deployment targets and SWIFT_VERSION hold valid values;
                DEVELOPMENT_TEAM is a 10-character Team ID
              </li>
              <li>
                Risky settings: code signing or Hardened Runtime turned off, unsandboxed build
                scripts, deprecated Bitcode, testability or DEBUG=1 in Release
              </li>
              <li>
                Keys that look like secrets (API keys, passwords, tokens) stored in plain text
              </li>
            </ul>
          ),
        },
        {
          heading: "What an .xcconfig file is",
          body: (
            <p>
              An Xcode configuration settings file is a plain-text file of build settings that a
              target or project configuration can be based on. Unlike Info.plist or .entitlements it
              is not a property list, so it is kept line-by-line here: your comments, blank lines
              and include order stay exactly as written.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Are $(inherited) and other variables supported?",
          a: "Yes. Variable references are kept as-is and only checked for balanced parentheses.",
        },
        {
          q: "Are included files resolved?",
          a: "No — only the file you open is read. #include lines are checked for syntax and shown in the table.",
        },
        { q: "Is my file uploaded?", a: "No. Everything runs locally in your browser." },
      ]}
      related={[
        { to: "/entitlements-editor", label: "Entitlements editor" },
        { to: "/mobileprovision-viewer", label: "Provisioning profile viewer" },
        { to: "/mobileconfig-editor", label: "Mobileconfig editor" },
      ]}
    />
  );
}
