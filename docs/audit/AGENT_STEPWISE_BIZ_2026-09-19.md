# Agent 逐步业务/呈现审计 · S0–S9

> **口**：`apps/agent` · `:5175` · 分支 `dev` · HEAD `09b220800484c6dae237dba798242dc3f25c8a9f`  
> **日期**：2026-09-19（CST / Asia/Shanghai）  
> **性质**：只评、不派工；**不改**产品码。  
> **范围**：冻结步 **S0–S9**（入口 · 通用单聊/sessions · 案绑定 · 轨迹 · HITL · 顶栏绑案 · 列表筛选 · Catalog · 项目 general · domain/patent）。对齐 `docs/ui-polish/AGENT_STEPWISE_WALK_PLAN_2026-09-19.md`（业务审计视角，静态源码+规格；未强制浏览器点通）。
> **复检**：2026-09-19 · SHA `1b959d6` · P1 通用历史 + P2-S4 无案闸 → **已收** · [`AGENT_STEPWISE_BIZ_RECHECK_2026-09-19.md`](./AGENT_STEPWISE_BIZ_RECHECK_2026-09-19.md)

## 总判

默认落地 `/agent` 通用单聊、不强制建项目、不自动填案——**入口规格大体立住**。案绑定路径（`CaseBindControls` + `mock-case-*` +「未进中台库」文案）对 domain/general 分权重，**诚实度明显好于半成品壳**。S3–S4：mock 剧本推进 + ConfirmBar → `sessionHitlAction` → `dispatchCommand(actor:'agent')` 写库闸可查；试运行/无案不写台账。S5–S7：先聊后案、侧栏分段筛选、Catalog 选 Agent 立住。S8–S9：general / patent 分文件剧本，总控禁一键写库，专利步骤不泄漏进 general。

**呈现债纠偏**：规格 `agent-entry-modes` §7 曾建议壳级「样机 · 无真 LLM」横幅；总控/用户已否决「顶栏全宽样机·无真 LLM 琥珀黄条」（与产品闸冲突，且 `AgentShell` 已卸 `BillingHold` 全宽黄条）。该缺口 **已 Won't**——诚实可用侧栏弱字或 docs；**禁**建议恢复全宽 amber / BillingHold 式黄条。S0 不再因缺横幅标半立。

sessions「通用历史」与无案 HITL 芯片禁用已在 `1b959d6` **收口**（见 [复检短记](./AGENT_STEPWISE_BIZ_RECHECK_2026-09-19.md)）。项目线程与 sessions **两套真相**尚未标签合流（**P2 保留**）。S0–S9 **无 P0**；**不做**真 LLM、真 case-core、恢复全宽黄条。

## 对照规格（方法备忘）

| 规格 | 路径 | blob SHA（本仓） | 内容 SHA256（前 12） |
|------|------|------------------|----------------------|
| 入口模式 | `docs/architecture/product-apps/agent-entry-modes.md` | `d82dc569d93c` | `e1eb00ead2c1` |
| 案绑定 | `docs/architecture/product-apps/agent-case-binding.md` | `13bbe68edf8b` | `db46cfcd6bae` |
| 产品面 HITL | `docs/architecture/product-apps/agent-surface.md` | `4756e7c163e7` | `e1e18e82bfda` |
| 项目文件夹 | `docs/architecture/product-apps/agent-project-folder.md` | `e5824d2d929a` | `799c4528a8de` |
| README / 口播 | `apps/agent/README.md` | — | `35b5af9498ae` |
| 走查计划（步 ID） | `docs/ui-polish/AGENT_STEPWISE_WALK_PLAN_2026-09-19.md` | — | 已读 |
| P0 验收（深链/字体，非本步主据） | `apps/agent/AGENT_P0_ACCEPTANCE.md` | — | 已读 |

**方法**：对照规格静态追 `apps/agent/src` 路由与文案；未做浏览器点通。关键禁用/诚实句以源码字面为准（`data-testid` / 横幅字符串）。共享写库逻辑只读引用 `@ip/app-state` · `playMockSession` / `sessionHitlAction`（非本 app 改动面）。

**明确不做**：真 LLM、真 case-core、改 `apps/**` 产品码、本波派工 Owners、**恢复全宽琥珀黄条 / BillingHold 式壳顶条**。

---

## S0–S9 短表

| 步 | 业务故事 | 屏上 | 代码证据 | 判 | 级 |
|----|----------|------|----------|----|-----|
| **S0** · 进壳默认入口 | 打开 :5175 / `/agent` = **通用单聊**；不强制建项目；案可选空；样机诚实（mock / 无真 LLM） | `/`→`/agent` 居中 Composer+Chip+Catalog；文案「默认通用单聊 · 项目模式（次级）」；案区 soft「可稍后创建或绑定」；**壳顶无**全宽「无真 LLM」黄条（产品闸） | `App.tsx` `/`→`/agent` index=`AgentHome`；`AgentHome.tsx` 无 `resolvePreferredCaseId`、默认 `caseId=''`；`CaseBindControls` soft；`AgentShell.tsx` 注释卸 BillingHold 全宽黄条 | **立得住** | —（呈现债已 **Won't**） |
| **S1** · 通用单聊 / sessions 兼容 | Composer+Catalog；sessions=通用历史；不与项目抢主心智；无案 banner/闸诚实；试运行不写库 | 侧栏主链：开始 / Agent / **会话**；「项目（次级）」藏「更多」；会话顶栏 `no_case`：「无案也可继续聊 · 确认后不会写入案件」；「预览一下」→ Timeline「预览不写库」 | `AgentSessionSidebar.tsx` nav；`SessionWorkspaceHeader.tsx` `activeBanner==='no_case'`；`playMockSession` 默认/`dry-run` 文案「不写入业务台账」；`SessionTimeline.tsx` `toolWriteTag`；`AgentSessionsList.tsx` 钉「通用历史」（`1b959d6`） | **立得住** | —（原 P1 已收；线程合流仍 **P2**） |
| **S2** · 案绑定 | 通用可一直无案；项目区「创建并绑定 / 绑已有」；mock caseId；禁静默真建案；与 mid 关系诚实 | Home/会话 soft；项目顶栏 domain **strong**「写入案件前须绑定」、general soft；创建确认钮「生成 mock 案并绑定」+ 琥珀说明「不进真 case-core / 中台库」；已绑 mock 标「· 样机」；列表新建案可选「可稍后…」 | `CaseBindControls.tsx` + `lib/mockCase.ts` `newMockCaseId`；`addCase` 本地种子 summary 写明非 case-core；`ProjectListPage.tsx` / `ProjectWorkspacePage.tsx` `patchProject`；`ProjectFolderContext` 演示项目 `caseBindState:'none'`；时间线「样机绑定 · 非真 case-core」；**无**「必须先去中台」门禁文案 | **立得住** | —（仅 P2 毛刺） |
| **S3** · 会话轨迹 / mock 推进 | 用户开聊后轨迹与回复可见；mock 剧本逐步推进；预览≠写库 | 工作区 Timeline 逐步追加 system/tool/artifact；「预览」/「正式办理」态可见；工具卡标「预览不写库」或写库标签 | `playMockSession`（`AgentContext`）按 `AGENT_SCRIPTS[agentId]` 定时推进 `scriptIndex`；`SessionTimeline` `toolWriteTag`；`AgentSessionWorkspace` 调 `mode:'dry-run'\|'formal'` | **立得住** | — |
| **S4** · HITL ConfirmBar / 写库闸 | ConfirmBar 可见可点；gate→`dispatchCommand(actor:'agent')`；试运行 vs 正式；无案诚实不写；DomainCommand 唯一写库 | ConfirmBar 闸芯片 + 命令链预览；正式默认逐步写入；无案顶栏 hint「确认后不会写入案件」；pay_unlock 无案直接拒 | `SessionConfirmBar` + `sessionGates.gateToAction` / `previewHitlCommandChain`；`sessionHitlAction`：`if (sess.caseId)` 才跑命令链、`actor:'agent'`；`mode==='formal' && caseId` 才准备领域写入；无案 `pay_unlock`→「请先关联案件…」 | **立得住** | —（原 P2-S4 已收 · `1b959d6`） |
| **S5** · 会话顶栏绑案 · 先聊后案 | 可先聊；区内再绑；不挡入口 | `no_case` 顶栏 hint +「绑定已有案」；Composer / HITL 区 soft `CaseBindControls`；开始办理可 `focusCaseBind` | `SessionWorkspaceHeader` `data-testid=session-no-case-hint`；`AgentSessionWorkspace` 顶区/Composer `caseBindSlot` + `CaseBindControls` soft；`patchSession({caseId})` | **立得住** | — |
| **S6** · 会话列表 + 待确认筛选 | 列表可按全部/待确认/进行中筛；与侧栏同步 | 侧栏 `segmented`：全部 / 待确认 / 进行中；`?filter=needs_human\|running`；列表页随 URL 过滤，H1「通用历史」等（`1b959d6`） | `AgentSessionSidebar` / `AgentSessionsList` | **立得住** | —（原 P1 已收） |
| **S7** · Catalog 选 Agent | `/agent/agents` 选 AgentDef 开通用会话；不强制案 | Catalog 按 tier 分组；点开建会话；案仅显式 picker/URL，无 auto prefer | `App.tsx` `path=agents`→`AgentCatalogPage`；`skills`/`tools`→重定向；`startWith`→`createSession`；注释钉 case-binding | **立得住** | — |
| **S8** · 项目 general | 通用项目：多 bot+总控；**无**专利步骤条 / FTO / 权利要求 HITL 泄漏 | 新建「通用（无专利步骤）」；主区 `通用项目 · 无专利步骤条`；侧栏研究/写作/审查+总控 | `ProjectListPage` kind=general；`expertsGeneral.ts`（`catalogAgentId=null`）；`ProjectChatPane` `data-testid=general-no-patent-steps`（无 `domain-step-bar`）；`ExpertHitlBridge` 无 catalog→弱确认不写 DomainCommand | **立得住** | — |
| **S9** · domain/patent + 专家私聊 | 总控/专家分剧本；专利步骤可区分；总控禁一键写库 | domain/patent 有步骤条；检索/撰稿/FTO 快捷与剧本不同；总控仅分派；HITL 桥脚注「无真 LLM」 | `expertsPatent.ts` 与 general **分文件**；`orchestrator` `domainCommandCandidates.command=null` + guardrail「禁止一键写库」；`ExpertHitlBridge` 绑底层 session→Confirm→DomainCommand；FTO 默认不写案 | **立得住** | — |

### 逐步行判（严厉）

#### S0 · 进壳默认入口 — **立得住**

- **立得住**：路由与 IA 对齐 `agent-entry-modes` §1/§2——默认通用、项目可选次级；`caseId` 默认空，URL `?case=` 仅在种子存在时回填，**禁止**静默 `resolvePreferredCaseId`（源码注释已钉规格）。
- **呈现债（Won't）**：规格 §7 横幅建议未进壳；与产品闸「禁全宽琥珀黄条」冲突，总控/用户已否决恢复。诚实侧改走侧栏弱字 / docs / 项目 HITL 脚注——**不再**把缺横幅记为 Must/P1。
- **级**：—（Won't，见缺口清单）。

#### S1 · 通用单聊 / sessions — **半立**

- **立得住**：侧栏把项目标「次级」；无案横幅与「无案确认不会写入案件」一致；dry-run / 预览路径明确不 `dispatchCommand`（`playMockSession`：`mode==='formal' && caseId` 才准备领域写入叙事；HITL `if (sess.caseId)` 才跑命令链）。
- **半立**：`AgentSessionsList` 仍叫「全部会话」，规格 §4 主心智是「通用历史」——和项目文件夹并列感虽被导航压住，**文案未钉死**。项目 1:1 线程在 `ProjectFolderContext`，**未**按规格「sessions 列表标签过滤」合流——两套真相并存（可接受为样机债，须记账）。
- **级**：列表心智 P1；线程合流 P2。

#### S2 · 案绑定 — **立得住**

- **立得住**：创建路径强制走 UI「生成 mock 案并绑定」；id=`mock-case-<ts>`；本地 `addCase` 摘要自证「未进中台库 / 非真 case-core」；绑已有走 `visibleCases` 下拉；解除绑定清 `caseId`。domain strong / general soft 与「写回须绑」叙事匹配。演示项目种子无案。与 mid：**引用本地/种子案，不声称第二套权威库**；无「先去中台再建聊」闸。
- **毛刺**：`CaseBindState` 含 `pending_create`，`caseBindStateFromId` 只映射 `none|bound`——类型超前、UI 未用（P2）。创建案**未**走 Confirm→DomainCommand（规格写「可选」）——样机可接受，但别在口播里吹成「已过 HITL 建案」。

#### S3 · 会话轨迹 / mock 剧本推进 — **立得住**

- **立得住**：`playMockSession` 按当前 Agent 的 `AGENT_SCRIPTS` 推进，Timeline 可见回复/工具/产物；重启剧本有 system 步标注「预览」或「正式执行」。工具成功≠写库——`toolWriteTag` 在 dry-run 标「预览不写库」。
- **不做**：真 LLM 流式；本步只评 mock 可见性。
- **级**：—。

#### S4 · HITL ConfirmBar · 写库唯一入口 — **立得住**

- **立得住**：`SessionConfirmBar` 展示闸与 `previewHitlCommandChain`；点击走 `gateToAction` → `sessionHitlAction` →（有案时）`dispatchCommand(..., { actor:'agent' })`。正式 vs 试运行：`runMode` 影响逐步写入默认与 Timeline 文案；dry-run / 无 `caseId` **不**进领域命令链。`pay_unlock` 无案硬拒。写库叙事与 `agent-surface`「禁直写库」一致。
- **毛刺**：无案时多数闸**未**芯片级 `disabled`，仍可点并清 `clearedGates`——诚实主要靠顶栏 hint + 跳过 `dispatchCommand`，而非「禁用」字面。记 **P2**，不升 P1（无静默真写）。
- **级**：P2（无案禁用呈现）。

#### S5 · 会话顶栏绑案 · 先聊后案 — **立得住**

- **立得住**：对齐 `agent-case-binding`——先进会话、案可选。顶栏 `no_case` hint +「绑定已有案」；`CaseBindControls` soft 挂在 HITL 顶区或 Composer `caseBindSlot`；`patchSession` 写/清 `caseId`。不挡开聊。
- **级**：—（绑控不在字面「壳顶栏」而在工作区顶/Composer，形态可接受）。

#### S6 · 会话列表 + 待确认筛选 — **半立**

- **立得住**：侧栏 segmented「全部 / 待确认 / 进行中」写 `?filter=`，列表页按 `needs_human` / `running` 过滤；计数与「最近待确认」一致。
- **半立**：列表页自身无独立 segmented，且标题仍「全部会话」——筛选能用，**通用历史心智仍欠钉**（与 S1 P1 同债，不双计新 P1）。
- **级**：归入既有 P1。

#### S7 · Catalog 选 Agent — **立得住**

- **立得住**：`/agent/agents` 分组 Catalog；选 Agent→`createSession` 进通用会话；案仅 URL/`case` picker，**无** `resolvePreferredCaseId`。skills/tools 重定向到 Catalog，不另起入口抢戏。
- **级**：—。

#### S8 · 项目模式 general — **立得住**

- **立得住**：`expertsGeneral.ts` 独立剧本（研究/写作/审查/总控）；`catalogAgentId=null`；主区明示无专利步骤条（`general-no-patent-steps`）；无 FTO 五步、无权利要求 HITL 桥（弱确认不写 DomainCommand）。对齐 entry-modes §3.1 与 README 口播。
- **级**：—。

#### S9 · domain/patent + 专家私聊 · 总控边界 — **立得住**

- **立得住**：`expertsPatent.ts` 检索/撰稿/FTO/总控分步骤与工具；主区 `domain-step-bar`；`ExpertHitlBridge` 专利专家绑底层 session 走真闸；FTO 默认确认口径不写案；总控 `command:null` +「禁止一键写库」。与 general **分文件**，禁换皮同 script。
- **级**：—。脚注「无真 LLM」仅在 HITL 桥——与 S0 Won't 一致，不重开全宽黄条债。

---

## 缺口清单

### P0

（空）— 未发现强制 caseId/强制建项目、或无 HITL 静默真 case-core 写库。

### P1

（空）— 原「通用历史」文案债 **已收**（`1b959d6`）。详见 [复检](./AGENT_STEPWISE_BIZ_RECHECK_2026-09-19.md)。

### P2

~~1. 项目线程 ↔ sessions 未标签合流~~ — **已收**（`9598f6e` 视图层聚合；存储仍分 · 见 [合流复检](./AGENT_SESSIONS_THREADS_RECHECK_2026-09-19.md)）。
2. **`pending_create` 死类型** — `types.ts` / `mockCase.ts` 有枚举，运行时未进入该态。
3. **Home 副文案偏领域闭环** — 「专利检索 · OA · 交底 · 年费 · 确认后写入案件」对「通用单聊」略抢戏（Catalog 本身即领域 AgentDef，可忍）。
~~4. 无案 HITL 禁用态不够显性~~ — **已收**（`1b959d6`：`NO_CASE_GATE_REASON` + 芯片 disabled；FTO 口径确认除外）。

**仍开 P2**：线程合流 · `pending_create` · Home 副文案（上列 1–3）。

### Won't（与产品闸冲突）

1. **壳/Home 全宽「样机 · 无真 LLM」琥珀黄条** — 原记 P1「壳/Home 缺样机诚实横幅」。总控/用户否决顶栏全宽样机黄条；`AgentShell` 已卸 BillingHold 全宽条。诚实改侧栏弱字或 docs；**禁**建议恢复全宽 amber / BillingHold 式黄条。规格 §7 横幅建议让位于产品闸。

---

## 证据索引（路径）

- 路由：`apps/agent/src/App.tsx`
- Home / 无强制案：`apps/agent/src/pages/AgentHome.tsx`
- 壳 / 侧栏 / 筛选：`apps/agent/src/components/AgentShell.tsx` · `AgentSessionSidebar.tsx`
- 案绑：`apps/agent/src/components/case/CaseBindControls.tsx` · `apps/agent/src/lib/mockCase.ts`
- 会话无案横幅 / 顶栏：`apps/agent/src/components/session/SessionWorkspaceHeader.tsx` · `pages/AgentSessionWorkspace.tsx`
- 轨迹 / 预览不写：`apps/agent/src/components/session/SessionTimeline.tsx`；逻辑 `@ip/app-state` `playMockSession`
- HITL / 闸映射：`SessionConfirmBar.tsx` · `sessionGates.ts`；`sessionHitlAction` → `dispatchCommand(actor:'agent')`
- 会话列表：`pages/AgentSessionsList.tsx`
- Catalog：`pages/AgentCatalogPage.tsx`
- 项目 general/patent：`pages/projects/ProjectListPage.tsx` · `ProjectWorkspacePage.tsx` · `projects/ProjectFolderContext.tsx` · `projects/expertsGeneral.ts` · `projects/expertsPatent.ts` · `components/projects/ProjectChatPane.tsx` · `ExpertHitlBridge.tsx`
