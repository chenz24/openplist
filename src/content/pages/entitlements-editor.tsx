import { EntitlementsGuide } from "@/components/site/SigningGuides";
import { ToolPage } from "@/components/site/ToolPage";

export function Page() {
  return (
    <ToolPage
      h1="Entitlements Editor"
      tagline="Open an Xcode .entitlements file, edit capabilities in a tree, catch mistakes before code signing fails, and download a clean file with key order preserved."
      kind="entitlements"
      sectionWidgets={{ 0: <EntitlementsGuide /> }}
      bullets={[
        "Checks types & values",
        "Flags risky exceptions",
        "Key order preserved",
        "Never uploaded",
      ]}
      sections={[
        {
          heading: "What gets checked",
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Boolean capabilities (sandbox, network, hardened runtime) are real booleans, not
                strings
              </li>
              <li>
                Array keys such as keychain-access-groups and application-groups contain only
                strings
              </li>
              <li>
                Associated domains carry a service prefix (applinks:, webcredentials:) and no
                http://
              </li>
              <li>
                aps-environment is development or production; get-task-allow is flagged for release
                builds
              </li>
              <li>
                Hardened-runtime exceptions like disable-library-validation are flagged as security
                risks
              </li>
              <li>Sandbox permission keys without com.apple.security.app-sandbox enabled</li>
            </ul>
          ),
        },
      ]}
      faq={[
        {
          q: "Can I check what entitlements an app was signed with?",
          a: "On macOS, run codesign --display --entitlements - --xml /path/to/App.app > app.entitlements, then open app.entitlements here. This shows the signed app's claims; the Xcode source file may contain build-setting variables instead.",
        },
        {
          q: "Are Xcode variables like $(AppIdentifierPrefix) supported?",
          a: "Yes. Build-setting variables are kept as-is and not reported as errors.",
        },
        { q: "Is my file uploaded?", a: "No. Everything runs locally in your browser." },
      ]}
      related={[
        { to: "/mobileprovision-viewer", label: "Provisioning profile viewer" },
        { to: "/mobileconfig-editor", label: "Mobileconfig editor" },
        { to: "/xcconfig-editor", label: "xcconfig editor" },
        { to: "/plist-editor", label: "Plist editor" },
      ]}
    />
  );
}
