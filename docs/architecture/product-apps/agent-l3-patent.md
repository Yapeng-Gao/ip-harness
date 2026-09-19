# L3 专利领域 bot（中台对接）

> **冻结**：L1+L2 Pass 后开 L3。在 **L2 团队壳**上叠 **专利领域 bot**；每 bot 有**独立业务逻辑**；产出能对接**中台节点**。  
> **入口**：仅 **项目模式**（`/agent/projects…`）；**勿污染** L1 `/agent` 与 L2 通用团队 `/agent/team`。  
> **样机诚实**：剧本/Confirm 可 mock；正式写形状对齐 DomainCommand；禁真 LLM / 真 case-core。  
> **对齐**：[agent-layers](./agent-layers.md) §5 · [agent-project-folder](./agent-project-folder.md) · [agent-l2-team](./agent-l2-team.md) · contracts `ARTIFACT_FOR_STAGE`。

## 1. 入口边界

| 面 | 路由 | L3？ |
|----|------|------|
| L1 单助手 | `/agent` | **否** |
| L2 通用团队 | `/agent/team`、`/agent/bots/*` | **否**（可自由 bot，非焊死专利专家） |
| **L3 项目** | `/agent/projects`、`/agent/projects/:id`、`…/bots/:expertId` | **是**：夹内焊死 IP 专家 |

创建项目 = 在 team 壳上挂 **DomainPack:patent**（固定花名册）。侧栏**无**「新建专家」。

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
1. /agent/projects 新建专利项目（空案或绑 mock caseId）
2. 总控：「演示 L3」→ 自发派 expert-draft
3. draft 出假权利要求草稿卡片 → 用户 Confirm
4. Confirm 后 dispatch 形状落案（内存/api-mock）；可选深链 mid 案详看 handoff 示意
5. L1 / L2 通用路径无此焊死专家、无此写库演示入口
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
| Agent应用助手 | 改 `apps/agent` 项目模式：焊死专家 + mock 剧本 + Confirm→dispatch 示意 |
| 中台应用助手 | **只读**契约：深链/展示 handoff 示意即可；**勿**为本刀大改 mid 业务 |
| 共享包 | 已有 `HandoffArtifactKey` / `DomainCommand`；本刀**不**改 packages，除非缺字段另开 |

## 6. 验收

- [ ] 项目夹侧栏 = 固定专家（含检索/FTO/撰稿；附图/挖掘可 ± 显示）  
- [ ] 每专家可走通各自 mock 剧本，逻辑可区分  
- [ ] 至少一条：Confirm 后写库**示意**（形状对齐 DomainCommand）  
- [ ] L1 `/agent`、L2 `/agent/team` **无**焊死专利花名册  
- [ ] 无真 LLM / 真 case-core  

## 7. Owner

规格：架构设计 · 壳：Agent应用助手 · 中台：只读配合  
