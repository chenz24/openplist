import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useLocale } from "@/lib/i18n";
import { localizedPath } from "@/lib/locales";

const appleGuide =
  "https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/PropertyLists/AboutPropertyLists/AboutPropertyLists.html";
const pythonGuide = "https://docs.python.org/3/library/plistlib.html";

function Detail({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mx-auto max-w-3xl space-y-4 px-4 py-8 text-[15px] leading-relaxed text-muted-foreground">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      {children}
    </section>
  );
}
function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md border border-border bg-surface p-4 font-mono text-xs leading-6 text-foreground">
      <code>{children}</code>
    </pre>
  );
}

/** Task-specific, server-rendered examples; the editor above remains the main action. */
export function TaskDetails({ path }: { path: string }) {
  const locale = useLocale();
  const say = (en: string, zh: string, ja: string) => ({ en, zh, ja })[locale];
  const link = (to: string, label: string) => (
    <Link to={localizedPath(to, locale)} className="text-primary underline underline-offset-4">
      {label}
    </Link>
  );
  const samples = (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      <a
        download
        href="/examples/example-xml.plist"
        className="text-primary underline underline-offset-4"
      >
        {say("Download XML sample", "下载 XML 示例", "XML サンプルをダウンロード")}
      </a>
      <a
        download
        href="/examples/example-binary.plist"
        className="text-primary underline underline-offset-4"
      >
        {say("Download binary sample", "下载二进制示例", "バイナリのサンプルをダウンロード")}
      </a>
      <a
        download
        href={path === "/plist-to-json" ? "/examples/plist-output.json" : "/examples/example.json"}
        className="text-primary underline underline-offset-4"
      >
        {say("Download JSON sample", "下载 JSON 示例", "JSON サンプルをダウンロード")}
      </a>
    </div>
  );

  if (path === "/")
    return (
      <Detail title={say("Choose your task", "选择你要完成的任务", "目的から選ぶ")}>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            [
              "/plist-viewer",
              say("Read a plist", "查看文件", "内容を読む"),
              say(
                "Identify the format and find a key or value.",
                "识别文件格式，查找键和值。",
                "形式を判別し、キーや値を探します。",
              ),
            ],
            [
              "/plist-editor",
              say("Edit a plist", "编辑文件", "内容を編集"),
              say(
                "Change types, undo edits and save XML or binary.",
                "修改类型、撤销操作，保存 XML 或二进制。",
                "型を変更し、編集を取り消して XML・バイナリで保存します。",
              ),
            ],
            [
              "/plist-to-json",
              say("Convert formats", "转换格式", "形式を変換"),
              say(
                "Convert to JSON and understand type changes.",
                "转换为 JSON，并了解类型变化。",
                "JSON に変換し、型の変化を確認します。",
              ),
            ],
            [
              "/mobileprovision-viewer",
              say("Inspect Apple profiles", "检查 Apple 描述文件", "Apple プロファイルを確認"),
              say(
                "Inspect expiry, App ID and entitlements.",
                "检查有效期、App ID 和 entitlements。",
                "有効期限、App ID、entitlements を確認します。",
              ),
            ],
          ].map(([to, title, description]) => (
            <Link
              key={to}
              to={localizedPath(to ?? "/", locale)}
              className="rounded-lg border border-border p-4 transition-colors hover:border-primary focus-visible:outline focus-visible:outline-primary"
            >
              <h3 className="font-medium text-foreground">{title}</h3>
              <p className="mt-1 text-sm">{description}</p>
            </Link>
          ))}
        </div>
      </Detail>
    );

  if (path === "/plist-viewer")
    return (
      <Detail
        title={say(
          "Read the file without changing it",
          "先读懂文件，再决定是否修改",
          "変更する前に内容を確認",
        )}
      >
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            {say(
              "Open the file and check the detected format in the status bar. A .plist extension alone does not tell you whether it is XML or binary.",
              "打开文件后查看状态栏识别出的格式。.plist 扩展名本身不能区分 XML 与二进制。",
              "ファイルを開き、ステータスバーで検出形式を確認します。.plist という拡張子だけでは XML とバイナリを区別できません。",
            )}
          </li>
          <li>
            {say(
              "Expand dictionaries and arrays. Search highlights matching keys and values; clear the search to inspect the surrounding structure.",
              "展开字典和数组。搜索会高亮匹配的键和值；清空搜索可继续检查周围结构。",
              "辞書と配列を展開します。検索は一致するキーと値を強調表示します。検索を消すと周囲の構造を確認できます。",
            )}
          </li>
          <li>
            {say(
              'Check the type as well as the displayed value: the string "false" is different from the boolean false.',
              "同时检查类型和值：字符串“false”和布尔值 false 并不相同。",
              '値だけでなく型も確認します。文字列の "false" と真偽値の false は異なります。',
            )}
          </li>
        </ol>
        <p>
          {link(
            "/plist-editor",
            say(
              "Need to change a value? Follow the editing workflow.",
              "需要修改？查看编辑与保存步骤。",
              "変更する場合は編集と保存の手順へ。",
            ),
          )}
        </p>
      </Detail>
    );

  if (path === "/plist-editor")
    return (
      <Detail title={say("A safe editing workflow", "修改、检查与保存", "編集・確認・保存の手順")}>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            {say(
              "Keep a copy of the original. Edit a key or value in the tree and explicitly select its type.",
              "保留原件，在树中修改键和值，并明确选择类型。",
              "元のファイルを保管し、ツリーでキーや値を編集して型を指定します。",
            )}
          </li>
          <li>
            {say(
              "Use Undo / Redo for mistakes. An invalid source edit keeps the last valid tree and blocks export until it is fixed or undone.",
              "使用撤销与重做修正操作。源码无效时保留最后有效的树，并暂停导出，直到修复或撤销。",
              "間違いは元に戻す・やり直すで修正します。ソースが無効な間は最後の有効なツリーを保ち、修正するまで書き出しを停止します。",
            )}
          </li>
          <li>
            {say(
              "Download XML for readable diffs, or binary if the receiving tool requires it. Check the result in the target application; syntax checks do not validate every application's settings.",
              "需要查看差异时下载 XML；目标工具要求二进制时选择 binary。最后在目标应用中验证，语法正确不代表配置一定有效。",
              "差分を確認する場合は XML、対象ツールが必要とする場合はバイナリを保存します。構文が正しくても設定が有効とは限らないため、対象アプリで確認してください。",
            )}
          </li>
        </ol>
        <p>
          {link(
            "/plist-to-json",
            say(
              "Exporting JSON? Read the type-mapping limitations first.",
              "导出 JSON 前，先了解类型映射限制。",
              "JSON にする場合は型変換の制限を確認してください。",
            ),
          )}
        </p>
      </Detail>
    );

  if (path === "/json-to-plist" || path === "/plist-to-json")
    return (
      <>
        <Detail
          title={say("Try an input and compare the output", "对照输入与输出", "入力と出力を比較")}
        >
          <p>
            {say(
              "These small synthetic examples contain no personal data. Use Load sample above to inspect the same values in the tree.",
              "这些小型示例不包含个人数据。点击上方“加载示例”，可在树中检查对应值。",
              "個人情報を含まない小さなサンプルです。上の「サンプルを読み込む」で値をツリー表示できます。",
            )}
          </p>
          {path === "/json-to-plist" ? (
            <>
              <Code>{'{"Name":"Example","Enabled":true,"Count":3}'}</Code>
              <Code>
                {
                  "<dict>\n  <key>Name</key><string>Example</string>\n  <key>Enabled</key><true/>\n  <key>Count</key><integer>3</integer>\n</dict>"
                }
              </Code>
              <p>
                {say(
                  "The XML fragment is wrapped in a complete plist document when downloaded. Strings that look like dates remain strings until you change their type in the tree.",
                  "下载时，XML 片段会放入完整的 plist 文档。看起来像日期的字符串仍是字符串，需要在树中明确修改类型。",
                  "ダウンロード時は XML 断片を完全な plist 文書として出力します。日付のような文字列も、ツリーで型を変更するまでは文字列のままです。",
                )}
              </p>
            </>
          ) : (
            <>
              <Code>{"<date>2026-01-01T00:00:00Z</date>\n<data>SGk=</data>"}</Code>
              <Code>{'{\n  "Created": "2026-01-01T00:00:00.000Z",\n  "Data": "SGk="\n}'}</Code>
              <p>
                {say(
                  "The two XML values are excerpts from the sample's Created and Data fields. JSON cannot tell these strings apart from ordinary text.",
                  "两个 XML 值摘自示例的 Created 和 Data 字段。JSON 无法将这些字符串与普通文本区分。",
                  "XML の値はサンプルの Created と Data フィールドの抜粋です。JSON ではこれらを通常の文字列と区別できません。",
                )}
              </p>
            </>
          )}
          {samples}
        </Detail>
        <Detail title={say("Conversion rules and limits", "转换规则与限制", "変換ルールと制限")}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-foreground">
                <tr>
                  <th className="border-b border-border p-2">Plist</th>
                  <th className="border-b border-border p-2">JSON</th>
                  <th className="border-b border-border p-2">
                    {say("What to check", "需要检查", "確認事項")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "integer / real",
                    "number",
                    say(
                      "1 and 1.0 become the same JSON number; JSON import uses integer for whole numbers.",
                      "1 和 1.0 都是 JSON 数字；导入时整数值映射为 integer。",
                      "1 と 1.0 は同じ JSON 数値です。整数値は integer として取り込みます。",
                    ),
                  ],
                  [
                    "date / data",
                    "string",
                    say(
                      "ISO date / Base64 text. Reverse conversion does not infer their original types.",
                      "ISO 日期 / Base64 文本；反向转换不会推断原类型。",
                      "ISO 日付・Base64 文字列です。逆変換では元の型を推測しません。",
                    ),
                  ],
                  [
                    "UID",
                    "number",
                    say(
                      "The UID tag is lost. XML export uses a CF$UID dictionary; confirm archive compatibility.",
                      "UID 类型标记丢失；XML 导出采用 CF$UID 字典，需确认归档兼容性。",
                      "UID の型は失われます。XML は CF$UID 辞書になるため、アーカイブとの互換性を確認してください。",
                    ),
                  ],
                  [
                    say("No equivalent", "无对应类型", "対応する型なし"),
                    "null",
                    say(
                      "JSON to Plist rejects null instead of silently replacing it.",
                      "JSON 转 Plist 会拒绝 null，不会静默替换。",
                      "JSON → Plist では null を黙って置換せず、エラーにします。",
                    ),
                  ],
                  [
                    "dict",
                    "object",
                    say(
                      "Duplicate keys collapse and numeric-looking keys may reorder in JSON. Use unique keys.",
                      "JSON 中重复键会合并，数字形式的键可能重排。请使用唯一键。",
                      "JSON では重複キーが統合され、数値形式のキーが並び替わる場合があります。キーは一意にしてください。",
                    ),
                  ],
                ].map(([a, b, c]) => (
                  <tr key={a}>
                    <td className="border-b border-border p-2 font-mono">{a}</td>
                    <td className="border-b border-border p-2 font-mono">{b}</td>
                    <td className="border-b border-border p-2">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            {say(
              "Numbers use JavaScript precision. JSON imports reject non-finite numbers and integers outside ±9,007,199,254,740,991. Decimal fractions can round; represent exact identifiers or decimals as strings. This tool is not an arbitrary-precision converter.",
              "数字使用 JavaScript 精度。JSON 导入会拒绝非有限数值和超出 ±9,007,199,254,740,991 的整数。小数可能舍入；需要精确保留的标识符或小数请用字符串表示，本工具不是任意精度转换器。",
              "数値は JavaScript の精度を使用します。JSON の非有限値と ±9,007,199,254,740,991 を超える整数は拒否します。小数は丸められる場合があるため、正確な識別子や小数は文字列で表してください。任意精度の変換には対応しません。",
            )}
          </p>
          <p>
            {link(
              "/plist-editor",
              say(
                "Keep plist types when editing",
                "编辑时保留 plist 类型",
                "plist の型を保って編集",
              ),
            )}{" "}
            ·{" "}
            <a href={appleGuide} className="text-primary underline underline-offset-4">
              {say(
                "Apple's property-list types",
                "Apple 属性列表类型说明",
                "Apple のプロパティリスト型の説明",
              )}
            </a>
          </p>
        </Detail>
      </>
    );

  if (path === "/plist-to-xml")
    return (
      <Detail
        title={say(
          "Convert OpenStep text to XML",
          "将 OpenStep 文本转换为 XML",
          "OpenStep テキストを XML に変換",
        )}
      >
        <Code>{'{ Name = "Example"; Enabled = YES; }'}</Code>
        <p>
          {say(
            "OpenStep uses braces, equals signs and semicolons. Legacy scalar tokens such as YES are strings in this parser, not typed booleans. Check types in the tree before exporting XML; comments and original whitespace are not retained.",
            "OpenStep 使用花括号、等号和分号。本解析器把 YES 等旧式标量当作字符串，而不是布尔值。导出 XML 前请检查树中的类型；注释和原始空白不会保留。",
            "OpenStep は波括弧・等号・セミコロンを使います。このパーサーでは YES などのトークンは真偽値ではなく文字列です。XML 出力前に型を確認してください。コメントと元の空白は保持しません。",
          )}
        </p>
        <p>
          {link(
            "/binary-plist-to-xml",
            say(
              "For bplist00 files, use the binary-to-XML workflow and sample.",
              "如果文件以 bplist00 开头，使用二进制转 XML 流程和示例。",
              "bplist00 ファイルにはバイナリ → XML の手順とサンプルを使ってください。",
            ),
          )}
        </p>
      </Detail>
    );

  if (path === "/binary-plist-to-xml" || path === "/how-to-open-plist-on-windows")
    return (
      <>
        <Detail
          title={say(
            "Try a real binary file",
            "用真实的二进制文件试一下",
            "バイナリファイルで試す",
          )}
        >
          <p>
            {say(
              "The XML and binary downloads contain the same Name, Enabled, Count, Created and Data fields. The binary version starts with bplist00. Open it above: Name should be Example, Count should be the integer 3, and Data contains the bytes for Hi.",
              "XML 和二进制下载包含相同的 Name、Enabled、Count、Created 和 Data 字段。二进制版本以 bplist00 开头。打开后，Name 应为 Example，Count 为整数 3，Data 包含 Hi 的字节。",
              "XML とバイナリには同じ Name・Enabled・Count・Created・Data フィールドがあります。バイナリは bplist00 で始まります。開くと Name は Example、Count は整数 3、Data は Hi のバイト列になります。",
            )}
          </p>
          {samples}
          {path === "/how-to-open-plist-on-windows" && (
            <figure className="space-y-2">
              <img
                src={`/guides/open-binary-${locale}.png`}
                width={1280}
                height={720}
                loading="lazy"
                decoding="async"
                className="h-auto w-full rounded-md border border-border"
                alt={say(
                  "A binary plist opened in OpenPlist, with Name, Count, Created and Data in the tree and XML beside it.",
                  "在 OpenPlist 中打开二进制 plist，左侧显示 Name、Count、Created 和 Data，右侧显示 XML。",
                  "バイナリ plist を開いた OpenPlist。左に Name・Count・Created・Data、右に XML が表示されています。",
                )}
              />
              <figcaption className="text-sm">
                {say(
                  "After opening the sample: the status bar identifies bplist00, and the tree displays each value's type.",
                  "打开示例后：状态栏识别出 bplist00，属性树显示每个值的类型。",
                  "サンプルを開くと、ステータスバーに bplist00 と表示され、ツリーで各値の型を確認できます。",
                )}
              </figcaption>
            </figure>
          )}
          <p>
            {say(
              "Unreadable characters alone do not mean a file is damaged. A parse error may mean a truncated download, an unsupported format or a file that is not a plist. Renaming the extension does not convert its contents.",
              "乱码本身不代表损坏。解析错误可能来自下载不完整、格式不支持，或文件本来就不是 plist。修改扩展名不会转换文件内容。",
              "文字化けだけでは破損とは判断できません。解析エラーは、不完全なダウンロード、未対応形式、plist ではないファイルなどで起こります。拡張子を変えても内容は変換されません。",
            )}
          </p>
        </Detail>
        <Detail
          title={say("Convert a copy with Python", "用 Python 转换副本", "Python でコピーを変換")}
        >
          <p>
            {say(
              "If Python is installed, its standard plistlib module reads XML and binary plists. This script writes a separate output file; change the paths to match your files.",
              "如果已安装 Python，标准库 plistlib 可读取 XML 和二进制 plist。以下脚本写入单独的输出文件；请按实际文件修改路径。",
              "Python があれば、標準の plistlib で XML とバイナリを読み込めます。このスクリプトは別のファイルに出力します。パスを実際のファイルに変更してください。",
            )}
          </p>
          <Code>
            {
              'import plistlib\n\nwith open("input.plist", "rb") as source:\n    data = plistlib.load(source)\nwith open("output.plist", "wb") as output:\n    plistlib.dump(data, output, fmt=plistlib.FMT_XML, sort_keys=False)'
            }
          </Code>
          <p>
            {say(
              "This example covers ordinary property lists. Binary archives containing UID values may not export as standard XML through plistlib. Neither conversion method validates app-specific settings or cryptographic signatures.",
              "此示例适用于普通属性列表。包含 UID 的二进制归档可能无法通过 plistlib 导出标准 XML。格式转换不会验证应用配置或密码学签名。",
              "通常のプロパティリスト向けの例です。UID を含むバイナリアーカイブは plistlib で標準 XML に出力できない場合があります。形式変換ではアプリの設定や暗号学的署名を検証しません。",
            )}
          </p>
          <p>
            <a className="text-primary underline underline-offset-4" href={pythonGuide}>
              Python plistlib
            </a>{" "}
            ·{" "}
            {link(
              "/xml-vs-binary-plist",
              say("Compare XML and binary", "对比 XML 与二进制", "XML とバイナリを比較"),
            )}
          </p>
        </Detail>
      </>
    );
  return null;
}
