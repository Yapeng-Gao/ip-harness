# 全量 UI/UX 深评（路由级）· REVIEW_FULL_SKILLS_DEEP_2026-09-18

| 项 | 值 |
|----|-----|
| **评审方** | UI评估助手（只评不改） |
| **基线（任务指定）** | `db14ec9`（`dev`） |
| **本评 HEAD** | `4f54d05`（`dev`；含 `df724af` FS-P2-1…6 落地 + docs SHA） |
| **日期** | 2026-09-18（Asia/Shanghai） |
| **范围** | mid `5173` · workbench `5174` · agent `5175` · ops `5176` · iam `5177` · doc-harness `5178` · ai-infra `5179` · ai-data `5181` · search `5182` · fto `5183` · mining `5184` · inspire `5185` · landscape `5186` · figure `5187` — **深路由，非仅首页** |
| **权威** | `DESIGN_SYSTEM.md` · `EVAL_RUBRIC.md` · `UI_SKILLS.md`（冻结三 skill） |
| **Skills** | `apple-design` · `make-interfaces-feel-better` · `web-design-guidelines` |
| **Guidelines** | https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md · **抓取日 2026-09-18** |
| **前评** | `REVIEW_FULL_SKILLS_2026-09-18.md`（首页 Go · P0/P1=0 · FS-P2-*）· `full-skills-p2/REPORT.md`（P2 落地） |
| **方法** | 代码/`rg` forbid+habit 抽检 + 14 口 HTTP 200 + Playwright 批量深路由截图 **76/76** |
| **证据** | `docs/ui-polish/full-skills-deep-evidence/`（命名 `shell-port-route`） |
| **本评总评** | **Go**（**P0=0 · P1=0**；前债 FS-P2-1…6 **已关**；残余短 P2 / 环境债） |

---

## 1. 环境与端口

| 端口 | 壳 | HTTP | 深路由截图 | 备注 |
|------|-----|------|------------|------|
| 5173 | mid | **200** | 7 | `/` `/pipeline` `/cases` `/docket` `/agencies` `/insight/tracks` `/settings` |
| 5174 | workbench | 200 | 9 | `/workbench` + research/intake/draft/prosecution/maintain/monetize/watch/**layout** |
| 5175 | agent | 200 | 5 | `/agent` sessions/agents/harness + **`/agent/sessions/sess-oa-1`** |
| 5176 | ops | 200 | 6 | `/` logs/monitor/models/infra/config |
| 5177 | iam | 200 | 2 | `/` `/login` |
| 5178 | doc-harness | 200 | 1 | SPA 首页即编辑器+修订树+批注（无独立路由） |
| 5179 | ai-infra | 200 | 8 | `/` gpus/jobs/endpoints/models/pipelines/loadtest/alerts |
| 5181 | ai-data | 200 | 8 | `/` sources/pipelines/datasets/recipes/quality/lineage/exports |
| 5182 | search | 200 | 4 | `/` saved/corpus + **`/families/fam-battery-solid`** |
| 5183 | fto | 200 | 6 | 五步全覆盖 features/hits/matrix/risk/report |
| 5184 | mining | 200 | 5 | disclosure/candidates/score/send |
| 5185 | inspire | 200 | 4 | sparks/favorites/send |
| 5186 | landscape | 200 | 6 | tree/insights/ingest + **`/nodes/edrive`** **`/orgs/org-byd`** |
| 5187 | figure | 200 | 5 | `/` `/new` + edit/versions/attach（`fig-seed-exploded`） |

| 环境 / 覆盖债 | 说明 |
|----------------|------|
| **FS-ENV-1** | 承接前评：mid 开发服偶发 down；**本评 14/14 口稳定 200**，记环境债不升格产品 FAIL |
| **DEEP-NOTE-1** | figure **`/generate/:draftId`** 无静态 seed id（须 `/new` 创建）；本评截了 `/new` + 种子资产 edit/versions/attach；generate 步进在无 draft 时侧栏灰显 — **非产品 FAIL** |

相对首页评：本评首次完成 **workbench 全 Flow 壳路由、agent 会话内页、FTO 五步、landscape 节点/企业、search 同族、figure 编辑闭环** 截图。

---

## 2. Forbid / Habit 抽检矩阵（深路由）

| 检查项 | 条款 | 结果 | 证据一句 |
|--------|------|------|----------|
| `outline-none` 无 focus 替换 | F5 · DS-FOCUS | **主路径 PASS** | mid skip-main 带 `focus-visible:ring-*`；doc-harness `.ProseMirror:focus-visible` 纸面 frame（FS-P2-3 **关**）；agent composer / Home textarea：**已无**冗余 `outline-none`（FS-P2-4 **关**）；`AgentShell` 主区仍裸 `outline-none`（区域焦点，弱 → P2） |
| chrome 可见 raw `localhost:51` | F8 · HABIT-06 | **PASS** | 并行/ai-* 顶栏为标签深链文案；`localhost` 仅 href 常量；search 侧栏提示 `` `/families/:id` `` 为路由说明（非 URL 倾倒）→ 轻噪音 P2 |
| EmptyState 无 CTA | HABIT-05 | **主路径 PASS** | gpus / exports「回总览」已补（FS-P2-2 **关**）；inspire/mining/fto 空态普遍带 action |
| disabled 无内联原因 | HABIT-03 · DS-DISABLED | **主路径 PASS** | SessionConfirmBar `.agent-confirm-reason`；ai-data「按钮已禁用」（FS-P2-1 **关**）；search「请先检索」（FS-P2-5 **关**） |
| `transition-all` / `transition: all` | F4 · DS-MOTION | **PASS** | 全仓 `rg` **0 命中**（承接首页评） |
| violet mock chips | F1 | **PASS** | `tone="mock"` → amber；无 violet 残留 |
| prefers-reduced-motion | DS-MOTION | **PASS** | `src/index.css` reduce 守卫；agent session matchMedia |
| 主 CTA `btn-press` | apple-design | **PASS** | 并行/ai-* Button + mid/wb/agent 主钮普遍 `btn-press` / `scale(0.96)` |
| icon-only 缺 `aria-label` | web-guidelines | **PASS** | agent 会话列表重命名/归档有 aria；doc-harness 工具栏/批注操作有 aria |

### 相对 FULL_SKILLS 的 FS-P2  disposition

| 前 ID | 本评 |
|-------|------|
| FS-P2-1 ai-data 文案/草稿 focus | **关闭**（深路由 `/datasets` 截图 + 代码：`ui-input` +「按钮已禁用」） |
| FS-P2-2 gpus/exports 空态 CTA | **关闭**（`/gpus` `/exports` 有「回总览」） |
| FS-P2-3 doc-harness 纸面 outline | **关闭**（`:focus-visible` frame） |
| FS-P2-4 agent outline-none 冗余 | **关闭** |
| FS-P2-5 search 过滤禁用旁注 | **关闭** |
| FS-P2-6 并行 EmptyState dashed | **关闭**（六壳已迁 `.ui-empty`）；ai-infra/ai-data/ops 自绘 dashed → 新短债 **FS-P2-7** |
| FS-ENV-1 mid 偶发 down | **仍开（环境）** · 本评未复发 |

无相对首页评的 **回归**（forbid 清零项保持；P2 关闭项视觉/代码双证）。

---

## 3. 七维 + 附加分（深路由加权）

| 维 | 分 | 一句 |
|----|----|------|
| D1 下一步 | **4** | mid 优先条 + Agent Confirm + wb 步进红灯闸门清晰；轻壳步骤条可读 |
| D2 间距密度 | **4** | 4/8 与卡密度稳定；fto 矩阵单元格紧但可读；figure 画布工具条对齐 |
| D3 token 一致 | **4** | navy CTA + accent 选中轨 + amber mock；ai-* EmptyState 仍自绘 dashed（S1 缝） |
| D4 内页 | **4→4.5 印象** | **深评加分点**：wb intake 步进+红灯、agent `sess-oa-1` Confirm、fto matrix、doc 纸面、figure edit — 壳/里差距未扩大；表内仍记 **4**（整数） |
| D5 反馈 | **4** | P2 关闭抬升边角 focus/disabled；主路径 focus-ring / btn-press 稳 |
| D6 文案噪音 | **4** | F8 关；样机黄条诚实；search `/families/:id` 侧栏 code 轻噪 |
| D7 跨壳 | **4** | 标签深链一致；轻壳差异在 DS-SHELL-03 |
| **S1** 风格统一 | **4** | 高频 Button 可追溯；ai-infra/ai-data/ops EmptyState 未迁 `.ui-empty` |
| **S3** UX 习惯 | **4** | HABIT-01/03/05/06 主路径过；诚实空与样机说明达标 |

*S2 木桶：本评点名抽查 Flow intake、Agent 会话、Pipeline/Docket（截图）、doc 修订 — 无子集掉到脚手架级；S2 印象 ~4。*

---

## 4. 分壳表 · 路由覆盖 / 发现

| 壳 | 端口 | 路由覆盖 | 发现 |
|----|------|----------|------|
| mid | 5173 | 7/7 要求 | OK · Dashboard「下一步」清晰；settings 未深挖 billing（按令可薄） |
| workbench | 5174 | 9/9（含 layout） | OK · intake 红灯闸门+步进合格；各 stage 壳级一致（SKU 空态诚实） |
| agent | 5175 | 5/5 + seed session | OK · `sess-oa-1` Confirm/原因条达标；icon aria 齐 |
| ops | 5176 | 6/6 | OK · 轻壳；EmptyState 自绘 → FS-P2-7 |
| iam | 5177 | 2/2 | OK · 诚实横幅 + login |
| doc-harness | 5178 | home=编辑器 | OK · 批注/修订/纸面 focus frame；无多路由 |
| ai-infra | 5179 | 8/8 | OK · gpus 空态 CTA 已补；EmptyState 表面未统一 |
| ai-data | 5181 | 8/8 | OK · datasets 禁用旁注中文；exports CTA 齐 |
| search | 5182 | 4/4（含 family） | OK · corpus 入库空态有 CTA；侧栏 `/families/:id` 轻噪 → FS-P2-8 |
| fto | 5183 | 6/6 五步 | OK · matrix 空填占位清晰；样机条诚实 |
| mining | 5184 | 5/5 | OK · 步进壳稳定 |
| inspire | 5185 | 4/4 | OK · 空态回输入台 CTA |
| landscape | 5186 | 6/6（含 node/org） | OK · 种子图深度可读 |
| figure | 5187 | 5 + generate 注 | OK · seed 资产编辑闭环；generate 需运行时 draft（DEEP-NOTE-1） |

---

## 5. 必改 · P0 / P1

| 级 | 本评 |
|----|------|
| **P0** | **无** |
| **P1** | **无**（不将样机诚实空、侧栏路由提示、ai-* EmptyState 表面差异、figure generate 无静态 id、环境债升格） |

→ 门禁：**Go**（承接 FULL_SKILLS + FS-P2 落地；深路由无新高严重回归）。

### 若升格需满足的验收（预留，本评不启用）

*无开放 P0/P1。* 示例格式（供后续）：`shell · route · pass condition`。

---

## 6. 后备 · P2（短 backlog）

| ID | 壳 / 路由 | 问题 | 过线示意 | vs 前评 |
|----|-----------|------|----------|---------|
| **FS-P2-7** | ai-infra / ai-data / ops EmptyState | 自绘 dashed 盒 ∥ 并行壳已迁 `.ui-empty`（FS-P2-6 范围外残留） | 迁 `.ui-empty*` | **新**（承接 p2 REPORT 未迁注） |
| **FS-P2-8** | search 侧栏 | 文案露出 `` `/families/:id` `` 路由模板（轻噪音，非 F8） | 改「从结果进入同族」或隐藏开发提示 | **新** |
| **FS-P2-9** | agent `AgentShell` 主区 | `outline-none` 无 `focus-visible` 替换（区域容器） | 同 mid skip-main 模式或去掉 | **新**（弱） |
| **FS-ENV-1** | mid `:5173` | 历史偶发 connection refused | 开发服稳定性 | **仍开（环境）** |

已关闭（勿重开）：**FS-P2-1…6**。

---

## 7. Skills 对照（深评）

| Skill | 本评 |
|-------|------|
| **apple-design** | 主 CTA press `0.96`；Confirm/闸门即时反馈；reduce-motion 守卫；会话内页动效克制 |
| **make-interfaces-feel-better** | 无 `transition: all`；同心/tabular 主路径在；EmptyState 表面缝仅剩 ai-*/ops |
| **web-design-guidelines** | Focus 主路径达标；icon-only aria 抽检通过；disabled 旁注与空态 CTA 改善已落盘 |

Guidelines 源：`https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`（2026-09-18）。

---

## 8. 证据索引（摘）

目录：`docs/ui-polish/full-skills-deep-evidence/` · **76 PNG** + `smoke.json` + `_shot.mjs`

| 代表 | 文件 |
|------|------|
| mid 首页 | `mid-5173-home.png` |
| wb intake | `workbench-5174-intake.png` |
| agent 会话 | `agent-5175-session-oa.png` |
| fto 矩阵 | `fto-5183-matrix.png` |
| search 语料 | `search-5182-corpus.png` |
| search 同族 | `search-5182-families-fam-battery-solid.png` |
| landscape 节点 | `landscape-5186-nodes-edrive.png` |
| figure 编辑 | `figure-5187-edit-fig-seed-exploded.png` |
| doc 编辑器 | `doc-harness-5178-home.png` |
| gpus 空态 CTA | `ai-infra-5179-gpus.png` |

完整清单见同目录 `smoke.json`（76 条 `ok: true`）。

---

## 9. 门禁结论

| 门 | 裁决 |
|----|------|
| P0 | **0** 开放 |
| P1 | **0** 开放 |
| 高严重 F1/F5/F8 大面积 | **否** |
| 七维均 ≥3 | **是**（最低 4） |
| 深路由覆盖 | **76** 截图 / 要求清单齐（generate 动态 id 已注） |
| **本评** | **Go** |

**未做**：未改任何产品代码；未启 Cloud Agent；未 git commit/push。证据与本 md 仅写入 `docs/ui-polish/`。

---

*只评不改；供总控归档。质感侧无新 P0/P1；P2 短债可择机消化。*
