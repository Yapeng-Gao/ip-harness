# IP Harness · 三产品面评估（R5 后 · 2026-09-11）

评估对象：`/workspace/ip-harness` 前端原型（Rounds 1–5 修复之后）。  
方法：对照 `OPTIMIZE_NOTES.md` / `RESIDUAL_ISSUES.md` / 基线 `EVAL_2026-09-11.md`，**以当前源码核验**（`rg` + 通读关键文件；不照抄旧分）。评分 **1–5**。未做浏览器像素验收。

核验摘要（相对基线已落地）：

| 基线痛点 | R5 后源码 |
|----------|-----------|
| 「IP Agent」用户可见混称 | Login / Switcher / Shell / Dashboard / CaseLibrary / CaseDetail / CaseHeader / AgentContext 活动文案 → **「IP 办理」**；注释与 `activeProduct:'agent'` 保留 |
| Dashboard「看板博物馆」~620 行 | 首屏：主 CTA + KPI + 期限 + 交底；活跃会话 `<details>`；二级 `DashboardSecondary`；主文件 **~285** 行 |
| VersionPanel 双退回 | 企业退回主入口 = `HandoffActionBar`；VersionPanel 只读历史 + 提示 |
| Skills ↔ Catalog | `AgentSkills.tsx` 已删；侧栏无「能力」；`/skills`/`/tools` → `/agent/agents`；Catalog 单列 +「开始办理」 |
| 归档无撤销 | Shell 侧栏 / SessionsList toast「已归档 · …」+「撤销」~5s |
| FlowChrome ~929 上帝组件 | barrel **25** 行；实现在 `flow/*` |
| Monitor / Stage hub | 文件已删；`/monitor`→`/docket?focus=risk`；`/stage/:id` 直达 workbench |
| 主 CTA `rounded-xl` 泄漏 | `.cta-work` + `btnPrimary`/`Ghost`/`Success` + 中台高流量主钮 → **`rounded-md`** |
| 死 stub `pages/agents/*` | 已删；重定向内联 `App.tsx` |

---

## 1. 总表（R5 后）

| 产品面 | 布局 | 页面逻辑 | 业务逻辑 | UI | UX | 均分 |
|--------|------|----------|----------|----|----|------|
| **作业中台** | 4 | 4 | 4 | 4 | 4 | **4.0** |
| **SaaS 工作台** | 5 | 4 | 5 | 5 | 4 | **4.6** |
| **Agent · IP 办理** | 4 | 5 | 5 | 4 | 5 | **4.6** |

跨产品一致性（命名 / CTA 令牌 / 双壳入口）：**4**（基线 **3**）。

三面综合均分 ≈ **4.4**（基线综合 ≈ **3.9**）。

---

## 2. Delta vs `EVAL_2026-09-11`

| 产品面 | 基线均分 | R5 均分 | Δ | 主要变化 |
|--------|----------|---------|---|----------|
| 作业中台 | 3.6 | **4.0** | **+0.4** | 页面逻辑 3→4、UX 3→4（Dashboard 瘦身 + 命名闭环 + Monitor 并入 Docket） |
| SaaS 工作台 | 4.0 | **4.6** | **+0.6** | 布局 4→5、业务 4→5、UI 4→5（FlowChrome 拆分、单退回、按钮圆角同构） |
| Agent · IP 办理 | 4.2 | **4.6** | **+0.4** | 业务 4→5、UX 4→5（Skills 合并、归档撤销、品牌口闭环）；页面逻辑保持 5 |
| 跨产品一致性 | 3 | **4** | **+1** | 用户可见「IP 办理」闭环；主 CTA `rounded-md` 跨壳对齐 |

**分项对照（基线 → R5）**

| | 中台 布局 | 中台 页逻 | 中台 业务 | 中台 UI | 中台 UX | 工作台 布局 | 工作台 页逻 | 工作台 业务 | 工作台 UI | 工作台 UX | Agent 布局 | Agent 页逻 | Agent 业务 | Agent UI | Agent UX |
|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|
| 基线 | 4 | 3 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 4 | 4 | 5 | 4 | 4 | 4 |
| R5 | 4 | **4** | 4 | 4 | **4** | **5** | 4 | **5** | **5** | 4 | 4 | 5 | **5** | 4 | **5** |

未抬分处（诚实）：中台布局仍受侧栏长度 / CaseDetail 体积制约；工作台页面逻辑与 UX 已够强，Watch/Intake 边界等非阻塞残留不值得再抬一分；Agent 布局 / UI 仍被 SessionWorkspace 体积与 Harness About 感拖住。

---

## 3. 作业中台（中台）

范围：Login、Dashboard、Pipeline、CaseLibrary、CaseDetail、Docket、Billing、Sidebar/Layout、ProductSwitcher。**不含** `/workbench/*`。

### 分项要点

- **布局 · 4**：Mail 感侧栏 + skip-link/`#main` 仍在；Dashboard 首屏已可读。扣分：侧栏「主区 + 洞察 4 + 工作台 7 + 设置」扫视成本仍高；CaseDetail ~778 行未拆。
- **页面逻辑 · 4**（↑）：主 CTA「办理 · 最近案件」+ KPI + 期限压力立住；`/monitor`、Stage hub 薄页已消失。扣分：活跃办理会话仍嵌在中台首页（已折叠，边界略糊）。
- **业务逻辑 · 4**：Docket 中国发明期限 + 风险聚焦条；Billing / `dispatchCommand` 共用命令面；租户隔离示意清楚。Monitor 信息重叠已收敛到 Docket。
- **UI · 4**：近黑主色、`cta-work`、列表 `list-row-active`；主钮圆角 md。扣分：卡片层大量 `rounded-xl`；CaseDetail / Docket 仍有 violet 点缀（装饰债，非主 CTA）。
- **UX · 4**（↑）：「IP 办理」口播与按钮一致；习惯路径「待办→工作台 / 期限→Docket」通。扣分：侧栏项偏多；展开二级折叠仍可见漏斗/动态（可接受但非零干扰）。

### 优势（现在）
1. Dashboard 从「博物馆」收敛为「下一动作 + 期限压力」，演示开场不再淹没。  
2. 品牌「IP 办理」在中台→办理跳转（案件库 / 详情 / 空态）已闭环。  
3. 风险总览并入 Docket，IA 少一页噪音。

### 残留弱点
1. **Sidebar 仍偏长** — 洞察可折、工作台可折，但默认扫视菜单仍像「全站地图」。  
2. **CaseDetail 体量大 + violet 命令墙** — CTA 墙已收口，但审计/命令区视觉仍杂。  
3. **卡片圆角 / 装饰色未与主 CTA 令牌同构** — 不影响演示主路径，影响「精致感」收尾。

---

## 4. SaaS 工作台

范围：`/workbench`、WorkbenchHome、七条 Flow、`FlowChrome`/`flow/*`。

### 分项要点

- **布局 · 5**（↑）：`FlowHeader → CasePicker → Stepper → SplitDraft` 统一；FlowChrome 拆为 `flow/*`，改闸门/Toast/交接不再碰上帝文件。
- **页面逻辑 · 4**：Research 空命中、Intake Go/No-Go、Draft 清单、Prosecution Docket 回写、`nextActionsForStage` 纠偏均在。Watch「主钮按角色 + 关闭外置 + 更多降级」已落地。扣分：Intake 报价 vs 费用中台仍靠文案；Maintain 左右栏略空。
- **业务逻辑 · 5**（↑）：`HandoffActionBar` + 动态 `checkedRequired` + **企业退回单入口**（VersionPanel 只读）——全仓最强叙事之一。
- **UI · 5**（↑）：工作台路径无 indigo / 无 soft-card；`btnPrimary`/`Ghost`/`Success` 均 `rounded-md`，与 Agent/PageHeader 同构。
- **UX · 4**：Home「办理首条待办」+ 成功 Toast 下一步习惯清晰。扣分：七流同构后个别短流程略空；`HandoffActionBar` ~446 行仍是改交接的心理负担。

### 优势（现在）
1. 闸门 / 交接 / 版本历史职责清晰，企业退回路径唯一。  
2. FlowChrome 工程债已还清到可迭代粒度。  
3. 主/次按钮令牌与中台、Agent 对齐，不再「软胶囊 vs 硬方钮」打架。

### 残留弱点
1. **HandoffActionBar 仍偏重** — 业务正确，但文件体积挡小改。  
2. **Watch「更多」仍在** — 已按角色裁，但仍是二级动作容器（可接受）。  
3. **短流程 SplitDraft 右栏空** — 观感问题，非逻辑错误。

---

## 5. Agent · IP 办理

范围：`/agent/*` — AgentShell、AgentSessionSidebar、Home、SessionWorkspace、SessionsList、Catalog、HarnessOverview。

### 分项要点

- **布局 · 4**：Shell ~132 行（顶栏 + Outlet）；会话列表抽至 `AgentSessionSidebar`；Mail 窄栏 + 右栏默认关。扣分：侧栏筛选叠层仍高；SessionWorkspace ~680 未再拆 banner/toolbar。
- **页面逻辑 · 5**（持平）：目标→人选/案件→建会话；确认门序、换人清空、无案琥珀条、写回 toast——主闭环仍是三面最完整。
- **业务逻辑 · 5**（↑）：共用 `dispatchCommand`；HITL 差异化；Skills 并入 Catalog 详情；归档轻撤销 toast。
- **UI · 4**：近黑标「IP 办理」、`cta-work rounded-md`、Catalog 单列行表。扣分：Harness 仍偏架构说明页；非主路径卡片圆角未强约束。
- **UX · 5**（↑）：「开始办理」唯一实心；确认态 Composer 降级；品牌与中台口播一致；误触归档可撤销。

### 优势（现在）
1. 会话工作区仍是最强「表单 vs 办理」对比演示点。  
2. Catalog 密度正确：行表 + 实心「开始办理」，能力降为详情折叠。  
3. Shell 拆分后壳层可读，归档撤销降低演示事故率。

### 残留弱点
1. **HarnessOverview 仍像 About** — 积木条文案已改，但仍是说明页而非办理入口。  
2. **SessionWorkspace / CaseDetail 级工程债** — 已有 `session/*`，banner/toolbar 可再抽。  
3. **Catalog `?tab=tools` 未做** — 深链只能 `?agent=` / hash；若不承诺可忽略。

---

## 6. 跨产品一致性 · 4（↑ from 3）

| 维度 | 现状 |
|------|------|
| **命名** | 用户可见路径统一「IP 办理」；代码标识 `agent` / 注释「IP Agent」按约定保留 — **OK** |
| **主 CTA** | `.cta-work` + `rounded-md` 跨 Dashboard / PageHeader / Flow / Catalog / Shell |
| **双壳** | `Layout`+`Sidebar` vs `AgentShell` 有意双产品；ProductSwitcher 分段可用 |
| **命令面** | Form SaaS + IP 办理共用 `dispatchCommand`，演示故事完整 |
| **仍不齐** | 卡片 `rounded-xl`、violet 装饰、中台侧栏密度 vs Agent 窄栏；Harness 说明感 |

---

## 7. 总评（3–5 句）

**可以 demo-ready。** R1–R5 把基线 Top 5（命名、Dashboard 瘦身、双退回、Skills、归档撤销）以及 FlowChrome / Monitor / CTA 圆角等阻塞项基本清掉，三面均分从约 3.9 提到约 4.4，跨产品一致性从 3 到 4。演示主路径——中台看板下一动作 → 工作台闸门交接 → IP 办理会话确认写回——叙事自洽，口播「IP 办理」不再与按钮打架。若还要加投入，优先不在品牌/主 CTA（已够），而在 **密度与维护性**：压 Harness、收中台侧栏、拆剩余大文件；装饰色/卡片圆角属于 polish，不是演示 blockers。

---

## 8. Top 3 剩余机会（仅三条）

1. **Harness → 办理入口**（`AgentHarnessOverview.tsx`）  
   压成一段说明 + 办理人列表 + 单一「新建会话」；架构细节外置文档。演示从「产品说明书」变回「开始办」。

2. **中台侧栏再压一档**（`Sidebar.tsx`）  
   工作台七阶段默认更狠地收起，或溢入「更多」；降低扫视成本，让仪表盘/案件库/期限成为视觉主轴。

3. **大文件余量拆分（择一深做）**  
   `AgentSessionWorkspace` banner/toolbar，或 `CaseDetail` / `HandoffActionBar`；不为美观，为后续改闸门/审计不踩雷。顺带收敛 CaseDetail violet 命令墙可一并做。

（刻意不列：`?tab=tools`、卡片圆角一刀切、深 a11y——ROI 低于上三条。）

---

## 方法备忘

- 源码核验：`rg` 用 Agent / IP Agent / soft-card / Sparkles / cta-work+rounded-xl / 附批注 / 已归档|撤销 / monitor / skills / 风险总览；通读 App、Dashboard(+Secondary)、Sidebar、Docket、CaseLibrary/CaseDetail、flow/*、WatchFlow、VersionPanel、AgentShell、AgentSessionSidebar、Catalog、Home、ProductSwitcher、`index.css` `.cta-work`。  
- 文件体量快照：Dashboard 285 · Secondary 135 · AgentShell 132 · SessionSidebar 613 · FlowChrome 25 · SessionWorkspace 680 · CaseDetail 778 · HandoffActionBar 446。  
- 旧文档中「Dashboard 博物馆 / 双退回 / Skills 重叠 / 命名混用」等**已过期**；本文以 R5 后源码为准。
