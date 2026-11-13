# Agent 全壳关闸自证 · 2026-09-19

| 项 | 值 |
|----|-----|
| **对照** | `docs/ui-polish/REVIEW_AGENT_FULL_2026-09-19.md`（基线 HEAD `d40a465`） |
| **分支** | `dev` |
| **范围** | `apps/agent/**` + 本证据 docs |
| **typecheck** | `npm run typecheck -w @ip/agent` ✓ |
| **截图目录** | `docs/ui-polish/agent-full-evidence/fix/` |
| **ENTRY** | 未回退：Home 仍单主 CTA「开始办理」+ compact chip 叙事 |

## 闸门对照

| ID | 如何关 | 自证 |
|----|--------|------|
| **P0-AF-1** | `needs_human` 时 Confirm **单独**进 `.agent-hitl-dock` sticky；Composer/Agent 切换移出 dock，默认 `<details>` 收起；dock `max-height: 200px` + 圆角 | `fix-01` / `fix-02` / `fix-04` · `_measures-1440-final.json`：dockH≈157–173（≤200）；timelineH≈601@1440 / ≥360@1280；`foldOpen:false` |
| **P1-AF-1** | 右栏 `.agent-aside`：`<2xl` 用 `w-56`（224），`2xl:w-72`；避免 1280 仍锁 320 | `fix-04`：asideW=224，midW=832（≥820@1280） |
| **P1-AF-2** | `AgentShell`：`h-full overflow-hidden`；主列 `overflow-hidden`；仅轨迹 `min-h-0 overflow-y-auto` + 右栏内滚；`html/body/#root` `overflow:hidden` | `_measures-1440-final.json`：`bodyScroll:false` |
| **P1-AF-3** | Composer 增加 `hideDisableReason`；HITL 折叠态只 `sr-only`，可见红字仅 Confirm 一处 | `fix-02` · measure：`reasonCount:1` |
| **P1-AF-4** | `.confirm-hitl` / `.agent-hitl-dock` → `border-radius: var(--radius-md)`（12px） | measure：`confirmRadius:12px`，`dockRadius:12px 12px 0 0` |
| **P1-AF-5** | Catalog/Harness 与 Home 一样 `collapseInbox` compact 侧栏（无完整会话列表） | `fix-05` / `fix-06` · compact testid |
| **P1-AF-6** | 步进 chip 改为状态名「待批准 / 已批准…」；主 CTA 仍用动作名「批准策略」 | `fix-02` 文案：chip「待批准」「待授权」≠ CTA「批准策略」 |

## 口播（约 30s）

待确认会话里，底栏现在只剩 Confirm 一条粘性带，高度压在约 180px 内，输入和换 Agent 默认收起，轨迹能扫到半屏以上。1280 右栏收到 224，中栏不再被 320 挤死；壳本身不滚，只有轨迹和右栏内滚。禁用原因只在 Confirm 出现一次；步进点是「待批准」，按钮才是「批准策略」。目录和 Harness 侧栏也收成和 Home 一样的 compact，不再铺一整列 Inbox。

