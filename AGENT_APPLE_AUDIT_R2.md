# Agent 平台 · Apple Design 复扫（R2）

日期：2026-09-11。范围：仅 `/workspace/ip-harness` 内 Agent 平台（`AgentShell`、`AgentHome`、`Catalog`、`SessionWorkspace` + `session/*`、`SessionsList`、`Skills`、`HarnessOverview`、顶栏 `ProductSwitcher`/`WorkspaceMenu`、相关 CSS）。对照上一轮 `AGENT_APPLE_AUDIT.md` 14 条落地后复扫；**只读核验，本文件为唯一写入产物**。

透镜：按压/响应、字号层级、材质深度、空间一致、克制、寻路、同心圆角、reduced-motion、熟悉感、用户掌控、终端用户零行话。

---

## 总评打分（布局/反馈/克制/习惯）+ 对比上一轮 ~6.5

| 维度 | R1 | R2 | 一句话 |
|------|-----|-----|--------|
| **布局 / UI** | 6.4 | **7.5** | 侧栏瘦身、会话顶栏收束、soft-card 对齐后骨架可读；确认态仍与底部「开始办理」双主 CTA，侧栏「更多筛选」常驻占高。 |
| **动效反馈** | 7.2 | **7.8** | `btn-press` + 广覆 `focus-ring` + toast ~4s 自动收扎实；下拉菜单项与 Home 主输入仍有焦点缺口。 |
| **克制** | 5.8 | **7.1** | 导航/徽章/Prompt·RACI 标签已白话；交接态英文枚举、Sessions「Agent」列、Go/No-Go 文案泄漏、详情内工具 id 仍露。 |
| **习惯 / 熟悉感** | 6.6 | **7.5** | 顶栏只读 + Composer 单一换人；目录卡三行+主 CTA；非会话页顶栏仍显示「自动匹配」易误解。 |

**综合 ≈ 7.5/10**（上一轮 ~**6.5**）— 14 条主干落地，从「演示壳收敛中」进入「可抛光产品壳」；尚未到 Apple 级「确认态一主任务、零英文枚举、首屏零工程师泄漏」。

**相对 R1 的净变化**：agency 双路径与顶栏多主 CTA 已消；字号地板与 soft-card 大体到位；残留集中在 **确认态 CTA 同构**、**中英枚举直出**、**内容种子行话**、**侧栏/菜单抛光**。

---

## 上轮14条验收（✅/⚠️/❌ 各一行）

1. **P0-1 顶栏换人统一确认** — ✅ 顶栏改为只读展示（`自动匹配 · {名}` / 专家名），`title="在会话底部更换办理人"`；编辑仅 `SessionComposer` → `requestAgentSwitch`，不再静默 `clearedHitlGates: []`。
2. **P0-2 会话页单一主 CTA** — ⚠️ 顶栏「预览/办理」已进 ⋯，`hitlActive` 时顶栏办理相关隐藏；但确认态下 Composer 仍实心 indigo「开始办理」，与「请你确认」条竞争主任务（P0-2 好坏标准未完全满足）。
3. **P0-3 侧栏筛选瘦身** — ✅ 默认「全部 | 待你确认」；进行中/已完成进「更多筛选」；归档进 ⋯；按办理人默认折叠；会话标题 `text-sm` + 选中左边框 token。
4. **P0-4 字号 ≥ text-xs** — ✅ 作用域内无 `text-[10px]|[11px]`；Timeline 工具 JSON 默认折叠「查看调用详情」。
5. **P1-5 用户面去行话** — ⚠️ 导航「目录/能力」、无 Harness 徽章、Catalog「擅长/谁负责/可用/试用」、`go_nogo`→「立项决定」已落地；仍有 Sessions 表头「Agent」、PageHeader「Agent 运行」、`systemPromptBrief`/种子 goal/step 含「Go/No-Go」、Catalog 详情 `code` 工具 id。
6. **P1-6 顶栏横幅优先级** — ✅ 状态横幅队列 `failed > no_case > route` 同时最多 1 条；闲时确认 chip 不在顶栏；toast ~4s；换人理由芯片在有状态横幅时抑制。
7. **P1-7 focus-ring 补全** — ⚠️ 确认条/Composer/顶栏操作/侧栏状态筛/预览菜单按钮已补；侧栏溢出/归档/行菜单的 menu item、Home 主 textarea（`outline-none` 且父级无 `focus-within` 环）仍弱。
8. **P1-8 soft-card / radius token** — ✅ Catalog/Skills/Home/Timeline/Harness 插件卡多用 `soft-card`；选中会话左边框；one-off `shadow-[0_1px_…]` 已清。残留：Timeline `soft-card border` 易双边框；Composer 仍手写 `rounded-2xl` + `shadow-[var(--shadow-rest)]`。
9. **P1-9 Timeline/Context 非调试默认** — ⚠️ 步骤人话标签、工具详情折叠、审计「办理记录」、actor 中文映射已落地；`SessionConfirmBar` / `SessionContextPanel` 仍直出英文 `handoffStatus`（如 `authorized_to_file`），未用已有 `HANDOFF_LABELS`；期限 `d.status`（`due_soon` 等）未映射。
10. **P2-10 单一 Agent 选择器** — ✅ 顶栏只读；Composer 唯一编辑点；副标题 `agentDisplayLabel` 无 `→`。
11. **P2-11 Catalog 卡收敛** — ✅ 名 + 一行 +「启动会话」主 CTA；能力/擅长/谁负责进 `<details>`。
12. **P2-12 Home 推荐裁剪** — ✅ 固定 4 个推荐 +「全部目录」；洞察折叠且无命令 id。
13. **P2-13 Skills label 优先** — ✅ 标题 `t.label`，技术名次要 mono；「写入中台：{中文}」。
14. **P2-14 材质统一** — ✅ 壳/主列 `bg-surface-50`；侧栏实白；无 `bg-white/80 backdrop-blur` 与主列混用。

**汇总**：✅ 9 · ⚠️ 5 · ❌ 0。无整项回退；⚠️ 均为「落地未闭环」而非回归。

---

## 本轮仍需优化 P0/P1/P2（问题、页面、好坏、改法）

### P0

#### 1. 确认态底部「开始办理」仍与确认条抢主任务
- **问题**：`hitlActive` 时顶栏办理已隐藏，但 `SessionComposer` 始终渲染实心 indigo「开始办理」（`playMockSession` formal）。用户在「请你确认」时仍看到第二个主色 CTA，违背「一屏一个主色实心 CTA / 确认态主 CTA = 确认条」。
- **出现**：`AgentSessionWorkspace.tsx`（`hitlActive` 分支）+ `SessionComposer.tsx` 发送钮
- **好坏标准**：`needs_human` / 有待确认门时，底部主钮降级为描边/禁用并改文案（如「确认完成后再办理」），或隐藏发送、仅保留换人/案件；确认条按钮为唯一实心主色。
- **建议改法**：向 Composer 传入 `hitlActive`（或 `primaryMode: 'confirm' | 'run'`）；确认态主钮 `variant=ghost/disabled`；可选：确认全部通过后再恢复实心「开始办理」。

### P1

#### 2. 交接 / 期限英文枚举直出（零行话未闭环）
- **问题**：确认条标题旁渲染原始 `handoffStatus`（`authorized_to_file` 等）；右栏案件行 `交接 ${handoffStatus}`；期限行直出 `d.status`（`due_soon`/`upcoming`/`overdue`）。中台已有 `HANDOFF_LABELS` / `HandoffChip`，Agent 会话未复用。
- **出现**：`SessionConfirmBar.tsx`、`SessionContextPanel.tsx`
- **好坏标准**：用户可见状态全中文；枚举仅进代码/高级折叠。
- **建议改法**：确认条用 `HANDOFF_LABELS[status]` 或嵌 `HandoffChip`；Context 案件行同理；期限建 `DOCKET_STATUS_LABEL`（即将到期/已逾期/已完成…）。

#### 3. 内容层仍泄漏 Go/No-Go 与工具 id
- **问题**：`agents.ts` intake `systemPromptBrief` 含「Go/No-Go」→ Catalog `<details>`「擅长」与右栏「当前办理人」全文可见；种子会话 goal/step/产物含「Go/No-Go」「confirm_quote」；Catalog 详情「能力」仍是英文 `code` chip（对比 Skills 已 label 优先）。
- **出现**：`data/agents.ts`、`data/sessions.ts`、`AgentCatalogPage.tsx`、`SessionContextPanel.tsx`、时间线预置 content
- **好坏标准**：默认用户路径零 Go/No-Go / 命令 id；工具展示用人话 label。
- **建议改法**：brief/goal/step 改「立项决定」；Catalog 能力列映射 `TOOL_CATALOG` label，id 放高级；Context「擅长」用 specialty 摘要而非 system prompt 全文。

#### 4. SessionsList / 文案残留英文产品词
- **问题**：表头列「Agent」；`PageHeader` context「一次或多次 Agent 运行」。与壳内「办理人」心智不一致。
- **出现**：`AgentSessionsList.tsx`
- **好坏标准**：列名「办理人」；说明「一次或多次办理」。
- **建议改法**：直接替换文案；行内已用 `ag?.name ?? '自动匹配'` 可保留。

#### 5. 状态横幅与 toast 仍可叠两层
- **问题**：P1-6 保证「状态横幅」互斥，但 `toastVisible`（成功翠绿 / 消息 indigo）可与 failed/no_case/route **同时**出现；换人时 `showToast` +（无 banner 时）`switchReasonChip` 也可能叠信息。
- **出现**：`AgentSessionWorkspace.tsx` 顶栏块
- **好坏标准**：顶栏信息带同时最多一条（失败横幅优先于 toast；toast 可改浮层或挤掉次要横幅）。
- **建议改法**：`activeBanner` 非空时抑制普通 toast，或 toast 改 `fixed` 底角；失败态仅保留失败条+重试。

#### 6. 焦点环与菜单项仍不完整
- **问题**：侧栏「更多 / 已归档 / 行菜单」内 `<button|Link>` 多数无 `focus-ring`；Home 主 textarea `outline-none` 且外层 `soft-card` 无 `focus-within` 环（Composer 有、Home 无）。
- **出现**：`AgentShell.tsx` 菜单、`AgentHome.tsx` 输入卡
- **好坏标准**：可聚焦控件 `focus-visible` 同构；主输入区有清晰 focus-within。
- **建议改法**：菜单项统一 `focus-ring`；Home 输入容器对齐 Composer 的 `focus-within:ring`。

### P2（抛光）

#### 7. 侧栏默认仍多一行「更多筛选」铬
- **问题**：P0-3 状态已两档，但「更多筛选」+「⋯」在默认折叠时仍占一整行垂直空间，列表首屏略紧。
- **出现**：`AgentShell.tsx` aside
- **好坏标准**：默认筛选区 ≤ 搜索 + 一段 segmented；更多进图标或与 ⋯ 合并。
- **建议改法**：无额外筛选激活时把「更多筛选」收进右侧 ⋯；激活时再展开高亮条。

#### 8. Timeline `soft-card border` 双边框 / Composer 未吃 soft-card
- **问题**：`SessionTimeline` `className={soft-card border …}` 叠加 soft-card 自带 border；Composer 外框手写圆角阴影，与 token 卡不完全同构。
- **出现**：`SessionTimeline.tsx`、`SessionComposer.tsx`
- **好坏标准**：时间线卡单层边框（可用 `nest-card` 或去掉额外 `border`）；Composer 用 `soft-card` 或同 radius token。
- **建议改法**：Timeline 去掉冗余 `border`，色调用 ring/背景；Composer 换 `soft-card` + `focus-within`。

#### 9. 非会话页顶栏「自动匹配」指示器易误解
- **问题**：无活动会话时顶栏仍显示只读「自动匹配」，像全局模型选择，实际无编辑语义。
- **出现**：`AgentShell.tsx` `topbarAgentLabel`
- **好坏标准**：仅在 `/agent/sessions/:id` 显示当前办理人；其余页隐藏或改为「在会话中选择办理人」。
- **建议改法**：`inSession` 时才渲染该 chip。

#### 10. 中文区块仍 `uppercase tracking-wider`
- **问题**：「IP 任务会话」「上下文」「推荐办理人」「最近会话」、Sessions 表头等对中文套英文大写字距，显「未本地化的设计系统」。
- **出现**：`AgentShell`、`SessionContextPanel`、`AgentHome`、`AgentSessionsList`
- **好坏标准**：中文分区用常规字重/字距，或小号 semibold 无 uppercase。
- **建议改法**：去掉 `uppercase tracking-wider`，保留 `text-xs font-semibold text-slate-400`。

#### 11. ConfirmBar 多枚同权实心钮
- **问题**：多个 gate 并列为 emerald/indigo 实心，扫视无「下一步」优先级（尤其 authorize 与 approve 并存时）。
- **出现**：`SessionConfirmBar.tsx`
- **好坏标准**：当前可点的下一步 1 个实心，其余描边或按序禁用。
- **建议改法**：仅第一个未 cleared 且可点的 gate 实心；其余 outline。

---

## 建议下一轮顺序（≤6条）

1. **确认态 Composer 主 CTA 降级**（本轮 P0-1）— 闭环上轮 P0-2。
2. **交接/期限中文映射**（P1-2）— 复用 `HANDOFF_LABELS`，补期限文案。
3. **扫 Go/No-Go + Catalog 工具 label**（P1-3）— brief/种子/详情三处一并清。
4. **SessionsList「Agent」→「办理人」**（P1-4）— 低成本高感知。
5. **横幅与 toast 互斥 / 底角浮层**（P1-5）— 顶栏信息带真正「一条」。
6. **菜单 focus-ring + Home focus-within + 非会话隐藏顶栏 chip**（P1-6 / P2-9）— 焦点与 chrome 抛光可同批。

（P2 Timeline 双边框、uppercase、ConfirmBar 步进式主钮可作同批顺手项，不必单独开轮。）

---

## 方法备忘（R2）

- 对照 `AGENT_APPLE_AUDIT.md`「已落地」14 条与源码逐项验收；grep：`text-[9|10|11]px`、`Go/No-Go`、`Orchestrator|Prompt|RACI|Harness|Agents|Tools`、`clearedHitlGates`、`requestAgentSwitch`、`hitlActive`、`soft-card`、`focus-ring`、`shadow-[`、`bg-white/80`、`bg-surface-50`、`HANDOFF_LABELS` 使用点。
- 关键读：`AgentShell`、`AgentSessionWorkspace`、`session/*`、`AgentCatalogPage`、`AgentHome`、`AgentSkills`、`AgentHarnessOverview`、`AgentSessionsList`、`ProductSwitcher`、`WorkspaceMenu`、`index.css`、`useAgentDisplayLabel`。
- **诚实结论**：无 P0 级「静默丢确认」回归；最大未闭环是 **确认态双主 CTA** 与 **英文枚举/内容行话残留**；布局与材质已跨过 7 分线，下一轮以闭环与零行话抛光为主，不宜再堆功能。

---

## 已落地（R2 闭环 · 2026-09-11）

对照本文件 P0-1 / P1 2–6 / P2 7–11，全部落地；`npm run build` 通过；Vite `0.0.0.0:5173`；中文白话 UI；Command / 双产品 / 租户语义未改。

### P0
1. **确认态 Composer 主 CTA 降级** — `hitlActive` 传入 `SessionComposer`；确认态主钮 ghost/disabled「确认完成后再办理」，确认条为唯一实心主色。

### P1
2. **交接 / 期限中文** — `SessionConfirmBar` 嵌 `HandoffChip`；`SessionContextPanel` 用 `HANDOFF_LABELS`；期限映射 `DOCKET_STATUS_LABEL`（即将到来/即将到期/已逾期/已完成）。
3. **Go/No-Go 与工具 id** — intake `systemPromptBrief`/种子 goal·step·产物/`AgentContext` 预备文案改为「立项决定」；Catalog 能力用 `toolCatalogLabel`；Context「擅长」用 `specialty`。
4. **SessionsList 文案** — 列「办理人」；PageHeader「一次或多次办理」；行内「自动匹配」。
5. **横幅 vs toast** — `activeBanner` 非空时抑制 toast；toast 改 `fixed` 底角，顶栏仅一条状态带。
6. **focus-ring / Home focus-within** — 壳内溢出/归档/行菜单项补 `focus-ring`；Home 主输入卡 `focus-within:ring` 对齐 Composer。

### P2
7. **更多筛选并入 ⋯** — 无额外筛选时仅 ⋯（含进行中/已完成/更多筛选…/已归档）；激活后展开高亮条 + 可清除。
8. **Timeline / Composer 材质** — Timeline 去掉冗余 `border`；Composer 改 `soft-card` + `focus-within`。
9. **非会话隐藏顶栏办理人 chip** — 仅 `/agent/sessions/:id` 显示。
10. **中文区块去 uppercase** — Shell「IP 任务会话」、Context「上下文」、Home「推荐办理人/最近会话」、Sessions 表头去掉 `uppercase tracking-wider`。
11. **ConfirmBar 步进主钮** — 仅第一个未 cleared 且可点的 gate 实心，其余 outline。

