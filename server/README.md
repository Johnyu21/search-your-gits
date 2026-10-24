# 反馈邮件服务

这是单独部署的服务端，不包含在桌面安装包中。客户端不能指定收件人；收件地址固定在服务端代码中。SMTP 凭据只能留在服务端环境变量或被忽略的 server/.env。

## 本机开发

1. 在根目录运行 npm ci。
2. 将 server/.env.example 复制为 server/.env，填写自己的 SMTP 配置。不要提交、截图或发送授权码。
3. npm run feedback:server 默认监听 127.0.0.1:8787。GET /health 的 ready=true 只表示配置齐全，不保证邮件能够投递或最终入箱。
4. 在应用“设置与数据 → 建议与意见 → 开发者：配置发送服务”保存 http://127.0.0.1:8787/feedback。

npm start / 启动开发版.cmd 会在本机配置存在时启动或复用本机服务。安装版不启动本机 Node 服务。

## 公网部署

使用 Node.js 22.16+ 运行服务，通过 HTTPS 反向代理暴露 POST /feedback。SMTP_HOST、SMTP_PORT、SMTP_USER、SMTP_PASS、SMTP_FROM 仅由服务器环境提供。TLS、域名和凭据由维护者配置；本项目不自动部署。

公开客户端需要配置部署后的 HTTPS /feedback 地址。本次安装包没有预置公网地址；未配置时会明确提示未发送并保留草稿。

POST 字段：id、kind（suggestion / bug / other）、content（10–5000 字）、contact（可空）、consent=true、version。成功只在 SMTP 接受固定收件地址后返回 200 / accepted，不保证最终入箱。

400 无效请求；413 过大；415 类型错误；429 冷却限制（Retry-After）；503 SMTP 未配置；502 投递服务拒收或异常。

同 IP 成功提交后 15 分钟内不得再次发送；发送中阻止其他 ID 并发，失败可重试。限流持久保存在 server/.runtime，以 IP 摘要为键；同出口 IP 共用限额。提交 ID 24 小时内进程内去重。多实例应接入共享存储；当前不信任任意 X-Forwarded-For，反向代理部署需按真实客户端来源设计限流。

请勿将 SMTP 凭据放进 Electron、GitHub Release、源码 ZIP 或 Actions 日志。server/.env、.runtime 已被忽略，源码 ZIP 仅包含占位示例。
