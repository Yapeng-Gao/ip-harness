# Deep Wave 4 — Workbench step interiors

## 1. 改了什么

### 共用
- `src/index.css`：Deep W4 工具类 `wb-tip*` / `wb-check-row` / `wb-node-card` / `wb-chip` / `wb-draft-area` / `wb-inset`
- `apps/workbench/src/components/FormBlocks.tsx`：`WbTip` `WbCheckRow` `WbNodeCard` `WbEmpty` `WbChip` `WbInset`；`WbSection`/`WbError` 对齐
- `apps/workbench/src/components/flow/styles.ts`：`inputCls`/`textareaCls`/`btn*` → Wave3 `ui-*`；新增 `draftAreaCls`
- `SplitDraft.tsx`：侧栏层次 / sticky 草稿区
- `Stepper.tsx`：进度格密度与 tabular
- `HandoffActionBar.tsx`：闸门 tip 仅换 `wb-tip` 视觉（文案/逻辑未动）
- `VersionPanel.tsx`：`surface-card` + `ui-empty` + `wb-inset`
- mid 镜像同步：`src/components/workbench/{FormBlocks,VersionPanel,flow/*}`

### 按阶段
| 阶段 | 文件 | 内饰要点 |
|------|------|----------|
| research | ResearchFlow | 命中 `WbNodeCard`、库/FTO `WbChip`/`segmented`、`WbCheckRow`、`ui-table`、绑定/闸门 `WbTip`、草稿 `draftAreaCls` |
| intake | IntakeFlow | 披露 tip、报价 inset、投票卡、Go/No-Go、交接 `WbSection`、闸门 tip |
| draft | DraftFlow | 右栏 segmented、权要树/策略/齐套/Full-check、`WbCheckRow`/`WbChip` |
| prosecution | ProsecutionFlow | OA 时间线、争点/策略 chips、陈述确认 check、空态 `WbEmpty` |
| maintain | MaintainFlow | 日程 tip、行 `list-row`、空发票 `ui-empty`、草稿区 |
| monetize | MonetizeFlow | 路径 `WbChip`、里程碑 inset、草稿区 |
| watch | WatchFlow | 规则/告警行、chip 高亮、inset 卡片 |
| layout | LayoutFlow | 说明 tip、补挂 tip、矩阵 `list-row`、国别 `WbChip` |
| inventor | InventorPortal | `ui-input`/`surface-card`/`ui-empty`/`ui-btn*` |

## 2. 截图路径
`docs/ui-polish/deep-w4/` 与 `.ui-evidence/deep-w4/`：
- research-step1-after.png
- intake-step1-after.png
- draft-step1-after.png
- prosecution-step1-after.png
- maintain-step1-after.png
- monetize-step1-after.png
- watch-step1-after.png
- layout-step1-after.png
- inventor-step1-after.png

（说明：真实 before 在纠正 caseId 重拍时被 after 覆盖；本波按要求交付 **每阶段 ≥1 after**。）

## 3. 怎么验（每阶段 URL，端口 5174）
```
http://127.0.0.1:5174/workbench/research/c2
http://127.0.0.1:5174/workbench/intake/c5
http://127.0.0.1:5174/workbench/draft/c4
http://127.0.0.1:5174/workbench/prosecution/c1
http://127.0.0.1:5174/workbench/maintain/c6
http://127.0.0.1:5174/workbench/monetize/c3
http://127.0.0.1:5174/workbench/watch/c9
http://127.0.0.1:5174/workbench/layout
http://127.0.0.1:5174/inventor
```
`npm run dev:workbench` 已在 5174。

## 4. 刻意未做
- 未改 STEPS / usePersistedFlowStep / handoff / dispatchCommand / guardrails / AppLink / stages 导出 / Persona 闸语义
- 未改交接主路径与校验文案内容（仅 tip 样式）
- 未做 Wave5；未 push；停在 `dev`
- 未动 mid/agent 业务页（仅同步 workbench 共用 chrome 镜像）

## 5. typecheck
`npm run typecheck -w @ip/workbench` — **通过**（`@ip/ui` 未改包源码）

## 6. blockers
- 真实 before 证据丢失（重拍 caseId 时误覆盖）；after 齐全
- 无功能 blocker
