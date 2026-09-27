# OpenPlist

View, edit, and convert Apple property lists in your browser. Open XML, binary, and OpenStep files on macOS, Windows, or Linux without installing Xcode.

[Use online](https://openplist.com) · [简体中文](README.zh-CN.md) · [Report an issue](https://github.com/chenz24/openplist/issues) · [MIT license](LICENSE)

## Features

- **Tree and source editing** — edit keys, values, and types in a structured tree, or work with XML and JSON source with syntax highlighting and error locations.
- **Format conversion** — convert XML and binary (`bplist00`) plists, import OpenStep, and convert between plist and JSON.
- **Apple configuration tools** — inspect profiles, edit entitlements and localization files, and check Xcode or OpenCore configurations.
- **Editing safeguards** — undo/redo, unsaved-change prompts, and focus mode in the shared plist editor.
- **Local file processing** — core editing and conversion happen in your browser, without uploading file contents.
- **Multilingual interface** — English, Simplified Chinese, and Japanese, with editing sessions preserved when switching languages.

## Supported files

| File | Tools |
| --- | --- |
| `.plist` — XML, binary, OpenStep | View, edit, and export as XML, binary, or JSON |
| `.json` | Convert to XML or binary plist |
| `.mobileconfig` | Edit profile payloads, validate configuration, and optionally request AI review |
| `.mobileprovision`, `.provisionprofile` | Inspect expiry, team, devices, certificates, and entitlements; extract entitlements |
| `.entitlements` | Edit and validate entitlement settings |
| `.strings`, `.stringsdict` | Edit localization strings and plural rules |
| `.xcconfig` | Edit and validate Xcode build settings |
| OpenCore `config.plist` | Edit configuration, run selected checks, and convert Base64 / Hex data |

## Quick start

Use **Node.js 22.12 or later within 22.x**, or **Node.js 24.x**, and **pnpm 10.34.5**. The supported Node range and package manager version are defined in [package.json](package.json).

```sh
git clone https://github.com/chenz24/openplist.git
cd openplist
pnpm install --frozen-lockfile
pnpm run dev
```

Open the local URL printed by Vite. Core tools work without environment variables or an API key. Sample files are available in [public/examples](public/examples).

## Self-hosting

```sh
pnpm run build
pnpm run start
```

Deploy the complete `.output` directory. The Node server renders pages and serves static assets; its default port is `3000`. Set `PORT` and `HOST` in the server environment to change the listening address. To preview an existing build locally, run `pnpm run preview --port 4173`.

When using your own public domain, update `src/lib/site.ts` and `public/robots.txt`.

### Optional AI review

Configuration profiles can be reviewed through an OpenAI-compatible Chat Completions API that supports structured JSON output. To enable it locally, copy [`.env.example`](.env.example) to `.env` and fill in all three values:

| Variable | Value |
| --- | --- |
| `AI_API_KEY` | Your provider's API key |
| `AI_BASE_URL` | The provider's API base URL, including its version path if required |
| `AI_MODEL` | The model identifier supported by that provider |

For production, supply these variables to the server process. Keep API keys out of source control and never prefix these variables with `VITE_`. Without this configuration, the core editor and converters still work.

## Privacy and compatibility

File contents and editing history stay in page memory, not localStorage or IndexedDB. Download your changes before reloading or closing the page.

AI review sends profile content to the configured provider only when you explicitly request analysis. Selected sensitive fields are redacted first, but redaction may miss custom fields. Ordinary page and asset requests still use the network. See the [privacy page](https://openplist.com/privacy) for details.

Export regenerates formatting and removes comments. JSON cannot preserve plist date, data, or UID types, and numbers are subject to JavaScript precision. Signed profiles can be inspected, but signatures are neither verified nor recreated. Built-in checks cover selected rules; verify exported files in the application that uses them.

## Development and contributions

Built with React, TypeScript, TanStack Start, Vite, Nitro, Tailwind CSS, CodeMirror, and Paraglide JS.

```sh
pnpm run check   # Lint, type checking, and tests
pnpm run test    # Unit tests
pnpm run format  # Format source files
```

Weight checks cover 21 representative localized pages. Gzip budgets are 260 KiB of initial JavaScript for tools/guides, 180 KiB for About/Privacy, and 18 KiB of CSS per page. Counts include module entry points and recursive static imports, deduplicated per page; lazy chunks, fonts and images are excluded. These are regression limits, not Core Web Vitals measurements. Production HTTPS/domain redirects, caching, mobile performance and Search Console indexing still need verification after deployment.

Issues and pull requests are welcome. Include reproduction steps and a small synthetic sample when reporting a bug. Keep the English, Chinese, and Japanese translations in sync, and add regression tests for parser or conversion changes. Run `pnpm run check` and `pnpm run build` before submitting changes.

## License

[MIT](LICENSE) © 2026 OpenPlist contributors. Contributions use the same license; third-party dependencies retain their own licenses.

OpenPlist is an independent project and is not affiliated with or endorsed by Apple.
