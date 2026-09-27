import { lazy, Suspense } from "react";
import { useLocale, useT } from "@/lib/i18n";

const ProfileAnalyzer = lazy(() =>
  import("@/components/plist/ProfileAnalyzer").then((m) => ({ default: m.ProfileAnalyzer })),
);

import { ToolPage } from "@/components/site/ToolPage";

export function Page() {
  const locale = useLocale();
  const t = useT();
  return (
    <ToolPage
      h1="Mobileconfig Viewer & Editor"
      tagline="Open any .mobileconfig configuration profile — signed or unsigned — inspect every payload, fix mistakes, validate the structure and download a clean profile."
      profile
      bullets={[
        "Reads signed profiles",
        "Structure validation",
        "Edit payloads in a tree",
        "Never uploaded",
      ]}
      sectionWidgets={{
        [locale === "en" ? 0 : 2]: (
          <Suspense fallback={<p role="status">{t.loading_review()}</p>}>
            <ProfileAnalyzer />
          </Suspense>
        ),
      }}
      sections={[
        {
          heading: "AI profile explainer & security check",
          body: (
            <>
              <p className="mb-3">
                Paste a profile or pick a file to get a plain-English explanation of every payload
                and a list of potential security risks — trusted root certificates, VPN and proxy
                routing, MDM enrollment rights, non-removable profiles and more.
              </p>
            </>
          ),
        },
        {
          heading: "What gets validated",
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Top-level PayloadType is Configuration, with PayloadContent as an array</li>
              <li>
                Every payload has PayloadType, PayloadIdentifier, PayloadUUID and PayloadVersion
                with the right types
              </li>
              <li>No duplicate PayloadUUID or PayloadIdentifier across the profile</li>
              <li>UUID format, PayloadScope values, expiration date in the past</li>
            </ul>
          ),
        },
        {
          heading: "Signed profiles",
          body: (
            <p>
              Profiles exported from Apple Configurator or an MDM are often signed. openplist.com
              unwraps the signature to show the profile inside and lists the certificate names. Any
              edit invalidates the signature, so downloaded profiles are unsigned — re-sign them
              with your own certificate before distributing.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Can I create a new configuration profile?",
          a: "Yes. Click New profile for a starter profile with a Wi-Fi payload and fresh UUIDs, then edit or add payloads.",
        },
        {
          q: "Is my profile uploaded anywhere?",
          a: "Viewing, editing and exporting stay in your browser. Only when you explicitly request AI review is redacted profile content sent to the configured AI provider.",
        },
        {
          q: "Does it verify the signature?",
          a: "No — it shows the signer certificate names and the content, but does not check the certificate chain.",
        },
      ]}
      related={[
        { to: "/plist-editor", label: "Plist editor" },
        { to: "/plist-viewer", label: "Plist viewer" },
        { to: "/what-is-a-plist-file", label: "What is a .plist file?" },
      ]}
    />
  );
}
