# DEEP_NODE_EVAL · Agent（IP 办理）× SaaS 业务工作台

日期：2026-09-11（UTC+8）  
范围：仅 `/workspace/ip-harness` 内 `/agent/*` 与 `/workbench/*`（含 `FlowChrome`/`flow/*`）  
方法：通读 `COMMANDS.md` / `HARNESS.md` / `AGENT_UX.md` / `OPTIMIZE_NOTES.md` + 源码核验（页面、上下文、命令面、闸门数据）；**不改代码**。  
评分刻度：**高 / 中 / 低**（业务故事是否立得住，而非像素 polish）。

---

> **修复进度（2026-09-11 UTC+8）**：Top 5 深问题已落地 — ✅ P0-1 交底 `disclosure_pack`；✅ P0-2 等效演示降级；✅ P1-3 布局 `layout_insight` + 调研台深链；✅ P1-4 ConfirmBar 命令链预告；✅ P1-5 Maintain/Agent 付款解锁对齐。详见 `OPTIMIZE_NOTES.md` Round · Business-logic Deep Top 5。


## 1. Executive Summary

**结论：两条产品线已经不只是壳 UI，可以演示「深度业务」——但深度不均匀。**

- **SaaS 工作台**在「调研 → 立项 → 撰写 → OA」四段上，业务故事最完整：步进字段、`REQUIRED_BEFORE_SUBMIT`、企业/代理 RACI、发票阻塞、回执归档、Docket 回写、成功 Toast「下一步」串成闭环。年费 / 转化 / 监控明显变薄，但仍走同一交接状态机。
- **IP 办理（Agent）**在「会话生命周期 + 差异化 HITL + `dispatchCommand` 写回」上叙事完整，九个专业 Agent 有独立脚本/工具/闸门；真正「表单级字段校验」仍偏 mock 剧本，正式执行主要靠工具卡 + HITL 链，而不是逐步填表。
- **共用命令面是真的**（`AppContext.dispatchCommand`，审计 `actor: user | agent`），这是双产品 demo 的核心资产。
- **不能假装没有空洞**：交底 Agent 与立项共用 `intake_quote`；布局 Agent 跳洞察而非工作台；Agent 侧「一键等效演示」可绕过逐步 HITL；年费付款闸在 Agent 与工作台路径不对称；监控→转化的 Toast 下一步业务跳跃生硬。

**一句话**：能 demo 深业务（尤其调研/OA/立项交接），但若干 specialty 与跨壳写回仍是「剧本深度 > 表单深度」或「命令链捷径」，需按下方 P0/P1 修业务一致性后才能抗住客户盘问。

---

## 2. Agent 树评估（`/agent/*`）

```
产品入口 AgentHome
 ├─ 办理入口 HarnessOverview
 ├─ 目录 Catalog（专业 Agent 插件）
 │   ├─ 调研检索 · approve_strategy
 │   ├─ 交底整理 · approve_strategy（handoff→intake_quote ⚠）
 │   ├─ 立项评估 · go_nogo + confirm_quote
 │   ├─ 权利要求 · approve_strategy
 │   ├─ OA 答复 · approve_strategy + authorize_file
 │   ├─ 年费维持 · pay_unlock
 │   ├─ 转化条款 · approve_strategy（beta）
 │   ├─ 监控预警 · approve_strategy
 │   └─ 布局洞察 · approve_strategy（→洞察/建案）
 ├─ 会话列表 SessionsList（搜索/归档/重命名）
 └─ 会话工作区 SessionWorkspace
     ├─ 创建 / 关联案件 / Auto 路由
     ├─ 预览(dry-run) / 正式执行(formal)
     ├─ Timeline 工具卡 + 产物
     ├─ HITL ConfirmBar（按 Agent 闸门）
     ├─ 递交归档 / 写回 / 打开工作台
     ├─ 一键等效演示
     └─ 归档 / 失败重试 / 换人清空闸门
```

### 2.1 产品入口 · `AgentHome`（`src/pages/agent/AgentHome.tsx`）

| 维度 | 评级 | 要点 |
|------|------|------|
| 业务完整度 | **中高** | 「说明要办的事 → 选办理人/案件 → 开会话」立得住；推荐 4 个高频 Agent；继续会话/继续案件续办。洞察快捷办理要求先有案件，避免硬编码。 |
| 状态覆盖 | **中** | 有空目标回退 `defaultSessionGoal`；缺全局 loading/error（本地 SPA 可接受）。洞察无案有 hint。 |
| 闸门与权限 | **中** | 入口本身不执法门；租户切换在 Login/工作区，Home 不强调企业/代理差异。 |
| 中台衔接 | **中高** | `?case=` 预选；链到案件详情；文案强调「关联后回写中台」。 |
| UI/UX 摩擦 | **低–中** | 非 chatbot hero，偏工作台；「办理入口」链到 Harness。推荐条未覆盖交底/年费/布局。 |

**缺口**：P2 — Home 推荐过窄（缺交底/年费），演示「全生命周期」需绕 Catalog。

### 2.2 办理入口 · `AgentHarnessOverview`（`src/pages/agent/AgentHarnessOverview.tsx`）

| 维度 | 评级 | 要点 |
|------|------|------|
| 业务完整度 | **中** | Round 6 已压 About 感：CTA + 办理人行表 + 运行时 `<details>`；仍偏「说明页」。 |
| 状态覆盖 | **低** | 静态说明，无会话态。 |
| 闸门与权限 | **低** | 只展示概念，不执法。 |
| 中台衔接 | **中** | 链到目录/会话；解释 Command 概念依赖文档而非页内对照。 |
| UI/UX 摩擦 | **中** | 演示若从 Harness 开场仍像说明书（`OPTIMIZE_NOTES` / `RESIDUAL` P2-5）。 |

**缺口**：P2 — 继续压成「开始办理」入口，架构细节外置 `HARNESS.md`。

### 2.3 目录 · `AgentCatalogPage`（`src/pages/agent/AgentCatalogPage.tsx` + `data/agents.ts`）

| 维度 | 评级 | 要点 |
|------|------|------|
| 业务完整度 | **高** | 九个 `AgentDef`：tools / hitlGates / handoffKey / workbenchPath / RACI / systemPrompt；单列「开始办理」。 |
| 状态覆盖 | **中** | 搜索/阶段空态；`active|beta`；无「该租户不可用」态。 |
| 闸门与权限 | **中** | Catalog 展示闸门标签；不按企业/代理隐藏 Agent（路由差异在会话内）。 |
| 中台衔接 | **中高** | `workbenchPath` 声明对齐；详情折叠「工具 N · 需确认 N」。 |
| UI/UX 摩擦 | **低** | 密度正确；开始办理**不预绑案件** → 进会话后需再选案。 |

**缺口**：P1 — Catalog「开始办理」应可选带 `?case=` / 最近案件，否则正式执行常撞「尚未关联案件」琥珀条。

### 2.4 会话列表 · `AgentSessionsList` + `AgentSessionSidebar`

| 维度 | 评级 | 要点 |
|------|------|------|
| 业务完整度 | **中高** | 搜索共享 `sessionSearch`；重命名；归档 + 轻撤销 toast。 |
| 状态覆盖 | **高** | 运行中 / 待确认 / 完成 / 失败 / 已归档筛选。 |
| 闸门与权限 | **中** | 列表不区分角色待办（与工作台队列的 RACI 不对称）。 |
| 中台衔接 | **中** | 行内可见案件；无「未写回」徽章。 |
| UI/UX 摩擦 | **低** | 整行进入；归档可撤销。 |

**缺口**：P2 — 列表缺「待企业确认 / 发票阻塞」业务徽章，演示切换角色后不易扫到该办会话。

### 2.5 会话生命周期 · `AgentSessionWorkspace` + `AgentContext`

文件：`AgentSessionWorkspace.tsx`、`session/*`、`context/AgentContext.tsx`、`sessionGates.ts`。

#### 2.5.1 创建 / 绑定 / Auto 路由

| 维度 | 评级 | 要点 |
|------|------|------|
| 业务完整度 | **高** | `suggestAgent`：交接态 → RACI 工作区 → 阶段 → 关键词；横幅中文理由。 |
| 状态覆盖 | **高** | 无案琥珀条「确认后不会写回中台」+ 去选案件；Auto 建议芯片。 |
| 闸门与权限 | **高** | 企业工作区偏审批 Agent，代理偏执行（`RACI_STAGE_PREF`）。 |
| 中台衔接 | **高** | 绑定 `caseId` 后 HITL/工具才写领域。 |
| UI/UX 摩擦 | **低** | 换人清空 `clearedHitlGates` + 确认「确认步骤需重来」。 |

#### 2.5.2 预览 vs 正式执行

| 维度 | 评级 | 要点 |
|------|------|------|
| 业务完整度 | **高** | dry-run 只 transcript；formal 在工具成功时按 `TOOL_TO_COMMAND` 调 `dispatchCommand`。 |
| 状态覆盖 | **中高** | playing / needs_human / failed+重试 / done。 |
| 闸门与权限 | **高** | HITL 不可跳过（正式路径）；Composer 确认态降级。 |
| 中台衔接 | **中高** | 多数工具 `TOOL_TO_COMMAND=null`（仅缓冲）；真正写库靠 HITL 或少数工具（submit/file/assign/create）。 |
| UI/UX 摩擦 | **中** | 用户可能误以「工具卡出现 = 已写中台」；需依赖「已写入领域」条。 |

**缺口**：P1 — 正式执行与 HITL 的「何时写库」对演示者不够外显（Timeline 工具成功 vs 确认条写回）。

#### 2.5.3 HITL 闸门 / ConfirmBar

| 维度 | 评级 | 要点 |
|------|------|------|
| 业务完整度 | **高** | `gateToAction` → `sessionHitlAction`：approve / authorize / go_nogo / confirm_quote / pay_unlock / request_changes 分派不同命令链。 |
| 状态覆盖 | **高** | 步进圆点；已通过禁用；发票阻塞文案；OA 授权后「递交归档」。 |
| 闸门与权限 | **高** | 企业专属闸；代理仅 `approve_strategy`=提交；授权递交企业专属；代理发票阻塞。 |
| 中台衔接 | **高** | 成功前缀「中台已更新」+ 打开案件/工作台；审计 `actor:'agent'`。 |
| UI/UX 摩擦 | **中** | 企业一点「批准策略」常自动 `submit→startReview→approve`（捷径），与工作台逐步点按钮不完全同构。 |

**缺口**：P1 — HITL 自动串命令与工作台逐步交接的 parity 需在 UI 标明「将连续写入：Submit → …」，避免审计墙一次蹦出多条让客户困惑。

#### 2.5.4 一键等效演示

| 维度 | 评级 | 要点 |
|------|------|------|
| 业务完整度 | **中** | 九 specialty 均有命令链捷径；文档标明「演示捷径 · 正式产品应逐步 HITL」。 |
| 状态覆盖 | **中** | 瞬时完成；弱化失败/退回路径。 |
| 闸门与权限 | **低–中** | 按角色分支，但仍跳过逐步确认体验。 |
| 中台衔接 | **高** | 真正写 `dispatchCommand`，可对比审计。 |
| UI/UX 摩擦 | **高（业务风险）** | 若演示默认点它，会挖空「HITL 不可跳过」故事。 |

**缺口**：P0 — 演示话术/默认 CTA 必须把「等效演示」降为次要；主路径坚持正式执行 + ConfirmBar。

#### 2.5.5 写回 / 归档 / 失败

| 维度 | 评级 | 要点 |
|------|------|------|
| 业务完整度 | **中高** | 产物 `addArtifact`；OA `fileResponse`；布局 `createCaseFromInsight`+`assignAgency`。 |
| 状态覆盖 | **中高** | failed 种子可重试；归档撤销。 |
| 闸门与权限 | **中** | Agent 递交归档自动生成回执号（工作台要求手填）— 见交叉节。 |
| 中台衔接 | **高** | CaseDetail `?from=agent` 横幅（文档约定）。 |
| UI/UX 摩擦 | **低** | 右栏默认折叠，减少工程师腔。 |

---

### 2.6 专业 Agent 子节点（差异化）

#### 调研检索 · `agent-research`

| 维度 | 评级 | 说明 |
|------|------|------|
| 业务完整度 | **高** | 检索→聚类→报告→`approve_strategy`；formal 可走 `submit_for_review`→`submitResearch`。 |
| 状态覆盖 | **高** | 剧本含 question_to_human；种子会话 running。 |
| 闸门与权限 | **高** | 代理提交 / 企业批准。 |
| 中台衔接 | **高** | `handoffKey=research_report` · `/workbench/research/:id`。 |
| UX 摩擦 | **低** | 与工作台最可对照的 demo 路径。 |

#### 交底整理 · `agent-disclosure` ⚠

| 维度 | 评级 | 说明 |
|------|------|------|
| 业务完整度 | **中低** | 结构化交底剧本完整，但 **`handoffKey: 'intake_quote'`** 与立项 Agent 冲突；`workbenchPath: '/inventor'` 不是七段工作台。 |
| 状态覆盖 | **中** | 有脚本与 HITL；无独立 handoff 产物键。 |
| 闸门与权限 | **中** | 仅 `approve_strategy`；业务上发明人/协调角色在门户，会话内难体现。 |
| 中台衔接 | **低** | 写入立项报价交接，污染立项态；与 `IntakeFlow`/`REQUIRED_BEFORE_SUBMIT.intake_quote` 语义错位。 |
| UX 摩擦 | **高** | 「打开对应工作台」进发明人门户，客户会问「交底台账在哪」。 |

**缺口**：P0 — 交底应有独立 `HandoffArtifactKey`（如 `disclosure_pack`）或明确只写 InventorPortal 而不碰 `intake_quote`。（`data/agents.ts`）

#### 立项评估 · `agent-intake`

| 维度 | 评级 | 说明 |
|------|------|------|
| 业务完整度 | **高** | `go_nogo` + `confirm_quote` 双闸；评分/报价剧本。 |
| 状态覆盖 | **中高** | 双闸剩余提示；但 `go_nogo` 成功写 `confirmQuote` 时可能顺带 clear `confirm_quote`（捷径）。 |
| 闸门与权限 | **高** | 仅企业。 |
| 中台衔接 | **高** | → `confirmQuote` / intake 交接。 |
| UX 摩擦 | **中** | 与工作台「委员投票 + Go 按钮」粒度不同（Agent 无投票 UI）。 |

**缺口**：P1 — Go 与确认报价闸门合并逻辑需产品确认，避免「只点 Go 就报价已确认」。

#### 权利要求 · `agent-claims`

| 维度 | 评级 | 说明 |
|------|------|------|
| 业务完整度 | **中高** | 独权/从权产物可编辑；`submitClaims`。 |
| 状态覆盖 | **中** | 无工作台级「递交检查清单」强制。 |
| 闸门与权限 | **高** | approve_strategy。 |
| 中台衔接 | **中高** | `/workbench/draft`；Agent 侧缺 authorize/file 闸（工作台 Draft 有 `showFile`）。 |
| UX 摩擦 | **中** | 国别策略在剧本 tool 有、HITL 不强制。 |

**缺口**：P1 — Claims Agent 与 DraftFlow 的「授权递交/回执」能力不对等。

#### OA 答复 · `agent-oa`

| 维度 | 评级 | 说明 |
|------|------|------|
| 业务完整度 | **高** | 双闸 + 递交归档 + Docket；最强 Agent 业务故事之一。 |
| 状态覆盖 | **高** | 授权后 ConfirmBar 出「递交归档」；发票阻塞。 |
| 闸门与权限 | **高** | 企业授权；代理递交。 |
| 中台衔接 | **高** | `analyzeAndSubmitOA` / `authorizeFile` / `fileResponse`。 |
| UX 摩擦 | **低–中** | 自动回执号 vs 工作台手填（parity）。 |

#### 年费维持 · `agent-annuity`

| 维度 | 评级 | 说明 |
|------|------|------|
| 业务完整度 | **中高** | `pay_unlock`→`payInvoice` + 年费交接/file；无票可跳过并提示。 |
| 状态覆盖 | **中** | 依赖案件发票种子；无票时「跳过」可能掩盖财务故事。 |
| 闸门与权限 | **中高** | 付款解锁；企业/财务叙事靠文案。 |
| 中台衔接 | **中** | 工作台 Maintain **不**直接暴露 `payInvoice`，靠 handoff approve/file。 |
| UX 摩擦 | **中** | 演示需预置逾期发票，否则闸门故事弱。 |

**缺口**：P1 — 统一「付款解锁」在 Agent 与 MaintainFlow/Billing 的入口与命令。

#### 转化条款 · `agent-monetize`（beta）

| 维度 | 评级 | 说明 |
|------|------|------|
| 业务完整度 | **中** | 条款/费率剧本；交接 `monetize_terms`。 |
| 状态覆盖 | **中** | 无合同审批多级、无法务会签。 |
| 闸门与权限 | **中** | 仅策略批准。 |
| 中台衔接 | **中** | 有路径；深度不如调研/OA。 |
| UX 摩擦 | **中** | beta 标识正确。 |

#### 监控预警 · `agent-watch`

| 维度 | 评级 | 说明 |
|------|------|------|
| 业务完整度 | **中** | 扫描/威胁/告警；`watch_alert`。 |
| 状态覆盖 | **中** | 无「忽略/升级维权」在 Agent HITL 的分化（工作台 Watch 有角色裁剪动作）。 |
| 闸门与权限 | **中** | approve_strategy。 |
| 中台衔接 | **中** | `/workbench/watch`。 |
| UX 摩擦 | **中** | 处置路径粗。 |

#### 布局洞察 · `agent-layout`（beta）

| 维度 | 评级 | 说明 |
|------|------|------|
| 业务完整度 | **中** | 矩阵/空白点/建案/派所；HITL 批准后 `createCaseFromInsight`+`assignAgency`。 |
| 状态覆盖 | **中** | 建案成功依赖 formal/HITL。 |
| 闸门与权限 | **中** | 企业批准后派所。 |
| 中台衔接 | **低–中** | `workbenchPath='/insight/layout'`，**跳出工作台七段**；handoff 仍用 `research_report`。 |
| UX 摩擦 | **高** | 「打开对应工作台」进洞察页，与 Catalog「阶段=调研」易混。 |

**缺口**：P1 — 布局补强应建案后深链 `/workbench/research/:newId`，handoff 勿占用调研报告键或单独键。

---

## 3. Workbench 树评估（`/workbench/*` + flow）

```
WorkbenchHome（队列 / 阶段入口）
 ├─ ResearchFlow   检索配置→结果→可专利性→FTO→结论提交
 ├─ IntakeFlow     披露→双维评分→投票→Go/No-Go
 ├─ DraftFlow      交底书→权利要求→申请策略→清单
 ├─ ProsecutionFlow OA登记→争点→修改→答复书（+回执）
 ├─ MaintainFlow   权利状态→年费→变更→交接
 ├─ MonetizeFlow   路径→条款→里程碑→交接
 └─ WatchFlow      规则→告警处理→交接
     共用：CasePicker · Stepper · SplitDraft · VersionPanel
           HandoffActionBar · ToastNext · dispatchCommand
```

### 3.1 Home · `WorkbenchHome.tsx`

| 维度 | 评级 | 要点 |
|------|------|------|
| 业务完整度 | **高** | 待办按角色 + fulfillmentMode 过滤（自助/委托 RACI）；阶段入口七卡。 |
| 状态覆盖 | **高** | 空队列引导；期限紧急色。 |
| 闸门与权限 | **高** | 企业偏审核阶段，代理偏执行阶段。 |
| 中台衔接 | **高** | `actionPath` 直达具体 flow+案件。 |
| UI/UX 摩擦 | **低** | 主 CTA「办理首条待办」正确。 |

### 3.2 共用子节点（flow chrome）

#### `HandoffActionBar`（业务心脏）

| 维度 | 评级 | 要点 |
|------|------|------|
| 业务完整度 | **高** | save/submit/approve/request_changes/authorize/file；按 handoffKey 文案；必填清单；退回批注单入口。 |
| 状态覆盖 | **高** | 禁用原因内联；发票阻塞 alert；已归档回执展示。 |
| 闸门与权限 | **高** | `canPerformHandoff` + self_serve 角色映射；代理不可批。 |
| 中台衔接 | **高** | 全部 `dispatchCommand(actor:'user')`。 |
| UI/UX 摩擦 | **中** | ~446 行维护重；企业/代理提示文案清晰。 |

#### `Stepper` / `CasePicker` / `VersionPanel` / `ToastBanner`

| 节点 | 业务完整度 | 缺口 |
|------|------------|------|
| Stepper | 中（视觉进度，不强制锁步） | P2：可跳步，清单才是真闸 |
| CasePicker | 中高（按 stage 过滤） | P2：跨阶段案件易找不到 |
| VersionPanel | 中高（只读历史，退回归 ActionBar） | — |
| nextActionsForStage | 中（阶段跳转） | P1：monitoring→monetize、drafting→prosecution 业务跳跃/略过授权维持现实 |

#### 发票阻塞

| 维度 | 评级 | 要点 |
|------|------|------|
| 业务完整度 | **高** | 代理 submit/file 停权；企业仍可审；链费用中心。 |
| 与 Agent | **中高** | Agent 侧重授权/递交；工作台侧重 submit/file — 规则同源 `hasBlockingInvoice`。 |

---

### 3.3 ResearchFlow（最深）

| 维度 | 评级 | 要点 |
|------|------|------|
| 业务完整度 | **高** | 关键词/库/命中勾选→滑块与结论绑定；空命中不可过闸；批准后 `advanceStage` 转入立项。 |
| 状态覆盖 | **高** | inlineError、toast、清单 chip。 |
| 闸门与权限 | **高** | 交接 RACI；转入立项仅企业且需已批准。 |
| 中台衔接 | **高** | `submitResearch` / `approveHandoff` / `advanceStage`。 |
| UX 摩擦 | **低** | SplitDraft 摘要自动汇编，演示友好。 |

### 3.4 IntakeFlow

| 维度 | 评级 | 要点 |
|------|------|------|
| 业务完整度 | **高** | 披露字段、双维分、委员投票、Go/No-Go；委托须报价交接批准，自助须预算。 |
| 状态覆盖 | **中高** | No-Go 记活动/产物但不走复杂关闭态。 |
| 闸门与权限 | **高** | Go 仅企业。 |
| 中台衔接 | **高** | `confirmQuote` / `advanceFromWorkbench`。 |
| UX 摩擦 | **中** | 投票为本地 state，不进命令审计；与 Agent 立项双闸粒度不同。 |

**缺口**：P2 — No-Go 后案件阶段/看板无强状态机（仅活动流）。

### 3.5 DraftFlow

| 维度 | 评级 | 要点 |
|------|------|------|
| 业务完整度 | **高** | 权利要求校验、国别、递交清单、`showFile`。 |
| 状态覆盖 | **高** | `blockPrimary` 未齐套不可递交。 |
| 闸门与权限 | **高** | 交接+授权+回执。 |
| 中台衔接 | **高** | `submitClaims` 等。 |
| UX 摩擦 | **低–中** | 官费示意；下一步跳到审查略跳过「已递交等待一通」现实。 |

### 3.6 ProsecutionFlow

| 维度 | 评级 | 要点 |
|------|------|------|
| 业务完整度 | **高** | OA 登记、争点、修改对照、答复、回执、`DeadlineChip`。 |
| 状态覆盖 | **高** | 期限可视化。 |
| 闸门与权限 | **高** | 完整授权/递交。 |
| 中台衔接 | **高** | `analyzeAndSubmitOA` / `fileResponse`→Docket。 |
| UX 摩擦 | **低** | 与 OA Agent 最佳对照。 |

### 3.7 MaintainFlow

| 维度 | 评级 | 要点 |
|------|------|------|
| 业务完整度 | **中** | 年费日程/预算清单/file；**无显式 payInvoice 按钮**。 |
| 状态覆盖 | **中** | 左右栏略空（既有评价）。 |
| 闸门与权限 | **中** | 交接态；付款故事弱于 Agent `pay_unlock`。 |
| 中台衔接 | **中** | file 可回写；财务中心靠 Toast「去费用」。 |
| UX 摩擦 | **中** | 与 Billing 双入口叙事需口播补齐。 |

**缺口**：P1 — 在 Maintain 交接区增加「付款解锁」或明确链到 Billing 并回写同一命令。

### 3.8 MonetizeFlow

| 维度 | 评级 | 要点 |
|------|------|------|
| 业务完整度 | **中** | 路径/对手/费率/里程碑；清单 party+terms。 |
| 状态覆盖 | **中** | 短流程。 |
| 闸门与权限 | **中** | 通用交接，无单独法务闸。 |
| 中台衔接 | **中** | `monetize_terms`。 |
| UX 摩擦 | **中** | 商业深度演示偏薄。 |

### 3.9 WatchFlow

| 维度 | 评级 | 要点 |
|------|------|------|
| 业务完整度 | **中高** | 规则/告警；角色裁剪主钮；可生成调研案。 |
| 状态覆盖 | **中** | 「更多」仍在但已降噪。 |
| 闸门与权限 | **中高** | 企业升级 vs 代理确认。 |
| 中台衔接 | **中** | `watch_alert`；Docket 风险条外链。 |
| UX 摩擦 | **中** | `nextActionsForStage('monitoring')` →「去转化」业务不自然。 |

**缺口**：P1 — 监控成功下一步应优先「去期限/回案件/生成调研」，而非转化。

### 3.10 缺失的工作台节点 · 交底

发明交底在 Agent 有专用插件，工作台侧落在 **`/inventor` 门户 + Intake 披露字段**，无 `/workbench/disclosure`。

**缺口**：P0/P1 — 产品树不对称：要么补交底 Flow，要么 Catalog/会话写回明确「门户」而非立项 handoff。

---

## 4. Cross-link · Agent ↔ Workbench

| 主题 | 现状 | 判定 |
|------|------|------|
| 同一命令面 | `domain/commands.ts` + `dispatchCommand`；COMMANDS.md 映射表完整 | **真共用 · 高** |
| 审计对照 | `actor: user \| agent`；会话右栏 + 案件详情 | **可 demo · 高** |
| Handoff 键对齐 | 七阶段键基本 1:1；**交底占用 intake_quote；布局占用 research_report** | **P0 裂缝** |
| 路径互跳 | Agent 成功条「打开对应工作台」；Flow `CaseHeader`「IP 办理协助」 | **高** |
| HITL vs 交接栏 | Agent 常自动串多命令；工作台逐步点 | **行为不对称 · P1** |
| 回执 | Agent OA 自动生成；工作台强制手填 | **P1 parity** |
| 付款 | Agent `pay_unlock`；工作台 Maintain 无同名闸 | **P1** |
| 清单深度 | 工作台 `checkedRequired` 真校验；Agent 靠剧本产物 | **深度不对称（可接受若口播）** |
| 一键演示 | 仅 Agent | **勿当主路径 · P0 话术** |
| Auto 路由 vs 待办队列 | 两端都有 RACI，但列表维度不同 | **P2** |

**总评**：命令面与主路径（调研/OA）交叉演示足够深；specialty 键冲突与写回捷径是「深业务」被打穿的主要风险，不是皮肤问题。

---

## 5. Top 8 最值得先修的深问题（业务优先）

1. **P0 · 交底 Agent 污染立项交接键**  
   `agent-disclosure.handoffKey = 'intake_quote'` + `workbenchPath='/inventor'`（`data/agents.ts`）。批准交底会推动价/立项态，业务故事错误。  
   → 独立 artifact key，或只写门户/产物不改 intake handoff。

2. **P0 · 「一键等效演示」稀释 HITL 不可跳过叙事**  
   `AgentContext.runEquivalenceDemo` + 会话更多菜单。  
   → 默认隐藏或强警示；销售主路径锁「正式执行 → ConfirmBar」。

3. **P1 · 布局 Agent 的工作台/handoff 错位**  
   `workbenchPath='/insight/layout'`、`handoffKey='research_report'`。  
   → 建案后深链 research workbench；handoff 独立或复用洞察命令审计。

4. **P1 · HITL 自动串命令 vs 工作台逐步交接的审计可读性**  
   `sessionHitlAction` 内 submit→startReview→approve/authorize。  
   → UI 预告命令链；或提供「逐步模式」与表单同构。

5. **P1 · 年费「付款解锁」双路径不对称**  
   Agent：`payInvoice`；Maintain：`HandoffActionBar` 无 pay。  
   → Maintain 增加付款解锁或强制跳转 Billing 再回写同一命令。

6. **P1 · OA/撰写回执 parity**  
   ConfirmBar 自动 `receiptNo`；工作台必填回执/日期。  
   → Agent 递交弹出回执表单，或明示「演示自动回执」。

7. **P1 · Catalog/Home 开始办理常无案件**  
   `AgentCatalogPage.startWith` 不绑案 → 无案琥珀条打断正式写回。  
   → 开始办理带最近案件 / 强制选案模态。

8. **P1 · `nextActionsForStage` 业务跳跃**  
   监控→转化、撰写成功→审查（跳过递交等待）。（`flow/toast.tsx`）  
   → 按阶段改成期限/案件/同阶段深化，少跨业态硬跳。

---

## 附录 · 节点评分速查

| 节点 | 业务完整度 | 状态覆盖 | 闸门权限 | 命令衔接 | UX 摩擦 |
|------|------------|----------|----------|----------|---------|
| AgentHome | 中高 | 中 | 中 | 中高 | 低–中 |
| Catalog | 高 | 中 | 中 | 中高 | 低 |
| Session 生命周期 | 高 | 高 | 高 | 高 | 中 |
| Research Agent | 高 | 高 | 高 | 高 | 低 |
| Disclosure Agent | 中低 | 中 | 中 | 低 | 高 |
| Intake Agent | 高 | 中高 | 高 | 高 | 中 |
| Claims Agent | 中高 | 中 | 高 | 中高 | 中 |
| OA Agent | 高 | 高 | 高 | 高 | 低–中 |
| Annuity Agent | 中高 | 中 | 中高 | 中 | 中 |
| Monetize/Watch/Layout | 中 | 中 | 中 | 低–中 | 中–高 |
| WorkbenchHome | 高 | 高 | 高 | 高 | 低 |
| ResearchFlow | 高 | 高 | 高 | 高 | 低 |
| IntakeFlow | 高 | 中高 | 高 | 高 | 中 |
| DraftFlow | 高 | 高 | 高 | 高 | 低–中 |
| ProsecutionFlow | 高 | 高 | 高 | 高 | 低 |
| MaintainFlow | 中 | 中 | 中 | 中 | 中 |
| MonetizeFlow | 中 | 中 | 中 | 中 | 中 |
| WatchFlow | 中高 | 中 | 中高 | 中 | 中 |
| HandoffActionBar | 高 | 高 | 高 | 高 | 中 |

---

*本文件为只读评估产物；修复请另开变更，勿与本评估混提交。*
