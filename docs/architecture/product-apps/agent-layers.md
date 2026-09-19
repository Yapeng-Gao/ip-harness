# Agent 能力三层叠法（L1→L2→L3）

> **冻结（用户再钉 · 顺序必须 1→2→3）**：  
> - **L1** = 像 **Kimi / ChatGPT**：**单助手对话**（一会话一助手 + composer）  
> - **L2** = **团队模式（Grok）**：多 bot、可自设、一对一、**bot→bot 自发消息/协作**  
> - **L3** = **专利领域 bot**：各有业务逻辑 + **中台对接**（项目夹焊死专家）  
> **入口钉**：L1 / L2 / L3 **各有独立入口（并列）**，**勿**写成「L3 只能从 L2 升」。  
> **废止歧义**：**禁止**「默认一进 `/agent` 就是 L2 多 bot 墙」。默认冷启动 = **L1**。  
> **样机诚实**：无真 LLM；写库 HITL→DomainCommand；禁真 case-core。  
> **不是**并列双产品。

## 1. 类比（冻结）

| 层 | 类比 | 用户一句话 |
|----|------|------------|
| **L1** | Kimi / ChatGPT | 「我跟**一个**助手聊天」 |
| **L2** | Grok Bot **团队** | 「我有一队 bot，它们能互相传话一起干活」 |
| **L3** | 专利专家队 | 「队里是检索/撰稿/FTO…且产出能进中台节点」 |

```text
能力可递进理解（L1 底座 → L2 团队能力 → L3 专利对接），但 **产品入口并列**：顶栏可直接进 L2 或 L3，**不**强制先走 L2 再进 L3。
禁止：跳过 L1 把多 bot 墙当成 `/agent` 默认冷启动
```

## 2. 三层定义

| 层 | 能力 | 叠法 |
|----|------|------|
| **L1** | 单助手：消息流 + sticky composer；可选换「当前助手」但不强制侧栏墙 | 底座；**默认落地** |
| **L2** | 多 bot 列表、新建 bot、一对一、bot↔bot 消息/编排 | **独立入口** `/agent/team`（顶栏「团队」） |
| **L3** | 专利专家身份 + 四件套 + 中台 handoff/Command 映射 | **独立入口** `/agent/projects`（顶栏「专利项目」） |

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
| 项目夹 | = **L3 独立入口**组织手段；与 L2 团队**并列**，非「只能从团队升」 |

## 5. L3 专节 · 专利 bot → 中台节点映射

> 产出对接 = 提案/工件形状对齐 handoff + 正式写走 DomainCommand；样机可 mock 到 Confirm。  
> 中台权威：案态/handoff 以 mid + contracts 为准；Agent 不另起案库。

| 专利 bot | 中台阶段/节点（示意） | 主工件 `HandoffArtifactKey` | 只读/提案工具（例） | 正式写候选（HITL 后） |
|----------|----------------------|------------------------------|----------------------|------------------------|
| **总控** `orchestrator` | 跨阶段编排 | — | 拆派/汇总 | **无**直接 handoff 写 |
| **调研** `expert-research` | `pre_research` | `research_report` 素材 | 检索工具（多 `null`） | 通常只读 |
| **立项** `expert-intake` | 立项前 / `decision` | `intake_quote` | 评分 mock | HITL 后建案/送立项 |
| **交底** `expert-disclosure` | 交底 | **`disclosure_pack`** | 结构整理 | `submitHandoff` / `saveDraft` |
| **撰稿** `expert-draft` | `drafting` | **`draft_claims`** | 起草形状 | `saveDraft` / `submitClaims` |
| **附图** `expert-figure` | `drafting` 辅助 | 附件示意 | 清单 mock | 挂章事件 |
| **FTO** `expert-fto` | 决策/布局辅助 | `layout_insight` | 五步 mock | **默认不写案** |
| **递交** `expert-filing` | authorize→file | 齐套清单 | 形式检查 | 闸+HITL；禁真递交 |
| **OA** `expert-oa` | `prosecution` | **`prosecution_response`** | OA 策略 | `saveDraft` / `submitHandoff` |

完整名单/STAGE 映射/辅席口径见 **[agent-l3-patent.md](./agent-l3-patent.md)**（含 maintain/monetize/watch 缺口）。

闸门键（勿另起）：`go_nogo` · `approve_strategy` · `authorize_file` · `pay_unlock` · `confirm_quote`。  
阶段↔工件权威：`ARTIFACT_FOR_STAGE`（contracts）。

### L3 诚实边界

| 样机可做 | 不可假装 |
|----------|----------|
| Confirm 后 `dispatchCommand(actor:'agent')` 形状 | 真 case-core / 真 LLM |
| 壳内展示映射表 + DomainCommand 示意 | Agent 内第二套 handoff 权威；**勿**要求可点跳转 mid |
| 工作篮/种子 Hit 对齐 search | 检索结果自动改案态 |

## 6. 现网已有 vs 缺口（更新）

1. **已有**：曾按 Grok 复刻把 `/agent` 做成多 bot 主屏（偏 L2）；HITL/Command 形状在。  
2. **缺口（本刀）**：**L1 单助手默认主路径**未钉——需把冷启动改回 ChatGPT 形，团队改为显式升级。  
3. **缺口（本刀·L3）**：项目模式焊死专家 + Confirm→中台示意；详见 [agent-l3-patent](./agent-l3-patent.md)。

## 7. L2 / L3 专文

- L2：bot 自发互通见 **[agent-l2-team.md](./agent-l2-team.md)**
- L3：专利专家 + 中台映射见 **[agent-l3-patent.md](./agent-l3-patent.md)**（开 L3 刀）

## 8. 本刀实现令（Agent）

| 做 | 不做 |
|----|------|
| `/agent` = **L1** 单助手+composer 主路径 | 一进来多 bot 墙当唯一主屏 |
| 顶栏「团队」→ `/agent/team`；「专利项目」→ `/agent/projects` | 把 L3 埋进 L2 升路径 |
| 维持 HITL 纪律 | 真 LLM / case-core |

## 9. 验收

- [ ] 文档类比为 Kimi·ChatGPT / Grok团队 / 专利bot；顺序 1→2→3  
- [ ] 废止「默认 L2」  
- [ ] Agent 落地：冷启动 L1；团队显式进  

## 10. Owner

- 规格：架构设计  
- 壳：Agent应用助手 · **先做 L1**  
