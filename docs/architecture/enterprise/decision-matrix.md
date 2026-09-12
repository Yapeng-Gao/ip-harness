# Agent / 后端平台选型决策表

> **样机诚实**：表中「与现仓演进」按今日真实资产打分——多壳 UI、`@ip/contracts` / `@ip/domain`、HITL ConfirmBar、**mock 工具与脚本回放**。没有真 harness、真模型、真网格。  
> **落地目标**：在可控性、私有化、HITL/审批映射、通用办公 vs 编码偏向、成熟度、与现仓演进、**是否保证业务质量**等维上做选择；**推荐行 = C 混合 + DSH 和/或 Codex app-server + 自有闸**（高亮）。LangGraph **降档**为可选子图/备选。  
> 细节：[agent-platform.md](./agent-platform.md) · [agent-runtime-options.md](./agent-runtime-options.md)。后端七面不在本表重选（已由 landing 通过）。

打分：●●● 强契合 / ●●○ 可用但有缝 / ●○○ 弱或贵 / — 不适用。许可以 2026-09 公开仓库为准，变更须再核。

**业务质量列恒为「否」**：任何 runtime（含自建）都不自动保证 OA/调研/交底 Agent 质量；质量靠领域编排 + 工具 + eval。

## 1. 主表（平台策略）

| 方案 | 可控性 | 私有化 | HITL/审批映射 | 通用办公 vs 编码 | 成熟度 | 与现仓演进 | 保证业务质量？ | 备注 |
|------|--------|--------|---------------|------------------|--------|------------|----------------|------|
| A1 官方 LangGraph **Agent Server** / LangSmith Deploy | ●●○ | ●○○ 许可 key / 可能 beacon | ●●● 图 interrupt | 中性编排 | ●●○ 编排熟、产品面另册 | ●○○ 另起会话面 | **否** | 库可用，**Server 不默认** |
| A2 **DSH 当平台**（吞 UI/会话） | ●●○ | ●●○ MIT；预览期审计 **需再核** | ●●○ `ctx.approval` 要接自有闸 | 通用 harness 潜力；默认仍偏能干活 agent | ●●○ **developer preview** | ●○○ 易双会话 | **否** | 作 C 的 runtime，勿吞 `5175` |
| A3 **Codex app-server 当平台** | ●●○ | ●●○ 代码 Apache-2.0；**模型供应绑定** | ●●● `permissions/requestApproval` | **编码偏向强** | ●●● 产品面较完整 | ●○○ 另起 IDE/会话则冲突 | **否** | 作 C 的 runtime；供应风险单列 |
| A4 Microsoft Agent Framework 当平台 | ●●○ | ●●○ SDK MIT；Foundry 勿默认 | ●●○ 要自接闸 | 中 | ●●○ API 仍新 | ●○○ 语言缝 | **否** | 后继 SK+AutoGen |
| A5 CrewAI 当平台 | ●○○ | ●●○ 库 MIT；Cloud 商业 | ●○○ 与一闸一命令弱同构 | 多角色故事 | ●●○ | ●○○ | **否** | 演示快，执法差 |
| A6 Dify 当平台 | ●○○ | ●○○ **改 Apache**；多租户需再核 | ●○○ 工作流≠本仓闸 | 应用工作室 | ●●○ | ●○○ **冲突 `5175`** | **否** | 不作内核 |
| B 完全自建 TS harness | ●●● | ●●● | ●●● 现闸原样 | 可定制办公 | ●○○ 样机无内核 | ●●○ UI 留、编排从零 | **否** | 仅法务/证伪后 |
| **C 混合 + DSH 和/或 Codex + 自有闸** | **●●●** | **●●● 代码可私有化**（Codex 模型另评；DSH 预览审计需再核） | **●●● 审批暂停↔ConfirmBar** | **办公靠自有 ②③**；Codex 偏码须补工具 | **●●● / ●●○**（Codex 面熟；DSH 预览） | **●●● UI/Command 留** | **否** | **← 推荐默认（修订）** |
| C′ 混合 + LangGraph **库**（降档） | ●●● | ●●● 避开官方 Server | ●●● interrupt↔闸 | 中性 | ●●○ 库熟≠业务熟 | ●●● | **否** | **可选 ② 子图 / 备选**，非默认 ① |
| C″ 混合 + MAF | ●●● | ●●● SDK | ●●○ | 中 | ●●○ | ●●○ | **否** | C 的备选 |
| C‴ 混合 + CrewAI | ●●○ | ●●● 库 | ●○○ | 角色实验 | ●●○ | ●●○ | **否** | 仅实验 |
| 维持样机脚本 | ●●○ UI 可控 | — 无模型 | ●●● 面板在 | — | — | ●●● 已在 | **否** | **不是**落地目标 |

### 推荐行（摘出）

> **C 混合 + DeepSeek Harness (DSH) 和/或 OpenAI Codex app-server + 自有 Persona/HITL/DomainCommand**：成熟 harness 只做 ① runtime（工具环/沙箱/审批暂停/会话）；领域闸与写库走 `case-core`。LangGraph 降为可选领域子图。官方 LangGraph Agent Server、Dify 控制台、Crew Cloud、Azure Foundry **都不**进入默认。  
> **任何 runtime 都不保证业务质量。**

相对旧 REVIEW（曾锁 **C + LangGraph 库**）：本表为 **修订**，**需再交评**。

---

## 2. 分维说明（避免空喊）

| 维 | 本仓含义 | 怎样算 ●●● |
|----|----------|------------|
| 可控性 | 能否规定「工具不能写库、闸不能跳」 | 我们持有 dispatch 与 `evaluateGuardrails` |
| 私有化 | 机房可装、无强制电检/多租户附加条款 | 纯 MIT/Apache **代码** + 自管 PG/Redis/IdP；模型供应合同单列 |
| HITL/审批映射 | 现闸 id 不可跳过；框架暂停只作钩 | 恢复 **必须** DomainCommand ok，不是框架按钮 |
| 通用办公 vs 编码 | 调研/交底/OA 是否开箱 | ●●● = 自有 Catalog+工具已接；裸 harness 通常达不到 |
| 成熟度 | ① 层是否像「能上的 harness」 | 完整会话/审批/沙箱产品面；preview 诚实降档 |
| 与现仓演进 | 是否扔掉 Catalog、ConfirmBar、`TOOL_TO_COMMAND` | 脚本换成 harness，命令字符串不动 |
| 保证业务质量？ | runtime 能否替代评测与领域工具 | **恒否** —— 见三层模型 |

DSH vs Codex 主备：**不在本表拆成两行推荐**——先做 [agent-platform.md](./agent-platform.md) §3.4 双轨 spike；未核接入成本前不写死唯一厂商。

LangGraph.js vs Python：仅当选用 C′ 子图时再 spike；未核对等性前不承诺「纯 TS 图」。

---

## 3. 后端企业项（不改 landing 默认，只钉约束）

landing 已选：TS + PG + Redis + OIDC + S3 兼容 + OTel；一期 `services/`。本表只标企业级「要不要加码」。

| 选项 | 可控性 | 私有化 | 成本 | 与现仓 | 建议 |
|------|--------|--------|------|--------|------|
| 一期同仓 `services/` 1～2 进程 | ●●● | ●●● | ●●● | ●●● | **MVP 默认** |
| Day-1 微服务网格 | ●●○ | ●●○ | ●○○ | ●○○ 假装已拆 | **禁止** |
| 起步多语言 Go/Java 办案核 | ●●○ | ●●● | ●○○ 契约双份 | ●○○ | 不选 |
| OIDC（Keycloak/Authentik/客户 IdP） | ●●● | ●●● | ●●○ | 替 cookie | **默认** |
| 仅 cookie Persona | ●○○ | — | ●●● | 即样机 | **仅样机** |
| schema-per-tenant | ●●● | ●●● | ●○○ | 现模型是行级 | 生产硬隔离才上 |
| 行级 `ownerEnterpriseId` | ●●○ | ●●● | ●●● | 已有字段 | **MVP 默认** |
| 官方 LangGraph Server 进私有化包 | ●●○ | ●○○ | ●○○ | 无关 | **不默认** |
| 无评估就把 Codex 推理绑死唯一供应商 | ●○○ | ●○○ 供应风险 | ●○○ | — | **不默认**；须合同与断供预案 |

---

## 4. 决策规则（给评审/总控）

1. **平台策略**锁 **C**；① runtime 锁 **DSH 和/或 Codex app-server**（+ 自有闸）。LangGraph **不**再锁为默认 ①。改锁要书面：法务否决第三方 harness → B；只要图编排子流程 → C′；采购指定 MS 栈 → C″。  
2. **A6 Dify** 不得以「也能自托管」替代 C（许可附加条款 + 双产品面）。  
3. **真 LLM** 晚于 `case-core` MVP（landing roadmap 已禁「真 LLM 办案写」当 case-core 必做）。C 的 spike 可并行，不阻塞 PG 唯一写。  
4. 任何候选要把工具接到 **非** `POST /v1/commands/dispatch` 的写路径 → 否决。  
5. 许可/安全审计/供应说不清 → 写「需再核」，**不**进默认装机清单。  
6. 宣称「上了某 runtime = 业务 Agent 达标」而无 ③ eval → 否决。

---

## 5. 否决题（评审可直接用）

任一候选答「会」则不得进默认：

| # | 题 | C + DSH/Codex + 自有闸的答案 |
|---|----|------------------------------|
| N1 | Agent 或 runtime 是否能拿到 PG 写凭据？ | 否 |
| N2 | HITL 恢复是否只靠框架自己的 Approve / `allowed-once`、不经 `DomainCommand`？ | 否 |
| N3 | 是否替换 `agent:5175` ConfirmBar / Catalog？ | 否 |
| N4 | 是否把官方 LangGraph Agent Server / Dify 控制台 / Foundry 写成私有化必选项？ | 否 |
| N5 | 是否新增第三套命令名或事件串？ | 否 |
| N6 | 是否要求 Day-1 服务网格才能跑 Agent？ | 否 |
| N7 | 许可/安全审计/模型供应是否说不清还写进装机清单？ | 否（写「需再核」并排除默认） |
| N8 | 是否声称 runtime 保证业务 Agent 质量？ | 否 |

## 6. 与 landing 通过项的关系

| landing 已通过 | 本表不重开 | 本表只加 |
|----------------|------------|----------|
| 七面切分 | 是 | Agent 放在 `agent-session` + runtime 插件 |
| TS+PG+Redis+OIDC+S3+OTel | 是 | 模型网关与 runtime 许可/供应约束 |
| 一期 `services/` | 是 | runtime 可 sidecar，不升格网格 |
| 真 LLM 非 case-core MVP 必做 | 是 | C 的 spike 可并行、不阻塞唯一写 |

改推荐行 = 新架构决策，需再评，不得在实现 PR 里默默换成 Dify/LangGraph Server/未评估的唯一模型供应商。

## 7. 相关链接

- [./README.md](./README.md) · [./agent-runtime-options.md](./agent-runtime-options.md) · [./agent-platform.md](./agent-platform.md) · [./agent-topology.md](./agent-topology.md) · [./backend-enterprise.md](./backend-enterprise.md)
- [../landing/stack.md](../landing/stack.md) · [../landing/REVIEW.md](../landing/REVIEW.md)
- [../../HARNESS.md](../../HARNESS.md)
