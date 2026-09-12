# Agent 平台 · Apple Design 扫描

日期：2026-09-11。范围：`AgentShell`、`AgentHome`、`AgentCatalogPage`、`AgentSessionWorkspace` + `components/agent/session/*`、`AgentSessionsList`、`AgentSkills`、`AgentHarnessOverview`、顶栏 `ProductSwitcher`/`WorkspaceMenu`、以及 `index.css` 中与 Agent chrome 相关的 token。只读审计；本文件为唯一写入产物。

对照透镜：按压/响应、字号层级、材质深度、空间一致、克制、寻路、同心圆角、reduced-motion、熟悉感、用户掌控（agency）、终端用户零行话。

---

## 总评（布局/UI、动效反馈、克制、习惯）各打分 + 一句话

| 维度 | 分 | 一句话 |
|------|-----|--------|
| **布局 / UI** | **6.4/10** | 三栏壳 + P2 会话拆分骨架清晰，但会话顶栏横幅堆叠、侧栏筛选过密、目录卡工程师信息过载。 |
| **动效反馈** | **7.2/10** | `btn-press` / `menu-enter` / `toast-enter` + CSS `prefers-reduced-motion` 基础扎实；会话页多枚主 CTA 缺 `focus-ring`，顶栏换人无确认与底部不一致。 |
| **克制** | **5.8/10** | 白话「请你确认」已落地，但 Catalog/Harness/Timeline 仍暴露 Prompt·RACI·Orchestrator·工具 JSON·`text-[10px]`。 |
| **习惯 / 熟悉感** | **6.6/10** | 新建会话 + 侧栏列表像聊天产品；导航混用英文「Agents/Tools/Harness」、双 Agent 选择器破坏心智模型。 |

**综合 ≈ 6.5/10** — 像「已做过一轮 UX 收敛的演示壳」，尚未到 Apple 级「一屏一主任务、控件同构、字号与材质可预期」。

---

## 已做得好的

1. **按压与菜单动效基础设施**（`index.css`）：`.btn-press` active `scale(0.96)`、`.menu-enter` / `.toast-enter`，且 `@media (prefers-reduced-motion: reduce)` 关掉 transition/animation（含 `.animate-pulse`）。
2. **会话页 P2 拆分**：`AgentSessionWorkspace` 薄编排；`SessionConfirmBar` / `SessionTimeline` / `SessionContextPanel` / `SessionComposer` 边界清楚，利于后续收敛层级。
3. **确认态文案克制**：`SessionConfirmBar` 标题「请你确认」；状态「待你确认」；失败「办理失败」+「重试」；无案琥珀条「尚未关联案件…」+「去选案件」聚焦下拉；成功翠绿「中台案件已同步更新」。
4. **换人二次确认（底部路径）**：`SessionComposer` `pendingAgentSwitch`「换人后要重新确认，继续？」；Auto 建议切换后短暂理由芯片；滚动 `scrollIntoView` 尊重 `prefers-reduced-motion`。
5. **双产品切换同构**：`ProductSwitcher` 选中 = 白底 + `shadow-sm`（Agent 顶栏与中台一致）；`WorkspaceMenu` Escape/outside 关闭 + `menu-enter`。
6. **会话管理 agency**：侧栏/列表共享 `sessionSearch`；重命名、归档；列表行 `min-h-[44px]` + `focus-row`；空态有「新建」与「打开工作台待办」。
7. **Token 意图正确**（`index.css` `@theme`）：字号阶 12/13/15/17/22、半径 sm/md/lg/xl、两档 `--shadow-rest` / `--shadow-elevated`、`.soft-card` / `.elevated` — 方向对，Agent 页尚未吃透这些 token。
8. **a11y 起点**：`skip-link` → `#agent-main`；多处 `aria-label` / `sr-only`；Composer 容器 `focus-within` 环。

---

## 仍需优化（P0 / P1 / P2）

### P0

#### 1. 顶栏换 Agent 绕过「换人确认」（agency 不一致）
- **问题**：`AgentShell` 顶栏 `<select>` 直接 `patchSession(..., clearedHitlGates: [])`；`SessionComposer` 同操作走 `requestAgentSwitch` → 有已通过步骤时弹「换人后要重新确认」。两条路径语义冲突，用户可在顶栏静默丢掉确认进度。
- **出现**：`AgentShell.tsx`（modelPick onChange）↔ `AgentSessionWorkspace.tsx` / `SessionComposer.tsx`
- **好坏标准**：同一会话内换人只有一条路径；有已通过确认步骤时必二次确认；顶栏与底部控件同步同一状态机。
- **建议改法**：顶栏改为调用与会话页相同的 `requestAgentSwitch`（经 outlet context / 事件 / 共享 hook）；或顶栏只读展示，编辑仅在 Composer。

#### 2. 会话顶栏多主 CTA + 底部再「开始办理」（竞争主任务）
- **问题**：非播放时并列「回中台案件」「预览一下」「开始办理」（indigo）+ 可选「⋯一键等效演示」；Composer 底部又有 indigo「开始办理」。`hitlActive` 时顶栏「开始办理」降级为描边，但仍可见，与「请你确认」条抢注意力。
- **出现**：`AgentSessionWorkspace.tsx` 顶栏操作区；`SessionComposer.tsx` 发送钮
- **好坏标准**：一屏一个主色实心 CTA；预览进 ⋯ 或次要描边；确认态下主 CTA = 确认条按钮，顶栏办理钮隐藏或禁用并说明。
- **建议改法**：默认主 CTA 只留 Composer「开始办理」；顶栏保留「回中台」文字/描边 +「预览」进更多；`hitlActive` 时隐藏顶栏办理/预览。

#### 3. 侧栏筛选密度压过会话列表（克制 / 寻路）
- **问题**：搜索 + 四段状态 segmented（小屏 `basis-50%` 折两行）+「已归档」整宽钮 + Agent `<select>` 占侧栏上半；会话行字号全是 `text-xs`，列表成为附属。
- **出现**：`AgentShell.tsx` aside（约 L295–390）
- **好坏标准**：默认一屏先看到会话；筛选单行或「筛选」折叠；计数可读且不抢标题。
- **建议改法**：状态筛默认「全部 | 待你确认」两档，其余进「更多筛选」；归档并入状态或菜单；Agent 筛选默认收起；会话标题升到 `text-sm`。

#### 4. 字号跌破 token 下限（`text-[10px]` / `text-[11px]`）
- **问题**：`SessionContextPanel` ≈10 处、`SessionTimeline` 标签/时间戳/工具 JSON ≈5 处、`AgentSessionsList` 表头/副标题 `text-[11px]`、会话标题「改名」`text-[11px]`。低于 `index.css` 规定的 caption 12px。
- **出现**：`SessionContextPanel.tsx`、`SessionTimeline.tsx`、`AgentSessionsList.tsx`、`AgentSessionWorkspace.tsx`
- **好坏标准**：交互/可读文案 ≥12px（`text-xs`）；代码块可用 11–12px mono，禁止 10px 业务说明。
- **建议改法**：面板正文改 `text-xs`；时间线 kind 标签用 `text-xs`；工具 JSON 默认折叠，展开再用 `text-xs font-mono`。

### P1

#### 5. 目录 / 架构页工程师行话（零行话失败）
- **问题**：
  - `AgentCatalogPage`：副文「Session / Orchestrator / 工具 · 人工确认」；区块标题「Tools」「Prompt ·」「RACI ·」；状态徽章原文 `active`/`beta`。
  - `AgentHarnessOverview`：顶栏入口仍叫「架构 · 帮助」；卡片暴露工具 id 字符串；页脚链 `COMMANDS.md` / `HARNESS.md`。
  - `AgentShell` 顶栏徽章「Harness」、选项「IP-Harness · Auto」；导航「Agents」「Tools」。
  - `AgentHome` 快捷：芯片「Go/No-Go」；洞察目标串含 `CreateCaseFromInsight` / `ConfirmQuote`。
- **出现**：上述文件 + `HITL_GATE_LABELS.go_nogo = '立项 Go/No-Go'`（`data/agents.ts`，UI 直出）
- **好坏标准**：终端用户面全中文白话；内部 id/文件名仅开发者折叠区。
- **建议改法**：导航→「目录」「能力」；徽章→去掉或「演示」；Prompt→「擅长」；RACI→「谁负责」；状态→「可用/试用」；Go/No-Go→「立项决定」；Harness 页脚去掉 md 文件名。

#### 6. 会话页顶栏信息瀑布（P2 拆分后层级仍扁）
- **问题**：标题行下可连续出现：Auto 路由建议条、换人理由芯片、无案琥珀、失败玫瑰、确认步骤 chip 行、领域同步/消息 toast。时间线被挤，主内容首屏变短。
- **出现**：`AgentSessionWorkspace.tsx` 顶栏块（约 L330–615）
- **好坏标准**：同时最多 1 条状态横幅；确认步骤仅在 `SessionConfirmBar` 或折叠摘要；成功 toast 3–5s 自动收。
- **建议改法**：横幅优先级队列（失败 > 待确认提示 > 无案 > 路由建议）；非关键 toast 用 `toast-enter` 后定时清除；闲时确认步骤移入右栏或确认条。

#### 7. 焦点环覆盖不全（键盘 / 熟悉感）
- **问题**：大量 `btn-press` 无 `focus-ring`：会话顶栏「预览/开始办理/停止/切换到该 Agent/去选案件/重试/打开案件」、`SessionConfirmBar` 全部确认钮、`SessionComposer` 继续/取消/开始办理、侧栏状态筛按钮。`AgentHome` / Composer textarea 用 `outline-none` 依赖父级，尚可；产物 textarea 用自定义 `focus:ring` 与全局 `focus-ring` 两套。
- **出现**：`AgentSessionWorkspace.tsx`、`SessionConfirmBar.tsx`、`SessionComposer.tsx`、`AgentShell.tsx` 状态 segmented
- **好坏标准**：所有可聚焦控件 `focus-visible` 同色同 offset（沿用 `.focus-ring`）。
- **建议改法**：上述按钮补 `focus-ring`；统一去掉裸 `outline-none` 或保证父级 `focus-within` 足够明显。

#### 8. 圆角 / 阴影未吃 token（同心与材质）
- **问题**：`@theme` 定义 `--radius-*` / `--shadow-rest|elevated`，Agent 页大量手写 `rounded-lg|xl|2xl`、`shadow-sm`、`shadow-[0_1px_2px_…]`、inset 选中条。Catalog 卡 `rounded-2xl`+自定义 shadow；时间线卡又一套；侧栏菜单 `rounded-lg`+`elevated`。内层（chip `rounded-md`）与外层半径差不遵守「outer ≈ inner + pad」。
- **出现**：`AgentCatalogPage`、`SessionTimeline`、`AgentShell`、`AgentHarnessOverview`、`AgentSkills`（Skills 卡无 shadow，与 Catalog 不一致）
- **好坏标准**：外卡 `soft-card` / `rounded-[var(--radius-lg)]`；内控 `--radius-sm`；阴影仅 rest / elevated 两档。
- **建议改法**：目录/技能/时间线卡统一 `soft-card`；去掉 one-off `shadow-[…]`；选中会话用左边框 token 色而非任意 inset shadow。

#### 9. Timeline / Context 仍偏「调试台」
- **问题**：步骤标签「工具调用/工具结果」+ 深色终端块甩出 `toolName` + JSON args；右栏默认展开「显示审计」（actor 英文 `agent`）与「Agent 工具 / 架构」code chip；产物编辑区 `text-[10px]` mono。
- **出现**：`SessionTimeline.tsx`、`SessionContextPanel.tsx`
- **好坏标准**：默认像「办理记录」；工具细节折叠；审计/工具 id 进「高级」。
- **建议改法**：工具步默认只显示人话 title/content；「查看调用详情」展开 JSON；审计 summary 改为「办理记录」；actor 映射中文。

### P2

#### 10. 双 Agent 选择器并存（熟悉感）
- **问题**：顶栏「IP-Harness · Auto」与 Composer「Agent · Auto」同改 `agentId`，文案还不一致；Auto 时副标题 `Auto → {name}` 箭头像内部路由日志。
- **出现**：`AgentShell.tsx` + `SessionComposer.tsx` + `AgentSessionWorkspace` 副标题
- **好坏标准**：单一编辑点；展示文案「自动匹配 · {专家名}」。
- **建议改法**：见 P0-1；副标题去掉 `→` 工程师符号。

#### 11. Catalog 卡信息过载 / 无主次
- **问题**：每卡：名称、英文 status、specialty、description、需确认 chips、Tools code、Prompt 摘要、RACI、阶段、启动钮 — 扫视成本高；启动钮视觉权重弱（小 `text-xs`）。
- **出现**：`AgentCatalogPage.tsx`
- **好坏标准**：首屏卡 = 名 + 一句话 + 1 个主 CTA；细节点进或展开。
- **建议改法**：默认三行 +「启动会话」；Tools/Prompt/RACI 放 `<details>`。

#### 12. Home 快捷 Agent 九宫格偏演示墙
- **问题**：一次甩 9 个 Agent 卡 + 可选洞察快捷；与中部主输入抢「设定目标」主角。
- **出现**：`AgentHome.tsx`
- **好坏标准**：3–4 个推荐 +「全部目录」；其余不进首屏。
- **建议改法**：按最近使用/阶段裁到 4；洞察快捷保持折叠且去掉命令 id。

#### 13. Skills 页工具 id 优先于人话
- **问题**：卡顶 `<code>{t.name}</code>`（英文 snake）重于 `t.label`；「→ 业务写入」偏内部。
- **出现**：`AgentSkills.tsx`
- **好坏标准**：标题用 `label`；技术名次要 mono。
- **建议改法**：对调层级；「写入中台：{中文命令名}」。

#### 14. 材质：侧栏 `bg-white/80 backdrop-blur` vs 主区实底
- **问题**：aside 半透明模糊，会话主列 `bg-[#f7f8fa]` 硬编码，与 `--color-surface-50` / body `#f8fafc` 微差；右栏纯白。三列材质不统一。
- **出现**：`AgentShell.tsx`、`AgentSessionWorkspace.tsx`、`SessionContextPanel.tsx`
- **好坏标准**：一列 sticky 可 blur；主列用 surface token；避免魔法 hex。
- **建议改法**：主列 `bg-surface-50`；侧栏实白或统一 soft blur 策略。

---

## 建议落地顺序（8 条以内）

1. **统一换人状态机**（P0-1）：顶栏与 Composer 共用确认；消灭静默清空 `clearedHitlGates`。
2. **会话页单一主 CTA**（P0-2）：办理入口收束到底部；确认态隐藏顶栏竞争按钮。
3. **侧栏筛选瘦身**（P0-3）：默认两档状态 + 折叠更多；抬升会话行字号。
4. **消灭 ≤10px 与双套 focus**（P0-4 + P1-7）：上下文/时间线升到 `text-xs`；补全 `focus-ring`。
5. **用户面去行话**（P1-5）：导航中文化、Catalog/Home/Harness 文案、Go/No-Go 与命令 id。
6. **顶栏横幅优先级队列**（P1-6）：同时只亮一条；toast 自动消。
7. **卡片吃 soft-card / radius token**（P1-8）：Catalog、Skills、Timeline、Harness 插件卡对齐。
8. **Timeline/Context 默认非调试**（P1-9）：工具 JSON / 审计 / 工具 id 默认折叠。

---

## 方法备忘（本次扫描）

- 阅读：`AgentShell`、`AgentHome`、`AgentCatalogPage`、`AgentSessionWorkspace`、`session/*`、`AgentSessionsList`、`AgentSkills`、`AgentHarnessOverview`、`ProductSwitcher`、`WorkspaceMenu`、`index.css`；对照 `AGENT_UX.md` P0–P2 验收。
- Grep：`text-[9px|10px|11px]`、`outline-none`、`btn-press` 无 `focus-ring`、`HITL`/`Orchestrator`/`Prompt`/`RACI`/`Harness`/`Agents`/`Tools`、竞争文案「开始办理|预览一下」、`shadow-[`、`rounded-*` 混用、`prefers-reduced-motion`。
- 结论：HITL **英文缩写**已基本不出现在 UI 字符串；残留是 **工程师中英杂交**（Prompt/RACI/Orchestrator/Tools/Harness/命令 id）与 **控件同构/密度** 问题，优先于再堆功能。

---

## 已落地（2026-09-11 执行）

全部 14 项已在 IP Agent 平台落地；`npm run build` 须通过；Vite `0.0.0.0:5173`；中文白话 UI；Command / 双产品 / 租户语义未改。

### P0
1. **统一换人**：顶栏 Agent `<select>` 改为只读展示（`自动匹配 · {名}`）；编辑仅在 `SessionComposer`，走 `requestAgentSwitch` / 确认，不再静默清空 `clearedHitlGates`。
2. **单一主 CTA**：仅 Composer「开始办理」为实心 indigo；「预览一下」移入顶栏 ⋯；`hitlActive` 时隐藏顶栏预览/⋯ 办理相关；顶栏保留幽灵「回中台」。
3. **侧栏筛选**：默认「全部 | 待你确认」；进行中/已完成进「更多筛选」；归档进 ⋯ 菜单；按办理人筛选默认折叠；会话标题 `text-sm`。
4. **字号 ≥ text-xs**：ContextPanel / Timeline / SessionsList / 改名钮去掉 `text-[10px]|[11px]`；工具 JSON 默认折叠，「查看调用详情」展开。

### P1
5. **去行话**：导航「目录」「能力」；去掉 Harness 徽章；Catalog Prompt→擅长、RACI→谁负责、active/beta→可用/试用；`HITL_GATE_LABELS.go_nogo`→立项决定；Home 洞察无命令 id；Harness 页脚无 `.md` 文件名。
6. **横幅队列**：同时最多 1 条状态横幅（失败 > 无案 > 路由建议）；成功/消息 toast 约 4s 自动收；闲时确认步骤仅留在确认条。
7. **focus-ring**：确认条、Composer、顶栏操作、侧栏状态筛、预览菜单等补全 `focus-ring`。
8. **soft-card / token**：Catalog、Skills、Timeline、Harness 插件卡用 `soft-card` / `--radius-*` / `--shadow-rest`；去掉 one-off `shadow-[0_1px_…]`；选中会话左边框 token 色。
9. **非调试默认**：Timeline 人话标题；工具步折叠详情；审计「办理记录」；actor 中文映射。

### P2
10. **单一选择器**：顶栏只读；Composer 为唯一编辑点；副标题无 `→`，用「自动匹配 · {名}」。
11. **Catalog 卡**：名 + 一行 + 主 CTA「启动会话」；能力/擅长/谁负责进 `<details>`。
12. **Home**：最多 4 个推荐办理人 +「全部目录」；洞察折叠且无命令 id。
13. **Skills**：`label` 优先，技术名次要 mono；「写入中台：{中文}」。
14. **材质**：主列 `bg-surface-50`；侧栏实白（与主列统一，去掉半透明 blur 混用）。
