# Agent IA：项目文件夹 · 专家 Bot · 总控编排

> **样机诚实**：形式可参考 **Grok Bot**（侧栏 bot 列表、一对一聊、总控编排），但 **每个专家 bot 必须有自己的业务逻辑**——不是同一套通用聊天换皮。今日无真 LLM、无真 case-core 写库。  
> **落地目标**：5175 壳内「项目=文件夹」工作区；专家 = 版本化 `AgentDef` + **独立剧本/工具/闸**；总控席只拆派与汇总。  
> **对齐**：[agent-surface](./agent-surface.md) · [agent-plugins](./agent-plugins.md) · [agent-tools-mcp](./agent-tools-mcp.md) · enterprise C 混合。

## 1. 心智模型（冻结）

| 概念 | 含义 | 类比（形式 only） |
|------|------|-------------------|
| **项目（Project）** | 一个办案/课题容器 = **文件夹**；含成员专家、会话线程、只读 CaseContext 引用 | Grok 侧一个「工作区/文件夹」 |
| **专家 Bot** | 侧栏列表中的一个专家；**一对一聊**；自有工具/剧本/护栏 | 侧栏一个 bot |
| **总控席（Orchestrator）** | 同一项目下的编排 bot：拆派任务、收专家摘要、不替代领域逻辑 | 「总控」编排席 |

```text
ProjectFolder
  ├── Orchestrator（总控席）
  ├── Expert: research-search     ← 检索故事状态机
  ├── Expert: drafting-disclosure ← 交底/文档故事
  ├── Expert: fto-analyst         ← FTO 五步故事
  └── …（mining / landscape 等可挂）
```

**禁止**：所有专家共用同一段「通用闲聊 script」，仅换头像/名称。

## 2. 每专家必须独立的四件套

| 件 | 要求 | 样机做法 |
|----|------|----------|
| **工具目录** | `AgentDef.tools[]` 与本域相关；只读 vs 写候选分清 | 检索专家：`commercial_patent_search` 等；撰稿：`draft_*`；FTO：矩阵/风险卡片名 |
| **剧本 / 状态机** | 可点推进的领域步骤，非单轮 echo | mock 状态机（见 §3） |
| **DomainCommand 候选** | 写库意图列表；试运行不 dispatch | 映射到现有 `DomainCommand` / handoff；无则标「只读专家」 |
| **护栏** | `guardrails` + `hitlGates[]` + Persona 提示 | Catalog 字段 + Confirm 前校验文案 |

插件纪律仍见 [agent-plugins](./agent-plugins.md)：专家 = **AgentDef 插件**，不拆微服务乱炖。

## 3. 样机专家区分（示例状态机）

| 专家 id（示意） | 业务故事 | mock 状态机（须可点） | 写库候选（HITL 后） |
|-----------------|----------|------------------------|---------------------|
| `expert-search` | 检索 | query → hits → 工作篮 →（可选）送 FTO/挖掘占位 | 通常只读；无则 `null` |
| `expert-draft` | 交底/撰稿 | 章节草稿 → 修订建议 → Confirm 提交 | `saveDraft` / `submitResearch` / `submitHandoff` 等（按闸） |
| `expert-fto` | FTO | 特征 → 命中 → 矩阵 → 风险 → 报告 Confirm | **默认不写案**；报告草稿内存；禁假装法律入库 |
| `expert-mining` | 挖掘 | 交底 → 发明点 → 评分 → 送立项占位 | 送出=事件；建案另走命令且须 HITL |
| `orchestrator` | 总控 | 拆派卡片 → 等专家回执 → 汇总时间线 | **禁止**直接改 handoff；可提议「请专家 X 执行」 |

每专家会话 UI 须能看出**不同步骤条/工具卡**，不能只有聊天气泡差异。

## 4. 总控席边界

| 总控做 | 总控不做 |
|--------|----------|
| 选项目文件夹、点名专家、下发任务摘要 | 替检索专家跑布尔检索真逻辑（样机也要用检索剧本） |
| 汇总各专家回执到项目时间线 | 共用一个 `AGENT_SCRIPTS` 通用回复冒充多专家 |
| 打开 HITL Confirm **转交**对应专家提案 | 绕过专家闸直接 `dispatchCommand` 改案 |
| 深链 workbench / search / fto 壳 | 持有 PatentCase 写权限 |

一句话：**总控 = 编排；专家 = 领域逻辑。**

## 5. 写库与诚实边界

| 规则 | 说明 |
|------|------|
| 试运行 / 草稿 | **不写**案态 |
| 正式写 | 仅 **HITL Confirm → DomainCommand**（`actor: 'agent'`） |
| 禁 | 真 LLM；Agent/runtime 直连 PG；本波真 case-core 实施 |
| `backend` | 会话/工具响应标 `mock`（或剧本名）；禁标 production |

## 6. IA 草案（`apps/agent:5175`）

| 区域 | 内容 |
|------|------|
| 左 | 项目文件夹列表 → 展开专家 bot 列表（含总控席） |
| 中 | 当前 bot 一对一会话 + **该专家步骤条** |
| 右 | CaseContext 只读 / ConfirmBar / 深链 |
| 顶 | 诚实横幅：`样机 · 无真 LLM · 专家分剧本` |

路由可在现有 `/agent/sessions/:id` 上增 `?project=&expert=`，或 `/agent/projects/:pid/...`（实现 Owner 择一，勿同时两套真相）。

## 7. 与现仓对象映射

| 本规格 | 现仓 |
|--------|------|
| 专家 Bot | `AgentDef` / `AGENT_CATALOG` |
| 剧本 | `AGENT_SCRIPTS` **按 expertId 分文件或分表**，禁单一全局 script |
| 项目文件夹 | 新：`AgentProject { id, title, expertIds[], caseId? }` 内存即可 |
| 总控 | 特殊 `AgentDef`（`tier`/`whenToUse` 标明 orchestrator）或固定席位 id |

## 8. 验收（文档 + 样机）

- [ ] 侧栏可见 ≥1 项目文件夹 + ≥2 专家 + 总控席  
- [ ] 切换专家后步骤条/工具卡明显不同（检索 vs 撰稿 vs FTO）  
- [ ] 总控只能拆派/汇总，不能一键写库  
- [ ] 写库路径仍 Confirm → DomainCommand；试运行不写  
- [ ] 横幅含无真 LLM  
- [ ] 未改 case-core 真库；未接真模型  

## 9. Owner

- 规格：架构设计（本稿）  
- 壳实现：Agent应用助手（并行改 `apps/agent`）  
