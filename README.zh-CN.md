# OpenPlist

在浏览器中查看、编辑和转换 Apple 属性列表。在 macOS、Windows 和 Linux 上打开 XML、二进制和 OpenStep 文件，无需安装 Xcode。

[在线使用](https://openplist.com/zh) · [English](README.md) · [反馈问题](https://github.com/chenz24/openplist/issues) · [MIT 许可证](LICENSE)

## 功能

- **树形与源码编辑**：在结构化视图中编辑键、值和类型，或使用带语法高亮与错误定位的 XML、JSON 源码视图。
- **格式转换**：XML 与二进制（`bplist00`）plist 互转，导入 OpenStep，以及 plist 与 JSON 互转。
- **Apple 配置工具**：查看描述文件，编辑 entitlements 和本地化文件，检查 Xcode 或 OpenCore 配置。
- **编辑保护**：共用 plist 编辑器提供撤销、重做、未保存提醒和专注模式。
- **本地文件处理**：核心编辑与转换在浏览器中完成，不上传文件内容。
- **多语言界面**：支持英语、简体中文和日语，切换语言时保留编辑会话。

## 支持的文件

| 文件 | 工具 |
| --- | --- |
| `.plist` — XML、二进制、OpenStep | 查看、编辑，导出为 XML、二进制或 JSON |
| `.json` | 转换为 XML 或二进制 plist |
| `.mobileconfig` | 编辑配置载荷、校验配置，可选 AI 分析 |
| `.mobileprovision`、`.provisionprofile` | 查看有效期、团队、设备、证书和 entitlements，提取 entitlements |
| `.entitlements` | 编辑和校验权限声明 |
| `.strings`、`.stringsdict` | 编辑本地化字符串和复数规则 |
| `.xcconfig` | 编辑和校验 Xcode 构建配置 |
| OpenCore `config.plist` | 编辑配置，执行部分规则检查，转换 Base64 / Hex 数据 |

## 快速开始

使用 **Node.js 22.x（至少 22.12）** 或 **Node.js 24.x**，以及 **pnpm 10.34.5**。完整的 Node 支持范围和包管理器版本见 [package.json](package.json)。

```sh
git clone https://github.com/chenz24/openplist.git
cd openplist
pnpm install --frozen-lockfile
pnpm run dev
```

打开 Vite 输出的本地地址即可。核心工具无需环境变量或 API 密钥；可以使用 [public/examples](public/examples) 中的示例文件体验。

## 自行部署

```sh
pnpm run build
pnpm run start
```

部署完整的 `.output` 目录。Node 服务端负责页面渲染和静态资源，默认监听 `3000` 端口，可通过服务端环境变量 `PORT` 和 `HOST` 调整。本地预览已有构建可运行 `pnpm run preview --port 4173`。

使用自己的公开域名时，更新 `src/lib/site.ts` 和 `public/robots.txt`。

### 可选 AI 分析

配置描述文件支持通过兼容 OpenAI Chat Completions API、支持结构化 JSON 输出的服务进行分析。本地启用时，将 [`.env.example`](.env.example) 复制为 `.env`，填写以下三个变量：

| 变量 | 内容 |
| --- | --- |
| `AI_API_KEY` | 服务商的 API 密钥 |
| `AI_BASE_URL` | 服务商的 API 基础地址，按需包含版本路径 |
| `AI_MODEL` | 该服务商支持的模型标识 |

生产环境中，将这些变量传入服务端进程。不要提交密钥，也不要为这些变量添加 `VITE_` 前缀。不配置 AI 时，核心编辑器和转换工具仍可使用。

## 隐私与兼容性

文件内容和编辑历史仅保存在页面内存中，不写入 localStorage 或 IndexedDB。刷新或关闭页面前，请先下载修改结果。

只有主动请求 AI 分析时，才会将描述文件内容发送给配置的服务商。发送前会对部分敏感字段脱敏，但可能遗漏自定义字段。页面与资源加载仍会使用网络。详见[隐私页面](https://openplist.com/zh/privacy)。

导出会重新生成排版并移除注释。JSON 无法保留 plist 的日期、二进制数据和 UID 类型，数字受 JavaScript 精度限制。已签名描述文件可供查看，但不会验证或重新生成签名。内置校验仅覆盖部分规则，请在实际使用文件的应用中验证导出结果。

## 开发与贡献

项目基于 React、TypeScript、TanStack Start、Vite、Nitro、Tailwind CSS、CodeMirror 和 Paraglide JS 构建。

```sh
pnpm run check   # Lint、类型检查和测试
pnpm run test    # 单元测试
pnpm run format  # 格式化源码
```

体积检查覆盖 21 个代表页面：工具和指南的首屏 JavaScript 上限为 260 KiB gzip，About/Privacy 为 180 KiB，CSS 均为 18 KiB。统计模块入口与递归静态依赖，每页去重，不含按需加载块、字体和图片。这是防止体积退步的预算，不是 Core Web Vitals 测量结果。正式上线后仍需验证 HTTPS/主域名跳转、缓存、移动端性能和 Search Console 收录情况。

欢迎提交 Issue 和 Pull Request。报告问题时，请附上复现步骤和最小合成样例。修改文案时保持中英日三种语言同步，修改解析或转换逻辑时补充回归测试。提交前运行 `pnpm run check` 和 `pnpm run build`。

## 许可证

[MIT](LICENSE) © 2026 OpenPlist contributors。贡献内容使用相同许可证，第三方依赖保留各自的许可证。

OpenPlist 是独立项目，与 Apple 没有隶属或背书关系。
