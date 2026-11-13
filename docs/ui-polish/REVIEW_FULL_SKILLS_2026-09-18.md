# 全量 UI/UX 复评 · REVIEW_FULL_SKILLS_2026-09-18

| 项 | 值 |
|----|-----|
| **评审方** | UI评估助手（只评不改） |
| **HEAD** | `a4f8a12`（`dev`） |
| **日期** | 2026-09-18（Asia/Shanghai） |
| **范围** | mid `5173` · workbench `5174` · agent `5175` · ops `5176` · iam `5177` · doc-harness `5178` · ai-infra `5179` · ai-data `5181` · search `5182` · fto `5183` · mining `5184` · inspire `5185` · landscape `5186` · figure `5187` |
| **权威** | `DESIGN_SYSTEM.md` · `EVAL_RUBRIC.md` · `UI_SKILLS.md`（冻结三 skill） |
| **Skills** | `apple-design` · `make-interfaces-feel-better` · `web-design-guidelines` |
| **Guidelines** | https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md · **抓取日 2026-09-18** |
| **前债** | `REVIEW_P_WAVE.md`（Go · P0/P1=0）· `REVIEW_N1_RECHECK.md` · `REVIEW_parallel_shells_P1_RECHECK.md` — **不重开已关 P0/P1** |
| **方法** | 代码/`rg` 全量 forbid 抽检 + HTTP curl + Playwright 首页截图（14/14，mid 补拍） |
| **证据** | `docs/ui-polish/full-skills-evidence/` |
| **本评总评** | **Go**（**P0=0 · P1=0**；残余均为 P2 / 环境债） |

---

## 1. 环境与端口

| 端口 | 壳 | HTTP | 标题（curl） | 截图 |
|------|-----|------|--------------|------|
| 5173 | mid | **200**（补拍时） | IP Harness · 作业中台 | ✓（补拍 `mid-5173-home.png`） |
| 5174 | workbench | 200 | 办理工作台 | ✓ |
| 5175 | agent | 200 | 知产 Agent | ✓ |
| 5176 | ops | 200 | 运维面（样机） | ✓ |
| 5177 | iam | 200 | IAM | ✓ |
| 5178 | doc-harness | 200 | TipTap 批注样机… | ✓ |
| 5179 | ai-infra | 200 | AI Infra（样机） | ✓ |
| 5181 | ai-data | 200 | AI Data（样机） | ✓ |
| 5182 | search | 200 | 检索服务（样机） | ✓ |
| 5183 | fto | 200 | FTO（样机） | ✓ |
| 5184 | mining | 200 | 专利挖掘（样机） | ✓ |
| 5185 | inspire | 200 | 创新激发（样机） | ✓ |
| 5186 | landscape | 200 | 产业全景（样机） | ✓ |
| 5187 | figure | 200 | 附图（样机） | ✓ |

| 环境债 | 说明 |
|--------|------|
| **FS-ENV-1** | mid `:5173` 首轮 curl **200**，截图时 `ERR_CONNECTION_REFUSED`；**非产品 FAIL**（同 LS-ENV 记法） |
| **LS-ENV-1** | 历史 landscape Vite 504；**本评 `:5186` 稳定 200** |

相对 `REVIEW_P_WAVE`：本评首次对 **5178 / 5179 / 5181** 完成 HTTP + 首页截图。

---

## 2. Forbid / Habit 抽检矩阵

| 检查项 | 条款 | 结果 | 证据一句 |
|--------|------|------|----------|
| `outline-none` 无 focus 替换 | F5 · DS-FOCUS | **主路径 PASS**；弱残留 → P2 | mid/Layout skip-main 带 `focus-visible:ring-*`；agent composer / AgentHome textarea：**已挂 `.focus-ring`**（`:focus-visible` → accent）；ai-data `DatasetsPage` 草稿仍仅 `focus:border-slate-400`；doc-harness `.ProseMirror { outline: none }`（纸面） |
| chrome 可见 raw `localhost:51` | F8 · HABIT-06 | **PASS** | 并行/ai-* 顶栏可见「检索 / 挖掘 / 文档 / 训推面 / 运维面」；URL 仅 `href`/`title`；iam Dev 卡写「localhost 跨口」为诚实说明，**非** `:51xx` URL 倾倒 |
| EmptyState 无 CTA | HABIT-05 | **主路径 PASS**；诚实空 → P2 | 办理空态普遍带 `action`/`primary`；仅 `GpusPage`「无真实 GPU」、`ExportsPage`「无案正文」无 action（说明性） |
| disabled 无内联原因 | HABIT-03 · DS-DISABLED | **主路径 PASS** | `SessionConfirmBar` `.agent-confirm-reason` 仍在；ai-data 发布旁红字原因（文案见 FS-P2-1）；search 篮空送出有 warn Chip；过滤「应用并重跑」禁用无旁注 → P2 |
| `transition-all` / `transition: all` | F4 · DS-MOTION | **PASS（已关）** | 全仓 `rg` **0 命中**；`CorpusPage` 已为 `transition-[width]`（`fc8a2d2`） |
| violet mock chips | F1 | **PASS** | `tone="mock"` → amber/`#fffbeb`；无 `bg-violet`/`text-violet` 残留 |
| prefers-reduced-motion | DS-MOTION | **PASS** | `src/index.css` 有 reduce 关闭 transition/stagger/toast/menu；agent session / Dashboard 有 matchMedia 守卫 |
| 主 CTA `btn-press` | apple-design | **PASS** | 并行六壳 + ai-* `Button` 均 `ui-btn* btn-press focus-ring`；iam 主/次钮已补 `focus-ring`；`.ui-btn:active` / `.btn-press` → `scale(0.96)` |
| icon-only 缺 `aria-label` | web-guidelines | **基本 PASS** | 启发式几乎无真 icon-only 裸钮；带图文按钮含可见文案（如 Intake Go） |

### 相对 P_WAVE 已关闭的 P2

| 前 ID | 本评 |
|-------|------|
| P-P2-2 search `transition-all` | **关闭** |
| P-P2-3 iam 缺 `focus-ring` | **关闭** |
| P-P2-1 agent composer 弱 F5 | **降级/近关**（已挂 `.focus-ring`；仍冗余 Tailwind `outline-none`） |

---

## 3. 七维 + 附加分

| 维 | 分 | 一句 |
|----|----|------|
| D1 下一步 | **4** | mid/agent 首屏主行动清晰；并行壳步骤条 + 主检索/激发 CTA 可读 |
| D2 间距密度 | **4** | 4/8 与卡密度稳定；无新塌陷 |
| D3 token 一致 | **4** | navy CTA + accent focus + amber mock；并行 EmptyState 自绘 dashed 未统一 `.ui-empty` |
| D4 内页 | **4** | Confirm / wb / 并行步进未回退；未做全 Flow 木桶深扫 |
| D5 反馈 | **4** | 相对 P_WAVE **↑**：`transition-all` 清零、iam focus-ring、composer 有 focus-ring；边角草稿 focus 仍弱 |
| D6 文案噪音 | **4** | F8 关；AD「按钮 disabled」中英混仍在 |
| D7 跨壳 | **4** | 标签深链一致；轻壳差异在 DS-SHELL-03 允许项 |
| **S1** 风格统一 | **4** | 高频 Button 可追溯；EmptyState 双实现（`.ui-empty` vs dashed 盒） |
| **S3** UX 习惯 | **4** | HABIT-01/03/05/06 主路径过；诚实空无钮与过滤禁用旁注为边角 |

*S2 木桶：本评未单列深 Flow 全扫；承接前波 Confirm/节点已过，不另降 D4。*

---

## 4. 分壳一行状态

| 壳 | 端口 | 状态 |
|----|------|------|
| mid | 5173 | **OK** · 首页截图已补；间歇 down 记 FS-ENV-1 · 无新 P0/P1 |
| workbench | 5174 | **OK** · 壳+步进类稳定 |
| agent | 5175 | **OK** · 首页/Confirm 主路径达标 |
| ops | 5176 | **OK** · 侧栏 focus-ring；EmptyState 可带 action |
| iam | 5177 | **OK** · 诚实横幅 + Dev 工具；主钮 focus-ring 已齐 |
| doc-harness | 5178 | **OK（首轮全烟测）** · 纸面 outline:none → P2 |
| ai-infra | 5179 | **OK（首轮全烟测）** · Loadtest/Empty CTA 前债仍关；Gpus 诚实空 → P2 |
| ai-data | 5181 | **OK（首轮全烟测）** · 发布禁用有原因；文案混 + 草稿 focus → P2 |
| search | 5182 | **OK** · mock chip amber；过滤重跑禁用旁注弱 → P2 |
| fto | 5183 | **OK** · 空篮/矩阵空态有 CTA |
| mining | 5184 | **OK** · 顶栏标签深链 |
| inspire | 5185 | **OK** · Prompt `ui-input`（IN-P0-1 仍关） |
| landscape | 5186 | **OK** · 本评无 504 |
| figure | 5187 | **OK** · 资产空态有回列表 |

---

## 5. 必改 · P0 / P1

| 级 | 本评 |
|----|------|
| **P0** | **无** |
| **P1** | **无**（不将诚实空态 / 文案混 / 纸面 outline / 环境宕机升格） |

→ 门禁：**Go**（承接 N1 / parallel-shells-p1 / P_WAVE 已关项；本评无回归）。

---

## 6. 后备摘录 · P2（非必改）

| ID | 壳 / 路由 | 问题 | 过线示意 |
|----|-----------|------|----------|
| **FS-P2-1** | ai-data `5181/datasets` | 旁注「…· 按钮 disabled」中英混；草稿 textarea 弱 focus（无 soft ring） | 改「按钮已禁用」；`ui-input` / accent soft ring |
| **FS-P2-2** | ai-infra `/gpus` · ai-data exports 次空态 | 诚实 EmptyState 无 `action` | 可选「回总览」链 |
| **FS-P2-3** | doc-harness 纸面 | `.ProseMirror { outline: none }` 无可见焦点替代 | 纸面/焦点框可见（非裸剥） |
| **FS-P2-4** | agent composer / 首页 textarea | 已有 `.focus-ring`，仍叠 Tailwind `outline-none` | 去掉冗余 utility，依赖 `.focus-ring` |
| **FS-P2-5** | search `/` 过滤区 | 「应用过滤并重跑」`disabled={!lastQuery\|\|running}` 无旁注 | 旁注「请先检索」或等价 |
| **FS-P2-6** | 并行壳 EmptyState | 自绘 dashed 盒 ∥ 中台 `.ui-empty` | 逐步迁 token 类（S1） |
| **FS-ENV-1** | mid `:5173` | 初评截图时曾 connection refused；定稿前已重启并补拍 | 开发服偶发宕机（环境） |

---

## 7. Skills 对照

| Skill | 本评 |
|-------|------|
| **apple-design** | 主 CTA `btn-press` / `.ui-btn:active` → `scale(0.96)` 普遍；动效可打断（CSS transition）；reduce-motion 有全局守卫 |
| **make-interfaces-feel-better** | 禁 `transition: all` **清零**；同心圆角/tabular 主路径仍在；并行 EmptyState 表面未完全统一 |
| **web-design-guidelines** | Focus：主路径 focus-visible / `.focus-ring`；禁裸 outline 大面积未复发；icon-only aria 基本干净；Animation：`transition-all` 已关 |

Guidelines 源：`https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`（2026-09-18）。

---

## 8. 门禁结论

| 门 | 裁决 |
|----|------|
| P0 | **0** 开放 |
| P1 | **0** 开放 |
| 高严重 F1/F5/F8 大面积 | **否** |
| 七维均 ≥3 | **是**（最低 D 维 4） |
| **本评** | **Go** |

**未做**：未改任何产品代码；未启 Cloud Agent。mid 证据已补拍。

---

*只评不改；供总控归档。质感侧本评无 P0/P1 必改项，P2 可择机消化。*
