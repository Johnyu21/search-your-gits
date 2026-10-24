# 维护者发布指南

本地目录整理与安装包验收日期：2026-10-24。版本保持 1.1.2，不因为打包重复递增版本。仓库：https://github.com/Johnyu21/search-your-gits 。普通用户从 Releases 下载。首次发布由 publish-initial.yml 在首次提交时构建并公开为 prerelease；后续版本继续使用标签触发的草稿发布流程。

## 上传什么

源码仓库：提交根目录中的源码、文档、assets、test、scripts、server/.env.example 与 .github。不要提交 node_modules、release、server/.env、server/.runtime、QA 目录或用户 data.json。项目外的 D:/get_github-archive 仅为本机备份，也不上传。

Release 附件：Search-Your-Gits-Setup-1.1.2-x64.exe、Search-Your-Gits-Source-1.1.2.zip、SHA256SUMS.txt。不要把 win-unpacked 当作用户下载附件。GitHub 自带 Source code 附件不包含可直接运行的安装器。

## 本机生成

~~~powershell
npm ci
npm run dist
npm run release:check
~~~

产物位于 release/1.1.2/。检查中文安装、启动页、桌面快捷方式、基本功能和卸载后，再上传。构建使用 package-lock 固定 npm 依赖；安装器暂未签名，发布说明需明确写出。

## 推荐：GitHub Actions 草稿流程

1. 新建仓库并上传源码；先检查差异，确认没有私密文件。不要直接把整个本机文件夹压缩后上传。
2. 确认 Actions 中 CI 已通过。
3. 创建与 package.json 完全相符的标签 v1.1.2 并推送。仅标签推送会触发草稿 Release；普通分支推送和 PR 不会发布。
4. Windows 构建任务运行自动测试、构建和产物检查，将三个文件附到 **draft + prerelease**。
5. 打开 Releases 草稿，下载附件验收，核对 SHA256，检查 docs/releases/v1.1.2.md 中的限制说明，然后由维护者手动发布。workflow_dispatch 只打包为 Actions Artifact，不发布 Release。

若希望本机手动上传：打开 Releases → Draft a new release，选择 v1.1.2，复制 docs/releases/v1.1.2.md 的说明并附加三个产物，保存草稿，验收后发布。GitHub 官方流程：https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository 。安装器配置依据：https://www.electron.build/nsis/ 。

## 发布前实际限制

- 公网反馈服务尚未部署。安装包不包含 SMTP 授权码，也不会在用户电脑自动启动本机邮件服务；部署后可在设置中配置 HTTPS 地址。不能宣传“所有用户开箱即可发邮件”。
- CloseAI 官方登录表单已检查，真实账户报价需要账户持有人自行登录验证，平台接口更改可能导致同步失败。
- 外部来源有网络、频率与结构限制。季度榜依赖本机历史，不能作为官方季度全网榜。
- 仅 Windows x64；未做代码签名，不能宣称已通过 SmartScreen 信誉认证或所有安全软件检测。

## 版本维护

只有明确的“版本更新”需求才递增版本并修改 CHANGELOG；本轮打包不改版本。未来版本先同步 package.json、package-lock.json，再准备相应 docs/releases/v版本号.md 与标签。

## 凭据

如果任何 SMTP 授权码或 Token 曾进入公开提交、Issue 或截图，应在服务商处撤销并重新生成。仓库仅放占位示例。现有本机 server/.env 由 .gitignore 排除且不会进入安装器或白名单源码 ZIP。
