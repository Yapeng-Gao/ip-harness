# 作业中台 + 工作台 · 页面评审

日期：2026-09-11。范围：只读评测 `/workspace/ip-harness` **作业中台（SaaS）+ 业务工作台**（不含 `/agent/*` 产品代码改动）。  
对照：Agent 侧 `AGENT_PAGE_REVIEW_R4.md` 已收口（平台均分 ≈ **8.5**；`cta-work` / `flat-card` / `list-row` / 近黑标 / 主路径去 soft-card 叠层）。  
本文件为唯一写入产物。

评分轴：**页面逻辑 / 布局 / UI / UX**（0–10）+ **AI 模板感**（高/中/低）。

---

## 总评打分（逻辑 / 布局 / UI / UX / 模板感）+ 对比 Agent 已收口状态

| 维度 | SaaS 均分 | Agent R4 | 一句话差距 |
|------|-----------|----------|------------|
| 页面逻辑 | **7.0** | ~8.5 | PageHeader「下一动作」在多数列表页已立住；Dashboard / CaseDetail / Sidebar 仍是「入口墙」，下一动作被淹没。 |
| 布局 | **6.7** | ~8.5 | 中台仍是「宽侧栏 + 多段 soft-card 瀑布」；Agent 已压成 Mail 感窄栏 + 扁平行。 |
| UI | **5.8** | ~8.5 | **最大断崖**：SaaS 仍 indigo 糖果主色（`bg-indigo-600` / `--color-primary-600: #4f46e5`）；Agent 已 slate-900 / `cta-work`。同仓双皮肤。 |
| UX | **6.9** | ~8.2 | 习惯路径（待办→办理、期限→工作台）大体通；Dashboard 双套 KPI、CaseDetail 五枚主 CTA、侧栏 20+ 项使「先做什么」变难。 |
| AI 模板感 | **高** | **低–中** | Agent 去味后，SaaS 仍是典型生成物：soft-card 墙、indigo pill、kpi-stagger、Sparkles、card-in-card、完美等宽网格。 |

**平台综合 ≈ 6.6**（较 Agent **−1.9**）。  
**诚实结论：Agent 主路径已不像 ChatGPT 克隆壳；作业中台 / 工作台仍停在「未去 slop」的上一世代视觉，且与 Agent 共享 `index.css` 时两套主色并存——PageHeader 已 slate，FlowChrome / Sidebar / Dashboard 仍 indigo。**

### 量化对照（源码计数，排除 `agent/` / `agents/`）

| 信号 | SaaS | Agent |
|------|------|-------|
| `indigo-` 命中 | **~371** | **0**（残余已清到可忽略） |
| `soft-card` | **~18** | **~1** |
| `cta-work` / `flat-card` / `list-row` | **0** | 主路径在用 |
| `Sparkles` | Docket / InventorPortal 等 **5** | ConfirmBar 已去 |
| 主 CTA | `FlowChrome.btnPrimary` = `bg-indigo-600`；`PageHeader` = `bg-slate-900` | 统一 `cta-work` / slate-900 |

---

## 分入口摘要表（页 | 均分 | 模板感 | 首要问题）

| 页 | 均分 | 模板感 | 首要问题 |
|----|------|--------|----------|
| Login | **6.8** | **高** | `bg-gradient…to-indigo-50` + 居中 indigo 盾标 soft-card + 三列租户卡 —— 标准 AI SaaS 登录墙。 |
| Layout / Sidebar | **6.4** | **高** | 激活态 `bg-indigo-50` + inset `#4f46e5`；中台/洞察/工作台/更多四段堆叠；底栏「作业中台 · 表单 SaaS」产品腔；与 Agent `list-row-active` slate inset **不同构**。 |
| Dashboard | **5.6** | **高** | 双套 KPI（先 3 卡 `kpi-stagger` soft-card，再 5 卡 soft-card）；「打开 IP Agent」仍 indigo 实心；板块过多（Agent 运行 / 健康度 / 洞察入口 / 漏斗 / 期限 / 动态 / 重点案件）首屏无唯一主任务。 |
| Pipeline | **7.0** | **中高** | 阶段 pill 选中 `bg-indigo-600`；列容器 soft-card；卡内再「去办理」indigo 钮 —— 看板模板味，但筛选+EmptyState 逻辑清晰。 |
| CaseLibrary | **7.5** | **中** | 筛选记忆 + 状态默认启发式好；chip 仍 indigo；表包 soft-card，未用 Agent 发丝边表。 |
| CaseDetail | **6.0** | **高** | `mainCta` 墙：通过闸门 / 退回 / 在工作台办理 / 用 Agent / 打开阶段入口 — 五枚并列，无主次；大量 indigo 信息条。 |
| Docket | **7.3** | **中高** | 期限逻辑与按案筛选好；**主 CTA 带 Sparkles**（用户在 Agent 已明确讨厌）；规则表 soft 阴影大卡。 |
| Monitor | **6.8** | **中** | 静态 alerts 数组 + soft-card KPI；与 Docket / 工作台 Watch 信息重叠，独立页价值中等。 |
| Billing | **7.1** | **中** | 台账/发票路径清楚；选中态 `bg-indigo-50 ring-indigo`；图标色 indigo 糖。 |
| Agencies | **6.8** | **中高** | 市场卡网格 + 满宽 indigo「发起意向」；评级 pill 糖果感。 |
| InsightTracks | **7.0** | **中** | 一键生成调研案好；竞品条 `bg-indigo-500`；三列姊妹入口完美网格。 |
| InsightInnovate | **6.7** | **中** | 示意流完整；卡片材质与 Tracks/Layout 同构复制。 |
| InsightLayout | **6.7** | **中** | 矩阵空格→调研 OK；圆角白卡网格模板。 |
| InsightChain | **6.7** | **中** | 产业链环节监控同构；indigo 强调过多。 |
| DataStrategy | **7.3** | **中** | 模式切换 + 路线图清楚；选中 `text-indigo-700`；设置子页里偏「产品说明页」。 |
| Settings | **6.6** | **高** | `PRIMARY_HUB` 三色 icon soft-card + 下方再 LINKS 卡 —— 设置中心经典 AI hub；占位锚点 `#notify`/`#gates`。 |
| OrgSettings | **7.4** | **低中** | 矩阵/部门可操作；相对克制；仍有 indigo 开关强调。 |
| InventorPortal | **6.4** | **高** | **Sparkles「示意 · 研发交底」**；indigo 状态色 + 提交钮；无 PageHeader 统一下一动作。 |
| WorkbenchHome | **7.6** | **低中** | 待办优先 + PageHeader 主 CTA 指向首条待办；阶段入口网格略模板但可接受。 |
| FlowChrome（共享壳） | **6.5** | **高** | **`btnPrimary`/`btnGhost`/`inputCls`/`Stepper`/`panelCls=soft-card` 全系 indigo** —— 七条流程的视觉源头；与 PageHeader slate **直接冲突**。 |
| Research / Intake / Draft / Prosecution / Maintain / Monetize / Watch | **7.0** | **中** | 步进+交接闸门逻辑扎实；选中 chip / focus outline 全 indigo；`panelCls` soft-card 统一「卡片堆」。 |
| StageWorkbench | **6.5** | **中** | 默认重定向合理；`?hub=1` 薄入口残留，CaseDetail 仍链过去增加 CTA 噪音。 |
| ProductSwitcher / WorkspaceMenu / PageHeader | **7.8** | **低中** | PageHeader 已 slate 主钮（对）；Switcher 分段控件可用；WorkspaceMenu hover 仍 `border-indigo`；Switcher `rounded-xl` 略软。 |
| index.css（SaaS 使用面） | **6.0** | **—** | `--color-primary-*` 仍 indigo；`soft-card`/`kpi-stagger`/`card-hover` 边悬 indigo；Agent 工具类（`cta-work`/`flat-card`/`list-row`）**SaaS 零引用**。 |

---

## P0 / P1 / P2 优化清单（具体到文件）

### P0 — 双产品同构断崖 / 用户最恨的模板味

1. **统一主色与主 CTA（SaaS → Agent 已收口语义）**  
   - `src/components/workbench/FlowChrome.tsx`：`btnPrimary` / `btnGhost` / `inputCls` focus / `Stepper` active 从 indigo → slate（或直接复用 `.cta-work`）。  
   - `src/components/Sidebar.tsx`：`linkClass` 激活态改为 `list-row-active` 同构（`bg-slate-100` + inset `#334155`），去掉 `bg-indigo-50` / `#4f46e5`。  
   - `src/pages/Dashboard.tsx`：顶栏「打开 IP Agent」及各类 `bg-indigo-600` 实心钮 → slate / `cta-work`。  
   - `src/index.css`：`--color-primary-600/500/50` 改为近黑/slate，或 SaaS 停用 primary token 改走 slate 工具类。  
   - `src/pages/Pipeline.tsx` / `CaseLibrary.tsx` / `CaseDetail.tsx` / `Agencies.tsx` / `InventorPortal.tsx`：筛选 pill / 主钮同改。

2. **Dashboard 去「双 KPI + 入口博物馆」** — `src/pages/Dashboard.tsx`  
   - 删除或合并两套 KPI（L144–189 的 3 卡 + L280–308 的 5 卡只留一套，优先「待我处理 / 期限 / 待付款」）。  
   - 去掉 `kpi-stagger` 入场动画（生成感强）。  
   - 洞察三列入口、平台健康度六格、重点案件网格下沉或折叠；首屏只保留：下一动作 + 期限压力 + Agent/会话续办。

3. **CaseDetail CTA 墙收口** — `src/pages/CaseDetail.tsx`  
   - `mainCta` 只留 **1 主（在工作台办理）+ 1 次（通过闸门或按角色）**；「用 Agent」「打开阶段入口」降为文字链或「更多」。  
   - 去掉与 StageWorkbench hub 的重复出口（已有 workbench 深链）。

4. **去掉 Sparkles**  
   - `src/pages/Docket.tsx`（PageHeader primary icon + 生成对话框内 Sparkles）。  
   - `src/pages/InventorPortal.tsx`（「示意 · 研发交底」旁 Sparkles）。

### P1 — 布局层次 / 习惯路径

5. **Sidebar 信息架构减肥** — `src/components/Sidebar.tsx`  
   - 洞察默认折叠已有，但「业务工作台」8 项常驻过长：可默认只留「工作台首页」+ 当前阶段高亮，其余收入折叠。  
   - 底栏产品说明卡改为一行次要文案或删除（Agent 顶栏是「IP 办理」近黑标，中台应对称「作业中台」近黑而非 indigo 交底条）。  
   - `Layout.tsx`：`focus-visible:ring-indigo-400` → slate（与 `focus-ring` 已改 slate 对齐）。

6. **soft-card → 发丝边 / flat**（对齐 Agent）  
   - `FlowChrome.panelCls`、`Pipeline` 列、`CaseLibrary` 表容器、`Monitor` KPI、`Settings` PRIMARY_HUB、`Login` 租户卡：优先 `border` + 白底，少 `shadow-rest` 叠层；禁止 soft-card 内再 nest soft-card（Pipeline 列+卡）。

7. **Login 去渐变英雄** — `src/pages/Login.tsx`  
   - 去掉 `to-indigo-50` 渐变与居中大盾标 soft-card；改为左对齐工作台进入（或极简列表），主行动用 slate。

8. **Docket / InventorPortal 主行动文案**  
   - 「由事件生成期限」可保留，但图标改 Calendar/Plus；InventorPortal 补 PageHeader（标题 +「提交交底」主 CTA）。

### P2 — 打磨与债

9. **Monitor vs Watch vs Docket** 信息重叠 — 考虑 Monitor 降为 Docket 筛选深链或合并告警源（`src/pages/Monitor.tsx`）。  
10. **Settings hub 双层卡** — `src/pages/Settings.tsx`：PRIMARY_HUB + LINKS 合并为一张发丝列表；占位 `#notify`/`#gates` 标明「未实现」或隐藏。  
11. **Insight* 四页同构** — 共享扁列表材质；进度条改 slate；减少「完美三列姊妹导航」重复（可留 Tracks 一处）。  
12. **StageWorkbench** — CaseDetail 不再链 `?hub=1`；或删薄入口只保留重定向。  
13. **WorkspaceMenu / ProductSwitcher** — hover 边框 indigo → slate；与 AgentShell 共用同一触发样式。  
14. **card-hover 边色** — `index.css` `.card-hover:hover { border-color: #c7d2fe }` 改为 slate，避免「悬停变紫」。

---

## 建议落地顺序（≤8 条）

1. **FlowChrome 令牌一刀切**（`btnPrimary` / Stepper / input focus / `panelCls`）→ 七条流程 + CaseHeader 立刻脱 indigo。  
2. **Sidebar 激活态 → `list-row-active` 同构** + Layout focus 改 slate。  
3. **Dashboard 删一套 KPI + 去掉 kpi-stagger + 主 CTA slate**（最大模板感来源）。  
4. **CaseDetail mainCta 收成 1+1**。  
5. **Docket / InventorPortal 去 Sparkles**；InventorPortal 接 PageHeader。  
6. **Login 去渐变/盾标 soft-card**；index.css primary token 与 card-hover 边色改 slate。  
7. **列表页 soft-card 改发丝边**（Pipeline / CaseLibrary / Settings hub）。  
8. **Sidebar 工作台导航折叠** + 清理 StageWorkbench / Monitor 重叠入口。

---

## 与 Agent 视觉不一致处（双产品同构缺口）

| 缺口 | Agent（已收口） | SaaS（现状） | 文件锚点 |
|------|-----------------|--------------|----------|
| 品牌 / 顶栏字标 | 「IP 办理」+ 近黑方标 | 「IP Harness」+ 彩字 logoLetter；底栏 indigo 交底条 | `AgentShell.tsx` vs `Sidebar.tsx` |
| 导航激活 | `list-row-active` slate inset | `bg-indigo-50` + inset `#4f46e5` | 同上 |
| 主 CTA | `.cta-work` / `bg-slate-900` | `bg-indigo-600`（FlowChrome / Dashboard / CaseDetail / Inventor…）；仅 PageHeader 已 slate | `FlowChrome.tsx` L871 vs `PageHeader.tsx` L43 |
| 列表材质 | `flat-card` / divide 行 / 发丝表 | `soft-card` + `shadow-rest` + `card-hover` 抬起 | `index.css`；Dashboard / Pipeline / Settings |
| 焦点环 | `focus-ring` → `#0f172a` | 大量组件仍 `outline-indigo-400` / `ring-indigo-*` | FlowChrome / workbench flows / Layout |
| 主题 token | 实际 CTA 已不依赖 primary | `@theme --color-primary-*` 仍 indigo 糖果 | `index.css` L6–8 |
| 装饰 | Confirm 无 Sparkles | Docket / InventorPortal 用 Sparkles | `Docket.tsx` L6,127；`InventorPortal.tsx` |
| 产品切换文案 | 已「IP 办理」 | 同 Switcher OK，但 Login/Dashboard 仍写「IP Agent」混称 | `ProductSwitcher.tsx` vs `Dashboard.tsx` L117–120 |
| 共享工具类采用率 | 高 | **SaaS 对 `cta-work`/`flat-card`/`list-row` 引用为 0** | 全仓 grep |

**同构优先级一句话：**先让 SaaS **停用 indigo 主 CTA 与 soft-card 墙**，复用 Agent 已验证的 `cta-work` + `list-row-active` + 发丝边，再收 Dashboard / CaseDetail 的入口墙——否则双产品并排演示时，中台会立刻把 Agent「去 slop」成果衬成「两个产品」。

---

## 附：分维速记（供复审）

- **逻辑尚可、视觉拖后腿**：WorkbenchHome、CaseLibrary、Docket、OrgSettings、DataStrategy、各 Flow 闸门。  
- **逻辑与视觉都欠**：Dashboard、CaseDetail CTA、Sidebar 密度、Login、Settings hub、InventorPortal。  
- **Apple 工艺已有底座未贯彻**：`btn-press` / 字阶 / 半径 token / PageHeader sticky-chrome 在中台存在，但被 indigo soft-card 盖过。

---

## 已落地（2026-09-11 执行收口）

对照上文 P0 / 建议落地顺序，作业中台 + SaaS 工作台已与 Agent「IP 办理」视觉令牌对齐。**未改** Command / 双产品切换 / 租户隔离 / 闸门与业务逻辑。

### 主色与 CTA
- `FlowChrome`：`btnPrimary` → `.cta-work`；`btnGhost` / input focus / Stepper 去 indigo；`panelCls` → `flat-card`；CaseHeader sticky 去 soft-card。
- `PageHeader` / `VersionPanel` / Dashboard / CaseDetail / Pipeline / Agencies / Docket / Insight* / OrgSettings / InventorPortal 等主钮统一 `cta-work` 或 `bg-slate-900`。
- `index.css`：`--color-primary-*` 改为 slate 近黑；`.card-hover` 边色 `#cbd5e1`。
- 页面/组件（排除 agent）`indigo-` 糖果主 CTA 已清；**保留**租户品牌色（`workspaces.ts` 中个别 `bg-indigo-600` 作 logo）与 ProductSwitcher 白底选中（本就无 indigo 填充）。

### 材质
- 优先 `flat-card` / `list-row` / 发丝边：Dashboard 指标条、CaseLibrary 表、Pipeline 列、Monitor、Settings hub、WorkbenchHome、FormBlocks、FlowChrome panels。

### Dashboard
- 单一主行动：继续办理 / 进入工作台（`cta-work`）；IP 办理降为文字链。
- 合并为一套三格指标（待我处理 / 期限 / 待付款），去掉 `kpi-stagger` 与第二套五 KPI。
- 平台健康度 · 洞察入口 · 办理模式收入 `<details>` 默认折叠；期限压力列表保留在首屏附近。

### CaseDetail
- CTA 墙收成：**在工作台办理**（主）+ **通过闸门**（次）+ **更多**（退回 / 用 Agent）；去掉「打开阶段入口」重复出口。

### Sparkles
- `Docket` / `InventorPortal` 已移除；期限生成改用 `Plus` 图标。
- `pages/agents/*` 遗留页改为 Navigate stubs，源码内 `Sparkles` 命中归零。

### Sidebar
- Mail 感：白底 + `border-r`；激活态 `list-row-active`（slate inset），无 indigo 阴影。
- 近黑方标「作业中台」；洞察默认折叠；业务工作台阶段可折叠（默认仅首页，当前阶段路由时展开）。
- 底栏改为单行次要文案。

### Login
- 去掉渐变英雄与居中大盾标 soft-card；左对齐近黑标 + 发丝租户列表。

### P1/P2 打磨（同日续 pass）
- **Monitor / Docket / Watch**：风险总览改为告警列表 + 深链（主 CTA「进入监控办理」→ `/workbench/watch`，次 CTA「查看官方期限」→ `/docket`）；去掉三格 KPI；页内文案区分侧栏「风险总览」与工作台「监控办理」。
- **Settings hub**：`PRIMARY_HUB` + `LINKS` 合并为单一 `flat-card` 发丝列表；`#notify` / `#gates` 行标记「未实现」且不可点，去掉双层卡与下方占位大段。
- **Insight* 四页**：共享 `InsightSisterNav` 文字链条（去三等宽卡）；`InsightDataBanner` 默认 compact + 发丝；面板改 `flat-card`；`ProgressBar` 默认色改为 slate `#475569`，轨道 `bg-slate-100`。
- **InventorPortal**：接入 `PageHeader`（标题 + 主 CTA「提交交底」滚至表单）；去掉自定义英雄头。
- **Legacy `pages/agents/*`**：全部改为 `Navigate` 到 `/agent*`（去 Sparkles / indigo 死代码）；路由层原有 redirect 保持。

### 构建
- `npm run build`（`tsc -b && vite build`）通过；Vite `host: 0.0.0.0` port `5173`。
