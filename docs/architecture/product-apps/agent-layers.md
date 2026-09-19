# Agent 能力三层叠法（L1→L2→L3）

> **冻结（用户澄清 · 覆盖「通用 vs 项目」并列心智）**：  
> **不是两个并列产品**，而是 **能力叠层**：L1 通用助手 → L2 团队（Grok 多 bot）→ L3 专利 bot（产出对接中台节点）。  
> **样机诚实**：无真 LLM；写库仅 HITL→DomainCommand；禁真 case-core。  
> **实现**：Agent **暂勿大拆**；本规格定叠层与映射后，再按刀改壳。

## 1. 三层定义

| 层 | 名称 | 用户能做什么 | 叠法 |
|----|------|--------------|------|
| **L1** | 通用 Agent | 当**通用助手**用：基础单助手/会话能力（问答、短任务） | 底座 |
| **L2** | 团队模式 | **复刻 Grok Bot**：多 bot、可自设、一对一、bot 互通/编排 | **叠在 L1 上** |
| **L3** | 专利 bot | 做成专利专家 bot；**每个 bot 产出须能对接中台节点数据**（handoff / DomainCommand / 案态） | **叠在 L2 上** |

```text
        ┌─────────────────────────────┐
  L3    │ 专利专家 bot（对接中台节点） │
        ├─────────────────────────────┤
  L2    │ Grok 团队：多 bot / 自设 / 互通 │
        ├─────────────────────────────┤
  L1    │ 通用助手：单会话基础能力       │
        └─────────────────────────────┘
```

进入更高层 = **打开能力**，不是换一个无关 App。

## 2. 与旧「通用 vs 项目」关系

| 旧表述 | 新叠层 |
|--------|--------|
| 并列「通用 Grok」vs「项目模式」 | **心智改为叠层**；项目夹 = L2/L3 的一种**组织容器**（可选），不是第二产品 |
| 通用=自由、项目=专家固定 | **保留为 L2/L3 策略细节**：L2 自由组队；L3 专利身份与中台映射固定 |
| [agent-entry-modes](./agent-entry-modes.md) | **降为**路由/自由度附录；**主心智以本稿为准** |
| [agent-grok-replica](./agent-grok-replica.md) | = **L2 视觉/交互**优先落地 |

## 3. 路由（递进）

```text
/agent                      → L1+L2 默认壳（Grok 列表+聊；可仅用单 bot≈L1）
/agent/bots/:id             → L2 一对一
/agent/bots/new             → L2 自设 bot
/agent/projects*            → 可选容器（组队/绑案）；不阻塞 L1/L2
/agent/compose              → L1 弱化入口（可选）
```

用户可只停在 L1（单 bot 聊）；开多 bot/互通即 L2；挂专利模板/焊专家并对接中台即 L3。

## 4. L3 专节 · 专利 bot → 中台节点映射

> 产出对接 = 提案/工件形状对齐 handoff + 正式写走 DomainCommand；样机可 mock 到 Confirm。  
> 中台权威：案态/handoff 以 mid + contracts 为准；Agent 不另起案库。

| 专利 bot | 中台阶段/节点（示意） | 主工件 `HandoffArtifactKey` | 只读/提案工具（例） | 正式写候选（HITL 后） |
|----------|----------------------|------------------------------|----------------------|------------------------|
| **总控** `orchestrator` | 跨阶段编排 | — | 拆派/汇总事件 | **无**直接 handoff 写；转交专家提案 |
| **检索** `expert-search` | `pre_research` 调研准备 | 可贡献 `research_report` 素材 | `commercial_patent_search` / `cluster_hits` / `patent_search`（`TOOL_TO_COMMAND` 多为 `null`） | 通常只读；绑定新颖性等仍提案 |
| **撰稿** `expert-draft` | `pre_research`→`drafting`；交底 | `research_report` · `disclosure_pack` · `draft_claims` | `draft_research_report` · `structure_disclosure` · `draft_claims` · `saveDraft` 形状 | `submitResearch` · `submitHandoff` · `submitClaims` · `saveDraft`（按闸） |
| **FTO** `expert-fto` | 决策/布局辅助（非独立 Stage 强制） | 可链 `layout_insight`；报告本身默认**不**当法律入库 | 特征/矩阵/风险 mock | **默认不写案**；若入库须单独命令+HITL，禁假装意见已批 |
| **挖掘** `expert-mining`（±） | 立项前 | 可链 `intake_quote` / 洞察 | 发明点评分 mock | `createCaseFromInsight` 等须 HITL；送立项=事件占位亦可 |

闸门键（勿另起）：`go_nogo` · `approve_strategy` · `authorize_file` · `pay_unlock` · `confirm_quote`。  
阶段↔工件权威：`ARTIFACT_FOR_STAGE`（contracts）。

### L3 诚实边界

| 样机可做 | 不可假装 |
|----------|----------|
| Confirm 后 `dispatchCommand(actor:'agent')` 形状 | 真 case-core / 真 LLM |
| 深链 mid 案详 / workbench 阶段 | Agent 内第二套 handoff 状态机权威 |
| 工作篮/种子 Hit 对齐 search | 检索结果自动改案态 |

## 5. 现网已有 vs 缺口（三行）

1. **已有**：Grok 复刻壳（侧栏+消息流+composer，`agent-grok-replica` / 落地 `7ea0a16` 一带）；L2 自设 bot/互通 mock；项目夹与专利专家花名册；HITL→DomainCommand 形状与 `TOOL_TO_COMMAND`。  
2. **缺口**：叠层心智未统一（仍易读成「通用/项目两产品」）；L3→中台节点**端到端可点闭环**不齐（多数工具仍 `null` 只读，Confirm 写回案/handoff 演示弱）。  
3. **缺口**：总控拆派→专家产出→中台工件/深链 mid 的**统一时间线**；FTO/挖掘与 handoff 键的产品承诺未钉死。

## 6. 验收（规格）

- [ ] 文档与入口文案用 L1/L2/L3，不宣扬并列双产品  
- [ ] L3 映射表与 contracts 键一致  
- [ ] 标明 Agent 暂缓大拆，等本规格落地刀  

## 7. Owner

- 规格：架构设计  
- 壳：Agent应用助手（等总控按层开刀）  
