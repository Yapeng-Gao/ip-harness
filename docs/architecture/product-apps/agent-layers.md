# Agent 能力三层叠法（L1→L2→L3）

> **冻结（用户再钉 · 顺序必须 1→2→3）**：  
> - **L1** = 像 **Kimi / ChatGPT**：**单助手对话**（一会话一助手 + composer）  
> - **L2** = 叠在 L1 上的 **团队模式（Grok）**：多 bot、可自设、一对一、**bot→bot 自发消息/协作**  
> - **L3** = 叠在 L2 上的 **专利领域 bot**：各有业务逻辑 + **中台对接**  
> **废止歧义**：**禁止**「默认一进 `/agent` 就是 L2 多 bot 墙」。默认主路径 = **L1**；团队/专利为**显式升级**。  
> **样机诚实**：无真 LLM；写库 HITL→DomainCommand；禁真 case-core。  
> **不是**并列双产品。

## 1. 类比（冻结）

| 层 | 类比 | 用户一句话 |
|----|------|------------|
| **L1** | Kimi / ChatGPT | 「我跟**一个**助手聊天」 |
| **L2** | Grok Bot **团队** | 「我有一队 bot，它们能互相传话一起干活」 |
| **L3** | 专利专家队 | 「队里是检索/撰稿/FTO…且产出能进中台节点」 |

```text
必须顺序：先会 L1 单聊 → 再开 L2 团队 → 再上 L3 专利对接
禁止：跳过 L1 默认甩多 bot 侧栏当唯一主屏
```

## 2. 三层定义

| 层 | 能力 | 叠法 |
|----|------|------|
| **L1** | 单助手：消息流 + sticky composer；可选换「当前助手」但不强制侧栏墙 | 底座；**默认落地** |
| **L2** | 多 bot 列表、新建 bot、一对一、bot↔bot 消息/编排 | **显式升级**入口叠在 L1 |
| **L3** | 专利专家身份 + 四件套 + 中台 handoff/Command 映射 | 叠在 L2（模板/焊入专家） |

## 3. 路由（默认 L1）

```text
/agent                 → 【默认】L1 单助手主路径（ChatGPT 形）
/agent/team 或「升级到团队」→ L2 Grok 多 bot 壳（见 agent-grok-replica）
/agent/bots/:id        → L2 内一对一
/agent/bots/new        → L2 新建
/agent/projects*       → 可选容器；不阻塞 L1
/agent/compose         → 可与 /agent L1 合并
```

实现名可变，但验收：**冷启动打开壳 = L1 单助手**，团队为二次入口。

## 4. 与旧文关系

| 文 | 角色 |
|----|------|
| 本稿 | **主心智** |
| [agent-grok-replica](./agent-grok-replica.md) | = **L2** 视觉规格（**不是**默认落地） |
| [agent-entry-modes](./agent-entry-modes.md) | 自由度附录；服从「先 L1」 |
| 项目夹 | L2/L3 组织手段，非并列产品 |

## 5. L3 专节 · 专利 bot → 中台节点映射

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

## 6. 现网已有 vs 缺口（更新）

1. **已有**：曾按 Grok 复刻把 `/agent` 做成多 bot 主屏（偏 L2）；HITL/Command 形状在。  
2. **缺口（本刀）**：**L1 单助手默认主路径**未钉——需把冷启动改回 ChatGPT 形，团队改为显式升级。  
3. **缺口（后刀）**：L3→中台端到端闭环仍弱；先不做大拆 L3。

## 7. 本刀实现令（Agent）

| 做 | 不做 |
|----|------|
| `/agent` = **L1** 单助手+composer 主路径 | 一进来多 bot 墙当唯一主屏 |
| 团队模式 = **显式升级入口**（保留 Grok 布局） | 本波大拆 L3 / 项目花活 |
| 维持 HITL 纪律 | 真 LLM / case-core |

## 8. 验收

- [ ] 文档类比为 Kimi·ChatGPT / Grok团队 / 专利bot；顺序 1→2→3  
- [ ] 废止「默认 L2」  
- [ ] Agent 落地：冷启动 L1；团队显式进  

## 9. Owner

- 规格：架构设计  
- 壳：Agent应用助手 · **先做 L1**  
