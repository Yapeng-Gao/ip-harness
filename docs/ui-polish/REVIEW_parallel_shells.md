# 并行样机 UI 评估 · REVIEW_parallel_shells

| 项 | 值 |
|----|-----|
| **评审方** | UI评估助手（只评不改） |
| **对照** | `DESIGN_SYSTEM.md` · `EVAL_RUBRIC.md` · DS-UX-HABIT |
| **仓 HEAD** | `ad40adf`（含三壳） |
| **证据** | `docs/ui-polish/parallel-shells/` |
| **日期** | 2026-09-13 |
| **总评（三壳）** | **Conditional Go**（无 P0；ai-infra / ai-data 带 P1 抛光债；doc-harness 本范围 **Go**） |

| 壳 | 端口 | 基线 commit | 本壳总评 |
|----|------|-------------|----------|
| `apps/doc-harness` | 5178 | `1ba4a6c` | **Go** |
| `apps/ai-infra` | 5179 | `55fe474` | **Conditional Go** |
| `apps/ai-data` | 5181 | `ad40adf` | **Conditional Go** |

---

## 1) doc-harness · :5178 · `1ba4a6c`

**证据**：`doc-harness-home.png` · 前序 `REVIEW_doc-harness_RECHECK.md`（P0 Go）· `1ba4a6c` 冒烟无 FAIL

### 七维

| # | 维 | 分 | 一句 |
|---|----|----|------|
| D1 | 层级/下一步 | **4** | 三栏清晰；批注/Agent Tab + Revision 时间线可发现 |
| D2 | 间距密度 | **4** | 纸面留白好；右栏仍偏密（Diff 默折叠已缓） |
| D3 | 视觉一致 | **4** | slate CTA、无 violet；与主仓 token 语言接近 |
| D4 | 深内页 | **4** | 批注/Confirm/时间线/提案史可演示 |
| D5 | 交互反馈 | **4** | 锁章闸+理由；加批注禁用 title 有因；P0 纸面同步已关 |
| D6 | 空错/诚实 | **4** | 顶栏 mock 诚实；SKU ghost CTA + toast |
| D7 | 跨壳 | **3** | 产品形态异于 ops 壳；未接 AppSurfaceLinks |

**S1/S2/S3**：4 / 4 / 4

### P0 / P1（本壳）

| 级 | ID | 问题 | 规范 | 验收 |
|----|-----|------|------|------|
| — | — | **无未关 P0**（见 RECHECK） | — | — |
| P1 | — | 无阻塞本单 P1 | — | — |
| P2 | DH-P2-* | Diff 挤 / 自动保存正向文案偶发未显 等 | 后备 | 择机 |

**门禁**：**Go**

---

## 2) ai-infra · :5179 · `55fe474`

**证据**：`ai-infra-overview.png` · `ai-infra-jobs.png` · `ai-infra-pipelines.png`

### 七维

| # | 维 | 分 | 一句 |
|---|----|----|------|
| D1 | 层级/下一步 | **4** | 总览 KPI + 快捷入口；作业创建表单主路径清楚 |
| D2 | 间距密度 | **4** | 4/8 卡片网格整齐；侧栏 `shell-aside` |
| D3 | 视觉一致 | **4** | `app-shell-bg` / slate 主钮 / StatusPill；无 violet |
| D4 | 深内页 | **4** | Jobs/门禁 Pass·Fail/金丝雀等可点闭环 |
| D5 | 交互反馈 | **3** | Confirm 对话框诚实；部分 Button 缺 `focus-ring`；Loadtest 无端点时仅 opacity |
| D6 | 空错/诚实 | **4** | 顶条+总览诚实卡强；空态文案指路（尚无跑次 CTA 文案） |
| D7 | 跨壳 | **3** | 与 ai-data 壳同源；顶栏 raw `localhost:5176` 深链噪音 |

**S1/S2/S3**：4 / 4 / 3

### P0 / P1

| 级 | ID | 问题 | 规范 | 验收 | URL |
|----|-----|------|------|------|-----|
| P0 | — | **无** | — | — | — |
| P1 | AI-P1-1 | Loadtest「开始」在 `endpoints.length===0` 时仅 `disabled:opacity`，无内联理由 | DS-DISABLED-01 · HABIT-03 | 旁注「请先部署端点」或链到 `/endpoints` | `/loadtest` |
| P1 | AI-P1-2 | 共享 `EmptyState` 无动作控件（仅 title/body）；Models/Endpoints 空态靠用户扫上方表单 | HABIT-05 | 空态加次级 CTA（如「去注册模型」）或确认上方主 CTA 足够近 | `/models` · `/endpoints` |
| P1 | AI-P1-3 | 大量原生/`btn-press` 按钮未统一 `focus-ring` / `ui-btn*` | DS-COMP · D5 | 主路径可键盘见 focus | 全壳 |
| P2 | AI-P2-1 | 顶栏/告警露出完整 `http://localhost:5176` | 旧 Deep P2 同类 | 文案「运维面」+ 相对深链或隐藏绝对 URL | shell / `/alerts` |
| P2 | AI-P2-2 | 作业表单技术键名偏墙（localStorage 键全名） | DS-SCAN | 默认折叠「高级/契约」 | `/jobs` |

**业务→UX 备注**：跨端口数据集以**种子契约**诚实标明「种子 · 非跨壳」——逻辑正确，不记缺陷；禁止文案谎称已跨 5179/5181 同步（当前未谎）。

**门禁**：**Conditional Go**

---

## 3) ai-data · :5181 · `ad40adf`

**证据**：`ai-data-overview.png` · `ai-data-pipelines.png` · `ai-data-datasets.png`

### 七维

| # | 维 | 分 | 一句 |
|---|----|----|------|
| D1 | 层级/下一步 | **4** | 总览快捷入口；流水线 Run / 质量门路径清楚 |
| D2 | 间距密度 | **4** | 与 ai-infra 同壳骨架，密度舒服 |
| D3 | 视觉一致 | **4** | 共享 ui 组件；slate / StatusPill；无 violet |
| D4 | 深内页 | **4** | Sources→Pipeline→Quality→Publish 可点 |
| D5 | 交互反馈 | **4** | **发布 disabled + 红字内联理由**（质量门 idle）示范好 |
| D6 | 空错/诚实 | **4** | 样机条+诚实卡；质量「非真引擎」 |
| D7 | 跨壳 | **3** | 与 ai-infra 强一致；双 raw localhost 深链 |

**S1/S2/S3**：4 / 4 / 4（禁用理由抬高 S3）

### P0 / P1

| 级 | ID | 问题 | 规范 | 验收 | URL |
|----|-----|------|------|------|-----|
| P0 | — | **无** | — | — | — |
| P1 | AD-P1-1 | 同 AI-P1-2：`EmptyState` 无动作钮（Exports/Sources 等） | HABIT-05 | 空态带跳转或主 CTA | `/exports` · `/sources` |
| P1 | AD-P1-2 | 同 AI-P1-3：focus-ring / ui-btn 未全覆盖 | DS-COMP · D5 | 主路径 focus 可见 | 全壳 |
| P2 | AD-P2-1 | 顶栏 raw `localhost:5179` / `5176` | — | 标签化深链 | shell |
| P2 | AD-P2-2 | 文案「按钮 disabled」中英混排 | 文案 | 改为「按钮已禁用」 | `/datasets` |

**业务→UX 备注**：质量门未 pass 禁止 publish —— 闸门与 UI 禁用理由对齐，**正向范例**。LS 仅同 origin —— 诚实卡已写清。

**门禁**：**Conditional Go**

---

## 跨壳对照

| 项 | 结论 |
|----|------|
| ai-infra ↔ ai-data | **跨壳一致**（壳骨架、诚实条、Card/Pill、侧栏选中）→ S1 加分 |
| doc-harness ↔ 上两者 | **产品形态不同**（文档纸面 vs 运维台）；视觉同属 slate，非 F1 |
| 共同 P2 | raw localhost 深链 |
| 共同 P1 | EmptyState 动作化、focus 统一（ai-*） |

---

## 门禁总表

| 壳 | P0 | 七维最低 | 总评 |
|----|----|----------|------|
| doc-harness | 无 | 3（D7） | **Go** |
| ai-infra | 无 | 3（D5/D7） | **Conditional Go** |
| ai-data | 无 | 3（D7） | **Conditional Go** |
| **三壳合计** | 无 | — | **Conditional Go** |

**建议质感**：优先 AI-P1-1（Loadtest 禁用理由）+ 统一 `focus-ring`/`EmptyState` CTA；localhost 文案降噪为 P2。doc-harness 本线可维持 Go，P2 择机。

**未做**：未改产品代码；未改 contracts/HITL/Persona/STEPS。

---

*证据：`docs/ui-polish/parallel-shells/*.png`*

---

## 短复评附注 · P1 RECHECK（`458bca9`）

见 [`REVIEW_parallel_shells_P1_RECHECK.md`](./REVIEW_parallel_shells_P1_RECHECK.md)。  
**结论**：AI-P1-1/2/3 · AD-P1-1/2 全 **PASS** → 三壳合计升 **Go**。
