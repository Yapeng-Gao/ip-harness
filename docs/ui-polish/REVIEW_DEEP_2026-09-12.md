# 整仓深评 · REVIEW_DEEP_2026-09-12

| 项 | 值 |
|----|-----|
| **评审方** | UI评估助手（只评不改） |
| **HEAD** | `a099ab8`（含 P0 `86e87bb`） |
| **规范** | [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) · [`EVAL_RUBRIC.md`](./EVAL_RUBRIC.md) |
| **技能** | apple-hig-full · make-interfaces-feel-better · web-design-guidelines |
| **方法** | 对照规范条款 + `docs/ui-polish/**` AFTER（含 review-p0）+ 五壳 HTTP 200；本机 desktop 共享屏连拍不稳定，视觉以同源证据为准 |
| **总评** | **Conditional Go** |
| **相对 REVIEW_2026-09-12** | P0 已 Go（见 `REVIEW_P0_RECHECK.md`）；本单加深内页与风格统一，P1 仍挡全量 Go |

---

## 分数卡

### 七维（1–5 整数）

| # | 维度 | 分 | 证据一句 | DS |
|---|------|----|----------|-----|
| D1 | 信息层级与首屏下一步 | **4** | mid `/`：`dash-board-top` + 琥珀优先条 + navy「去办理」清晰；scan chip 已拆（`review-p0/mid-priority-bar-after.png`） | DS-COMP-DASH · DS-SCAN-01 |
| D2 | 间距/密度/对齐 | **3** | Inbox/案件库列网格合格；wb draft/prosecution 双栏与 maintain 年费表仍挤；catalog 展开密 | DS-SPACE-01 |
| D3 | 视觉一致性 | **3** | 主路径 `surface-card`/`ui-btn*`/`segmented` 齐；**多页 violet/indigo 残留违 F1**（WorkbenchHome、LayoutFlow、Docket、Inventor…） | DS-COLOR · DS-FORBID F1 |
| D4 | 流程内页（壳好看里糙） | **3** | W4 步进 / W5 节点流水线 / W6 catalog·session 已抬；catalog 墙字、pipeline 空列、IAM 调试壳仍暴露木桶短板 | DS-COMP-WB/MID/AGENT · DS-HONESTY |
| D5 | 交互反馈 | **4** | Confirm 内联禁用原因达标（`review-p0/agent-confirm-*-after.png`）；Layout `focus-visible`；偶发 `outline-none`/`transition-all` | DS-DISABLED-01 · DS-FOCUS-01 |
| D6 | 文案可读与噪音 | **4** | P0-1 长串已拆；tip 叠层、Phase0 徽章、ops raw URL 仍噪 | DS-SCAN-01 · DS-HONESTY · F8 |
| D7 | 跨壳一致 | **3** | mid↔wb 同侧栏语言；agent 会话轨允许差异但密度缝在；ops/iam 轻壳 + 调试/深链倾倒 | DS-SHELL-01/02/03 |

**七维均分 ~3.4**（表内整数）。

### 附加分

| ID | 名称 | 分 | 说明 |
|----|------|----|------|
| **S1** | 风格统一分 | **3** | Wave1–3 + ui-* 主路径统一；跨页 F1（violet/indigo）与 ops/iam 调试面拉低组件库级一致 |
| **S2** | 深层次内页分 | **3** | 木桶：Flow≈3.5（research/draft/prosecution 可演示）· 节点≈3.5 · Pipeline/Docket≈3（空列/态证据）· Agent 内页≈3（catalog meta / 默认折上下文）· IAM≈1.5 |

---

## 总评理由

P0 门槛已过（对比 chip + Confirm 禁用理由），产品主路径可演示。  
按 `EVAL_RUBRIC`：**全量仍 Conditional Go** — S2 无「脚手架级」子集但未达「与 Dashboard 同级」；S1 因 F1 残留不能给 4+；P1 清单仍会在干系人走查中显「未完工」。

**升全量 Go 最低条件**：关掉下方 P1-A～P1-E（或等价），并把 F1 主路径清零。

---

## 跨壳不一致 vs 单页糙

| 类型 | 项 | 说明 |
|------|-----|------|
| **跨壳 / 跨页风格债** | violet·indigo 随机色 | 同违 DS-FORBID F1，出现在 workbench home/layout、docket、inventor、insight、billing 等 → **S1/D3**，非单页偶然 |
| **跨壳** | ops/iam 与 mid chrome 完成度 | 顶 pill 一致，但内页诚实度/调试态不同；允许轻壳（DS-SHELL-03）但 F8/调试扮产品拉低 D7 |
| **跨壳可接受** | Agent 会话轨 ≠ mid 侧栏 | DS-SHELL-03 允许；字号/行密度缝记 P2 |
| **单页糙** | Pipeline 空列主导 | 仅 mid `/pipeline` 演示数据问题 |
| **单页糙** | Catalog 六段墙字 | 主要在 `/agent/agents` 展开态 |
| **单页糙** | 会话上下文默认折 | `/agent/sessions/:id` |
| **单页糙** | wb tip 叠层 | intake/research 等 Flow |
| **单页糙** | Docket warn/critical 少见 + indigo 态色 | `/docket` |

---

## P0（本单）

**无新增 P0。** 历史 P0-1/P0-2 已 PASS（`REVIEW_P0_RECHECK.md` · DS-SCAN-01 / DS-DISABLED-01）。

---

## P1（应改 · 问题→规范→验收→URL）

### P1-A · Pipeline 空列主导（单页糙）
- **问题**：多数阶段 dashed 空，1–2 卡淹没 → 读成未完工看板。
- **规范**：DS-HONESTY-01 · S2 Pipeline 子集
- **验收**：空列可折叠/开关，或评审租户 ≥4 阶段各 ≥1 卡；证据更新。
- **URL**：`http://127.0.0.1:5173/pipeline` · `deep-w5/pipeline-after.png`

### P1-B · Catalog 展开 meta 墙字（单页糙）
- **问题**：六段「何时用/输入/输出…」灰墙。
- **规范**：DS-FORBID F2 · DS-COMP-AGENT `agent-meta-grid`
- **验收**：两列定义列表 + 标签弱化；超高「更多」；展开态截图达标。
- **URL**：`http://127.0.0.1:5175/agent/agents` · `deep-w6/catalog-overview-after.png`

### P1-C · 会话上下文默认折叠（单页糙）
- **问题**：待确认会话默认看不到产物/aside。
- **规范**：DS-COMP-AGENT · S2 Agent interiors
- **验收**：待确认首次自动展开一次，或常驻「上下文」chip（未读数）。
- **URL**：`http://127.0.0.1:5175/agent/sessions/:id`（如 `sess-oa-1`）

### P1-D · Workbench tip/banner 叠层（单页糙）
- **问题**：多 tip + 红灯 + 表单 + 草稿争抢首屏。
- **规范**：DS-COMP-WB · D6 tip 上限
- **验收**：同视口 ≤1 sticky tip；info vs blocker 分级；blocker 不在折线以下。
- **URL**：`http://127.0.0.1:5174/workbench/intake/c5` · `/workbench/research/c2` · `deep-w4/*-after.png`

### P1-E · violet/indigo 残留清扫（跨页风格债）
- **问题**：多文件仍用 `violet-*`/`indigo-*`，违主 CTA/状态色体系。
- **规范**：DS-FORBID **F1** · DS-COLOR-02 · S1
- **验收**：`rg 'violet-|indigo-' apps src/pages --glob '*.tsx'` 主产品路径 **0 命中**（或仅文档/注释）；改用 status/accent/primary token；抽检 WorkbenchHome、LayoutFlow、Docket、InventorPortal。
- **URL（代表）**：`5174/workbench` · `5174/workbench/layout` · `5173/docket`

### P1-F · Docket 态矩阵与色 token（单页糙 + 局部 F1）
- **问题**：warn/critical 证据不足；部分态用 indigo 而非 status token。
- **规范**：DS-COMP-MID docket · DS-STATUS · F1
- **验收**：评审租户可见 ≥1 warn、≥1 critical 轨色；去掉 indigo 态皮。
- **URL**：`http://127.0.0.1:5173/docket` · `deep-w5/docket-after.png`

---

## P2（可缓）

| ID | 问题 | 规范 | 验收 | URL/证据 |
|----|------|------|------|----------|
| P2-1 | IAM cookie/localStorage 调试扮产品 | DS-SHELL · DS-HONESTY | Dev tools 标注或产品登录线框 | `:5177` · `wave3/iam-home-after.png` |
| P2-2 | Ops 深链 raw localhost | F8 | 仅标签按钮 | `:5176` · `wave3/ops-home-after.png` |
| P2-3 | 「Phase 0 · monorepo」全局 | DS-HONESTY | 干系人构建隐藏/env badge | 各壳顶栏 |
| P2-4 | 长案名撑布局 | D2 | truncate + tooltip | mid Inbox / pipeline |
| P2-5 | Agent 轨 vs mid 行密度缝 | DS-SHELL-03 | 字号阶梯对齐 footnote/caption | agent session vs mid inbox |

---

## 抽检覆盖

| 面 | 路由 | 证据 |
|----|------|------|
| mid | `/` | `review-p0/mid-dashboard-after.png` · priority/inbox after |
| mid | `/cases` | `wave3/mid-case-library-after.png` |
| mid | `/cases/c1` | `deep-w5/case-detail-nodes-after.png` |
| mid | `/pipeline` | `deep-w5/pipeline-after.png` |
| mid | `/docket` | `deep-w5/docket-after.png` |
| wb | `/workbench` | `wave3/workbench-home-after.png` |
| wb | research/intake/draft/prosecution/maintain | `deep-w4/*-step1-after.png` |
| agent | home/catalog/harness | `wave1/agent-home-after` · `deep-w6/catalog-*` · `harness-*` |
| agent | ≥2 Confirm | `review-p0/agent-confirm-oa|intake-after.png` · session after |
| ops/iam | 壳 | `wave3/ops-home-after.png` · `iam-home-after.png` |

**运行时**：`5173–5177` 全部 HTTP **200**。

---

## 给质感助手的安装顺序（问题→标准，不写实现长文）

1. **P1-E F1 清扫**（跨页，收益最大于 S1/D3）  
2. **P1-B catalog meta** + **P1-C 上下文默认**（抬 S2 Agent）  
3. **P1-A/F pipeline·docket**（抬 S2 mid 看板）  
4. **P1-D tip 叠层**（Flow）  
5. P2 按空闲插入  

每条 PR 自检：对照 `DESIGN_SYSTEM.md` §8 清单；引用本文件 P 级 ID。

---

## 建议下一步（总控）

1. 推仓：`DESIGN_SYSTEM.md` · `EVAL_RUBRIC.md` · 本 `REVIEW_DEEP_*.md`（评估侧未 push）。  
2. 派 **UI质感助手** 按规范吃 **P1-E → P1-B/C → P1-A/F → P1-D**。  
3. 演示数据若需 seed：中台应用助手协作 pipeline/docket。  
4. P1 合入后叫评估做 **短复评**（对照本文件 P1 验收，不必重写七维全文）。

---

*未改业务代码 / contracts / HITL / Persona / STEPS；未开 Cloud Agent；未 push。*
