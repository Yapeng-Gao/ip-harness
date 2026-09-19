# AGENT_GROK_LIKENESS — `/agent` 对标 Grok Bot

**分支** `dev` · **规格** `docs/architecture/product-apps/agent-grok-replica.md`（`9ba1d42`）· **范围** `apps/agent` GeneralGrok* + 壳顶栏条件渲染 · **禁** Cloud / 写库闸 / HITL / 项目深化。

## 目标

打开 `/agent` 一眼 = **窄侧栏 bots + 主聊 + sticky composer**；不像中台壳。

## 改动

| 项 | 处理 |
|----|------|
| 顶栏 | `AgentShell`：`inGrokShell` 时隐藏作业中台 / 租户 Persona / ProductSwitcher；品牌文案「Grok」 |
| 侧栏 | `GeneralBotSidebar`：仅「新建」+ bot 行（头像+名）；分区标题墙 / 自由角标 / 模板说明已砍；项目·历史·Catalog·Composer 全进「更多」 |
| 主区 | `GeneralGrokShell`：绑案 + 样机诚实 **默认不露**（`…` 设置钮展开）；无全宽说明墙 |
| 聊区 | `GeneralBotChatPane`：干净标题 + 气泡流 + sticky composer；系统 intro 不渲染；无护栏脚注 / 角标墙 |
| 回声 | `GeneralBotsContext` intro/mockReply 去说明墙文案 |

## 活口截图

`docs/ui-polish/agent-grok-likeness/`

- `before-agent.png`（收敛后基线）
- `after-agent.png`（默认干净主屏）
- `after-agent-chat.png`（发过一条）
- `after-agent-more.png` / `after-agent-chrome.png`（次级）

## 自点（Asia/Shanghai · `http://127.0.0.1:5175/agent`）

| 检查 | 结果 |
|------|------|
| 窄侧栏 + 新建 + bots | ✅ |
| 消息流 + sticky composer | ✅ |
| 默认 honesty / case-bind | **0** |
| 项目/历史默认不可见（进更多） | ✅ |
| 顶栏无作业中台/租户 | ✅ `data-grok-chrome=1` · 品牌「Grok」 |
| `npm run typecheck -w @ip/agent` | ✅ |

## 未改

写库闸 / HITL / DomainCommand / Cloud / 项目专家花名册。
