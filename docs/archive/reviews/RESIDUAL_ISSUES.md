# 残余问题扫描 · 2026-09-11（R1–R3 之后）

> **Round 4 已落地（2026-09-11）**：P0-1 / P0-2 / P1-1 / P1-2 / P1-3 / P1-5 已修；可选 P2-3（Dashboard summary `focus-ring`）已修。  
> **Round 5 已落地（2026-09-11）**：P1-4 Dashboard 折叠再砍 + Secondary 抽出；P2-2 stub 删除与 Monitor/Stage 内联；P2-1 部分完成（AgentShell → AgentSessionSidebar）。  
> **仍开**：P2-1 余量（Workspace/CaseDetail/Handoff）、P2-4 侧栏、P2-5 Harness、P2-6 Catalog tab、P2-7 卡片圆角/violet、P2-8 注释保留。详见下方条目（已修项标 ✅）。

对照 `OPTIMIZE_NOTES.md` / `EVAL_2026-09-11.md`，对 `/workspace/ip-harness` **只扫描、不改码**。  
范围：作业中台 · SaaS 工作台 · Agent/IP 办理 · 跨产品一致性 · a11y 基础 · 死代码/路由 · 文案 · Monitor/Skills/StageWorkbench 变更后的链接。

---

## 一、R1–R3 落地核验

| 项 | 结果 | 证据摘要 |
|----|------|----------|
| **R1 · 用户可见「IP 办理」命名** | **通过（R4）** | Login / Switcher / Shell / Dashboard / CaseLibrary / CaseDetail / CaseHeader / AgentContext 用户可见文案已统一「IP 办理」。注释与 `activeProduct:'agent'` 保留 — OK。 |
| **R1 · Dashboard 瘦身** | **通过（R5）** | 首屏：主 CTA + KPI + 期限 + 交底 + 租户横幅；活跃会话 `<details>`；二级折叠仅漏斗/洞察链/动态（`DashboardSecondary`）。健康度示意/重点案件等已删。主文件 ~285 行。 |
| **R1 · 企业退回单入口** | **通过** | `VersionPanel` 无「附批注并退回」表单；企业态提示走 `HandoffActionBar`；`onAnnotateSubmit` 仅保留在 props（`@deprecated`）；七流均只传 `caseId`/`handoffKey`。 |
| **R1/R2 · Skills → Catalog** | **通过** | `AgentSkills.tsx` **已删除**；侧栏无「能力」；`/agent/skills`、`/agent/tools` → `/agent/agents`；无死 import。 |
| **R1 · 归档轻撤销** | **通过** | `AgentShell` / `AgentSessionsList` toast「已归档 · {标题}」+「撤销」。 |
| **R2 · FlowChrome 拆分** | **通过** | `FlowChrome.tsx` = 25 行 barrel；实现在 `flow/*`（toast/Deadline/Stepper/CasePicker/CaseHeader/SplitDraft/HandoffActionBar/styles/index）。 |
| **R2 · Monitor → Docket** | **通过** | 侧栏无「风险总览」；`Monitor.tsx` 软重定向 `/docket?focus=risk`；Docket 有风险聚焦条 + 链到「监控办理」。 |
| **R2 · StageWorkbench hub** | **通过** | 始终 `Navigate` 到 workbench 路径；无 `?hub=1` UI；Pipeline 阶段卡「进入办理流程」。 |
| **R3 · Catalog 密度** | **通过** | `AgentCatalogPage` 单列行表 + 实心「开始办理」`cta-work rounded-md`；能力降级为详情折叠摘要。Harness：「会话」/「工具（见目录详情）」/「开始办理」。 |
| **R3 · 主 CTA `rounded-md`** | **通过（R4）** | CaseDetail / Docket / Insight* 主 CTA 已去 `rounded-xl`+抬影；`btnGhost`/`btnSuccess` 已 `rounded-md`。 |
| **附带 · soft-card / Sparkles / indigo 墙** | **通过** | `index.css` 无 `.soft-card`；页内 0 Sparkles；`indigo-` 仅 `workspaces.ts` 租户品牌色（有意）。 |

---

## 二、残余问题（按优先级）

### P0 · 演示叙事仍会被打穿

#### P0-1 · ✅ Round 4 已修 · 跨产品入口「用 Agent」→「IP 办理」
- **错什么**：Switcher / Login / 壳标已统一「IP 办理」，但中台→办理的高频入口仍说 Agent。  
- **哪里**：
  - `src/pages/CaseLibrary.tsx` — secondary CTA「用 Agent 处理」；空态「用 Agent 发起任务」
  - `src/pages/CaseDetail.tsx` — 「更多」菜单「用 Agent 处理」+ `aria-label`
  - `src/components/workbench/flow/CaseHeader.tsx` — 「用 Agent 协助」+ `aria-label` / 注释
- **为何重要**：演示从案件库/详情/工作台跳到产品 B 时，口播「IP 办理」与按钮文案打架，R1 品牌修复在关键路径上未闭环。  
- **建议**：一律改为「用 IP 办理」/「IP 办理协助」/「在 IP 办理发起」（`aria-label` 同步）。

#### P0-2 · ✅ Round 4 已修 · 活动流 / 审计 note 统一「IP 办理」
- **错什么**：Dashboard「最近动态」与案件审计会露出旧称。  
- **哪里**：`src/context/AgentContext.tsx`  
  - `发起 Agent 任务：…`  
  - `Agent 运行 {id} 确认：…`  
  - 旧路径 note：`Agent 控制台批准策略 / 授权递交 / 退回修改`（同文件另有已改的「IP 办理 …」路径，**文件内也不一致**）
- **为何重要**：中台首页动态与「最近领域命令」是对比 `actor` 的演示点；混称削弱「双产品同命令面」故事。  
- **建议**：用户可见 `addActivity` / 写入 note 统一「IP 办理」；代码标识 `actor:'agent'` 保留。

---

### P1 · 明显伤一致性 / 演示质感

#### P1-1 · ✅ Round 4 已修 · 主 CTA `rounded-xl` 泄漏已清
- **错什么**：`.cta-work` 已设 `border-radius: 0.375rem`，但若干主钮另加 `rounded-xl`（Tailwind 覆盖），视觉回到软胶囊。  
- **哪里**：
  - `CaseDetail.tsx` L238「在工作台办理」
  - `Docket.tsx` L478 生成期限确认
  - `InsightLayout.tsx` / `InsightChain.tsx` / `InsightInnovate.tsx` 主 CTA（另带 `shadow-[var(--shadow-rest)]`）
- **为何重要**：高流量中台页与 Agent/PageHeader 圆角不同构；R3 目标未彻底。  
- **建议**：主实心 CTA 去掉 `rounded-xl`/抬影，只保留 `cta-work`（或显式 `rounded-md`）；次要按钮可另议。

#### P1-2 · ✅ Round 4 已修 · `btnGhost` / `btnSuccess` → `rounded-md`
- **错什么**：`flow/styles.ts` 主钮已 md，幽灵/成功钮仍 xl + success 仍带 shadow。  
- **哪里**：`src/components/workbench/flow/styles.ts`；被七条 Flow 大量引用。  
- **为何重要**：同屏主/次按钮圆角打架，工作台仍偏「软」。  
- **建议**：与 `btnPrimary` 对齐 `rounded-md`；success 去软阴影或与 Agent 成功态统一。

#### P1-3 · ✅ Round 4 已修 · Watch「更多」按角色裁剪
- **错什么**：告警行「1 主 + 更多」内仍堆关闭 / 生成调研案 / 升级维权线索。  
- **哪里**：`src/pages/workbench/WatchFlow.tsx`（~L222+）  
- **为何重要**：EVAL 已点名；监控办理演示时认知成本高。  
- **建议**：按角色裁剪（企业：升级/忽略；代理：确认/关闭）；调研案降为次级或详情内。

#### P1-4 · ✅ Round 5 已修 · Dashboard 折叠区仍「博物馆」体量
- **错什么**：首屏已瘦，但展开后仍有健康度 / 洞察入口 / 模式占比 / 漏斗 / 动态 / 重点案件；文件 ~638 行。  
- **哪里**：`src/pages/Dashboard.tsx` 三处 `<details>`  
- **为何重要**：演示若误点展开仍淹没下一动作；维护成本高。  
- **建议**：折叠区内再砍一刀（洞察入口只留链到 `/insight/*`；漏斗/重点案件二选一）；或拆子组件。

#### P1-5 · ✅ Round 4 已修 · Docket 风险条去掉迁移语
- **错什么**：面向用户的提示写「（原「风险总览」入口）」。  
- **哪里**：`src/pages/Docket.tsx` L174  
- **为何重要**：新用户无旧 IA 上下文；像迁移注释漏进 UI。  
- **建议**：改为「仅显示紧急官方期限」之类，去掉「原…」追溯语。

---

### P2 · 工程债 / 密度 / a11y / 死代码

#### P2-1 · 🟡 Round 5 部分 · 大文件未拆
- **错什么**：编排债挡迭代（OPTIMIZE 候补）。  
- **哪里**：`AgentSessionWorkspace.tsx` ~680 · `AgentShell.tsx` ~728 · `Dashboard.tsx` ~638 · `CaseDetail.tsx` ~778 · `HandoffActionBar.tsx` ~446  
- **Round 5**：`AgentShell` 侧栏 → `AgentSessionSidebar.tsx`（Shell ~728→~132）。
- **仍开**：`AgentSessionWorkspace` banner/toolbar、`CaseDetail`、`HandoffActionBar`；Dashboard 已拆 Secondary。
- **建议**：Workspace 已有 session/* 子模块，可继续抽 banner/toolbar。

#### P2-2 · ✅ Round 5 已修 · 遗留 stub 目录噪音
- **错什么**：`src/pages/agents/*` 五个 Navigate stub **未被 App 引用**（App 内联 `<Navigate>`）；`Monitor.tsx` / `StageWorkbench.tsx` 仅为软重定向保留。  
- **Round 5**：已删 `pages/agents/*`；`/monitor` 与 `/stage/:stageId` 内联到 `App.tsx` 并删薄页文件。

#### P2-3 · ✅ Round 4 已修 · Dashboard `<summary>` 补 focus-ring
- **错什么**：三处折叠摘要仅 `cursor-pointer list-none`，无 `focus-ring` / `focus-visible:outline`（CaseDetail「更多」summary 有 focus-ring）。  
- **哪里**：`Dashboard.tsx` L246 / L304 / L514  
- **建议**：补 `focus-ring` 或与 CaseDetail summary 同构。

#### P2-4 · 中台侧栏仍偏长
- **错什么**：主区 + 可折叠洞察 4 项 + 工作台 7 阶段 + 底部设置；演示桌面可接受但扫视成本高。  
- **哪里**：`src/components/Sidebar.tsx`  
- **建议**：洞察默认折叠已有；可考虑工作台阶段默认收起更狠，或「更多」溢入。

#### P2-5 · Harness 仍偏 About
- **错什么**：积木条已改文案，但仍是架构说明页。  
- **哪里**：`AgentHarnessOverview.tsx`  
- **建议**：压成一段说明 + 办理人列表 + 单一「新建会话」；详细架构外置文档。

#### P2-6 · Catalog `?tab=tools` 未做
- **错什么**：OPTIMIZE 候补；深链只能 `?agent=` / hash。  
- **建议**：若外链需要，落地 `?tab=tools` 时自动展开对应详情；否则从文档去掉该承诺。

#### P2-7 · 卡片层 `rounded-xl` / violet 装饰仍多
- **错什么**：非主 CTA 的卡片/筛选条大量 `rounded-xl`；Docket 案件筛选、CaseDetail「最近领域命令」等用 violet 点缀。  
- **建议**：不强制一刀切；若追求 Apple 审计同构，卡片统一 `rounded-lg`，装饰色收敛到 amber（期限）/ emerald（写回）/ slate。

#### P2-8 · 注释与文档中的「IP Agent」
- **错什么**：`App.tsx` / `commands.ts` / legacy stub 注释仍写 IP Agent — **按 R1 约定可保留**。README 用户可见部分已是「IP 办理」。  
- **建议**：无需改；避免把注释当缺陷重开。

---

## 三、现已 OK（勿再翻案）

- 用户主路径品牌壳：Login、ProductSwitcher、AgentShell 字标「IP 办理」  
- Dashboard 首屏结构（主 CTA + KPI + 期限 + 交底；重块默认折叠）  
- VersionPanel 只读历史 + 企业提示；退回主入口 = HandoffActionBar  
- Skills 文件删除、路由软重定向、侧栏无「能力」、Catalog 单列 +「开始办理」  
- 归档 toast + 撤销  
- FlowChrome extract-and-reexport  
- `/monitor` → `/docket?focus=risk`；StageWorkbench 无 hub UI  
- `.soft-card` 已删；0 Sparkles；indigo 仅租户品牌  
- `.cta-work` / `btnPrimary` / PageHeader / Catalog / Dashboard 顶栏圆角 md  
- Layout / Login / AgentShell skip-link + `#main` / `#agent-main`  
- Pipeline「进入办理流程」直达 workbench（无 `/stage` 薄页停留）

---

## 四、若用户再说「继续」——建议下 3 步

~~1–3 已由 Round 4 完成。~~ · ~~P1-4 / P2-2 / AgentShell 侧栏已由 Round 5 完成。~~

下一轮建议：Workspace banner/toolbar 再拆（P2-1 余量）；或 Harness 压成办理入口（P2-5）；侧栏再压（P2-4）。

---

## 五、扫描方法备忘

- `rg`：`IP Agent`、soft-card、indigo-、Sparkles、`/monitor`、`/agent/skills`、`附批注|onAnnotateSubmit`、`cta-work.*rounded-xl`、`用 Agent`、`已归档|撤销`  
- 通读：Login、Dashboard 头与 details、Sidebar、Docket focus=risk、CaseDetail CTA、WorkbenchHome、WatchFlow 更多、AgentShell 导航、AgentHome、Catalog、SessionWorkspace 头、VersionPanel、FlowChrome barrel、App 路由  
- 未做浏览器截图 / 读屏全量回归
