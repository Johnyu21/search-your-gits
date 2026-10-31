# 维护者发布指南

当前正式版本 1.1.4，Windows x64，MIT。本轮按维护者授权发布，1.1.3 保留为历史正式版。仓库：[Johnyu21/search-your-gits](https://github.com/Johnyu21/search-your-gits)。普通用户从仓库右侧 Releases 的 Latest 版本下载 EXE。1.1.2 保留为历史预发布版，1.1.3 按用户授权发布为正式版并设为 Latest；发布不额外递增版本号。

## 提交与附件

源码提交根目录中的代码、文档、assets、test、scripts、server/.env.example 与 .github。禁止包含 node_modules、release、server/.env、server/.runtime、QA、用户 data.json 或项目外的本机备份。

Release 仅附 Search-Your-Gits-Setup-1.1.4-x64.exe、Search-Your-Gits-Source-1.1.4.zip、SHA256SUMS.txt。win-unpacked 供本地验证，不作为用户安装附件。GitHub 自动提供的 Source code 也是源码，不是安装器。

## 本地构建

~~~powershell
npm ci
npm test
npm run test:desktop
npm run dist
npm run release:check
~~~

桌面联调使用隔离临时用户目录和合成响应，不发送邮件或创建真实 Issue。当前本地输出目录 release/1.1.4。安装器暂未代码签名。云端重新构建的时间与环境不同，哈希可能不同；每份安装包使用同次发布的 SHA256SUMS.txt。

## 本轮正式发布

历史文件名 publish-initial.yml 现在显示为 **Publish current Windows release**。仅修改该文件并推到 main，或手动运行该工作流时执行：

1. 检查 package.json 当前版本是否已有 Release；公开版本跳过，不覆盖历史附件。已有草稿则按 ID 恢复，核验其源码与当前提交仅有发布流程或文档差异，程序源码变化时停止复用、要求重新构建。
2. Windows 运行 npm ci、npm run dist，执行自动测试和产物校验。
3. 创建当前版本的草稿 Release，附安装器、源码 ZIP 和哈希文件；已有完整草稿则保留原构建及目标提交。
4. 按草稿 ID 核验三个附件均已上传且非空，再通过 Release ID 取消 draft/prerelease 并明确设为 Latest；未发布草稿不能依赖 tags 端点查询。
5. 通过 releases/latest 接口确认版本和公开状态。

该工作流使用仓库 GITHUB_TOKEN，不需要提交个人 Token。普通源码分支推送不会自动发布。

## 后续版本

同步 package.json、package-lock.json，准备 docs/releases/v版本号.md，确认 CI 与安装验收通过后推送相符的版本标签。release.yml 将生成带三个附件的 **正式版草稿**；维护者验收后 Publish release，并选中 Set as the latest release，即可在右侧显示 Latest。若需要预发布测试，维护者应主动勾选预发布，该版本不能设为 Latest。手动运行 release.yml 只生成 Actions Artifact，不发布。

需要直接发布当前新版本时，也可在明确授权后更新并触发 publish-initial.yml。不要为了重复打包增加版本或覆盖已经发布的同名标签和附件。

客户端更新检测只发现公开 Release；提交源码或保存草稿不会提醒客户端。旧 1.1.2 没有更新检测，需手动安装一次 1.1.3 或更高版本。

## 发布限制

- 默认反馈入口为 GitHub Issues，需要用户登录并确认公开发布；邮件投递仍需独立 HTTPS 服务，不内置 SMTP 授权码。
- CloseAI 报价需要各用户自行登录官方页面。外部榜单、翻译、资讯有网络和额度限制；季度增长依赖本机历史。
- 仅 Windows x64，程序暂未签名，不能宣称已经获得 SmartScreen 信誉。
- SMTP、翻译密钥和 GitHub Token 不提交仓库或放入附件；私密 .env 保留在本机。

[GitHub Release 管理](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository) · [Latest 参数](https://cli.github.com/manual/gh_release_edit)
