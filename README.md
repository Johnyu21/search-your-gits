# Search Your Gits · 寻迹

一个中文 Windows 桌面应用，用于发现 GitHub 开源项目、阅读国内外技术资讯、比较 AI 模型价格与成本。

当前版本 **1.1.2** · Windows x64 · MIT · 预发布验收版。

[下载 Windows EXE 安装包](https://github.com/Johnyu21/search-your-gits/releases/download/v1.1.2/Search-Your-Gits-Setup-1.1.2-x64.exe) · [全部 Releases](https://github.com/Johnyu21/search-your-gits/releases) · [问题与建议](https://github.com/Johnyu21/search-your-gits/issues)

首次发布构建完成后，上方 EXE 下载链接即可使用；构建状态可在仓库 Actions 查看。

## 下载与安装（普通用户）

1. 在本仓库页面右侧打开 **Releases**，选择需要的版本。
2. 在 **Assets** 下载 **Search-Your-Gits-Setup-1.1.2-x64.exe**。以后版本的文件名中版本号会相应变化。
3. 双击安装器，按中文向导选择安装目录。安装到当前 Windows 用户，可创建桌面和开始菜单快捷方式。
4. 安装结束后启动 **Search Your Gits · 寻迹**。启动图显示约 3 秒后进入主界面。

**无需安装 Node.js、Python、Git 或其他开发环境。** 安装器包含运行环境，安装时无需另外下载组件；榜单、翻译、资讯及在线价格需要联网。

支持 Windows 10 / 11 的 64 位 x64 系统；本次不提供 Windows 7、32 位、macOS、Linux 或原生 ARM64 安装包。

注意区分：GitHub 自动提供的 **Source code (zip / tar.gz)** 是源码，不是安装程序；Search-Your-Gits-Source-1.1.2.zip 也是开发者源码。普通用户只需下载 **Setup…exe**。

此构建尚未使用代码签名证书，Windows 可能显示“未知发布者”或 SmartScreen 提示。请确认下载自维护者的 Release，按下文核对哈希；组织策略阻止运行时请联系管理员，不要关闭系统安全设置。

## 可以做什么

| 功能 | 使用方式与范围 |
| --- | --- |
| 热门增长 | GitHub Trending 周榜、月榜；新项目榜按创建时间筛选并按 Star 排序；季度增长使用本机历史快照，首次可能没有数据。 |
| 开源项目搜索 | 搜索公开仓库，支持语言、排序、分页及 GitHub 搜索语法。 |
| 项目详情 | 中文介绍、作者中文 README 优先、安装与用途说明、原文、收藏、历史快照和 CSV 导出。 |
| 行业资讯 | 国内 / 国外、计算机 / AI 筛选，可翻译摘要并阅读原文。 |
| AI 工具 | OpenRouter 与硅基流动公开报价；CloseAI 官方窗口登录后同步账户报价；文本 Token 成本估算、手动用量账本、能力天梯及官方动态。 |
| 皮肤与阅读 | 启动图预设、自定义图片、明暗、透明度、模糊、玻璃阅读底色开关及页面切换动画。 |

![AI 工具页面示例](docs/images/app-preview.png)

截图来自 2026-10-24 的实际安装版验收，显示公开价格快照，不代表当前报价。价格、榜单和评测均以来源当前数据为准。

## 首次使用与数据

- 可以不填 GitHub Token。遇到 API 限流后，在“设置与数据”填写自己的 Token；通过 Windows 安全存储加密，只向 GitHub API 发送。
- CloseAI 在“AI 工具 → Token 价格 → 登录站点”中自行登录官方页面。登录状态保存在本站点的独立本机会话，应用只缓存规范化报价；可点击“清除本机登录”。
- 收藏、设置、快照与账本保存在当前 Windows 用户的应用数据目录。在“设置与数据”可打开数据目录。升级沿用原应用 ID；卸载默认保留个人数据，不会删除自定义收藏。
- 用量账本由用户手动记录，不读取供应商账单、余额或个人额度。模型公告不保证个人账户额度已刷新。
- 翻译服务会接收所选公开文本；GitHub Token 不发送给翻译、资讯或价格来源。

### 建议与意见

反馈界面可保存草稿。**公开版自动发邮件需要维护者部署 HTTPS 反馈服务；本次安装包没有预置公网服务地址，尚不能保证其他电脑直接投递邮件。** 未配置时会明确提示“反馈未发送”。成功提交后需等待 15 分钟再次提交。

SMTP 密码和授权码只放在服务端，绝不包含在 EXE、源码 ZIP 或仓库中。部署方法见 [反馈服务说明](server/README.md)。公开问题可以通过本仓库 **Issues** 提交；请勿粘贴密码、Token 或私人数据。

## 校验下载文件

Release 同时提供 SHA256SUMS.txt。在安装包所在目录打开 PowerShell：

~~~powershell
Get-FileHash .\Search-Your-Gits-Setup-1.1.2-x64.exe -Algorithm SHA256
~~~

将结果与 SHA256SUMS.txt 中同名文件的哈希逐字对照。哈希用于核对文件完整性，不能替代对发布者和下载来源的确认。

## 开发与本地构建（开发者）

开发要求：Windows x64、Node.js 22.16+ 与 npm。获取源码后：

~~~powershell
npm ci
npm test
npm start
~~~

本地也可以双击“启动开发版.cmd”；它是开发入口，普通安装包用户不需要使用。首次 npm ci 会下载 Electron；需要能访问 npm 和 Electron 下载源。

构建安装包：

~~~powershell
npm run dist
npm run release:check
~~~

构建先运行测试，再生成中文 NSIS 安装器、白名单源码 ZIP 和 SHA256 校验文件，输出到 release/1.1.2/。打包不自动发布 GitHub，也不自动递增版本。

| 目录 | 内容 |
| --- | --- |
| ui/ | 中文界面、皮肤、字体和启动图 |
| lib/ | 榜单、翻译、资讯、价格、账本、反馈协议 |
| server/ | 独立反馈服务，仅供服务端部署 |
| scripts/ | 开发启动、构建与产物校验 |
| test/ | 无需真实邮件或付费模型调用的自动测试 |
| docs/ | 数据口径、发布指南、验证记录和脱敏需求档案 |
| .github/ | CI、手动打包及标签触发的草稿 Release 流程 |
| release/ | 本机生成产物，不提交 Git |

## 维护与许可证

[发布到 GitHub 的步骤](docs/RELEASING.md) · [安装验收记录](docs/VALIDATION.md) · [数据来源与计价口径](docs/DATA-SOURCES.md) · [版本历史](CHANGELOG.md) · [第三方许可](THIRD-PARTY-NOTICES.md) · [需求档案](docs/用户需求与提示词记录.md)

原创代码采用 [MIT License](LICENSE)，允许复用和商业使用，需保留版权和许可声明；第三方组件、字体与商标按各自许可使用。
