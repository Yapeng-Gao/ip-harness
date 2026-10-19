# 横切 13 · Agent 编成（9 Agent × 18 专家席）· 产品级业务规格

> 权威源：`src/data/agents.ts`（`AGENT_CATALOG` 9 个 `AgentDef` / `AGENT_TIER_LABEL` / `suggestAgent` 路由 / `handoffKeyForAgent`）· `packages/domain/src/types/index.ts:544`（`AgentDef`）· `packages/contracts/src/keys.ts:53`（`AgentTier`）· `packages/contracts/src/commandNames.ts`（18 个 `CommandName`）· `packages/contracts/src/commands.ts:148`（`TOOL_TO_COMMAND`）· `apps/agent/src/business/businessSeats.ts`（默认 7 席 / 更多席 / Phase 灰显席 / `BUSINESS_STAGES`）· `apps/agent/src/projects/patentMidMap.ts`（`PATENT_MID_MAP` 18 行）· `apps/agent/src/projects/expertsPatent.ts`（`PATENT_EXPERTS` 目录）· `apps/agent/src/components/session/sessionGates.ts`（`ENTERPRISE_GATES` / `GATE_ORDER`）· `packages/domain/src/agentLabels.ts`（`HITL_GATE_LABELS` / `AGENT_TIER_SHORT`）
> 本文不涉及模型选型与推理基础设施，只讲**编排与权限边界**。凡"能跑/不能跑"的判断以代码为准。

---

## 0. 一句话讲清这个节点

**Agent 编成 = 把「每个节点的业务动作」拆成两类执行体：能自己动手的 Agent，和需要人坐在席位上的专家席；再用一套 HITL 闸把「AI 干到哪一步必须停」定死。**

它解决的是**责任分配**，不是"AI 有多聪明"：哪个动作可以让 Agent 起草、哪个必须人点、点完之后谁来背责任。行业里 AI 专利工具最大的失败不是写不出来，而是**没人敢用它的输出直接递交**——因为没有闸。

产品化三条件：

1. **有独立买方**：代理所买它做产能放大，企业 IP 买它做初审提效。
2. **有独立价值**：把「一名代理师带几个案子」变成「一名代理师 + N 个 Agent 带几倍案子」，且每一步可审计。
3. **有独立边界**：它不发明业务规则，只**编排**已有规则（节点 §4 的规则、交接机 §4 的规则）；去掉业务规则，Agent 什么都不是。

---

## 1. 节点定位与产品边界

### 1.1 两类执行体在生命周期中的位置

```
00 交底   01 调研   02 立项   03 撰写   04 答复   05 维持   06 转化   07 监控   08 布局
   │         │         │         │         │         │         │         │         │
 agent-   agent-    agent-    agent-    agent-    agent-    agent-    agent-    agent-
 disclosure research  intake   claims     oa      annuity  monetize   watch    layout
   │         │         │         │         │         │         │         │         │
   └─────────┴─────────┴──── 9 个 Agent（自动化执行单元，各有 handoffKey/tier/HITL）────┘
                                 │
                      ┌──────────┴──────────┐
                      │  18 个专家席（角色位） │  ← PATENT_MID_MAP 映射到 mid 节点
                      └─────────────────────┘
```

- **无 `StageId`**：编成层横切全部节点。
- **壳**：agent 壳（`apps/agent`）；每席一个会话体，Agent 是会话的"能力提供方"。
- **产物**：`AgentDef.handoffKey` 把 Agent 钉到一个交接键（9 个 Agent ↔ 9 个键，**一一对应**）。

### 1.2 Agent 与专家席的区别（最关键的一节）

| 维度 | Agent（9 个） | 专家席（18 个） |
|---|---|---|
| 本质 | **自动化执行单元**：有工具链、有剧本、有产物 | **角色位**：一个人（或人 + AI）坐在这个位置上负责 |
| 代码对象 | `AgentDef`（`src/data/agents.ts`） | `ProjectExpertDef`（`expertsPatent.ts`）+ `PATENT_MID_MAP` 行 |
| 数量 | 9 | 18（含 `orchestrator`） |
| 与产物键 | **必有** `handoffKey` | 部分有（`handoffKeys: HandoffArtifactKey[] \| null`） |
| 与 HITL | `hitlGates` 声明本 Agent 的闸 | `hitlGates` + `domainCommandCandidates` |
| 与 tier | `core / assist / beta` | 无 tier，用 `catalogGroup`（`pre/core/assist/orch/phase`）+ `phase` 布尔 |
| 生命周期 | 一次会话内跑完剧本 | 长期在位，跨案 |
| 能否独立卖 | 部分能（见 §13） | 不能单独卖，是产品形态的一部分 |
| 典型关系 | 多个专家席可共享一个 Agent（`expert-landscape` / `expert-inspire` / `expert-mining` / `expert-layout` 都指向 `agent-research`） | 一个 Agent 可支撑多席 |

> 一句话记法：**Agent 是"手"，专家席是"岗"**。手可以换，岗必须有人。

### 1.3 它是什么 / 不是什么

| 是 | 不是 |
|---|---|
| 业务动作的**执行编排** | 业务规则本身（规则在节点 §4 / 交接 §4） |
| 人机分工的**闸门设计** | 模型能力评测 |
| 一个可审计的动作链 | 聊天机器人（会话只是载体） |
| 9 个确定性剧本（当前） | 自主规划型 Agent |
| 席位与节点的映射表 | 组织架构（RACI 是提示，不是权限） |

### 1.4 独立产品的形态

**产品名建议：Agent 编排台 / Seat Orchestrator**

| 模块 | 能力 | 谁用 |
|---|---|---|
| 目录 | 9 Agent 的能力卡、适用场景、输入输出 | 代理师 / IP 经理 |
| 路由 | 按阶段/交接态/关键词推荐 Agent | 全员 |
| 席位编排 | 7 默认席 + 更多席 + 灰显席的新建案件团队配置 | 案管 |
| HITL 闸 | 5 类闸的确认链与权限 | 企业 IP |
| 双文件验收 | 每个席的输出必须含成果 + worklog | 总控 |
| 审计 | 每个动作落 `CommandName` + actor | 合规 |

**不做的**：不做公文写作质量评价（那是节点自己的指标）、不做法律意见（`outputsHint` 全部标注"非法律意见"）、不做真递交。

---

## 2. 角色与权限矩阵

### 2.1 Persona × Agent 访问

| Persona | 能进 Agent 壳 | 能建会话 | 能确认 HITL 闸 | 依据 |
|---|---|---|---|---|
| `enterprise_ip` | ✅ | ✅ | 全部 | `personaCanAccessAgent` / `personaBlocksHitlGate` |
| `agency` | ✅ | ✅ | 仅 `approve_strategy` | 其余企业闸硬禁（`persona.ts:121`） |
| `inventor` | ❌ | ❌ | ❌ | `personaCanAccessAgent` 返回 false |
| `committee` | ❌ | ❌ | ❌ | 同上 |

### 2.2 五类 HITL 闸

`HitlGateId` 五值（`keys.ts:41`），标签在 `agentLabels.ts:4`。

| 闸 | 中文 | 必须谁确认 | 典型 Agent | 企业/代理 |
|---|---|---|---|---|
| `go_nogo` | 立项决定 | 企业 IP | `agent-intake` | 企业独占 |
| `approve_strategy` | 批准策略 | 企业 IP 或代理 | 研究/交底/撰写/OA/转化/监控/布局 | **代理也可** |
| `authorize_file` | 授权递交 | 企业 IP | `agent-claims` / `agent-oa` | 企业独占 |
| `pay_unlock` | 付款解锁 | 企业 IP（财务） | `agent-annuity` | 企业独占 |
| `confirm_quote` | 确认报价 | 企业 IP | `agent-intake` | 企业独占 |

排序规则 `GATE_ORDER`（`sessionGates.ts:38`）：`approve_strategy → go_nogo → confirm_quote → pay_unlock → authorize_file`；企业侧按此顺序展示，代理侧保持原序。

### 2.3 当前实现的权限真相

- `DEMO_AGENTS` 白名单 9 个（`sessionGates.ts:52`）——即"能跑剧本的"就是这 9 个，其余 catalog 条目不在其中。
- 闸的确认只是**前端状态**（`sessionHitlAction`），没有后端签名。
- `personaBlocksHitlGate` 是纯函数，`evaluateGuardrails` 调用它（`guardrails.ts:236`），但 Agent 剧本本身可以绕过（剧本是 mock，不消费闸）。
- 专家席的 RACI（`raciHint`）是**提示文案**，不参与权限判断。

---

## 3. 业务对象（字段级）

### 3.1 `AgentDef`（9 个）

权威源 `packages/domain/src/types/index.ts:544`。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | string | ✅ | `agent-*` |
| `name` / `specialty` | string | ✅ | 名称与专长 |
| `stage` | `StageId` | ✅ | 主属阶段（交底为 `decision`，见 §14 差距 2） |
| `tools` | string[] | ✅ | 工具名列表（mock 命名，非真调用） |
| `status` | `AgentStatus` | ✅ | 当前 9 个全 `active` |
| `description` / `capabilities` | string / string[] | ✅ | 能力描述 |
| `handoffKey` | `HandoffArtifactKey` | ✅ | 绑定的交接产物 |
| `workbenchPath` | string | ✅ | 深链路径 |
| `systemPromptBrief` | string | ✅ | UI 展示的系统提示摘要 |
| `hitlGates` | `HitlGateId[]` | ✅ | 本 Agent 需要的闸 |
| `raciHint` | string | ✅ | R/A 提示（文案） |
| `whenToUse` / `inputsHint` / `outputsHint` | string | ✅ | 选择依据 |
| `guardrails` | string[] | ✅ | 硬轨文案（展示用） |
| `tier` | `AgentTier` | ✅ | `core / assist / beta` |
| `tierNote` | string? | — | beta/assist 的诚实说明 |

### 3.2 `AgentTier` 三档语义

| tier | 中文（`AGENT_TIER_SHORT`） | 含义 | 交互 |
|---|---|---|---|
| `core` | 主办理闭环 | 能力覆盖该节点主路径，产物可直接进交接 | 直接启动 |
| `assist` | 辅助薄层 | 只覆盖节点的一部分，长尾需人工或工作台 | 启动前 `window.confirm` |
| `beta` | Beta·非采购闭环 | 演示价值 > 交付价值，缺关键闸 | 启动前确认 + `BETA_HONEST_COPY` |

`confirmNonCoreTier`（`agents.ts:35`）对非 core 弹确认框：「…勿当作主办理采购闭环。仍要继续？」——这是产品诚实性的具体实现，不是装饰。

### 3.3 专家席对象

| 字段 | 说明 |
|---|---|
| `id` | `expert-*` / `orchestrator` |
| `name` / `specialty` | 名称与专长（**禁 Catalog/HITL/总控 等上屏词**，`businessSeats.ts:10`） |
| `role` | `orchestrator` / `expert` |
| `tools` / `steps` / `shortcuts` | 剧本 |
| `hitlGates` | 该席的闸 |
| `domainCommandCandidates` | 可写的 `CommandName` 或 `null`（提案键） |
| `catalogAgentId` | 指向哪个 Agent（可 `null`） |
| `catalogGroup` | `pre / core / assist / orch / phase` |
| `defaultTeam` | 是否进新建案默认团队 |
| `phase` | 是否灰显「即将推出」 |

### 3.4 三层别混：Agent / 席位 / 命令

| 层 | 回答 | 数量 | 谁定义 |
|---|---|---|---|
| Agent | 谁有这套能力 | 9 | `AGENT_CATALOG` |
| 席位 | 谁在这个岗上负责 | 18 | `PATENT_EXPERTS` + `PATENT_MID_MAP` |
| 命令 | 这次动作写了什么 | 18 | `CommandName` |

18 个 `CommandName`：`submitResearch` / `approveHandoff` / `requestChanges` / `advanceStage` / `submitClaims` / `analyzeAndSubmitOA` / `authorizeFile` / `fileResponse` / `confirmQuote` / `assignAgency` / `issueInvoice` / `payInvoice` / `createCaseFromInsight` / `saveDraft` / `submitHandoff` / `startReview` / `docketEscalate` / `docketComplete`（`commandNames.ts:5`）。

---

## 4. 业务规则清单

### 4.1 Agent 目录

| ID | 规则 | 现状 |
|---|---|---|
| R13-01 | 每个 Agent 必须绑定唯一 `handoffKey`，且 9 个键全覆盖 | ✅ 9↔9 |
| R13-02 | 每个 Agent 必须声明 `tier`，非 core 必须有 `tierNote` | ✅ |
| R13-03 | 非 core Agent 启动前必须确认（`confirmNonCoreTier`） | ✅ |
| R13-04 | Agent 的 `guardrails` 是展示文案，硬闸必须在 `evaluateGuardrails` | ✅（模块头注释明示） |
| R13-05 | Agent 不得跨 `handoffKey` 写（如交底 Agent 不写 `intake_quote`） | ✅ 代码无跨写路径 / ⚠ 无强制 |
| R13-06 | Agent 的所有写动作必须映射到 `CommandName` | ⚠ 多数工具 `TOOL_TO_COMMAND` 为 `null` |
| R13-07 | Agent 输出必须标「非法律意见」 | ⚠ 仅部分 `guardrails` 有 |
| R13-08 | Agent 失败/中断必须有恢复态 | ❌ |

### 4.2 路由

| ID | 规则 | 现状 |
|---|---|---|
| R13-09 | 路由优先级：交接态 > 阶段映射 > 关键词 > 默认 | ✅（`suggestAgent`，`agents.ts:395`） |
| R13-10 | 代理与企业对同阶段可推荐不同 Agent（RACI 感知） | ✅（`RACI_STAGE_PREF`） |
| R13-11 | 布局类关键词**不得静默路由到 beta 布局 Agent** | ✅ 改荐 `agent-research` 并说明原因（`agents.ts:497`） |
| R13-12 | 转化阶段无 core Agent，必须明示走 beta | ✅ |
| R13-13 | 非 core 推荐必须带 `requiresTierConfirm` | ✅ |
| R13-14 | 路由不得跨阶段硬塞（如答复阶段推撰写 Agent） | ✅ |

### 4.3 专家席

| ID | 规则 | 现状 |
|---|---|---|
| R13-15 | 默认 7 席：查新/立项/交底/撰写/附图/递交/审查答复；`orchestrator` 不计入 7 | ✅ |
| R13-16 | 更多席 5 个：全景/激发/竞品/挖掘/FTO | ✅ |
| R13-17 | Phase 灰显 5 席：布局/年费/价值/转化/维权，标「即将推出」 | ✅ |
| R13-18 | 灰显席不可作为主办理路径 | ✅（`currentSeatForProgress` 仅在 `moreSeatIds` 含布局时才高亮） |
| R13-19 | 提案键席（01–05）`handoffKeys: null`，不得写 packages | ✅ |
| R13-20 | 每席必须声明 `hitlGates`（可为空） | ✅ |
| R13-21 | 每席必须能映射到一个 `CommandName` 或显式 `null` | ✅ |
| R13-22 | 席与 Agent 必须是多对一，且映射关系可枚举 | ✅ `catalogAgentId` |
| R13-23 | 席的输出必须双文件（成果 + worklog），缺过程打回 | ✅（`orchestrator` 剧本 + `accept_dual_file`） |
| R13-24 | `expert-fto` ≠ `expert-enforcement` ≠ `watch_alert`，三者不得互相冒用 | ✅（`honesty` 文案明确） |

### 4.4 HITL 闸

| ID | 规则 | 现状 |
|---|---|---|
| R13-25 | 五类闸必须集中定义，不得各 UI 自建 | ✅ `HitlGateId` 单一源 |
| R13-26 | 闸确认必须过 `evaluateGuardrails` | ⚠ Agent 剧本路径未接 |
| R13-27 | 代理只能在 `approve_strategy` 上确认，其余四闸硬禁 | ✅（`persona.ts:121`） |
| R13-28 | 企业侧闸顺序固定 `approve_strategy → … → authorize_file` | ✅ `GATE_ORDER` |
| R13-29 | 闸确认后必须触发对应交接迁移 | ✅（`sessionHitlAction` → `transitionHandoff`） |
| R13-30 | `pay_unlock` 必须与 `payInvoice` 同源校验 | ✅（`evaluatePayUnlock`） |

---

## 5. 法律底座 / 行业规则

编成层本身无法条，但每一类闸背后都有一条法定或行业硬约束。

### 5.1 代理人的执业边界（`approve_strategy` 能由代理确认）

**规则（行业监管）**：专利代理师必须持有执业资格并在代理机构执业；撰写与答复属代理师的**执业行为**，其专业判断不能外包给非执业人员，也不能由系统替代（《专利代理条例》⚠ 条款需核）。

**产品落点**：`approve_strategy` 允许 `agency` 确认，其余四闸必须企业——这个划分还原了"专业判断归代理师、商业决定归客户"的现实。

**失效后果**：若系统允许非执业人员"批准"答复策略，代理所会被认定为未实际履行代理职责，执业风险与合同责任同时暴露。

### 5.2 申请人的处分权（`authorize_file` 必须企业）

**规则**：提交申请、答复、放弃权利属申请人的处分行为，需申请人（或其授权代表）决定。代理机构只能在授权范围内行事。

**产品落点**：`authorize_file` / `go_nogo` / `pay_unlock` / `confirm_quote` 四闸代理硬禁（`persona.ts:121-132`）。

**失效后果**：代理所擅自递交 = 越权代理，费用无法主张，且可能承担赔偿责任。

### 5.3 AI 输出的责任归属

**规则（行业惯例）**：AI 生成的检索结论、权利要求、答复意见**不构成法律意见**，必须由执业人员复核后才能对外。

**产品落点**：`outputsHint` 与 `guardrails` 反复标注"非法律意见"；`agent-claims` 的闸链是"策略批准 → 授权递交"两级，强制两道人工。

**失效后果**：客户依据 AI 结论做出商业决策并受损，提供方需担责。

### 5.4 双文件验收（过程可审计）

**规则（行业惯例 + 代理机构质量管理）**：代理机构的质量管理体系（如 ISO 9001 / 企业知识产权合规体系 GB/T 29490）要求过程记录可追溯。

**产品落点**：`orchestrator` 的 `accept_dual_file`：「成果 + worklog（步骤表 + 关键取舍），缺过程 = 打回，不派下家」（`expertsPatent.ts:153`）。

**失效后果**：无法通过体系认证审核；客户投诉时无法复盘。

### 5.5 分工边界（真实角色 vs 样机席位）

| 真实角色 | 行业主体 | 样机对应 | 差距 |
|---|---|---|---|
| 检索 / FTO | 咨询机构或代理所检索部 | `expert-research` / `expert-fto` | FTO 是辅席，无独立产物 |
| 撰写 | 代理律师/专利代理师 | `expert-draft` | ✅ |
| OA 答复 | 代理人 | `expert-oa` | ✅ |
| 年费/docket | 专利运营/IPR | `expert-annuity` | 灰显 |
| 无效/诉讼 | 律师团队 | `expert-enforcement` | 灰显 + 提案键 |
| 布局战略 | 外部咨询 | `expert-layout` | 灰显 |

> 这张表解释了为什么 `tier` 是 `core / assist / beta`：**core 恰好是代理所自己干的活（撰写、答复、检索），beta 恰是代理所不干的活（布局、转化）**。编成结构反映的是行业分工，不是技术成熟度。

---

## 6. 状态机

编成层没有单一状态机，它有三个正交的小状态机。

### 6.1 Agent 会话

```
queued ──► running ──► needs_human ──► done
                │            │
                └──► failed  └──► running（确认后继续）
```

`RUN_STATUS_LABEL`（`agents.ts:1078`）：`排队 / 运行中 / 待你确认 / 已完成 / 失败`。

### 6.2 专家席（业务向导五段）

```
prepare ──► intake ──► drafting ──► filing ──► oa
   │           │           │           │         │
   └ 无席      └ 查新+立项  └ 交底+撰写+附图 └ 递交  └ 答复（requiresFiled）
```

`BUSINESS_STAGES`（`businessSeats.ts:97`）：每段有 `seatIds`、`advanceCta`、`confirmCta`、`requires`。`oa` 段特殊：`requiresFiled: true`（只有已 file 的案才进 OA）。

### 6.3 HITL 闸

```
pending ──► confirmed
   │
   └──► blocked（前置未满足：如 Full-check / 发票 / 交底未批）
```

### 6.4 迁移表（专家席五段）

| 段 | 当前席 | 可进入下一段的条件 | 确认动作 |
|---|---|---|---|
| `prepare` | 无（可加布局） | 用户点「跳过准备，开始查新」 | — |
| `intake` | `expert-research` → `expert-intake` | `research_ready` + `go_nogo` 确认 | 确认查新结论 / 确认立项 |
| `drafting` | `expert-disclosure` → `expert-draft` → `expert-figure` | `disclosure_ready` + `claims_ready` | 确认交底 / 确认权利要求 |
| `filing` | `expert-filing` | `file_authorize` 确认 | 确认递交 |
| `oa` | `expert-oa` | 已 file 且收到 OA | 确认答复策略 |

### 6.5 当前实现的偏差

1. **`agent-disclosure` 的 `stage` 是 `decision`**（`agents.ts:81`），但交底在业务上位于 `drafting` 之前、`decision` 之后；专家席 `expert-disclosure` 的 `midStage` 却写 `drafting`（`patentMidMap.ts:96`）。**同一件事两个阶段**。
2. **`agent-layout` 的 `stage` 是 `pre_research`**（`agents.ts:268`），与 `expert-layout` 的 `midStage: 'proposal'`（`patentMidMap.ts:69`）不一致。
3. **专家席的 `hitlGates` 与 Agent 的 `hitlGates` 不一致**：`expert-filing` 声明 `authorize_file`，`catalogAgentId` 却是 `agent-claims`（其 `hitlGates` 是 `approve_strategy + authorize_file`）；`expert-oa` 只声明 `approve_strategy`，而 `agent-oa` 有两闸。
4. **`expert-intake` 只声明 `go_nogo`**，`agent-intake` 是 `go_nogo + confirm_quote`——报价确认在调度侧"消失"。
5. **`expert-monetize` 声明 `confirm_quote`**（`expertsPatent.ts:717`），语义错误：转化场景应用法务/签署类闸，`confirm_quote` 是立项报价闸。
6. **`BUSINESS_STAGES.prepare` 的 `seatIds: []`**，但 `currentSeatForProgress` 会兜底返回 `BUSINESS_DEFAULT_SEAT_IDS[0]`（查新），导致 prepare 段高亮错误。
7. **`seatsForCase` 不保证 + 更多席的顺序稳定**（`more` 与 `fromExperts` 拼接），UI 可能出现席位跳动。

---

## 7. 闸门与条件（代码对齐）

| 闸门 / blocker | 触发条件 | 文案 | 代码位置 |
|---|---|---|---|
| `persona`（HITL） | Persona 硬禁该闸 | 按 `personaBlocksHitlGate` | `guardrails.ts:242` |
| `persona`（handoff） | Persona 硬禁交接动作 | 按 `personaBlocksHandoffAction` | `guardrails.ts:251` |
| `persona`（pay） | Persona 硬禁付款 | 「当前 Persona 不可付款解锁」 | `guardrails.ts:236` |
| `enterprise` | 代理确认企业闸 | 「仅企业可批准/授权/付款解锁」 | `guardrails.ts:262` |
| `invoice` | 代理 + 逾期票 + 授权 | 「存在逾期发票，请先结清」 | `guardrails.ts:274` |
| `full_check` | 授权/递交 Full-check 未过 | 「Full-check 未过：…」 | `guardrails.ts:420` |
| `tier`（前端） | 非 core Agent 启动 | `window.confirm` 提示 | `agents.ts:35` |
| 席位灰显 | `phase: true` 的席 | 「即将推出」空状态 | `businessSeats.ts:65` |

**唯一入口原则**：闸必须过 `evaluateGuardrails`。`AgentDef.guardrails[]` 只是目录文案，模块头注释已明确「可执行硬闸在本模块复用已有函数，不削弱」（`guardrails.ts:7`）。

---

## 8. 步骤序列 / 工作流

### 8.1 典型会话（以 OA 为例）

| # | 步骤 | 谁做 | 产出 | 失败回退 |
|---|---|---|---|---|
| 1 | 选 Agent（手动或 Auto 路由） | 用户 | 会话 + 绑定 `prosecution_response` | 改选 |
| 2 | 跑剧本（解析 OA → 提修改 → 写陈述） | Agent | 草稿产物 | 可重跑 |
| 3 | 确认陈述（草稿 → 已确认） | 代理 | `oaStatementConfirmed` | — |
| 4 | 批准策略（`approve_strategy`） | 代理或企业 | `approved` 交接 | 退回 |
| 5 | 授权递交（`authorize_file`） | 企业 | `authorized_to_file` | 发票阻塞 → 12 |
| 6 | 递交归档 + 回执 | 代理 | `filed` + docket 事件 | 回执缺失 → 不归档 |

### 8.2 新建案件的席位编排

`BUSINESS_DEFAULT_TEAM_IDS` = 助手 + 7 席（`businessSeats.ts:47`）；用户可在「更多专家」里加 5 席；灰显席不可加。

### 8.3 双文件验收

`orchestrator` 派活 → 各席产出 `NN_*.md` + worklog → 总控验收（`accept_dual_file`）→ 缺 worklog 不派下家。这是"编排"与"聊天"的分水岭。

---

## 9. 写回与命令

### 9.1 9 个 Agent 逐个（定位 / stage / 产物键 / HITL / tier）

| # | Agent | 定位 | `stage` | `handoffKey` | `hitlGates` | tier | workbenchPath |
|---|---|---|---|---|---|---|---|
| 1 | `agent-research` | 立项前调研 · 现有技术检索 | `pre_research` | `research_report` | `approve_strategy` | core | `/workbench/research` |
| 2 | `agent-disclosure` | 发明交底 · 结构化技术披露 | `decision` ⚠ | `disclosure_pack` | `approve_strategy` | core | `/inventor` |
| 3 | `agent-intake` | 立项决策 · 报价与范围 | `decision` | `intake_quote` | `go_nogo` + `confirm_quote` | core | `/workbench/intake` |
| 4 | `agent-claims` | 撰写申请 · 权利要求 | `drafting` | `draft_claims` | `approve_strategy` + `authorize_file` | core | `/workbench/draft` |
| 5 | `agent-oa` | 审查答复 · 争点策略 | `prosecution` | `prosecution_response` | `approve_strategy` + `authorize_file` | core | `/workbench/prosecution` |
| 6 | `agent-annuity` | 授权维持 · 年费计划 | `maintenance` | `maintain_annuity` | `pay_unlock` | core | `/workbench/maintain` |
| 7 | `agent-monetize` | 运用转化 · 许可/转让 | `commercialization` | `monetize_terms` | `approve_strategy` | **beta** | `/workbench/monetize` |
| 8 | `agent-watch` | 案件监控 · 竞品预警 | `monitoring` | `watch_alert` | `approve_strategy` | **assist** | `/workbench/watch` |
| 9 | `agent-layout` | 专利布局 · 空白点 | `pre_research` ⚠ | `layout_insight` | `approve_strategy` | **beta** | `/workbench/layout` |

补充要点（逐条来自 `agents.ts`）：

- **`agent-research`**：工具 `commercial_patent_search / cluster_hits / draft_research_report / bind_novelty`；硬轨「禁止空命中过闸」「命中须可核验 pubNo+url」；输出含可选 claim_chart 草稿。
- **`agent-disclosure`**：工具 `structure_disclosure / extract_features / prior_art_lite / flag_gaps`；硬轨「批准前须齐套六项」「1.1 禁编造凑条」「交接用 disclosure_pack」；**明确不改立项报价**。
- **`agent-intake`**：工具 `score_patentability / estimate_quote / draft_intake_memo`；硬轨「须过立项 Go 与确认报价双闸」「不与交底包混用交接键」。
- **`agent-claims`**：工具 `draft_claims / expand_dependent / check_support / country_strategy`；硬轨「交底未批准禁用批准/授权」「授权/file 前须 Full-check」。
- **`agent-oa`**：工具 `analyze_oa / propose_amendments / draft_opinion / write_docket_event`；硬轨「须先选争点类型并写策略要点再 HITL」「未确认陈述禁用授权」。
- **`agent-annuity`**：工具 `list_annuity_schedule / estimate_official_fees / write_docket_event`；硬轨「付款解锁仅企业」「禁静默假回执归档」。
- **`agent-monetize`**：工具 `draft_license_terms / benchmark_royalty / link_watch_alert`；`tierNote`「无法务会签闸，批准≠合同 PDF/电子签」。
- **`agent-watch`**：工具 `scan_new_publications / score_threat / draft_watch_alert`；处置枚举是「确认/升级/关闭」而非单一批准；`tierNote`「诉讼维权升级为长尾」。
- **`agent-layout`**：工具 `map_layout_matrix / find_blank_spots / suggest_filings / create_case_from_insight / assign_agency`；硬轨「补强须批准后再 CreateCaseFromInsight」「不占用 research_report」。

### 9.2 18 专家席 → mid 节点映射（`PATENT_MID_MAP`）

| # | 专家席 | 中文 | `midStage` | `handoffKeys` | 读工具 | 写命令 | honesty 要点 |
|---|---|---|---|---|---|---|---|
| 1 | `orchestrator` | 案子助手/总控 | `cross_stage` | — | `dispatch_task` / `summarize_timeline` / `accept_dual_file` | — | 无直接 handoff 写；双文件验收 |
| 2 | `expert-landscape` | 产业全景 | `proposal` | — | `map_landscape` / `draft_landscape_report` | — | 01 提案键 · 未进 contracts |
| 3 | `expert-inspire` | 创新激发 | `proposal` | — | `brainstorm_directions` / `draft_inspire_brief` | — | 02 提案键 |
| 4 | `expert-competitor` | 竞品监控 | `proposal` | — | `list_competitors` / `draft_competitor_watch` | — | 03 提案键 |
| 5 | `expert-mining` | 专利挖掘 | `pre_intake` | — | `extract_invention_points` / `pack_mining` | — | mining_pack ≠ 立项 |
| 6 | `expert-layout` | 专利布局 | `proposal` | — | `plan_family` / `draft_layout_plan` | — | 05 layout_plan 提案；可对齐 `layout_insight` |
| 7 | `expert-research` | 检索员（查新暨三性） | `pre_research` | `research_report` | `commercial_patent_search` / `cluster_hits` | `submitResearch` | 绑案 Confirm 后才可提交 |
| 8 | `expert-intake` | 立项决策 | `decision` | `intake_quote` | `ingest_upstream` / `draft_intake_quote` | `submitHandoff` / `createCaseFromInsight` | 须 `go_nogo` HITL |
| 9 | `expert-disclosure` | 交底整理 | `drafting` | `disclosure_pack` | `structure_disclosure` / `pack_disclosure` | `saveDraft` / `submitHandoff` | 交底整理 ≠ 撰稿 |
| 10 | `expert-draft` | 撰写代理师 | `drafting` | `draft_claims` | `draft_claims` / `check_support` | `saveDraft` / `submitClaims` / `submitHandoff` | 撰稿 ≠ 交底 |
| 11 | `expert-figure` | 制图对接 | `drafting_assist` | — | `list_needed_figures` / `attach_chapter_event` | — | 辅席 · 无独立 handoff key |
| 12 | `expert-fto` | FTO 律师 | `drafting_assist` | — | `extract_fto_features` / `build_risk_matrix` | — | 辅席 · ≠ 三性 |
| 13 | `expert-filing` | 递交流程员 | `authorize_file` | — | `filing_checklist` / `formality_scan` | `authorizeFile` / `fileResponse` | 禁真递交；仅闸+HITL |
| 14 | `expert-oa` | OA 答复代理师 | `prosecution` | `prosecution_response` | `parse_oa_notice` / `oa_strategy` / `draft_oa_response` | `saveDraft` / `submitHandoff` | 仅已 file；无真 OA |
| 15 | `expert-annuity` | 年费管家 | `maintenance` | `maintain_annuity` | `list_annuity_due` | — | 后置可跑 · 禁真缴费 |
| 16 | `expert-valuation` | 价值评估师 | `phase` | — | `score_portfolio` | — | 提案键 valuation_card |
| 17 | `expert-monetize` | 转化顾问 | `commercialization` | `monetize_terms` | `draft_term_sheet` | — | 后置 · 禁真签约 |
| 18 | `expert-enforcement` | 无效维权顾问 | `phase` | — | `claim_chart_compare` | — | ≠ FTO ≠ watch |

> `midStage` 的取值域包含 5 个轴外值：`cross_stage / proposal / pre_intake / drafting_assist / authorize_file / phase`（`patentMidMap.ts:13`），它们**不是** `StageId`。

### 9.3 读写边界（`PATENT_MID_MAP` 的核心价值）

| 边界类型 | 表现 | 含义 |
|---|---|---|
| 只读席 | `writeCommands: null`（10 席） | 可看不可写，防误操作 |
| 提案席 | `handoffKeys: null` + `writeCommands: null` | 产出"提案键"，**不是** contracts 里的产物 |
| 单键席 | `handoffKeys: ['某键']` | 只能写这一个交接对象 |
| 双命令席 | `expert-filing`（`authorizeFile` + `fileResponse`） | 授权与归档两动作 |
| 跨阶段席 | `orchestrator` | 只派活与验收，不写业务对象 |

### 9.4 写回与命令

| 动作类型 | 命令来源 | 审计 |
|---|---|---|
| 交接动作 | `commandForHandoffAction`（`commands.ts:189`） | ✅ |
| 工具动作 | `TOOL_TO_COMMAND`（`commands.ts:148`） | ⚠ 多数为 `null` |
| 期限 | `docketEscalate` / `docketComplete` | ✅ |
| 商务 | `confirmQuote` / `issueInvoice` / `payInvoice` / `assignAgency` | ✅ |
| 建案 | `createCaseFromInsight` | ✅ |

**`TOOL_TO_COMMAND` 现状**：31 个工具里只有 6 个映射到命令（`submit_for_review` / `write_docket_event` / `file_oa_response` / `assign_agency` / `create_case_from_insight` / `issue_inquiry` / `docket_write`），其余为 `null` —— 即"读工具"。这个比例是对的：**能写的少，能读的多**。

---

## 10. 期限与 SLA

编成层自身无期限，但它是期限动作的执行者。

| 关联期限 | 由哪个 Agent 触发 | 现状 |
|---|---|---|
| OA 答复期限 | `agent-oa` 先 `write_docket_event`（→ `fileResponse`）再归档 | ⚠ 剧本里是"预备"，不真写 |
| 年费期限 | `agent-annuity` 付款解锁后回写 | ⚠ 同上 |
| 提案→确认 | 无 | ❌ 无会话超时 |

**会话级 SLA（建议，未实现）**：

| SLA | 建议值 | 说明 |
|---|---|---|
| 会话从 `needs_human` 到人确认 | 4 工作小时 | 超时应提醒 |
| 单次剧本运行上限 | 10 分钟 | 超时中断并保留中间产物 |
| Agent 失败重试 | 2 次，退避 | ❌ 无重试模型 |
| 席位双文件验收时限 | 1 工作日 | ❌ |

---

## 11. 边界与失败场景

| # | 场景 | 正确处置 | 现状 |
|---|---|---|---|
| 1 | 用户让 Agent 直接递交 | 必须走 `authorize_file` 闸 | ✅ 硬禁 |
| 2 | 代理在会话里点了"批准立项" | `go_nogo` 代理硬禁 | ✅ |
| 3 | 交底包未批准就要写权利要求 | `disclosure_approved` blocker | ✅ |
| 4 | OA 陈述没确认就授权 | `oa_statement` blocker | ✅ |
| 5 | 发票逾期时代理要归档 | `invoice` blocker | ✅ |
| 6 | 用户要求 Agent「直接给我签合同」 | beta 明示无法务会签闸 | ✅ 文案 |
| 7 | Agent 剧本跑到一半刷新页面 | 会话恢复 | ⚠ 有 seed run，无真实恢复 |
| 8 | 两个 Agent 同时改同一交接键 | 串行化 + 冲突提示 | ❌ 后写胜 |
| 9 | 用户用布局关键词却得到调研 Agent | 明示"布局是 beta，已推荐 core" | ✅ |
| 10 | 席位输出只有结论没有 worklog | 总控打回 | ✅ 文案 / ❌ 无自动校验 |
| 11 | 专家席被当成 Agent（以为能自己跑） | 明确区分；席位是岗不是手 | ⚠ 产品沟通风险 |
| 12 | 委员想看 Agent 会话 | `personaCanAccessAgent` 拒 | ✅ |
| 13 | 发明人想看 Agent 会话 | 同上 | ✅ |
| 14 | 企业 IP 离职，会话归属丢失 | 会话应绑案不绑人 | ⚠ 绑案，但 assignee 语义弱 |
| 15 | Agent 输出被直接当作法律意见用 | 输出标"非法律意见" | ⚠ 部分 Agent 无此声明 |
| 16 | 18 席全开导致成本失控 | 只开默认 7 席 + 按需加 | ✅ 默认 7 |

---

## 12. 指标（验收尺子）

| 指标 | 定义 | 健康区间 | 说明 |
|---|---|---|---|
| Agent 采纳率 | Agent 产物被批准的比例 | 50%–75% | 过低说明能力不匹配 |
| 平均确认轮次 | 每会话 HITL 确认次数 | 1.5–2.5 | 过高说明产物质量差 |
| 非 core 使用占比 | assist/beta 会话数 / 总会话 | < 20% | 过高说明核心能力不足 |
| 路由准确率 | Auto 推荐被采纳的比例 | > 70% | 反映 `suggestAgent` 质量 |
| 双文件完整率 | 含 worklog 的席输出比例 | 100% | 硬指标 |
| 席间交接次数 | 每案跨席派活次数 | 参考 6–10 | 过高说明拆解过细 |
| 闸前返工率 | 在 `approve_strategy` 前被打回的比例 | < 25% | |
| 单位产能 | 每代理师每月结案数（启用前 vs 后） | 提升 1.3–2 倍 | **能换算成钱** |
| 单案人天 | 从立案到归档的人工小时 | 下降 20%–40% | **能换算成钱** |

> 卖产品时最该讲的是**单位产能**与**单案人天**——它们直接对应"少雇几个人"。

---

## 13. 产品化切分建议

### 13.1 哪些能独立卖

| Agent | 能否独立卖 | 理由 |
|---|---|---|
| `agent-research` | **能** | 输入技术方案、输出检索报告，独立价值清晰，core |
| `agent-disclosure` | **能** | 交底结构化是独立痛点，输出可直接给撰写方（含外部） |
| `agent-claims` | 能（但需代理师复核） | 输出是半成品，价值在"省 60% 初稿时间" |
| `agent-oa` | 能（同上） | 同上 |
| `agent-annuity` | 能 | 年费日历是纯数据产品，可独立订阅 |
| `agent-intake` | **不能** | 无检索输入就没有意义，是流程内部件 |
| `agent-watch` | 半能 | assist；单卖需接外部数据源 |
| `agent-layout` | 不能（beta） | 矩阵与建案仍薄 |
| `agent-monetize` | 不能（beta） | 无法务会签闸，不能闭环 |

### 13.2 内外部能力划分

| 层 | 内容 | 是否可独立交付 |
|---|---|---|
| L1 目录层 | 9 Agent 卡片 + 能力说明 + 适用场景 | 是（可白牌） |
| L2 单点 Agent | research / disclosure / annuity 三个可拆售 | 是 |
| L3 编排层 | 席位 + 双文件验收 + 派活 | 是（代理所内部管理） |
| L4 闸层 | 五类 HITL + 权限矩阵 | 是（合规刚需） |
| L5 全链层 | 9 Agent + 18 席全开 | 需工作台与中台一起交付 |

**定价锚点**：按「Agent 会话数」或「席位数 × 月」；单点 Agent 可按「件数」（如每件检索报告 X 元）。

**竞品参照系**：Patlytics / Solve Intelligence 强在单点生成质量，弱在**闸与席位编排**；国内工具多停在"表单 + 大模型问答"。**「可审计的闸 + 席位责任划分」是空位。**

---

## 14. 现状差距表

| # | 差距 | 严重度 | 影响 |
|---|---|---|---|
| 1 | Agent 剧本是 mock，不真调工具 | **高** | 演示可用，交付不可 |
| 2 | `agent-disclosure.stage='decision'` 与 `expert-disclosure.midStage='drafting'` 冲突 | 中 | 路由与高亮不一致 |
| 3 | `agent-layout.stage='pre_research'` 与 `expert-layout.midStage='proposal'` 冲突 | 中 | 同上 |
| 4 | 席与 Agent 的 `hitlGates` 不一致（filing / oa / intake / monetize） | **高** | 同一动作两套闸，权限可能被放宽 |
| 5 | `expert-monetize` 用 `confirm_quote` 闸 | 中 | 语义错误，法务闸缺位 |
| 6 | `BUSINESS_STAGES.prepare` 的 `seatIds: []` 导致高亮兜底错误 | 低 | UI 小错 |
| 7 | 无 Agent 失败/重试/恢复模型 | **高** | 会话中断即丢上下文 |
| 8 | 31 个工具中大量 `TOOL_TO_COMMAND: null`，写动作不可审计 | 中 | 部分动作无痕 |
| 9 | 闸确认无后端签名 | **高** | 审计不可信 |
| 10 | 无「席→Agent」的一等映射表，靠 `catalogAgentId` + honesty 兜底 | 中 | 新增席易漏配 |
| 11 | 提案键 5 席（01–05）未进 contracts | 中 | 无法与主链交接 |
| 12 | `expert-valuation` / `expert-enforcement` 无 Agent、无产物键 | 中 | 灰显但无路径 |
| 13 | 无 Agent 成本/用量计量 | 中 | 无法按量计费 |
| 14 | 部分 Agent 未声明「非法律意见」 | 中 | 责任风险 |
| 15 | 双文件验收无自动校验 | 中 | 靠总控人肉 |

**优先补的三件事**：

1. **统一席与 Agent 的闸定义**（差距 4、5）——现在是两套口径，权限可能被放宽，是安全类问题。
2. **Agent 中断恢复 + 重试**（差距 7）——直接决定能不能真上岗。
3. **真实工具接入 + 用量计量**（差距 1、13）——没有这两项，Agent 无法按量计价，也就无法独立卖。

---

## 15. 术语表

| 术语 | 含义 |
|---|---|
| Agent | 自动化执行单元，绑定一个交接产物键，有工具链与剧本 |
| 专家席 | 角色位，人（或人 + AI）坐在这个位置上负责一段业务 |
| HITL 闸 | Human-in-the-loop，人必须确认才能继续的检查点 |
| tier | Agent 成熟度：core / assist / beta |
| `catalogGroup` | 席的分组：pre / core / assist / orch / phase |
| 提案键 | 未进 contracts 的产物名（如 `landscape_report`），只读不写库 |
| 灰显席 | `phase: true`，标「即将推出」的席 |
| 双文件验收 | 每席输出必须含成果文件 + worklog，缺一打回 |
| RACI | 责任分配提示（`raciHint`），不是权限 |
| Auto 路由 | 按阶段/交接态/关键词自动推荐 Agent |
| `requiresFiled` | OA 段的前置：案件必须已 file |

---

## 16. 来源

- 代码：见文首权威源清单（`src/data/agents.ts` / `apps/agent/src/business/businessSeats.ts` / `apps/agent/src/projects/patentMidMap.ts` / `packages/contracts/src/commandNames.ts`）
- 《专利代理条例》⚠ 条款需按现行文本核对（代理师执业边界）
- GB/T 29490-2023《企业知识产权合规管理体系要求》· CNIPA：https://www.cnipa.gov.cn/art/2023/9/5/art_66_187235.html
- 《专利法》（2020 修正）（处分权与申请人）：https://www.cnipa.gov.cn/art/2020/11/23/art_97_155167.html
- 行业对照：`docs/lifecycle/industry-reality.md` §4 横切 13
- 相关节点：`docs/lifecycle/nodes/10-handoff-state-machine.md`（产物与闸）、`docs/lifecycle/nodes/12-billing-engagement.md`（`pay_unlock` / `confirm_quote`）

> 本文对 Agent 的"能力"只做业务描述，不涉及模型、参数、推理方式；凡"能跑"的判断均指代码中存在的剧本路径。
