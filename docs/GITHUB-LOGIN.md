# GitHub 登录与收藏授权

## 用户使用

左下角“更多 → 登录 GitHub”，复制验证码到 GitHub 官方网页并授权。普通用户无需注册应用或填写 Client ID。

收藏使用当前账号的 GitHub Star，支持分页、缓存和刷新；所有取消收藏入口都会弹出系统确认窗口，默认“保留收藏”，关闭或 Esc 不发送 DELETE。旧本机收藏数据保留，不批量上传。

## 维护者注册 OAuth App（一次性）

1. 打开 https://github.com/settings/applications/new ，选择 OAuth Apps，不能用 GitHub Apps 代替。
2. Application name：Search Your Gits Desktop；Homepage URL：https://github.com/Johnyu21/search-your-gits 。
3. Application description：A Windows desktop app for discovering open-source projects and managing your GitHub stars.
4. Redirect URI（也可能显示 Authorization callback URL）：http://127.0.0.1 （设备授权不使用回调；这是注册表单必填值，不要求部署服务器）。
5. 注册后启用 Enable Device Flow。复制公开 Client ID，通常以 Ov 开头。不需要生成或提供 Client Secret。
6. 写入 lib/github-config.json 的 oauthClientId 字段。现有 clientId 字段保留兼容旧 GitHub App；新发行版优先使用 oauthClientId。也可在账号页的维护者配置中填写，旧 GitHub App 会话可直接升级。

OAuth 设备授权显式申请 public_repo，用于管理公开仓库 Star；GitHub 的该范围也包含公开仓库的部分写权限，官方授权页会展示。程序不申请 repo 私有仓库、管理权限、邮箱或其他额外范围。

## 为什么更换授权方式

1.2.1 的 GitHub App 设备授权可以读取个人 Star，但在当前实际账号下，REST 写入和 GraphQL addStar 都返回 Resource not accessible by integration；即使公开应用信息已申请 starring:write 与 metadata:read，仍然会受目标仓库的集成访问限制。不能将此错误简单描述为用户没有勾选权限，也不能承诺反复登录旧 App 即可修复。

切换到 OAuth App 后需用户重新完成一次网页授权，旧的 GitHub App 登录不会自动获得新授权。新的 OAuth Client ID 已于 2026-10-31 接入，真实设备授权接口检查通过。已有账号仍需在开发版的“我的 GitHub → 升级收藏授权”完成一次官方网页授权；真实用户 Star 写入须在重新授权后验证。

## 安全与缓存

Access Token / Refresh Token 仅主进程使用，使用 Windows safeStorage 加密；渲染页面不接收令牌或设备私有码。设备授权及 API 固定使用 GitHub 官方域名。账号缓存隔离，退出清除当前账号凭据与缓存，不删除旧本机收藏或手动 Token。

列表缓存 5 分钟，强制刷新可同步网页改动；失败保留旧数据与原时间。写操作收到成功响应后才修改界面与缓存，用户取消确认或请求失败不显示成功。

## 验证

运行 npm test、npm run test:account 与 npm run test:github-network。后者使用真实 Electron net.fetch 和本机测试 HTTP 服务，防止模拟网络遗漏 Chromium 请求参数限制；不使用真实 GitHub 凭据或修改真实 Star。

## 官方参考

- [OAuth 设备授权](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [public_repo 权限范围](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps)
- [Star REST API](https://docs.github.com/en/rest/activity/starring)
- [Electron net.fetch](https://www.electronjs.org/docs/latest/api/net)
