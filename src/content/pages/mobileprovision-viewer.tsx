import { ProvisioningGuide } from "@/components/site/SigningGuides";
import { ToolPage } from "@/components/site/ToolPage";

export function Page() {
  return (
    <ToolPage
      h1="Mobileprovision Viewer & Editor"
      tagline="Drop a .mobileprovision or .provisionprofile to see its type, expiry date, team, App ID, devices, signing certificates and entitlements — with problems flagged."
      kind="provision"
      sectionWidgets={{ 0: <ProvisioningGuide /> }}
      bullets={[
        "Reads signed profiles",
        "Expiry & device checks",
        "Extract entitlements",
        "Never uploaded",
      ]}
      sections={[
        {
          heading: "What gets checked",
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Expired, or expiring within 30 days</li>
              <li>
                Required keys present with the right types (UUID, TeamIdentifier,
                DeveloperCertificates…)
              </li>
              <li>Profile type: Development, Ad Hoc, App Store or Enterprise</li>
              <li>Duplicate devices, empty certificate list</li>
              <li>The embedded entitlements, including App ID and Team ID mismatch</li>
            </ul>
          ),
        },
        {
          heading: "About editing",
          body: (
            <p>
              Provisioning profiles are signed by Apple. You can edit and download the contents to
              inspect or diff them, but Xcode and devices only accept the original signed file. Use
              "Extract entitlements" to inspect the profile's allowed capabilities. Review them
              against your app's needs before using them in an Xcode project.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Where do I find my provisioning profiles?",
          a: "On macOS they live in ~/Library/MobileDevice/Provisioning Profiles (or ~/Library/Developer/Xcode/UserData/Provisioning Profiles in newer Xcode). Inside an .ipa, look for embedded.mobileprovision.",
        },
        {
          q: "Is the signature verified?",
          a: "No — the signer names are shown and the contents are read, but the certificate chain is not checked.",
        },
        { q: "Is my profile uploaded?", a: "No. Everything runs locally in your browser." },
      ]}
      related={[
        { to: "/entitlements-editor", label: "Entitlements editor" },
        { to: "/mobileconfig-editor", label: "Mobileconfig editor" },
        { to: "/xcconfig-editor", label: "xcconfig editor" },
        { to: "/plist-viewer", label: "Plist viewer" },
      ]}
    />
  );
}
