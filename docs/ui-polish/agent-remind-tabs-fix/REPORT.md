# AGENT_REMIND_TABS 质感安装 · REPORT

| 项 | 值 |
|----|-----|
| **日期** | 2026-09-19（Asia/Shanghai） |
| **基线 HEAD** | `94cb31e` → **落地**（见下文 SHA） |
| **权威** | `docs/ui-polish/REVIEW_AGENT_REMIND_TABS_2026-09-19.md` |
| **范围** | **仅** Agent `:5175` · `apps/agent/**` + `apps/agent/src/agent.css` |
| **禁止** | mid/wb/ops · HITL 闸语义 / DomainCommand · ENTRY/FULL/P0-AF-1 dock · P1-AF-5 compact 存在性 · Cloud Agent |
| **Skills** | apple-design · make-interfaces-feel-better · web-design-guidelines |
| **运行时** | Vite `http://127.0.0.1:5175` · 视口 1440×900 |
| **typecheck** | `npm run typecheck -w @ip/agent` → **green** |

---

## Must

### ART-M-1 · Copy one vocabulary
- [x] 主词统一 **「待确认」**（侧栏 segmented / Home chip / Catalog 脚 / Confirm 顶标）
- [x] 角色次级 chip：**「待企业」** / **「我方」** / **「待代理」**（禁「待企业确认」「待我确认」）
- [x] Catalog **「需确认」→「待确认」**（禁第四套）
- [x] Agent 面状态展示经 `agentRunStatusLabel`（`needs_human` → 待确认；共享 `RUN_STATUS_LABEL` 未改 mid/ops）
- **证据**：`02-sessions-shell-nav.png` · `06-catalog-remind-copy.png` · `_measures-after.json` copyHits（需确认=0 · 待企业确认=0）
- **实现**：`sessionGates.ts` · `statusLabels.ts` · `AgentPickerCard.tsx` · `SessionConfirmBar.tsx` · list/sidebar/header/harness

### ART-M-2 · Home/Browse remind chip single entrance
- [x] Home 视口可点「待确认 · N」= **1**（仅 compact 侧栏；删底 strip `home-needs-human-link`）
- [x] 视觉升一级：`.agent-remind-chip` 深 amber + inset 轨（dash-next 精神，非 success 绿）
- **证据**：`01-home-single-chip.png` · `01b-home-chip-closeup.png` · `01c-home-compact-sidebar.png` · measures `homeRemindClickables.length=1`
- **实现**：`AgentHome.tsx` · `AgentSessionSidebar.tsx` · `agent.css`

### ART-M-3 · Badge ≥11–12px; Inbox not ghost
- [x] `.agent-biz-badge` **11px**（禁 9px 状态文）；实测 h≈20
- [x] 侧栏 Inbox 幽灵链 → overflow「**在运营 Inbox 打开**」（`min-h-10` / hit-40）
- [x] 列表页 → `ui-btn-sm` secondary「在运营 Inbox 打开」+ hit-40
- **证据**：`02-sessions-shell-nav.png` · `03-sessions-needs-human.png` · `_measures-after.json` badges.fs=11px
- **实现**：`AgentSessionSidebar.tsx` · `AgentSessionsList.tsx` · `agent.css`

### ATT-M-1 · Shell top 4 equal tabs → vertical nav
- [x] 竖向 nav-section：icon+标签；选中 `list-row-active` / accent-soft inset
- [x] 项高实测 **40**（≥36–40）；无 4 等权挤一行
- **证据**：`02c-shell-nav-tabs.png` · `02-sessions-shell-nav.png` · measures navItems.h=40 · 会话 bg accent-soft
- **实现**：`AgentSessionSidebar.tsx`

### ATT-M-2 · Session segmented
- [x] 计数空格/tabular：`全部 · 4` / `待确认 · 3` / `进行中 · N`（不粘字）
- [x] 主分段 **全部 | 待确认 | 进行中**；筛选菜单仅次要（已完成 / Agent / 归档）
- [x] 待确认选中：浅 amber 底 + inset 琥珀轨（`data-tone="remind"`）
- **证据**：`02b-session-segmented.png` · `03b-segment-remind-selected.png` · measures segments + remindSelected
- **实现**：`AgentSessionSidebar.tsx` · `agent.css`

---

## Should（opportunistic）

| ID | 状态 | 说明 |
|----|------|------|
| ART-S-2 | ✅ | Catalog 脚琥珀 mini-chip `.agent-catalog-remind-chip` |
| ART-S-3 | ✅ | Home/Sessions/Sidebar create toast → `.ui-toast.ui-toast-info`（≠ remind amber） |
| ATT-S-1 | ✅ | compact：最近 1–2 待确认标题链 +「打开会话 Inbox」；**未**恢复完整列表 |
| ART-S-1 | ⏭ | Confirm 顶行减噪未做（不重开 dock） |
| ATT-S-2 | ⏭ | 项目/专家选中统一未做 |
| ATT-S-3 | ⏭ | Catalog tier segmented 未改 |
| ATT-S-4 | ⏭ | 行密度 ≤2 未并 badge 行 |

---

## 可点 URL

| 面 | URL |
|----|-----|
| Home（单 chip） | http://127.0.0.1:5175/agent |
| 会话 + 竖 nav + segmented | http://127.0.0.1:5175/agent/sessions |
| 待确认筛选 | http://127.0.0.1:5175/agent/sessions?filter=needs_human |
| Catalog 脚文案 | http://127.0.0.1:5175/agent/agents |

---

## Blockers

无。5 Must 全交付；typecheck green。
