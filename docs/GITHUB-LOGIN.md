# GitHub 登录配置与使用

GitHub App 只需软件维护者注册一次。普通用户点击左下角“更多 → 登录 GitHub”，复制验证码到官方网页并授权即可；不需要注册应用、申请 Token 或填写 Client ID。

## 维护者注册（一次性）

1. 打开 [注册 GitHub App](https://github.com/settings/apps/new)。选择 GitHub Apps，不是 OAuth Apps。
2. GitHub App name 可填 Search Your Gits；若名称已占用，可加维护者用户名。Homepage URL 填 https://github.com/Johnyu21/search-your-gits 。
3. 勾选 **Enable Device Flow**。使用设备授权，不需要回调服务器，Callback URL 可留空。
4. 保持 **Expire user authorization tokens** 开启；客户端会使用设备授权得到的 Refresh Token 续期，不需要 Client Secret。
5. Webhook 下取消 **Active**，无需填写 Webhook URL、Webhook secret 或订阅事件。
6. Repository permissions 中保留 **Metadata: Read-only**；Account permissions 中设置 **Starring: Read and write**。其他权限保持 No access。基础用户资料接口不需要额外权限。
7. **Where can this GitHub App be installed?** 选择 **Any account**，以便其他用户使用。创建应用后复制 **Client ID**；它不同于 App ID。
8. 不需要生成私钥，不要把 Client Secret、私钥或个人 Token 发到聊天、放进源码或安装包。

以上字段以 GitHub 当前注册页面为准；[官方注册说明](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app)、[设备授权与登录](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app)、[设备授权的 Token 续期](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/refreshing-user-access-tokens)。

## 本机测试与正式发行

本机：打开“更多 → 登录 GitHub → 维护者：配置 GitHub 登录应用”，填公开 Client ID 并点击“保存本机配置”，随后即可开始授权。

正式发行：将同一公开 Client ID 填入 [lib/github-config.json](../lib/github-config.json) 的 clientId 字段，再打包。此标识是公开配置，可以放在仓库；每个普通用户只需授权自己的账号。不要要求普通用户完成维护者注册。

开发测试也可使用公开配置环境变量 GITHUB_APP_CLIENT_ID；优先级为本机保存配置、环境变量、构建配置文件。Client Secret 不参与设备授权或续期流程。

配置为空时，软件仍可使用榜单、资讯等功能；登录页面会明确说明服务尚未配置，不伪造已登录状态。

## 用户使用

- 左下角“更多”菜单提供设置与数据、意见反馈、登录；登录后显示头像、昵称和用户名，可进入我的 GitHub 或退出。
- 点击登录，软件显示验证码和有效期；点击“复制验证码并前往 GitHub”，在官方网页完成登录与授权。授权弹窗自动识别结果，支持取消和验证码过期后重试。
- 账号页展示公开基本资料、GitHub Star 和自己拥有的公开仓库。列表按页同步，每页最多 30 条，支持当前页筛选、当前页 Star/最近推送排序及手动刷新。
- Star 页的“取消 Star”，以及项目详情中的“在 GitHub 加星／取消 GitHub Star”都会实际修改 GitHub 上的 Star。操作成功后更新状态；权限不足或网络失败时明确提示。
- 左侧“我的收藏”直接展示当前账号的 GitHub Star，榜单、搜索和项目详情中的收藏／取消收藏均同步到 GitHub；未登录时引导登录。列表每页 30 条，支持翻页和刷新。刷新可获取 GitHub 网页上的改动。
- 原有本机收藏数据保留在数据目录，不自动批量上传；界面不再把本机收藏当作账号收藏。
- 退出后清除当前 GitHub 账号凭据和账号缓存，原来的本地收藏与手动 Token 设置不被删除。切换账号时不会混用列表或登录凭据。

## 存储与权限

Access Token 和 Refresh Token 只在主进程使用，使用 Windows safeStorage 加密后写入本机数据；渲染页面只能读取公开资料与用户验证码，不能读取设备私有码或 Token。令牌只发送到 GitHub 官方授权地址或 api.github.com，GitHub 头像由官方头像域名提供。

账号 Star 列表与公开仓库缓存按账号分开；不保存私有项目。同步缓存有效 5 分钟，失败保留旧数据及原同步时间；手动刷新会尝试联网。

维护者已于 2026-10-31 提供并接入公开 Client ID；重启开发版后可开始真实授权，实际登录结果仍需用户在 GitHub 网页确认授权后验证。自动化测试使用合成设备授权和独立用户目录，不会真实登录、Star、取消 Star 或发送反馈。
