# UI 审计 · Apple Design

审计范围：`/workspace/ip-harness` 作业中台 + 业务工作台 + 多入口 + IP Agent + 全局 CSS。对照 Apple Design（Web 转译）与轻 SaaS 克制。**未改业务代码**，仅产出本 backlog。

评分口径：布局结构 / 信息层级 / 反馈与动效诚实度 / 字体与密度 / 材质克制 / 双产品 IA 一致性 / a11y（焦点与 reduced-motion）。

---

## 总评（布局/UI 分 + 一句话）

**布局 7.2 / UI 6.0 · 综合 6.5/10**

骨架（`Layout`/`Sidebar`/`AgentShell`/`FlowChrome`）已具备轻 SaaS 轮廓与 `btn-press`/`soft-card`/`text-balance` 等基础，但双产品切换器视觉不对称、`text-[10px]`/`text-[9px]` 过密、状态色与圆角阴影未统一、reduced-motion 覆盖不全，导致「像功能齐全的演示」多于「Apple 级克制产品」。

---

## 跨入口共性问题（P0/P1/P2）

### P0

1. **按压反馈未全覆盖**  
   - 现象：`index.css` 已有 `.btn-press`（active `scale(0.97)`），但 Insight*、Agencies、InventorPortal 主 CTA、Dashboard 披露行内按钮等多处主色按钮仍裸 `bg-indigo-600` 无 `btn-press`。  
   - 好：按下即时缩放；同语义按钮同一套反馈。  
   - 文件：`InsightTracks.tsx`、`InsightInnovate.tsx`、`InsightLayout.tsx`、`InsightChain.tsx`、`Agencies.tsx`、`InventorPortal.tsx`、`OrgSettings.tsx`、`Dashboard.tsx`（部分）。

2. **`prefers-reduced-motion` 覆盖缺口**  
   - 已覆盖：`.btn-press` / `.card-hover` / `.icon-btn` / `.kpi-stagger` / `.slider-pulse`（`index.css`）。  
   - 未覆盖：`animate-pulse`（`AgentSessionWorkspace.tsx`、`AgentRunConsole.tsx`）、`scrollIntoView({ behavior: 'smooth' })`（`AgentSessionWorkspace`/`Docket`/`AgentRunConsole`）、`Billing` 开关 `transition-transform`、`ProgressBar`/`DraftFlow` 的 `transition-all`。  
   - 好：reduce 时无脉冲、滚动瞬时、开关无位移动画。

3. **双产品切换器视觉/交互不对称（IA 一致性）**  
   - `Sidebar`：作业中台选中 = 白底浅阴影；Agent 侧为灰字。底部另有「切换到 IP Agent」重复入口。  
   - `AgentShell`：IP Agent 选中 = **实心 indigo-600**；作业中台为灰字。  
   - `Login`：Agent 选中 indigo 实心，SaaS 选中白底——与两侧栏又不完全同构。  
   - 好：同一控件三处同构（segmented control：选中白底 + 细 inset 或统一 indigo soft fill）；去掉侧栏底部重复 CTA 或降为文字链。

### P1

4. **字号下限过低（光学/可读性）**  
   - `text-[9px]` 出现于 `AgentShell` 筛选计数、`AgentSessionWorkspace` HITL 原因、`CaseDetail`/`Docket` 标签、`ResearchFlow` 命中角标、`InsightDataBanner` 等。  
   - `text-[10px]` 全仓高频（AgentSessionWorkspace 23、CaseDetail 14、AgentShell 11…）。  
   - 好坏：正文 ≥12–13px；辅助 ≥11px；计数用 `tabular-nums` + ≥10px；禁止 9px 交互文案。

5. **卡片圆角/阴影未同心统一**  
   - `soft-card`/`panelCls`：`rounded-2xl`（1rem）+ 双层轻阴影。  
   - 大量页面混用 `rounded-xl` 外卡 + `rounded-lg` 内块 + 偶发 `shadow-lg`/`shadow-2xl`/`shadow-xl`（toast、模态）。  
   - Dashboard 同页 KPI `soft-card rounded-2xl` 与下方 `rounded-xl border` 并存。  
   - 好坏：外层 16px、内层 12px、控件 10px；阴影仅 2 档（rest / elevated modal）；去掉装饰性 `shadow-md` hover 堆叠。

6. **Sticky + backdrop-blur 材质堆叠**  
   - `Dashboard` header、`Pipeline` header、`CaseHeaderBar`（`FlowChrome`）、`TenantBanner` 均 `backdrop-blur` + 半透明。  
   - Case 工作流：`DeadlineBanner`（非 sticky）+ sticky `CaseHeaderBar`，信息重复（期限 chip 再次出现）。  
   - 好坏：每视口最多 1 层 sticky 材质；期限只在一处；blur 仅用于真正叠在滚动内容上的条。

7. **状态色系统碎片化**  
   - 有局部规范：`RiskBadge`、`utils/deadline` urgency、`HandoffChip`、Agent `STATUS_DOT`。  
   - Billing/InventorPortal/WorkbenchHome 自建 `STATUS_STYLE`/`priorityColor`；Agent 步骤又一套 violet/sky/cyan/amber。  
   - 好坏：单一 `statusTokens`（success/warn/critical/info/neutral + handoff 映射）；禁止页内再发明玫瑰/琥珀组合。

8. **焦点环不一致**  
   - 好：`focus-ring` / `focus-visible:outline-indigo-*`。  
   - 缺口：`CaseLibrary` 搜索/筛选 `outline-none` 且无 ring；`AgentHome`/`AgentSessionWorkspace` composer `outline-none` 依赖父级 `focus-within`（尚可）但 AgentShell 顶栏 `<select>` 无可见焦点；部分 Insight/Agencies 按钮无 focus-visible。

### P2

9. **Workspace 下拉无空间进入/退出一致性**  
   - `Sidebar`/`AgentShell`：`wsOpen` 条件渲染，无 transform-origin、无 exit，点外部不关（仅再点按钮或选一项）。  
   - 好坏：从触发器 origin 缩放淡入；Escape/outside 关闭；reduce 时无动画。

10. **装饰噪声 / 层级冗余**  
    - Dashboard：Agent 运行块 + 紧急期限 + 洞察 pill + KPI 五行 + 披露审批 + 图表 + 快捷入口……首屏 chrome 过重。  
    - CaseDetail：HeaderBar 已含期限/交接/模式，下方再栅格「下一官方期限/交接/模式/对手方」重复。  
    - AgentShell 左栏：状态 chip 一行 + Agent chip 一行 + 会话列表，过滤器视觉权重 > 会话内容。  
    - 好坏：一屏一主任务；重复元数据折叠；过滤器默认收起或单行。

11. **字体栈偏「办公」而非光学系统字体**  
    - `body`：`PingFang SC, Noto Sans SC, Microsoft YaHei, system-ui, -apple-system`——YaHei 优先于 Apple 系统栈在部分环境会变钝。  
    - 已有：`antialiased`、`text-balance` on h1–h3。  
    - 缺：数字场景统一 `tabular-nums`（金额/期限已有部分）；标题 tracking 未分层（仅 Sidebar logo `tracking-wide`）。

12. **Legacy Agent 路由仍可达**  
    - `App.tsx`：`/legacy/agents*` 挂在 SaaS `Layout` 下；`/agents` 已 redirect。  
    - 侧栏无链，但深链仍进旧 UI（密度/阴影另一套），破坏产品感。  
    - 好坏：legacy 仅 redirect 或打「deprecated」水印；审计范围外可删。

---

## 分入口清单

### 作业中台

| 表面 | 问题 | 好坏标准 |
|------|------|----------|
| **Layout** | 干净；main 有 focus-visible ring。无页面切换空间动效（可接受 CSS 诚实限制）。 | 保持；勿加全页 fade。 |
| **Sidebar** | 四段导航（中台/洞察/工作台/更多）过长；`text-[10px]` 分区标题；企业/代理 **未 trim**「代理所市场」等（agency 仍见 Agencies）；产品切换与底栏 Bot CTA 重复；active = inset indigo 条尚可。 | 按 `workspace.kind` 裁剪 nav（agency 藏 `/agencies` 或改文案；自助场景弱化派单）；分区标题 11px；去掉底栏重复切换。 |
| **Dashboard** | sticky blur header；CTA 过多（期限/Agent/工作台/派单）；KPI stagger 好；披露行内按钮缺 btn-press；`mb-6`+`mb-8` 重复 class。 | 主 CTA ≤2；次要收入「更多」；统一 soft-card；修重复 margin。 |
| **Pipeline** | sticky blur；卡片 `card-hover`+`btn-press` 较好。 | 与 Dashboard sticky 策略对齐（同高、同材质）。 |
| **CaseLibrary** | 筛选 `outline-none` 无替代环；密度尚可。 | focus ring；结果数字 `tabular-nums`。 |
| **CaseDetail** | 重页：toast fixed、派单 modal（a11y 较好）、HeaderBar 与下方 KPI 栅格信息重复、多块 `rounded-2xl`+审计/期限/清单；`text-[9px]` 标签；部分发票按钮无 btn-press。 | 删重复元数据条；清单/审计用更少 chip；主操作收进 HeaderBar CTA。 |
| **Docket** | toast + modal 规范；日历卡 `text-[9px]`；`scrollIntoView` smooth 无视 reduce。 | 字号抬升；reduce → `auto`。 |
| **Monitor** | KPI `tabular-nums` 好；卡片样式普通。 | 对齐 soft-card；状态用统一 token。 |
| **Billing** | 页签 + 开关动效未进 reduce；台账 `text-[10px]` 操作钮。 | reduce 关 thumb 位移动画；操作 ≥11px + btn-press。 |
| **Agencies** | modal OK；主按钮多无 btn-press；企业专属却始终在侧栏。 | 补反馈；nav trim。 |
| **Insight\*** | 页头琥珀 pill 套路重复；主 CTA 无 btn-press；Layout 矩阵 modal blur 克制尚可。 | 统一页头组件；补 press；减少每页「示意」pill。 |
| **DataStrategy** | `text-[10px]` 标签海；shadow-sm 卡。 | 抬字号；用 panelCls。 |
| **OrgSettings / Settings** | Settings 卡片 card-hover 好；Org 主按钮无 btn-press。 | 统一按钮 primitive。 |
| **InventorPortal** | 表单 focus ring 尚可；提交 CTA 无 btn-press；状态 `text-[10px]`。 | 与中台按钮同一套。 |

### 业务工作台

| 表面 | 问题 | 好坏标准 |
|------|------|----------|
| **WorkbenchHome** | header 无 sticky（与 Dashboard 不一致）；「切换工作区」链无 btn-press；待办行 card-hover 好；priority 色本地定义。 | 页头模式与中台统一；颜色走 token。 |
| **FlowChrome** | `btnPrimary/Ghost/Success`+`panelCls` 是全仓最佳 primitive；`CaseHeaderBar` sticky blur + 信息过满；`Stepper` 标签 10px；`ToastBanner` 无进入动画（可接受）；`Field` hint 10px。 | 精简 HeaderBar 第二行；Stepper ≥11px；Toast 可选短 fade（尊重 reduce）。 |
| **ResearchFlow** | Stepper+SplitDraft 结构清晰；命中卡 `text-[9px]`；slider-pulse 有 reduce；连续反馈（勾选→滑条/结论）符合 lens 7。 | 保持交互闭环；抬角标字号；步骤切换可加短 opacity（非 spring）。 |
| **Draft / Prosecution / Intake…** | 复用 FlowChrome，整体优于中台散页；Prosecution 有 `tabular-nums`；Draft 进度条 `transition-all` 未进 reduce。 | 进度条纳入 reduce；避免每 flow 再堆 banner。 |
| **HandoffChrome bits** | `HandoffActionBar` 清单 chip 密；`window.prompt` 退回批注（非 UI 层，体验突兀）。 | 清单改 checkbox 列表；批注用 inline sheet 而非 prompt。 |

### 多入口（登录/产品切换/发明人/租户）

| 表面 | 问题 | 好坏标准 |
|------|------|----------|
| **Login** | 双产品 segmented + 三租户卡清晰；选中态与壳内不一致；logo `shadow-lg shadow-indigo-200` 略营销腔；卡 `card-hover`+`btn-press` 双绑定 OK。 | 切换器与 Sidebar/AgentShell 同构；阴影降为 soft-card 级。 |
| **产品切换 SaaS↔Agent** | 三处视觉语言分裂（见 P0-3）；Agent 顶栏占位 vs SaaS 侧栏占位，空间模型不同（可接受）但控件必须同构。 | 抽 `ProductSwitcher` 单组件。 |
| **InventorPortal** | 挂在中台 Layout 下，发明人仍见完整 IP 侧栏——角色噪音大。 | 独立瘦壳或侧栏仅「交底/状态」；或顶栏模式。 |
| **租户切换** | Sidebar/AgentShell 下拉内容略不同（有无 logo 方块）；无 outside click。 | 同一 `WorkspaceMenu`；补关闭手势。 |
| **Agency vs Enterprise nav** | Dashboard CTA 有 role 分支；**Sidebar.otherNav 无 trim**。 | agency 隐藏派单市场或改为「我的档案」；enterprise 强调 Agencies/Inventor。 |

### IP Agent

| 表面 | 问题 | 好坏标准 |
|------|------|----------|
| **AgentShell** | Cursor 式三栏方向对；顶栏 + 左栏过滤器密度过高；`text-[9px]`/`[10px]` 导航与 chip；会话 active 用 ring，与 SaaS inset 条不一致；产品切换实心 indigo。 | 过滤器折叠；nav 用 11–12px；active 与 SaaS 统一语言。 |
| **AgentHome** | Composer 阴影略重（`0_8px_24px`）；快捷 pill 多色（violet/amber）；HITL 角标 9px。 | 单层轻阴影；快捷中性边框 + 一色强调。 |
| **AgentCatalog / Skills / HarnessOverview** | 卡面信息标签 10px 堆叠；Harness 9px amber pill。 | 减少 uppercase 微标签；一门面一主按钮。 |
| **AgentSessionsList** | 相对克制。 | 对齐会话行与 Shell 列表组件。 |
| **AgentSessionWorkspace** | 重页：顶栏多 CTA（试运行/正式/一键演示）+ 路由建议条 + 闸门 chip + 流式区 + HITL 底栏 + composer；`animate-pulse`；smooth scroll；右栏产物 `text-[10px]` mono；HITL 禁用原因 9px。 | 演示入口降级菜单；闸门与 HITL 合并视觉；pulse/scroll 遵 reduce；composer 保持 focus-within。 |
| **legacy /agents** | redirect 到新壳；`/legacy/agents*` 仍渲染旧 console（另一套 blur/密度）。 | 默认勿链；最终删除或 redirect。 |

### 全局（index.css / btn-press / type / focus / reduced-motion）

| 项 | 现状 | 建议 |
|----|------|------|
| **btn-press** | 定义正确（短时长 + ease out） | 提升为按钮默认 class；禁止裸主色钮 |
| **card-hover** | 1px 位移 + 轻阴影，克制 | 保持；勿加大位移 |
| **icon-btn** | hover 放大 1.08 略「玩具」 | 改为亮度/背景变化，active 再 scale |
| **focus** | `.focus-ring`/`.focus-row`/`skip-link` 齐全 | 扫 `outline-none` 补环 |
| **reduced-motion** | 部分 | 扩到 pulse、smooth scroll、ProgressBar、Billing toggle |
| **typography** | balance + antialiased | 淘汰 9px；建立 type ramp（display/title/body/caption） |
| **materials** | soft-card 克制 | 限制 backdrop-blur 使用点 |

---

## 建议优化顺序（可执行 8–12 条，标优先级）

1. **P0 · 抽出 `ProductSwitcher` + 统一 Login/Sidebar/AgentShell 选中态**（去 Sidebar 底栏重复 Bot CTA）。  
2. **P0 · 全仓主按钮补 `btn-press`（或 `Button` primitive）**——先扫 Insight*/Agencies/Inventor/OrgSettings/Dashboard 内联钮。  
3. **P0 · 扩展 `prefers-reduced-motion`**：`animate-pulse`、`scrollIntoView` 分支、`ProgressBar`/`Billing` toggle。  
4. **P1 · Type ramp**：禁止 `text-[9px]`；caption 统一 `text-[11px]`；金额/日期强制 `tabular-nums`。  
5. **P1 · 卡片 token**：外 `rounded-2xl`+`soft-card`/`panelCls`，内 `rounded-xl`；toast/modal 仅用 elevated 阴影档。  
6. **P1 · CaseDetail + CaseHeaderBar 去重**：删下方重复元数据栅格或改为可折叠「详情」。  
7. **P1 · Sidebar 按租户 trim** + Inventor 瘦导航（或独立壳）。  
8. **P1 · 状态色 `statusTokens` 收敛**（Risk/Handoff/Deadline/Billing/Agent STATUS_DOT）。  
9. **P1 · AgentShell 左栏过滤器降噪**（默认只留状态一段；Agent 筛选进菜单）。  
10. **P2 · AgentSessionWorkspace 顶栏 CTA 收敛**（「一键等效演示」进 ⋯ 菜单）。  
11. **P2 · Workspace 下拉**：outside click + Escape + 短 scale 从触发器 origin（CSS only）。  
12. **P2 · Dashboard 首屏信息架构**：紧急事项 + 一行 KPI + 一个主 CTA；其余下移。

---

## 明确不做（可选）

- **不上真 spring 库**（Motion/React Spring 大改造）——现有 cubic-bezier 短过渡足够；文档化「CSS 诚实限制」即可。  
- **不做全站玻璃拟态**——维持少量 sticky blur，禁止卡片普遍 `backdrop-blur`。  
- **不重做双产品信息架构**（中台表单 vs Agent 会话）——只统一切换控件与状态语言。  
- **不写视觉回归 CI / 完整 SR 脚本**（见既有 `A11Y_NOTES.md` 未做项）。  
- **不删除领域功能换「空旷大留白」**——克制 = 去重复与微字号，不是删闸门/HITL。  
- **Legacy `/legacy/agents` 大清理**可另开任务，非本轮 Apple UI 必做。

---

## 证据摘录（审计时核对）

- 全局动效与 reduce：`src/index.css` L44–162  
- 产品切换不对称：`Sidebar.tsx` L113–133 vs `AgentShell.tsx` L212–227 vs `Login.tsx` L35–59  
- 重页：`CaseDetail.tsx`、`AgentSessionWorkspace.tsx`、`FlowChrome.tsx` `CaseHeaderBar`  
- 微字号重灾区：`AgentSessionWorkspace.tsx`、`AgentShell.tsx`、`CaseDetail.tsx`  
- 缺 btn-press 主钮：Insight* / Agencies / InventorPortal / OrgSettings  
- Legacy：`App.tsx` L152–157  

*审计日期：2026-09-11 · 只读扫描，无代码变更（本文件除外）。*


---

## 已落地（2026-09-11）

对照本审计 backlog 的 UI/IA 落地，业务 Command / 双产品 / 租户隔离未改语义。

1. **设计 token（`src/index.css` + `@theme`）**  
   字阶 12/13/15/17/22；`--radius-sm/md/lg/xl`；两档阴影 `--shadow-rest` / `--shadow-elevated`；状态色 pending/risk/deadline；`.btn-press` active `scale(0.96)`；`.icon-btn` hover ≈1.04；`.sticky-chrome` + `prefers-reduced-transparency`；保留 `prefers-reduced-motion`（含 toast/menu/pulse）；`p { text-wrap: pretty }`。

2. **全局 btn-press**  
   Dashboard 披露钮、Insight*/Agencies/Inventor/OrgSettings 主 CTA、CaseDetail 发票操作等补齐 `btn-press` + `focus-ring`。FlowChrome `btnPrimary/Ghost/Success` 原已覆盖交接条。

3. **共享组件**  
   `ProductSwitcher.tsx`、`WorkspaceMenu.tsx` — 用于 Sidebar、AgentShell、Login（选中态统一白底 soft shadow）。

4. **SaaS Sidebar**  
   「洞察」默认折叠（localStorage 记忆）；去掉底栏重复「切换到 IP Agent」；侧栏 `bg-white/80` blur；分区标题 ≥12px；agency 隐藏「代理所市场」。

5. **Dashboard 首屏**  
   三决策卡优先：待我处理 / 期限压力 / 活跃 Agent；原 KPI 与健康度等下移保留。

6. **CaseDetail Tabs**  
   概览 | 交接 | 费用 | 审计；默认概览。

7. **FlowChrome**  
   `CaseHeaderBar` 默认同行摘要（标题/阶段/期限 chip/交接），「详情」展开 RACI/版本/委托；`.sticky-chrome`；`ToastBanner` 轻 opacity 进入。

8. **Agent 克制**  
   AgentHome：主任务 = 目标 composer；架构降为次级链接；洞察快捷折叠；快捷 Agent 中性边框。Harness「架构」进左栏「更多」溢出菜单。AgentShell：状态分段控件；Agent 筛选改为 select；会话右栏默认折叠。

9. **Legacy**  
   `/legacy/agents/*` → `/agent` 等价路由 redirect；侧栏无 legacy 链。

10. **InventorPortal**  
    顶栏「交底入口」+ 链回中台案件。

11. **Toast**  
    `.toast-enter` 短淡入（尊重 reduced-motion）。


12. **第二轮 UI 抛光（typography / radii / filters / a11y motion）**  
    - 字号：高可见 UI chrome 抬至 `text-xs`（≥12px）；全仓禁 `text-[9px]`（含 Docket / Research / Insight banner / Harness）。  
    - 同心圆角：`.nest-card` / `.nest-inset`；Pipeline / soft-card 子卡、FlowChrome 展开区对齐。  
    - Workbench `FormBlocks.tsx`：`WbSection` / `WbField` / `WbError`，已用于 Research / Draft / Intake / Prosecution 关键块。  
    - Pipeline / CaseLibrary：分段 chip 筛选 + 计数；`sticky-chrome` 页头；CaseLibrary 补 focus-ring。  
    - Insight 主 CTA 加重（indigo filled + shadow-rest + btn-press）。  
    - 中台 Monitor 导航/页题「风险总览」；工作台「监控办理」（路由不变）。  
    - WorkbenchHome 阶段卡与 Agent 快捷卡统一 soft-card / shadow-rest。  
    - 材质：Dashboard 等 elevated 卡优先 `shadow-rest`；Pipeline/CaseLibrary sticky-chrome。  
    - reduced-motion：ProgressBar / Draft 进度 `.motion-progress`；Billing 开关 `.toggle-thumb`；`scrollIntoView`（Docket / AgentSession / AgentRunConsole）分支；`animate-pulse` 已覆盖。  
    - CaseDetail 概览下去重期限/交接/模式 meta 栅格（保留 HeaderBar）。  
    - InventorPortal：`/inventor` 侧栏精简为交底入口 + 案件库/设置。  
    - AgentSessionWorkspace：「一键等效演示」进 ⋯ 菜单；HITL 打开时闸门 chip 并入 HITL 条。  
    - HandoffActionBar：退回批注改 inline textarea（去 `window.prompt`）。  
    - WorkspaceMenu：outside click + Escape（既有）。状态色：RiskBadge / deadline / HandoffChip 接 status CSS vars。字体栈已 `-apple-system` 优先。

---

## 使用习惯

目标：每个关键屏回答 **我在哪？下一步？如何切换上下文？**（不改大视觉、不引入 Motion、不破 Command API / 双产品 / 租户）。

### 已落地

1. **共享 `PageHeader`**（`src/components/PageHeader.tsx`）  
   标题 + 一行上下文 + 一个主下一步 + 可选次要。已用于：Pipeline、CaseLibrary、Docket、Monitor、Billing、Agencies、WorkbenchHome、InsightTracks、AgentSessionsList。其他 Insight 页仅加轻量 wayfind 文案。

2. **继续上次（localStorage）**（`src/utils/lastVisited.ts`）  
   - CaseDetail / AgentSessionWorkspace 挂载时写入 `last-case-id` / `last-agent-session-id`  
   - Dashboard、AgentHome 在有记录时展示「继续办理 / 继续会话」

3. **空态 / 零结果 CTA**  
   CaseLibrary、Pipeline、Agent 会话列表（页 + 侧栏）、Docket：清除筛选或去工作台 / Agent。

4. **双产品互链**  
   - CaseDetail 固定成对：**在工作台办理** + **用 Agent 处理**  
   - Agent 会话顶栏：**回中台案件**（无案则回案件库）  
   - FlowChrome：调研 / OA / 撰写阶段显示 **用 Agent 协助**

5. **CaseLibrary 习惯**  
   筛选写入 localStorage；无记忆时默认偏向「待处理」（有则优先）；搜索框 **Enter 应用**；控件补 aria-label。

6. **工作台提交成功 Toast「下一步」**  
   Research / Draft / Prosecution：`ToastBanner` 成功后提供 **去立项 / 去期限 / 回案件**（约 8s）。

7. **Agent**  
   新建会话标题优先带案件名；企业「请你确认」按钮顺序 **批准先于授权**（授权在未批准时降为次按钮）；会话行 / 侧栏行 **≥44px** 点击热区。文案避免 HITL 行话，改用「待你确认 / 请你确认 / 确认步骤」。

8. **发明人交底提交后**  
   Toast 提供 **查看状态** / **回案件库**。

9. **弱文案 → 动词+宾语**  
   如「新建」→「新建任务会话」、「退回」→「退回上一阶段」、「进入业务办理」→「在工作台办理」等。

### 验收提示

- `npm run build` 通过；`vite` 监听 `0.0.0.0:5173`  
- 中文 UI；无用户截图要求

---

## 第三轮评估（Apple UI + 使用习惯之后 · 2026-09-11）

对照旅程：Login → SaaS Dashboard → Case → Workbench → back；Login → Agent → session → HITL → back；Inventor 交底；Agency vs Enterprise nav/禁用清晰度。

### 评分

| 维度 | 分 | 一句话 |
|------|----|--------|
| **布局/UI** | **8.4**/10（评前 8.0 → 落地后） | PageHeader 覆盖 Insight/Settings；Dashboard 主 CTA 收敛；窄屏 Agent 左栏可换行 |
| **使用习惯** | **8.3**/10（评前 7.0 → 落地后） | 全工作台成功「下一步」；案件库整行进案；流水线待办一键办理；Settings 三枢纽清晰 |
| **三入口一致性** | **8.5**/10（评前 8.0 → 落地后） | 代理禁用可见原因；Agent 启动后焦点落 composer；双产品/租户/Command 未破 |

### 发现的缺口（本轮 backlog）

1. Intake / Maintain / Monetize / Watch 成功 Toast 无「下一步」链（相对 Research 等）。
2. InsightInnovate / Layout / Chain、DataStrategy、Settings、OrgSettings 缺 `PageHeader` + 单一主 CTA。
3. Agent 目录「启动会话」后焦点未落到 composer。
4. Dashboard 顶栏仍有 >2 个主色/强调按钮观感（继续办理/继续会话/Agent）。
5. 代理角色 HITL/交接禁用仅靠 tooltip，可见原因不完整。
6. Settings 枢纽卡片层级弱，组织/商业/数据未突出。
7. AgentShell 窄屏左栏筛选挤压内容。
8. CaseLibrary 仅标题可点，非整行进案件。
9. Pipeline 卡片默认进详情，待办理阶段缺一键进工作台。
10. 局部无障碍：图标按钮缺 aria-label；编辑页 outline-none 残留需核对。

### 已优化（第三轮落地）

1. **A · Toast「下一步」** — Intake / Maintain / Monetize / Watch 对齐 Research 模式（去办理/期限/回案件等，成功约 8s）。
2. **B · PageHeader** — InsightInnovate / InsightLayout / InsightChain / DataStrategy（含 InsightSources）/ Settings / OrgSettings 统一页头 + 一个主 CTA。
3. **C · Agent 焦点** — 目录/首页/新建会话 `navigate(..., { state: { focusComposer: true } })`；会话页 composer `ref.focus()`；首页默认 Agent = Auto。
4. **D · Dashboard CTA** — 仅保留「打开 IP Agent」实心主钮 +「继续办理」次按钮；期限/工作台/派单/继续会话降为文字链。
5. **E · 代理禁用原因** — `HandoffActionBar` 各禁用钮下方可见文案；代理身份说明「批准/授权由企业完成」；Agent HITL 递交阻塞文案强化。
6. **F · Settings 枢纽** — 核心三卡（组织 / 商业 / 数据）+ PageHeader；其余进「更多」。
7. **G · AgentShell 窄布局** — 左栏 `min/max-w`；状态筛选可换行（窄屏 2×2）。
8. **H · CaseLibrary** — 整行可点/键盘 Enter·Space 进案件（`focus-row`）。
9. **I · Pipeline** — 清单未完成或期限 ≤14 天标「待办理」，主点击进工作台 +「一键进入办理」。
10. **J · a11y** — 维持删除钮 aria-label；HITL/交接按钮 aria-label；composer `aria-label`；目录启动会话 aria-label。

*Build：`npm run build` 通过 · Vite `0.0.0.0:5173` · 中文 UI · Command/双产品/租户未改语义。*

---

## 第四轮 · IP Agent P0/P1（2026-09-11）

对照会话管理 / 会话页白话 / 失败与确认反馈。详见 `AGENT_UX.md`。

### 已落地

1. **会话管理** — 搜索（Shell + SessionsList 共享）、重命名、归档（`archived`）+「已归档」筛选；`archiveSession` / `patchSession` 扩展。
2. **会话页白话** — 「预览一下」/「开始办理」；页脚与流式文案软化；待确认时降级运行钮；右栏默认折叠。
3. **未关联案件琥珀条** — 「尚未关联案件，确认后不会写回中台」+ 去选案件。
4. **失败态** — 原因 +「重试」正式办理；种子会话 `sess-failed-1`。
5. **确认成功** — 「中台已更新」+「去看案件」。
6. **Skills / HarnessOverview** — PageHeader 单一主 CTA。
7. **SessionsList** — 整行点击；搜索同步。
8. **换人办理** — 「已换人办理，确认步骤需重来」。

*Build：`npm run build` · Vite `0.0.0.0:5173` · Command/双产品/租户未改语义。*

