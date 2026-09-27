import { DataConverter } from "@/components/plist/DataConverter";
import { ToolPage } from "@/components/site/ToolPage";
import { useLocale } from "@/lib/i18n";

export function Page() {
  const locale = useLocale();
  return (
    <ToolPage
      h1="OpenCore config.plist Editor"
      tagline="Drop your EFI/OC/config.plist to view and edit it in a tree, catch the mistakes that stop a Hackintosh from booting, and download it with key order and data types untouched."
      kind="opencore"
      bullets={["Drag & drop", "Validates OpenCore schema", "Base64 ⇄ Hex", "Never uploaded"]}
      sectionWidgets={{ [locale === "en" ? 0 : 1]: <DataConverter /> }}
      sections={[
        {
          heading: "Base64 ⇄ Hex converter",
          body: (
            <>
              <p>
                Guides such as Dortania list values like AAPL,ig-platform-id in hex, while the XML
                file stores them as Base64. Convert here, or type a hex value straight into a data
                field in the tree as <code className="font-mono text-foreground">0x07009B3E</code>{" "}
                or <code className="font-mono text-foreground">&lt;07009B3E&gt;</code>.
              </p>
            </>
          ),
        },
        {
          heading: "What gets checked",
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                All eight top-level sections exist and are dictionaries: ACPI, Booter,
                DeviceProperties, Kernel, Misc, NVRAM, PlatformInfo, UEFI
              </li>
              <li>
                Entries in ACPI, Booter and Kernel lists, and in Misc › Tools and UEFI › Drivers,
                have the required fields with the right types; MinKernel/MaxKernel are Darwin
                versions
              </li>
              <li>
                Lilu.kext is loaded before its plugins (WhateverGreen, VirtualSMC, AppleALC…);
                duplicate kexts, SSDTs and drivers
              </li>
              <li>Patch Find/Replace lengths match; Mask/ReplaceMask lengths are valid</li>
              <li>UEFI › Drivers use the dictionary format and include OpenRuntime.efi</li>
              <li>SMBIOS: sample serial, MLB, UUID or ROM left in place; ROM is 6 bytes</li>
              <li>
                Security: Vault, DmgLoading and SecureBootModel values; SIP (csr-active-config) and
                boot-args that weaken security
              </li>
              <li>
                Leftover #WARNING keys from Sample.plist; DeviceProperties keys that aren't PCI
                paths
              </li>
            </ul>
          ),
        },
      ]}
      faq={[
        {
          q: "Does this replace ocvalidate?",
          a: "No. It catches common mistakes instantly in the browser, but ocvalidate from your exact OpenCore release is still the reference check.",
        },
        {
          q: "Is my serial number uploaded?",
          a: "No. The file is read and edited locally in your browser, so SMBIOS values never leave your computer.",
        },
        {
          q: "Does it work on Windows?",
          a: "Yes — any modern browser on Windows, Linux or macOS, with no ProperTree or Python install.",
        },
      ]}
      related={[
        { to: "/plist-editor", label: "Plist editor" },
        { to: "/how-to-open-plist-on-windows", label: "Open a plist on Windows" },
        { to: "/xcconfig-editor", label: "xcconfig editor" },
      ]}
    />
  );
}
