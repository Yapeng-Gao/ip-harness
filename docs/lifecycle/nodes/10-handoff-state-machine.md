# 横切 10 · 交接状态机（Handoff State Machine）· 产品级业务规格

> 权威源：`packages/contracts/src/keys.ts`（`HandoffStatus` / `HandoffArtifactKey` / `HandoffAction` / `HitlGateId`）· `packages/contracts/src/handoff.ts`（`HANDOFF_LABELS` / `HANDOFF_ARTIFACT_LABELS` / `ARTIFACT_FOR_STAGE` / `HANDOFF_ACTION_LABELS`）· `packages/domain/src/handoff.ts`（`REQUIRED_BEFORE_SUBMIT` / `TRANSITIONS` / `canPerformHandoff` / `actionLabel` / `nextVersionLabel`）· `packages/domain/src/types/index.ts`（`HandoffState` / `ArtifactVersion` / `FilingReceipt`）· `packages/app-state/src/AppContext.tsx`（`transitionHandoff`）· `packages/domain/src/guardrails.ts`（`evaluateGuardrails`）· `packages/app-state/src/crossPortStore.ts`
> 本文所有金额、比例、期限均标 ⚠，部署前须按当期官方文本与合同模板复核。本节点**不是法定程序**，因此没有法条可直接引；法律约束体现在「递交回执的证据效力」「委托合同的履约节点」「电子签名的形式要求」三处（§5）。

---

## 0. 一句话讲清这个节点

**交接状态机 = 企业 IP 与代理所之间「这份产物现在能不能被下一道工序使用」的唯一判据。** 它把九个节点的产出物统一成同一种对象（`HandoffState`），用七个状态、七个动作回答三个问题：谁做的、做完了没有、谁认过。

它解决的不是「文件存哪儿」，而是**责任转移**：一旦 `approved`，企业就对代理所的稿子负了责；一旦 `file`，代理所就对递交事实负了责并留下回执。行业里大量纠纷不是输在技术，而是输在「这份稿子是谁批的、什么时候交的、有没有回执」。

产品化三条件：

1. **有独立买方**：代理所买它做交付管理，企业 IP 买它做外包管控；两边都有预算科目。
2. **有独立价值**：它把「催稿 / 批稿 / 交稿」从邮件与微信里搬到可审计台账上，直接压缩返工与超期。
3. **有独立边界**：它只依赖「产物键 + 角色 + 状态」，不依赖任何具体节点的业务逻辑，可单独以 API 形态卖给已有案件管理系统。

---

## 1. 节点定位与产品边界

### 1.1 在生命周期中的位置

```
00 交底 ──► 01 调研 ──► 02 立项 ──► 03 撰写 ──► 04 答复 ──► 05 维持 ──► 06 转化 ──► 07 监控
   │           │           │           │           │           │           │           │
   └── disclosure_pack ── research_report ── intake_quote ── draft_claims ── prosecution_response
                                                                                │
                                        maintain_annuity ◄── 05 ────────────────┘
                                        monetize_terms   ◄── 06
                                        watch_alert      ◄── 07
                                        08 布局（辅台）── layout_insight
                                                    │
                                    全部产物共用同一个 7 态状态机（本节）
```

- **无 `StageId`**：交接机是横切层，不占阶段轴。
- **产物键 9 个**：7 个主键（与 7 个 `StageId` 一一对应）+ 2 个轴外键（`disclosure_pack`、`layout_insight`）。
- **代码口径**：`ARTIFACT_FOR_STAGE` 只映射 7 个主键（`packages/contracts/src/handoff.ts:25`）；轴外键没有 stage 归属，`primaryHandoffKey(stage)` 永远不会返回它们（`AppContext.tsx:916`）。
- **壳与路由**：无独立页面；入口在各 Flow 的 `HandoffActionBar` 与 Agent 的 `SessionConfirmBar`。

### 1.2 九个产物键的归属

| 产物键 | 中文（`HANDOFF_ARTIFACT_LABELS`） | 归属节点 | 是否在 `ARTIFACT_FOR_STAGE` | 典型 workbench 路径 |
|---|---|---|---|---|
| `research_report` | 调研报告 | 01 调研 | 是（`pre_research`） | `/workbench/research/:id` |
| `intake_quote` | 立项/报价 | 02 立项决策 | 是（`decision`） | `/workbench/intake/:id` |
| `disclosure_pack` | 交底包 | 00 发明交底 | **否**（轴外） | `/inventor?case=:id` |
| `layout_insight` | 布局洞察 | 08 布局（辅台） | **否**（轴外） | `/workbench/layout/:id` |
| `draft_claims` | 权利要求草稿 | 03 撰写 | 是（`drafting`） | `/workbench/draft/:id` |
| `prosecution_response` | 审查答复 | 04 审查答复 | 是（`prosecution`） | `/workbench/prosecution/:id` |
| `maintain_annuity` | 授权维持 | 05 授权维持 | 是（`maintenance`） | `/workbench/maintain/:id` |
| `monetize_terms` | 转化条款 | 06 运用转化 | 是（`commercialization`） | `/workbench/monetize/:id` |
| `watch_alert` | 监控告警 | 07 监控预警 | 是（`monitoring`） | `/workbench/watch/:id` |

> 路径来自 `src/utils/dynamicTodos.ts:19` 的 `HANDOFF_ACTION_PATH`，是待办深链的唯一真源。

### 1.3 它是什么 / 不是什么

| 是 | 不是 |
|---|---|
| 产物**可用性**的判据（可不可以交给下一道） | 产物**内容**的存储（正文在 Flow / Artifact 里） |
| 企业与代理所的**责任分界** | 官方法律状态的镜像（受理/公开/授权在 docket 与案件字段里） |
| 一套**统一**的七态，九种产物复用 | 九套不同的状态机 |
| 可审计的动作台账（谁在何时做了什么） | 电子签名或 CA 认证（`file` 只是台账事实，不是签章） |
| 跨口同步的**共享对象** | 后端事务（样机为内存 + localStorage） |

### 1.4 上下游契约

| 方向 | 对象 | 契约 |
|---|---|---|
| 上游 | 各节点 Flow / Agent | 产出正文 + 勾选 `checkedRequired`，调用 `transitionHandoff` |
| 上游 | 角色系统（`role` / `persona` / `fulfillmentMode`） | 决定谁能执行哪个动作（`canPerformHandoff`） |
| 下游 | 动态待办（`buildTodoFromHandoffTransition`） | 状态变化驱动运营待办的生成与消账 |
| 下游 | Docket（11） | `file` + 回执 → 生成 `fromHandoffWriteback` 事件 |
| 下游 | 时间线 / 审计 | 每次迁移写一条 `TimelineEvent` + activity + audit |
| 横向 | 商务（12） | `intake_quote` 的 submit/approve 会改写 `Engagement` |
| 横向 | 中台（mid :5173） | 只读消费，`HandoffPanel` 展示 |

### 1.5 独立产品的形态

**产品名建议：交付协同台 / Handoff Desk**

| 模块 | 能力 | 谁用 |
|---|---|---|
| 状态台账 | 九类产物的七态看板 + 逾期 | IP 经理 / 代理所流程岗 |
| 齐套校验 | 每类产物独立的必填项清单 | 代理师 / 企业 IP |
| 版本与批注 | 每次提交生成版本，退回带批注 | 双方 |
| 回执归档 | 递交回执号 + 日期，强制填写 | 流程岗 |
| 待办联动 | 状态变化自动生/消待办 | 运营 |
| 开放 API | 与既有案管系统对接 | 集成商 |

**不做的**：不做文件协同编辑（用 Office/WPS）、不做官文收发（用 CPClient/代理机构系统）、不做计费（那是 12）。

---

## 2. 角色与权限矩阵

### 2.1 七个动作 × 两个角色

| 动作 | 代码角色 | 中文（通用） | 可执行前置态 | 落点态 |
|---|---|---|---|---|
| `save_draft` | `agency` | 保存草稿 | `drafting` / `changes_requested` | `drafting` |
| `submit` | `agency` | 提交 | `drafting` / `changes_requested` | `submitted_to_enterprise` |
| `start_review` | `enterprise` | 开始审核 | `submitted_to_enterprise` | `enterprise_review` |
| `request_changes` | `enterprise` | 退回修改 | `submitted_to_enterprise` / `enterprise_review` / `approved` | `changes_requested` |
| `approve` | `enterprise` | 批准 | `submitted_to_enterprise` / `enterprise_review` | `approved` |
| `authorize` | `enterprise` | 授权递交 | `approved` / `enterprise_review` / `submitted_to_enterprise` | `authorized_to_file` |
| `file` | `agency` | 递交归档 | `authorized_to_file` / `approved` | `filed` |

（`packages/domain/src/handoff.ts:147`；`AGENCY_ACTIONS = ['save_draft','submit','file']`，`:188`）

### 2.2 角色 × Persona 的叠加限制

`UserRole` 只有两值（`enterprise` / `agency`），Persona 在其上再切细（`packages/domain/src/persona.ts:69`）：

| Persona | 底层 role | 可做的交接动作 | 被硬禁的动作 | 文案 |
|---|---|---|---|---|
| `enterprise_ip` | enterprise | 全部企业动作 | 无 | — |
| `agency` | agency | 起草/提交/归档 | 无（越权由 role 判） | — |
| `inventor` | enterprise | 无 | submit / save_draft / approve / authorize / file / start_review / request_changes | 「请前往交底门户提报」 |
| `committee` | enterprise | 无 | 上面七项全部 | 「仅可 Intake 投票」 |

### 2.3 当前实现的权限真相（必须对交付讲清）

- 角色切换是**同一登录下的芯片**（`actingAs: 'dept' | 'ip'`，`apps/workbench/src/flows/inventor/InventorPortal.tsx:67`），不是真实身份认证。
- 真正的「鉴权」只有三层：`role`、`persona`、`fulfillmentMode`，全部在前端判（`canPerformHandoff` 是纯函数）；`transitionHandoff` 自身不做二次鉴权，只信调用方传进来的 `role` / `persona`（`AppContext.tsx:1058`）。
- 租户隔离靠 `ownerEnterpriseId` / `assignedAgencyId` 过滤（`src/data/workspaces.ts:95`），不是数据库行级安全。
- → 真实产品必须换成后端 RBAC + 租户隔离 + 动作幂等键；这条进 §14。

### 2.4 两种办理模式（`FulfillmentMode`）

| 模式 | 中文 | 谁执行代理动作 | 判定位置 | 业务含义 |
|---|---|---|---|---|
| `delegated` | 已委托代理 | 代理所租户 | 默认 | 企业与代理所跨租户协作 |
| `self_serve` | 企业自助 | 企业自己（代行 agency 角色） | `handoff.ts:222` 的角色替换 | 企业有 in-house 撰写能力 |

`self_serve` 下企业执行 `save_draft/submit/file` 时，系统把 `effectiveRole` 从 `enterprise` 换成 `agency`（`handoff.ts:222-224`），因此**同一套状态机同时支持两种商业模式**——这是这个模块能独立卖的结构原因。

---

## 3. 业务对象（字段级）

### 3.1 `HandoffState`（每案 × 每键一份）

权威源 `packages/domain/src/types/index.ts:77`。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `status` | `HandoffStatus` | ✅ | 七态之一；缺省视作 `drafting`（`handoff.ts:246`） |
| `updatedAt` | string (ISO 日) | ✅ | 最后一次迁移日期（日粒度，无时分秒） |
| `updatedBy` | `UserRole` | ✅ | 最后操作方 |
| `note` | string? | — | 展示用短句，**不是**结构化原因 |
| `versions` | `ArtifactVersion[]` | — | 追加式版本数组 |
| `receiptNo` | string? | 条件 | `file` 时必填 |
| `filedAt` | string? | 条件 | `file` 时必填 |

### 3.2 `ArtifactVersion`

权威源 `packages/domain/src/types/index.ts:67`。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | string | ✅ | `ver-<ts>` |
| `version` | string | ✅ | `v1`、`v2`… 由 `nextVersionLabel(count)` 生成（`handoff.ts:284`） |
| `at` | string | ✅ | 生成日期 |
| `byRole` | `UserRole` | ✅ | 谁产生的这一版 |
| `note` | string | ✅ | 该版摘要；缺省填状态中文 |
| `status` | `HandoffStatus` | ✅ | 产生该版时的落点态 |
| `annotation` | string? | — | 退回理由；`request_changes` 时强制有值（`AppContext.tsx:1127`） |

### 3.3 回执对象

| 对象 | 字段 | 源头 | 用途 |
|---|---|---|---|
| `HandoffReceiptFields` | `receiptNo?` / `filedAt?` | `types/index.ts:434` | `HandoffState` 的可选回执面 |
| `FilingReceipt` | `receiptNo` / `filedAt`（均必填） | `types/index.ts:429` | 递交事实的最小对象 |
| `DocketEvent.receiptNo` | string? | `types/index.ts:468` | 回执向期限台账的投影 |

### 3.4 四层别混：状态 / 版本 / 回执 / 待办

| 层 | 回答什么问题 | 变化频率 | 谁写 |
|---|---|---|---|
| `status`（七态） | 现在能不能交给下一道 | 低（每轮 1–3 次） | 双方 |
| `versions[]` | 这一版是谁、什么时候、为什么 | 中（每次动作） | 双方 |
| `receiptNo/filedAt` | 递交这个事实有没有证据 | 极低（一次） | 代理所 |
| `WorkbenchTodo` | 现在轮到谁动手 | 高（每次迁移生成/消账） | 系统派生 |

> 实习生最容易的错：把「状态到了 `filed`」当成「官文已受理」。`filed` 只表示**我方把材料交出去了**；受理号、公开号、授权号是官方锚点，属 docket 与案件字段（见 §14 差距 9）。

---

## 4. 业务规则清单

### 4.1 核心迁移

| ID | 规则 | 现状 |
|---|---|---|
| R10-01 | `save_draft` 只允许从 `drafting` / `changes_requested` 出发，落点恒为 `drafting` | ✅ |
| R10-02 | `submit` 只允许从 `drafting` / `changes_requested` 出发，落 `submitted_to_enterprise` | ✅ |
| R10-03 | `start_review` 只允许从 `submitted_to_enterprise` 出发，落 `enterprise_review` | ✅ |
| R10-04 | `approve` 允许从 `submitted_to_enterprise` 直接批准（跳过 `start_review`） | ✅（有意：企业可不开会直接批） |
| R10-05 | `authorize` 允许从 `submitted_to_enterprise` / `enterprise_review` / `approved` 出发（可跳过 `approve`） | ⚠ 跳态无留痕说明 |
| R10-06 | `request_changes` 允许从 `approved` 拉回，已批准产物可被撤回 | ⚠ 合理但必须留原因；当前仅 `annotation` |
| R10-07 | `file` 允许从 `approved` 直接到 `filed`（跳过 `authorize`） | ⚠ 与「授权在先」的产品叙事冲突 |
| R10-08 | `filed` 是终态，`TRANSITIONS` 无任何动作以它为 `from` | ✅ |
| R10-09 | 动作必须由 `TRANSITIONS` 声明的角色执行，其他角色一律拒绝并给固定文案 | ✅（`handoff.ts:225-245`） |
| R10-10 | `self_serve` 下企业可代行 `save_draft/submit/file`，`effectiveRole` 换成 `agency` | ✅（`handoff.ts:222`） |
| R10-11 | `delegated` 下企业执行代理动作，文案固定为「企业租户不可执行代理专属操作…」 | ✅ |
| R10-12 | 未声明的状态值一律按 `drafting` 处理，不允许「未知态放行」 | ✅（`handoff.ts:246`） |

### 4.2 齐套校验（`REQUIRED_BEFORE_SUBMIT`）

| ID | 规则 | 现状 |
|---|---|---|
| R10-13 | 九个键各有一份必填清单，逐项 id 稳定、可用于前端勾选 | ✅（`handoff.ts:89`） |
| R10-14 | `submit/approve/authorize/file` 四类动作前必须清单全绿，缺项按中文名报错 | ✅（`HandoffActionBar.tsx:114`） |
| R10-15 | 未传入 `checkedRequired` 时不做齐套校验（视为调用方放弃） | ⚠ 后端无兜底 |
| R10-16 | `disclosure_pack` 六项与 `DISCLOSURE_PACK_CHECK_ITEMS` 同源，禁止两套清单 | ✅ |
| R10-17 | `draft_claims` 的 `filing` 项对应 `DRAFT_FILING_CHECK_ITEMS` 五项 | ✅（`handoff.ts:32`） |
| R10-18 | `research_report` 的 `hits_verifiable` 必须 ≥1 条 pubNo+url 可核验命中 | ✅（`guardrails.ts:190`） |
| R10-19 | `intake_quote` 的 `votes` 至少一位委员；`committeeVoteHardBlockGo` 打开时须**可审计**票 | ⚠ 开关关闭时仅 UI 亮灯 |
| R10-20 | `monetize_terms` 的 `approve/authorize` 须 `legalReview === 'reviewed'` | ✅（`handoff.ts:253`） |
| R10-21 | `maintain_annuity` 须「年费计划 + 官费/服务费确认」两项 | ✅ |
| R10-22 | `watch_alert` 须「告警意见 + 风险评级 + 代理所意见」三项 | ✅ |
| R10-23 | 齐套清单支持按路径豁免（如诉讼路径不要求 `terms/party`） | ✅（`omitRequiredIds`，`HandoffActionBar.tsx:44`） |

### 4.3 版本

| ID | 规则 | 现状 |
|---|---|---|
| R10-24 | `save_draft/submit/approve/request_changes/authorize/file` 六动作每次追加一条版本 | ✅（`AppContext.tsx:1103`） |
| R10-25 | 版本号按「已有条数 + 1」生成（`v1`…`vN`），不回收 | ✅ / ⚠ 并发或删除会撞号 |
| R10-26 | `start_review` 不产版本，但业务上「企业开始审核」是事实 | ⚠ 台账缺一环 |
| R10-27 | `request_changes` 必须带批注（无批注时用 note 兜底） | ✅（`AppContext.tsx:1127`） |
| R10-28 | 任意两个版本必须能对比正文差异 | ❌ 只有 note 文本 |
| R10-29 | 版本数组只增不改（append-only），禁止覆盖写 | ⚠ 存在整对象覆盖的分支 |
| R10-30 | 版本必须可导出（给客户/诉讼举证） | ❌ |

### 4.4 回执

| ID | 规则 | 现状 |
|---|---|---|
| R10-31 | `file` 必须同时填 `receiptNo` 与 `filedAt`，缺一拒绝 | ✅（`AppContext.tsx:1091`） |
| R10-32 | 回执写入 `HandoffState` 并追加时间线「递交回执已归档」 | ✅（`AppContext.tsx:1176`） |
| R10-33 | 回执必须把 `fromHandoffWriteback` 期限事件写进 docket | ⚠ 只覆盖 `draft_claims` / `prosecution_response` / `maintain_annuity`，其余键落到 `oa1_response`（`AppContext.tsx:1235`） |
| R10-34 | 回执号须做格式校验（如 CN + 年份 + 序列） | ❌ 任意非空字符串即可 |
| R10-35 | 已归档回执不可被后续动作覆盖 | ❌ 无只增约束 |
| R10-36 | 回执与官方受理号必须区分（回执 ≠ 受理号 ≠ 申请号） | ⚠ 仅文案层面提示 |

### 4.5 权限与跨租户

| ID | 规则 | 现状 |
|---|---|---|
| R10-37 | Persona 硬禁优先于 role（发明人/委员不能假装企业 IP） | ✅（`handoff.ts:213`） |
| R10-38 | 案件可见性按租户过滤：企业看自己 `ownerEnterpriseId`，代理看 `assignedAgencyId` | ✅（`workspaces.ts:95`） |
| R10-39 | 同一案件跨租户交接不得丢失任一侧的版本与回执 | ⚠ 同一快照，但无冲突合并 |
| R10-40 | 跨口（mid:5173 ↔ workbench:5174）以快照同步，冲突按 `revisedAt` 后写胜 | ⚠（`crossPortStore.ts:119`） |
| R10-41 | 交接超时须自动升级（提醒 → 升级 → 风险） | ❌ |
| R10-42 | 已 `submit` 的产物须允许「撤回」（在对方未处理前） | ❌ |

---

## 5. 法律底座 / 行业规则

交接机本身不是法定程序，但它承载的三个事实都有法律后果。以下按「规则 / 产品落点 / 失效后果」写。

### 5.1 委托合同的履约节点

**规则（行业惯例 + 合同实践）**：专利代理委托属委托合同，交付节点（提交日、答复日、缴费日）通常写进委托合同或服务协议，逾期构成违约。⚠ 具体责任以合同条款为准。

**产品落点**：`submitted_to_enterprise` / `approved` / `filed` 三个时间戳应当成为合同履约证据；`versions[]` 是「我方按时交付、对方延迟确认」的唯一凭据。

**失效后果**：客户拒付「我没批过的稿子」时，没有批准时间戳就无法证明责任在企业侧。

### 5.2 递交回执的证据效力

**规则**：电子申请以官方系统生成的**回执**为递交事实的初步证据；回执上的**递交日**决定申请日，而申请日决定新颖性判断基准与保护期起算（《专利法》第二十八条、第四十二条）。⚠ 条号需按当期文本复核。

**产品落点**：`receiptNo` + `filedAt` 强制填写不是表单洁癖，而是**申请日证据链**。`filed` 无回执 = 无申请日证据。

**失效后果**：错过申请日无法补救；合作方争议时无法证明「我在那天交了」。

### 5.3 官方态与内部态必须分离

**规则**：受理、公开、实审、授权、终止都由国家知识产权局记载并公告，企业系统只能「登记」不能「认定」。

**产品落点**：`HandoffStatus` 七态**不含**任何官方态；官方态通过 docket 事件与案件字段登记，并在时间线上标「业务回写」。这是有意的边界设计。

**失效后果**：把内部 `filed` 当官方受理，会导致对外承诺（如「已受理，可上市」）失实。

### 5.4 电子签名的形式要求

**规则**：《电子签名法》要求可靠电子签名满足「专有性、可控性、可检测篡改」等条件；普通系统内「点击批准」不构成可靠电子签名。⚠ 具体条款需按业务场景核。

**产品落点**：`approve` 只是**内部审批留痕**，不等于签署。产品文案不得写「已签署」，`monetize_terms` 的 guardrail 已明确「批准≠合同 PDF/电子签」（`src/data/agents.ts:231`）。

**失效后果**：对外宣称「电子签约」而实际只有点击记录，会在争议中被击穿。

### 5.5 记录留存

**规则（行业惯例）**：专利案卷的法定/实务留存期通常覆盖专利权有效期加若干年；涉外与诉讼案件更长。⚠ 具体年限按企业档案制度与合同约定。

**产品落点**：`versions[]` 与 audit 应支持按案导出、按年归档；当前只有内存数组，无归档能力（§14）。

---

## 6. 状态机

### 6.1 主链与环路

```
                     ┌──────────────── request_changes ────────────────┐
                     ▼                                                │
 drafting ──submit──► submitted_to_enterprise ──start_review──► enterprise_review
    ▲                        │                                        │
    │                        │ approve                                │ approve
    │                        ▼                                        ▼
    └── save_draft ─── changes_requested ◄── request_changes ──── approved
                                                                     │
                                                        authorize    │    file（跳态）
                                                                     ▼         │
                                                          authorized_to_file ──┴──► filed（终态）
```

### 6.2 迁移表（含业务含义与出口条件）

| 当前态 | 可迁往 | 谁做 | 业务含义 | 出口条件 |
|---|---|---|---|---|
| `drafting` | `submitted_to_enterprise` | 代理/自助企业 | 我方稿子交出去了 | 齐套清单全绿 |
| `drafting` | `drafting` | 代理/自助企业 | 存草稿，生版本 | 无 |
| `submitted_to_enterprise` | `enterprise_review` | 企业 IP | 开始看 | 无 |
| `submitted_to_enterprise` | `approved` | 企业 IP | 直接批（可不开会） | 齐套 + 相应闸 |
| `submitted_to_enterprise` | `changes_requested` | 企业 IP | 退回 | 批注必填 |
| `enterprise_review` | `approved` | 企业 IP | 批 | 齐套 + 相应闸 |
| `enterprise_review` | `changes_requested` | 企业 IP | 退回 | 批注必填 |
| `enterprise_review` | `authorized_to_file` | 企业 IP | 批完直接授权（跳 approve） | 齐套 + Full-check |
| `approved` | `authorized_to_file` | 企业 IP | 授权递交 | 齐套 + Full-check |
| `approved` | `changes_requested` | 企业 IP | 反悔拉回 | 批注必填 |
| `approved` | `filed` | 代理/自助企业 | 跳过授权直接归档 | 齐套 + 回执 |
| `changes_requested` | `drafting` | 代理 | 保存修改 | 无 |
| `changes_requested` | `submitted_to_enterprise` | 代理 | 改完重提 | 齐套全绿 |

### 6.3 当前实现的偏差（逐条点名）

1. **`start_review` 在生产路径上几乎不触发**：`pickNextHandoffAction` 只在当前态恰为 `submitted_to_enterprise` 时返回它，而多数 UI 的「批准」按钮同时接受该态，用户通常直接 `approve`。→ 七态实际用成六态。
2. **`approve` 从 `submitted_to_enterprise` 直接落 `approved`**，跳过「审核中」，导致 `enterprise_review` 态在企业侧无停留价值。
3. **`file` 可从 `approved` 直达**，与「先授权后递交」的产品叙事不一致；`authorize` 的唯一硬价值是 `file` 的另一条前置路径。
4. **`request_changes` 从 `approved` 拉回**后，`versions` 里同时存在 `approved` 版本与 `changes_requested` 版本，但没有「作废」标记，版本列表看上去像两个不同产物。
5. **`start_review` 不产版本**，所以「谁在哪天开始审」只存在于时间线，不在版本链上。
6. **`updatedAt` 是日粒度**，同一天多次往返无法排序（版本靠数组顺序，时间线靠 `ts`）。
7. **`transitionHandoff` 不校验齐套**——齐套只在 `HandoffActionBar` 前端判；Agent 走 `SessionConfirmBar` 时另有清单，两条路径的严格度不同。
8. **`approve` 的 `intake_quote` 映射到 `confirmQuote` 命令**（`commands.ts:196`），导致「批准交接」与「确认报价」在审计里是同一串，商务动作被状态机吞掉。

---

## 7. 闸门与条件（代码对齐）

`evaluateGuardrails` 是唯一放行入口（`packages/domain/src/guardrails.ts:225`），任何 UI 都要过它。

| 闸门 / blocker | 触发条件 | 文案 | 位置 |
|---|---|---|---|
| `persona` | Persona 硬禁该动作 | 按 `personaBlocksHandoffAction` | `guardrails.ts:251` |
| `enterprise` | 非企业执行企业闸 | 「仅企业可批准」「仅企业可授权」「仅企业可付款解锁」 | `guardrails.ts:262` |
| `invoice` | 代理执行 authorize 且存在逾期发票 | 「存在逾期发票，请先结清」 | `guardrails.ts:274` |
| `disclosure_pack` | 交底路径 approve 且六项未齐 | 「交底包未齐套（n/6）· 缺项见 ConfirmBar」 | `guardrails.ts:287` |
| `disclosure_approved` | Claims 路径 approve/authorize/file/submit 且交底未批准 | 「交底包未批准 · 请先交底整理/门户」 | `guardrails.ts:305` |
| `filing_check` | Claims 路径 authorize/file/submit 且五清单未齐 | 「递交清单未齐套（n/5）」 | `guardrails.ts:326` |
| `oa_meta` | OA 路径 approve 且未选争点/未填策略 | 「请先选争点类型并填策略要点」 | `guardrails.ts:344` |
| `oa_statement` | OA 路径 authorize/file 且陈述未确认 | 「请先确认陈述（答复草稿→已确认陈述）」 | `guardrails.ts:350` |
| `legal_review` | Monetize 路径 approve/authorize 且法务未阅 | 「批准前须法务已阅（非合同签署）」 | `guardrails.ts:363` |
| `hits_verifiable` | 调研路径 approve/submit 且无 pubNo+url 命中 | 「调研命中未齐…」 | `guardrails.ts:380` |
| `full_check` | authorize/file 且 Full-check 未过 | 「Full-check 未过：…」 | `guardrails.ts:420` |
| `pay_unlock` | 付款动作无案件/无发票/已归档 | 「无待付发票 · 请先去费用中心」 | `guardrails.ts:406` |

**唯一入口原则**：新 UI 若自己写 `if (status === 'approved')` 就不让点，等于开第二条放行路径。禁止。`HandoffActionBar` 的 `validateBefore` 是**二次校验收紧**，不是替代。

---

## 8. 步骤序列 / 工作流

| # | 步骤 | 谁做 | 耗时（建议值） | 产出 | 失败回退 |
|---|---|---|---|---|---|
| 1 | 起草产物 | 代理/自助企业 | 按节点 | 正文 + `save_draft` | 无（可反复） |
| 2 | 自检齐套 | 起草方 | 10 分钟 | `checkedRequired` 全绿 | 缺项回步骤 1 |
| 3 | 提交 | 起草方 | 1 分钟 | `submitted_to_enterprise` + `vN` | 企业退回 → `changes_requested` |
| 4 | 企业审核 | 企业 IP | ⚠ SLA 建议 2 工作日 | `enterprise_review` | 超时升级（未实现，§14） |
| 5 | 批准 / 退回 | 企业 IP | ⚠ 1 工作日 | `approved` 或 `changes_requested` | 退回 → 代理修 |
| 6 | 授权递交 | 企业 IP | ⚠ 1 工作日 | `authorized_to_file` | 发票阻塞 → 12 结清 |
| 7 | 递交归档 | 代理 | 1 天（含官系统操作） | `filed` + 回执 + docket 事件 | 回执缺失 → 不允许归档 |

**每步的完成条件**：1) 正文非空；2) 清单全绿；3) 状态迁移合法；4) 版本已生成；5) 待办已换手。

---

## 9. 写回与命令

| 动作 | CommandName | 写入对象 | 是否跨口 |
|---|---|---|---|
| `save_draft` | `saveDraft` | `handoffs[key]` + `versions[]` | 否（快照同步） |
| `submit` | `submitResearch` / `submitClaims` / `analyzeAndSubmitOA` / `submitHandoff` | 同上 + 待办 | 否 |
| `start_review` | `startReview` | `handoffs[key]` | 否 |
| `request_changes` | `requestChanges` | 同上 + `annotation` | 否 |
| `approve` | `approveHandoff`（`intake_quote` → `confirmQuote`） | 同上 + `Engagement`（仅报价键） | 否 |
| `authorize` | `authorizeFile` | 同上 | 否 |
| `file` | `fileResponse` | 同上 + 回执 + docket 事件 | 否 |

- 命令名全集见 `packages/contracts/src/commandNames.ts:5`（18 个）。
- 映射函数 `commandForHandoffAction`（`packages/contracts/src/commands.ts:189`）。
- **跨口口径**：`cases` / `auditLog` / `docketEvents` / `flowProgressByCase` 进快照；同端口多 tab 走 localStorage + BroadcastChannel；跨端口依赖 mid:5173 的 bridge iframe（`crossPortStore.ts:1`）。**没有共享后端**，冲突按 `revisedAt` 后写胜。
- **跨租户 vs 跨口不是一回事**：跨租户是「同一个快照，两个工作区看不同子集」；跨口是「两个前端进程，同一浏览器存一份快照」。前者是权限问题，后者是同步问题。

---

## 10. 期限与 SLA

### 10.1 法定/硬期限（本节点只做「触发」与「留证」）

| 期限 | 长度 | 起算 | 后果 | 系统位置 |
|---|---|---|---|---|
| 递交日 = 申请日 | 即时 | 官方回执 | 决定新颖性基准与保护期起算 | `filedAt` 字段 |
| 答复期限 | 一通 4 个月 / 后续 2 个月 ⚠ | 通知书发文日 | 逾期视为撤回 | docket `oa1/oa_subsequent` |
| 缴费期限 | 申请费 2 个月；实审 3 年 ⚠ | 申请日/优先权日 | 视为撤回 | docket |
| 年费 | 年度届满前；宽限 6 个月 ⚠ | 申请日周年 | 逾期终止 | docket `annuity` |

### 10.2 业务 SLA（软、可配置；当前全部未实现）

| SLA | 建议值 | 现状 |
|---|---|---|
| 代理提交 → 企业开始审核 | 1 工作日 | ❌ |
| 企业审核时长 | 2 工作日 | ❌ |
| 退回后代理重修 | 3 工作日 | ❌ |
| 授权 → 递交归档 | 2 工作日 | ❌ |
| 交接超时升级 | 见 R10-41 | ❌ |

### 10.3 与 docket 的关系

交接**不自带计时**；它把「递交」这一事实投影成 docket 事件，由 docket 管后续期限。`file` 成功后生成 `status: 'done'` 的事件并把 `dueDate` 记为下一关注日（`AppContext.tsx:1243`）——注意这个 `dueDate` 是**用固定月数猜的**（+4 / +12 / +2），不是按规则表算的，属临时实现。

---

## 11. 边界与失败场景

| # | 场景 | 正确处置 | 现状 |
|---|---|---|---|
| 1 | 代理交了稿，企业三天没看 | 超时提醒 → 升级到 IP 负责人 | ❌ 无 SLA |
| 2 | 企业批准后第二天反悔 | 允许 `request_changes` 从 `approved` 拉回，但必须记录原因与新版本 | ✅ 有批注 / ⚠ 无作废标记 |
| 3 | 代理填了假回执号 | 格式校验 + 与官方系统对账 | ❌ 任意字符串可过 |
| 4 | 递交后才发现稿子交错了版本 | 应能定位「本次递交用的是哪一版」 | ❌ 回执未钉版本号 |
| 5 | 同一案件两个代理所并行接单 | 每所独立交接 + 企业侧汇总 | ❌ 只有单 `assignedAgencyId` |
| 6 | 企业换代理所，旧所产物要迁移 | 交接对象带租户迁移 + 历史只读 | ❌ |
| 7 | 发明人在工作台点了批准 | Persona 硬禁 + 引导到门户 | ✅ |
| 8 | 委员冒充企业 IP 批准 | Persona 硬禁 | ✅ |
| 9 | 逾期发票未结，代理仍要递交 | `invoice` blocker 硬挡 | ✅（仅代理侧） |
| 10 | 企业自助模式下没人可批 | `self_serve` 下企业代行 agency 动作，但企业动作仍需企业侧人 | ✅ |
| 11 | 两端口同时操作同一产物 | 后写胜 + 冲突提示 | ⚠ 无提示，静默覆盖 |
| 12 | 归档后要补交材料 | 必须是新事件（补正/新申请），不能改历史回执 | ❌ |
| 13 | 交接对象被误删（localStorage 清空） | 服务端权威 + 客户端缓存 | ❌ 清缓存即丢 |
| 14 | 中台未启动，跨口只剩单口数据 | 明示「跨口同步降级」 | ✅ 有 `CROSS_PORT_LIMITS_ZH` 文案 |
| 15 | 客户要一份「谁在何时批了什么」的证明 | 导出交接台账（版本 + 回执 + 审计） | ❌ |
| 16 | 同一产物 30 天内被退回 5 次 | 触发质量复盘与升级 | ❌ |

---

## 12. 指标（验收尺子）

| 指标 | 定义 | 健康区间 | 说明 |
|---|---|---|---|
| 一次通过率 | 首次提交即被批准的比例 | 55%–75% | 低 → 代理自检或企业标准有问题 |
| 平均退回次数 | 每产物被 `request_changes` 次数 | < 1.3 | 高 → 齐套清单太松 |
| 企业审核时长 | `submit` → `approve` 中位数 | < 2 工作日 | 直接影响代理排产 |
| 代理响应时长 | `changes_requested` → 重提中位数 | < 3 工作日 | |
| 回执完整率 | `filed` 且含回执号的比例 | 100% | 硬指标，不可妥协 |
| 交接逾期率 | 超过 SLA 的交接数 / 总数 | < 5% | |
| 版本可追溯率 | `filed` 时能定位递交版本的比例 | 100% | ⚠ 当前无法计算（未钉版本） |
| 每案交接次数 | 九键合计迁移次数 / 案 | 参考值 18–30 | 异常高说明流程空转 |

> 能换算成钱的指标：**企业审核时长**（直接决定代理所人天占用与交付周期）与**平均退回次数**（每次退回约等于 0.5–2 人天返工 ⚠ 按所内费率）。

---

## 13. 产品化切分建议

| 层 | 内容 | 是否可独立交付 |
|---|---|---|
| L1 台账层 | 九类产物七态看板 + 版本列表 | 是（可白牌，最低配） |
| L2 校验层 | 每类产物齐套清单 + 闸门聚合 | 是（差异化：清单可配） |
| L3 回执层 | 回执强制 + docket 回写 + 官方态登记 | 是（合规买单） |
| L4 协同层 | 跨租户、跨所、超时升级、导出举证包 | 是（企业 IP 总监买单） |
| L5 开放层 | Webhook / API，与既有案管系统对接 | 依赖客户 IT，但单价高 |

**定价锚点**：按「在办案件数 × 月」最自然；代理所侧可按「席位数」；企业侧可按「交接单量」。

**竞品参照系**：Anaqua / CPA Global 的「案卷流转」偏文档管理与账单，交接语义弱；国内代理机构系统（如 CPClient 生态）强在官文与费用，弱在**企业侧审批留痕**。**「七态交接 + 齐套 + 回执举证」是空位。**

---

## 14. 现状差距表

| # | 差距 | 严重度 | 影响 |
|---|---|---|---|
| 1 | 无交接 SLA 与超时升级（R10-41） | **高** | 交接可以无限期卡住，产品最该解决的痛点未解决 |
| 2 | 无产物版本对比（R10-28） | **高** | 企业看不出改了什么，退回变成盲改 |
| 3 | 无交接撤回（R10-42） | 中 | 误提交只能靠退回，产生脏版本 |
| 4 | 回执未钉版本号 | **高** | 举证时无法回答「交的是哪一版」 |
| 5 | 回执号无格式校验（R10-34） | 中 | 假回执可入账 |
| 6 | `file` 回写 docket 的规则映射错误：`watch_alert` / `monetize_terms` / `research_report` 均落 `oa1_response` | **高** | 产生假期限事件，污染 docket |
| 7 | `start_review` 事实不产版本（R10-26） | 低 | 版本链少一环 |
| 8 | `transitionHandoff` 不校验齐套（R10-15） | **高** | Agent 路径可绕过齐套 |
| 9 | 官方态（受理/公开/授权）无不可逆锚点字段 | **高** | 内部 `filed` 易被误当官方受理 |
| 10 | 跨口冲突静默覆盖 | 中 | 两端同时操作丢数据 |
| 11 | 全内存 + localStorage，清缓存即丢 | **高** | 不可交付 |
| 12 | 无导出举证包 | 中 | 诉讼/尽调无法交付证据 |
| 13 | 角色为芯片，非真鉴权 | **高** | 演示可接受，生产不可 |
| 14 | `approve(intake_quote)` 与 `confirmQuote` 同命令 | 中 | 商务与交接审计混线 |
| 15 | 版本不可导出/不可归档 | 低 | 长期留存缺口 |

**优先补的三件事**（按投入产出比）：

1. **版本对比 + 回执钉版本**（差距 2、4）——一次投入，同时解决「企业看不懂改了什么」和「举证交的哪版」。
2. **交接 SLA + 超时升级**（差距 1）——docket 的升级阶梯已现成（`docketEscalate.ts:44`），复用即可。
3. **`file` 回写映射修正 + 官方锚点字段**（差距 6、9）——不修会持续产生假期限事件。

**建议补的三条规则**（本文已编号，代码未实现）：

- **产物版本对比**（R10-28）：同一键的任意两版应能并排 diff，退回时默认展示「上版 vs 当前」。
- **超时自动升级**（R10-41）：沿用 `DocketEscalationLevel` 四级，进入 `submitted_to_enterprise` 起算。
- **交接撤回**（R10-42）：`submit` 后在对方 `start_review` 前允许 `withdraw`，落回 `drafting` 并留痕；`filed` 后不可撤回。

---

## 15. 术语表

| 术语 | 含义 |
|---|---|
| 交接（handoff） | 企业与代理所之间产物的可用性转移，不是一个法律程序 |
| 产物键（artifact key） | 九类交接对象的稳定标识，与节点 ID 对应 |
| 齐套（required checklist） | 每类产物提交前必须全绿的必填项 |
| 七态 | `drafting` → … → `filed` 的统一状态集 |
| 回执（receipt） | 官方系统返回的递交凭证；与「受理通知书」不同 |
| 跳态 | 合法但不经过中间态的迁移，如 `submitted_to_enterprise → approved` |
| 拉回 | `request_changes` 从 `approved` 退回 |
| 代行 | `self_serve` 模式下企业以 `agency` 角色执行代理动作 |
| 跨口 | 同一浏览器不同端口的两个前端进程共用一份快照 |
| 跨租户 | 同一快照中企业与代理所各看自己子集 |

---

## 16. 来源

- 《专利法》（2020 修正）第二十八条（申请日）、第四十二条（保护期）：https://www.cnipa.gov.cn/art/2020/11/23/art_97_155167.html
- 《专利法实施细则》（2023 修订，2024-01-20 施行）：https://www.cnipa.gov.cn/art/2023/12/21/art_98_189197.html
- 《专利审查指南》（指定期限与答复）：https://www.cnipa.gov.cn/attach/0/%E4%B8%93%E5%88%A9%E5%AE%A1%E6%9F%A5%E6%8C%87%E5%8D%97.pdf
- CNIPA：关于施行修改后的专利法及其实施细则相关审查业务处理的公告：https://www.cnipa.gov.cn/art/2023/12/21/art_66_189190.html
- 《电子签名法》（可靠电子签名要件）⚠ 条款需按业务场景核对
- 行业口径：`docs/lifecycle/industry-reality.md` §4 横切 10
- 代码：见文首权威源清单
