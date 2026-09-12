# 短评 · REVIEW_doc-harness

| 项 | 值 |
|----|-----|
| **评审方** | UI评估助手（只评不改） |
| **对象** | `apps/doc-harness` · http://127.0.0.1:5178/ |
| **HEAD** | `3890b92` |
| **对照** | `DESIGN_SYSTEM.md` · `EVAL_RUBRIC.md` · DS-UX-HABIT |
| **证据** | `docs/ui-polish/doc-harness/` |
| **日期** | 2026-09-13 |
| **总评** | **No-Go**（初评）→ 复评 **Go**（见文末 RECHECK · `f57d80a`） |
| **综合** | ~3 / 5（壳可读，关键闸与状态诚实未过） |

---

## 抽检覆盖

| 场景 | 结果 | 证据 |
|------|------|------|
| CaseSwitcher 三案（撰写稿 / OA 答复 / 发明人交底） | 顶栏+左树均可切换；三案种子齐 | `01` · `03` · `04` |
| 批注侧栏（列表 / 空态） | 种子卡完整；空态有引导文案 | `01` · `04` · `05` |
| Agent Diff + Confirm | 正式建议后有前后对照 + HITL ConfirmBar | `02` |
| SKU locked 空态（附图说明） | 有锁图标 + 「未授权/只读」+ lockReason；**纸面正文未切章** | `04` |

---

## 七维（本壳短评）

| # | 维度 | 分 | 证据一句 | DS |
|---|------|----|----------|-----|
| D1 | 信息层级 / 下一步 | **3** | 三栏清晰；右栏批注/Agent 分 Tab；首屏缺单一「下一步」单元 | DS-SCAN-01 · HABIT-01 |
| D2 | 间距 / 密度 / 对齐 | **3** | 纸面留白好；Agent Diff 双列挤、右栏需滚才能同看 Diff+Confirm | DS-SPACE-01 |
| D3 | 视觉一致性 | **4** | slate 主 CTA、无 violet；用 `app-shell-bg` / focus-ring；侧栏字号偏 10–11px | DS-COLOR · DS-FORBID-01 |
| D4 | 深内页质感 | **3** | 批注卡/Confirm 可用；锁章纸面不同步拉低 | DS-COMP-* · DS-HONESTY |
| D5 | 交互反馈 | **2** | 锁章正文错位；dirty 与「已自动保存」并存；部分禁用仅 opacity | DS-DISABLED-01 · HABIT-03 |
| D6 | 空错态 / 诚实 mock | **3** | TopBar 诚实横幅好；空态「去选中正文」、开通 CTA 无动作 | DS-HONESTY-01 · HABIT-05 |
| D7 | 跨壳一致（本壳相对 mid/agent） | **3** | 语言接近 slate/surface；未接 AppSurfaceLinks；双 CaseSwitcher 冗余 | DS-SHELL |

### 附加分

| 分项 | 分 | 说明 |
|------|----|------|
| **S1** 风格统一 | **3** | 本壳内大致统一；10px 墙字与主仓 footnote 阶梯略缝 |
| **S2** 深内页 | **2** | 锁章纸面未同步 = 深页未过；批注/Confirm 子集尚可 |
| **S3** UX 习惯 | **2** | HABIT-03/05 弱：Agent 禁用无内联理由；空态/开通假 CTA |

---

## P0

| ID | 问题 | 规范 | 验收标准 | URL / 证据 |
|----|------|------|----------|------------|
| **DH-P0-1** | 选中锁章「附图说明」后，标题/树为附图，**纸面仍显示上一章「技术交底书」正文与批注高亮** | DS-HONESTY-01 · D5 | 切到 `附图说明` 后纸面正文 = 该章 `body`（图说种子）；不可残留交底书 | `http://127.0.0.1:5178/` → 发明人交底 → 附图说明 · `04-sku-locked-figures.png` |
| **DH-P0-2** | 顶栏可出现绿色「已自动保存」与主钮「保存草稿 · dirty」**同屏矛盾** | DS-HONESTY-01 · HABIT-03 | dirty=false 时不得显示 dirty CTA；自动保存提示与 dirty 互斥或文案区分「他章已保存」 | `04`（及 OA/交底切换后） |

---

## P1

| ID | 问题 | 规范 | 验收 | 证据 |
|----|------|------|------|------|
| **DH-P1-1** | Agent「试运行/正式建议」在锁章/未授权时仅 `disabled`+透明度，**无内联禁用理由** | DS-DISABLED-01 · HABIT-03 | 禁用旁可见原因（复用 gateReason / 正式待确认说明） | Agent tab @ 附图说明 |
| **DH-P1-2** | 批注空态「去选中正文」按钮无动作 | HABIT-05 | 改为纯文案引导，或 focus 到纸面并 toast「请先选中文字」 | `04` |
| **DH-P1-3** | 「申请开通（示意）」主钮外观像可开通 | DS-HONESTY-01 · HABIT-05 | 降为 secondary/ghost，或点击后诚实 toast「样机无真 SKU」 | `04` |

---

## P2

| ID | 问题 | 备注 |
|----|------|------|
| DH-P2-1 | Agent Diff 双列过挤、建议稿贴边 | `02` |
| DH-P2-2 | 顶栏 + 左树双 CaseSwitcher 冗余 | 可保留一处 compact |
| DH-P2-3 | SKU banner 次行对比偏弱 | 浅灰 vs 浅底 |
| DH-P2-4 | Diff+Confirm+预览同屏需滚动 | 密度/折叠 |

---

## 门禁裁决

| 门 | 裁决 |
|----|------|
| P0 | **未过**（DH-P0-1 / DH-P0-2） |
| 七维 | D5=2 → 触 No-Go 门槛 |
| **总评** | **No-Go** |

**建议质感优先**：先修纸面随章 `setContent`（`ChapterEditor` 仅 `key={caseId}`，章切换依赖 effect，锁章路径易残留）→ 再收敛 dirty/自动保存提示 → 再补 Agent 禁用理由与假 CTA。

**未做**：未改代码；未改 contracts/HITL/Persona/STEPS 语义。

---

*证据目录 `docs/ui-polish/doc-harness/`；短评范围仅 doc-harness。*

---

## 短复评 · RECHECK（`f57d80a`）

| 项 | 值 |
|----|-----|
| **复评 HEAD** | `f57d80a` |
| **相对** | No-Go 基线 `3890b92` / 报告 `be3e065` |
| **证据** | `docs/ui-polish/doc-harness-recheck/` |
| **日期** | 2026-09-13 |
| **本单总评** | **Go**（DH-P0 关闭；P1 扫过） |

### 验收表

| ID | 裁决 | 证据一句 |
|----|------|----------|
| **DH-P0-1** 锁章纸面同步 | **PASS** | 发明人交底→附图说明：树/标题/纸面均为附图（图1–3），非交底书 · `p0-1-figures-paper-sync.png` |
| **DH-P0-2** dirty / 自动保存互斥 | **PASS** | 切章 autosave 后目标章非 dirty；`TopBar` `showSavedHint = hint && !dirty`，未复现绿提示与「保存草稿 · dirty」同屏 · `p0-2-dirty-autosave.png` |
| **DH-P1-1** Agent 禁用理由 | **PASS** | 锁章 Agent 钮禁用 + 内联 SKU lockReason · `p1-agent-disabled-reason.png` |
| **DH-P1-2** 空态假 CTA | **PASS** | 「去选中正文」已移除，仅文案引导 · `p1-empty-sku-cta.png` |
| **DH-P1-3** 开通 CTA 诚实 | **PASS** | ghost/描边钮；点击 toast「样机无真 SKU 开通」 · `p1-empty-sku-cta.png` |

### 残余（不挡本单 Go）

| 级 | 项 |
|----|-----|
| P2 | 实机未稳定捕获顶栏文案「上一章已自动保存」（逻辑已互斥；正向提示可再抽检） |
| P2 | 原评 Diff 挤 / 双 CaseSwitcher 等仍后备 |

### 门禁

| 门 | 裁决 |
|----|------|
| DH-P0-1/2 | **关闭** |
| DH-P1-1/2/3 | **PASS** |
| **复评总评** | **Go** |

*只评不改。*
