# Deep Wave 6 — Agent Catalog / Harness / Session 视觉抛光

## 1. 改了什么

### 共用组件 / token
| 组件 / 文件 | 要点 |
|-------------|------|
| `src/index.css` | Deep W6：`agent-picker-card` / `agent-meta-*` / `agent-tier-badge` / `agent-harness-*` / `agent-aside*` / `agent-artifact-*` / `agent-timeline-artifact` / `agent-confirm-sheet*` |
| `AgentPickerCard.tsx` | `surface-card` + tier 边框；详情区 **六段信息层级**（何时用 / 输入 / 输出 / 护栏 / 工具 / 谁负责）；CTA → `ui-btn*` |
| `AgentTierBadge.tsx` | Core / Assist / Beta → `agent-tier-badge[data-tier]` |
| `AgentCatalogPage.tsx` | 分层 `segmented`；搜索/阶段 `ui-input`；空态 `ui-empty` |
| `AgentHarnessOverview.tsx` | 目录行 → `agent-harness-row` + tier badge；最近会话同卡面 |
| `SessionContextPanel.tsx` | `agent-aside` 层次；空态 dashed；产物 tab + `agent-artifact-panel`；Agent 名旁 Core/Assist/Beta badge |
| `SessionTimeline.tsx` | 产物气泡 → `agent-timeline-artifact` |
| `SessionConfirmBar.tsx` | Confirm 折叠区 → `agent-confirm-sheet` / body（**未改** `onGate` / `onHitl` / gate 语义） |

### 按 agent id 覆盖（目录卡继承共用抛光 + 会话证据）
| agent id | Catalog/Harness | Session after |
|----------|-----------------|---------------|
| `agent-research` | ✅ 目录卡（六段展开见 overview） | `session-agent-research-after.png` |
| `agent-disclosure` | ✅ | `session-agent-disclosure-after.png` |
| `agent-intake` | ✅ | `session-agent-intake-after.png` + `session-panel-*-after` |
| `agent-claims` | ✅ | `session-agent-claims-after.png` |
| `agent-oa` | ✅ | `session-agent-oa-after.png` + `session-panel-agent-oa-after.png` |
| `agent-annuity` | ✅ | `session-agent-annuity-after.png` |
| `agent-monetize` | ✅（Beta 软边/软 CTA） | `session-agent-monetize-after.png` |
| `agent-watch` | ✅（Assist） | `session-agent-watch-after.png` + panel |
| `agent-layout` | ✅（Beta，Harness/目录 Assist·Beta 区） | `session-agent-layout-after.png` + panel |

全量 9 个业务 Agent（`src/data/agents.ts` `AGENT_CATALOG`）均已覆盖。

## 2. 截图路径
`docs/ui-polish/deep-w6/` 与 `.ui-evidence/deep-w6/`（before **未覆盖**）：

| 证据 | before | after |
|------|--------|-------|
| catalog-overview | ✅ | ✅（含六段展开） |
| catalog-assist-beta | — | ✅ |
| catalog-empty | — | ✅ |
| harness-overview | ✅ | ✅ |
| sessions-list | ✅ | —（基线） |
| session-seed（oa） | ✅ | — |
| session-agent-*（9 ids） | — | ✅ 各 1 |
| session-panel-{oa,watch,layout,intake} | — | ✅ 右侧上下文+产物 |

## 3. 怎么验
```
npm run dev:agent   # 端口 5175 · 分支 dev
http://127.0.0.1:5175/agent/agents          # surface-card + segmented 分层 + 详情六段
http://127.0.0.1:5175/agent/harness         # agent-harness-row + Core/Assist/Beta
http://127.0.0.1:5175/agent/sessions/sess-oa-1   # 展开「上下文」：aside / 产物 / Confirm 分层
```
搜索无结果应见 dashed `ui-empty`。Confirm 主按钮行为与闸门禁用理由应与改前一致。

## 4. 刻意未做
- **未改** HITL / gate / `onGate` / `onHitl` / `dispatchCommand` / contracts / Persona 闸语义
- **未改** `sessionGates.ts` 判定逻辑与递交/齐套文案内容（仅 sheet className）
- 未同步 `src/components/agent/*` mid 镜像（mid `/agent/*` 外链到 5175）
- 未改 `@ip/ui` 包源码；未 push；未启动 Cloud Agent
- 未做 Home composer / Sessions 列表深度抛光（非本波主目标）

## 5. typecheck
`npm run typecheck -w @ip/agent` — **通过**（`@ip/ui` 未改）

## 6. blockers
- 无功能 blocker
- 会话右栏默认折叠（`rightOpen=false`）；证据用「展开上下文」拍 panel；日常需点一次才见产物面板
