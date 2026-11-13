# Agent P0 Overlay · 黄条 + mid CTA · 活验报告

| 项 | 值 |
|----|-----|
| **分支** | `dev`（已与 `origin/dev` 对齐） |
| **落地 SHA（代码）** | `d2d91fa` — `fix(agent-ui): 终端用户去 mid 深链 CTA · 写回文案产品化 · 收敛样机黄条` |
| **文档 SHA** | `9d2ff62` — `docs(ui): AGENT_NO_MID_BANNER REPORT 填入落地 SHA` |
| **本证据提交** | （本目录 live 截图 + 本 REPORT；见 git log） |
| **typecheck** | `npm run typecheck -w @ip/agent` ✅ |
| **活验时间** | 2026-09-19 11:24 CST（Asia/Shanghai） |
| **活验基址** | `http://127.0.0.1:5175`（agent vite 已起） |

## 分工

| 角色 | 职责 | 状态 |
|------|------|------|
| **本执行（黄条主责）** | 项目 List/Workspace 全宽 amber「样机·无真 LLM」收敛；活验两边 | ✅ 源码无全宽样机条 + Playwright 顶栏无 tip wall |
| **Agent Owner（midHref CTA 主责）** | 去用户可见 mid 深链 | ✅ 已合入 `d2d91fa`；本侧**未回加** mid 链 |

## 活验（Playwright 真开 · 已点页面）

脚本：`_live-verify.mjs` → `_live-verify.json`（`PASS=true`）  
Confirm 再验：`_live-billing.mjs` → Confirm 区 **0** mid `href`  
BillingHold：源码 `AgentBillingHoldBanner.tsx` **无任何 `<a href>`**（种子 persona 未挂出横幅；未伪造 DOM）

| # | 自检 URL（已打开） | 操作 | 截图 | 结果 |
|---|-------------------|------|------|------|
| 1 | `/agent` | goto | `live-01-home.png` | 无全宽样机黄条；无「回中台/运营 Inbox」 |
| 2 | `/agent/sessions` | goto | `live-02-sessions.png` | 无「回中台/案详/运营 Inbox」CTA |
| 3 | `/agent/sessions/sess-oa-1?focus=hitl` | **点击**会话行进入 | `live-03-session-via-click.png` · `live-07-confirm-hitl.png` | Confirm：**批准策略/授权递交/退回**；**无**「回中台」「运营 Inbox」链 |
| 4 | `/agent/projects` | goto | `live-04-projects-list.png` | **无**全宽 amber「样机·无真 LLM」 |
| 5 | `/agent/projects/proj-demo-general` | **点击**项目卡进入 | `live-05-project-workspace-via-click.png` | 顶栏白底 chips（通用/未绑案）；**非** amber tip wall |

机器断言（每页）：

- 禁文案计数 = 0：`回中台` / `运营 Inbox` / `案详` / `样机 · 无真 LLM` …
- 视口顶部全宽 amber tip wall（含「样机|无真 LLM」）= 0
- 指向 mid 口（`:5173` 或跨源 `/cases|/inbox|/billing`）的可见 `<a>` = 0

## 改了什么（相对 AGENT_REMIND_TABS tip）

### A · 黄条（本责）
- `ProjectListPage`：删除全宽 amber「样机·无真 LLM…」
- `ProjectWorkspacePage`：amber tip wall → 白底弱信息 + CaseBind
- `ProjectChatPane` / `ProjectFolderSidebar` / `ProjectFolderContext`：样机诚实句收敛为弱提示或删除

### B · mid 用户 CTA（Owner 已改；本侧只验、不回加）
- Sessions List / Session Header / Confirm / Context / Sidebar / toast / BillingHold：**用户可见 mid 深链已删**
- `deepLinks` helper 可留；`ProductSwitcher`（产品面切换，含「作业中台」）**保留**（非 Inbox 深链）

## 可点验（人工复核）

1. 开 `http://127.0.0.1:5175/agent/projects` → 顶无黄条  
2. 点进任一项目 → Workspace 顶非琥珀 tip wall  
3. `/agent/sessions` → 无「回中台 / 案详 / 运营 Inbox」  
4. 点进 `?focus=hitl` 会话 → Confirm 无 mid CTA  
5. BillingHold：读 `AgentBillingHoldBanner.tsx` — 涉案名为 `<span>`，无 mid 链  

## Blockers

无。种子态 BillingHold 未挂出（`overdueStop`/欠票结构未命中）；**源码级**已确认无 mid 链，不靠 DOM 注入假过。
