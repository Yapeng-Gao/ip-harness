# Agent 平台 · Apple Design 复扫（R3）

日期：2026-09-11。范围：仅 `/workspace/ip-harness` 内 Agent 平台（`AgentShell`、`AgentHome`、`Catalog`、`SessionWorkspace` + `session/*`、`SessionsList`、`Skills`、`HarnessOverview`、顶栏 `ProductSwitcher`/`WorkspaceMenu`、相关 CSS）。对照 `AGENT_APPLE_AUDIT_R2.md`「已落地」11 条复扫；**只读核验，本文件为唯一写入产物**。

透镜：按压/响应、字号层级、材质深度、空间一致、克制、寻路、同心圆角、reduced-motion、熟悉感、用户掌控、终端用户零行话。

---

## 总评打分（布局/反馈/克制/习惯）+ 对比上一轮 ~7.5

| 维度 | R2 | R3 | 一句话 |
|------|-----|-----|--------|
| **布局 / UI** | 7.5 | **8.0** | 更多筛选并入 ⋯、确认态单一主色、soft-card/Composer 同构后侧栏与会话骨架干净；无结构性拥挤。 |
| **动效反馈** | 7.8 | **7.9** | 确认态 Composer 降级 + focus-within/菜单 focus-ring + 底角 toast 扎实；**无案件时 `no_case` 常驻横幅会整页抑制 toast**，反馈偶发失踪。 |
| **克制** | 7.1 | **7.6** | 交接/期限中文、Go/No-Go→立项决定、工具 label、Sessions「办理人」已闭环；**新建会话系统步仍写 Harness / mock / 试运行**。 |
| **习惯 / 熟悉感** | 7.5 | **8.0** | 顶栏只读且仅会话页；底部唯一换人；ConfirmBar 步进实心；非会话隐藏办理人 chip。 |

**综合 ≈ 8.0/10**（上一轮 ~**7.5**）— R2 清单主干全部可核验落地；从「可抛光产品壳」进入「抛光收口」；距 Apple 级还差：新建会话零工程师口吻、横幅与 toast 真正「信息带一条且不吞反馈」。

**相对 R2 的净变化**：确认态双主 CTA、英文枚举、Sessions 英文列、侧栏常驻「更多筛选」、Timeline 双边框、uppercase 分区等已消；残留集中在 **创建会话系统文案**、**toast×常驻横幅互斥过严**、**个别 focus / 试运行措辞抛光**。

---

## 上轮已落地 11 条验收（✅/⚠️/❌ 各一行）

### P0
1. **确认态 Composer 主 CTA 降级** — ✅ `hitlActive` 传入 `SessionComposer`；主钮 disabled + ghost「确认完成后再办理」；确认条为唯一实心主色；顶栏预览菜单在 `hitlActive` 时隐藏。

### P1
2. **交接 / 期限中文** — ✅ `SessionConfirmBar` 嵌 `HandoffChip`；`SessionContextPanel` 用 `HANDOFF_LABELS` + `DOCKET_STATUS_LABEL`（即将到来/即将到期/已逾期/已完成）。
3. **Go/No-Go 与工具 id** — ✅ 作用域内无用户面 `Go/No-Go`；intake brief/种子/预备文案为「立项决定」；Catalog/Context 能力用 `toolCatalogLabel`；Context「擅长」用 `specialty`。
4. **SessionsList 文案** — ✅ 列「办理人」；PageHeader「一次或多次办理」；行内自动匹配。
5. **横幅 vs toast** — ⚠️ `activeBanner` 互斥队列 + toast `fixed` 底角已落地；但 `no_case` / `route` 为常驻带时 `toastVisible && !activeBanner` 会**吞掉**换人/确认成功反馈（互斥过严，未达「一条信息且反馈可达」）。
6. **focus-ring / Home focus-within** — ✅ 壳内溢出/归档/行菜单项有 `focus-ring`；Home 主输入卡 `focus-within:ring` 对齐 Composer。残留：Home「查看架构说明」、WorkspaceMenu「重新选择工作区」Link 仍无环（抛光级）。

### P2
7. **更多筛选并入 ⋯** — ✅ 默认仅 segmented + ⋯；无额外筛选时「进行中/已完成/更多筛选…/已归档」进菜单；激活后高亮条 + 可清除。
8. **Timeline / Composer 材质** — ✅ Timeline `soft-card` + 色调 class、无冗余双 `border` 叠层；Composer `soft-card` + `focus-within`。
9. **非会话隐藏顶栏办理人 chip** — ✅ `inSession` 才渲染只读 chip。
10. **中文区块去 uppercase** — ✅ Shell「IP 任务会话」、Context「上下文」、Home「推荐办理人/最近会话」、Sessions 表头均为常规 semibold。WorkspaceMenu **sidebar** 变体仍有 `uppercase tracking-wider`「工作区切换」，Agent 顶栏用 topbar 变体故不露。
11. **ConfirmBar 步进主钮** — ✅ `firstActionable`（经 `gateDisabledReason`，已通过=禁用）仅一枚实心；其余 outline；递交归档在无门可点时升实心。

**汇总**：✅ 10 · ⚠️ 1 · ❌ 0。无整项回退；⚠️ 为「落地副作用」而非未改。

---

## 本轮仍需优化 P0/P1/P2（问题、页面、好坏、改法）

### P0

**暂无 P0。** 确认态主任务单一、换人需确认、无静默清空门、字号地板与材质主干均稳。

### P1

#### 1. 新建会话系统步泄漏 Harness / mock / 试运行
- **问题**：`createSession` 首条 system step 文案为「Harness 已编排「…」· 点击试运行开始 mock 工具调用。」用户一进新会话即见工程师口吻；且主 CTA 实为底部「开始办理」，与「试运行」指引错位。种子/重开路径亦有「等待试运行」「重新试运行」等（`AgentContext`）。
- **出现**：`context/AgentContext.tsx`（`createSession` / play 重启文案）；连带 `SessionContextPanel` 空态「试运行后出现草稿」
- **好坏标准**：默认路径零 Harness/mock/transcript；指引对齐真实主钮（开始办理 / 预览一下）。
- **建议改法**：改为「已为「{名}」备好会话 · 在底部开始办理，或从 ⋯ 预览」；空态「办理后出现草稿」；dry-run 时间线标题与菜单统一「预览」。

#### 2. 常驻状态横幅吞掉底角 toast
- **问题**：R2 为消叠层令 `toastVisible && !activeBanner`；但无案件时 `activeBanner === 'no_case'` **几乎整段会话常驻**，换人 toast、确认写回 toast 均不可见；`route` 建议带同理。
- **出现**：`AgentSessionWorkspace.tsx`（`activeBanner` + toast 条件）
- **好坏标准**：顶栏状态带最多一条；toast 作为非阻塞浮层可与非失败横幅共存，或失败态才抑制 toast。
- **建议改法**：仅 `failed` 时抑制 toast；`no_case`/`route` 保留横幅但允许底角 toast；或 toast 一律浮层且不再挂 `!activeBanner`。

### P2（抛光）

#### 3. 个别 Link 缺 focus-ring
- **问题**：Home「查看架构说明」、WorkspaceMenu「重新选择工作区」无 `focus-ring`（键盘寻路缺口）。
- **出现**：`AgentHome.tsx`、`WorkspaceMenu.tsx`
- **好坏标准**：可聚焦导航同构 `focus-visible`。
- **建议改法**：补 `focus-ring`（及必要 `rounded`）。

#### 4. 创建标题/目标英文回退
- **问题**：无案件且空 goal 时 title/goal 可回退 `Agent` / `Auto`（`createSession`）。
- **出现**：`AgentContext.tsx`
- **好坏标准**：用户可见字符串全中文（自动匹配 / 办理助手）。
- **建议改法**：`?? '自动匹配'` / `请办理人处理 IP 任务`。

#### 5. Harness 总览分区仍 `tracking-wider`
- **问题**：「办理运行时（唯一）」对中文保留字距加宽（非 uppercase，观感略「系统未本地化」）。
- **出现**：`AgentHarnessOverview.tsx`
- **好坏标准**：中文分区常规字距 + semibold。
- **建议改法**：去掉 `tracking-wider`。

---

## 建议下一轮顺序（≤4条）

1. **改写 createSession / 试运行用户文案**（本轮 P1-1）— 最高感知、改动面小。
2. **放宽 toast×横幅互斥**（P1-2）— 仅失败抑制或浮层恒显。
3. **Link focus-ring + Agent/Auto 中文回退**（P2-3/4）— 同批键盘与克制抛光。
4. **Harness tracking-wider**（P2-5）— 顺手。

（若只做 1–2，即可诚实宣称 Agent 壳「暂无 P0/P1，仅抛光」。）

---

## 方法备忘（R3）

- 对照 R2「已落地」P0-1 / P1 2–6 / P2 7–11 与源码逐项验收；grep：`hitlActive`、`确认完成后再办理`、`HandoffChip`、`HANDOFF_LABELS`、`DOCKET_STATUS_LABEL`、`toolCatalogLabel`、`Go/No-Go`、`text-[9|10|11]px`、`fixed bottom`、`activeBanner`、`extraFiltersActive`、`inSession`、`uppercase tracking-wider`、`firstActionable`、`soft-card`、`focus-within`、`Harness|mock|试运行`。
- 关键读：`AgentShell`、`AgentSessionWorkspace`、`session/*`、`AgentCatalogPage`、`AgentHome`、`AgentSkills`、`AgentHarnessOverview`、`AgentSessionsList`、`ProductSwitcher`、`WorkspaceMenu`、`index.css`、`AgentContext.createSession`、`data/agents|sessions`。
- **诚实结论**：**暂无 P0**；平台已以抛光为主。仍值单独开一轮的仅 **新建会话工程师文案** 与 **toast 被常驻横幅误杀** 两条 P1；其余为 focus/字距/英文回退级抛光。不宜再堆功能或重做信息架构。

---

## 已落地（R3 实施）

日期：2026-09-11。对照上文「本轮仍需优化」P1-1 / P1-2 / P2-3 / P2-4 / P2-5 已全部落地。

### P1
1. **新建会话 / 预览文案** — ✅ `createSession` 系统步改为「已为「{名}」备好会话 · 在底部开始办理，或从 ⋯ 预览」；`SessionContextPanel` 空态「办理后出现草稿」；`playMockSession` 时间线 dry-run 标题/正文统一「预览 / 重新预览」（去 Harness / mock / 试运行用户串）。
2. **toast × 横幅** — ✅ `AgentSessionWorkspace`：仅 `activeBanner === 'failed'` 时抑制底角 toast；`no_case` / `route` 常驻带可与 toast 共存。

### P2
3. **Link focus-ring** — ✅ Home「查看架构说明」、WorkspaceMenu「重新选择工作区」补 `focus-ring`（及必要 `rounded`）。
4. **createSession 中文回退** — ✅ title/名回退「自动匹配」；goal 回退「请办理人处理 IP 任务」；无用户面 Agent/Auto。
5. **Harness 分区字距** — ✅ `AgentHarnessOverview`「办理运行时（唯一）」去掉 `tracking-wider`。

**汇总**：本轮 P1×2 + P2×3 全部 ✅。Command / 双产品 / 租户未改。

