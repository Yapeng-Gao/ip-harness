# Agent Runtime 选型对比（DSH / Codex / LangGraph / 自建）

> **样机诚实**：今日 `agent:5175` 仍是 **UI + `AGENT_SCRIPTS` mock + HITL ConfirmBar**，不是真 harness / 真模型。  
> **落地目标**：选成熟 **harness/runtime** 补工具环与会话能力；**业务质量不由任何开源 runtime 自动保证**。  
> **纪律**：Agent **禁止**直接改库；写只经 `DomainCommand` / `POST /v1/commands/dispatch`。  
> 项目名与许可以公开仓库为准（核验约 2026-09）；不确定处标「需再核」，不编造。

权威： [agent-platform.md](./agent-platform.md) · [decision-matrix.md](./decision-matrix.md) · [../../HARNESS.md](../../HARNESS.md) · [../../COMMANDS.md](../../COMMANDS.md)

---

## 0. 先讲清三层（任何开源都不自动保证 OA / 调研 Agent 业务质量）

把「Agent 平台」拆成三层，避免把 **runtime 成熟** 误写成 **业务 Agent 成熟**：

| 层 | 管什么 | 典型能力 | 谁负责本仓 |
|----|--------|----------|------------|
| **① harness / runtime** | 模型如何在环境里持续工作 | 工具环、沙箱、审批暂停、会话/thread、流式、checkpoint、插件/扩展点 | 成熟开源 harness（推荐 **DSH 和/或 Codex app-server**）或完全自建 |
| **② 领域编排** | 多专业 Agent 怎么协作办案 | 阶段、handoff、Persona/RACI、Catalog、interrupt 点对齐闸 id | **自有** `agent-session` + `@ip/domain`（可选 LangGraph **子图**，非默认 runtime） |
| **③ 领域工具 + 评测** | 这件事做得好不好 | 检索/交底/撰写等业务工具 + eval / 轨迹评测 / 验收用例 | **自有** 工具适配器 + DomainCommand + 评测集 |

**硬结论**：① 再成熟，也**不保证**每个 OA / 调研 / 交底 Agent 的业务质量。质量来自 ② 的闸门与 Persona，以及 ③ 的工具与 eval。DSH、Codex、LangGraph、自建——**无一例外**。

```text
[agent:5175 UI · ConfirmBar · Catalog]
        │
        ▼
┌──────────────────────────────────────┐
│ ② 领域编排（自有）                    │
│ Persona · HITL gate · handoff · 阶段 │
└───────────────┬──────────────────────┘
                │ 委托「想→工具」循环
                ▼
┌──────────────────────────────────────┐
│ ① harness/runtime（DSH / Codex / …） │
│ 工具环 · 沙箱 · 审批协议 · 流式      │
└───────────────┬──────────────────────┘
                │ 只读/草稿工具 OK
                │ 写意图 ──X──► 数据库
                │ 写意图 ──► DomainCommand
                ▼
┌──────────────────────────────────────┐
│ ③ 领域工具 + 评测（自有）              │
│ 检索/交底/撰写 · eval · 审计          │
└──────────────────────────────────────┘
```

---

## 1. 正式对比表

| 维 | **DeepSeek Harness (DSH)** | **OpenAI Codex app-server** | **LangGraph** | **完全自建** |
|----|----------------------------|-----------------------------|---------------|--------------|
| 项目 | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)（`dsh`） | [openai/codex](https://github.com/openai/codex)（`codex-rs` / app-server） | [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph)（库；另有 JS） | 对齐现样机 Session / Tools / HITL / `dispatchCommand` |
| 许可 | **MIT**（仓库 LICENSE） | **Apache-2.0**（仓库 LICENSE） | **库 = MIT**；官方 Agent Server / `langgraph-api` **另有许可条款**，勿与库混谈 | 自有代码；无第三方框架许可 |
| 定位 | **完整 agent harness**：everything is a plugin（Cordis）；模型/工具/会话/沙箱/loop/调度/UI 可换 | **开源 harness + JSON-RPC 产品面**：thread / turn / item；面向嵌入式 UI 的 app-server | **编排库**（有状态图、checkpoint、interrupt）；**不是**完整产品 harness | 把 HARNESS 五件套在同仓 TS 做成真运行时 |
| 成熟度 | 官方称 **developer preview**；API/插件仍会演进 | 生态与产品面较完整（CLI / IDE / app-server）；编码 Agent 场景验证多 | 编排生态成熟；**不**等于办案 Agent 产品成熟 | 样机今日**只有** UI+mock，无真循环可长出 |
| 私有化 | 源码 MIT，可自托管；预览期稳定性与安全审计 **需再核** | harness 代码可自托管；**模型/供应与 OpenAI API·订阅条款绑定风险**须诚实评估（fork 不等于免费推理） | **只用库**可私有化；官方 Server 常要 license key / 可能 beacon —— **不默认** | 许可最干净；工期≈自造小型 harness |
| 通用办公 vs 编码偏向 | 定位通用 harness（插件可换工具集）；默认模式仍偏「能干活的 coding/agent」——业务 OA 靠自有插件+工具 | **编码偏向强**（shell/补丁/沙箱）；办公/调研要自接领域工具，勿假装开箱即 OA | 中性编排；业务能力全靠自建节点/工具 | 可按本仓 Catalog 定制；无现成办公能力 |
| HITL / 审批 | 有 `dsh-user-approval`：`ctx.approval.request`；策略 `ask` / `never`；与 sandbox 正交（见公开子系统文档） | `item/permissions/requestApproval` 及 command/fileChange 等审批 RPC；turn 可暂停等客户端批复 | `interrupt` / resume 可映射 HITL；**无**本仓闸语义 | ConfirmBar + `HitlGateId` 原样 |
| 与现仓演进 | 插件闸可接自有 answerer → ConfirmBar；UI 可保留 `5175` | app-server 作 sidecar；`5175` 作审批客户端 | 可作 **② 子图**；不宜再当默认 ① | UI/闸零缝；编排从零 |
| **是否保证业务质量** | **否** | **否** | **否** | **否** |

### 1.1 DeepSeek Harness（DSH）要点

- 口号与架构：**「Everything is a plugin」**，基于 [Cordis](https://github.com/cordiverse/cordis) 插件组合（公开文档与官网一致）。
- 能力插件化：models、tools、skills、sessions、sandboxes、storage、loops、scheduling、UI。
- 状态：官方 **developer preview**（[deepseek.com/harness](https://deepseek.com/harness/en/)）；核心插件与 API 仍会变。
- 安全审计：公开渠道有沙箱/审批设计文档；是否完成独立安全审计、CVE 处置是否满足本仓私有化门槛 → **需再核 / 预览期勿当已审定基线**。
- 审批公开面：`ctx.approval.request` → 结果闭集（如 `allowed-once` / `rejected` / `cancelled` / `unavailable`）；缺 answerer **fail closed**。细节以 [User Approval 子系统文档](https://deepseek-harness.github.io/deepseek-harness/en/reference/subsystems/approval) 为准。

### 1.2 OpenAI Codex app-server 要点

- 仓库：[openai/codex](https://github.com/openai/codex)，许可 **Apache-2.0**。
- app-server：双向 JSON-RPC（线协议可省略 `"jsonrpc":"2.0"` 头，以官方 README 为准）；核心对象 **thread / turn / item**。
- 典型 RPC：`thread/start|resume`、`turn/start|interrupt`；审批侧含 `item/permissions/requestApproval`（以及 command / fileChange 等审批请求，版本面 **需再核** 客户端初始化开关）。
- **模型/供应绑定风险（诚实）**：开源的是 harness，不是模型权重；推理仍依赖 OpenAI API 或适用订阅条款。换模型/断供/条款变更是产品风险，须在采购与私有化方案里单列，不得写成「Apache = 全栈自给」。

### 1.3 LangGraph 要点（降档）

- **是编排库，不是完整产品 harness**（无开箱 thread UI、无 Codex/DSH 级沙箱产品面）。
- `interrupt` 可映射 HITL 等待，但**不保**业务 Agent 质量，也不自动对齐 `HitlGateId` / 发票阻塞 / Persona。
- 本仓定位：**可选 ② 领域子图 / 备选**，**不再**作为默认 ① runtime。官方 Agent Server **仍不**作私有化默认。

### 1.4 完全自建要点

- 对齐现资产：`AgentSession` / `AgentDef.tools[]` / ConfirmBar · `clearedHitlGates` · `gateToAction` / `evaluateGuardrails` / `dispatchCommand`。
- 仅当法务禁止第三方 harness，或 DSH/Codex spike **证伪**无法接到现闸后再选。  
- **不**因为已有 `HARNESS.md` 就选自建——那是 UI 纪律，不是运行时实现。

---

## 2. ConfirmBar / HitlGateId ↔ 审批暂停映射

现仓闸 id（`packages/contracts` · `HitlGateId`）：`go_nogo` · `approve_strategy` · `authorize_file` · `pay_unlock` · `confirm_quote`。（handoff 的 `request_changes` 等是 action，不是 gate id。）

样机路径：`SessionConfirmBar` → `doGate` → `gateToAction` → `dispatchCommand`；`clearedHitlGates` 记录已过闸。

| 现仓 | Codex app-server（公开协议） | DSH（公开文档能写的） | 落地纪律（共同） |
|------|------------------------------|----------------------|------------------|
| ConfirmBar 等待用户点闸 | 服务端发 `item/permissions/requestApproval`（或 command/fileChange 审批 RPC），turn **暂停**至客户端批复 | `ctx.approval.request`；UI/ACP answerer 决策；策略 `ask` 才进人 | **框架「允许继续」≠ 领域已写入** |
| `HitlGateId` + `clearedHitlGates` | 客户端把 gate id 编入审批 UI / 元数据；批复成功后才 `dispatchCommand` | 自有 answerer 插件识别 gate；或插件闸只做「暂停」，真正过闸仍走 ConfirmBar | **闸 id 不改名**；恢复条件 = **DomainCommand ok** |
| `evaluateGuardrails` | 在批复处理函数里先跑本仓 guardrails，再决定是否 grant / 是否 dispatch | 同左：answerer 内调自有执法，勿用 DSH `allowed-once` 替代 | Persona / 发票阻塞仍由 `@ip/domain` |
| 试运行 vs 正式执行 | runtime 可跑工具环；**无** dispatch = 试运行 | 同左 | 写库唯一：`POST /v1/commands/dispatch` |

**映射原则（一句话）**：把 DSH/Codex 的「审批暂停」当成 **① 层暂停钩**；本仓 ConfirmBar / `HitlGateId` / DomainCommand 仍是 **②+写路径** 的唯一真相。不确定的协议字段或预览 API → **需再核**，不写进装机必选项。

---

## 3. 与推荐策略的关系

- **推荐默认（修订）**：仍是 **C 混合**，但首选 ① runtime = **DSH 和/或 Codex app-server** + 自有 Persona / HITL / DomainCommand。  
- LangGraph → 可选 ② 子图 / 备选，不再锁为默认 runtime。  
- 详见 [agent-platform.md](./agent-platform.md) · [decision-matrix.md](./decision-matrix.md)。

相对旧 REVIEW（曾锁 **C + LangGraph 库**）：本文与姊妹篇为 **选型修订**，**需再交架构评审**（本目录不代评）。

## 4. 相关链接

- [./README.md](./README.md) · [./agent-platform.md](./agent-platform.md) · [./decision-matrix.md](./decision-matrix.md) · [./agent-topology.md](./agent-topology.md)
- DSH：<https://github.com/deepseek-ai/deepseek-harness> · <https://deepseek.com/harness/en/>
- Codex：<https://github.com/openai/codex>
- LangGraph：<https://github.com/langchain-ai/langgraph>
