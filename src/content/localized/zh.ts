import { trustPages } from "../trust";
import type { PageCatalog } from "./types";

const privacy = {
  q: "文件会上传到服务器吗？",
  a: "查看、编辑和导出都在浏览器本地进行。仅当你主动使用 AI 配置描述文件审查时，才会发送脱敏后的内容。",
};
const platforms = {
  q: "需要 Mac 或 Xcode 吗？",
  a: "不需要。使用 Windows、macOS 或 Linux 上的现代浏览器即可。",
};

export const zh: PageCatalog = {
  ...trustPages.zh,
  "/": {
    title: "Plist 在线查看器与编辑器 — 打开、编辑和转换 .plist 文件",
    description:
      "免费在线查看和编辑 XML、二进制 bplist00 与 OpenStep 属性列表。在树形视图中修改键值，转换为 XML、二进制或 JSON，文件在浏览器本地处理。",
    h1: "Plist 查看器与编辑器",
    tagline:
      "直接在浏览器中打开、查看和编辑 XML、二进制及 OpenStep plist。支持 Windows、macOS 和 Linux，无需安装 Xcode。",
    bullets: [
      "支持 XML、二进制和 OpenStep",
      "树形视图与源码同步编辑",
      "保留键顺序和值类型",
      "文件在浏览器本地处理",
    ],
    sections: [
      {
        heading: "保留真正的 plist 类型",
        body: "属性列表中的 integer、real、date、data 和 UID 各有含义。编辑器使用有序、带类型的数据模型，避免把整数 1 与实数 1.0 混为一谈，并保留字典键的顺序。导出会重新序列化内容，不保证原文件的缩进和注释不变。",
      },
      {
        heading: "树形视图与源码视图",
        body: "在树中修改键、值和类型，或直接编辑 XML 与 JSON 源码。可以新增、复制、删除条目，展开嵌套结构，用搜索框查找键和值，再下载为 XML plist、二进制 plist 或 JSON。",
      },
      {
        heading: "支持常见 Apple 配置文件",
        body: "除了普通 .plist，还可以检查 Info.plist、entitlements、OpenCore config.plist、配置描述文件与本地化文件。JSON 无法完整表达 plist 的所有类型，转换前请确认目标格式是否适合。",
      },
    ],
    faq: [
      privacy,
      {
        q: "能打开二进制 plist 吗？",
        a: "可以。以 bplist00 开头的二进制文件会被自动识别并显示为可读的树，也可转换为 XML 或 JSON。",
      },
      platforms,
    ],
  },
  "/plist-viewer": {
    title: "Plist 在线查看器 — 免费打开和查看 .plist 文件",
    description:
      "在浏览器中查看 XML、二进制和 OpenStep plist。以键、类型和值组成的树形结构浏览文件，搜索内容，无需 Xcode 或上传文件。",
    h1: "Plist 查看器",
    tagline: "拖入 .plist 文件，以清晰的键／类型／值树查看内容，或切换到格式化的 XML 和 JSON。",
    bullets: ["自动识别文件格式", "树形视图与源码视图", "搜索键和值", "本地处理"],
    sections: [
      {
        heading: "为什么 plist 用记事本打开是乱码？",
        body: "plist 既可以保存为文本 XML，也可以保存为紧凑的二进制格式。二进制文件以 bplist00 开头，普通文本编辑器无法直接展示其结构。本工具会识别格式并还原可读的属性树。",
      },
      {
        heading: "快速找到需要的键",
        body: "使用工具栏的搜索框，高亮匹配的键或值。对于包含多层字典和数组的 Info.plist、偏好设置或 OpenCore 配置，这比逐行检查源码更方便。",
      },
    ],
    faq: [
      privacy,
      { q: "查看后可以修改吗？", a: "可以。树中的行可以编辑，修改后可下载为 XML、二进制或 JSON。" },
    ],
  },
  "/plist-editor": {
    title: "Plist 在线编辑器 — 无需 Xcode 编辑 .plist 文件",
    description:
      "免费编辑 XML 和二进制 plist。在树形视图中修改键、类型和值，保留键顺序，再导出为 XML 或二进制 plist。",
    h1: "Plist 编辑器",
    tagline: "像使用 Xcode 属性列表编辑器一样修改 plist，无需安装任何软件。",
    bullets: [
      "行内编辑键和值",
      "新增、复制、删除条目",
      "保留类型与键顺序",
      "下载 XML 或二进制文件",
    ],
    sections: [
      {
        heading: "编辑前先确认类型",
        body: "同样的文字可能对应 string、integer 或 real。通过类型下拉框显式选择类型；字典和数组可以展开并添加子项。日期、二进制数据和 UID 也会在模型中保留独立类型。",
      },
      {
        heading: "便于版本控制的输出",
        body: "编辑器保留字典条目的顺序，减少无关的键重排。保存前可对照源码视图检查修改；重新序列化仍可能改变缩进或空白，重要配置建议保留原件。",
      },
    ],
    faq: [privacy, platforms],
  },
  "/binary-plist-viewer": {
    title: "二进制 Plist 查看器 — 在线打开 bplist00 文件",
    description:
      "无需 Mac 或 plutil，在浏览器中查看 bplist00 二进制属性列表。还原嵌套字典、数组和带类型的值，支持转换为 XML。",
    h1: "二进制 Plist 查看器",
    tagline: "把看似乱码的 bplist00 文件转换为可读的属性树，直接在浏览器中查看。",
    bullets: ["自动检测 bplist00", "显示嵌套字典与数组", "支持日期、data 和 UID", "无需上传"],
    sections: [
      {
        heading: "什么是 bplist00？",
        body: "bplist00 是 Apple 二进制属性列表的文件头。二进制格式用对象表和引用保存数据，比 XML 更紧凑，但并不是加密。文本编辑器看到的乱码不代表文件损坏。",
      },
      {
        heading: "转换为可读 XML",
        body: "打开文件后，在源码视图查看 XML，或从下载菜单导出 XML plist。结构和类型会被保留；如需与原文件逐字节比较，应保留二进制原件。",
      },
    ],
    faq: [platforms, privacy],
  },
  "/binary-plist-editor": {
    title: "二进制 Plist 编辑器 — 免费在线编辑 bplist00",
    description:
      "在线编辑二进制 bplist00 文件。在树中修改键和值，再保存为二进制或 XML plist，无需 Xcode、命令行或上传文件。",
    h1: "二进制 Plist 编辑器",
    tagline: "打开二进制属性列表，在树形视图中修改，再导出为二进制或 XML。",
    bullets: ["打开 bplist00 文件", "按类型编辑数值", "保留字典键顺序", "本地生成下载文件"],
    sections: [
      {
        heading: "不必先手动转换格式",
        body: "选择二进制 plist 后，编辑器会直接解析成带类型的模型。你可以修改字符串、整数、实数、布尔值、日期、data、数组、字典和 UID。",
      },
      {
        heading: "选择合适的导出格式",
        body: "下载菜单中的 Binary plist 会生成新的 bplist00 文件。若需要代码审查或文本差异比较，可同时导出 XML。二进制编码可能与原文件不同，但模型中的值和键顺序会保留。",
      },
    ],
    faq: [privacy, platforms],
  },
  "/binary-plist-to-xml": {
    title: "二进制 Plist 转 XML — 在线 bplist00 转换器",
    description:
      "将二进制 bplist00 转换为可读 XML。作为 plutil -convert xml1 的浏览器替代方案，无需安装软件，文件在本地处理。",
    h1: "二进制 Plist 转 XML",
    tagline: "将 bplist00 转换为带缩进的 XML，便于阅读、版本控制和排查配置问题。",
    bullets: ["自动识别二进制格式", "保留 plist 类型", "转换前可检查内容", "下载 XML plist"],
    sections: [
      {
        heading: "如何转换",
        body: "点击“打开文件”或拖入二进制 plist。右侧显示 XML 源码，手机端可切换到源码视图。检查后点击“下载 XML plist”；文件仍使用 .plist 扩展名。",
      },
      {
        heading: "与 plutil 的关系",
        body: "macOS 可使用 plutil -convert xml1 转换属性列表。本工具提供浏览器内的替代操作，适合没有 Mac 或不想使用终端的场景。转换不会验证应用专有的配置规则。",
      },
    ],
    faq: [
      privacy,
      {
        q: "转换会丢失类型吗？",
        a: "常规 plist 类型会保留。UID 是二进制归档中的特殊类型，导出时应确认目标工具是否支持相应表示。",
      },
    ],
  },
  "/plist-to-json": {
    title: "Plist 转 JSON — 在线转换 XML、二进制和 OpenStep",
    description:
      "免费将 XML、bplist00 二进制或 OpenStep 属性列表转换为 JSON。在浏览器中检查结构，文件无需上传。",
    h1: "Plist 转 JSON",
    tagline: "把 Apple 属性列表转换成格式化的 JSON，方便与脚本和其他开发工具配合使用。",
    bullets: ["支持三种 plist 格式", "格式化 JSON 输出", "转换前可编辑", "本地处理"],
    sections: [
      {
        heading: "转换步骤",
        body: "打开 plist 或粘贴 XML 后，在 JSON 源码视图检查输出，点击“下载 JSON”。嵌套字典映射为对象，数组映射为数组；日期与 data 的类型限制见下表。",
      },
      {
        heading: "JSON 的类型限制",
        body: "JSON 不区分整数与实数，也没有 date、data 或 UID 类型。日期会输出为 ISO 时间字符串，data 输出为 Base64，UID 输出为数字。需要无损保留 plist 类型时，应使用 XML 或二进制格式。",
      },
    ],
    faq: [
      privacy,
      {
        q: "能把 JSON 再转回 plist 吗？",
        a: "可以，但 JSON 中已经丢失的类型信息无法自动恢复。请在树形编辑器中重新确认日期、data 及数值类型。",
      },
    ],
  },
  "/json-to-plist": {
    title: "JSON 转 Plist — 在线生成 XML 或二进制属性列表",
    description:
      "将 JSON 转换为 Apple plist，在下载前调整每个值的类型。支持 XML 和二进制 bplist00 输出，免费且无需上传。",
    h1: "JSON 转 Plist",
    tagline: "把 JSON 对象转换为 XML 或二进制属性列表，并在导出前确认值类型。",
    bullets: ["编辑 JSON 源码", "树形视图检查结构", "显式调整 plist 类型", "导出 XML 或二进制"],
    sections: [
      {
        heading: "从 JSON 开始",
        body: "在上方直接粘贴 JSON 并点击“转换并预览”，或打开 JSON 文件。检查树中的类型后，点击“下载 XML plist”；需要二进制时使用“其他格式”。无需先新建文档。",
      },
      {
        heading: "导出前检查映射",
        body: "JSON 对象对应字典，数组对应数组。JSON 没有日期、data、UID 和独立的 real 类型，因此需要时应在树中手动指定。plist 不支持 JSON 的 null，空值应按目标应用的要求处理。",
      },
    ],
    faq: [privacy, platforms],
  },
  "/plist-to-xml": {
    title: "Plist 转 XML — 二进制与 OpenStep 在线转换",
    description:
      "把二进制 bplist00 或 OpenStep plist 转换为带缩进的 XML 属性列表，保留值类型和字典键顺序，无需上传文件。",
    h1: "Plist 转 XML",
    tagline: "把不同格式的 Apple 属性列表统一转换成易读的 XML。",
    bullets: ["支持二进制与 OpenStep", "格式化 XML 输出", "保留键顺序", "浏览器本地转换"],
    sections: [
      {
        heading: "将配置变为可读文本",
        body: "打开文件后，XML 视图会展示完整的属性列表结构。下载 XML plist 后，可以用文本编辑器打开，也可以纳入版本控制进行差异比较。",
      },
      {
        heading: "格式转换不等于配置验证",
        body: "合法的 XML plist 仍可能包含目标应用不认识的键。转换保留数据模型，但不会替代 Xcode、OpenCore 或设备管理工具各自的语义验证。",
      },
    ],
    faq: [privacy, platforms],
  },
  "/xml-to-plist": {
    title: "XML 转 Plist — 在线检查语法并导出二进制文件",
    description:
      "在线解析 XML 属性列表，检查语法、查看树形结构，再导出为二进制 bplist00 或 JSON。无需安装或上传文件。",
    h1: "XML 转 Plist",
    tagline: "检查 XML 属性列表并导出为 Apple 工具需要的 plist 格式。",
    bullets: ["解析 XML plist", "检查语法", "查看带类型的树", "下载二进制或 JSON"],
    sections: [
      {
        heading: "需要符合 plist 的 XML 结构",
        body: "并非所有 XML 都是 plist。文件应使用 plist 根元素，并包含 dict、array、string、integer 等属性列表支持的节点。任意 XML 文档不能直接转换为 plist。",
      },
      {
        heading: "导出为二进制",
        body: "打开合法 XML plist 后，在下载菜单选择 Binary plist。若编辑源码时出现解析错误，先修复错误并确认树形视图已同步，再导出文件。",
      },
    ],
    faq: [privacy, platforms],
  },
  "/mobileconfig-editor": {
    title: "Mobileconfig 查看器与编辑器 — 在线校验 Apple 配置描述文件",
    description:
      "查看、编辑和校验 .mobileconfig 配置描述文件，包括已签名文件。检查 PayloadUUID、标识符及必填键，并可主动选择 AI 风险审查。",
    h1: "Mobileconfig 查看器与编辑器",
    tagline: "检查 Apple 配置描述文件的载荷和结构，了解设备将应用哪些设置。",
    bullets: [
      "读取已签名与未签名文件",
      "检查必填键和 UUID",
      "查看配置载荷",
      "可选 AI 解释与风险审查",
    ],
    sections: [
      {
        heading: "结构校验覆盖什么",
        body: "工具检查 PayloadType、PayloadIdentifier、PayloadUUID、PayloadVersion 和 PayloadContent 等常见字段，提示缺失值、重复标识符或类型错误。检查结果不能替代实际设备上的部署测试。",
      },
      {
        heading: "签名与导出",
        body: "已签名文件会解包显示内容及证书名称，但这里不验证签名真实性。修改后下载的描述文件没有原签名，分发前需要重新签名。",
      },
      {
        heading: "AI 分析是主动选择",
        body: "普通查看、编辑和校验均在本地进行。点击 AI 审查后，密码、密钥和证书数据会先进行客户端脱敏，再发送给配置的 AI 服务商解释配置及潜在风险。自动脱敏无法保证识别每一种自定义敏感字段。",
      },
    ],
    faq: [
      privacy,
      {
        q: "显示有效就能安全安装吗？",
        a: "不能。结构有效不代表配置可信或安全。安装前应核实来源、载荷作用、签名与组织策略。",
      },
    ],
  },
  "/entitlements-editor": {
    title: "Entitlements 编辑器 — 在线编辑和校验 .entitlements",
    description:
      "在浏览器中编辑 Xcode entitlements，检查类型、关联域名、发布构建中的 get-task-allow 与 Hardened Runtime 例外。",
    h1: "Entitlements 编辑器",
    tagline: "查看应用请求的能力，编辑 .entitlements 文件，并发现常见配置错误。",
    bullets: ["按类型编辑权限键", "校验关联域名", "提示调试权限风险", "本地导出 .entitlements"],
    sections: [
      {
        heading: "Entitlements 的作用",
        body: "Entitlements 是代码签名中的能力声明，涉及 App Groups、iCloud、推送通知、钥匙串访问组及 App Sandbox 等。文件通常使用 XML plist，但声明并不会自动赋予开发者账号相应权限。",
      },
      {
        heading: "检查常见问题",
        body: "工具检查常见键的值类型、associated-domains 的格式、get-task-allow 以及高风险的 Hardened Runtime 例外。发布前仍需结合 provisioning profile 和最终代码签名验证。",
      },
    ],
    faq: [
      privacy,
      {
        q: "编辑后应用就会拥有这些能力吗？",
        a: "不会。应用需要使用符合账号和描述文件要求的 entitlements 重新签名。",
      },
    ],
  },
  "/mobileprovision-viewer": {
    title: "Mobileprovision 查看器 — 在线检查 Apple 预置描述文件",
    description:
      "打开 .mobileprovision 与 .provisionprofile，查看有效期、团队、App ID、设备、证书和 entitlements，并提取权限配置。",
    h1: "Mobileprovision 查看器",
    tagline: "在浏览器中读取 provisioning profile，快速检查签名所需的信息。",
    bullets: ["查看有效期和团队", "检查 App ID 与设备", "显示证书信息", "提取 entitlements"],
    sections: [
      {
        heading: "检查描述文件是否匹配",
        body: "查看团队标识、应用标识、平台、授权设备和有效期。工具会提示常见结构问题及过期信息，但不会联系 Apple 验证签发状态或撤销状态。",
      },
      {
        heading: "提取内容不等于重新签名",
        body: "可以导出描述文件内部的 plist 或单独提取 Entitlements。导出的内容没有原 CMS 签名，不能替代 Xcode 所需的已签名 provisioning profile。",
      },
    ],
    faq: [
      privacy,
      {
        q: "是否验证了 Apple 签名？",
        a: "没有。工具只解包并读取内容，证书名称不等同于密码学签名验证结果。",
      },
    ],
  },
  "/opencore-config-editor": {
    title: "OpenCore config.plist 在线编辑器与校验器",
    description:
      "在浏览器中编辑 OpenCore config.plist，检查 kext 顺序、补丁、SMBIOS、SIP 与安全设置，并使用 Base64、Hex 和整数转换工具。",
    h1: "OpenCore config.plist 编辑器",
    tagline: "查看、编辑和初步检查 OpenCore 配置，避免常见的结构与设置错误。",
    bullets: ["检查常见配置区段", "提示 kext 顺序问题", "检查安全相关设置", "内置 data 转换工具"],
    sections: [
      {
        heading: "配置检查的范围",
        body: "工具检查常见区段、数组条目和字段类型，并提示部分补丁、SMBIOS、SIP 与启动安全设置中的可疑值。规则是辅助检查，并不覆盖所有 OpenCore 版本和硬件组合。",
      },
      {
        heading: "处理 data 字段",
        body: "Base64、十六进制和小端整数转换器可帮助理解 plist data 值。配置应用前应保留可启动的 EFI 备份，并使用与你的 OpenCore 版本配套的 ocvalidate 进行最终校验。",
      },
    ],
    faq: [
      privacy,
      {
        q: "能替代 ocvalidate 或硬件调试吗？",
        a: "不能。这里的检查用于辅助发现常见问题，无法保证配置可启动或适用于你的设备。",
      },
    ],
  },
  "/strings-editor": {
    title: ".strings 在线编辑器 — 编辑与校验 Localizable.strings",
    description:
      "编辑 iOS 和 macOS 的 .strings 本地化文件，检查非字符串值、重复键及格式占位符，并保留键顺序导出。",
    h1: ".strings 编辑器",
    tagline: "在表格化的属性树中编辑 Apple 本地化字符串，检查键值与占位符。",
    bullets: ["打开 Localizable.strings", "检查重复键", "检查格式占位符", "保留条目顺序"],
    sections: [
      {
        heading: ".strings 的格式",
        body: '常见格式是带引号的键和值，例如 "welcome" = "Hello";。文件也可能以 XML 或二进制 plist 保存。编辑器会识别支持的格式，便于批量浏览和修改。',
      },
      {
        heading: "占位符需要保持一致",
        body: "翻译时应保留 %@、%d 或带位置编号的占位符。工具检查单个文件中的常见格式问题，但不能自动证明不同语言文件之间的语义和参数完全一致。导出会重新生成文件，不保证保留原注释。",
      },
    ],
    faq: [
      privacy,
      {
        q: "可以导出回 .strings 吗？",
        a: "可以。当顶层字典中的所有值都是字符串时，下载菜单会提供 .strings 输出。",
      },
    ],
  },
  "/stringsdict-editor": {
    title: ".stringsdict 在线编辑器 — 编辑 iOS 复数规则",
    description:
      "查看和编辑 Apple .stringsdict 复数规则，检查 NSStringLocalizedFormatKey、复数类别及格式声明，保留类型和键顺序。",
    h1: ".stringsdict 编辑器",
    tagline: "检查和编辑本地化复数规则，理解格式字符串与变量之间的关系。",
    bullets: ["查看嵌套规则字典", "检查格式键", "检查复数类别", "保留值类型"],
    sections: [
      {
        heading: "复数规则如何组织",
        body: "NSStringLocalizedFormatKey 使用 %#@变量名@ 引用规则字典。字典通常包含 NSStringFormatSpecTypeKey、NSStringFormatValueTypeKey 以及 one、other 等复数分支。",
      },
      {
        heading: "语言与复数类别",
        body: "不同语言需要的复数类别不同，并非每种语言都使用英语的 one／other 组合。工具可以发现缺少 other、错误类型或常见格式不一致，但仍应通过系统本地化 API 测试实际输出。",
      },
    ],
    faq: [
      privacy,
      {
        q: "工具会自动生成翻译吗？",
        a: "不会。它用于编辑与校验规则，具体翻译和语言对应的复数形式需要自行确认。",
      },
    ],
  },
  "/xcconfig-editor": {
    title: "xcconfig 在线编辑器 — 查看、编辑和校验 Xcode 构建设置",
    description:
      "编辑 .xcconfig，检查语法、条件、include、YES/NO 值、部署版本及团队标识。保留注释、包含指令与行顺序，本地处理。",
    h1: "xcconfig 编辑器",
    tagline: "在表格或源码中编辑 Xcode 构建配置，保留注释、include 与原有行顺序。",
    bullets: ["表格与源码同步", "检查语法及条件", "提示风险设置", "保留注释与行顺序"],
    sections: [
      {
        heading: "支持的语法",
        body: "每行可以是 KEY = value 设置、// 注释或 #include／#include? 指令。条件可以按 sdk、arch、config 等限定，例如 [sdk=iphoneos*] 或 [config=Release]。",
      },
      {
        heading: "验证的边界",
        body: "工具检查常见布尔值、部署目标、Team ID 与风险设置，但不会读取 include 引用的本地文件，也不会执行 Xcode 的变量展开或构建流程。最终结果仍需在 Xcode 中验证。",
      },
    ],
    faq: [
      privacy,
      {
        q: "会重排设置或移除注释吗？",
        a: "编辑器以行模型处理文件，尽量保留未修改行、注释和 include 指令，避免无关的格式变化。",
      },
    ],
  },
  "/how-to-open-plist-on-windows": {
    title: "如何在 Windows 打开 .plist 文件 — 包括二进制 plist",
    description:
      "无需安装软件，在 Windows 中打开、查看和编辑 XML 或 bplist00 二进制属性列表。了解文本编辑器为何会显示乱码及如何转换。",
    h1: "如何在 Windows 打开 plist 文件",
    tagline: "Windows 没有内置的 plist 编辑器，但浏览器可以读取 XML、二进制和 OpenStep 属性列表。",
    bullets: ["无需 Mac 或 Xcode", "支持 bplist00", "本地处理", "可导出 XML 或 JSON"],
    sections: [
      {
        heading: "第一步：打开文件",
        body: "点击上方“打开文件”或将 .plist 拖入编辑器。XML 和二进制会被自动识别，不需要先修改扩展名。文件内容在浏览器中解析。",
      },
      {
        heading: "第二步：浏览和编辑",
        body: "在树中展开字典和数组，查看键、类型和值。使用搜索框寻找特定配置，或在源码区查看 XML 与 JSON。修改前保留原文件，以便恢复。",
      },
      {
        heading: "第三步：下载所需格式",
        body: "若想用记事本或 VS Code 阅读，下载 XML plist；若目标程序要求二进制格式，选择 Binary plist。扩展名本身无法说明文件使用哪种编码。",
      },
      {
        heading: "为什么记事本会显示乱码",
        body: "以 bplist00 开头的文件是二进制属性列表，文本编辑器不能直接读取。把 .plist 改名为 .xml 不会进行转换，应通过属性列表解析器生成 XML。",
      },
      {
        heading: "其他可用方法",
        body: "在 Mac 上可以使用 Xcode 或 plutil；跨平台用户也可使用支持二进制 plist 的编辑器。对于不可信来源的配置文件，读取内容不代表应该安装或执行它。",
      },
    ],
    faq: [
      privacy,
      {
        q: "把扩展名改成 .xml 就能打开吗？",
        a: "如果原本就是 XML，文本编辑器可以读取；如果是二进制，则必须实际转换数据格式，改名没有作用。",
      },
    ],
  },
  "/what-is-a-plist-file": {
    title: "什么是 .plist 文件？了解 Apple 属性列表的格式与类型",
    description:
      "了解 plist 存储什么，XML、二进制与 OpenStep 有何区别，以及如何在 Windows、macOS 和 Linux 上打开 Apple 属性列表。",
    h1: "什么是 .plist 文件？",
    tagline:
      "Plist 是 property list（属性列表）的缩写，是 Apple 平台保存结构化配置和元数据的常见格式。",
    bullets: [
      "字典、数组和带类型的值",
      "XML、二进制和 OpenStep",
      "扩展名不决定编码",
      "支持跨平台查看",
    ],
    sections: [
      {
        heading: "plist 用来保存什么",
        body: "常见用途包括应用的 Info.plist、偏好设置、LaunchAgent 配置、entitlements 和设备配置描述文件。不同应用定义自己的键，因此同为 plist 并不代表可以互换使用。",
      },
      {
        heading: "支持哪些值类型",
        body: "属性列表使用 string、integer、real、boolean、date、data、array 和 dict 表示数据。二进制归档中还常见 UID 引用。字典包含命名键，数组按顺序保存条目。",
      },
      {
        heading: "XML 格式",
        body: "XML plist 使用 plist 根元素和 dict、key、string 等标签。它可以直接阅读，适合版本控制，但标签使文件体积相对更大。",
      },
      {
        heading: "二进制与 OpenStep",
        body: "二进制 plist 以 bplist00 开头，使用对象表和引用紧凑存储。OpenStep 是历史较早的文本语法，以大括号表示字典、圆括号表示数组；其文本表示不能像现代 plist 一样完整表达所有类型。",
      },
      {
        heading: "如何打开与转换",
        body: "使用上方编辑器直接打开文件，检查属性树并导出 XML、二进制或 JSON。JSON 适合与脚本交换数据，但不保留 plist 的所有类型；文件重新序列化也可能改变缩进和注释。",
      },
    ],
    faq: [
      {
        q: "plist 是加密文件吗？",
        a: "通常不是。二进制编码会让文本编辑器显示乱码，但不等于加密。签名和加密的配置描述文件还可能包含额外封装。",
      },
      privacy,
    ],
  },
  "/xml-vs-binary-plist": {
    title: "XML 与二进制 Plist 有何区别？格式比较与转换方法",
    description:
      "比较可读 XML plist 和紧凑 bplist00 二进制格式，了解可读性、文件大小、类型保留与双向转换。",
    h1: "XML 与二进制 Plist",
    tagline: "它们是属性列表的两种存储方式，通常表达相同的数据模型，但可读性和编码方式不同。",
    bullets: ["XML 便于阅读和比较", "二进制存储更紧凑", "同样包含带类型的值", "可在浏览器中转换"],
    sections: [
      {
        heading: "如何识别文件格式",
        body: "XML 文件通常以 XML 声明或 plist 元素开头；二进制文件以 bplist00 开头。两者都常使用 .plist 扩展名，不能只根据文件名判断。",
      },
      {
        heading: "XML 的优势",
        body: "XML 可以用普通文本编辑器阅读，适合代码审查和版本差异比较。显式的标签方便识别类型，但会增加存储开销；data 字段通常以 Base64 表示。",
      },
      {
        heading: "二进制的优势",
        body: "二进制使用对象表、偏移量和引用保存结构，通常比 XML 紧凑。需要专门的解析器才能查看；直接编辑原始字节很容易破坏文件。",
      },
      {
        heading: "转换与类型保留",
        body: "打开文件后，从下载菜单选择 XML 或 Binary plist。常规属性列表类型与键顺序会保留，但输出字节和文本格式不一定与原文件一致。归档中的 UID 需要目标工具支持。",
      },
      {
        heading: "选择适合的格式",
        body: "协作和审查时 XML 更方便；最终运行时应遵循目标应用要求。macOS 的 plutil -convert xml1 和 plutil -convert binary1 也可进行转换，操作前应保存备份。",
      },
    ],
    faq: [
      {
        q: "二进制格式更安全吗？",
        a: "不是。它只是编码方式，不提供保密性。只要有解析器就可以查看其内容。",
      },
      privacy,
    ],
  },
};
