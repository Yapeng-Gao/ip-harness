# AGENT_NO_MID_BANNER — 终端用户去 mid 深链 + 写回文案产品化

**分支** `dev` · **范围** `apps/agent/**`（证据本目录）· **边界** 不重开 dock/compact；不改 HITL→DomainCommand；不改 mid/workbench/ops 源码。

## 去 mid 深链 CTA（自证）

| 位置 | 原 CTA | 处理 |
|------|--------|------|
| `SessionWorkspaceHeader` | 「回中台」`midHref(/cases…)` | 删除 |
| `AgentSessionsList` | secondary「回中台案件库」；行内「案详」；「在运营 Inbox 打开」 | 删除 |
| `SessionConfirmBar` | 「在运营 Inbox 中查看」`midInboxHref`；「打开费用中心」`midBillingHref` | 删除；欠票改纯文案提示 |
| `SessionContextPanel` | 案卡链 mid +「在作业中台打开」 | 改为只读案信息（保留 workbench 表单链） |
| `AgentSessionSidebar` | 行菜单「在运营 Inbox 打开」 | 删除 |
| `AgentSessionWorkspace` toast | 「打开案件」`midHref` | 删除 mid CTA；文案「案件已同步更新」（保留 workbench 台链） |
| `AgentBillingHoldBanner` | `midCaseHref` / `midBillingHref` | 保留欠费文案与涉案名；**不再链 mid** |

`apps/agent/src/lib/deepLinks.ts` 内 mid helper **保留**（其它面/文档可复用），Agent UI **不再调用**。

## 文案产品化

- 「写回中台 / 写入作业中台 / 写回」→「确认后写入案件 / 写入案件前须绑定 / 不会写入案件」等
- 覆盖：`AgentHome` · `AgentHarnessOverview` · `CaseBindControls` · `SessionWorkspaceHeader` · `AgentSessionWorkspace` · `SessionComposer`（演示句）

## 黄条（顺手 / 与质感并行）

已去掉或收敛全宽样机诚实条：

- `ProjectListPage` 顶栏 `bg-amber-50`「样机·无真 LLM…」整条删除
- `ProjectWorkspacePage` 顶栏去琥珀诚实条，改白底密度 chips
- `ProjectChatPane` 头「样机·无真 LLM」chip 删除
- `ProjectFolderSidebar` / `ProjectFolderContext` 样机诚实句改为产品弱提示

**未动**：Beta 改荐 / 换人确认 / HITL bridge / 欠费 hold 等**业务**警示色（非样机诚实大黄条）；欠费不链 mid。

## 自证

- `npm run typecheck -w @ip/agent` ✅
- `rg 'midHref\(|midCaseHref\(|midInboxHref\(|midBillingHref\(' apps/agent/src`（排除 `lib/deepLinks.ts`）无 UI 调用
- `rg '写回中台|回中台|在运营 Inbox|在作业中台打开' apps/agent/src` 无用户诱导 CTA

## SHA

`d2d91faeefad7c6e19b587917bb6af7364df119d`

---

## 活验（Playwright · 2026-09-19 11:24 CST）

基址 `http://127.0.0.1:5175` · 证据目录 `docs/ui-polish/agent-p0-overlay/`

| URL | 操作 | 截图 | 结果 |
|-----|------|------|------|
| `/agent` | goto | `live-01-home.png` | PASS |
| `/agent/sessions` | goto | `live-02-sessions.png` | PASS |
| `/agent/sessions/sess-oa-1?focus=hitl` | **click** 行 | `live-03-session-via-click.png` | PASS · Confirm 无 mid |
| `/agent/projects` | goto | `live-04-projects-list.png` | PASS · 无全宽样机黄条 |
| `/agent/projects/proj-demo-general` | **click** 卡 | `live-05-project-workspace-via-click.png` | PASS · 非 amber tip wall |

`_live-verify.json` → `PASS=true`。BillingHold：组件无 `<a href>`；种子未挂出横幅。
