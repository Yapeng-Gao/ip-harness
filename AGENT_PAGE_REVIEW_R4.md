# IP Agent 全页评审 R4（P2 + 去 AI 模板味后）

日期：2026-09-11。范围：只读评测 `/workspace/ip-harness` Agent 壳全部页面；**本文件为唯一写入产物**。

对照：`AGENT_PAGE_REVIEW.md` 末节「P2 + 去 AI 模板味」已在源码核验（Shell 筛选单入口、Home 洞察去硬编码、Catalog 搜+空态、Skills 筛+启动、Harness 可启动、Timeline 白话细节、`cta-work` / `flat-card` / `list-row` / `confirm-sheet`、顶栏「IP 办理」、Mail 侧栏）。

评分轴：**页面逻辑 / 布局 / UI / UX**（0–10）+ **是否仍像 AI 模板** + 剩余问题。  
先验均分：**~8.1**（R3 / 上一轮 Page Review）。

---

## 0. 总体：还是 AI-slop 吗？

**诚实结论：主路径已明显不像「ChatGPT 克隆壳」；但仍有可指认的生成味残留。**

| 已去味（看得见） | 仍像生成物的具体点 |
|------------------|-------------------|
| 顶栏「IP 办理」+ 近黑标（`AgentShell.tsx` L237–240），非 indigo 糖果品牌 | 通用 toast 仍 `bg-indigo-50` / `text-indigo-800`（`AgentSessionWorkspace.tsx` L577–586） |
| 主 CTA `.cta-work` slate-900（Home / Catalog / Composer） | 右栏产物选中 `text-indigo-700`（`SessionContextPanel.tsx` L142）；空会话链 `text-indigo-600`（Workspace L210） |
| Home 左对齐「说明要办的事」+ 发丝边输入，非居中 hero（`AgentHome.tsx` L89–172） | 一键建会话目标仍模板句：``请${a.name}处理任务``（Home / Catalog / Harness / Skills 同源） |
| 推荐 / 最近 / Skills / Harness 插件 = **扁平行 + divide**，少 soft-card 叠层 | `SessionContextPanel` 仍大量 `rounded-xl` + `bg-slate-50` 小卡巢（案件/期限/产物/办理记录）— 与侧栏 Mail 扁平行不一致 |
| ConfirmBar：`confirm-sheet` + `border-l-4` 琥珀，无 Sparkles（`SessionConfirmBar.tsx` L48） | Harness「五格图标架构图」仍偏产品介绍页模板（`AgentHarnessOverview.tsx` L98–112） |
| Timeline：默认「查看办理细节」白话；JSON 可选（`SessionTimeline.tsx`） | Catalog 每格满宽「启动会话」墙，仍像 SaaS Agent Directory 模板 |
| 侧栏白底 + `border-r` + 状态点 + inset 左边线（`list-row-active`） | 全局 `focus-ring` / skip-link 仍 indigo（`index.css`）；注释里「filled indigo」与实际 slate CTA 已脱节（`PageHeader.tsx` L8） |

**一句话：**Shell / Home / Composer / Confirm 已像「IP 办理工作台」；Workspace 反馈色与右栏、以及「请某某处理任务」文案，仍是最容易被看出 AI 生成的几处。

**平台均分 ≈ 8.5**（较先验 ~8.1 **+0.4**）。暂无 P0；主流程可演示收口，剩余为 residual 去味与参考页/工程债。

---

## 1. AgentShell · chrome

| 维度 | 分 | 一句话 |
|------|----|--------|
| 页面逻辑 | **8.5** | 新建 / 导航 / 共享 `sessionSearch` / 状态+办理人+归档筛选 / 行菜单重命名归档；顶栏办理人只读且仅会话页。 |
| 布局 | **8.5** | Mail 感窄侧栏（`w-52`/`lg:w-56`）+ 顶栏 + `Outlet`；密度到位。 |
| UI | **8.8** | 「IP 办理」近黑、新建 `bg-slate-900`、文本态「全部\|待确认」、无糖果 pill；`list-row-active` inset slate。 |
| UX | **8.2** | 「筛选」单菜单收敛成功（无「更多筛选」双入口）；激活后仍有进行中/已完成/办理人条，略占高但可接受。 |
| AI 模板感 | **低–中** | 侧栏本身很像真实 Mail/Finder；残：uppercase「会话」、四格导航挤、ProductSwitcher `rounded-xl`。 |

**剩余问题**
- 激活额外筛选时侧栏仍叠一层「清除」条（`AgentShell.tsx` L476–534）— 单入口已好，可再压成一行胶囊。
- 窄屏 aside 常驻无抽屉（演示桌面 OK）。
- 「架构说明 / 全部会话」仍藏「更多」— 可接受。

---

## 2. AgentHome · `/agent`

| 维度 | 分 | 一句话 |
|------|----|--------|
| 页面逻辑 | **9.0** | 目标→人选/案件→建会话；`?case=`、续会话/续案件、洞察用当前/`lastVisited` 并提示选案 — P2 硬编码已死。 |
| 布局 | **8.8** | `max-w-2xl` 左对齐工作台头；输入锚点清晰；推荐/最近扁列表。 |
| UI | **8.8** | 发丝边输入 + `cta-work`；续办改为文字链（非紫/绿芯片）更克制。 |
| UX | **8.5** | 主路径顺；洞察默认折叠；推荐一键仍跳过编辑目标。 |
| AI 模板感 | **低** | 去 hero 成功；残：推荐建会话固定 ``请${a.name}处理任务``（L189）。 |

**剩余问题**
- 推荐行一键 `createSession` 仍偏「目录墙」；更产品化是填 `agentId` + 聚焦 textarea。
- 洞察文案「布局洞察」对非内部用户仍略产品腔（可接受为折叠次要入口）。

---

## 3. AgentCatalogPage · `/agent/agents`

| 维度 | 分 | 一句话 |
|------|----|--------|
| 页面逻辑 | **8.5** | 阶段+关键词筛、EmptyState、`?agent=`/hash 高亮、启动会话 — Top6 P2 齐。 |
| 布局 | **8.5** | 发丝边 2/3 列网格（非 soft-card 堆）；CTA 在详情之上。 |
| UI | **8.3** | 扁网格 + slate CTA；状态仅文字「可用/试用」；详情展开仍干净。 |
| UX | **8.5** | 搜索与空态补齐；标题「目录」对新手仍抽象。 |
| AI 模板感 | **中** | 「每卡一个大启动钮」目录墙仍是典型 AI Agent Catalog；材质已扁，构图仍模板。 |

**剩余问题**
- 满宽 `cta-work` 重复感强 — 可改为行内「启动」或悬停显。
- 详情「能力」与 Skills 页仍重叠（信息架构债）。

---

## 4. AgentSkills · `/agent/skills`

| 维度 | 分 | 一句话 |
|------|----|--------|
| 页面逻辑 | **8.0** | 办理人筛 +「可写中台」+ 启动/深链目录 — 不再只读薄表。 |
| 布局 | **8.0** | PageHeader + 扁平行列表；空态齐全。 |
| UI | **8.0** | divide 列表、次要边框钮「用此办理人启动」；无卡片堆。 |
| UX | **8.0** | 可行动；与 Catalog 能力详情仍高度重叠，独立页价值中等。 |
| AI 模板感 | **低–中** | 列表本身克制；「能力」作为一级导航对终端用户仍偏工程师产品结构。 |

**剩余问题**
- 与目录详情能力块重复 → 长期应合并或降为目录抽屉。
- 主键仍是工具名映射，缺业务场景叙事（演示可接受）。

---

## 5. AgentHarnessOverview · `/agent/harness`

| 维度 | 分 | 一句话 |
|------|----|--------|
| 页面逻辑 | **8.0** | 运行时五块说明 + 插件可启动/深链；出口到目录/能力。 |
| 布局 | **8.3** | 警示条 → 核心格 → 扁列表 → 三列出口清楚。 |
| UI | **8.2** | 去渐变壳；`gap-px` 网格与扁列表一致；启动钮 slate。 |
| UX | **8.0** | 参考页变可行动；仍藏「更多」，日常少达。 |
| AI 模板感 | **中** | 五图标「架构积木」是经典 AI 产品 About 页；文案已白话，构图仍生成味。 |

**剩余问题**
- 插件行「整行启动」+ 右侧「启动」双触点略冗余。
- 教育页与目录信息重叠 — 定位可再收成「一次看懂」短页。

---

## 6. AgentSessionsList · `/agent/sessions`

| 维度 | 分 | 一句话 |
|------|----|--------|
| 页面逻辑 | **8.5** | 共享搜索、重命名、归档、空态双出口；文案标明状态筛在左侧。 |
| 布局 | **8.5** | PageHeader + 工具条 + 发丝边表；列齐全。 |
| UI | **8.7** | 去 soft-card 表容器阴影感，改 `border` 白底；44px 行高。 |
| UX | **8.3** | 整行进入、案件链 stopPropagation；归档仍无确认/撤销。 |
| AI 模板感 | **低** | 管理表很「中台」；残：PageHeader 双 CTA 套路（可接受）。 |

**剩余问题**
- 归档误触：轻确认或「已归档 · 撤销」toast。
- 「已归档」钮与侧栏筛选归档语义略分叉（列表含归档 vs 侧栏只看归档）。

---

## 7. AgentSessionWorkspace · `/agent/sessions/:id`

| 维度 | 分 | 一句话 |
|------|----|--------|
| 页面逻辑 | **9.0** | 横幅互斥、确认门角色序、换人清空门+内联确认、写回 toast、失败重试、无案提示 — 主闭环仍最强。 |
| 布局 | **8.5** | 顶栏 / Timeline / ConfirmBar / Composer / 右栏；右栏默认关。 |
| UI | **8.3** | Timeline `flat-card`、Confirm `border-l-4`、Composer 发丝边+`cta-work` 好；**toast 与右栏仍 indigo/圆角糖果**。 |
| UX | **8.7** | 「开始办理」唯一实心；确认态 Composer 降级；中台同步翠绿条可点案件/工作台。 |
| AI 模板感 | **中（本轮最高残留）** | 主列已工作台化；反馈层 + ContextPanel 仍露 AI SaaS 色。 |

**组件快评**
- `SessionConfirmBar`：步进单一主色、左琥珀条 ✅  
- `SessionComposer`：发丝边同构 Home、换人内联确认、`cta-work` ✅  
- `SessionTimeline`：白话办理细节 + 原始数据可选 ✅  
- `SessionContextPanel`：**去味未完成** — `rounded-xl` 巢、产物 `indigo-700`、案件卡 `bg-slate-50`

**剩余问题**
- 非同步 toast 仍 indigo 胶囊（L577）— 与「indigo 仅留给产品切换」原则冲突。
- 编排文件仍 ~680 行（工程债）。
- 空会话「返回首页」indigo 链（L210）。

---

## 分页汇总表

| 页面 | 逻辑 | 布局 | UI | UX | 均分 | AI 模板感 |
|------|------|------|----|----|------|-----------|
| AgentShell | 8.5 | 8.5 | 8.8 | 8.2 | **8.5** | 低–中 |
| AgentHome | 9.0 | 8.8 | 8.8 | 8.5 | **8.8** | 低 |
| AgentCatalogPage | 8.5 | 8.5 | 8.3 | 8.5 | **8.5** | 中 |
| AgentSkills | 8.0 | 8.0 | 8.0 | 8.0 | **8.0** | 低–中 |
| AgentHarnessOverview | 8.0 | 8.3 | 8.2 | 8.0 | **8.1** | 中 |
| AgentSessionsList | 8.5 | 8.5 | 8.7 | 8.3 | **8.5** | 低 |
| AgentSessionWorkspace | 9.0 | 8.5 | 8.3 | 8.7 | **8.6** | 中（反馈/右栏） |

**平台页均分 ≈ 8.5**（先验 ~8.1 → **+0.4**）。拉分：Home / Shell / SessionsList；拖后：Skills / Harness（参考页）与 Workspace 的残留 indigo。

---

## Top remaining backlog（≤8）

**暂无 P0。**

1. **P1 · 清掉 Agent 壳残留 indigo 糖果** — Workspace 通用 toast（`AgentSessionWorkspace.tsx` L577+）、空会话链（L210）、ContextPanel 产物选中（`SessionContextPanel.tsx` L142）；对齐「主色 slate、indigo 仅 ProductSwitcher」。
2. **P1 · ContextPanel 扁平行化** — 去掉案件/期限/`details` 的 `rounded-xl` 小卡巢，改发丝边或 divide，与 Mail 侧栏同材质。
3. **P1 · 消灭模板目标句** — Home/Catalog/Harness/Skills 的 ``请${name}处理任务`` 改为填人选+聚焦输入，或更具体默认目标（按 specialty）。
4. **P2 · Catalog 启动墙降密度** — 满宽 CTA → 行尾「启动」/悬停显，减 Agent Directory 模板感。
5. **P2 · Skills ↔ Catalog 能力重叠** — 并入目录详情或侧栏降级「能力」为次要。
6. **P2 · 归档轻确认 / 撤销 toast** — SessionsList + Shell 行菜单。
7. **P2 · Harness 五格图标页再收** — 缩短为一段说明+可点列表，弱化「架构积木」生成味。
8. **P2 · Workspace 再拆顶栏/横幅/toast** — 工程债（~680 行），非体验阻断。

---

## 方法备忘

- 通读：`AgentShell` / `AgentHome` / `AgentCatalogPage` / `AgentSkills` / `AgentHarnessOverview` / `AgentSessionsList` / `AgentSessionWorkspace` + `session/*` + `index.css`（`cta-work` / `flat-card` / `list-row` / `confirm-sheet`）。
- 对照先验 `AGENT_PAGE_REVIEW.md` Top6 与「去 AI 模板味」清单逐项核验落地。
- 未跑浏览器截图；结论基于 P2 后源码结构、类名与交互路径。

---

## 终表 + Top remaining（速览）

| 页 | 均分 | vs 先验 | 仍像 AI？ |
|----|------|---------|-----------|
| Shell | 8.5 | ↑ | 低–中 |
| Home | 8.8 | ↑ | 低 |
| Catalog | 8.5 | ↑ | 中（CTA 墙） |
| Skills | 8.0 | ↑ | 低–中（结构） |
| Harness | 8.1 | ↑ | 中（积木图） |
| SessionsList | 8.5 | ↑ | 低 |
| Workspace | 8.6 | →/微↑ | 中（indigo toast / 右栏） |
| **平台** | **≈8.5** | **~8.1 → +0.4** | **主路径否；残留有** |

**Top remaining：**① 清 indigo toast/右栏选中 ② ContextPanel 去圆角卡巢 ③ 模板目标句 ④ Catalog CTA 降密度。


---

## 已落地（R4 residual · 2026-09-11）

对照本文件 Top remaining ①–④ + Harness 积木：

1. **Indigo 残留** — Workspace 通用 toast 改白底 slate 边；空会话链改 slate 下划线；产物选中改底边 `border-slate-900`；`focus-ring` / skip-link 近黑；成功仍 emerald。Indigo 仅留 ProductSwitcher。
2. **ContextPanel 扁平行** — 去 `rounded-xl` / `bg-slate-50` 卡巢；发丝 `border-b` 分区 + divide 列表，对齐 Mail 侧栏材质。
3. **模板目标句** — `defaultSessionGoal` / `defaultToolSessionGoal`（`data/agents.ts`）；Home / Catalog / Harness / Skills / `createSession`·`startRun` 回退改为「就当前案件开始办理：{specialty}」类白话，无「请某某处理任务」。
4. **Catalog CTA** — 满宽「启动会话」→ 行尾文字「开始」+ 阶段弱提示。
5. **Harness** — 五图标积木格改为安静两列表文字；插件行「开始」同 Catalog 克制。

未动：Skills↔Catalog 合并、归档撤销 toast、Workspace 工程拆分（P2 债）。
