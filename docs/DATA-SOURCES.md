# AI 工具数据来源与计算口径

OpenRouter、硅基流动与动态来源为公开只读数据；CloseAI 使用各用户登录后平台返回的账户报价。不进行付费模型推理。缓存 5 分钟，工具页可见时可每 5 分钟刷新；手动刷新强制检查。来源分别处理失败，保留上次成功获取时间。接口及网页可能改版或限制访问，解析失败不补造数据。

| 功能 | 来源 | 口径 |
| --- | --- | --- |
| OpenRouter 报价 | [公开模型接口](https://openrouter.ai/api/v1/models)、[接口文档](https://openrouter.ai/docs/api/api-reference/models/list-all-models-and-their-properties) | API 每 Token 单价换算为每百万 Token，USD。目录价不等于某次请求最终路由费用。 |
| 硅基流动报价 | [官方价格页](https://siliconflow.cn/pricing) | 公开文本 Token 价格，CNY；保留时段、上下文分档，不混入图片/视频按次费用。 |
| CloseAI Asia | [平台价格页](https://platform.closeai-asia.com/pricing) | 用户点击“登录站点”后，在官方窗口自行登录。接收平台 `/api/v1/models` 和 `/api/v1/account/info` 成功响应，仅提取模型文本报价和账户套餐，按有效倍率计算 USD / 百万 Token；保留长上下文与缓存条件。未登录不显示旧公开套餐倍率代替实价。 |
| 能力天梯 | [Artificial Analysis](https://artificialanalysis.ai/leaderboards/models) | Intelligence Index 当前公开分数；不同推理设置独立显示，不将速度、上下文或价格冒充能力分。 |
| OpenAI 维护 | [官方状态订阅](https://status.openai.com/history.rss) | 公开事件历史，不是个人账户状态。 |
| Claude 维护 | [官方状态订阅](https://status.claude.com/history.rss) | 公开事件历史。 |
| Codex / ChatGPT 公告 | [官方更新记录](https://learn.chatgpt.com/docs/changelog) | 版本、政策与额度相关公开公告；网络受限时独立报错，不推测个人刷新。 |
| Codex 发布 | [官方仓库发布](https://github.com/openai/codex/releases) | GitHub Releases，过滤草稿与预发布。 |
| Claude Code 发布 | [官方仓库发布](https://github.com/anthropics/claude-code/releases) | GitHub Releases，过滤草稿与预发布。 |
| DeepSeek 动态 | [官方更新记录](https://api-docs.deepseek.com/updates) | 模型、API 更新的原始标题与摘要。 |

## 成本计算

每日普通输入 = 请求数 × 每次输入 Token × (1 − 缓存命中比例)。每日缓存输入 = 请求数 × 每次输入 Token × 缓存命中比例。输出独立计费。各项乘相应的每百万 Token 单价 / 1000000 后相加，再乘估算天数。缓存 Token 已包含在总输入中，不能再加一遍。缓存价未公布时按正常输入价估算；没有输出单价的模型仅允许 0 输出 Token 估算。

手动账本按一天入账，不乘估算天数，保留当时的原币单价与分档说明。不读供应商账单，不校验录入是否等于真实用量。USD 与 CNY 分开汇总；人民币参考金额使用用户输入的汇率，非实时汇率。

## 站点登录与本机数据

当前需要登录同步的站点为 CloseAI，注册表可扩展；OpenRouter 与硅基流动仍使用公开来源，无需强制登录。每个站点使用独立的 Electron 持久会话分区，登录状态仅由平台网页与本机 Chromium 会话管理，按 Windows 用户隔离。程序不提取、展示、记录密码或认证 Token，也不向其他来源转发认证信息。登录完成且模型与套餐响应均有效时，自动保存规范化报价并关闭窗口。不同账户切换时请先点击“清除本机登录”，再登录另一个账户。

报价新鲜缓存为 5 分钟；过期或手动刷新在该会话中打开隐藏官方价格页重新获取，鉴权失败保留旧报价及原时间，提示重新登录。清除登录会关闭同分区窗口并删除站点会话、缓存和规范化账户报价；已记入手动账本的历史报价快照继续保留。

账户套餐倍率：商务 A=1.5、研发 B=1.25、大客户 C=1.1、战略合作 D=1.05。模型折扣倍率小于 1 时采用该折扣，否则采用账户倍率与模型倍率的较大值；平台规则变化会影响结果，应核对原站。输入和输出分档独立计算，缓存读取按输入比例计算，不包含缓存写入、图像、音视频及工具费用。未知套餐或缺少模型结构时拒绝同步，不填造价格。

## 1.1.3 阅读、搜索与更新

GitHub 的常规 API 与搜索分别记录冷却，匿名身份与已配置 Token 的身份隔离。并发请求复用，短暂限流和 5xx 最多重试两次；长等待保存恢复时间并回退已有缓存。搜索/榜单缓存 1 小时，详情 1 小时、README 6 小时；失败回退保留原时间。最佳匹配仅对普通项目名增强完整名称、同名、前缀及包含匹配，高级 GitHub 搜索语法不强行改写；完全同名检索补入首页，后续页去掉已补入的同名项目。额外名称请求失败时保留正常搜索结果，不宣称已经检索全站全部候选。

国内 AI 来源为 [IT之家人工智能](https://next.ithome.com/ai)，读取公开栏目标题、摘要与文章链接；“今日”时间按 Asia/Shanghai 解释，只有月日的条目使用北京时间零点表示日期精度。来源页面未提供完整时间时不填造精确时分。计算机资讯仍使用 IT之家 RSS。来源在展示层隐藏，在文档中保留可追溯链接。

默认翻译 [MyMemory](https://mymemory.translated.net/doc/usagelimits.php) 仍受免费额度限制；可选联系邮箱由用户自行填写并发送给 MyMemory。另支持 [LibreTranslate](https://docs.libretranslate.com/guides/api_usage/) 的完整 /translate 接口，以及兼容 OpenAI 的完整 /v1/chat/completions 接口。只发送用户所选的公开文本，可能产生配置服务的费用；无共享密钥。密钥本机加密，仅发送到所选地址，拒绝携带凭据的 URL 和远端 HTTP，不跟随带密钥请求的重定向。成功译文和分片缓存，警告与失败不当译文保存。

软件更新读取 [本仓库 Releases](https://github.com/Johnyu21/search-your-gits/releases)，不向其他仓库或任意服务器跳转。只比较数字版本，常规 API 要求已上传 Windows 安装包；API 不可用且允许预览版时尝试公开 Atom 订阅，仅提示前往发布页核对。当前没有在线静默下载安装。

## 扩展发现榜（1.1.5）

通过 GitHub Search API 按 `pushed:>=` 筛选近 7 / 30 / 90 天有推送的公开、非 Fork、未归档且至少 1 Star 的仓库，使用 `sort=stars&order=desc`。独立于 Trending 和本机季度增长，支持 Top 25 / 50 / 100，不补造周期 Star 增长。语法依据 [GitHub 仓库搜索文档](https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories)。
