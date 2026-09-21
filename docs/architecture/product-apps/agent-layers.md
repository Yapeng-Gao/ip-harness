> **变更摘要（2026-09-21 · 业务模式）**：专利业务冷启动改为 **「我的案子」**（[agent-business-mode](./agent-business-mode.md)）；Catalog→`/agent/catalog`。与双产品路径兼容：业务 `/agent` ≠ 沙盒 `/agent/sandbox`。
> **变更摘要（2026-09-21 · B席 nits）**：叠名 **Solo=L1 / Team=L2 / Domain=L3**；**双产品冷启动**见 §3；FTO≠`layout_insight`。
> **变更摘要（2026-09-21）**：叠名 **Solo=L1 / Team=L2 / Domain=L3**（不删除 L1/L2/L3 入口钉）；**Team 与 Domain 共用同一多 bot 运行时**，入口可并列；平台能力一律 **Tool 化**。平台总览 [../agent-platform.md](../agent-platform.md)；差距 [agent-platform-gap.md](./agent-platform-gap.md)。
> **专利产品壳**以 [agent-patent-shell.md](./agent-patent-shell.md) 为准（Catalog 默认；L1/自由 L2 降级）。
# Agent 能力三层叠法（L1→L2→L3）

> **冻结（用户再钉 · 顺序必须 1→2→3）**：  
> - **L1** = 像 **Kimi / ChatGPT**：**单助手对话**（一会话一助手 + composer）  
> - **L2** = **团队模式（Grok）**：多 bot、可自设、一对一、**bot→bot 自发消息/协作**  
> - **L3** = **专利领域 bot**：各有业务逻辑 + **中台对接**（项目夹焊死专家）  
> **入口钉**：L1 / L2 / L3 **各有独立入口（并列）**，**勿**写成「L3 只能从 L2 升」。  
> **废止歧义**：**禁止**「默认一进 `/agent` 就是 L2 自由多 bot 墙」。  
> **冷启动（双产品路径 · 消硬拧）**：见 §3——**通用沙盒**冷启动=L1(Solo)；**专利产品**冷启动=Catalog(Domain 子集)，以 [agent-patent-shell](./agent-patent-shell.md) 为准。  
> **样机诚实**：无真 LLM；写库 HITL→DomainCommand；禁真 case-core。  
> **能力叠层**不是「两个无关产品」；**入口**可为并列双路径。


## 0. 命名叠层（Solo / Team / Domain）

| 入口钉（保留） | 平台命名 | 运行时 |
|----------------|----------|--------|
| **L1** 单助手 | **Solo** | 单对话 + 工具调用 |
| **L2** 团队 | **Team** | **多 bot 协作 runtime（与 Domain 相同）**；分工现场决定 |
| **L3** 专利领域 | **Domain** | **同一多 bot runtime**；分工由 Domain Pack SOP 固化 |

- **入口并列**：顶栏可直达 L2 / L3，**不**要求 Domain 只能从 Team 升（入口钉不变）。
- **能力工具化**：检索 / 画原型 / 代码执行 / 浏览器 / Skill(MCP) 全部注册为 Tool，不是某 bot 私有魔法。
- 专利产品冷启动以 [agent-patent-shell](./agent-patent-shell.md) 为准；完整 Pack：[../domain-packs/](../domain-packs/)。

## 1. 类比（冻结）

| 层 | 类比 | 用户一句话 |
|----|------|------------|
| **L1** | Kimi / ChatGPT | 「我跟**一个**助手聊天」 |
| **L2** | Grok Bot **团队** | 「我有一队 bot，它们能互相传话一起干活」 |
| **L3** | 专利专家队 | 「队里是检索/撰稿/FTO…且产出能进中台节点」 |

```text
能力可递进理解（L1 底座 → L2 团队能力 → L3 专利对接），但 **产品入口并列**：顶栏可直接进 L2 或 L3，**不**强制先走 L2 再进 L3。
禁止（通用沙盒）：把自由多 bot 墙当成 `/agent` 冷启动。
专利产品：`/agent`→Catalog 见 agent-patent-shell——与上条**不互斥**（双产品路径）。
```

## 2. 三层定义

| 层 | 能力 | 叠法 |
|----|------|------|
| **L1** | 单助手：消息流 + sticky composer；可选换「当前助手」但不强制侧栏墙 | 底座；**通用沙盒默认** |
| **L2** | 多 bot 列表、新建 bot、一对一、bot↔bot 消息/编排 | **独立入口** `/agent/team`（顶栏「团队」） |
| **L3** | 专利专家身份 + 四件套 + 中台 handoff/Command 映射 | **独立入口** `/agent/projects`（顶栏「专利项目」） |

## 3. 路由与冷启动（双产品路径）

| 产品面 | `/agent` 冷启动 | 说明 |
|--------|-----------------|------|
| **通用沙盒**（Solo/Team 演练） | **L1 单助手** | 禁止一进来自由多 bot 墙；Team=`/agent/team` |
| **专利业务**（Domain 收敛） | **我的案子** | 以 [agent-business-mode](./agent-business-mode.md) 为准；Catalog→`/agent/catalog` |

```text
# 通用沙盒
/agent                 → L1 Solo（ChatGPT 形）
/agent/team            → L2 Team
/agent/bots/:id        → L2 一对一
/agent/sandbox         → （可选显式）通用沙盒入口

# 专利产品（可与上并列；部署可将 /agent 指到 Catalog）
/agent                 → 我的案子（业务默认；见 agent-business-mode）
/agent/catalog         → 专家工作台（原 Catalog）
/agent/projects*       → L3 Domain 项目
/agent/seats/:id       → 单席
/agent/projects/:id/room → 群聊 loop
```

**验收拆开**：通用沙盒冷启动=L1；专利产品冷启动=Catalog。**勿**两文各钉一套却不声明产品面。

## 4. 与旧文关系

| 文 | 角色 |
|----|------|
| 本稿 | 能力叠层 + **通用沙盒**入口 |
| [agent-patent-shell](./agent-patent-shell.md) | **专利产品**入口与 Catalog（可覆盖 `/agent`） |
| [agent-grok-replica](./agent-grok-replica.md) | = **L2** 视觉规格 |
| [agent-entry-modes](./agent-entry-modes.md) | 自由度附录；专利面服从 shell |
| 项目夹 | = **L3** 组织手段；与 L2 **并列** |

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
| **挖掘** `expert-mining` | 立项前簇 | 提案 `mining_pack` | 发明点拆分 | 通常事件/提案；**≠立项** |
| **布局** `expert-layout` | 工作台 layout | 可对齐 **`layout_insight`** | 保护网方案 | HITL① 目标态 |
| **附图** `expert-figure` | `drafting` 辅助 | 附件示意（无独立 key） | 清单 mock | 挂章事件 |
| **FTO** `expert-fto` | 自由实施辅席 | **无**独立 key；**≠** `layout_insight` | 五步/claim chart mock | **默认不写案** |
| **递交** `expert-filing` | authorize→file | 齐套清单 | 形式检查 | 闸+HITL；禁真递交 |
| **OA** `expert-oa` | `prosecution` | **`prosecution_response`** | OA 策略 | `saveDraft` / `submitHandoff` |

完整名单见 **[agent-l3-patent.md](./agent-l3-patent.md)** · Pack **[../domain-packs/patent-pack-design.md](../domain-packs/patent-pack-design.md)**。  
`layout_insight` **只**给布局席/layout 台；**禁止**写到 FTO。

闸门键（勿另起）：`go_nogo` · `approve_strategy` · `authorize_file` · `pay_unlock` · `confirm_quote`。  
阶段↔工件权威：`ARTIFACT_FOR_STAGE`（contracts）。

### L3 诚实边界

| 样机可做 | 不可假装 |
|----------|----------|
| Confirm 后 `dispatchCommand(actor:'agent')` 形状 | 真 case-core / 真 LLM |
| 壳内展示映射表 + DomainCommand 示意 | Agent 内第二套 handoff 权威；**勿**要求可点跳转 mid |
| 工作篮/种子 Hit 对齐 search | 检索结果自动改案态 |

## 6. 现网已有 vs 缺口（更新）

1. **已有**：专利壳 Catalog + 双文件 mock（`6388c3b` 一带）；HITL/Command 形状在。  
2. **通用沙盒**：L1 冷启动 / Team 显式入口（与专利 Catalog **双路径**）。  
3. **Domain Pack 目标态**：16 席 + validator + HITL×8；见 gap。

## 7. L2 / L3 专文

- L2：bot 自发互通见 **[agent-l2-team.md](./agent-l2-team.md)**
- L3：专利专家 + 中台映射见 **[agent-l3-patent.md](./agent-l3-patent.md)**（开 L3 刀）

## 8. 本刀实现令（Agent）

| 做 | 不做 |
|----|------|
| 通用沙盒：`/agent`=L1；专利产品：`/agent`=Catalog（部署二选一或分流） | 两套冷启动互相覆盖却不声明 |
| 顶栏「团队」/「专利项目」并列 | 把 L3 埋进 L2；FTO 写成 layout_insight |
| 维持 HITL 纪律 | 真 LLM / case-core |

## 9. 验收

- [ ] Solo/Team/Domain 叠名清楚；Team≡Domain runtime  
- [ ] **双产品冷启动**写清（通用=L1 / 专利=Catalog）  
- [ ] FTO ≠ `layout_insight`；mining ≠ intake  

## 10. Owner

- 规格：架构设计  
- 壳：Agent应用助手 · 专利面跟 [agent-patent-shell](./agent-patent-shell.md)；通用沙盒跟 L1  
