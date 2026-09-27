import { Link } from "@tanstack/react-router";
import { useLocale } from "@/lib/i18n";
import { localizedPath } from "@/lib/locales";

const profilesGuide =
  "https://developer.apple.com/documentation/technotes/tn3125-inside-code-signing-provisioning-profiles";
const domainsGuide =
  "https://developer.apple.com/documentation/xcode/supporting-associated-domains";
const linkStyle = "text-primary underline underline-offset-4";

function Code({ children }: { children: string }) {
  return (
    <pre className="max-w-full overflow-x-auto rounded-md border border-border bg-surface p-4 font-mono text-xs leading-6 text-foreground">
      <code>{children}</code>
    </pre>
  );
}

export function ProvisioningGuide() {
  const locale = useLocale();
  const say = (en: string, zh: string, ja: string) => ({ en, zh, ja })[locale];
  const rows = [
    [
      "ExpirationDate",
      say("Expired or within 30 days", "已过期或距到期不足 30 天", "期限切れ・残り 30 日以内"),
      say(
        "Check the date before choosing a profile for a build.",
        "选择构建所用的描述文件前，先核对日期。",
        "ビルドに使うプロファイルを選ぶ前に日付を確認します。",
      ),
    ],
    [
      "TeamIdentifier / application-identifier",
      say("Team or App ID mismatch", "团队或 App ID 不匹配", "チーム・App ID の不一致"),
      say(
        "Compare the identifiers with your Xcode target and signing team.",
        "与 Xcode target 的应用标识和签名团队对照。",
        "Xcode ターゲットの識別子と署名チームを照合します。",
      ),
    ],
    [
      "ProvisionedDevices",
      say("Repeated device IDs", "设备 ID 重复", "デバイス ID の重複"),
      say(
        "Inspect the list when debugging a device-specific installation issue.",
        "排查特定设备安装问题时，检查设备列表。",
        "特定の端末でインストールできない場合に一覧を確認します。",
      ),
    ],
    [
      "DeveloperCertificates",
      say("Empty certificate list", "证书列表为空", "証明書一覧が空"),
      say(
        "The built-in sample intentionally has no certificates; use your original profile for real inspection.",
        "内置示例故意不含证书；实际检查请打开原始描述文件。",
        "内蔵サンプルには意図的に証明書を含めていません。実際の確認には元のプロファイルを使ってください。",
      ),
    ],
  ];
  return (
    <div className="space-y-4 pt-5">
      <h3 className="font-semibold text-foreground">
        {say(
          "From a warning to the next check",
          "看到提示后，下一步检查什么",
          "警告が出たら何を確認するか",
        )}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-foreground">
              {[
                say("Field", "字段", "項目"),
                say("Diagnostic", "提示", "診断"),
                say("Next step", "下一步", "次の確認"),
              ].map((heading) => (
                <th key={heading} scope="col" className="p-3 align-top font-medium">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([field, diagnostic, next]) => (
              <tr key={field} className="border-b border-border">
                <th scope="row" className="break-words p-3 align-top font-mono text-xs font-normal">
                  {field}
                </th>
                <td className="p-3 align-top">{diagnostic}</td>
                <td className="p-3 align-top">{next}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="font-semibold text-foreground">
        {say(
          "Read the same payload on macOS",
          "在 macOS 上读取同一份内容",
          "macOS で同じ内容を確認",
        )}
      </h3>
      <Code>{'security cms -D -i "profile.mobileprovision" -o "profile.plist"'}</Code>
      <p>
        {say(
          "Replace the input filename with your profile. This writes the decoded plist to profile.plist; it does not renew or re-sign the profile.",
          "把输入文件名换成你的描述文件。命令将解包的 plist 写入 profile.plist，不会续期或重新签名。",
          "入力名を手元のプロファイルに置き換えます。展開した plist を profile.plist に保存するだけで、更新や再署名は行いません。",
        )}
      </p>
      <p>
        {say(
          "A profile’s Entitlements describe allowed capabilities, not necessarily the app’s signed claims. Review extracted values in the ",
          "描述文件中的 Entitlements 表示允许的能力，不等同于应用最终签名中的声明。提取后可在",
          "プロファイルの Entitlements は許可された機能であり、アプリの署名に含まれる宣言とは限りません。抽出した値は ",
        )}
        <Link className={linkStyle} to={localizedPath("/entitlements-editor", locale)}>
          {say("Entitlements editor", " Entitlements 编辑器", "Entitlements エディター")}
        </Link>
        {say(" before using them.", "中逐项核对。", "で確認してください。")}
      </p>
      <p className="text-sm">
        <a className={linkStyle} href={profilesGuide}>
          {say(
            "Apple: inside provisioning profiles",
            "Apple 官方说明：预置描述文件的内部结构",
            "Apple 公式：プロビジョニングプロファイルの内部構造",
          )}
        </a>
      </p>
    </div>
  );
}

export function EntitlementsGuide() {
  const locale = useLocale();
  const say = (en: string, zh: string, ja: string) => ({ en, zh, ja })[locale];
  return (
    <div className="space-y-4 pt-5">
      <h3 className="font-semibold text-foreground">
        {say(
          "Example: fix a type and a domain entry",
          "示例：修正类型与关联域名",
          "例：型と関連ドメインの修正",
        )}
      </h3>
      <p>
        {say(
          "These are fragments inside a plist dictionary. Both entries below trigger diagnostics:",
          "以下为 plist 字典内部的片段。这两处写法都会触发诊断：",
          "以下は plist 辞書内の抜粋です。どちらも診断の対象になります。",
        )}
      </p>
      <Code>{`<key>com.apple.security.app-sandbox</key>
<string>true</string>
<key>com.apple.developer.associated-domains</key>
<array><string>https://example.com</string></array>`}</Code>
      <p>
        {say(
          "Use a Boolean for app-sandbox, and a service-prefixed domain for associated-domains:",
          "app-sandbox 需要布尔值；associated-domains 需要带服务前缀的域名：",
          "app-sandbox は真偽値、associated-domains はサービス接頭辞付きのドメインにします。",
        )}
      </p>
      <Code>{`<key>com.apple.security.app-sandbox</key>
<true/>
<key>com.apple.developer.associated-domains</key>
<array><string>applinks:example.com</string></array>`}</Code>
      <p>
        {say(
          "This fixes those two local checks. It does not verify the domain’s association file, account permissions, or the app’s signature. ",
          "这样能修正这两项本地检查，但不会验证域名的关联文件、账号权限或应用签名。",
          "これでこの 2 項目のローカルチェックは解消しますが、ドメインの関連付けファイル、アカウント権限、アプリの署名は検証しません。",
        )}
        <a className={linkStyle} href={domainsGuide}>
          {say(
            "Apple’s associated domains setup",
            "关联域名的完整配置见 Apple 文档",
            "関連ドメインの設定は Apple 公式資料へ",
          )}
        </a>
      </p>
      <h3 className="font-semibold text-foreground">
        {say(
          "Compare with a signed app on macOS",
          "在 macOS 上对照已签名应用",
          "macOS で署名済みアプリと照合",
        )}
      </h3>
      <Code>
        {'codesign --display --entitlements - --xml "/path/to/App.app" > app.entitlements'}
      </Code>
      <p>
        {say(
          "Open the exported file here. Keep build-setting variables in your Xcode source when appropriate; the signed output is useful for comparison. Check permitted capabilities with the ",
          "在此打开导出的文件进行对照。Xcode 源文件中的构建变量应按项目需要保留；签名后的输出用于核对最终值。允许的能力可通过",
          "出力をここで開いて比較します。Xcode のソースでは必要なビルド変数を保持し、署名後の値と照合してください。許可された機能は ",
        )}
        <Link className={linkStyle} to={localizedPath("/mobileprovision-viewer", locale)}>
          {say(
            "provisioning profile viewer",
            "预置描述文件查看器",
            "プロビジョニングプロファイルビューアー",
          )}
        </Link>
        {say(".", "检查。", "で確認できます。")}
      </p>
      <p className="text-sm">
        <a className={linkStyle} href={profilesGuide}>
          {say(
            "Apple: profile entitlements and signed claims",
            "Apple 官方说明：描述文件权限与签名声明",
            "Apple 公式：プロファイルの権限と署名の宣言",
          )}
        </a>
      </p>
    </div>
  );
}
