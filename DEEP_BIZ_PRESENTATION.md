# DEEP_BIZ_PRESENTATION · 业务逻辑 × 业务呈现剩余缺口

日期：2026-09-11（UTC+8）  
范围：`/workspace/ip-harness` · Agent + Workbench（对照 `DEEP_NODE_EVAL.md` / `OPTIMIZE_NOTES.md` Round · Business-logic Deep Top 5）  
方法：**源码核验**（非仅文档）+ 业务故事 / 屏上呈现 / 代码三列对照。

> **已修（本轮代码）**：Fix A–E 已落地，见 `OPTIMIZE_NOTES.md`「Round · Business Fix A–E」。下文「仍偏戏台」为修前盘点；立项双闸 / 交底包门户 / HITL 等价文案 / Catalog 带案 / Toast 去转化 / Claims 授权闸 / 回执表单以源码为准。

---

## 1. Verdict · 什么已经扎实，什么仍偏戏台

### 已扎实（可抗浅盘问）

| 域 | 为何站得住 |
|----|------------|
| 共用命令面 | `dispatchCommand` + `actor: user \| agent` 真写库，审计可对照 |
| 调研 / OA / 立项主路径 | 工作台字段闸 + Agent HITL/剧本最深；RACI 与发票阻塞同源 |
| Deep Top 5 键裂缝 | `disclosure_pack` / `layout_insight` 已独立；等效演示降级；ConfirmBar 命令链预告；Maintain `payInvoice` 对齐 |
| 工作台待办队列 | `WorkbenchHome` 按角色 + fulfillmentMode 过滤，「谁该办」在队列层可见 |

### 仍偏戏台 / 易被打穿

| 域 | 本质 |
|----|------|
| HITL 一点多写 | 预告有了，**行为仍自动串** submit→startReview→approve；与工作台逐步点不同构 |
| 交底表面 | 键修好了，**发明人门户仍不认 `disclosure_pack`**，客户看不见「交底包台账」 |
| 立项双闸 | UI 画两个闸，`go_nogo` 一点顺带 clear `confirm_quote` → **屏上撒谎** |
| 会话列表 | 只有运行态，**无 RACI / 发票 / 待谁确认** → 换角色扫不到该办项 |
| Specialty 薄层 | Claims 无授权递交；Watch 无升级/忽略分化；Monetize 无法务会签 → 剧本深、表单浅 |
| Toast 下一步 | `monitoring→去转化`、`drafting→去审查` 仍像产品经理硬跳 |

**一句话**：Deep Top 5 把「键污染 / 捷径默认 / 付款不对齐」修实了；剩下打穿点主要是 **「屏上说的业务」与「代码一次写进去的业务」不对齐**，以及 **交底/会话列表/Toast 上业务状态不可见**——是呈现洞 + 少量逻辑捷径，不是再缺圆角。

---

## 2. Verified Top 5 状态（源码）

| # | 项 | 状态 | 核验指针 |
|---|----|------|----------|
| P0-1 | 交底勿占 `intake_quote` | ✅ 已落地 | `data/agents.ts` `agent-disclosure.handoffKey='disclosure_pack'`；`types` 联合类型；`data/handoff.ts` 标签+REQUIRED；`AppContext` `pathMap.disclosure_pack→/inventor`；种子文案 |
| P0-2 | 一键等效演示降级 | ✅ 已落地 | `SessionWorkspaceHeader` 藏「更多」+「绕过逐步确认 · 仅演示捷径」；`AgentContext.runEquivalenceDemo` timeline 注明绕过 HITL |
| P1-3 | 布局 handoff / 深链 | ✅ 已落地 | `handoffKey='layout_insight'`；`workbenchPath='/workbench/research'`；批准/等效后 `navigateTo=/workbench/research/:newId` |
| P1-4 | HITL 命令链预告 | ✅ 已落地 | `sessionGates.previewHitlCommandChain`；`SessionConfirmBar`「将连续写入：…」琥珀条 |
| P1-5 | 年费付款双路径 | ✅ 已落地 | `MaintainFlow`「付款解锁」区同调 `payInvoice`；Agent `pay_unlock` 无票失败提示+闸门禁用 |

**残留（Top 5 修完后仍在）**：交底键独立 ≠ 门户能展示该键；预告 ≠ 逐步模式；Maintain 有付款 ≠ Claims/Watch/Monetize 深度齐平。

---

## 3. 剩余问题 · 按「客户盘问会打穿」排序

判定刻度：**P0** 当场穿帮业务故事 · **P1** 对比工作台/换角色会穿 · **P2** 深问才露怯。

### #1 · P0/P1 · 发明人门户仍不是「交底包」业务表面

| 维 | 内容 |
|----|------|
| **业务故事** | 交底 Agent 批准 → 产出结构化交底包 → 发明人/IP 在台账可见 → 再进立项/撰写 |
| **屏上呈现** | Agent「打开对应工作台」→ `/inventor`；门户只有「草稿→已立案」disclosure 状态机与表单，**零 `disclosure_pack` / HandoffChip / 版本 / Agent 产物** |
| **代码** | `agents.ts` workbenchPath=`/inventor`；`InventorPortal.tsx` 只用 `disclosures` + `advanceDisclosure`；`REQUIRED_BEFORE_SUBMIT.disclosure_pack` 无 UI 消费面 |
| **洞型** | **呈现洞为主**（键已逻辑正确，表面断层）+ 产品树不对称（无 `/workbench/disclosure`） |
| **打穿话术** | 「批准交底后交底包在哪看？」「为什么进发明人门户看不到刚才 Agent 写的交接？」 |

### #2 · P0/P1 · 立项 `go_nogo` 合并吃掉 `confirm_quote`

| 维 | 内容 |
|----|------|
| **业务故事** | 委员/企业先 Go，再单独确认报价（双闸） |
| **屏上呈现** | ConfirmBar 画两个步骤圆点；一点「立项 Go」预告链含「确认报价」，且成功后**两闸都变已通过** |
| **代码** | `AgentContext.sessionHitlAction`：`go_nogo` 企业路径直接 `confirmQuote`；随后 `cleared.push('confirm_quote')`（约 1150–1289 行）；`previewHitlCommandChain('go_nogo')` 也写「确认报价」 |
| **洞型** | **逻辑捷径 + 呈现撒谎**（双闸 UI，单点清双闸） |
| **打穿话术** | 「报价确认闸呢？」「工作台还有投票+Go，Agent 一点全过了？」 |

对照：`IntakeFlow` 投票为本地 state 不进审计；Agent 无投票 UI——粒度本就不齐，再叠加闸门合并更易穿。

### #3 · P1 · HITL 仍自动串命令（预告不够）

| 维 | 内容 |
|----|------|
| **业务故事** | 人逐步：提交 → 开始审核 → 批准/授权（与 `HandoffActionBar` 同构） |
| **屏上呈现** | 琥珀「将连续写入：提交 → …」+「与工作台逐步点按钮等价」——**承认不等价却标等价** |
| **代码** | `sessionHitlAction` 循环 `attempts: ['submit','start_review','approve']`；无 stepwise 模式开关 |
| **洞型** | **逻辑洞**（行为）+ **呈现洞**（文案把捷径说成等价） |
| **打穿话术** | 「审计墙一次蹦三条谁点的？」「为什么工作台要点三次 Agent 点一次？」 |

结论：**仅预告不够**；客户对比工作台时仍是 piercing。要末逐步模式，要末诚实改文案为「演示自动串 · 正式产品逐步」。

### #4 · P1 · OA/撰写回执 parity（原 Deep #6）

| 维 | 内容 |
|----|------|
| **业务故事** | 递交归档须真实回执号+日期 → Docket |
| **屏上呈现** | 工作台 `HandoffActionBar` 强制手填；Agent「递交归档」无表单，瞬间成功 |
| **代码** | `AppContext` file 校验 `receiptNo`/`filedAt`；Agent `buildCmdForAction` / `onFileResponse` 自动 `CN-AGENT-${slice}` |
| **洞型** | **逻辑+呈现**（Agent 路径跳过必填表面） |
| **打穿话术** | 「回执号哪来的？」「正式产品也自动编一个？」 |

### #5 · P1 · Catalog/Harness「开始办理」无案件（原 Deep #7）

| 维 | 内容 |
|----|------|
| **业务故事** | 正式执行绑定案件才写中台 |
| **屏上呈现** | 进会话后琥珀「尚未关联案件，确认后不会写回中台」——**事后打断**，非事前选案 |
| **代码** | `AgentCatalogPage.startWith` / `AgentHarnessOverview.startWith`：`createSession` **无 caseId**；Home 才有选案 |
| **洞型** | **呈现/流程洞**（逻辑闸门其实在，入口没带上） |
| **打穿话术** | 「点了开始办理怎么又要选案？」「正式写回到底能不能用？」 |

### #6 · P1 · `nextActionsForStage` 业务硬跳（原 Deep #8）

| 维 | 内容 |
|----|------|
| **业务故事** | 成功后下一步应符合业态：监控→处置/期限/调研；撰写齐套→等待一通/期限，而非直接「去审查/去转化」 |
| **屏上呈现** | Toast「下一步」芯片仍：`monitoring→去转化`；`drafting→去审查` |
| **代码** | `flow/toast.tsx` `nextActionsForStage` |
| **洞型** | **呈现洞**（带一点产品叙事错误） |
| **打穿话术** | 「监控完为什么去转化？」「申请刚递交怎么就审查了？」 |

### #7 · P1 · Claims Agent vs DraftFlow 授权/回执能力差

| 维 | 内容 |
|----|------|
| **业务故事** | 撰写齐套 → 企业授权 → 递交回执（Draft 已具备） |
| **屏上呈现** | Claims 仅 `approve_strategy`；无授权钮、无递交清单强制 |
| **代码** | `agents.ts` hitlGates=`['approve_strategy']`；`DraftFlow` `showFile` + 5 项 checklist + authorize/file |
| **洞型** | **逻辑能力洞**（Agent 缺闸）+ 呈现不对等 |
| **打穿话术** | 「权利要求 Agent 怎么递交国知局？」「和撰写台为什么不是同一套闸？」 |

### #8 · P1 · Watch Agent vs WatchFlow 动作粒度

| 维 | 内容 |
|----|------|
| **业务故事** | 告警：确认 / 升级维权 / 关闭 / 生成调研（角色裁剪） |
| **屏上呈现** | Agent 剧本只有「批准 watch_alert」；工作台有升级/确认/关闭/更多 |
| **代码** | `agent-watch` hitlGates 仅 approve；`WatchFlow` `processAlert` 多状态 |
| **洞型** | **逻辑+呈现**（HITL 未表达处置枚举） |
| **打穿话术** | 「忽略和升级在 Agent 里点哪？」 |

### #9 · P1 · 会话列表缺业务徽章（RACI / 发票 / HITL）

| 维 | 内容 |
|----|------|
| **业务故事** | 换企业/代理后，一眼扫到「待我确认 / 发票阻塞 / 无案」 |
| **屏上呈现** | 表列：标题 · 办理人 · 案件 · **运行状态** · 更新；侧栏仅 needs_human 点 |
| **代码** | `AgentSessionsList.tsx` 无 invoice/RACI/gate 列；`AgentSessionSidebar` 状态点≠业务徽章 |
| **洞型** | **纯呈现洞**（数据在会话/案件上可算） |
| **打穿话术** | 「我是企业，哪些会话等我批？」「哪条被发票卡住了？」 |

### #10 · P1/P2 · Monetize 法务/合同深度不足

| 维 | 内容 |
|----|------|
| **业务故事** | 条款 → 法务会签 → 合同状态 → 里程碑验收 |
| **屏上呈现** | MonetizeFlow：路径/Term Sheet/里程碑/通用交接；Agent：费率剧本+approve |
| **代码** | 无独立法务闸；`monetize_terms` 通用 handoff |
| **洞型** | **逻辑浅**（可接受为 beta，但勿称「合同审批闭环」） |
| **打穿话术** | 「法务在哪签？」「合同 PDF/状态机呢？」 |

### 用户能否「看见」四要素？（会话内 vs 列表）

| 要素 | 会话工作区 | 会话列表 / 侧栏 | 工作台 |
|------|------------|-----------------|--------|
| 当前步骤 | ✅ ConfirmBar「确认步骤」圆点；流程 Stepper | ❌ | ✅ Stepper（可跳步） |
| 谁必须动 | ⚠️ 按钮禁用理由（仅企业/发票）；右栏办理人 | ❌ 无 RACI「待企业/待代理」 | ✅ 队列按角色过滤 |
| 下一步动作 | ✅ 主钮 + Toast；但常是「一点多写」 | ❌ | ✅ Toast 芯片（内容有硬跳） |
| 阻塞原因 | ✅ 无案琥珀；发票/无票文案 | ❌ | ✅ HandoffActionBar 发票 alert |

**结论**：业务状态在「已打开的办理页」勉强可见；在「找活干的列表」基本不可见——换角色演示会穿。

---

## 4. 推荐下一步 5 个 · 业务 + 呈现（具体）

按打穿优先级，**不做壳 polish**：

### Fix A · P0 · 交底包在发明人门户「可见可续」

1. `InventorPortal`：按案件/交底展示 `disclosure_pack` 交接态（HandoffChip）+ 最近 Agent 产物摘要/链回会话。  
2. 或：交底 Agent 成功条改为「打开交底包」深链（带 `?pack=` / case），门户空态说明「交底包由 IP 办理写入」。  
3. 文案统一：门户 disclosure 状态机 = 发明人提报；`disclosure_pack` = 结构化办理产物——**两层都要说清**。  
指针：`InventorPortal.tsx` · `AppContext pathMap` · `handoff.ts` REQUIRED。

### Fix B · P0 · 拆开立项双闸（逻辑诚实）

1. `go_nogo` **只** submit(+start_review)，**禁止**自动 `confirmQuote` / 禁止 clear `confirm_quote`。  
2. ConfirmBar：Go 通过后高亮「确认报价」为下一主钮；预告链去掉「确认报价」。  
3. 可选：工作台投票写入一条审计/活动，缩小 Agent↔Intake 粒度差。  
指针：`AgentContext.tsx` ~1150–1289 · `sessionGates.previewHitlCommandChain` · `IntakeFlow.tsx`。

### Fix C · P1 · HITL 逐步模式（或诚实降级文案）

1. ConfirmBar 增加「逐步写入」：每次只 dispatch 链上下一条，圆点跟手。  
2. 默认演示可保留自动串，但文案改为「演示自动串命令（非逐步）」——**删掉「与工作台等价」**。  
3. 审计条旁显示「本步：SubmitHandoff」避免一次三条困惑。  
指针：`sessionHitlAction` · `SessionConfirmBar.tsx`。

### Fix D · P1 · 入口带案 + 列表业务徽章（呈现「谁/堵」）

1. Catalog/Harness `startWith`：最近案件 / `?case=` / 强制选案模态（对齐 Home）。  
2. `AgentSessionsList` + 侧栏行：徽章「待企业确认 | 待代理递交 | 发票阻塞 | 未关联案件」。  
3. 数据：`clearedHitlGates` + `hasBlockingInvoiceForCase` + `caseId` + agent.raciHint。  
指针：`AgentCatalogPage.tsx` · `AgentSessionsList.tsx` · `AgentSessionSidebar.tsx`。

### Fix E · P1 · 回执表单 + Toast 下一步去业态化 + Claims 对齐 Draft

1. Agent OA/年费「递交归档」弹与工作台同构的回执号+日期（可预填演示值但须确认）。  
2. `nextActionsForStage`：`monitoring`→去期限/回案件/生成调研；`drafting`→去期限/回案件（「去审查」降为次要或加「已递交后」条件）。  
3. `agent-claims.hitlGates` 增加 `authorize_file`（或正式路径明确「授权请回撰写台」并在 ConfirmBar 链出 Draft）。  
指针：`AgentSessionWorkspace` onFileResponse · `toast.tsx` · `agents.ts` · `DraftFlow.tsx`。

（候补 P2：Watch HITL 处置枚举；Monetize 法务闸 beta 诚实标注；Harness 再压说明书感。）

---

## 5. 附录 · 原 Deep Top 8 中 6–8 现状

| # | 项 | Top5 后 | 本轮判定 |
|---|----|---------|----------|
| 6 | OA/撰写回执 parity | 未修 | 仍 P1 · 进推荐 Fix E |
| 7 | Catalog 开始无案件 | 未修 | 仍 P1 · 进推荐 Fix D |
| 8 | nextActionsForStage 硬跳 | 未修 | 仍 P1 · 进推荐 Fix E |

---

*只读评估产物；修复请另开变更。*
