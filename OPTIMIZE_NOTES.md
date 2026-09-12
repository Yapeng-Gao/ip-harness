# OPTIMIZE_NOTES · 2026-09-11 Top-5 UX

## 对外口径（冻结）

本仓是 **多壳 + 共享内核样机**：多 Vite 壳 + 共享 `src/` / `@ip/*` 内核。**非**微服务、**非**真 SSO、**非**真可观测。联调与演示均按此口径，勿对外宣称生产级拆分或平台能力。

对照 `EVAL_2026-09-11.md` 全仓 Top 5，就地改动（非 git 提交）。

## 1. 产品名统一为「IP 办理」
- 用户可见文案：`Dashboard` 空态、`CaseDetail` 横幅、「回 IP 办理」、`AgentContext` 活动 / 交接 note 字符串。
- `README.md` 产品 B 对外名改为「IP 办理」（路由仍为 `/agent`）。
- 保留：注释、`activeProduct: 'agent'`、legacy stub 注释、代码标识。

## 2. Dashboard 瘦身
- 首屏：顶栏主 CTA + 三格 KPI + 期限压力（≤7 天）+ 待审交底 + 租户横幅。
- 「活跃办理会话」「阶段漏斗 · 最近动态 · 重点案件」以及原有「平台健康度…」均默认折叠在 `<details>`。
- Agent 运行块移到期限区之后，避免淹没下一动作。

## 3. 企业退回单入口
- `VersionPanel` 去掉「附批注并退回修改」表单；仅版本历史 / 代理可见批注。
- 企业态显示提示：退回请用交接栏 `HandoffActionBar`。
- `onAnnotateSubmit` 仍保留在 props 类型上以免调用方类型断裂（已废弃）。

## 4. Skills → Catalog
- `AgentShell` 侧栏去掉「能力」导航。
- `/agent/skills` 与 `/agent/tools` 软重定向到 `/agent/agents`。
- 工具能力继续在 Catalog 卡片「详情 → 能力」展示；`AgentSkills.tsx` 文件保留但不再挂路由。

## 5. 归档轻撤销
- `AgentShell` 侧栏菜单与 `AgentSessionsList` 归档：立即归档 + toast「已归档 · {标题}」+「撤销」（约 5s）。
- 样式对齐 Agent 白底 slate toast 角落模式。

## 附带
- 删除 `index.css` 未使用的 `.soft-card` / `.soft-card .nest-card` 定义。

## 未做（候补）
- 拆分 `AgentSessionWorkspace`（仍候补）。
- Catalog 对 `?tab=tools` 的专项展开（当前直接进目录页即可）。

## Round 2 · FlowChrome 拆分 + Monitor / Stage hub 降噪

### A. FlowChrome 拆分（extract-and-reexport）
- `FlowChrome.tsx` 收成 ~25 行 barrel；实现移至 `src/components/workbench/flow/`：
  - `toast.tsx` — `ToastNextAction` / `nextActionsForStage` / `ToastBanner`
  - `Deadline.tsx` — `DeadlineChip` / `DeadlineBanner`
  - `Stepper.tsx` — `Stepper`
  - `CasePicker.tsx` — `CasePicker`
  - `CaseHeader.tsx` — `CaseHeaderBar` / `FlowHeader`
  - `SplitDraft.tsx` — `SplitDraft` / `Field`
  - `HandoffActionBar.tsx` — `HandoffActionBar`
  - `styles.ts` — `inputCls` / `textareaCls` / `btnPrimary` / `btnGhost` / `btnSuccess` / `panelCls`
  - `index.ts` — 聚合导出 + `workbenchPathForStage`
- 七条 Flow / CaseDetail / Dashboard / WorkbenchHome 仍从 `FlowChrome` 导入，无需改调用方。

### B. Monitor / StageWorkbench hub
- **Monitor**：侧栏「风险总览」移除；`/monitor` → `/docket?focus=risk`；Docket 增加风险聚焦条（≤7 天 / 逾期），并链到「监控办理」处理竞品/侵权。
- **StageWorkbench**：去掉 `?hub=1` 薄入口 UI，始终 `Navigate` 到对应 workbench 路径；Pipeline 阶段卡底部只保留「进入办理流程」。
- WatchFlow 副标题去掉对「风险总览」的交叉说明。

### 可选
- 删除死文件 `AgentSkills.tsx`；HarnessOverview「能力参考」直链 `/agent/agents`（`/agent/skills` 路由仍软重定向）。

## Round 3 · Catalog 主 CTA + 圆角令牌统一

### A. Agent Catalog 能力区收紧
- `AgentCatalogPage.tsx`：由 3 列网格目录改为紧凑单列行表；行尾主钮改为实心「开始办理」（`cta-work`）。
- 「能力」降级：详情折叠摘要显示「工具 N · 需确认 N」；展开为短行 `工具 · a · b · c`（>4 截断 +N），不再像第二套 Skills 页。
- 页头去掉阶段枚举式宣传文案；空态 / 搜索保留。
- `AgentHarnessOverview`：原「能力参考」→「会话」；积木条「能力」→「工具（见目录详情）」；列表「开始」升为「开始办理」实心钮。

### B. 主 CTA 圆角统一为 `rounded-md`
- `.cta-work` 增加 `border-radius: 0.375rem`（= Tailwind `rounded-md`）。
- `flow/styles.ts` `btnPrimary`：`rounded-xl`+软阴影 → `rounded-md`、去 shadow（与 Agent / PageHeader 同构）。
- Dashboard 顶栏主 CTA（及交底「部门通过」）`rounded-xl`/`rounded-lg` → `rounded-md`。
- PageHeader / Agent shell 主钮本已 `rounded-md`，未改版面。


## Round 4 · 品牌口闭环 + CTA 圆角扫尾 + Watch/Docket

### P0 · 品牌「IP 办理」
- `CaseLibrary`：次 CTA / 空态「用 Agent …」→「用 IP 办理」「在 IP 办理发起」「新建 IP 办理会话」。
- `CaseDetail`：更多菜单 + aria-label「用 IP 办理」；审计空态「IP 办理正式执行」。
- `flow/CaseHeader`：「IP 办理协助」+ aria-label。
- `AgentContext`：用户可见 `addActivity` / 交接 note 统一「IP 办理 …」（保留 `actor:'agent'`）；顺手改会话路径遗留「Agent 会话产物…」及少量工具 summary/note。

### P1 · 圆角 / 菜单 / 文案
- 主 CTA 去掉 `rounded-xl`+抬影：`CaseDetail` / `Docket` / `InsightLayout` / `InsightChain` / `InsightInnovate`，依赖 `.cta-work` `rounded-md`。
- `flow/styles.ts`：`btnGhost` / `btnSuccess` → `rounded-md`；success 去 soft shadow，对齐主钮扁平。
- `WatchFlow`「更多」：主钮升级/确认 + 次钮「关闭」外置；更多仅保留企业「升级维权线索」+ 降级「生成调研案」。
- `Docket` 风险条去掉「原风险总览」迁移语 →「仅显示紧急官方期限」。

### 可选
- Dashboard 三处 `<summary>` 补 `focus-ring`（P2-3）。
- 未做：大文件拆分、Dashboard 折叠区再砍、死 stub 删除。

## Round 5 · Dashboard 折叠再砍 + stub 清理 + AgentShell 侧栏拆分

### A. P1-4 Dashboard 折叠区
- 首屏保留：租户横幅、主 CTA、三格 KPI、期限压力、待审交底、活跃办理会话 `<details>`。
- 删除：平台健康度示意（假 sparkline）、办理模式大图、洞察卡片网格、重复「临近期限」、重点案件进度。
- 折叠区合并为一块「阶段漏斗 · 洞察 · 最近动态」：洞察仅文字链到 `/insight/*`；办理模式一行摘要；保留漏斗 + 最近动态。
- 抽出 `src/pages/DashboardSecondary.tsx`（~135 行）；`Dashboard.tsx` ~638 → ~285。

### B. P2-2 死 stub
- 删除未引用的 `src/pages/agents/*`（5 个 Navigate stub）及目录。
- `/monitor` 与 `/stage/:stageId` 重定向内联到 `App.tsx`（`Navigate` + `StageRedirect`）；删除 `Monitor.tsx` / `StageWorkbench.tsx`。书签 URL 仍有效。

### C. P2-1 轻拆分（1 处）
- 从 `AgentShell.tsx` 抽出会话侧栏 → `components/agent/AgentSessionSidebar.tsx`（筛选 / 搜索 / 行菜单 / 归档撤销 toast）。
- `AgentShell.tsx` ~728 → ~132（顶栏 + Outlet）；行为与导出不变。未动 `AgentSessionWorkspace`（已有 session/* 子模块）。

### 跳过
- Harness About 页再设计（P2-5）、侧栏再压（P2-4）、Catalog `?tab=tools`（P2-6）、卡片圆角/violet（P2-7）、深 a11y。

## Round 6 · Harness 办理入口 + 侧栏再压 + SessionWorkspace 拆分

### 1. Harness → 办理入口（压 About 感）
- `AgentHarnessOverview.tsx`：标题「架构总览」→「办理入口」；一段说明 + CTA 行（开始办理 / 打开目录 / 最近会话）；办理人单列行表（Catalog 密度）；架构积木改 `<details>`「运行时构成（可选）」；去掉底部说明书三格。
- `AgentHome.tsx`：收紧 hero/composer 留白（pt/mb/mt、textarea rows=2）；「架构说明」链文案 →「办理入口」。

### 2. 中台侧栏再压
- `Sidebar.tsx`：业务工作台默认折叠；常显仅「工作台首页」+「全部阶段」入口；七阶段仅在手动展开或已在阶段路由时显示；洞察仍可折；仪表盘/案件库/期限/费用保留。

### 3. 大文件拆分（择一）+ violet 收敛
- 从 `AgentSessionWorkspace` 抽出顶栏/状态横幅 → `components/agent/session/SessionWorkspaceHeader.tsx`（~680 → ~500 行）；行为不变。
- `CaseDetail` 审计/命令墙与 `Docket` 案件筛选条、业务回写装饰色：`violet-*` → `slate-*`（保留期限紧急 rose/amber 语义色）。

### 跳过
- Catalog `?tab=tools`、卡片圆角一刀切、HandoffActionBar / CaseDetail 整文件再拆、深 a11y。

## Round · Business-logic Deep Top 5（对照 DEEP_NODE_EVAL）

### P0-1 交底 Agent 勿占 intake_quote
- `HandoffArtifactKey` 新增 `disclosure_pack`；`agent-disclosure.handoffKey` 改为此键。
- `workbenchPath` 仍为 `/inventor`（交底门户）；`REQUIRED_BEFORE_SUBMIT` / 标签 / `pathMap` / 等效演示链同步，立项 `intake_quote` 仅服务 `agent-intake`。

### P0-2 一键等效演示降级
- 仍藏在会话「更多」菜单；文案标明「绕过逐步确认 · 仅演示捷径」；主路径文案强调「开始办理 → ConfirmBar」。
- 演示 timeline 注明绕过逐步 HITL；种子会话不再把等效演示当并列主入口。

### P1-3 布局 Agent
- 新键 `layout_insight`（不再占用 `research_report`）；`workbenchPath` → `/workbench/research`。
- 批准/等效演示建案后返回 `navigateTo=/workbench/research/:newId`，Toast「打开新建调研台」。

### P1-4 HITL 自动串命令透明
- `previewHitlCommandChain` + ConfirmBar 预告「将连续写入：提交 → 开始审核 → 批准…」，与审计墙多写对齐。

### P1-5 年费付款入口对齐
- MaintainFlow 增加「付款解锁」区：对逾期/已开票/待开票调用同一 `payInvoice`；无票时明确空态链费用中心。
- Agent `pay_unlock` 无票时不再静默跳过，改为失败提示并禁用闸门。



## Round · Business Fix A–E（对照 DEEP_BIZ_PRESENTATION）

业务深度审计落地，**未做皮肤 polish**。已落地项（disclosure_pack / layout_insight 键独立、等效演示降级、ConfirmBar 预告、Maintain payInvoice、品牌 IP 办理、Dashboard 瘦身）均未回退。

### Fix B · P0 立项双闸拆开
- `sessionHitlAction` 的 `go_nogo`：**禁止**对企业 `intake_quote` 调 `confirmQuote`；只 submit(+start_review)。
- 删除成功后 `cleared.push('confirm_quote')`。
- `previewHitlCommandChain('go_nogo')` 企业路径改为 `['提交','开始审核']`，去掉「确认报价」。
- ConfirmBar 余闸逻辑：Go 通过后下一主钮自然落到「确认报价」。

### Fix C · P1 HITL 诚实文案 + 逐步开关
- 删除「与工作台逐步点按钮等价」；改为「演示自动串命令（非逐步）· 审计墙会连续多条」。
- ConfirmBar 增加会话内「逐步写入」开关：每次只 dispatch 链上下一条（按当前交接态 pickNext）；默认仍自动串。
- 年费 `pay_unlock` 仍一次串付款+交接（逐步成本高，未拆）。

### Fix A · P0 交底包在发明人门户可见可续
- `InventorPortal` 增加「结构化交底包」台账：HandoffChip + 产物 + 链回交底 Agent 会话 / 案件。
- 空态：「结构化交底包由 IP 办理写入；本门户 disclosure 状态机 = 发明人提报」。
- `?case=` / `?pack=` 深链高亮；Agent 成功条 `/inventor?case=` 同源。
- 种子 c5 带 `disclosure_pack`（submitted_to_enterprise），不改 `advanceDisclosure` 提报流。

### Fix D · P1 入口带案 + 列表业务徽章
- Catalog / Harness `startWith`：最近案默认带上 + 换案 / 「稍后关联」；CTA 未选案时标明「稍后关联」，`createSession({ caseId })`。
- `AgentSessionsList` + `AgentSessionSidebar` 行徽章：待企业确认 | 待代理 | 发票阻塞 | 未关联案件（`clearedHitlGates` vs `hitlGates` + `hasBlockingInvoiceForCase` + `caseId`）。

### Fix E · P1 回执 + Toast + Claims
- Agent「递交归档」改为与工作台同构的回执号+日期表单（预填演示值须确认）；`buildCmdForAction` 的 file 不再静默 `CN-AGENT-${slice}`（年费闸链上仍用 `AN-PAY-` 以免付款解锁卡死）。
- ConfirmBar 在 `authorized_to_file` 时仍展示（含撰写 `draft_claims`）。
- `nextActionsForStage`：`monitoring` → 去期限 / 回案件 / 生成调研（去掉「去转化」主跳）；`drafting` → 去期限 / 回案件为主，「去审查（需已递交）」末位。
- `agent-claims.hitlGates` 增加 `authorize_file`，ConfirmBar 可链回撰写台。


## Round · Agent Platform Fix F–J

对照刚完成的重评 Top 5，**未做皮肤 polish**。A–E（双闸拆开、disclosure_pack 台账、回执表单 OA/撰写、Claims authorize、Toast、带案入口）未回退。

### Fix F · P0 门户交底包真·可续
- `InventorPortal` 结构化交底包台账行内：企业角色嵌入 `HandoffActionBar`（`handoffKey='disclosure_pack'`，走 `dispatchCommand` 批准/退回/提交）。
- 「打开会话 / 用 Agent 续办」降为下划线次 CTA。
- 未改 `advanceDisclosure` 发明人提报流。

### Fix G · P0/P1 pay_unlock 尊重逐步 + 回执诚实
- `sessionHitlAction` `pay_unlock`：stepwise 开时先只 `payInvoice`；下次再 submit/start_review/approve；file 不自动跑，改走 ConfirmBar 回执表单。
- 非逐步仍可一次串付款+交接；闸链内部 `AN-PAY-*` 文案标明「演示凭证号」。
- ConfirmBar / Workspace：`maintain_annuity` 在 `approved` / `authorized_to_file` 展示与 OA 同构的回执号+日期表单。
- 开关旁预告：逐步=先付款；未开=串链（file 用演示凭证号）。

### Fix H · P1 徽章按角色/闸语义重算
- `ENTERPRISE_GATES` 纳入 `pay_unlock`（年费不再标「待代理」）。
- `sessionBizBadges` 增加 `viewerRole`：优先「待我确认」，否则「待企业确认」/「待代理」。
- `AgentSessionsList` + `AgentSessionSidebar` 共用新 API。

### Fix I · P1 Catalog/Harness 按 Agent 阶段优选案
- `resolvePreferredCaseId(visible, url, { stage, visible })`：URL > 同阶段最近案 > lastVisited > 空。
- `setLastCaseId(id, stage)` 记分阶段最近案（CaseDetail 写入）。
- 开始办理某 Agent 用该 Agent 的 `stage` 优选；覆盖下拉可选；CTA 旁显示所选案阶段，错配琥珀警示（不阻断）。

### Fix J · P1 默认逐步 + 等效演示诚实
- ConfirmBar 正式办理默认 `stepwise=true`（`localStorage` `ip-harness-hitl-stepwise`；首次默认开）；预览/dry-run 默认关。
- 等效演示立项：Go（submit+startReview）与 `confirmQuote` 分两条命令；timeline 大字「捷径合并双闸 · 正式请分闸」。
- 回执 `CN-EQ-*` / `AN-EQ-*` 在 note/timeline 标明「演示编号」。

### 妥协
- 年费非逐步路径仍可能一次串到 file（演示凭证号，非静默假回执）。
- 门户复用完整 `HandoffActionBar`（含版本/发票提示），未再抽更薄的最小批准条。
- 等效演示仍一次写完双闸命令（诚实标注捷径），未改成停在 Go 等用户点第二闸。


## Round · Agent Platform Fix K–N

对照平台重评 P1（Watch 处置 / Monetize 法务浅 / Timeline 写库外显 / Home 覆盖），**未做皮肤 polish**。A–J 未回退。

### Fix K · P1 Watch 处置枚举对齐 WatchFlow
- `SessionConfirmBar`：`agent-watch` 且待 `approve_strategy` 时，主钮改为三处置「确认告警 / 升级维权 / 关闭」，点选带 disposition note 走现有 approve/submit 链；timeline/system + activity 留下处置结果。
- 角色：升级仅企业；企业可升级+确认+关闭；代理可确认/关闭 +「提意见」（原退回修改）。未改 HitlGateId。
- ConfirmBar 旁链「打开监控台」`/workbench/watch/:caseId`。
- `agents.ts` description / systemPromptBrief / 剧本询问步写明处置枚举，不假装只有「批准」。

### Fix L · P1 Monetize 法务浅 → 诚实 + 可跳工作台
- **未造完整合同状态机**。ConfirmBar / `agent-monetize` 标明「beta · 法务会签/合同状态在工作台审批交接」；批准策略后 `navigateTo=/workbench/monetize/:id`，Toast「打开转化工作台」。
- 企业多一钮「标记法务已阅（演示）」：同一 approve 链 + note 标明非合同 PDF / 非正式会签，清闸。
- `agents.ts` status 保持 beta；description / systemPrompt / raciHint 与屏上一致。

### Fix M · P1 Timeline：工具成功 ≠ 写库外显
- `SessionTimeline`：`tool_call` / `tool_result` 小标签。`TOOL_TO_COMMAND[tool]==null` →「未写库 · 缓冲」；已映射且随后有「已写入领域」→「已写库」；dry-run 一律「预览不写库」。
- 会话内原「已写入领域」系统条保留。

### Fix N · P2 Home 推荐覆盖 + 默认带案
- `HOME_RECOMMENDED` 拆高频（research/intake/oa/claims）+ 长尾（disclosure/annuity/watch）。
- 无 URL 时 `resolvePreferredCaseId`（lastVisited，不硬编码 c1）；文案「已预选「案名」」。

### 妥协
- Watch 处置不写监控台本地告警状态机（无共享 alert store），只写交接 note / activity；维权线索建案仍在工作台「更多」。
- 法务已阅演示仍走 approve 清闸，明确非合同 PDF，未做独立会签闸。
- Home 选案默认不按 Agent 阶段再切案（避免下拉已预选与点击推荐不一致）；Catalog 仍按 stage 优选。


## Round · Agent Residual Fix O–R

对照平台残留（Watch store / 立项分闸 / Claims 五清单 / Monetize 法务薄状态），**未做皮肤 polish**。A–N 未回退。

### Fix O · Watch 处置回写监控台告警 store（P1）
- `AppContext`：`watchAlertsByCase` 按 caseId 自 `watchSeed` 初始化；`getWatchAlerts` / `processWatchAlert(caseId, alertId, 已确认|已升级|已关闭)` / `patchWatchAlert`。
- `WatchFlow` 改读/写该 store，去掉本地 `useState(alerts)` 真相源。
- `sessionHitlAction`：Watch 处置成功后回写 store——优先 `linkedAlertId`，否则首条「待处理」（再回退首条）。
- 点验：Agent ConfirmBar 升级/确认/关闭 → `/workbench/watch/:id` 见对应告警状态已变。

### Fix P · 等效演示立项真正分闸（P1）
- `runEquivalenceDemo` 对企业立项：**只**跑 Go（submitHandoff + startReview），**禁止** `confirmQuote`。
- `clearedHitlGates` 只清 `go_nogo`，保留 `confirm_quote`；会话 `needs_human` + ConfirmBar 仍显示确认报价闸。
- timeline：「演示完成立项 Go · 请回 ConfirmBar 确认报价」/「未合并：报价闸仍待」。

### Fix Q · Claims 对齐撰写五清单（P1）
- 共享 `DRAFT_FILING_CHECK_ITEMS` + case 级 `draftFilingCheck`（AppContext）；DraftFlow 与 Agent ConfirmBar 同步勾选。
- ConfirmBar 在 `agent-claims` 授权/递交前展示同构 5 项；未全勾禁用授权递交与 file，文案对齐 `REQUIRED_BEFORE_SUBMIT.draft_claims`「递交检查清单齐套」。
- 「回撰写台」链保留。

### Fix R · Monetize 法务薄状态（非假 PDF）（P1）
- 案件字段 `legalReview: 'pending' | 'reviewed' | 'changes_requested'`（`setLegalReview`）。
- Agent ConfirmBar：企业「法务已阅」/「法务退回」写薄状态，**不再**借 approve 清闸；文案「法务审阅状态 · 非合同签署」。
- MonetizeFlow 审批区同 Chip + 分步按钮；批准商务策略与法务审阅可分步可见。
- **禁止**假装合同 PDF/电子签。

### 妥协
- Watch 告警意见字段仍经 `patchWatchAlert`；维权建案仍走工作台「更多」。
- Claims 五清单与 REQUIRED 三项（claims/countries/filing）并存：五格是 filing 齐套的细粒度。
- 法务薄状态未做独立 HITL 闸，仅 case 扩展字段。


## Round · Post-scan Fix S–V

对照扫出残留（Watch 写库门闩 / EQ 双端 / 种子分闸 / 年费禁 auto-file / Catalog 错配确认），**未做皮肤 polish**。A–R 未回退。

### Fix S · P0 Watch 写库门闩
- `sessionHitlAction`：`processWatchAlert` **仅当** `chainComplete && role === 'enterprise'`（approve 链真正完成）。
- 代理仅 submit / 逐步首击未 complete：只写 note/activity + timeline「告警台账将在批准完成后同步」，不写 store。
- ConfirmBar 监控处置旁短提示同上；企业链完成则 timeline「已同步告警台账」。

### Fix T · P1 EQ watch 双端
- `runEquivalenceDemo` 监控分支：handoff 命令成功后（企业）`processWatchAlert`（linkedAlertId 或首条待处理），默认「已确认」。
- timeline 注明「已同步告警 store（演示·已确认）」。

### Fix U · P1 种子
- `sess-intake-1`：goal / 询问 / 产物文案拆开「立项 Go」与「确认报价」，勿捆成一次两闸。
- `sess-watch-1`：改为 `needs_human` + `hitlPending` + 处置询问步，ConfirmBar 一进来即有处置条。

### Fix V · P1 年费非逐步禁 auto-file
- `pay_unlock` 在 `!stepwise` 时也 `skipFile`：付款+交接可串到 approve，**永不**静默 `AN-PAY-*` file。
- `previewHitlCommandChain` 去掉「归档回写」；ConfirmBar 文案改为归档走回执表单。

### Fix W · P2 Catalog/Harness 错配二次确认
- 阶段错配时 `window.confirm('案阶段与办理人不匹配，仍要继续？')`，确认后才 `createSession`（琥珀警示保留）。

### 妥协
- Watch 代理路径仍可点「确认/关闭」走 submit（意见不关单、不写 store）；升级仍偏企业。
- EQ 监控演示固定「已确认」，未按虚构 note 分支升级/关闭。
- 错配确认用 `window.confirm`，未做页内持久确认条。

## Round · Skill-borrow Disclosure Enrich

对照 `handsomestWei/patent-disclosure-skill` 交底工序（intake→扫项目→挖点→轻量查新→摘要→成稿→自检→迭代），**只借鉴字段/门禁/剧本/产物模板同构**，缝在 `disclosure_pack`；**不做皮肤 polish**；**不**把 skill 8 步做成第二套办理 UI；**不**接真 Playwright/国知局爬虫。A–W 未回退。

### P0-1 · disclosure_pack REQUIRED
- `REQUIRED_BEFORE_SUBMIT.disclosure_pack`：`patent_type` / `structure` / `features` / `embodiments` / `prior_art_1_1` / `gaps`。
- 新增 `DISCLOSURE_PACK_CHECK_ITEMS` + case 级 `disclosurePackCheck`（同构 `draftFilingCheck`）；c5 种子默认真齐套。

### P0-2 · agent-disclosure 剧本
- tools 增 `prior_art_lite`（`TOOL_TO_COMMAND=null` → Timeline「未写库」）。
- 剧本/产物对齐：类型、问题/方案/效果、特征、实施例、1.1（假但形态正确的 pubNo+title+url）、缺口 blocking/non_blocking。
- systemPrompt：禁止空材料装完成；1.1 禁编造凑条；批准前须齐套。

### P0-3 · ConfirmBar 交底未齐禁用批准
- `agent-disclosure`：齐套勾选；未齐禁用 `approve_strategy` 并列出未齐项。
- 剧本 HITL 完成时 `markDisclosurePackComplete` 自动勾。

### P0-4 · InventorPortal
- 提报增加技术主题、专利类型（默认发明）、联系人默认「待填写」。
- 立案后挂 `disclosure_pack: drafting`「待结构化交底包」+ toast 链交底 Agent。

### P1-5 · ResearchFlow 可核验命中
- seed 命中补 `url`；UI 可点开；无链接不可提交；`REQUIRED` 增 `hits_verifiable`；IPC 可选提示。

### P1-6 · IntakeFlow 消费 pack
- 发明披露步展示 pack 摘要（类型/缺口/1.1/交接态）；未批准警示为主（链门户/交底 Agent）。

### P1-7 · Claims 前置 + Draft 引入
- Claims ConfirmBar/闸：disclosure 未 approved/authorized/filed → 禁用批准/授权并提示。
- DraftFlow：已批准绿灯 + 一键填入结构字段；未批准红灯。

### P2-8 · OA 草稿/确认态
- session `oaStatementConfirmed`；ConfirmBar 区分「答复草稿」/「已确认陈述」；未确认前禁用授权并提示。

### 未做
- 真爬虫 / CNIPA epub / Playwright。
- skill 8 步 UI 化或整仓塞入 patent-disclosure-skill。
- 完整交底→申请四件套案卷状态机。

## Round · Patlytics-style Skills Meta

对照 Patlytics「Skills 元模型」思路做 enrich（何时用 / 输入 / 护栏 / 输出），缝进现有九 Agent + ConfirmBar / Catalog / 递交门禁；**不做皮肤 polish**；**不抄美专诉讼 skill**。A–W 与交底 enrich 未回退。

### 1 · AgentDef Skills Meta
- `whenToUse` / `inputsHint` / `guardrails[]` / `outputsHint`：九个 Agent 全填。
- Catalog「详情」展示；ConfirmBar 展示相关护栏。

### 2 · 递交前 Full-check helper
- `src/utils/fullFilingCheck.ts`：`evaluateFullCheck`（Claims/OA/Draft）。
- 检查：交底批准、filing 五清单（Claims/Draft）、轻量术语/支持勾选、非法律意见戳；OA 另含陈述确认/争点/策略。
- 未过：禁用授权递交与 file（ConfirmBar + `gateDisabledReason` + `sessionHitlAction`）。

### 3 · OA 争点类型
- session 存 `oaIssueType`（新颖性/创造性/清楚/支持充分公开/其他）+ `oaStrategyNotes`。
- ConfirmBar 选类型+要点后再 HITL；未填禁用批准策略。

### 4 · 案级 caseDriveItems
- AppContext 轻量列表；批准 / 调研提交 / OA 确认 / file 时 append。
- CaseDetail 概览 + SessionContextPanel 展示。

### 5 · Research FTO / Watch claim_chart
- FTO 区与监控告警区：简要素对照表 →「写入 Drive」为 `claim_chart` 草稿（兼 `addArtifact`）。

### 6 · MaintainFlow 年费维持价值分层
- 年费日程旁演示提示：高价值 / 观察 / 低价值；标明非法律意见、不自动放弃。

### 妥协
- Drive 仅为内存轻量列表（非真网盘/对象存储）。
- Full-check 轻量勾选按案级共享，未做会话隔离。
- claim_chart 为示意对照，非自动 claim mapping。
- 未引入美专诉讼 skill / 未做 UI 皮肤 polish。

## Round · Seal Gate Bypasses

对照深评消防通道（Layout 抢跑 / EQ 静默回执 / 交底自动勾齐 / 调研命中 / Full-check·Drive 诚实），**不做皮肤 polish**。A–W / Skill-borrow / Patlytics meta **未回退**。

### Fix 1 · P0 Layout 禁工具抢跑
- `playMockSession` 正式 play：`create_case_from_insight` / `assign_agency` **不再** HITL 前 `dispatchCommand`。
- 工具卡改为「待批准后写入」dry 预览；建案+派所仅保留在 `sessionHitlAction` approve（layout）路径。

### Fix 2 · P0 EQ 阉割
- `runEquivalenceDemo`：**直接拒绝** disclosure / claims / oa / annuity / layout，提示「请用正式办理+ConfirmBar」。
- 仅保留低风险：research / intake（Go 分闸）/ watch / monetize。
- **禁止**任何 `fileResponse`（含历史 AN-EQ / CN-EQ）；链内出现即失败。
- 调研 EQ 写库前校验可核验命中（pubNo+url）。
- Header「更多」文案标明「已阉割 · 仅低风险」。

### Fix 3 · P1 交底齐套下沉
- `sessionHitlAction` disclosure/`disclosure_pack` approve：`!disclosurePackComplete` → 失败返回，不写命令。
- 取消剧本 HITL 到达时 `markDisclosurePackComplete` 自动勾齐 → timeline 提示「请确认齐套勾选」。
- ConfirmBar 禁用保留；文案改为不自动勾。

### Fix 4 · P1 Research 命中执法
- 正式 HITL 批准调研写库前：`sessionHasVerifiableResearchHits`（步骤 preview / 产物行内 pubNo+url）≥1，否则失败。
- 剧本 `commercial_patent_search` 命中与报告对比文献补 `url`，对齐工作台 `hits_verifiable`。

### Fix 5 · P1 Full-check / Drive 审计诚实
- Full-check lite UI：「案级共享勾选 · 演示」（未扩 `checkedBy`/`at` 字段，文案先行）。
- Drive 列表标题/空态：标明「演示内存 · 非网盘」（ContextPanel + CaseDetail）。

### 妥协
- EQ 仍对 intake/watch/monetize 一键写交接（无 file）；高风险全拒而非「跑到产物不批准」。
- Full-check 未落库操作者戳，仅 UI 诚实声明案级共享演示勾选。
- 调研命中校验为正则/JSON 形态，非真库核验。


## Round · Agent Home & Nav

产品 UI 改版：首页办理入口加宽 + 办理人卡片网格；左侧 IA 常显「开始 / 办理人 / 会话」。保留 createSession 带案、resolvePreferredCaseId、错配 confirm、六段 meta、业务徽章。

### IA · 左侧 tab（`AgentSessionSidebar.tsx`）
- 常显三 tab：**开始** `/agent` · **办理人** `/agent/agents` · **会话** `/agent/sessions`（从「更多」提升）。
- 「更多」仅保留 **运行说明**（原架构说明/harness，去 About 感）。
- 短图标 + 文字；active 底边高亮 + 字重；侧栏下方会话列表逻辑未动。

### 首页（`AgentHome.tsx`）
- 内容区 `max-w-5xl` / `lg:max-w-6xl`；标题「开始办理」+ 一句说明；继续会话/案件改为芯片。
- Composer 保留（目标 + 办理人 + 案件），主 CTA「开始办理」。
- 推荐办理人 → 2–3 列卡片网格（高频 / 长尾分区）；快捷办理降为次要小卡；最近会话紧凑卡片行。

### 目录同步卡片化（`AgentCatalogPage.tsx` + `AgentPickerCard.tsx`）
- 抽共享 `AgentPickerCard`：name、specialty/whenToUse、hitlGates 标签、beta/维护徽标、主钮「开始办理」、可选详情折叠（when/inputs/guardrails/outputs/tools/raci）。
- Catalog 保留搜索、阶段筛选、选案、错配 confirm、带案 CTA。

### 可选
- `AgentHarnessOverview` 次 CTA / 链文案「打开目录」→「办理人」；与导航一致。

### 点验
- `/agent` 首页卡片网格 + Composer「开始办理」
- `/agent/agents` 卡片网格 + 详情折叠 + 错配 confirm
- `/agent/sessions` 侧栏 tab 常显；`/agent/harness` 在「更多 → 运行说明」
- `npx tsc -b --pretty false` 通过

## Round · AgentHome denser layout

首页布局/UX：填满主栏空白、去掉卡片网格与廉价 native select 感，对齐 list-row / cta-work。

### `AgentHome.tsx`
- 页头：标题 + 一句副文案；有最近会话时 **全宽 list-row「继续 · 标题 · 状态」**（非 pill）；去掉页头「全部办理人」与继续案件 pill。
- Composer 为 hero：textarea 3 行；工具条 **关联案件 → 办理人 → 开始办理**；未选案 amber 一句「未关联案件时确认不会写回中台」（不阻断）；select 用 slate 壳样式（`appearance-none` + `bg-slate-50`）。
- **lg 两栏**：左 Composer，右最近会话密集行（最多 5）；小屏纵向堆叠。
- 推荐办理人：单列 dense 行（name + 一行 specialty + 可选 HITL 微芯片 + 行末「开始办理」）；合并高频/长尾为一列表，顺序 research→intake→oa→claims→disclosure→annuity→watch；带案时行内「带案 · 短标题」；仍传当前 `caseId` 进 `startWithAgent`。
- 快捷办理下沉为 `<details>`；间距收紧 `pt-5 pb-8` / `mt-6`。

### `AgentPickerCard.tsx`
- 仅注释：Catalog 仍用卡片；Home 不再引用（未改 API）。

### 点验
- `npm run build`（tsc + vite）通过

## Round · Agent Home composer-first

Agent Home is composer-first (Cursor empty state); roster moved to Catalog.

### `AgentHome.tsx`
- Main pane vertically centered (`flex flex-1 items-center justify-center`); inner `max-w-2xl` — no dashboard / two-column layout.
- Quiet greeting「要办哪件事？」; optional tiny「继续上次 · {title}」link (not a list-row).
- Composer is the only hero: 5-row textarea, `rounded-xl` chat surface, focus-within border; footer chips (案件 / 办理人·自动匹配) + primary「发送」(`cta-work rounded-md`).
- Cmd/Ctrl+Enter and Enter (without Shift) submit `start()`; keep `?case=` preselect + createSession/navigate.
- Prompt pills (5) fill goal + agentId and start; examples tied to research / oa / intake / disclosure / annuity.
- Removed: 推荐办理人 roster、最近会话 column、快捷办理 / insight shortcuts、HITL chips、unused HITL_GATE_LABELS / RUN_STATUS_LABEL / ArrowRight.
- Catalog remains at `/agent/agents`; AgentShell / Session workspace untouched.

## Round · AgentHome IP+AI+Harness+Agent composer

Home = IP + AI + Harness + Agent composer（非 harness 花名册、非纯 ChatGPT 空态）。

### `AgentHome.tsx`
- 产品身份：顶一行「IP 办理」+「用 Agent 办知产事务 · 写回中台」。
- Agent：居中 composer 仍是主动作（输入 → 发送进会话）；Cmd/Ctrl+Enter + Enter。
- IP：placeholder / chips 用案件·期限·答复·交底语汇；6 枚任务 pill（检索/OA/立项/交底/年费/权利要求）。
- Harness：关联案件一等公民；未选案/已选案写回提示；选案时发送旁「确认后写入作业中台」；`needs_human` 计数链到 `/agent/sessions`。
- 薄条：继续上次 · N 个会话待确认 · 办理人目录（Catalog 仍在 `/agent/agents`）。
- 保留 `?case=` 预选与 createSession → navigate；未改 Shell / Catalog / Session。

## Round · Agent session de-form — ConfirmBar as chat HITL bubble

Agent sessions feel like Agents, not Workbench forms. Prototype OK without real LLM; UI no longer reads as filing checklists / HandoffActionBar-in-chat.

### Before · `SessionConfirmBar.tsx` (~760 lines)
- `confirm-sheet` panel: header「请你确认」+ stepwise checkbox + gate chip row
- Always-visible walls: 递交检查清单 / 交底包齐套 / OA 争点矩阵+textarea / Full-check lite / 回执双字段 form
- Watch: large button group + prose explanation block
- Chain preview amber box with multi-line audit copy
- Visual height for common `approve_strategy` ≈ half a form panel

### After · chat-native HITL strip
- Default row: amber left-border **message**「需要你确认：{闸}」+ primary CTA + secondary 退回/拒绝 + quiet workbench text links
- Optional one-line chain preview (`下一步写入：…` / `将连续写入：…`)
- Watch disposition: 3 small inline text buttons（确认告警 / 升级维权 / 关闭）
- ALL checklists · OA issue matrix · disclosure pack · full-check · receipt · guardrails · 法务 · stepwise → collapsed `<details class="confirm-hitl-sheet">`; auto-opens only when gate needs data
- 递交归档: compact 回执号 + 递交日 (2 fields) inside sheet, not a wall
- Business callbacks preserved: `onGate` / `onHitl` / `onFileResponse` / stepwise pref / invoice chain filter / OA patch / Drive append / full-check / filing gates

### Timeline · `SessionTimeline.tsx`
- thinking / question_to_human / system → bubble-ish prose (no flat-card)
- tool_call / tool_result → one-line「调用 · {label}」+ quiet write tag; detail/raw in expand
- artifact → soft rounded card (quieter than flat-card wall)
- Write tags kept but quieter (`text-emerald-600/80` / `text-slate-300`)

### Catalog · light touch
- `AgentPickerCard`: removed face-level HITL chip row; specialty one-liner +「开始办理」lead; HITL / tools / guardrails stay in 详情 expand
- `AgentCatalogPage` unchanged (grid + search/stage/case)

### CSS
- `.confirm-hitl` / `.confirm-hitl-sheet` in `index.css` (legacy `.confirm-sheet` kept)

### Files changed
- `src/components/agent/session/SessionConfirmBar.tsx`
- `src/components/agent/session/SessionTimeline.tsx`
- `src/components/agent/AgentPickerCard.tsx`
- `src/index.css`
- `OPTIMIZE_NOTES.md` (this section)

### Verify
- `npm run build` (tsc + vite) passed


## Round · All-agent HITL bubble (not OA-only)

Apply the same chat-bubble HITL treatment to **every** Agent ConfirmBar, not only OA.

### `SessionConfirmBar.tsx`
- Keep `autoOpenSheet` = only `showFile && !firstActionable` (receipt-as-current-action). Never auto-open for specialty checklists / OA / full-check / monetize / watch.
- One-line muted 「还差… · 点补充项」 (like OA) instead of opening sheets:
  - claims / draft_claims: 「还差递交清单 n/5 · 点补充项」 when filing incomplete
  - disclosure: 「还差交底包 · 点补充项」 when pack incomplete
  - authorize/file Full-check fail: 「Full-check 还差 · 点补充项」
  - annuity `pay_unlock` with no invoice: one-line「无待付发票 · 请先去费用中心」(+ 费用中心 link) — not a form
  - OA (unchanged): 「还差争点类型 / 陈述确认 · 点补充项」
- Watch: 3 inline bubble CTAs only; removed sheet prose block; no watch-forced `needsDataSheet`
- Monetize: tiny `{legalChip}` in bubble row; actions stay in collapsed 「补充项」 (not a face form row)
- Intake: bubble CTA = current gate only (`go_nogo` / `confirm_quote`); other gate as chips/dots — no dual voting CTAs
- Research / Layout: bubble 「批准策略」 only (single-gate; no specialty sheet)
- Details `<details>` stays collapsed; summary 「补充项」 + short hints (`sheetHints`)

### Light
- `SessionContextPanel`: Drive list + artifact textarea collapsed to summary + details (no form dump on face)
- `AgentPickerCard` / `AgentCatalogPage`: unchanged specialty +「开始办理」 face (HITL stays in 详情)
- Workbench flows untouched

### Per-agent default ConfirmBar (1 line)
- **research**: 需要你确认：批准策略 · 调研检索 — bubble CTA only
- **intake**: 需要你确认：立项决定/确认报价 · 立项报价 — current gate CTA + gate dots; no voting UI
- **disclosure**: 需要你确认：批准策略 · 交底整理 — +「还差交底包 · 点补充项」 when pack incomplete
- **claims**: 需要你确认：批准策略/授权递交 · 权利要求 — +「还差递交清单 n/5 · 点补充项」 / Full-check 还差 when needed
- **oa**: 需要你确认：批准策略/授权递交 · OA答复 — +「还差争点类型 / 陈述确认 · 点补充项」(unchanged)
- **annuity**: 需要你确认：付款解锁 · 年费维持 — no-invoice one-line hint; receipt sheet only when filing current action
- **watch**: 需要你确认：告警处置 · 监控预警 — 3 inline CTAs (确认/升级/关闭); no sheet prose
- **monetize**: 需要你确认：批准策略 · 转化许可 — tiny 法务芯片 in bubble; actions in 补充项
- **layout**: 需要你确认：批准策略 · 布局规划 — bubble CTA only

### Verify
- `npm run build` (tsc + vite)


## Round · Brand 知产 Agent（办理人 → Agent）

- User-facing product B name: **知产 Agent**（replaces「IP 办理」）；routes `/agent`, `activeProduct:'agent'` unchanged.
- **办理人 → Agent**（全部 Agent / Agent 目录 / 选·当前·按·建议 Agent / 切换到该 Agent / 阶段与 Agent 不匹配）.
- CTAs：**开始办理 → 启动**；Home composer stays **发送**.
- **办理入口 → 运行时**；活跃办理会话 → **活跃 Agent 会话**.
- Tagline：**专利检索 · OA · 交底 · 年费 · 写回中台**.
- Files: ProductSwitcher, AgentShell, AgentHome, AgentCatalogPage, AgentHarnessOverview, AgentSessionSidebar, SessionComposer, SessionWorkspaceHeader, SessionContextPanel, AgentPickerCard, CaseLibrary, CaseDetail, CaseHeader, Dashboard, Login, InventorPortal, MaintainFlow, AgentContext activity strings, agents.ts defaultSessionGoal, AgentSessionsList, README Product B, e2e labels.

## Workbench Gate Align 2026-09-12

深评修复：工作台硬闸对齐 Agent（disclosure / full-check / 晋级诚实 / 流转诚实）。非皮肤 polish。

### P0
1. **Draft + Intake Go 硬认 disclosure_pack**
   - `DraftFlow.tsx`：`blockPrimary` / `validateBefore(submit|authorize|file)` 要求 `disclosure_pack` ∈ approved|authorized_to_file|filed；未批红灯文案 + 禁用主路径。
   - `IntakeFlow.tsx`：Go 前要求 `disclosureApproved`；未批红灯、按钮 disabled；不可 Go。
2. **InventorPortal 批 pack 须 6 项 REQUIRED**
   - `InventorPortal.tsx`：挂 disclosure_pack 的 `HandoffActionBar` 传入 `checkedRequired`（六项）；补最小勾选 UI（`toggleDisclosurePackCheck`）；空壳不可 approve。
   - `HandoffActionBar.tsx`：`checkedRequired` 缺失时 submit/approve/authorize/file 均拦截并禁用。
3. **收紧 forceChecklists / 伪造批准**
   - `AppContext.tsx` `advanceFromWorkbench`：废弃忽略 `forceChecklists`；清单须真实齐套；当前阶段 artifact 须已 approved|filed|authorized_to_file；**不再**强写 curKey=approved。
   - `ResearchFlow` / `IntakeFlow`：去掉 `forceChecklists: true`；批准路径才 `markChecklistDone` 相关项。
4. **layout_insight 串键**
   - `AppContext` pathMap：`layout_insight` → `/agent/agents?agent=agent-layout&case=…`（不再伪装 research 工作台）。

### P1
5. **工作台接 evaluateFullCheck**
   - `DraftFlow` / `ProsecutionFlow`：authorize|file 前调用 `evaluateFullCheck`（同 Agent ConfirmBar）；缺口列示；补 Full-check lite 勾选。
6. **流转诚实**
   - `CasePicker.tsx`：本阶段无案 → 空态「本阶段暂无案件」+ 链回工作台/案件列表（禁止降级列全部案）。
   - `toast.tsx`：monitoring「生成调研」→ `/workbench/research/c2`。
   - Research/Intake：去掉强制 `navigate`，保留 Toast nextActions。
7. **RACI 薄层**
   - `CaseHeader.tsx`：一行「谁该动」。
   - `WorkbenchHome` 队列显示 assignee；`workbenchTodos` seed 补 assignee。
8. **Prosecution 陈述确认**
   - `ProsecutionFlow`：「陈述已确认」勾选 → `PatentCase.oaStatementConfirmed`（`setOaStatementConfirmed`）；authorize|file 前必勾；对齐 Agent 字段名。

### 文件
- `src/context/AppContext.tsx`
- `src/types/index.ts`
- `src/components/workbench/flow/HandoffActionBar.tsx`
- `src/components/workbench/flow/CasePicker.tsx`
- `src/components/workbench/flow/CaseHeader.tsx`
- `src/components/workbench/flow/toast.tsx`
- `src/pages/workbench/DraftFlow.tsx`
- `src/pages/workbench/IntakeFlow.tsx`
- `src/pages/workbench/ResearchFlow.tsx`
- `src/pages/workbench/ProsecutionFlow.tsx`
- `src/pages/InventorPortal.tsx`
- `src/pages/workbench/WorkbenchHome.tsx`
- `src/data/workbenchTodos.ts`

### Verify
- `npx tsc --noEmit` passed

### 残留（未做 / 可后续）
- ~~Agent 会话 `oaStatementConfirmed` 与案级字段双向同步~~ → 见「Workbench Residual Align 2026-09-12」
- ~~`forceChecklists` 死字段~~ → 已删
- ~~CasePicker 跨阶段 caseId~~ → 已自动清空

## Workbench Residual Align 2026-09-12

承接「Workbench Gate Align」残留 + 深评 P1（Maintain / Monetize）。改代码；`npx tsc --noEmit` 通过。

### 必做残留

1. **oaStatementConfirmed 双端同步（案级为源）**
   - **前**：工作台写 `PatentCase.oaStatementConfirmed`；Agent ConfirmBar 只写 session → 两端打架。
   - **后**：案级为源。Agent `patchSession(oaStatementConfirmed)` 镜像回案（同值跳过）；ProsecutionFlow 勾选案级并镜像 OA session；ConfirmBar / Full-check / 授权闸读取 `case || session` 聚合。
   - 文件：`AgentContext.tsx`、`SessionConfirmBar.tsx`、`AgentSessionWorkspace.tsx`、`ProsecutionFlow.tsx`

2. **清 `forceChecklists?` 死字段**
   - **前**：`commands.ts` / `advanceFromWorkbench` opts / `advanceStage` 仍带无效果字段。
   - **后**：类型与传参全删；晋级仍只认真实清单 + 交接批准。
   - 文件：`domain/commands.ts`、`AppContext.tsx`

3. **CasePicker URL 跨阶段 caseId**
   - **前**：本阶段无匹配时仅空态；URL 错案仍绑在 Flow state。
   - **后**：`selectedId` 不属于本阶段 → `onChange('')` + 各 Flow `navigate` 回无 case 基路径；select 不选中错案。
   - 文件：`CasePicker.tsx` + 七条 Flow 的 onChange/onCaseChange

### 深评 P1

4. **MaintainFlow**
   - **价值分层**：前=纯文案；后=可选高/观察/低 → 写 `feeNotes` + Drive `appendCaseDriveItem` + 摘要，活动日志。
   - **确认缴纳**：前=直接 `paymentStatus=已结清`；后=禁用直改，提示须走「付款解锁 / payInvoice」；有票时按钮指向发票区。
   - 文件：`MaintainFlow.tsx`、`agents.ts` 文案

5. **MonetizeFlow · legalReview 进闸**
   - **前**：法务芯片与商务批准脱节。
   - **后**：`canPerformHandoff(..., { handoffKey, legalReview })` 在 `monetize_terms` 的 approve/authorize 前要求 `reviewed`；`transitionHandoff` / `HandoffActionBar` 传入；Flow `validateBefore` + `inlineError` 对齐。
   - 文件：`handoff.ts`、`AppContext.tsx`、`HandoffActionBar.tsx`、`MonetizeFlow.tsx`

### 可选薄层

6. **Intake 委员投票**
   - `intake_quote` REQUIRED 增加「委员投票（至少一位）」；Go 不硬挡（disclosure 仍硬闸），note 带软提示。
   - 文件：`handoff.ts`、`IntakeFlow.tsx`

### 未做
- Stepper 大改 / 皮肤 polish（按约束跳过）
- 真支付 / 真网盘（按约束不接）

### Verify
- `npx tsc --noEmit` passed

## Workbench Rescan Align 2026-09-12

SaaS 工作台扫验（12 项复验）+ 同批优化 Top≤6 真实洞。硬闸对齐 / 流转诚实 / 写回可审计；未接真支付/爬虫；未削弱已立闸。

### A. 复验（源码打穿）

| # | 项 | 结果 | 证据 |
|---|----|------|------|
| 1 | Draft/Intake disclosure_pack 硬闸 | ✅ | `DraftFlow.tsx` L67–70 / L436–460；`IntakeFlow.tsx` L77 / L177–181 / L418–420 |
| 2 | InventorPortal 六项 REQUIRED | ✅ | `InventorPortal.tsx` L340–391（勾选 UI + `checkedRequired` + `blockPrimary={!packOk}`） |
| 3 | advanceFromWorkbench 无 forceChecklists 伪造 | ✅ | `AppContext.tsx` L1669+：清单齐套 + 交接 approved/filed/authorized；`forceChecklists` 全库 0 |
| 4 | layout_insight pathMap → layout 工作台 | ✅→本批再修 | 曾指 agent-layout；2026-09-12 改 `/workbench/layout/:caseId` + LayoutFlow |
| 5 | evaluateFullCheck on Draft/Prosecution authorize\|file | ✅ | `DraftFlow.tsx` L72–77 / L466–467；`ProsecutionFlow.tsx` L66+ / L330–334 |
| 6 | CasePicker 禁降级 + 清跨阶段 caseId | ✅ | `CasePicker.tsx` L17–26 / L28–33 / L62 |
| 7 | Watch toast 生成调研路径 | ⚠️→本批修 | 复验时 `toast.tsx` 写死 `/workbench/research/c2`；本批改为「去调研台」+ 建案后深链真实 id |
| 8 | RACI「谁该动」 | ✅ | `CaseHeader.tsx` L84；`WorkbenchHome.tsx` L177–182 |
| 9 | oaStatementConfirmed 案级为源双端 | ✅ | `AgentContext.tsx` L693–699；`ProsecutionFlow.tsx` L261–274；ConfirmBar 读 case\|session |
| 10 | Maintain 价值分层可写 + 缴纳须发票 | ✅ | `MaintainFlow.tsx` L285–342（分层写 feeNotes/Drive）；L288–301（禁直改已结清） |
| 11 | Monetize legalReview 进 approve 闸 | ✅ | `handoff.ts` L252–264；`MonetizeFlow.tsx` L257–266；`HandoffActionBar` 传 legalReview |
| 12 | Intake 投票进 REQUIRED | ✅ | `handoff.ts` L118；`IntakeFlow.tsx` L365–368（Go 仍软提示，设计如此） |

### B. 本批新修对照

| 洞 | 前 | 后 | 文件 |
|----|----|----|------|
| 1 CaseDetail `passGate` 绕交接批准 | 只认清单，可无交接批准晋级 | `passGate`≡`advanceFromWorkbench`；详情按钮走 `advanceStage` 命令；UI `canPass` 含交接态 | `AppContext.tsx`、`CaseDetail.tsx` |
| 2 HandoffActionBar 批准忽略 blockPrimary | `entApproveDisabled` 不含 blockPrimary → 与 Flow 硬闸不一致 | approve 同步 blockPrimary；新增 `blockAuthorize`（仅授权/递交） | `HandoffActionBar.tsx` |
| 3 Prosecution 授权钮可点再失败 | 仅 validateBefore | `blockAuthorize={!oa\|!fullCheck}` 禁用授权/递交 | `ProsecutionFlow.tsx` |
| 4 Watch「升级」叠语义 | 主钮只改状态「已升级」；更多里另建维权案 | 主钮「升级维权」= escalate 建案；更多保留「生成调研案」+「仅标记已升级」 | `WatchFlow.tsx` |
| 5 Watch toast / 建案下一步 | monitoring toast 写死 c2；建案后仍 successNext→c2 | toast「去调研台」；建研/维权后深链真实案号 | `toast.tsx`、`WatchFlow.tsx` |
| 6 FTO 空洞 + Stepper 撒谎 | FTO 不在 REQUIRED；Stepper 纯装饰 setStep | research_report REQUIRED 增 `fto`；勾 ≥1 要素才过闸；Research/Draft/Intake Stepper=`max(手势,进度)` 只读高亮 | `handoff.ts`、`ResearchFlow.tsx`、`DraftFlow.tsx`、`IntakeFlow.tsx`、`Stepper.tsx` |

### C. 仍残留 → 见下一节「Workbench P1 Residual 2026-09-12」已收口

（原 P1/P2 薄修项已在 2026-09-12 批处理；未做项见该节 D。）

### D. Verify
- `npx tsc --noEmit` passed

## Workbench P1 Residual 2026-09-12

对照上轮残留 P1 + 薄修 P2；不削弱 disclosure / Full-check / legalReview / CasePicker 闸；无皮肤 polish、无真支付。

### A. 对照表（前 → 后）

| # | 项 | 前 | 后 | 文件 |
|---|----|----|----|------|
| 1 | Intake Go 宽写清单 | Go 前 `markChecklistDone(['c3','c4'])` | **禁止**宽写；投票齐套 useEffect 诚实勾 c3；Go 仅 `resolveDoneIds:['c4']`（votesReady 时可含 c3）原子晋级；缺项 toast 点名 | `IntakeFlow.tsx`、`AppContext.tsx` |
| 2 | layout 通道 | pathMap → agent-layout；无工作台 Flow；Agent `workbenchPath` 仍 research | **方案 A**：极薄 `LayoutFlow`（洞察摘要/国别建议/交接）挂 `/workbench/layout`；REQUIRED=`layout_insight`；pathMap + Agent path 改回该 Flow | `LayoutFlow.tsx`、`App.tsx`、`AppContext.tsx`、`agents.ts` |
| 3 | Agent↔工作台 artifact 摘要 | Drive：Agent 写裸 `agentId`；工作台 OA 无 `oa_confirm`；Draft 无提交摘要 | 薄对齐：Agent HITL →`争点…`/`调研批准`/`权利要求批准`；工作台 OA 确认写 `oa_confirm`（同 ConfirmBar）；Draft/Prosecution/Research 提交·批准写同族 summary | `AgentContext.tsx`、`ProsecutionFlow.tsx`、`DraftFlow.tsx`、`ResearchFlow.tsx` |
| 4 | Stepper 其余 Flow | Prosecution/Maintain/Monetize/Watch 纯手势 `step` | 对齐 Research：`max(手势, 进度)`；Layout 同步 | 各 `*Flow.tsx` |
| 5 | Intake No-Go | 仅 toast + artifact | `recordIntakeNoGo` → `intake_quote=changes_requested` + 版本注记 + 时间线 + Drive | `AppContext.tsx`、`IntakeFlow.tsx` |
| 6 | 发票停权文案 | 企业「提示」与代理停权不对仗 | 企业横幅「仅提示（不停审）」；代理「已停权」+ 对称说明 | `HandoffActionBar.tsx` |

### B. 文件列表

- `src/pages/workbench/IntakeFlow.tsx`
- `src/pages/workbench/LayoutFlow.tsx`（新）
- `src/pages/workbench/ProsecutionFlow.tsx` / `DraftFlow.tsx` / `ResearchFlow.tsx`
- `src/pages/workbench/MaintainFlow.tsx` / `MonetizeFlow.tsx` / `WatchFlow.tsx`
- `src/components/workbench/flow/HandoffActionBar.tsx`
- `src/context/AppContext.tsx`（`resolveDoneIds` / `recordIntakeNoGo` / pathMap）
- `src/context/AgentContext.tsx`
- `src/data/agents.ts` · `src/App.tsx` · `OPTIMIZE_NOTES.md`

### C. Verify

- `npx tsc --noEmit` passed

### D. 未做 / 残留

- WorkbenchHome 未加「布局」阶段卡（布局非 STAGE_ORDER；入口靠 pathMap/待办/Agent/`/workbench/layout`）
- Agent 建案后深链仍进调研台（`CreateCaseFromInsight` → research）— 设计如此
- Drive 双份（会话 artifact vs case Drive）未合并存储，仅摘要字段口径对齐
- 真支付 / 真爬虫 / 真网盘 — 按约束不接
- 皮肤 polish — 不做

## Workbench Continue 2026-09-12

扫验已落地批次（Gate Align / Residual / Rescan / P1 Residual）后剩余业务洞；本批 Top≤7 业务诚实，无真支付/爬虫/网盘，未削弱硬闸。

### A. 扫后「还剩什么」全表

| # | 洞 | 优先级 | 路径 / 证据 | 本批 |
|---|----|--------|-------------|------|
| 1 | WorkbenchHome 无 layout 阶段入口；layout 待办对企业不可见 | P0 | `WorkbenchHome.tsx` stageCards；`workbenchTodos` 无 layout；企业队列滤掉 pre_research | ✅ 修 |
| 2 | Drive 与工件双栏打架 | P1 | `CaseDetail.tsx` 两段并列；Agent `SessionContextPanel` 分通道 | ✅ 只读合并 |
| 3 | 建案深链进调研台易读成「布局台丢失」 | P1 | `AgentContext.tsx` navigateTo→`/workbench/research/`；`agents.ts` 文案 | ✅ 文案诚实（仍深链调研案，设计如此） |
| 4 | 作业中台「待我处理」≠ 工作台队列 | P0 | `Dashboard.tsx` 用 `workspaceTodos.length`；Home 另滤履约+阶段 | ✅ 同口径 `filterWorkbenchQueue` |
| 5 | disclosure 门户两层状态机易混 | P1 | `InventorPortal.tsx` 提报 FLOW 与 pack 同页弱分隔 | ✅ 双车道 UI |
| 6 | litigation runners 有步骤无 Flow；转化台「维权诉讼」假 Term Sheet | P1 | `stages.ts` litigation；`MonetizeFlow.tsx` PATHS | ✅ 诚实空态+元数据标注 |
| 7 | 递交按钮可点再失败（空回执） | P1 | `HandoffActionBar.tsx` fileDisabled 不含 receipt | ✅ 缺回执禁用 |
| 8 | LayoutFlow CasePicker 与调研共用 pre_research 无说明 | P2 | `LayoutFlow.tsx` | ✅ 提示 |
| 9 | Agent↔工作台闸差（disclosure/Full-check/legalReview/oa） | — | 上批已对齐 | 未回退 |
| 10 | VersionPanel / toast 假链 | P2 | Version 诚实；toast 无写死 c2；`sess-disclosure-1` 有 seed | 核验通过 · 未改 |
| 11 | Full-check 企业/代理停权文案 | P2 | HandoffActionBar 已对称「仅提示/已停权」 | 核验通过 · 未改 |
| 12 | 真支付 / 真爬虫 / 真网盘 / 皮肤 | — | 约束排除 | 不做 |

### B. 本批对照

| # | 项 | 前 | 后 | 文件 |
|---|----|----|----|------|
| 1 | Home layout 入口 + 队列可见 | 无卡；layout 待办对企业被滤 | 阶段入口加「布局洞察」卡；seed `t11`→`/workbench/layout/c2`；`filterWorkbenchQueue` 放行 layout | `WorkbenchHome.tsx`、`workbenchTodos.ts`、`workspaces.ts` |
| 2 | 中台↔工作台待办数 | Dashboard 宽计数 | 共用 `filterWorkbenchQueue`，文案「同工作台」 | `Dashboard.tsx`、`workspaces.ts` |
| 3 | Drive 单源只读 | Drive / 工件两栏 | 合并「产物单源」标签分通道；Agent 侧注明分通道 | `CaseDetail.tsx`、`SessionContextPanel.tsx` |
| 4 | 诉讼空态 | 选「维权诉讼」仍像许可 Term Sheet | 琥珀诚实空态 + 链监控升级；条款标题改「非诉讼文书」；runners 标示意 | `MonetizeFlow.tsx`、`stages.ts` |
| 5 | 发明人门户两层 | 弱文案分隔 | ①提报 / ②交底包 双车道；pack 区标题加 ② | `InventorPortal.tsx` |
| 6 | 布局深链文案 | 「下一步打开调研台」易误解 | 「已建调研案 → 调研台（布局台仍办源案）」 | `AgentContext.tsx`、`agents.ts`、`LayoutFlow.tsx` |
| 7 | 回执递交 | 空回执可点再失败 | 缺回执号/递交日禁用 + 提示 | `HandoffActionBar.tsx` |

### C. Verify
- `npx tsc --noEmit`（见交付）

### D. 建议下一刀
- Layout 与 Research 共用 CasePicker 池：若产品要「仅有 layout_insight 交接的案」子集，可加可选 filter（仍非新阶段）
- Agent 会话产物 ↔ Drive 摘要去重展示（存储仍双通道）
- Monetize「维权诉讼」选中后可灰化里程碑商务字段（更强诚实）
- 真支付 / 真网盘 — 仍按约束不接

## Workbench Polish Gates 2026-09-12

对照上批 Continue「建议下一刀」三刀 + ≤3 边角；不接真支付/爬虫/网盘；未削弱 disclosure / Full-check / legalReview / CasePicker 硬闸。

### A. 对照表（前 → 后）

| # | 项 | 前 | 后 | 文件 |
|---|----|----|----|------|
| 1 | Layout CasePicker 子集 | `stage=pre_research` 调研全池，仅文案提示 | `artifactFilter="layout_insight"`：只列已挂该交接键的案；无匹配诚实空态（说明不降级全池）；c2 seed 挂 `layout_insight` | `CasePicker.tsx`、`LayoutFlow.tsx`、`cases.ts` |
| 2 | Drive ↔ 工件/Agent 产物去重展示 | CaseDetail 双列并列；Agent 面板分通道各列 | **展示**按 title/summary/kind 折叠去重，一行可多源标签（Drive/工件/已去重）；存储仍双通道不改写入 | `productDisplay.ts`、`CaseDetail.tsx`、`SessionContextPanel.tsx` |
| 3 | 维权诉讼灰化商务里程碑 | 选诉讼仍可编辑 Term Sheet/里程碑 | `isLitigation`：Term Sheet + 里程碑 disabled +「诉讼路径不走商务里程碑」；摘要/进度跳过里程碑；提交不逼对价；legalReview/交接闸保留；切回许可等恢复 | `MonetizeFlow.tsx` |
| 4 | Layout/Home 文案 | Home 未提子集过滤 | Home 卡注明 CasePicker 仅列带 layout_insight；Layout 帮助对齐 | `WorkbenchHome.tsx`、`LayoutFlow.tsx` |
| 5 | 假跳 / 空回执 / 宽写 | 上批已修 toast c2、回执禁用、Intake 宽写 | 复验无回退；本批未新开宽写捷径 | （核验） |

### B. 文件列表

- `src/components/workbench/flow/CasePicker.tsx`（`artifactFilter` / 诚实空态）
- `src/pages/workbench/LayoutFlow.tsx`
- `src/data/cases.ts`（c2 `layout_insight` seed）
- `src/utils/productDisplay.ts`（新）
- `src/pages/CaseDetail.tsx`
- `src/components/agent/session/SessionContextPanel.tsx`
- `src/pages/workbench/MonetizeFlow.tsx`
- `src/pages/workbench/WorkbenchHome.tsx`
- `OPTIMIZE_NOTES.md`

### C. Verify

- `npx tsc --noEmit` passed

### D. 未做 / 建议下一刀

- 存储层仍双通道（Drive vs 工件 vs 会话产物）— 按约束只做展示去重
- Research/Watch 等 `markChecklistDone` 多 id 仍保留（非 Intake Go 宽写捷径）；若要逐项诚实勾可选再收
- 真支付 / 真爬虫 / 真网盘 — 仍不接
- **下一刀候选**：布局批准后可选「在源案补挂 layout_insight」向导，或 CasePicker 支持 `stageFilter` 多阶段并集（仍非新 STAGE_ORDER）

## Workbench Layout Attach 2026-09-12

对照上批「布局批准后补挂 layout_insight」候选 + ≤4 边角；不接真支付/爬虫/网盘；不绕过 REQUIRED；补挂 ≠ 自动批准。

### A. 对照表（前 → 后）

| # | 项 | 前 | 后 | 文件 |
|---|----|----|----|------|
| 1 | 布局台空池 / 源案未挂键 | CasePicker 只列已挂 `layout_insight`；Agent/洞察建调研案常不挂键 → 空池 | `attachHandoffArtifact`：选源案写入 `layout_insight`=drafting（已存在不改写）；时间线「补挂布局洞察」+ Drive；CasePicker 立刻可见 | `AppContext.tsx`、`LayoutFlow.tsx` |
| 2 | 批准后同步挂关联案 | 无 | 批准区可选「同步补挂到关联调研/源案」（优先 fromInsight 未挂键案）；成功 toast 合并提示；仍为 drafting | `LayoutFlow.tsx` |
| 3 | Monetize 诉讼误检 Term | 灰化后 `checkedRequired=['litigation_path']`，REQUIRED 仍要 terms/party → 提交/批准误拦 | `omitRequiredIds=['terms','party']`；诉讼不再要求商务项；validate 仍豁免对价 | `HandoffActionBar.tsx`、`MonetizeFlow.tsx` |
| 4 | Home 布局卡 freshen | 无池计数 | 显示可办 `layoutPoolCount`；文案提空池可补挂 | `WorkbenchHome.tsx` |
| 5 | CasePicker 多阶段并集 | — | **未做**（Layout 仍仅 `pre_research`，无洞） | — |

### B. 文件列表

- `src/context/AppContext.tsx`（`attachHandoffArtifact`）
- `src/pages/workbench/LayoutFlow.tsx`（补挂向导 + 批准同步勾选）
- `src/components/workbench/flow/HandoffActionBar.tsx`（`omitRequiredIds`）
- `src/pages/workbench/MonetizeFlow.tsx`（诉讼豁免 terms/party）
- `src/pages/workbench/WorkbenchHome.tsx`（布局池计数）
- `OPTIMIZE_NOTES.md`

### C. Verify

- `npx tsc --noEmit` passed

### D. 未做 / 建议下一刀

- CasePicker `stages[]` 多阶段并集 — Layout 暂不需要，搁置
- 真支付 / 真爬虫 / 真网盘 — 仍不接
- Agent 批准建案时是否自动在**源会话案**保证挂键（现靠工作台补挂 / 批准同步）— 可在 Agent 侧复验
- **下一刀候选**：**工作台可停，建议切 Agent/中台复验**（布局 Agent 建案深链后源案挂键、ConfirmBar 与补挂审计是否对齐）

## Enterprise Wave1 Inbox 2026-09-12

中台统一「待我办理」Inbox 第一刀；不接真 SSO/队列服务/支付/爬虫；Persona 全套未接（类型注释预留）。

### A. 对照表（前 → 后）

| # | 项 | 前 | 后 | 文件 |
|---|----|----|----|------|
| 1 | Dashboard 首屏 | KPI「待我处理」= 仅 `filterWorkbenchQueue` 计数；下方「期限压力」案列表 + 折叠 Agent | KPI「待我办理」= 统一 Inbox 计数（工作台+Agent+期限同口径）；首屏列表聚合三类行（来源标签 / 谁该动 / 深链） | `Dashboard.tsx`、`opsInbox.ts` |
| 2 | 工作台待办 | 只在 `/workbench` 队列 | Inbox 行 → 原 `actionPath`；口径同 `filterWorkbenchQueue` | `opsInbox.ts` |
| 3 | Agent 待确认 | 折叠「活跃会话」混入 running/queued | 仅 `needs_human`/hitlPending + 未清闸 + `sessionBizBadges`「待我确认」；企业看 ENTERPRISE_GATES，代理隐藏企业专属闸；深链 `/agent/sessions/:id` | `opsInbox.ts`、`sessionGates.ts`（复用） |
| 4 | 期限 | 用案件 `nextDeadline≤7` 列表 | Inbox 用 `visibleDocketEvents` 的 `due_soon`/`overdue`（未 done）；深链 `/docket?case=` | `opsInbox.ts`、`docketRules.ts` |
| 5 | 工作区切换 | 案件/todos 已滤，首屏未统一 | Inbox 随 `visibleCases` / `workspaceTodos` / `visibleSessions` / role 变 | `Dashboard.tsx` |
| 6 | 种子 | 有 due_soon，缺 overdue | 补 `de9` overdue（c7 自助案，企业可见） | `docketRules.ts` |

### B. 文件列表

- `src/utils/opsInbox.ts`（新 · 纯函数 `buildOpsInbox` / `countOpsInbox` / `sessionNeedsMyConfirm`）
- `src/pages/Dashboard.tsx`（首屏 Inbox + KPI 同口径）
- `src/data/docketRules.ts`（`de9` overdue 种子）
- `OPTIMIZE_NOTES.md`

### C. Verify

- `npx tsc --noEmit` passed
- 验收口径：企业可见待批交接 + 待确认 Agent + due_soon/overdue；切代理后企业专属闸 Agent 行消失、代理工作台待办出现；三类深链如上

### D. 未做 / 建议下一刀

- 真 IAM / Persona 路由（仅注释预留 `PersonaId`）
- 合并 Drive 存储、皮肤大改 — 按约束不做
- 代理 Inbox：徽章「待我确认」**或**未清 `approve_strategy`（可 submit）；纯企业专属闸（go_nogo/confirm_quote/pay_unlock/authorize_file）不出现
- **下一刀候选**：Persona 轻量过滤；徽章文案与代理 submit 完全对齐（避免列表「可办」但侧栏仍标待企业确认）

## Enterprise Wave1 Persona 2026-09-12

从二元 `UserRole` 扩展为可切换 Persona，并真正进入 `canPerformHandoff` / Agent 闸 / Inbox / 门户权限（原型，不接真 SSO/IAM）。

### A. 对照表（前 → 后）

| # | 项 | 前 | 后 | 文件 |
|---|----|----|----|------|
| 1 | 身份模型 | 仅 `UserRole=enterprise\|agency`（跟工作区） | 新增 `PersonaId`：`enterprise_ip` / `agency` / `inventor` / `committee`；映射 role+细权限；侧栏/Agent 顶栏 Persona 切换器 | `types`、`data/persona.ts`、`PersonaSwitcher.tsx`、`AppContext`、`Sidebar`、`AgentShell` |
| 2 | 交接执法 | `canPerformHandoff` 只看 role+mode | Persona 硬禁优先：inventor/committee 不可 approve/authorize/file/submit…；`transitionHandoff` / `HandoffActionBar` 传入 persona | `handoff.ts`、`AppContext`、`HandoffActionBar.tsx` |
| 3 | Agent 闸 | 企业/代理二元 | `gateDisabledReason` 调 `personaBlocksHitlGate`；ConfirmBar 递交对 inventor/committee 隐藏 | `AgentSessionWorkspace.tsx`、`SessionConfirmBar.tsx`、`persona.ts` |
| 4 | 发明人 | 路径启发式精简导航 | Persona=inventor → 门户主导航；工作台敏感动作禁用+深链门户提示 | `Sidebar`、`HandoffActionBar`、`opsInbox` |
| 5 | 委员 / Go | 企业即可 Go；投票本地态 | Persona=committee 可投票（可审计）；不可 Go/approve；enterprise_ip 可代看；`committeeVoteHardBlockGo` local flag | `IntakeFlow.tsx`、`AppContext`、`OrgSettings.tsx` |
| 6 | Inbox | 仅按 role | `buildOpsInbox({ persona })`：inventor→门户行；committee→立项投票；enterprise_ip/agency≈现网 | `opsInbox.ts`、`Dashboard.tsx` |
| 7 | OrgSettings | 矩阵假装权限 | 标「示意·执法以 Persona 为准」+ 投票硬挡 Go 开关；禁假装已 IAM | `OrgSettings.tsx` |

### B. 文件列表

- `src/types/index.ts`（`PersonaId`）
- `src/data/persona.ts`（新）
- `src/data/handoff.ts`（persona 硬闸）
- `src/context/AppContext.tsx`（persona / 投票审计 / 硬挡 flag）
- `src/components/PersonaSwitcher.tsx`（新）
- `src/components/Sidebar.tsx` / `AgentShell.tsx`
- `src/components/workbench/flow/HandoffActionBar.tsx`
- `src/components/agent/session/SessionConfirmBar.tsx`
- `src/pages/agent/AgentSessionWorkspace.tsx`
- `src/pages/workbench/IntakeFlow.tsx`
- `src/utils/opsInbox.ts`
- `src/pages/Dashboard.tsx`
- `src/pages/OrgSettings.tsx`
- `OPTIMIZE_NOTES.md`

### C. Verify

- `npx tsc --noEmit` passed
- 验收：切 inventor → 无法 approve/authorize/file，可进门户；切 committee → 可投票不可 Go/approve；enterprise_ip/agency ≈ 现网；Inbox 随 Persona 变

### D. 未做 / 建议下一刀

- 真 SSO / 多租户 IAM / 证据包导出（下一刀）
- 皮肤大改
- 委员投票写入独立 CommandName（现复用 audit + detail 文案）

## Enterprise Wave1 EvidencePack 2026-09-12

本案审计证据包一键导出（原型 · 内存快照 · 浏览器 blob）；不接真对象存储 / PDF / 电子签 / SSO。

### A. 对照表（前 → 后）

| # | 项 | 前 | 后 | 文件 |
|---|----|----|----|------|
| 1 | 导出入口 | 无 | CaseDetail 顶栏「导出审计证据包」+ 审计 Tab 条；可选「含 JSON」 | `CaseDetail.tsx` |
| 2 | 组装 | — | 纯函数 `buildEvidencePackMarkdown` / `buildEvidencePackJson`：案头（案号/标题/阶段/工作区/Persona·角色快照时间）、交接 status+版本+REQUIRED 摘要、`auditLog` 本案命令序（actor user\|agent）、HITL/Full-check（oaStatementConfirmed / filing / disclosure_pack 齐套 / legalReview）、filed 回执、Drive·工件去重摘要、时间线 | `caseEvidencePack.ts` |
| 3 | Full-check 操作者 | store 无 checkedBy/at | 导出写「未记录操作者」，**勿伪造** | `caseEvidencePack.ts` |
| 4 | 文案诚实 | — | 标明「原型导出·内存快照·非司法鉴定级」 | `caseEvidencePack.ts`、`CaseDetail.tsx` |
| 5 | 下载 | — | 浏览器 blob：主 `.md`，可选 `.json` | `downloadTextFile` / `exportCaseEvidencePack` |

### B. 文件列表

- `src/utils/caseEvidencePack.ts`（新）
- `src/pages/CaseDetail.tsx`
- `OPTIMIZE_NOTES.md`

### C. Verify

- `npx tsc --noEmit` passed
- 验收：有交接的案导出非空 md；有命令时含 actor + 命令序；Full-check 无元数据时「未记录操作者」

### D. 未做 / 建议下一刀

- 真持久化归档、对象存储、PDF、电子签、SSO
- Full-check `checkedBy`/`checkedAt` 写入 store（本刀仅诚实缺省）
- 交接 REQUIRED 勾选全键持久化（disclosure_pack / filing 有 store；其余标「未持久化」）

## Enterprise Wave1 VoteGate 2026-09-12

委员投票硬闸开关真正执法：OrgSettings local flag ON 时立项 Go / confirmQuote 须有效委员票；OFF 保持软提示兼容。

### A. 对照表（前 → 后）

| # | 项 | 前 | 后 | 文件 |
|---|----|----|----|------|
| 1 | Flag 存储 | `AppContext` `useState(false)` 仅内存 | 读写 `localStorage` key `ip-harness-committee-vote-hard-block-go`（常量 `COMMITTEE_VOTE_HARD_BLOCK_STORAGE_KEY`）；OrgSettings ↔ `committeeVoteHardBlockGo` / `setCommitteeVoteHardBlockGo` | `handoff.ts`、`AppContext.tsx`、`OrgSettings.tsx` |
| 2 | Go 执法 | 仅 IntakeFlow UI 软查 | `advanceFromWorkbench` 在 `stage===decision` 硬挡；UI toast/禁用文案统一「委员投票未达硬闸」 | `AppContext.tsx`、`IntakeFlow.tsx` |
| 3 | confirmQuote / 批准 | 交接批准不认票 | `canPerformHandoff` + `transitionHandoff` 对 `intake_quote` approve/authorize 认 flag；HandoffActionBar 传入并禁用+告警 | `handoff.ts`、`AppContext.tsx`、`HandoffActionBar.tsx`、`IntakeFlow.tsx` |
| 4 | 有效票计数 | UI 勾选可冒充 | 仅 `recordCommitteeVote` 在 Persona=`committee` 写入 `committeeVoteLog`；`hasAuditedCommitteeVote` 认审计条（企业代看不入账） | `AppContext.tsx`、`IntakeFlow.tsx` |
| 5 | Flag OFF | — | 保持 REQUIRED 芯片软提示 / 不挡 Go（与现网兼容） | `IntakeFlow.tsx` |
| 6 | OrgSettings 文案 | 「Go 须存在…可审计票」 | 「开启后立项 Go 前必须有效投票」+ 读路径说明 | `OrgSettings.tsx` |

### B. Flag 读路径

`OrgSettings` checkbox → `setCommitteeVoteHardBlockGo` → React state + `localStorage[ip-harness-committee-vote-hard-block-go]` → `useApp().committeeVoteHardBlockGo` → `IntakeFlow.submitGo` / `advanceFromWorkbench` / `canPerformHandoff`（经 `HandoffActionBar`·`transitionHandoff`）/ `confirmQuote`。

### C. 文件列表

- `src/data/handoff.ts`（`COMMITTEE_VOTE_HARD_GATE_MSG` / storage key / canPerform VoteGate）
- `src/context/AppContext.tsx`（localStorage 持久化；advanceFromWorkbench + transitionHandoff 硬闸）
- `src/components/workbench/flow/HandoffActionBar.tsx`
- `src/pages/workbench/IntakeFlow.tsx`
- `src/pages/OrgSettings.tsx`
- `OPTIMIZE_NOTES.md`

### D. Verify

- `npx tsc --noEmit` passed
- 验收：flag 开 + 0 审计票 → 无法 Go / 无法 confirmQuote；flag 开 + ≥1 委员票 → 可 Go（仍受 disclosure 等已有硬闸）；flag 关 → 不因票数挡 Go

### E. 未做

- 真 IAM / 真委员会系统 / 皮肤 / 支付

**波 1 五刀收口**（Inbox / Persona / EvidencePack / VoteGate / OrgSettings 诚实）。波 2 第一刀已落地：DynamicTodos（见下）；下一刀建议 Docket 升级阶梯。

## Enterprise Wave2 DynamicTodos 2026-09-12

交接状态变更 → 动态待办写入运营真相源（原型 · 内存 · 不接真队列服务）；WorkbenchHome / Dashboard Inbox / `filterWorkbenchQueue` 以动态为主，seed 仅冷启动补齐。

### A. 对照表（前 → 后）

| # | 项 | 前 | 后 | 文件 |
|---|----|----|----|------|
| 1 | 待办模型 | `WorkbenchTodo` 无来源/动作种 | 增 `source`（seed|handoff）、`actionKind`、`assigneePersona` | `types/index.ts` |
| 2 | 交接→待办 | `transitionHandoff` 内联少量 pushTodo；file 不消账；seed dismiss 过宽 | 纯函数 `buildTodoFromHandoffTransition`：submit/start_review→企业待批；request_changes→代理待改；approve/authorize→代理下一动作；file→complete 消账 | `utils/dynamicTodos.ts`、`AppContext.tsx` |
| 3 | pushTodo | 同案+工件直接丢弃旧条 | `upsertDynamicTodo` 旧条 `done:true` + 新条置顶；并 dismiss 同案+工件 seed | `dynamicTodos.ts`、`AppContext.tsx` |
| 4 | 合并去重 | seed 强制 `assignee=both` + 覆盖 `handoffKey=ARTIFACT_FOR_STAGE`（弄坏 layout_insight）；去重脆弱 | `mergeDynamicAndSeedTodos`：动态优先；同 case+artifact（及 fingerprint）不双计；保留 seed 原 assignee/`handoffKey` | `dynamicTodos.ts`、`AppContext.tsx` |
| 5 | Inbox / 队列 | 仅 role 滤；企业阶段白名单挡掉 pre_research 待批 | `filterWorkbenchQueue(..., persona)` + `todoVisibleToPersona`；`source=handoff` 绕过阶段白名单；opsInbox/WorkbenchHome 标「交接驱动」 | `workspaces.ts`、`opsInbox.ts`、`WorkbenchHome.tsx` |
| 6 | Persona | Wave1 已有 | inventor 不进工作台队列；committee 仅立项/intake；enterprise_ip/agency 认 assigneePersona | `dynamicTodos.ts`、`workspaces.ts` |

### B. 状态 → 待办映射

| 交接动作 | 待办 actionKind | assignee / Persona | 消账时机 |
|----------|-----------------|--------------------|----------|
| submit / start_review | enterprise_review | enterprise / enterprise_ip | 后续 upsert 或 file complete |
| request_changes | agency_revise | agency / agency | 重新 submit 接替 |
| approve / authorize | agency_next | agency / agency | file → complete |
| file | — | — | 同案+工件动态全部 done + seed dismiss |
| save_draft | noop | — | — |

每条动态带：`caseId`、`handoffKey`（artifact）、`actionPath`、`assignee`/`assigneePersona`、`priority`、`source=handoff`。

### C. 文件列表

- `src/types/index.ts`
- `src/utils/dynamicTodos.ts`（新）
- `src/context/AppContext.tsx`
- `src/data/workspaces.ts`
- `src/utils/opsInbox.ts`
- `src/pages/workbench/WorkbenchHome.tsx`
- `OPTIMIZE_NOTES.md`

### D. Verify

- `npx tsc --noEmit` passed
- 验收路径：代理 submit → 企业 Inbox/工作台出现「待企业审核」（交接驱动）；approve/authorize 后该条消账并出现代理下一动作；file 后开放动态清零；seed 冷启动仍在且不与动态同案+工件双计；Persona 过滤仍生效

### E. 未做 / 建议下一刀

- 真消息推送 / 真队列服务 / 皮肤 / 支付（按约束不做）
- **波 2 下一刀：Docket 升级阶梯** → 已落地（见下）

## Enterprise Wave2 DocketEscalate 2026-09-12

期限事件逾期未办时走升级阶梯：提醒 → 升级到企业 IP（enterprise_ip）→ 标记风险；可审计状态 + 统一 Inbox；原型模拟 · 不接真通知/邮件。

### A. 对照表（前 → 后）

| # | 项 | 前 | 后 | 文件 |
|---|----|----|----|------|
| 1 | 期限模型 | `DocketEvent` 无升级态 | 增 `escalationLevel`（none / reminded / escalated_enterprise / at_risk）+ `escalationAt`/`escalationActor`/`atRisk` | `types/index.ts`、`docketRules.ts` |
| 2 | 阶梯纯函数 | 无 | `ladderNextActions` / `applyEscalateAction` / 升级待办 upsert·消账 | `utils/docketEscalate.ts`（新） |
| 3 | 领域写入 | 仅 addDocketEvent | `escalateDocketEvent`：写事件态 + 案时间线 + auditLog（`docketEscalate`/`docketComplete`）+ 可选抬高案 `risk` | `AppContext.tsx`、`domain/commands.ts` |
| 4 | Docket UI | 列表仅办理/案件链 | overdue/due_soon 阶梯按钮（提醒→企业 IP→标风险）+ 办结；角标显示阶梯/风险 | `pages/Docket.tsx` |
| 5 | 动态待办 | 仅 handoff | 升级企业/标风险 → `source=docket` 待办，谁该动=enterprise_ip，深链 `/docket?case=`；办结消账 | `docketEscalate.ts`、`AppContext.tsx`、`workspaces.ts`、`WorkbenchHome.tsx` |
| 6 | 统一 Inbox | 期限行「关注期限」 | 升级后 whoShouldAct=企业 IP；subtitle 含「期限升级」/「风险旗标」；工作台行前缀「期限升级 ·」 | `opsInbox.ts` |

### B. 阶梯 → 副作用

| 动作 | escalationLevel | 动态待办 | 其它 |
|------|-----------------|----------|------|
| remind | reminded | — | 时间线 + audit |
| escalate_enterprise | escalated_enterprise | upsert 期限升级·enterprise_ip | Inbox 谁该动=企业 IP |
| mark_at_risk | at_risk + atRisk | upsert（带风险） | 案 risk→高；Inbox 风险可见 |
| complete | status=done | 同事件 docket 待办 done | 清升级待办 |

### C. 文件列表

- `src/types/index.ts`
- `src/data/docketRules.ts`
- `src/utils/docketEscalate.ts`（新）
- `src/domain/commands.ts`
- `src/context/AppContext.tsx`
- `src/utils/opsInbox.ts`
- `src/data/workspaces.ts`
- `src/pages/Docket.tsx`
- `src/pages/workbench/WorkbenchHome.tsx`
- `OPTIMIZE_NOTES.md`

### D. Verify

- `npx tsc --noEmit` passed
- 验收：overdue（如 de9）可点升级；企业 Persona=`enterprise_ip` Inbox/工作台可见「期限升级」且谁该动=企业 IP；标记风险后 Inbox/角标可见；办结后升级待办清除

### E. 未做 / 建议下一刀

- 真邮件 / Slack / 皮肤（按约束不做）
- **波 2 下一刀：发票停权运营横幅** → 已落地（见下）

## Enterprise Wave2 BillingBanner 2026-09-12

运营视图对称横幅：有逾期未付/停权案时在 Dashboard Inbox、WorkbenchHome、AgentShell 统一可见。代理硬停权 ↔ 企业仅提示不停审；与 HandoffActionBar 单源文案。原型模拟 · 不接真支付。

### A. 对照表（前 → 后）

| # | 项 | 前 | 后 | 文件 |
|---|----|----|----|------|
| 1 | 停权汇总 | 仅案级 `hasBlockingInvoice` / ActionBar | `summarizeBillingHold(visibleCases, role, persona)` 汇总欠票案列表 | `utils/billingHoldBanner.ts`（新） |
| 2 | 文案口径 | ActionBar 内联硬编码 | `BILLING_HOLD_COPY` 单源；ActionBar 改引 caseHeadline/caseBody | `billingHoldBanner.ts`、`HandoffActionBar.tsx` |
| 3 | 运营横幅组件 | 无 | `BillingHoldBanner`：agency 硬（递交已停权）/ enterprise_ip 软（仅提示·不停审）/ inventor·committee 隐藏；无欠票不渲染 | `components/BillingHoldBanner.tsx`（新） |
| 4 | Dashboard | Inbox 无停权提示 | Inbox 区上方挂横幅 + 案链 / 费用中心深链 | `pages/Dashboard.tsx` |
| 5 | WorkbenchHome | 无 | PageHeader 下挂横幅 | `pages/workbench/WorkbenchHome.tsx` |
| 6 | Agent Shell | 无（仅会话列表行角标） | Shell 顶栏下挂 compact 横幅（首页/会话列表/会话页共用） | `components/agent/AgentShell.tsx` |

### B. 角色 × 文案

| 身份 | 变体 | 可见 | 文案要点 |
|------|------|------|----------|
| agency | agency_hard | ✓ | 「递交已停权」· 代理提交/递交禁用（企业侧仅提示、不停审） |
| enterprise_ip | enterprise_soft | ✓ | 「仅提示·不停审」· 代理已停权，企业仍可审 |
| inventor / committee | hidden | ✗ | 不渲染（可改 minimal） |
| 无欠票 / 停权开关关 | — | ✗ | 不渲染 |

### C. 文件列表

- `src/utils/billingHoldBanner.ts`（新）
- `src/components/BillingHoldBanner.tsx`（新）
- `src/pages/Dashboard.tsx`
- `src/pages/workbench/WorkbenchHome.tsx`
- `src/components/agent/AgentShell.tsx`
- `src/components/workbench/flow/HandoffActionBar.tsx`
- `OPTIMIZE_NOTES.md`

### D. Verify

- `npx tsc --noEmit` passed
- 种子案 `c4`（`inv-c4-1` status=逾期）：代理三面（Dashboard / Workbench / Agent）见停权横幅；企业见仅提示；Persona=发明人/委员不渲染
- 付清或关「逾期停权」后横幅消失（费用中心模拟付款 / 开关）

### E. 未做 / 建议下一刀

- 真支付网关 / 皮肤大改（按约束不做）
- **波 2 下一刀：Inbox↔Agent 双向深链加强** → 已落地（见下）

## Enterprise Wave2 InboxDeepLink 2026-09-12

Dashboard Inbox ↔ Agent 会话双向深链加强（原型）：Inbox Agent 行带 `?focus=hitl`/`gate=` 锚定 ConfirmBar；会话/列表待确认反向薄链回运营 Inbox；行信息补齐案号/闸名/谁该动；ConfirmBar 清闸仍走 DynamicTodos 消账。

### A. 对照表（前 → 后）

| # | 项 | 前 | 后 | 文件 |
|---|----|----|----|------|
| 1 | Inbox→Agent 深链 | `/agent/sessions/:id` 裸链 | `agentSessionDeepLink` → `?focus=hitl&gate=<HitlGateId>`；进入后滚到/高亮 ConfirmBar | `opsInbox.ts`、`AgentSessionWorkspace.tsx`、`SessionConfirmBar.tsx`、`index.css` |
| 2 | Agent→Inbox 反向 | 无 | ConfirmBar「在运营 Inbox 中查看」→ `/?inbox=ag-:id#ops-inbox`；SessionsList / Sidebar badge 薄链 | `opsInbox.ts`、`SessionConfirmBar.tsx`、`AgentSessionsList.tsx`、`AgentSessionSidebar.tsx` |
| 3 | Inbox 行信息 | Agent 仅 Agent名·标题；工作台偶缺案号 | Agent 行展示闸名 pill + 谁该动；工作台 `workbenchRowTitle` 始终案号（缺则案 id） | `opsInbox.ts`、`Dashboard.tsx` |
| 4 | Dashboard 锚点 | `#ops-inbox` 仅 KPI | `?inbox=ag-:id` 高亮对应行并 scrollIntoView | `Dashboard.tsx` |
| 5 | DynamicTodos | 已有 handoff 消账 | 核验：ConfirmBar→transitionHandoff→upsert/complete；注释标明无需平行通道 | `dynamicTodos.ts`、`AppContext.tsx`（既有） |

### B. 深链约定

| 方向 | URL | 行为 |
|------|-----|------|
| Inbox → Agent | `/agent/sessions/:id?focus=hitl&gate=approve_strategy` | ConfirmBar `confirm-hitl-focus` + 闸 chip 强调；scrollIntoView |
| Agent → Inbox | `/?inbox=ag-:sessionId#ops-inbox` | 运营 Inbox 行高亮 |
| 列表待确认行 | 同上 / 或 `/#ops-inbox` | badge 旁「运营 Inbox」薄链 |

### C. 文件列表

- `src/utils/opsInbox.ts`（`agentSessionDeepLink` / `opsInboxDeepLink` / 行信息）
- `src/pages/agent/AgentSessionWorkspace.tsx`
- `src/components/agent/session/SessionConfirmBar.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/agent/AgentSessionsList.tsx`
- `src/components/agent/AgentSessionSidebar.tsx`
- `src/utils/dynamicTodos.ts`（核验注释）
- `src/index.css`
- `OPTIMIZE_NOTES.md`

### D. Verify

- `npx tsc --noEmit` passed
- 验收：Inbox Agent 行一点进会话且 HITL 条可见/高亮；反向链回 Inbox 行锚；工作台行带案号；清闸后动态待办仍由 handoff 消账

### E. 未做 / 建议下一刀

- 真路由微服务 / 皮肤（按约束不做）
- **波 2 下一刀：Watch/年费 SLA 入 Inbox** → 已落地（见下 · 波 2 收口）

## Enterprise Wave2 SlaInbox 2026-09-12

Watch 告警 SLA + Maintain 年费日程洞入统一 Inbox（原型收口）：未关闭超 SLA/高风险/待处置 Watch → 深链 `/workbench/watch/:caseId?alert=`；即将到期/逾期年金仅补 **Docket 未覆盖** 的 Maintain 日程洞；KPI 分口径「监控·维持」；Persona 企业看升级/高风险，代理看可处置。

### A. 对照表（前 → 后）

| # | 项 | 前 | 后 | 文件 |
|---|----|----|----|------|
| 1 | Inbox 来源 | 工作台 / Agent / 期限 | + **监控·维持**（`source=sla`） | `opsInbox.ts`、`slaInbox.ts`、`Dashboard.tsx` |
| 2 | Watch → Inbox | 仅工作台 t8 阶段待办 | 未关闭且超 SLA/高风险/待处置告警行；深链 `/workbench/watch/:caseId?alert=`；谁该动按角色 | `slaInbox.ts`、`opsInbox.ts`、`WatchFlow.tsx` |
| 3 | 年费/维持 | Docket 有则入期限；Maintain 日程不入 Inbox | 未缴 + 即将到期/逾期 **且** Docket 无同 `caseId+due` 年费事件 → 补洞；深链 `/workbench/maintain/:caseId` | `slaInbox.ts`、`workbenchSeeds.ts`、`MaintainFlow.tsx` |
| 4 | 与 Docket/handoff 双计 | — | Docket 同 due 硬去重；与工作台阶段待办轻度并存（不同粒度，KPI 分口径诚实标注） | `slaInbox.ts`、`Dashboard.tsx` |
| 5 | Persona | Inbox 仅 full/portal/committee | 企业：升级/高风险/超 SLA/待确认；代理：可处置开告警；inventor/committee 不塞 SLA 行 | `slaInbox.ts`、`opsInbox.ts` |
| 6 | Dashboard KPI | 工作台·Agent·期限 | 待我办理副标可含「监控·维持 N」；期限压力 = 期限+SLA **分口径标注** | `Dashboard.tsx` |
| 7 | 种子 | Watch 无 SLA 日；Maintain 无日程洞 | `al1` `slaDue=2026-09-05`（超 SLA）；`ms-gap` due `2026-09-10`（Docket 未覆盖） | `workbenchSeeds.ts`、`AppContext.tsx` |

### B. 深链 / 去重约定

| 来源 | URL | 入队条件 | 去重 |
|------|-----|----------|------|
| Watch | `/workbench/watch/:caseId?alert=:id` | 未关闭 +（超 SLA ∨ 高风险 ∨ 待处置）+ Persona | 不与 Docket 去重；与工作台 watch 待办轻度并存 |
| 年费洞 | `/workbench/maintain/:caseId` | 未缴 + overdue/≤30d due_soon + Docket 无同 due 年费 | **硬去重** Docket `ruleId=annuity` 同 case+due |

### C. 文件列表

- `src/utils/slaInbox.ts`（新）
- `src/utils/opsInbox.ts`
- `src/types/index.ts`（`WatchAlert.openedAt` / `slaDue`）
- `src/data/workbenchSeeds.ts`
- `src/context/AppContext.tsx`（`mapWatchSeedAlert`）
- `src/pages/Dashboard.tsx`
- `src/pages/workbench/WatchFlow.tsx`（`?alert=`）
- `src/pages/workbench/MaintainFlow.tsx`（日程读种子）
- `OPTIMIZE_NOTES.md`

### D. Verify

- `npx tsc --noEmit` passed
- 验收：Inbox 可见 Watch 超 SLA 行（al1）与/或年费日程洞（ms-gap）；深链进 Watch/Maintain；c6 第2年年费与 Docket de5 同 due 不双计；KPI 分口径

### E. 未做

- 真监控推送 / 皮肤（按约束不做）
- Maintain 日程运行时写回全局 store（仍种子+Flow 本地；Inbox 读种子）

---

## 波 2 五刀收口 · 2026-09-12

企业级波 2 运营闭环五刀已落地，宣布 **波 2 收口**：

| # | 刀 | 要点 | NOTES |
|---|----|------|-------|
| 1 | **DynamicTodos** | 交接驱动动态待办入队列；Persona 可见性；handoff 消账 | Enterprise Wave2 DynamicTodos |
| 2 | **DocketEscalate** | 提醒→升级企业 IP→标风险阶梯；Inbox 期限 who/subtitle | Enterprise Wave2 DocketEscalate |
| 3 | **BillingBanner** | 发票阻断诚实条；案/会话/Inbox 可见 | Enterprise Wave2 BillingBanner |
| 4 | **InboxDeepLink** | Inbox↔Agent `focus=hitl`/`gate=` 双向深链 | Enterprise Wave2 InboxDeepLink |
| 5 | **SlaInbox** | Watch/年费 SLA 入统一 Inbox；分口径监控·维持 | Enterprise Wave2 SlaInbox（本刀） |

波 1 五刀（Inbox / Persona / EvidencePack / VoteGate / OrgSettings）+ 波 2 五刀 = 中台「待我办理」主路径可演示闭环（原型，非真推送/真支付/真 IAM）。

### 波 3 建议第一刀

任选其一作为波 3 开篇：

1. **Catalog Core/Assist/Beta 分层** — Agent 目录按成熟度分层（Core 可派单 / Assist 辅办 / Beta 实验），与 HITL 闸、计费持有、Inbox 深链对齐，避免「目录全能」误导。
2. **案级上下文契约版本化** — 会话/工作台共用 `CaseContext` schema 版本（字段、产物单源、交接键）；写回与 EvidencePack 按版本校验，减少跨刀漂移。

推荐优先：**Catalog Core/Assist/Beta 分层** → **已落地**（见下 · Enterprise Wave3 CatalogTier）。



## Enterprise Wave3 CatalogTier 2026-09-12

企业级波 3 第一刀：Catalog **Core / Assist / Beta** 平台分层，避免把 Assist/Beta 卖成 Core 闭环（原型）。

### A. 对照表（前 → 后）

| # | 项 | 前 | 后 | 文件 |
|---|----|----|----|------|
| 1 | `AgentDef` | 仅 `status`（active/beta/…） | + **`tier: core\|assist\|beta`** + 可选 `tierNote` | `types/index.ts`、`agents.ts` |
| 2 | 九 Agent 分层 | 无平台成熟度 | Core×6 / Assist×1 / Beta×2（诚实缺口） | `agents.ts` |
| 3 | Catalog | 平铺 + 阶段筛选 | **按 tier 分组** + 分层筛选 + `?tier=`；纪律一句 | `AgentCatalogPage.tsx` |
| 4 | 卡片 | status「试用」徽标 | **TierBadge**；Beta 诚实文案 + 软 CTA「试用·非闭环」+ confirm | `AgentPickerCard.tsx`、`AgentTierBadge.tsx` |
| 5 | Home 推荐 | 无分层；chips 直开 | 推荐卡 + tier 徽章；chips 仅 Core；Beta 不入默认可一键闭环；选 Beta 提示 | `AgentHome.tsx` |
| 6 | Harness | 平铺启动 | tier 徽章；Beta 软 CTA；纪律一句 | `AgentHarnessOverview.tsx`、`HARNESS.md` |
| 7 | 闸门 | HITL / 发票等 | **未削弱**（仅分层展示与 Beta 二次确认） | — |
| 8 | Auto RACI | 企业 pre_research → layout(Beta) | → **research(Core)**，避免默认卖 Beta | `agents.ts` `RACI_STAGE_PREF` |

### B. 各 Agent 分层表

| Agent | tier | 依据 / tierNote |
|-------|------|-----------------|
| 调研检索 | **core** | 主办理：检索→报告交接 |
| 交底整理 | **core** | 主办理：disclosure_pack 齐套 |
| 立项评估 | **core** | 主办理：Go/No-Go + 报价双闸 |
| 权利要求撰写 | **core** | 主办理：撰写→授权递交 |
| OA 答复 | **core** | 主办理：争点→确认陈述→授权 |
| 年费与维持 | **core** | 主办理：年费计划·付款解锁 |
| 监控预警 | **assist** | 辅助薄层：告警处置与 claim_chart；诉讼维权升级为长尾，非本 Agent 采购闭环 |
| 转化条款 | **beta** | Beta·非采购闭环：无法务会签闸，批准≠合同 PDF/电子签 |
| 布局洞察 | **beta** | Beta·非采购闭环：洞察矩阵/建案示意仍薄，勿当布局采购主路径 |

### C. 文件列表

- `src/types/index.ts`（`AgentTier`）
- `src/data/agents.ts`（tier / helpers / BETA_HONEST_COPY）
- `src/components/agent/AgentTierBadge.tsx`（新）
- `src/components/agent/AgentPickerCard.tsx`
- `src/pages/agent/AgentCatalogPage.tsx`
- `src/pages/agent/AgentHome.tsx`
- `src/pages/agent/AgentHarnessOverview.tsx`
- `HARNESS.md`
- `OPTIMIZE_NOTES.md`

### D. Verify

- `npx tsc --noEmit` passed
- 验收：每个 Agent 有 tier；Catalog 分组/筛选可见；Home 推荐卡徽章；Beta 非一键当真闭环

### E. 未做 / 建议下一刀

- 真插件市场 / 皮肤大改（按约束不做）
- **波 3 下一刀**：案级上下文契约版本化 → **已落地**（见下 · Enterprise Wave3 CaseContext）


## Enterprise Wave3 CaseContext 2026-09-12

企业级波 3 第二刀：**案级上下文契约版本化** — Agent/工作台/中台同读带 `schemaVersion` 的快照，回放不靠口头约定（原型）。

### A. 对照表（前 → 后）

| # | 项 | 前 | 后 | 文件 |
|---|----|----|----|------|
| 1 | 契约模块 | 无统一案级上下文形状 | **`CASE_CONTEXT_SCHEMA_VERSION='2026.09.1'`** + `buildCaseContext` / `buildCaseContextFromSession` | `src/domain/caseContextContract.ts` |
| 2 | 快照字段 | 分散读 case/handoff/persona | `schemaVersion` · caseId · stage · artifacts[{key,status}] · checklist 摘要 · gates · Persona 可见性 · tier Agent hints · sessionBind | 同上 |
| 3 | CaseDetail UI | 无契约摘要 | 概览可折叠「上下文契约 vX」只读 | `CaseContextContractPanel.tsx`、`CaseDetail.tsx` |
| 4 | Agent 侧栏 | 仅案件/产物碎片 | 同面板 + 会话 `caseId` 薄对齐（`sessionBind.aligned`） | `SessionContextPanel.tsx`、`AgentSessionWorkspace.tsx` |
| 5 | 证据包 | 无契约版本节 | **`schemaVersion` + `caseContext` 一节**（MD §0 / JSON 字段） | `caseEvidencePack.ts` |
| 6 | 纪律文档 | 无 | HARNESS/COMMANDS：变更须 bump 版本 | `HARNESS.md`、`COMMANDS.md` |
| 7 | 大重构 | — | **未做**；仅薄对齐读取路径 | — |

### B. 契约字段摘要

| 字段 | 含义 |
|------|------|
| `schemaVersion` | 契约版本（bump 纪律） |
| `caseId` / `stage` / `stageHandoffKey` | 案与当前阶段 |
| `artifacts[]` | handoff key + status |
| `checklist` | 必做/全部完成摘要 |
| `gates` | 本阶段目录声明闸 + cleared / persona 硬禁态 |
| `personaVisibility` | workbench/go/vote/inbox + blockedHitlGates |
| `agentHints` | 同阶段 Agent × tier（可选） |
| `sessionBind` | 会话 caseId 是否与本案对齐 |

### C. 文件列表

- `src/domain/caseContextContract.ts`（新）
- `src/components/CaseContextContractPanel.tsx`（新）
- `src/pages/CaseDetail.tsx`
- `src/components/agent/session/SessionContextPanel.tsx`
- `src/pages/agent/AgentSessionWorkspace.tsx`
- `src/utils/caseEvidencePack.ts`
- `HARNESS.md` · `COMMANDS.md` · `OPTIMIZE_NOTES.md`

### D. Verify

- `npx tsc --noEmit` passed
- 验收：任意案可 build 带版本快照；UI 可见版本；导出含 schemaVersion + caseContext

### E. 未做 / 建议下一刀

- 真事件溯源库、皮肤（按约束不做）
- **波 3 下一刀建议**：Command/Audit schema 版本 + 回放页 → **已落地**（见下 · Enterprise Wave3 AuditReplay）

## Enterprise Wave3 AuditReplay 2026-09-12

企业级波 3 第三刀：**Command/Audit schema 版本 + 回放页** — 审计条目带 `schemaVersion`，CaseDetail 按时间序回放本案命令（原型 · 内存 auditLog）。

### A. 对照表（前 → 后）

| # | 项 | 前 | 后 | 文件 |
|---|----|----|----|------|
| 1 | Audit 类型 | 无版本字段 | **`AUDIT_SCHEMA_VERSION='2026.09.1'`** + `AuditEntry.schemaVersion?` + `auditSchemaVersionLabel` / `isLegacyAudit` | `src/domain/commands.ts` |
| 2 | 写入 | `pushAudit` 不写版本 | 新写入强制 `schemaVersion`（可显式覆盖） | `AppContext.tsx` |
| 3 | 回放 UI | 仅「最近领域命令」列表 | CaseDetail 审计 Tab **审计回放**面板：时间序、步进、列表高亮、谁/何时/命令/结果摘要、legacy 徽章 | `AuditReplayPanel.tsx`、`CaseDetail.tsx` |
| 4 | 证据包命令序 | 无 per-entry 版本 | JSON/MD 每条带 `schemaVersion`；缺省导出 `legacy` | `caseEvidencePack.ts` |
| 5 | 种子 | 空 log | c1 一条无版本种子 → UI 显示 legacy | `AppContext.tsx` |
| 6 | 纪律文档 | 仅 CaseContext | HARNESS/COMMANDS 增 Audit schema 节 | `HARNESS.md`、`COMMANDS.md` |
| 7 | 真溯源 / tracing / 皮肤 | — | **未做**（按约束） | — |

### B. 验收要点

- 新操作 → audit 带 `2026.09.1`
- 缺版本条目 → 「legacy」
- 回放可按序看本案命令（步进 + 高亮）
- 导出证据包命令序含 schemaVersion
- `npx tsc --noEmit`

### C. 文件列表

- `src/domain/commands.ts`
- `src/context/AppContext.tsx`
- `src/components/AuditReplayPanel.tsx`（新）
- `src/pages/CaseDetail.tsx`
- `src/components/agent/session/SessionContextPanel.tsx`
- `src/utils/caseEvidencePack.ts`
- `HARNESS.md` · `COMMANDS.md` · `OPTIMIZE_NOTES.md`

### D. Verify

- `npx tsc --noEmit` passed（见交付时跑通）

### E. 未做 / 建议下一刀

- 真事件溯源库、分布式 tracing、皮肤（按约束不做）
- **波 3 下一刀建议**：Skills guardrails 中央校验函数 → **已落地**（见下 · Enterprise Wave3 Guardrails）

## Enterprise Wave3 Guardrails 2026-09-12

企业级波 3 第四刀：**Skills guardrails 中央校验函数** — ConfirmBar / Session 闸 / Draft·Prosecution authorize|file 同源 blockers，减少「一边挡一边不挡」（原型 · 非真 LLM 护栏服务）。

### A. 对照表（前 → 后）

| # | 项 | 前 | 后 | 文件 |
|---|----|----|----|------|
| 1 | 中央函数 | 无；ConfirmBar / Workspace / Flow 各写一套 | **`evaluateGuardrails({ agent, case, session, action }) → { ok, blockers[] }`**【唯一入口】 | `src/domain/guardrails.ts` |
| 2 | Session 闸 | `gateDisabledReason` 内联 disclosure/OA/legal/Full-check | 改走 `evaluateGuardrails` + `firstGuardrailMessage` | `AgentSessionWorkspace.tsx` |
| 3 | ConfirmBar 递交 | `submitFile` 自算 filing + `evaluateFullCheck` | 同入口 `action:'file'` | `SessionConfirmBar.tsx` |
| 4 | Draft authorize\|file | validateBefore 自写 disclosure/filing/Full-check | 同入口（表单校验仍本地） | `DraftFlow.tsx` |
| 5 | Prosecution authorize\|file | 自写 oaStatement + Full-check | 同入口 | `ProsecutionFlow.tsx` |
| 6 | Research hits | blockPrimary 有、validateBefore 无（分叉） | validateBefore + inline 补 `hits_verifiable`（更严） | `ResearchFlow.tsx` |
| 7 | Monetize legal | validateBefore 自写 | 同入口复用 legalReview | `MonetizeFlow.tsx` |
| 8 | Intake Go 交底 | submitGo 字面量文案 | 同入口 `go_nogo` + disclosure | `IntakeFlow.tsx` |
| 9 | 调研命中 helper | AgentContext 私有函数 | 抽出 `hasVerifiableResearchHitsFromSession` 复用 | `guardrails.ts`、`AgentContext.tsx` |
| 10 | 硬闸强度 | — | **未削弱**；分叉处以更严为准修齐 | — |

### B. 聚合能力（复用勿复制）

| 检查 | 复用来源 |
|------|----------|
| Persona HITL/交接硬禁 | `personaBlocksHitlGate` / `personaBlocksHandoffAction` |
| disclosure 齐套 / 已批准 | `disclosurePackComplete` + handoff status |
| filing 五清单 | `DraftFilingCheck` |
| Full-check | **`evaluateFullCheck`**（lite + OA meta） |
| OA 陈述 / 争点策略 | case/session flags |
| legalReview | Monetize |
| hits_verifiable | Research（工作台 flag / 会话产物） |
| 企业闸 · 发票阻塞 · 付款解锁 | 与原 Session 逻辑对齐 |

`AgentDef.guardrails[]` 仍为 Catalog 展示文案；可执行硬闸以本模块为准。

### C. 文件列表

- `src/domain/guardrails.ts`（新）
- `src/pages/agent/AgentSessionWorkspace.tsx`
- `src/components/agent/session/SessionConfirmBar.tsx`
- `src/pages/workbench/DraftFlow.tsx`
- `src/pages/workbench/ProsecutionFlow.tsx`
- `src/pages/workbench/ResearchFlow.tsx`
- `src/pages/workbench/MonetizeFlow.tsx`
- `src/pages/workbench/IntakeFlow.tsx`
- `src/context/AgentContext.tsx`
- `HARNESS.md` · `COMMANDS.md` · `OPTIMIZE_NOTES.md`

### D. Verify

- `npx tsc --noEmit` passed
- 验收：ConfirmBar 与 Draft authorize 对 disclosure/Full-check **同源**（均经 `evaluateGuardrails`）

### E. 未做 / 波 3 收口

- 真 LLM 护栏服务、皮肤（按约束不做）
- **波 3 可收口**（CatalogTier / CaseContext / AuditReplay / Guardrails）+ 多租户仍只承诺工作区+Persona；真 IAM 建议文档化 P2

## Enterprise Rescan Fix 2026-09-12

企业级复评（25/35）就地优化 · 原型不接真支付/IAM。用户「优化吧」。

### A. 对照表（前 → 后）

| # | 项 | 前 | 后 | 文件 |
|---|----|----|----|------|
| P0-1 | PayUnlock × Persona | CaseDetail 仅 `role===enterprise`（发明人/委员同 role 可点）；Billing 企业+代理可付；`payInvoice` 无 Persona 闸 | **发明人/委员硬禁**；代理禁付（现网）；`evaluatePayUnlock` / `action:'pay'` 中央校验；AppContext `payInvoice` 拒无权限；按钮 disabled + 原因文案 | `guardrails.ts` · `persona.ts` · `AppContext.tsx` · `CaseDetail` · `Billing` · `MaintainFlow` |
| P0-2 | Beta 路由诚实 | `BY_STAGE`/`RACI` 默认定 monetize(Beta)；布局关键词静默塞 layout；`createSession` 无 tier 确认 | commercialization **勿默认定** monetize；布局关键词改荐 Core 调研；`suggestAgent.requiresTierConfirm`；Auto 对 Beta/Assist 改荐 Core 或强制 confirm；`createSession` 无 `confirmedNonCoreTier` 则拒（Auto 改荐 Core）；侧栏/SessionsList 新建遵守 | `agents.ts` · `AgentContext.tsx` · Catalog/Home/Harness/Sidebar/SessionsList · `AgentSessionWorkspace` |
| P0-3 | 长尾护栏 | Watch/Layout/Maintain/InventorPortal `validateBefore` 未并 `evaluateGuardrails` | approve/authorize/file（及门户批 pack）合并中央护栏；表单本地校验不削弱；以更严为准 | `WatchFlow` · `LayoutFlow` · `MaintainFlow` · `InventorPortal` |
| P1-4 | 证据包 v2 薄 | 无会话 HITL 摘要；AuditReplay 无导出链 | 导出加会话 HITL 决策摘要或「无会话链」诚实句；AuditReplay 链「导出证据包」 | `caseEvidencePack.ts` · `CaseDetail` · `AuditReplayPanel` |
| P1-5 | Maintain 日程 | 仅 Flow 本地 state | 提交/批准时薄写 Drive「年费日程摘要」（全局可读） | `MaintainFlow.tsx` |

### B. 文件列表

- `src/domain/guardrails.ts`（`action:'pay'` · `evaluatePayUnlock`）
- `src/data/persona.ts`（`personaBlocksPay`）
- `src/data/agents.ts`（路由诚实 · `confirmNonCoreTier` · `requiresTierConfirm`）
- `src/context/AppContext.tsx`（`payInvoice` 硬闸）
- `src/context/AgentContext.tsx`（`createSession` tier 确认）
- `src/pages/CaseDetail.tsx` · `Billing.tsx`
- `src/pages/workbench/MaintainFlow.tsx` · `WatchFlow.tsx` · `LayoutFlow.tsx`
- `src/pages/InventorPortal.tsx`
- `src/pages/agent/AgentCatalogPage.tsx` · `AgentHome.tsx` · `AgentHarnessOverview.tsx` · `AgentSessionsList.tsx` · `AgentSessionWorkspace.tsx`
- `src/components/agent/AgentSessionSidebar.tsx`
- `src/utils/caseEvidencePack.ts`
- `src/components/AuditReplayPanel.tsx`
- `OPTIMIZE_NOTES.md`

### C. Verify

- `npx tsc --noEmit` passed

### D. 未做 / 残留

- 真支付网关 / 真 IAM（按约束不做）
- Maintain 年费日程未升为独立全局 store 实体（仅 Drive 摘要薄接；若需 Docket 只读台账可下一刀）
- Auto 路由 UI 文案可再强化「当前改荐 Core · 点确认试用 Beta」横幅（逻辑已强制 confirm / 改荐）
- 证据包会话链仅取本案最近未归档会话（多会话全量链未做）


## Enterprise Rescan Fix2 2026-09-12

承接 Rescan Fix「未做」+ 源码复扫。原型不接真支付/IAM/爬虫。用户「继续优化吧」。

### 阶段 1 · 扫到的残留（本批前）

| # | 残留 | 级 | 出处 | 本批 |
|---|------|----|------|------|
| 1 | Maintain 日程仅 Flow 本地 + Drive 摘要；Inbox 仍读 `maintainSeed` | P0 | `Dashboard.tsx` · `MaintainFlow.tsx` | ✅ 修 |
| 2 | 发明人 URL 软隔离：`/workbench` `/agent` `/cases/:id` `/billing` 可直达 | P0 | `App.tsx` · `persona.ts` 无路由闸 | ✅ 修 |
| 3 | Auto 横幅淡：逻辑已改荐 Core，顶栏仍灰「建议 Agent」 | P1 | `SessionWorkspaceHeader.tsx` | ✅ 修 |
| 4 | 证据包仅绑本案最近未归档会话 | P1 | `CaseDetail.tsx` · `caseEvidencePack.ts` | ✅ 修 |
| 5 | Maintain `showFile` 不走申请 Full-check；authorize/file 未强制日程/预算 | P1 | `fullFilingCheck.ts` · `MaintainFlow` validateBefore | ✅ 修 |
| 6 | Inbox 同案多源无口播（工作台/期限/维持并列表易读成重复） | P1 | `opsInbox.ts` · `Dashboard.tsx` | ✅ 修 |
| — | 委员侧栏仍露撰写等写操作 + 费用中心 | P1 | `Sidebar.tsx` | ✅ 随 2 收 |
| — | 真支付 / 真 IAM / 爬虫 | — | 约束 | 不做 |

### A. 对照表（前 → 后）

| # | 项 | 前 | 后 | 文件 |
|---|----|----|----|------|
| 1 | Maintain 日程单源 | Inbox 读种子；Flow 本地 state；提交只写 Drive 摘要 | **AppContext `maintainSchedulesByCase`** 种子冷启动；`getMaintainSchedule` / `upsertMaintainSchedule`；Flow 编辑/生成/提交写同一 store；Dashboard/`flattenMaintainSchedules` 同读 | `AppContext.tsx` · `slaInbox.ts` · `MaintainFlow.tsx` · `Dashboard.tsx` |
| 2 | Persona 路由硬隔离 | 仅动作闸；URL 可直达工作台/Agent/付款/案详 | **`personaRouteAccess` + `PersonaRouteGate` 拦截页**（非静默 404）；发明人拦 `/workbench/*` `/agent/*` `/billing*` `/cases/:id` → 门户；委员拦写操作页/付款/案详/Agent 会话 HITL → 立项台；侧栏同步藏费用与写阶段 | `persona.ts` · `PersonaRouteGate.tsx` · `Layout.tsx` · `AgentShell.tsx` · `Sidebar.tsx` |
| 3 | Auto 横幅 | 灰条「建议 Agent」 | Beta 需确认：琥珀顶栏 **「当前改荐 Core 办理」** +「确认试用 Beta」；Core 匹配：加深「Auto 已按 Core 匹配」 | `SessionWorkspaceHeader.tsx` |
| 4 | 证据包会话 | 仅最近一条 HITL | 本案未归档会话 **全量摘要**（最近优先）；MD 分节列出；无则仍「无会话链」 | `caseEvidencePack.ts` · `CaseDetail.tsx` |
| 5 | Full-check × Maintain file | authorize/file 只走中央护栏（scope=null）；submit 才查日程 | **明示**年费递交 ≠ 申请 Full-check；authorize/file 同步要求日程+预算齐套 | `fullFilingCheck.ts` · `MaintainFlow.tsx` |
| 6 | Inbox 同案多源 | 并列表无说明 | `annotateSameCaseHints`：`同案另有 N 条（工作台/期限/…）· 非重复待办` | `opsInbox.ts` · `Dashboard.tsx` |

### B. 文件列表

- `src/context/AppContext.tsx`（Maintain 日程 store）
- `src/utils/slaInbox.ts`（`normalizeMaintainRow` · `flattenMaintainSchedules`）
- `src/utils/opsInbox.ts`（`sameCaseHint` · `annotateSameCaseHints`）
- `src/data/persona.ts`（`personaRouteAccess`）
- `src/components/PersonaRouteGate.tsx`（新）
- `src/components/Layout.tsx` · `src/components/agent/AgentShell.tsx` · `src/components/Sidebar.tsx`
- `src/pages/workbench/MaintainFlow.tsx` · `src/pages/Dashboard.tsx` · `src/pages/CaseDetail.tsx`
- `src/components/agent/session/SessionWorkspaceHeader.tsx`
- `src/utils/caseEvidencePack.ts` · `src/utils/fullFilingCheck.ts`
- `OPTIMIZE_NOTES.md`

### C. Verify

- `npx tsc --noEmit` passed

### D. 未做 / 仍剩

- 真支付网关 / 真 IAM / 真爬虫（按约束不做）
- Docket 年费独立只读台账（日程已进全局 store；Docket 事件仍另表，Inbox 按 due 去重）
- 证据包不含已归档会话（刻意 · 未归档全量）
- 委员仍可进 `/agent` 目录/列表（仅拦 `sessions/:id` HITL）；发明人仍可进 `/cases` 列表与 `/docket` 只读
- Full-check 不为年费另开 scope（刻意不适用申请术语/支持戳）
- 真 LLM 护栏 / 皮肤 polish（按约束不做）

## Enterprise Rescan Fix3 2026-09-12

承接 Rescan Fix + Fix2 复评就地优化。原型不接真支付/IAM/爬虫/网盘。用户「你继续安排评估和优化」。

### 阶段 A · 复评摘要（对照旧 25/35）

| 维 | 旧(复评) | Fix2后估 | Fix3后 | 升降原因 |
|----|----------|----------|--------|----------|
| 组织权限 | 3 | 4 | **4** | ↑ pay Persona + `personaRouteAccess`；Fix3 委员全量 `/agent` + `createSession` Persona 闸 + Docket 写闸。未满 5：真 IAM 无；发明人仍可只读 `/cases` 列表与 `/docket`（刻意） |
| 生命周期 | 3 | 3 | **3** | → 九段语汇仍在；无新生命周期能力 |
| 闸门合规 | 4 | 5 | **5** | ↑ Fix 长尾+`pay` 已并 `evaluateGuardrails`；Maintain file 日程/预算齐套。原型满档（非真 LLM 护栏） |
| 可审计 | 4 | 4 | **4** | → 证据包多会话 HITL 已在；仍内存、不含已归档 |
| 可运营 | 4 | 4–5 | **5** | ↑ Maintain 全局 store + Inbox 同案提示；Fix3 Docket↔维持只读台账提示（分表诚实，非双写） |
| 办理诚实 | 4 | 5 | **5** | ↑ Beta/`createSession` tier 闸 + Auto 横幅；无回退 |
| 平台化 | 3 | 3–4 | **4** | ↑ 护栏/Persona/路由跨中台·Agent·工作台更同构；仍双壳命令样机，非微服务 |

**新总分：4+3+5+4+5+5+4 = 30/35**（旧复评 25；+5）。可深 Demo / **建议冻结彩排**；仍不可宣称可采购生产。

### 抽查无回退

| 项 | 结果 |
|----|------|
| pay Persona | ✅ `evaluatePayUnlock` + `payInvoice` 硬闸 |
| Beta createSession | ✅ 无 `confirmedNonCoreTier` 拒；Auto 改荐 Core；签名已补类型 |
| guardrails 长尾 | ✅ Watch/Layout/Maintain/InventorPortal |
| Maintain store | ✅ `maintainSchedulesByCase` / Inbox 同读 |
| personaRouteAccess | ✅ + Fix3 委员全 `/agent` |
| 证据包多会话 | ✅ 未归档全量摘要 |
| Inbox 同案提示 | ✅ `annotateSameCaseHints` |

### A. 对照表（本批前 → 后）

| # | 项 | 前 | 后 | 文件 |
|---|----|----|----|------|
| 1 | 委员 Agent 目录 | 仅拦 `sessions/:id`；可进目录/列表并「新建」 | **全量 `isAgentPath` 拦截**；`createSession` Persona 硬拒；ProductSwitcher 禁用知产 Agent | `persona.ts` · `AgentContext.tsx` · `ProductSwitcher.tsx` |
| 2 | Docket↔Maintain | 日程全局 store 与 Docket 事件分表无对照提示 | 案详只读「年费日程台账」+ Docket 筛案对照条（**明示非双写**） | `CaseDetail.tsx` · `Docket.tsx` |
| 3 | Docket 写 × Persona | 发明人/委员可升级/生成期限 | `escalateDocketEvent` 硬拒；UI disabled + toast | `AppContext.tsx` · `Docket.tsx` |
| 4 | createSession 类型 | 实现签名缺 `confirmedNonCoreTier` | 与接口对齐 | `AgentContext.tsx` |

### B. 文件列表

- `src/data/persona.ts`（委员全 Agent；`personaCanAccessAgent` / `personaCanCreateAgentSession`）
- `src/context/AgentContext.tsx` · `src/context/AppContext.tsx`
- `src/components/ProductSwitcher.tsx`
- `src/pages/CaseDetail.tsx` · `src/pages/Docket.tsx`
- `OPTIMIZE_NOTES.md`

### C. Verify

- `npx tsc --noEmit` passed

### D. 未做 / 仍剩

- 真支付网关 / 真 IAM / 真爬虫 / 真网盘（按约束不做）
- Docket 年费事件与 Maintain store **仍分表**（刻意；只读对照 + Inbox due 去重，不做真双写合并）
- 发明人仍可只读 `/cases` 列表与 `/docket` 浏览（案详/工作台/Agent/付款已拦；Docket 写已拦）— 建议彩排保留
- 证据包不含已归档会话（刻意）
- Full-check 不为年费另开申请 scope（刻意）
- 真 LLM 护栏 / 皮肤 polish（按约束不做）

### E. 冻结彩排建议

**建议冻结彩排**：30/35 焊点稳定，剩洞多为平台债或刻意分表。彩排话术：Persona 可执法演示（发明人门户 / 委员立项 / 企业付款与 HITL）+ Inbox 同真相 + 证据包多会话；勿宣称可采购或真 IAM。

## MidPlatform NodeProgress 2026-09-12

承接中台盘点 P0：消灭「STEPS 只活在 Flow useState、中台不可见」。不接真 IAM/支付/运维平台；不削弱 Persona/guardrails。运维面（日志/监控/模型）本任务禁止。

### A. 对照表（本批前 → 后）

| # | 项 | 前 | 后 | 文件 |
|---|----|----|----|------|
| 1 | Flow STEPS 进度 | 仅各 `*Flow.tsx` `useState(step)` + 本地 `progressStep` | **案级 store** `flowProgressByCase`：`stepIndex` + `stepId` + `updatedAt`；Flow 写回（单调抬高） | `AppContext.tsx` · `usePersistedFlowStep.ts` · 8× `*Flow.tsx` |
| 2 | STEPS 目录 | 各 Flow 内联字符串数组，中台不知标签 | 同源目录 `FLOW_CATALOG` / `stepsForFlow`；Flow 与 CaseDetail 同读 | `data/flowSteps.ts` |
| 3 | CaseDetail 节点树 | 仅阶段条 + `c.progress%`；无子步骤 | **只读**「阶段 → Flow 子步骤完成态」+ 水位时间（CST）；无表单编辑；链办理台 | `CaseDetail.tsx` |
| 4 | `stages.runners` Live | AppContext `runners` + `toggleRunnerStep`（全局非案级、无 UI 消费） | **删除活状态/死 API**；`StageMeta.runners` 保留为静态概念目录；案详折叠「静态 runners」标注非 Live | `AppContext.tsx` · `stages.ts` · `types` · `CaseDetail` |
| 5 | Layout 辅台 | 无阶段映射 | catalog 无 `stageId`；案详单独虚线块展示写回进度 | `flowSteps.ts` · `CaseDetail.tsx` |

### B. 文件列表

- `src/data/flowSteps.ts`（新）
- `src/hooks/usePersistedFlowStep.ts`（新）
- `src/types/index.ts`（`FlowKey` · `CaseFlowNodeProgress`；Runner 废弃注释）
- `src/context/AppContext.tsx`（store API；移除 runners/toggleRunnerStep）
- `src/data/stages.ts`（runners 静态说明）
- `src/pages/CaseDetail.tsx`（只读节点树）
- `src/pages/workbench/{Research,Intake,Draft,Prosecution,Maintain,Monetize,Watch,Layout}Flow.tsx`
- `src/components/workbench/flow/Stepper.tsx`（`readonly string[]`）
- `OPTIMIZE_NOTES.md`

### C. Verify

- `npx tsc --noEmit` passed

### D. 未做 / 仍剩

- 真 IAM / 支付 / 运维平台（按约束不做）
- runners 概念步与 Flow STEPS **不 1:1 合并**（刻意；Flow 为办理真相，runners 为静态目录）
- 进度 store 内存态、无持久化后端（原型）
- 运维面日志/监控/模型应用（交另一 BOT）
- Persona/guardrails 本批未改（刻意不削弱）

### E. runners 决策说明（最小诚实路径）

接线成本高：runners 多实例嵌套、与 Flow STEPS 语汇不一致、原 Live 状态全局非案级且零 UI 消费。故 **删幻觉 API、保留静态目录 + NOTES**，中台进度只认 Flow 写回。

## Monorepo Apps Split 2026-09-12

Phase 0 **单仓物理拆分**（非真微服务 / 非微前端一次到位）。运维面仅占位，交运维平台助手。

### A. 目标 → 落地

| 边界 | 路径 | 端口 | 状态 |
|------|------|------|------|
| contracts | `packages/contracts` `@ip/contracts` | — | commands / AUDIT+CaseContext schemaVersion / handoff 键标签 / DOMAIN_EVENTS / guardrail 纯类型+merge / APP_PORTS |
| mid | `apps/mid` | 5173 | 中台路由壳 + `@shared` |
| workbench | `apps/workbench` | 5174 | Flow + InventorPortal 壳 |
| agent | `apps/agent` | 5175 | `/agent/*` 壳 |
| ops | `apps/ops` | 5176 | **占位页 + README**（不接 ELK） |
| iam | `apps/iam` | 5177 | Login/Persona/工作区薄壳 |

根 `src/` 仍为共享实现；`src/domain/commands.ts` 再导出 `@ip/contracts`；CaseContext schemaVersion 同源。

### B. 启动

```bash
npm run dev:mid | dev:workbench | dev:agent | dev:ops | dev:iam
npm run dev:legacy   # 单体 src/App.tsx 兼容演示
```

`VITE_MULTI_APP=true`（各 app Vite define）：ProductSwitcher / Login 深链 `APP_DEV_URLS`。

### C. Verify（本批）

- 目录树 + workspaces 已建
- `npm run typecheck:contracts` 通过
- mid/workbench/agent/ops/iam 各自 `vite` 可起（冒烟 HTTP 200）
- 业务页大迁入 / 侧栏按面裁剪 → **应用助手**继续；本 BOT 停在安全点

### D. 未做 / 约束

- 不接真微服务网关
- 不削弱 Persona / guardrails 行为（handlers 仍在 `src/`）
- ops 不实现日志/监控/模型运维
- 非一次完美微前端；共享 UI/状态渐进迁

### E. 运维路径一句

**运维面占位在 `apps/ops`（5176），由运维平台助手建设；本仓 Phase 0 只留壳页与 README。**

## 联调彩排 · 多壳深链（2026-09-12）

**口径**：本仓为 **多壳 + 共享内核样机**（非微服务 / 非真 SSO / 非真可观测）。下列步骤只验证跨口深链与样机态同步，不验证生产 SSO 或可观测栈。

### 步骤

1. **同时起三壳**（建议同终端多开或分窗）：
   ```bash
   npm run dev:mid          # http://localhost:5173
   npm run dev:workbench    # http://localhost:5174
   npm run dev:agent        # http://localhost:5175
   ```
2. **mid Inbox → Agent HITL（绝对深链）**：中台 Inbox 点 Agent 待确认行，应跳到 `5175` 会话页（`?focus=hitl` / `gate=`），ConfirmBar 高亮。
3. **HITL 后回工作台 / 中台**：会话内「回办理台 / 回中台」经 `AppLink` / `resolveAppHref` 落到 `5174` / `5173` 绝对 URL（同面内仍相对 path）。
4. **跨口 cookie + bridge**：
   - 验 `persona` / `workspace` cookie 在 5173/5174/5175 可读（localhost host-only cookie，样机「伪 SSO」）。
   - 验 mid `http://localhost:5173/__cross_port_bridge.html`：跨口大块态依赖 mid iframe + postMessage（**样机限制**：mid 须在跑；非共享后端；全量案件态跨口不等同真多租户同步）。
5. **通过 / 失败点**（2026-09-12 浏览器实测 + curl）：

| # | 检查点 | 期望 | 结果 |
|---|--------|------|------|
| 1 | 三壳同时可起 | 5173/5174/5175 HTTP 200 | ✅ curl 冒烟 200（2026-09-12） |
| 2 | Inbox → Agent HITL | 绝对深链到 5175 + focus/gate | ✅ 浏览器：跳 `5175` → `/agent/sessions/sess-layout-1?focus=hitl&gate=approve_strategy` |
| 3 | HITL 后回 WB / mid | AppLink → 5174 / 5173 | ✅ 「回中台案件」→ `5173` `/cases/c1?from=agent` |
| 4 | cookie persona/workspace | 三口同读 | ✅ mid 切「企业 IP」后 5174 同 Persona/租户「企业 IP · 星河智造」 |
| 5 | `__cross_port_bridge.html` | mid 静态页可达；大块态依赖 mid | ✅ `5173/__cross_port_bridge.html` 非 404（空白页正常）；curl 亦 200；大块态仍样机限制 |
| 6 | Insight* → workbench | `navigateApp` → 5174 绝对 URL | ✅ 已清（订正旧「仍 navigate」说法） |

**浏览器实测（2026-09-12）**：Inbox→HITL→回中台通过；bridge 非 404（空白页正常）；Persona/租户 cookie 跨口一致。Insight* 已 `navigateApp`。样机限制仍成立（`CROSS_PORT_LIMITS_ZH`：cookie≠SSO；全量态依赖 mid bridge）。

### 已落地

- `src/lib/deepLinks.ts`（`resolveAppHref` / `surfaceForPath` / `midHref` / `workbenchHref` / …）
- `src/components/AppLink.tsx`：`AppLink` / `AppNavLink`
- **已接组件清单**：PageHeader、BillingHoldBanner、Sidebar、WorkspaceMenu、personaRedirect、workbench flow toast / Handoff / Case*（CaseHeader、CasePicker 等）、agent Session*（SessionConfirmBar / SessionWorkspaceHeader / SessionContextPanel 等）、opsInbox / slaInbox、Dashboard / CaseLibrary / Docket / Pipeline / CaseDetail、**AgentSessionWorkspace toast / AgentSessionsList / InventorPortal / Watch·Monetize·Prosecution·Maintain·Intake Flow / WorkbenchHome actionPath**、Insight* `navigateApp`

### 残留 / 本单续清（2026-09-12 业务深评）

- **Insight\***：已清 — Tracks / Innovate / Layout / Chain 均 `navigateApp(…, workbenchPathForStage(…))`（订正上表旧「仍 navigate」）。
- **本单已接 AppLink**：`AgentSessionWorkspace` toast；`AgentSessionsList` /cases；`InventorPortal` /agent+/cases；Watch/Monetize/Prosecution/Maintain/Intake 跨面链；`WorkbenchHome` 跨面 `actionPath`。详见 `docs/audit/CROSS_PORT_DEBT.md`。
- **样机限制（联调显式）**：`CROSS_PORT_LIMITS_ZH` — cookie≠SSO；大块态依赖 mid:5173 bridge（mid 须在跑；非共享后端）。
- **冻结不动**：Docket×Maintain 分表、Drive 双存、建案进调研台。

## Phase 2 · @ip/app-state（2026-09-12）

迁入跨 app React 状态，根 `@shared/context/*` / `@shared/lib/crossPortStore` 留完整 compat re-export。未改 ops 业务页，未开 `packages/ui`，未强制改调用方 import。

### 包文件

- `packages/app-state/package.json` · `tsconfig.json` · `README.md`
- `packages/app-state/src/index.ts` barrel
- `AppContext.tsx` · `AgentContext.tsx` · `ProductContext.tsx` · `crossPortStore.ts`
- `env.d.ts`（`ImportMeta.env` shim：typecheck 跟随 `@shared/utils/slaInbox` → `deepLinks`）

### Compat re-export

| 根路径 | 符号 | 指向 |
| --- | --- | --- |
| `src/context/AppContext.tsx` | `AppProvider`, `useApp` | `@ip/app-state` |
| `src/context/AgentContext.tsx` | `AgentProvider`, `useAgents` + types | `@ip/app-state` |
| `src/context/ProductContext.tsx` | `ProductProvider`, `useProduct` | `@ip/app-state` |
| `src/lib/crossPortStore.ts` | snapshot/cookie/bridge API | `@ip/app-state` |

ProductContext 虽薄，但是 saas/agent 跨面产品开关，一并迁入。

### 未做

- 调用方仍走 `@shared/context/*`（刻意兼容）
- `react-router-dom` 未列入包 deps（context 未 import）
- UI 组件包 / 拆 context 体积
