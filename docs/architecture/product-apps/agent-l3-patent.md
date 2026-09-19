# L3 专利领域 bot（中台对接 · 全链路）

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

## 2. 固定 IP 专家清单（全链路 · 必选）

> 补齐刀：交底整理 / 递交形式 / OA答复 **必选**；mining / figure 由 ± **升为必选**。  
> 与演练席对齐：`disclosure` · `filing` · `oa`（id 见下）。

| id | 角色 | mock 剧本（可点） | 主产出形状 |
|----|------|-------------------|------------|
| `orchestrator` | 总控 | 拆派 → 等回执 → 汇总；可沿链路自发派各席 | 任务卡 / 汇总；**不**直接 handoff 写 |
| `expert-search` | 检索 | query → 假 Hits → 工作篮 → 可送 FTO/挖掘 | Hit 列表 / 篮 |
| `expert-mining` | 挖掘 | 技术点 → 2～3 可申报方向 → 评分 → 送立项占位 | 候选点 / `intake_quote` 素材 |
| `expert-disclosure` | **交底整理** | 技术点 → 假交底结构（背景/方案/效果/实施例提纲）→ Confirm | `disclosure_pack` |
| `expert-draft` | 撰稿 | 交底/要点 → 假权利要求/摘要 → Confirm → 写库示意 | `draft_claims`（及调研章素材） |
| `expert-figure` | 附图 | 上下文 → 应补示意图清单（框图/流程）→ 版本/挂章事件 | 附图资产占位 |
| `expert-fto` | FTO | 特征 → 命中 → 矩阵 → 风险分级 → 报告 Confirm | FTO 报告草稿；**默认不入库** |
| `expert-filing` | **递交/形式** | 国别/文件齐套/形式审查点 → 假递交清单 → Confirm | 递交清单；对齐 `authorize`/`file` 闸示意 |
| `expert-oa` | **OA答复** | 假审查意见 → 争辩/修改/证据策略 → Confirm | `prosecution_response` |

每专家四件套：**工具 · 剧本 · DomainCommand 候选 · 护栏**。  
总控只拆派+汇总，**不替代**专家领域逻辑。  
**撰稿 ≠ 交底**：`expert-draft` 偏权利要求/说明书章；`expert-disclosure` 偏交底书结构整理。

## 3. 产出 ↔ 中台节点映射

> 中台权威：案态 / handoff 以 **mid + contracts** 为准；Agent 不另起案库。  
> 正式写 = **HITL Confirm → `dispatchCommand(actor:'agent')`**（样机可落到内存/api-mock）。  
> **展示**：壳内映射表 + 命令示意卡片即可；**禁止**要求用户点进 mid 验证。

| 专利 bot | 中台阶段/节点 | 主工件 `HandoffArtifactKey` | 只读/提案（例） | HITL 后写候选 |
|----------|---------------|-----------------------------|-----------------|---------------|
| `orchestrator` | 跨阶段编排 | — | 拆派/汇总 | **无**直接 handoff 写 |
| `expert-search` | `pre_research` | `research_report` 素材 | 检索工具（多 `null` 命令） | 通常只读 |
| `expert-mining` | 立项前 / `decision` | 可链 `intake_quote` | 评分 mock | `createCaseFromInsight` 等须 HITL |
| `expert-disclosure` | 交底 / 进 `drafting` 前 | **`disclosure_pack`** | 结构整理 mock | `submitHandoff`（disclosure）/ `saveDraft` |
| `expert-draft` | `drafting` | **`draft_claims`**（可兼 `research_report`） | 起草工具形状 | `saveDraft` / `submitClaims` / `submitHandoff` |
| `expert-figure` | `drafting` 附图辅助 | 挂 disclosure/claims 附件示意 | 清单/占位 mock | 事件「挂章」；真 revision 另刀 |
| `expert-fto` | 决策/布局辅助 | 可链 `layout_insight` | 五步 mock | **默认不写案** |
| `expert-filing` | 授权递交 / `authorize`→`file` | 齐套清单（可无独立 key） | 形式检查 mock | 提案 `authorize` / `file` 须闸+HITL；**禁真递交** |
| `expert-oa` | `prosecution` | **`prosecution_response`** | OA 策略 mock | `saveDraft` / `submitHandoff`（答复） |

阶段↔工件权威：`ARTIFACT_FOR_STAGE`。  
闸门键（勿另起）：`go_nogo` · `approve_strategy` · `authorize_file` · `pay_unlock` · `confirm_quote`。

### 可点样机路径（全链路最小）

```text
1. 顶栏「专利项目」→ /agent/projects 新建（不经 /agent/team）
2. 总控「演示全链路」→ 依次自发：search → mining → disclosure → draft → figure → fto → filing → oa（可截短为 3～4 席）
3. 至少 disclosure 或 draft 或 oa 一条：假产出 → Confirm → DomainCommand 壳内示意
4. 不做：可点跳转 mid；真递交；真 OA
```

## 4. 与 L1 / L2 隔离

| 禁止 | 说明 |
|------|------|
| 在 `/agent` 焊死专利专家 | 污染 L1 |
| 在 `/agent/team` 默认塞本花名册 | 污染 L2；可选模板加 ≠ 焊死 |
| Agent 内第二套 handoff 权威 | 中台为准 |
| 无 HITL 写案 / 真递交 | 护栏 |

## 5. 中台 / 契约

| 角色 | 本刀 |
|------|------|
| Agent应用助手 | 项目侧栏焊死全名单 + 各席 mock 剧本 + Confirm 壳内示意 |
| 中台应用助手 | **不要求改 mid** |
| 共享包 | 不改 packages，除非缺字段另开 |

## 6. 验收

- [ ] 顶栏直达 `/agent/projects`；侧栏含 **disclosure / filing / oa** 及原保留席（均可见，非默认隐藏）  
- [ ] 各席 mock 剧本可区分；撰稿 ≠ 交底  
- [ ] Confirm → DomainCommand 壳内示意；无 mid 深链  
- [ ] 不污染 L1 / L2  
- [ ] 无真 LLM / 真 case-core / 真递交  

## 7. Owner

规格：架构设计 · 壳：Agent应用助手  
