import { trustPages } from "../trust";
import type { PageCatalog } from "./types";

const privacy = {
  q: "ファイルはサーバーに送信されますか？",
  a: "表示・編集・書き出しはブラウザー内で処理します。AI プロファイルレビューを自分で実行した場合に限り、機密情報を除去した内容を送信します。",
};
const platforms = {
  q: "Mac や Xcode は必要ですか？",
  a: "不要です。Windows、macOS、Linux のモダンブラウザーで利用できます。",
};

export const ja: PageCatalog = {
  ...trustPages.ja,
  "/": {
    title: "Plist ビューアー＆エディター — .plist をオンラインで表示・編集・変換",
    description:
      "XML、バイナリ bplist00、OpenStep のプロパティリストを無料で表示・編集。ツリーでキーと値を変更し、XML・バイナリ・JSON に変換できます。処理はブラウザー内で行います。",
    h1: "Plist ビューアー＆エディター",
    tagline:
      "XML、バイナリ、OpenStep の plist をブラウザーで開いて編集。Windows、macOS、Linux に対応し、Xcode のインストールは不要です。",
    bullets: [
      "XML・バイナリ・OpenStep 対応",
      "ツリーとソースを同期して編集",
      "キーの順序と値の型を保持",
      "ファイルはブラウザー内で処理",
    ],
    sections: [
      {
        heading: "plist 固有の型を保持",
        body: "integer、real、date、data、UID はそれぞれ異なる意味を持ちます。順序と型を持つデータモデルを使い、整数の 1 と実数の 1.0 を区別しながら辞書のキー順序を保持します。書き出し時には再シリアライズするため、元のインデントやコメントの保持は保証しません。",
      },
      {
        heading: "ツリーとソースを並べて確認",
        body: "ツリーでキー・値・型を変更するか、XML や JSON のソースを直接編集できます。項目の追加・複製・削除、入れ子構造の展開、キーと値の検索に対応し、XML plist、バイナリ plist、JSON として保存できます。",
      },
      {
        heading: "Apple の各種設定ファイルに対応",
        body: "通常の .plist に加え、Info.plist、entitlements、OpenCore config.plist、構成プロファイル、ローカライズファイルを確認できます。JSON は plist のすべての型を表現できないため、用途に合う出力形式を選んでください。",
      },
    ],
    faq: [
      privacy,
      {
        q: "バイナリ plist も開けますか？",
        a: "はい。bplist00 で始まるファイルを自動判別してツリーに表示し、XML や JSON に変換できます。",
      },
      platforms,
    ],
  },
  "/plist-viewer": {
    title: "Plist ビューアー — .plist ファイルを無料でオンライン表示",
    description:
      "XML、バイナリ、OpenStep の plist をブラウザーで表示。キー・型・値のツリーから内容を検索でき、Xcode やアップロードは不要です。",
    h1: "Plist ビューアー",
    tagline:
      ".plist ファイルをドロップしてキー・型・値を確認し、整形された XML や JSON も表示できます。",
    bullets: ["形式を自動判別", "ツリーとソース表示", "キーと値を検索", "ローカル処理"],
    sections: [
      {
        heading: "テキストエディターで文字化けする理由",
        body: "plist にはテキストの XML 形式とコンパクトなバイナリ形式があります。bplist00 で始まるバイナリファイルは通常のテキストエディターでは構造を読めません。このビューアーが形式を判別し、読みやすいツリーに変換します。",
      },
      {
        heading: "必要なキーをすばやく見つける",
        body: "ツールバーの検索欄で一致するキーや値を強調表示します。辞書や配列が深く入れ子になった Info.plist、環境設定、OpenCore 設定の確認に便利です。",
      },
    ],
    faq: [
      privacy,
      {
        q: "表示した後に編集できますか？",
        a: "はい。各行を編集し、XML、バイナリ、JSON のいずれかでダウンロードできます。",
      },
    ],
  },
  "/plist-editor": {
    title: "Plist オンラインエディター — Xcode なしで .plist を編集",
    description:
      "XML とバイナリのプロパティリストを無料で編集。ツリーでキー・型・値を変更し、キー順序を保ったまま XML またはバイナリ plist に保存できます。",
    h1: "Plist エディター",
    tagline:
      "Xcode のプロパティリストエディターのように、インストール不要で plist を編集できます。",
    bullets: [
      "キーと値を直接編集",
      "項目の追加・複製・削除",
      "型とキー順序を保持",
      "XML・バイナリで保存",
    ],
    sections: [
      {
        heading: "値の型を確認して編集",
        body: "同じ表示でも string、integer、real では意味が異なります。型の選択欄で明示的に指定し、辞書や配列を展開して子項目を追加できます。date、data、UID も独立した型として保持します。",
      },
      {
        heading: "差分を確認しやすい出力",
        body: "辞書の項目順序を保ち、不要なキーの並べ替えを避けます。保存前にソース表示で変更を確認してください。再シリアライズにより空白やインデントは変わる場合があるため、重要な設定は原本を残しましょう。",
      },
    ],
    faq: [privacy, platforms],
  },
  "/binary-plist-viewer": {
    title: "バイナリ Plist ビューアー — bplist00 をオンラインで表示",
    description:
      "Mac や plutil を使わずにバイナリ plist をブラウザーで確認。入れ子の辞書・配列・型付きの値を読み取り、XML に変換できます。",
    h1: "バイナリ Plist ビューアー",
    tagline: "文字化けして見える bplist00 ファイルを、読みやすいプロパティツリーとして表示します。",
    bullets: [
      "bplist00 を自動検出",
      "辞書と配列を展開",
      "date・data・UID に対応",
      "アップロード不要",
    ],
    sections: [
      {
        heading: "bplist00 とは？",
        body: "bplist00 は Apple のバイナリプロパティリストのヘッダーです。オブジェクト表と参照を使うため XML よりコンパクトですが、暗号化ではありません。文字化けしていてもファイルの破損とは限りません。",
      },
      {
        heading: "読みやすい XML に変換",
        body: "ファイルを開いたら XML ソースを確認するか、ダウンロードメニューから XML plist を選びます。構造と型は保持されますが、バイト単位で元ファイルと比較したい場合は原本も残してください。",
      },
    ],
    faq: [platforms, privacy],
  },
  "/binary-plist-editor": {
    title: "バイナリ Plist エディター — bplist00 を無料で編集",
    description:
      "バイナリプロパティリストをオンライン編集。ツリーでキーと値を変更してバイナリまたは XML に保存。Xcode、コマンドライン、アップロードは不要です。",
    h1: "バイナリ Plist エディター",
    tagline:
      "バイナリのプロパティリストを開き、ツリーで編集してバイナリまたは XML に保存できます。",
    bullets: [
      "bplist00 を直接開く",
      "型を指定して値を編集",
      "辞書のキー順序を保持",
      "ローカルでファイル生成",
    ],
    sections: [
      {
        heading: "事前の形式変換は不要",
        body: "バイナリ plist を選ぶと型付きモデルとして直接解析します。文字列、整数、実数、真偽値、日付、data、配列、辞書、UID を編集できます。",
      },
      {
        heading: "用途に合わせて書き出す",
        body: "ダウンロードメニューの Binary plist は新しい bplist00 ファイルを生成します。レビューやテキスト差分には XML が便利です。バイナリエンコード自体は元と異なる場合がありますが、モデルの値とキー順序を保持します。",
      },
    ],
    faq: [privacy, platforms],
  },
  "/binary-plist-to-xml": {
    title: "バイナリ Plist を XML に変換 — 無料の bplist00 変換ツール",
    description:
      "bplist00 を読みやすい XML に変換。plutil -convert xml1 の代わりにブラウザー内で処理でき、ソフトウェアのインストールは不要です。",
    h1: "バイナリ Plist → XML",
    tagline: "bplist00 をインデント付き XML に変換し、内容の確認や差分比較に利用できます。",
    bullets: [
      "バイナリ形式を自動判別",
      "plist の型を保持",
      "変換前に内容を確認",
      "XML plist をダウンロード",
    ],
    sections: [
      {
        heading: "変換の手順",
        body: "「ファイルを開く」を押すかバイナリ plist をドロップします。XML ソースを確認し、「XML plist をダウンロード」を押します。スマートフォンではソース表示に切り替えられます。拡張子は .plist のままです。",
      },
      {
        heading: "plutil との関係",
        body: "macOS では plutil -convert xml1 で属性リストを変換できます。本ツールは Mac やターミナルが使えない場面での代替手段です。形式を変換してもアプリ固有の設定ルールまでは検証しません。",
      },
    ],
    faq: [
      privacy,
      {
        q: "型の情報は失われますか？",
        a: "通常の plist の型は保持します。UID はバイナリアーカイブで使われる特殊な型なので、出力先のツールがその表現を扱えるか確認してください。",
      },
    ],
  },
  "/plist-to-json": {
    title: "Plist → JSON 変換 — XML・バイナリ・OpenStep に対応",
    description:
      "XML、バイナリ bplist00、OpenStep の plist を整形された JSON に無料変換。ブラウザー内で構造を確認でき、アップロードは不要です。",
    h1: "Plist → JSON",
    tagline: "Apple のプロパティリストを、スクリプトや開発ツールで使いやすい JSON に変換します。",
    bullets: [
      "3 種類の plist 形式に対応",
      "整形済み JSON を出力",
      "変換前に編集可能",
      "ローカル処理",
    ],
    sections: [
      {
        heading: "変換の手順",
        body: "plist を開くか XML を貼り付け、JSON ソースで結果を確認して「JSON をダウンロード」を押します。辞書はオブジェクト、配列は配列になります。日付と data の制限は下の表をご覧ください。",
      },
      {
        heading: "JSON の型の制約",
        body: "JSON は整数と実数を区別せず、date、data、UID の型も持ちません。日付は ISO 文字列、data は Base64、UID は数値になります。plist の型を完全に保ちたい場合は XML またはバイナリを使ってください。",
      },
    ],
    faq: [
      privacy,
      {
        q: "JSON から plist に戻せますか？",
        a: "可能ですが、JSON で失われた型情報は自動復元できません。日付、data、数値の型をツリーで再確認してください。",
      },
    ],
  },
  "/json-to-plist": {
    title: "JSON → Plist 変換 — XML・バイナリプロパティリストを生成",
    description:
      "JSON を Apple の plist に変換し、値の型を調整してから XML または bplist00 として保存。無料でアップロード不要です。",
    h1: "JSON → Plist",
    tagline:
      "JSON オブジェクトを XML またはバイナリの属性リストに変換し、保存前に型を確認できます。",
    bullets: [
      "JSON ソースを編集",
      "ツリーで構造を確認",
      "plist の型を明示的に指定",
      "XML・バイナリで書き出し",
    ],
    sections: [
      {
        heading: "JSON から作成する",
        body: "上の入力欄に JSON を貼り付けて「変換してプレビュー」を押すか、JSON ファイルを開きます。ツリーで型を確認して「XML plist をダウンロード」を選びます。バイナリは「他の形式」から保存できます。新規文書を作る必要はありません。",
      },
      {
        heading: "型の対応を確認",
        body: "JSON のオブジェクトは辞書、配列は配列になります。JSON には日付、data、UID、独立した real 型がないため、必要に応じてツリーで変更します。plist は null に対応しないため、空値は対象アプリの仕様に合わせてください。",
      },
    ],
    faq: [privacy, platforms],
  },
  "/plist-to-xml": {
    title: "Plist → XML 変換 — バイナリと OpenStep をオンライン変換",
    description:
      "バイナリ bplist00 や OpenStep をインデント付き XML plist に変換。値の型と辞書のキー順序を保ち、ブラウザー内で処理します。",
    h1: "Plist → XML",
    tagline: "さまざまな Apple プロパティリストを、読みやすい XML に統一できます。",
    bullets: [
      "バイナリ・OpenStep 対応",
      "整形済み XML を出力",
      "キーの順序を保持",
      "ブラウザー内で変換",
    ],
    sections: [
      {
        heading: "設定を読めるテキストにする",
        body: "ファイルを開くと XML ビューに属性リストの構造が表示されます。XML plist をダウンロードすれば、テキストエディターで読み、バージョン管理で差分を比較できます。",
      },
      {
        heading: "形式変換と設定検証は別",
        body: "正しい XML plist でも、対象アプリが認識しないキーを含む場合があります。変換はデータモデルを保持しますが、Xcode、OpenCore、デバイス管理ツール固有の検証を置き換えるものではありません。",
      },
    ],
    faq: [privacy, platforms],
  },
  "/xml-to-plist": {
    title: "XML → Plist 変換 — 構文確認とバイナリ書き出し",
    description:
      "XML プロパティリストを解析し、構文とツリー構造を確認して bplist00 または JSON に書き出します。インストールもアップロードも不要です。",
    h1: "XML → Plist",
    tagline: "XML プロパティリストを確認し、Apple のツールで使う形式に書き出します。",
    bullets: ["XML plist を解析", "構文をチェック", "型付きツリーを表示", "バイナリ・JSON で保存"],
    sections: [
      {
        heading: "plist 用の XML 構造が必要",
        body: "すべての XML が plist というわけではありません。plist ルート要素の中に dict、array、string、integer などの対応する要素が必要です。任意の XML 文書をそのまま plist に変換することはできません。",
      },
      {
        heading: "バイナリに書き出す",
        body: "有効な XML plist を開き、ダウンロードメニューから Binary plist を選びます。ソース編集中に解析エラーが出た場合は修正し、ツリーへの反映を確認してから保存してください。",
      },
    ],
    faq: [privacy, platforms],
  },
  "/mobileconfig-editor": {
    title: "Mobileconfig ビューアー＆エディター — Apple 構成プロファイルを検証",
    description:
      "署名付き・署名なしの .mobileconfig を表示、編集、検証。PayloadUUID、識別子、必須キーを確認し、必要な場合だけ AI リスクレビューを実行できます。",
    h1: "Mobileconfig ビューアー＆エディター",
    tagline: "Apple 構成プロファイルのペイロードと構造を確認し、適用される設定を把握できます。",
    bullets: [
      "署名付きプロファイルを読込",
      "必須キーと UUID を確認",
      "ペイロードを表示",
      "任意の AI 解説・リスク確認",
    ],
    sections: [
      {
        heading: "構造検証の対象",
        body: "PayloadType、PayloadIdentifier、PayloadUUID、PayloadVersion、PayloadContent などを確認し、値の欠落、識別子の重複、型の誤りを通知します。実機での配布テストを置き換えるものではありません。",
      },
      {
        heading: "署名と書き出し",
        body: "署名付きファイルは内容と証明書名を読み取りますが、署名の真正性は検証しません。編集後のダウンロードには元の署名が付かないため、配布前に再署名が必要です。",
      },
      {
        heading: "AI 解析は任意",
        body: "通常の表示・編集・検証はローカルで行います。AI レビューを実行すると、パスワード、鍵、証明書データをクライアント側で除去してから設定された AI プロバイダーに送信します。独自の機密フィールドまで完全に検出できるとは限りません。",
      },
    ],
    faq: [
      privacy,
      {
        q: "構造が有効なら安全にインストールできますか？",
        a: "いいえ。構造の正しさは信頼性や安全性の保証ではありません。提供元、設定の作用、署名、組織のポリシーを確認してください。",
      },
    ],
  },
  "/entitlements-editor": {
    title: "Entitlements エディター — .entitlements をオンラインで編集・検証",
    description:
      "Xcode entitlements の型、関連ドメイン、リリース時の get-task-allow、Hardened Runtime 例外をブラウザーで確認します。",
    h1: "Entitlements エディター",
    tagline: "アプリが要求する機能を確認し、.entitlements を編集してよくある設定ミスを検出します。",
    bullets: [
      "型を指定して権限キーを編集",
      "関連ドメインを確認",
      "デバッグ権限のリスクを表示",
      ".entitlements をローカル出力",
    ],
    sections: [
      {
        heading: "Entitlements の役割",
        body: "Entitlements はコード署名に含まれる機能の宣言です。App Groups、iCloud、プッシュ通知、キーチェーン共有、App Sandbox などに使われます。通常は XML plist ですが、記述するだけで開発者アカウントに権限が付与されるわけではありません。",
      },
      {
        heading: "よくある問題を確認",
        body: "主なキーの型、associated-domains の形式、get-task-allow、高リスクな Hardened Runtime 例外を確認します。リリース前には provisioning profile と最終的なコード署名も併せて検証してください。",
      },
    ],
    faq: [
      privacy,
      {
        q: "編集すればアプリでその機能を使えますか？",
        a: "アカウントとプロビジョニングプロファイルの条件に合う entitlements を用いて、アプリを再署名する必要があります。",
      },
    ],
  },
  "/mobileprovision-viewer": {
    title: "Mobileprovision ビューアー — プロビジョニングプロファイルを確認",
    description:
      ".mobileprovision と .provisionprofile の有効期限、チーム、App ID、デバイス、証明書、entitlements を確認し、権限情報を抽出します。",
    h1: "Mobileprovision ビューアー",
    tagline: "プロビジョニングプロファイルをブラウザーで読み取り、署名に必要な情報を確認します。",
    bullets: [
      "有効期限とチームを確認",
      "App ID とデバイスを表示",
      "証明書情報を表示",
      "entitlements を抽出",
    ],
    sections: [
      {
        heading: "プロファイルの適合性を確認",
        body: "チーム識別子、アプリ識別子、プラットフォーム、許可デバイス、有効期限を確認できます。よくある構造上の問題や期限切れを表示しますが、Apple に発行状態や失効状態を問い合わせることはありません。",
      },
      {
        heading: "抽出は再署名ではありません",
        body: "内部の plist 全体や Entitlements を書き出せますが、出力には元の CMS 署名がありません。Xcode が必要とする署名済みプロビジョニングプロファイルの代わりには使えません。",
      },
    ],
    faq: [
      privacy,
      {
        q: "Apple の署名を検証しますか？",
        a: "いいえ。内容を取り出して表示するだけで、証明書名の表示は暗号学的な署名検証を意味しません。",
      },
    ],
  },
  "/opencore-config-editor": {
    title: "OpenCore config.plist エディター＆検証ツール — オンライン対応",
    description:
      "OpenCore config.plist を編集し、kext 順序、パッチ、SMBIOS、SIP、安全設定を確認。Base64・16 進数・整数の変換ツールも利用できます。",
    h1: "OpenCore config.plist エディター",
    tagline: "OpenCore 設定を表示・編集し、構造や設定によくある問題を事前に確認します。",
    bullets: [
      "主な設定セクションを確認",
      "kext 順序の問題を通知",
      "安全関連の設定をチェック",
      "data 値の変換ツール",
    ],
    sections: [
      {
        heading: "チェックの範囲",
        body: "主なセクション、配列項目、フィールドの型を検証し、パッチ、SMBIOS、SIP、起動セキュリティの一部について注意点を表示します。すべての OpenCore バージョンやハードウェア構成を網羅するものではありません。",
      },
      {
        heading: "data フィールドを扱う",
        body: "Base64、16 進数、リトルエンディアン整数の変換で plist data 値を確認できます。設定を適用する前に起動可能な EFI のバックアップを残し、使用中の OpenCore に対応する ocvalidate で最終検証してください。",
      },
    ],
    faq: [
      privacy,
      {
        q: "ocvalidate やハードウェア調整を置き換えられますか？",
        a: "いいえ。よくある問題を見つける補助ツールであり、その設定で起動できることや機器への適合性は保証しません。",
      },
    ],
  },
  "/strings-editor": {
    title: ".strings エディター — Localizable.strings をオンライン編集・検証",
    description:
      "iOS・macOS の .strings を編集し、文字列以外の値、重複キー、書式プレースホルダーを確認。キー順序を保って書き出します。",
    h1: ".strings エディター",
    tagline: "Apple のローカライズ文字列をツリーで編集し、キーと値やプレースホルダーを確認します。",
    bullets: [
      "Localizable.strings を開く",
      "重複キーを検出",
      "書式プレースホルダーを確認",
      "項目の順序を保持",
    ],
    sections: [
      {
        heading: ".strings の形式",
        body: '一般的には "welcome" = "Hello"; のようにキーと値を引用符で囲みます。XML やバイナリ plist として保存されたファイルもあります。対応形式を判別して内容を表示します。',
      },
      {
        heading: "プレースホルダーを揃える",
        body: "翻訳時には %@、%d、位置指定付きのプレースホルダーを維持してください。単一ファイルの書式上の問題は確認できますが、言語間の意味や引数が完全に一致することまでは検証しません。書き出し時のコメント保持も保証しません。",
      },
    ],
    faq: [
      privacy,
      {
        q: ".strings に書き戻せますか？",
        a: "はい。最上位の辞書の値がすべて文字列なら、ダウンロードメニューで .strings を選べます。",
      },
    ],
  },
  "/stringsdict-editor": {
    title: ".stringsdict エディター — iOS の複数形ルールをオンライン編集",
    description:
      "Apple の .stringsdict を表示・編集。NSStringLocalizedFormatKey、複数形カテゴリ、書式指定を確認し、型とキー順序を保持します。",
    h1: ".stringsdict エディター",
    tagline: "ローカライズの複数形ルールを編集し、書式文字列と変数の対応を確認します。",
    bullets: ["入れ子のルール辞書を表示", "書式キーを検証", "複数形カテゴリを確認", "値の型を保持"],
    sections: [
      {
        heading: "複数形ルールの構造",
        body: "NSStringLocalizedFormatKey は %#@変数名@ でルール辞書を参照します。通常、その辞書には NSStringFormatSpecTypeKey、NSStringFormatValueTypeKey、one や other などの分岐を定義します。",
      },
      {
        heading: "言語ごとに異なるカテゴリ",
        body: "必要な複数形カテゴリは言語によって異なり、すべてが英語の one／other に従うわけではありません。other の欠落、型の誤り、一般的な書式の不一致を検出できますが、実際の出力はシステムのローカライズ API でも確認してください。",
      },
    ],
    faq: [
      privacy,
      {
        q: "翻訳を自動生成しますか？",
        a: "いいえ。ルールの編集と検証のためのツールです。翻訳文とその言語に必要な複数形は別途確認してください。",
      },
    ],
  },
  "/xcconfig-editor": {
    title: "xcconfig エディター — Xcode のビルド設定をオンライン編集・検証",
    description:
      ".xcconfig の構文、条件、include、YES/NO、デプロイ対象、チーム ID を確認。コメント・include・行順序を保ち、ローカルで編集します。",
    h1: "xcconfig エディター",
    tagline: "Xcode のビルド設定を表またはソースで編集し、コメント・include・行順序を保持します。",
    bullets: [
      "表とソースが同期",
      "構文と条件をチェック",
      "注意が必要な設定を表示",
      "コメントと行順序を保持",
    ],
    sections: [
      {
        heading: "対応する構文",
        body: "各行は KEY = value、// コメント、#include または #include? を記述できます。条件には sdk、arch、config などを使い、[sdk=iphoneos*] や [config=Release] のように指定します。",
      },
      {
        heading: "検証の範囲",
        body: "一般的な真偽値、デプロイ対象、Team ID、注意が必要な設定を確認します。include が参照するローカルファイルの読込や Xcode の変数展開・ビルドは行わないため、最終結果は Xcode で検証してください。",
      },
    ],
    faq: [
      privacy,
      {
        q: "設定を並べ替えたりコメントを削除したりしますか？",
        a: "行単位のモデルを使い、未変更の行、コメント、include をできるだけそのまま保持して不要な差分を抑えます。",
      },
    ],
  },
  "/how-to-open-plist-on-windows": {
    title: "Windows で .plist を開く方法 — バイナリ plist にも対応",
    description:
      "インストール不要で Windows 上の XML や bplist00 を表示・編集。文字化けの原因と、読みやすい形式への変換手順を解説します。",
    h1: "Windows で plist を開く方法",
    tagline:
      "Windows に plist エディターがなくても、ブラウザーで XML・バイナリ・OpenStep を読み取れます。",
    bullets: ["Mac・Xcode 不要", "bplist00 に対応", "ローカル処理", "XML・JSON に書き出し"],
    sections: [
      {
        heading: "手順 1：ファイルを開く",
        body: "上の「ファイルを開く」を選ぶか .plist をドロップします。XML とバイナリは自動判別され、拡張子の変更は不要です。解析はブラウザー内で行います。",
      },
      {
        heading: "手順 2：表示・編集する",
        body: "ツリーで辞書や配列を展開し、キー・型・値を確認します。検索欄で設定を探すか、XML・JSON ソースを読みます。変更前に元ファイルを保存しておくと復元できます。",
      },
      {
        heading: "手順 3：必要な形式で保存",
        body: "メモ帳や VS Code で読むなら XML plist、対象アプリがバイナリを必要とするなら Binary plist を選びます。拡張子だけでは実際のエンコードを判断できません。",
      },
      {
        heading: "メモ帳で文字化けする理由",
        body: "bplist00 で始まるファイルはバイナリ形式です。.plist を .xml に改名しても内容は変換されません。プロパティリストのパーサーを使って XML を生成する必要があります。",
      },
      {
        heading: "ほかの方法",
        body: "Mac では Xcode や plutil、ほかの OS ではバイナリ plist 対応エディターも利用できます。出所が不明な設定は、内容を読めたからといってインストールしたり実行したりしないでください。",
      },
    ],
    faq: [
      privacy,
      {
        q: ".xml に改名すれば読めますか？",
        a: "元が XML ならテキストエディターで読めますが、バイナリなら実際の形式変換が必要です。改名だけでは変わりません。",
      },
    ],
  },
  "/what-is-a-plist-file": {
    title: ".plist ファイルとは？Apple プロパティリストの形式と型を解説",
    description:
      "plist の用途、XML・バイナリ・OpenStep の違い、Windows・macOS・Linux での開き方を紹介します。",
    h1: ".plist ファイルとは？",
    tagline:
      "Plist は property list の略で、Apple プラットフォームの構造化された設定やメタデータに使われます。",
    bullets: [
      "辞書・配列・型付きの値",
      "XML・バイナリ・OpenStep",
      "拡張子だけで形式は決まらない",
      "各 OS で表示可能",
    ],
    sections: [
      {
        heading: "何を保存するファイル？",
        body: "Info.plist、環境設定、LaunchAgent、entitlements、デバイス構成プロファイルなどに使われます。キーの意味は各アプリが定義するため、同じ plist 形式でも互換性があるとは限りません。",
      },
      {
        heading: "値の型",
        body: "string、integer、real、boolean、date、data、array、dict でデータを表現します。バイナリアーカイブでは UID 参照も使われます。辞書は名前付きキーを持ち、配列は順序付きの項目を格納します。",
      },
      {
        heading: "XML 形式",
        body: "plist ルート要素と dict、key、string などのタグを使います。直接読めるためバージョン管理に向きますが、タグによる容量の増加があります。",
      },
      {
        heading: "バイナリと OpenStep",
        body: "バイナリ plist は bplist00 で始まり、オブジェクト表と参照で効率よく保存します。OpenStep は古いテキスト構文で、波括弧を辞書、丸括弧を配列に使います。現代の plist の型をすべて同じようには表現できません。",
      },
      {
        heading: "開き方と変換",
        body: "上のエディターで開き、ツリーを確認して XML・バイナリ・JSON に書き出せます。JSON はスクリプトとの連携に便利ですが、すべての型は保持しません。再シリアライズでインデントやコメントが変わる場合もあります。",
      },
    ],
    faq: [
      {
        q: "plist は暗号化されていますか？",
        a: "通常は暗号化ではありません。バイナリの文字化けはエンコードによるものです。署名付き・暗号化された構成プロファイルには別のラッパーが付く場合があります。",
      },
      privacy,
    ],
  },
  "/xml-vs-binary-plist": {
    title: "XML とバイナリ Plist の違い — 形式の比較と変換方法",
    description:
      "読みやすい XML とコンパクトな bplist00 を比較。可読性、容量、型の保持、ブラウザーでの相互変換について解説します。",
    h1: "XML とバイナリ Plist の違い",
    tagline: "同じ属性リストのモデルを保存する形式ですが、読みやすさとエンコード方式が異なります。",
    bullets: [
      "XML は読みやすく差分比較に便利",
      "バイナリはコンパクト",
      "どちらも型付きの値を保持",
      "ブラウザーで相互変換",
    ],
    sections: [
      {
        heading: "形式を見分ける",
        body: "XML は XML 宣言や plist 要素、バイナリは bplist00 で始まります。どちらも .plist 拡張子を使うため、ファイル名だけで判断できません。",
      },
      {
        heading: "XML の利点",
        body: "通常のテキストエディターで読めるので、コードレビューや差分比較に適しています。タグで型を確認しやすい一方、容量は増えます。data 値は通常 Base64 で表します。",
      },
      {
        heading: "バイナリの利点",
        body: "オブジェクト表、オフセット、参照を使い、一般に XML より小さく保存できます。表示には専用パーサーが必要で、バイト列を直接編集するとファイルを壊すおそれがあります。",
      },
      {
        heading: "変換と型の保持",
        body: "ファイルを開き、ダウンロードメニューで XML または Binary plist を選びます。通常の型とキー順序は保持しますが、出力バイトやテキストの書式は元と一致するとは限りません。UID は利用先の対応を確認してください。",
      },
      {
        heading: "どちらを選ぶべき？",
        body: "共同作業やレビューには XML が便利で、実行時には対象アプリの要件に従います。macOS の plutil -convert xml1 と plutil -convert binary1 でも変換できます。実行前にバックアップを残してください。",
      },
    ],
    faq: [
      {
        q: "バイナリの方が安全ですか？",
        a: "いいえ。保存形式の違いであり、機密性を提供しません。対応するパーサーがあれば内容を読めます。",
      },
      privacy,
    ],
  },
};
