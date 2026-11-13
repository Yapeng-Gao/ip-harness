# P 波 UI/UX 抽检 · REVIEW_P_WAVE

| 项 | 值 |
|----|-----|
| **评审方** | UI评估助手（只评不改） |
| **HEAD** | `7582d9c`（定稿推送）；抽检基准 `60538f0`；产品树相对 `0ded9a4` **无** `apps/`/`src/`/`packages/` 变更（其间仅 docs） |
| **分支** | `dev` |
| **日期** | 2026-09-18（Asia/Shanghai） |
| **范围** | **五壳** mid `5173` · workbench `5174` · agent `5175` · ops `5176` · iam `5177` + **并行壳** search `5182` · fto `5183` · mining `5184` · inspire `5185` · landscape `5186` · figure `5187`；附 ai-infra `5179` / ai-data `5181` / doc-harness `5178`（代码抽检；后三端口本环境未起） |
| **权威** | `DESIGN_SYSTEM.md` · `EVAL_RUBRIC.md` · `UI_SKILLS.md`（冻结：apple-design + make-interfaces-feel-better + web-design-guidelines） |
| **Guidelines** | https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md · **抓取日 2026-09-18** |
| **前债** | `REVIEW_N1_RECHECK`（N1 Go）· `REVIEW_N1_2026-09-18` P2 · `REVIEW_parallel_shells_P1_RECHECK` · `REVIEW_CONTINUE_OPT_RECHECK` / `REVIEW_UI_OPT_NEXT_RECHECK` 残余已关或降级 |
| **方法** | 代码/`rg` 为主；五壳+并行 Vite **HTTP 200**（标题 curl）；**未**跑 Playwright 深交互；ai-infra / ai-data / doc-harness 端口未响应 |
| **本波总评** | **Go**（**P0=0 · P1=0**；残余均为 P2，不挡本波质感） |

---

## 1. 环境与端口

| 端口 | 壳 | 本环境 |
|------|-----|--------|
| 5173–5177 | 五壳 | **200**（标题可达） |
| 5182–5187 | 并行六壳 | **200** |
| 5178 / 5179 / 5181 | doc-harness / ai-infra / ai-data | **未起**（仅代码证据） |
| LS-ENV-1 | landscape Vite 504 | 本抽检 `:5186` 已 200；仍记为**间歇环境债**（非产品 FAIL） |

---

## 2. 抽检矩阵（habit / forbid）

| 检查项 | 条款 | 结果 | 证据一句 |
|--------|------|------|----------|
| `outline-none` 无 focus-visible / ui-input / focus-ring | F5 · DS-FOCUS | **弱残留 → P2** | agent `SessionComposer.tsx` / `AgentHome.tsx` textarea：`outline-none`，父级 `focus-within` 变边（非 accent `focus-visible`）；mid `MidLayout` skip-main 带 `focus-visible:ring-*`（合规）；ai-data `DatasetsPage` 草稿区仅 `focus:border-slate-400` |
| chrome 可见 raw `localhost:51` | F8 · HABIT-06 | **PASS** | 并行壳顶栏可见文案「检索 / 挖掘 / 文档 / 工作台」等；URL 仅 `href`/`title`（如 `InspireShell` / `MiningShell` / `FtoShell`）；ai-* 顶栏「训推面 / 运维面」同模式 |
| EmptyState 无 CTA | HABIT-05 | **主路径 PASS**；边缘诚实空态 → P2 | N1 已关项仍在；仅 `GpusPage`「无真实 GPU」、`ExportsPage`「无案正文」无 `action=`（说明性诚实空，非办理死胡同） |
| disabled 无内联原因 | HABIT-03 · DS-DISABLED | **主路径 PASS** | `SessionConfirmBar` 仍有 `.agent-confirm-reason`；ai-data 发布钮旁有红字原因（文案见 AD-P2-2） |
| `transition-all` | DS-MOTION · web guidelines | **P2** | `apps/search/src/pages/CorpusPage.tsx` 进度条；根 `src/pages/DataStrategy.tsx` 同类 |
| violet mock chips | F1 · N1-X-1 | **PASS** | 并行壳 `Chip tone="mock"` → amber/`#fffbeb`；`rg` 无 `bg-violet`/`text-violet` 残留 |
| inspire Prompt focus | 前 IN-P0-1 | **仍 PASS** | `PromptPage.tsx` → `ui-input` |
| iam 主钮 `focus-ring` | 前 IAM-P2-1 | **P2** | `IamHome` / `IamLoginPage`：`ui-btn*` + `btn-press`，**未**加 `focus-ring`；`.ui-btn` 本身不剥 outline（原生焦点可能在），缺 DS accent ring |
| AD-P2-2 文案 | 前 parallel P2 | **仍开 · P2** | `DatasetsPage.tsx`：「质量门未 pass…· **按钮 disabled**」中英混 |

---

## 3. 七维 + 附加（简评）

| 维 | 分 | 一句 |
|----|----|------|
| D1 下一步 | **4** | mid 优先办理语言仍在；并行壳步骤条可读 |
| D2 间距密度 | **4** | 无新塌陷抽到 |
| D3 token 一致 | **4** | mock chip / navy CTA 主路径齐；零星自绘 empty 容器未统一 `.ui-empty` |
| D4 内页 | **4** | agent Confirm / wb 类未回退；未做深 Flow 全扫 |
| D5 反馈 | **3** | 主路径 focus/禁用可读；agent composer 弱 F5、iam 缺 `focus-ring` 拉低 |
| D6 文案噪音 | **4** | F8 关闭；AD-P2-2 边角噪音 |
| D7 跨壳 | **4** | 标签深链一致；轻壳差异在允许项内 |
| **S1** 风格统一 | **3** | 并行壳 EmptyState 自绘 dashed 盒并存 |
| **S3** UX 习惯 | **4** | HABIT-01/03/06 主路径过；05 边缘诚实空无钮；02/04 未本波深验 |

*未单列 S2 木桶深扫（本波为残余/习惯 spot-check）。*

---

## 4. P0 / P1

| 级 | 本波 |
|----|------|
| **P0** | **无**（无一具备「路由 + 明确过线标准」且达误导/不可读门槛的新债） |
| **P1** | **无**（不升格弱 F5 / 文案混 / `transition-all` 为 P1） |

→ 门禁：**Go**（相对本波范围；承接 N1 / parallel-shells-p1 已关 P0/P1）。

---

## 5. 后备摘录 · P2（非本波质感必改）

| ID | 壳/路由 | 问题 | 过线示意（若升档） |
|----|---------|------|-------------------|
| **P-P2-1** | agent `5175` 会话 composer / 首页 composer | `outline-none` 无 `focus-visible` / `ui-input` soft ring（父 `focus-within` 仅变边） | Tab 至 textarea：accent soft ring 或 `.focus-ring`；去掉裸 `outline-none` |
| **P-P2-2** | search `5182/corpus`（+ 根 DataStrategy） | 进度条 `transition-all` | 枚举 `transition-[width]` 或等价 |
| **P-P2-3** | iam `5177` 主/次钮 | 缺 `.focus-ring`（DS accent） | `ui-btn* focus-ring`；Tab 见 2px accent |
| **P-P2-4** | ai-data `5181/datasets` | 旁注「按钮 disabled」中英混；草稿 textarea 弱 focus | 中文「按钮已禁用」；改 `ui-input` |
| **P-P2-5** | ai-infra `/gpus` · ai-data exports 次空态 | 诚实 EmptyState 无 `action` | 可选「回总览」链（非硬性） |
| **P-P2-6** | doc-harness 纸面 `.ProseMirror { outline: none }` | 编辑器去 outline（端口未起未烟测） | 纸面/焦点框可见替代 |
| **LS-ENV-1** | landscape 开发服 | 历史 Vite 504；本环境已 200 | 清 deps / 重启 `dev:landscape`（环境） |

---

## 6. Skills 对照（一句）

| Skill | 本波 |
|-------|------|
| apple-design | `btn-press` 仍普遍；composer 焦点弱削弱「按压可感知」链 |
| make-interfaces-feel-better | 禁 `transition: all` → search corpus 仍中招 |
| web-design-guidelines | Focus：禁 `outline-none` 无替换 → agent composer；Animation：同 `transition-all` |

---

## 7. 门禁结论

| 门 | 裁决 |
|----|------|
| P0 | 无开放项 |
| P1 | 无开放项 |
| 高严重 F1/F5/F8 大面积 | **否**（F5 为局部弱残留） |
| **本波** | **Go** |

**未做**：未改任何产品代码；未 git commit/push；未启 Cloud Agent；ai-infra/ai-data/doc-harness 无浏览器烟测。

---

*只评不改；供总控派 UI质感（本波无 P0/P1 必改项）。*
