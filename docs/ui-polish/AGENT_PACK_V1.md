# Agent Pack v1（样机 · mock validator · 2026-09-21 CST）

对齐：`agent-platform-gap` §3 下一刀 · `patent-pack-design` 16 席 / HITL×8 · `agent-patent-shell`（叠 `6388c3b`，不回退）。

禁 Cloud；仅 `apps/agent/**` + 本短记/截图。未改 mid/workbench/iam/packages。

## 落地

| 项 | 实现 |
|----|------|
| Catalog 16 席 | `PATENT_CATALOG_IDS` 补 F7–F9：`expert-annuity` / `valuation` / `monetize` / `enforcement`；Phase 灰显可点空态；FTO 辅席保留且 ≠ enforcement；mining≠intake |
| Mock validator | `projects/pack/patentValidator.ts` + `SeatValidatorPanel`：Issue 列表 → 自修复重跑 → Pass 才 `setThreadHitl` |
| HITL×8 | `projects/pack/patentHitl8.ts` + `PackHitlOverview`：①布局…⑧交易；Phase⑦⑧灰显；Confirm 接既有 `HitlGateId` |
| Handoff 信封 | `projects/pack/patentHandoff.ts`：from/to/type/acceptance；可写入过程面板附录 |
| 双文件 / 单聊 / 群聊 / 总控 | 保留既有壳；端用户禁 mid 可点深链；Solo=`/agent/sandbox` · Team=`/agent/team` 旁路未砸 |

## 改动路径

```
apps/agent/src/projects/types.ts
apps/agent/src/projects/experts.ts
apps/agent/src/projects/expertsPatent.ts
apps/agent/src/projects/patentDeliverables.ts
apps/agent/src/projects/patentMidMap.ts
apps/agent/src/projects/pack/patentHitl8.ts
apps/agent/src/projects/pack/patentValidator.ts
apps/agent/src/projects/pack/patentHandoff.ts
apps/agent/src/components/patent/PackHitlOverview.tsx
apps/agent/src/components/patent/SeatValidatorPanel.tsx
apps/agent/src/pages/patent/PatentCatalogPage.tsx
apps/agent/src/pages/patent/PatentSeatPage.tsx
apps/agent/src/pages/projects/ProjectWorkspacePage.tsx
docs/ui-polish/AGENT_PACK_V1.md
docs/ui-polish/agent-pack-v1/*.png
```

## 截图

`docs/ui-polish/agent-pack-v1/`

- `01-catalog-pack16.png` / `01b-catalog-phase.png` — Catalog 含 Phase 四席
- `02-hitl8-overview.png` — HITL×8 总览
- `03-seat-validator-fail.png` — 产出→Issue
- `04-seat-validator-pass-hitl.png` — 自修复 Pass + Handoff + HITL 解锁
- `05-phase-empty.png` — 年费管家空态
- `06-project-pack.png` — 演示项目工作区
- `07-sandbox-solo.png` — Solo 旁路仍可达

## 自点（Asia/Shanghai · `http://127.0.0.1:5175`）

- [x] `/agent` Catalog 见 Pack 16 席（含 Phase 灰显）
- [x] 检索员单聊：产出→validator Issue→自修复 Pass→HITL 解锁；Handoff 信封可写过程
- [x] HITL×8 总览在 Catalog / 单聊 / 项目可见；⑦⑧ Phase 灰显
- [x] Phase 席点进空态说明（非空聊）
- [x] Solo/Team 旁路可达；无 mid 可点深链验收
- [x] `npm run typecheck -w @ip/agent` 通过
