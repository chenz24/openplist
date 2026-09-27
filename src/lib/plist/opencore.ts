// OpenCore (Acidanthera) config.plist detection, validation and sample.
// Rules follow the OpenCore Configuration.pdf reference for the current 0.9/1.0 schema.
import type { ProfileIssue } from "./mobileconfig";
import type { PDictEntry, PValue } from "./types";

export const OC_SECTIONS = [
  "ACPI",
  "Booter",
  "DeviceProperties",
  "Kernel",
  "Misc",
  "NVRAM",
  "PlatformInfo",
  "UEFI",
];
const APPLE_BOOT_GUID = "7C436110-AB2A-4BBB-A880-FE41995C9F82";

function get(d: PValue | undefined, key: string): PValue | undefined {
  return d?.type === "dict" ? d.value.find((e) => e.key === key)?.value : undefined;
}
const str = (v?: PValue) => (v?.type === "string" ? v.value : undefined);

export function isOpenCoreConfig(doc: PValue | null): boolean {
  if (doc?.type !== "dict") return false;
  return OC_SECTIONS.filter((s) => get(doc, s)).length >= 4;
}

export function bytesToHex(b: Uint8Array): string {
  return Array.from(b, (x) => x.toString(16).padStart(2, "0").toUpperCase()).join("");
}
export function hexToBytes(hex: string): Uint8Array {
  const h = hex.replace(/^0x/i, "").replace(/[\s<>]/g, "");
  if (!/^[0-9a-fA-F]*$/.test(h) || h.length % 2)
    throw new Error("Hex must contain an even number of 0-9 / A-F digits");
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  return out;
}

const ENTRY_ARRAYS: [string, string, Record<string, "string" | "boolean" | "data" | "integer">][] =
  [
    ["ACPI", "Add", { Enabled: "boolean", Path: "string" }],
    ["ACPI", "Delete", { Enabled: "boolean" }],
    ["ACPI", "Patch", { Enabled: "boolean", Find: "data", Replace: "data" }],
    ["Booter", "Patch", { Enabled: "boolean", Find: "data", Replace: "data", Arch: "string" }],
    [
      "Kernel",
      "Add",
      {
        Enabled: "boolean",
        BundlePath: "string",
        ExecutablePath: "string",
        PlistPath: "string",
        Arch: "string",
        MinKernel: "string",
        MaxKernel: "string",
      },
    ],
    ["Kernel", "Block", { Enabled: "boolean", Identifier: "string" }],
    ["Kernel", "Force", { Enabled: "boolean", BundlePath: "string" }],
    [
      "Kernel",
      "Patch",
      {
        Enabled: "boolean",
        Find: "data",
        Replace: "data",
        MinKernel: "string",
        MaxKernel: "string",
      },
    ],
    ["Misc", "Tools", { Enabled: "boolean", Path: "string" }],
    ["UEFI", "Drivers", { Enabled: "boolean", Path: "string" }],
  ];

const KERNEL_RE = /^(\d+(\.\d+){0,2})?$/;
const UUID_RE = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;
const PCI_RE = /^(PciRoot|PcieRoot)\(0x[0-9a-f]+\)(\/Pci\(0x[0-9a-f]+,0x[0-9a-f]+\))*$/i;
const LILU_PLUGINS = [
  "VirtualSMC",
  "WhateverGreen",
  "AppleALC",
  "SMCProcessor",
  "SMCSuperIO",
  "SMCBatteryManager",
  "RestrictEvents",
  "CPUFriend",
  "NVMeFix",
  "FeatureUnlock",
];

export function validateOpenCore(doc: PValue): ProfileIssue[] {
  const issues: ProfileIssue[] = [];
  const err = (where: string, message: string) => issues.push({ level: "error", where, message });
  const warn = (where: string, message: string) =>
    issues.push({ level: "warning", where, message });
  if (doc.type !== "dict")
    return [{ level: "error", where: "root", message: "config.plist root must be a dictionary" }];

  for (const s of OC_SECTIONS) {
    const v = get(doc, s);
    if (!v) err(s, `Missing required section ${s}`);
    else if (v.type !== "dict") err(s, `${s} must be a dictionary`);
  }

  // Leftover sample comment keys ("#WARNING - 1" etc.)
  const walkComments = (v: PValue, path: string) => {
    if (v.type === "dict")
      v.value.forEach((e: PDictEntry) => {
        if (/^#WARNING/i.test(e.key))
          warn(path || "root", `Remove sample comment key "${e.key}" before booting`);
        walkComments(e.value, path ? `${path} › ${e.key}` : e.key);
      });
    else if (v.type === "array")
      v.value.forEach((x, i) => {
        walkComments(x, `${path}[${i}]`);
      });
  };
  walkComments(doc, "");

  for (const [sec, key, schema] of ENTRY_ARRAYS) {
    const arr = get(get(doc, sec), key);
    if (!arr) continue;
    const where0 = `${sec} › ${key}`;
    if (arr.type !== "array") {
      err(where0, "must be an array");
      continue;
    }
    const seen = new Map<string, number>();
    arr.value.forEach((e, i) => {
      const where = `${where0}[${i}]`;
      if (e.type === "string" && sec === "UEFI") {
        err(
          where,
          "Drivers entries must be dictionaries (Path/Enabled/LoadEarly/Arguments) since OpenCore 0.7.3",
        );
        return;
      }
      if (e.type !== "dict") {
        err(where, "entry must be a dictionary");
        return;
      }
      for (const [f, t] of Object.entries(schema)) {
        const v = get(e, f);
        if (!v) err(where, `missing ${f}`);
        else if (v.type !== t) err(where, `${f} must be ${t}, found ${v.type}`);
      }
      for (const f of ["MinKernel", "MaxKernel"]) {
        const v = str(get(e, f));
        if (v !== undefined && !KERNEL_RE.test(v))
          err(where, `${f} "${v}" must be a Darwin version like 20.0.0 or empty`);
      }
      const find = get(e, "Find"),
        rep = get(e, "Replace");
      if (find?.type === "data" && rep?.type === "data" && find.value.length !== rep.value.length)
        err(
          where,
          `Find (${find.value.length} bytes) and Replace (${rep.value.length} bytes) must be the same length`,
        );
      for (const [m, base] of [
        ["Mask", find],
        ["ReplaceMask", rep],
      ] as const) {
        const mv = get(e, m);
        if (
          mv?.type === "data" &&
          mv.value.length > 0 &&
          base?.type === "data" &&
          mv.value.length !== base.value.length
        )
          err(
            where,
            `${m} must be empty or the same length as ${m === "Mask" ? "Find" : "Replace"}`,
          );
      }
      const p = str(get(e, "Path")) ?? str(get(e, "BundlePath"));
      if (p) {
        if (sec === "ACPI" && key === "Add" && !/\.aml$/i.test(p))
          warn(where, `ACPI table "${p}" should be a compiled .aml file`);
        if (sec === "UEFI" && !/\.efi$/i.test(p)) warn(where, `Driver "${p}" should end in .efi`);
        if (sec === "Kernel" && key === "Add" && !/\.kext$/i.test(p))
          warn(where, `BundlePath "${p}" should end in .kext`);
        if (seen.has(p)) warn(where, `"${p}" is listed twice (also at index ${seen.get(p)})`);
        seen.set(p, i);
      }
    });

    if (sec === "Kernel" && key === "Add") {
      const names = arr.value.map(
        (e) =>
          (str(get(e, "BundlePath")) ?? "")
            .replace(/\.kext$/i, "")
            .split("/")
            .pop() ?? "",
      );
      const lilu = names.indexOf("Lilu");
      names.forEach((n, i) => {
        if (!LILU_PLUGINS.includes(n)) return;
        if (lilu < 0)
          err(`${where0}[${i}]`, `${n} is a Lilu plugin but Lilu.kext is not in Kernel › Add`);
        else if (i < lilu)
          err(
            `${where0}[${i}]`,
            `${n} must come after Lilu.kext (index ${lilu}) — kexts load in list order`,
          );
      });
    }
    if (sec === "UEFI" && key === "Drivers") {
      const paths = arr.value.map((e) => str(get(e, "Path")) ?? "");
      if (!paths.some((p) => /OpenRuntime\.efi$/i.test(p)))
        warn(where0, "OpenRuntime.efi is missing — it is required for almost every setup");
    }
  }

  // DeviceProperties device paths
  const dp = get(get(doc, "DeviceProperties"), "Add");
  if (dp?.type === "dict")
    dp.value.forEach((e) => {
      if (!e.key.startsWith("#") && !PCI_RE.test(e.key))
        warn(
          `DeviceProperties › Add › ${e.key}`,
          "Key is not a PCI device path like PciRoot(0x0)/Pci(0x2,0x0)",
        );
    });

  // PlatformInfo › Generic (SMBIOS)
  const gen = get(get(doc, "PlatformInfo"), "Generic");
  if (gen?.type === "dict") {
    const w = "PlatformInfo › Generic";
    const serial = str(get(gen, "SystemSerialNumber")) ?? "";
    const mlb = str(get(gen, "MLB")) ?? "";
    const uuid = str(get(gen, "SystemUUID")) ?? "";
    const rom = get(gen, "ROM");
    if (!str(get(gen, "SystemProductName")))
      err(w, "SystemProductName (SMBIOS model, e.g. iMac20,1) is required");
    if (!serial || /^(W0+1|0+)$/.test(serial))
      warn(
        w,
        "SystemSerialNumber is empty or the sample placeholder — generate one with GenSMBIOS",
      );
    if (!mlb || /^M0+1$/.test(mlb)) warn(w, "MLB is empty or the sample placeholder");
    if (uuid && !UUID_RE.test(uuid)) err(w, "SystemUUID must be a UUID (8-4-4-4-12 hex)");
    if (!uuid || /^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(uuid))
      warn(w, "SystemUUID is empty or all zeros");
    if (rom && rom.type !== "data") err(w, "ROM must be data");
    else if (rom?.type === "data" && rom.value.length !== 6)
      err(w, `ROM must be 6 bytes (a MAC address), found ${rom.value.length}`);
    else if (rom?.type === "data" && bytesToHex(rom.value) === "112233445566")
      warn(w, "ROM is the sample value 112233445566 — use your NIC's MAC address");
  }

  // Misc › Security
  const sec = get(get(doc, "Misc"), "Security");
  if (sec?.type === "dict") {
    const w = "Misc › Security";
    const vault = str(get(sec, "Vault"));
    if (vault && !["Optional", "Basic", "Secure"].includes(vault))
      err(w, `Vault must be Optional, Basic or Secure (got "${vault}")`);
    const dmg = str(get(sec, "DmgLoading"));
    if (dmg && !["Disabled", "Signed", "Any"].includes(dmg))
      err(w, `DmgLoading must be Disabled, Signed or Any`);
    if (dmg === "Any")
      warn(w, "DmgLoading = Any allows unsigned DMG images to load — security risk");
    const sbm = str(get(sec, "SecureBootModel"));
    if (sbm === "Disabled") warn(w, "SecureBootModel is Disabled — Apple Secure Boot is off");
    const sp = get(sec, "ScanPolicy");
    if (sp && sp.type !== "integer") err(w, "ScanPolicy must be an integer");
    if (
      get(sec, "AllowNvramReset")?.type === "boolean" &&
      vault === "Secure" &&
      get(sec, "AllowNvramReset")?.value === true
    )
      warn(w, "AllowNvramReset is on while Vault is Secure");
  }

  // NVRAM SIP
  const bootVars = get(get(get(doc, "NVRAM"), "Add"), APPLE_BOOT_GUID);
  const csr = get(bootVars, "csr-active-config");
  if (csr) {
    const w = `NVRAM › Add › ${APPLE_BOOT_GUID} › csr-active-config`;
    if (csr.type !== "data") err(w, "must be data (4 bytes, little-endian)");
    else if (csr.value.length !== 4) err(w, `must be 4 bytes, found ${csr.value.length}`);
    else {
      const n = csr.value[0]! | (csr.value[1]! << 8) | (csr.value[2]! << 16);
      if (n & 0x2 && n & 0x10)
        warn(
          w,
          `SIP largely disabled (0x${n.toString(16)}) — only do this if a kext or patch requires it`,
        );
    }
  }
  const args = str(get(bootVars, "boot-args"));
  if (args && /(^|\s)-no_compat_check(\s|$)/.test(args))
    warn(
      `NVRAM › boot-args`,
      "-no_compat_check disables macOS compatibility checks and blocks software updates",
    );

  return issues;
}

const s = (value: string): PValue => ({ type: "string", value });
const b = (value: boolean): PValue => ({ type: "boolean", value });
const i = (value: number): PValue => ({ type: "integer", value });
const d = (hex: string): PValue => ({ type: "data", value: hexToBytes(hex) });
const dict = (...value: [string, PValue][]): PValue => ({
  type: "dict",
  value: value.map(([key, v]) => ({ key, value: v })),
});
const arr = (...value: PValue[]): PValue => ({ type: "array", value });
const kext = (name: string, exe = true) =>
  dict(
    ["Arch", s("x86_64")],
    ["BundlePath", s(`${name}.kext`)],
    ["Comment", s("")],
    ["Enabled", b(true)],
    ["ExecutablePath", s(exe ? `Contents/MacOS/${name}` : "")],
    ["MaxKernel", s("")],
    ["MinKernel", s("")],
    ["PlistPath", s("Contents/Info.plist")],
  );

export function sampleOpenCore(): PValue {
  return dict(
    [
      "ACPI",
      dict(
        [
          "Add",
          arr(
            dict(["Comment", s("EC")], ["Enabled", b(true)], ["Path", s("SSDT-EC-USBX.aml")]),
            dict(["Comment", s("Plugin type")], ["Enabled", b(true)], ["Path", s("SSDT-PLUG")]),
          ),
        ],
        ["Delete", arr()],
        ["Patch", arr()],
        ["Quirks", dict(["ResetLogoStatus", b(true)])],
      ),
    ],
    [
      "Booter",
      dict(
        ["MmioWhitelist", arr()],
        ["Patch", arr()],
        [
          "Quirks",
          dict(
            ["DevirtualiseMmio", b(true)],
            ["ProvideCustomSlide", b(true)],
            ["SetupVirtualMap", b(true)],
          ),
        ],
      ),
    ],
    [
      "DeviceProperties",
      dict(
        [
          "Add",
          dict(
            [
              "PciRoot(0x0)/Pci(0x2,0x0)",
              dict(
                ["AAPL,ig-platform-id", d("07009B3E")],
                ["framebuffer-patch-enable", d("01000000")],
              ),
            ],
            ["PciRoot(0x0)/Pci(0x1f,0x3)", dict(["layout-id", d("01000000")])],
          ),
        ],
        ["Delete", dict()],
      ),
    ],
    [
      "Kernel",
      dict(
        ["Add", arr(kext("WhateverGreen"), kext("Lilu"), kext("VirtualSMC"), kext("USBToolBox"))],
        ["Block", arr()],
        ["Force", arr()],
        [
          "Patch",
          arr(
            dict(
              ["Comment", s("Example patch")],
              ["Enabled", b(false)],
              ["Find", d("AABBCC")],
              ["Replace", d("AABB")],
              ["MinKernel", s("20.0.0")],
              ["MaxKernel", s("")],
            ),
          ),
        ],
        [
          "Quirks",
          dict(
            ["DisableIoMapper", b(true)],
            ["PanicNoKextDump", b(true)],
            ["PowerTimeoutKernelPanic", b(true)],
          ),
        ],
      ),
    ],
    [
      "Misc",
      dict(
        ["Boot", dict(["PickerMode", s("External")], ["Timeout", i(5)])],
        ["Debug", dict(["AppleDebug", b(true)], ["Target", i(3)])],
        [
          "Security",
          dict(
            ["DmgLoading", s("Any")],
            ["ScanPolicy", i(0)],
            ["SecureBootModel", s("Default")],
            ["Vault", s("Optional")],
          ),
        ],
        ["Tools", arr()],
      ),
    ],
    [
      "NVRAM",
      dict(
        [
          "Add",
          dict([
            APPLE_BOOT_GUID,
            dict(
              ["boot-args", s("-v keepsyms=1 debug=0x100")],
              ["csr-active-config", d("00000000")],
              ["prev-lang:kbd", d("656E2D55533A30")],
            ),
          ]),
        ],
        ["Delete", dict()],
        ["WriteFlash", b(true)],
      ),
    ],
    [
      "PlatformInfo",
      dict(
        ["Automatic", b(true)],
        [
          "Generic",
          dict(
            ["MLB", s("M0000000000000001")],
            ["ROM", d("112233445566")],
            ["SystemProductName", s("iMac20,1")],
            ["SystemSerialNumber", s("W00000000001")],
            ["SystemUUID", s("00000000-0000-0000-0000-000000000000")],
          ),
        ],
        ["UpdateSMBIOS", b(true)],
        ["UpdateSMBIOSMode", s("Create")],
      ),
    ],
    [
      "UEFI",
      dict(
        ["ConnectDrivers", b(true)],
        [
          "Drivers",
          arr(
            dict(
              ["Arguments", s("")],
              ["Comment", s("")],
              ["Enabled", b(true)],
              ["LoadEarly", b(false)],
              ["Path", s("OpenHfsPlus.efi")],
            ),
          ),
        ],
        ["Quirks", dict(["RequestBootVarRouting", b(true)])],
      ),
    ],
  );
}
