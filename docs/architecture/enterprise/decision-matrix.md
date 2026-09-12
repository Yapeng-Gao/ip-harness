# Agent / 后端平台选型决策表

> **样机诚实**：表中「与现仓演进」按今日真实资产打分——多壳 UI、`@ip/contracts` / `@ip/domain`、HITL ConfirmBar、**mock 工具与脚本回放**。没有真 harness、真模型、真网格。  
> **落地目标**：在可控性、私有化、HITL 强度、成本、演进五维上做选择；**推荐行 = C 混合 + LangGraph 库**（高亮）。  
> 细节论证见 [agent-platform.md](./agent-platform.md)；后端七面不在本表重选（已由 landing 通过）。

打分：●●● 强契合 / ●●○ 可用但有缝 / ●○○ 弱或贵 / — 不适用。许可以 2026-09 公开仓库为准，变更须再核。

## 1. 主表（平台策略）

| 方案 | 可控性 | 私有化 | HITL 强度 | 成本（工程+许可） | 与现仓演进 | 备注 |
|------|--------|--------|-----------|-------------------|------------|------|
| A1 官方 LangGraph **Agent Server** / LangSmith Deploy | ●●○ | ●○○ 许可 key / 可能 beacon | ●●● 图 interrupt | ●●○ 许可+运维 | ●○○ 另起会话面 | 库可以用，**Server 不默认** |
| A2 Microsoft Agent Framework 当平台 | ●●○ | ●●○ SDK MIT；Foundry 勿默认 | ●●○ 要自接闸 | ●●○ 语言缝 .NET/Python | ●○○ 双会话风险 | 后继 SK+AutoGen；适合已有 MS 栈 |
| A3 CrewAI 当平台 | ●○○ 角色自治 | ●●○ 库 MIT；Cloud 商业 | ●○○ 与一闸一命令弱同构 | ●●○ | ●○○ | 演示快，执法差 |
| A4 Dify 当平台 | ●○○ | ●○○ **改 Apache**；多租户需再核 | ●○○ 工作流≠本仓闸 | ●●○ 重栈+双 UI | ●○○ **冲突 `5175`** | 内场单租户试用可，不作内核 |
| B 完全自建 TS harness | ●●● | ●●● | ●●● 现闸原样 | ●○○ 自造编排 | ●●○ UI 留、编排从零 | 仅法务/证伪后 |
| **C 混合 + LangGraph 库** | **●●●** | **●●● 避开官方 Server** | **●●● interrupt↔现闸** | **●●○ 一 sidecar/库** | **●●● UI/Command 留** | **← 推荐默认** |
| C′ 混合 + MAF | ●●● | ●●● SDK | ●●○ | ●●○ 语言缝更大 | ●●○ | C 的备选 |
| C″ 混合 + CrewAI | ●●○ | ●●● 库 | ●○○ | ●●○ | ●●○ | 仅多角色实验 |
| 维持样机脚本 | ●●○ UI 可控 | — 无模型 | ●●● 面板在 | ●●● 近零 | ●●● 已在 | **不是**落地目标 |

### 推荐行（摘出）

> **C 混合 + LangGraph（MIT 库）**：开源 runtime 只做 LLM 编排/工具循环；Persona / HITL / 交接 / 写库走 `case-core` + `DomainCommand`。官方 Agent Server、Dify 控制台、Crew Cloud、Azure Foundry **都不**进入默认。

---

## 2. 分维说明（避免空喊）

| 维 | 本仓含义 | 怎样算 ●●● |
|----|----------|------------|
| 可控性 | 能否规定「工具不能写库、闸不能跳」 | 我们持有 dispatch 与 `evaluateGuardrails` |
| 私有化 | 机房可装、无强制电检/多租户附加条款 | MIT/Apache 纯许可 + 自管 PG/Redis/IdP |
| HITL 强度 | 现闸 id 不可跳过；发票阻塞；Persona | 恢复图 **必须** command ok，不是框架按钮 |
| 成本 | 工期 + 双语言 + 许可 + 运维人数 | 能复用 `5175` / contracts；少一个产品面 |
| 与现仓演进 | 是否扔掉 Catalog、ConfirmBar、`TOOL_TO_COMMAND` | 脚本换成图，命令字符串不动 |

LangGraph.js vs Python：**不在本表单列成两行**——先做 [agent-platform.md](./agent-platform.md) §3.4 spike；未核对等性前不承诺「纯 TS 图」。

langhost：可作为 A1 的自托管参考（MIT 项目，生态演进中），**不单独成推荐行**；引入前再核其对 `langgraph-api` ELv2 的依赖。

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

---

## 4. 决策规则（给评审/总控）

1. **平台策略**锁 **C**；runtime 锁 **LangGraph 库**。改锁要书面：法务否决第三方框架 → B；采购指定 MS 栈 → C′。  
2. **A4 Dify** 不得以「也能自托管」替代 C（许可附加条款 + 双产品面）。  
3. **真 LLM** 晚于 `case-core` MVP（landing roadmap 已禁「真 LLM 办案写」当 case-core 必做）。C 的 spike 可并行，不阻塞 PG 唯一写。  
4. 任何候选要把工具接到 **非** `POST /v1/commands/dispatch` 的写路径 → 否决。  
5. 许可说不清 → 写「需再核」，**不**进默认装机清单。

---


## 5. 否决题（评审可直接用）

任一候选答「会」则不得进默认：

| # | 题 | C + LangGraph 库的答案 |
|---|----|------------------------|
| N1 | Agent 或 runtime 是否能拿到 PG 写凭据？ | 否 |
| N2 | HITL 恢复是否只靠框架自己的 Approve、不经 `DomainCommand`？ | 否 |
| N3 | 是否替换 `agent:5175` ConfirmBar / Catalog？ | 否 |
| N4 | 是否把官方 Agent Server / Dify 控制台 / Foundry 写成私有化必选项？ | 否 |
| N5 | 是否新增第三套命令名或事件串？ | 否 |
| N6 | 是否要求 Day-1 服务网格才能跑 Agent？ | 否 |
| N7 | 许可是否说不清还写进装机清单？ | 否（写「需再核」并排除默认） |

## 6. 与 landing 通过项的关系

| landing 已通过 | 本表不重开 | 本表只加 |
|----------------|------------|----------|
| 七面切分 | 是 | Agent 放在 `agent-session` + runtime 插件 |
| TS+PG+Redis+OIDC+S3+OTel | 是 | 模型网关与 runtime 许可约束 |
| 一期 `services/` | 是 | runtime 可 sidecar，不升格网格 |
| 真 LLM 非 case-core MVP 必做 | 是 | C 的 spike 可并行、不阻塞唯一写 |

改推荐行 = 新架构决策，需再评，不得在实现 PR 里默默换成 Dify/Server。

## 7. 相关链接

- [./README.md](./README.md) · [./agent-platform.md](./agent-platform.md) · [./agent-topology.md](./agent-topology.md) · [./backend-enterprise.md](./backend-enterprise.md)
- [../landing/stack.md](../landing/stack.md) · [../landing/REVIEW.md](../landing/REVIEW.md)
- [../../HARNESS.md](../../HARNESS.md)
