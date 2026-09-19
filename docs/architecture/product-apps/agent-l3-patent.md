# L3 专利领域 bot（中台对接）

> **冻结**：L3 = 专利领域 bot；每 bot 有**独立业务逻辑**；产出对接**中台节点**（壳内映射展示 + DomainCommand 示意）。  
> **入口钉**：**独立** `/agent/projects`（顶栏「专利项目」）；**并列**于 L2「团队」，**勿**写成「只能从 L2 升」。  
> **勿污染** L1 `/agent` 与 L2 `/agent/team`。  
> **用户口径**：Agent 终端**不可跳中台**——映射表 + Confirm→DomainCommand 示意即可，**勿要求可点 mid 深链**。  
> **样机诚实**：禁真 LLM / 真 case-core。  
> **对齐**：[agent-layers](./agent-layers.md) · [agent-project-folder](./agent-project-folder.md) · contracts `ARTIFACT_FOR_STAGE`。

## 1. 入口边界（独立 · 并列）

| 面 | 路由 | 顶栏 | L3？ |
|----|------|------|------|
| L1 | `/agent` | （主） | **否** |
| L2 | `/agent/team`、`/agent/bots/*` | 「团队」 | **否** |
| **L3** | `/agent/projects…` | 「专利项目」 | **是**：焊死 IP 专家 |

创建项目 = 挂 **DomainPack:patent**（固定花名册）。侧栏**无**「新建专家」。**不**要求先进入 `/agent/team`。

## 2. 固定 IP 专家清单 + 业务逻辑（样机 mock）

| id | 角色 | mock 剧本（可点） | 主产出形状 |
|----|------|-------------------|------------|
| `orchestrator` | 总控 | 拆派卡片 → 等专家回执 → 汇总时间线；**自发**派 search/draft/… | 任务卡 / 汇总，**不**直接 handoff 写 |
| `expert-search` | 检索 | query → 假 Hits → 工作篮 →（可选）送 FTO/挖掘 | Hit 列表 / 篮；素材可喂调研 |
| `expert-draft` | 撰稿/交底 | 章节草稿 → 修订建议 → Confirm → 写库示意 | `research_report` / `disclosure_pack` / `draft_claims` |
| `expert-fto` | FTO | 特征 → 命中 → 矩阵 → 风险 → 报告 Confirm | FTO 报告草稿；**默认不入库** |
| `expert-mining` | 挖掘（±） | 交底 → 发明点 → 评分 → 送立项占位 | 候选点 / `intake_quote` 素材 |
| `expert-figure` | 附图（±） | 上下文 → mock 草图 → 画布编辑占位 → 版本 → 挂文档章事件 | 附图资产 id；挂章=事件，真挂 doc 另刀 |

每专家四件套（与 project-folder 一致）：**工具 · 剧本 · DomainCommand 候选 · 护栏**。  
总控只拆派+汇总，**不替代**专家领域逻辑。

## 3. 产出 ↔ 中台节点映射

> 中台权威：案态 / handoff 以 **mid + contracts** 为准；Agent 不另起案库。  
> 正式写 = **HITL Confirm → `dispatchCommand(actor:'agent')`**（样机可落到内存/api-mock）。  
> **展示**：壳内映射表 + 命令示意卡片即可；**禁止**要求用户点进 mid 验证。

| 专利 bot | 中台阶段/节点 | 主工件 `HandoffArtifactKey` | 只读/提案（例） | HITL 后写候选 |
|----------|---------------|-----------------------------|-----------------|---------------|
| `orchestrator` | 跨阶段编排 | — | 拆派/汇总 | **无**直接 handoff 写 |
| `expert-search` | `pre_research` | 可贡献 `research_report` 素材 | 检索工具（多 `TOOL_TO_COMMAND=null`） | 通常只读；新颖性绑定仍提案 |
| `expert-draft` | `pre_research`→`drafting` | `research_report` · `disclosure_pack` · `draft_claims` | 起草工具形状 | `saveDraft` / `submitResearch` / `submitHandoff` / `submitClaims`（按闸） |
| `expert-fto` | 决策/布局辅助 | 可链 `layout_insight` | 五步 mock | **默认不写案**；入库须单独命令+HITL |
| `expert-mining` | 立项前 / `decision` | 可链 `intake_quote` | 评分 mock | `createCaseFromInsight` 等须 HITL；送立项可事件占位 |
| `expert-figure` | `drafting` 附图辅助 | 非独立 handoff key；挂 `disclosure_pack`/`draft_claims` 附件示意 | 生成+编辑 mock | 默认事件「挂章」；真写文档 revision 另对齐 doc-harness |

阶段↔工件权威：`ARTIFACT_FOR_STAGE`（`packages/contracts`）。  
闸门键（勿另起）：`go_nogo` · `approve_strategy` · `authorize_file` · `pay_unlock` · `confirm_quote`。

### 可点样机路径（最小）

```text
1. 顶栏「专利项目」→ /agent/projects 新建（空案或绑 mock caseId；不经 /agent/team）
2. 总控：「演示 L3」→ 自发派 expert-draft
3. draft 出假权利要求草稿卡片 → 用户 Confirm
4. Confirm 后 dispatch 形状落案（内存/api-mock）；壳内展示「已写 · 映射到 draft_claims」示意
5. 不做：可点跳转 mid / workbench
```

## 4. 与 L1 / L2 隔离

| 禁止 | 说明 |
|------|------|
| 在 `/agent` 焊死专利专家 | 污染 L1 |
| 在 `/agent/team` 默认塞固定四件套 | 污染 L2 自由度；用户可**可选**从模板加，但非项目焊死 |
| Agent 内第二套 handoff 权威状态机 | 中台为准 |
| 无 HITL 写案 | 护栏 |

## 5. 中台 / 契约（只读配合）

| 角色 | 本刀 |
|------|------|
| Agent应用助手 | 改 `apps/agent`：独立项目入口 + 焊死专家 + mock 剧本 + Confirm→dispatch **壳内**示意 |
| 中台应用助手 | **本刀不要求改 mid**；勿做跨壳深链验收项 |
| 共享包 | 已有 `HandoffArtifactKey` / `DomainCommand`；本刀**不**改 packages，除非缺字段另开 |

## 6. 验收

- [ ] 顶栏「专利项目」可直达 `/agent/projects`（不经 L2）  
- [ ] 侧栏固定专家；各 mock 剧本可区分  
- [ ] Confirm → DomainCommand **壳内**示意；**无**可点 mid 深链要求  
- [ ] 不污染 L1 / L2  
- [ ] 无真 LLM / 真 case-core  

## 7. Owner

规格：架构设计 · 壳：Agent应用助手 · 中台：只读配合  
