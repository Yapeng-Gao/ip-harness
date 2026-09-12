# enterprise 架构评审记录

| 项 | 值 |
|----|-----|
| 评审角色 | 架构评审 |
| 对象 | `docs/architecture/enterprise/` 五篇（README · backend-enterprise · agent-platform · agent-topology · decision-matrix） |
| 工作区 | 评审时目录为 **未提交**（`git status`：`?? docs/architecture/enterprise/`）；HEAD `8e49934` 尚不含本目录。总控总验请以推仓后 SHA 为准。 |
| 日期 | 2026-09-12 |
| **结论** | **通过** |

## 尺子对照

| 尺子 | 结果 | 说明 |
|------|------|------|
| 留档 `docs/architecture/` | 过 | 五篇在 `enterprise/`；父 `architecture/README` 已索引 |
| 索引完整 | 过 | enterprise README 列全四主文；回链 landing REVIEW / HARNESS / COMMANDS |
| 样机诚实 vs 落地目标 | 过 | 各篇开篇双口径；明确 Agent 今=UI+mock，非真 harness/模型 |
| 与 landing 七面 / 默认栈 | 过 | 不另起服务名/命令/事件；栈仍 TS+PG+Redis+OIDC+S3+OTel；一期 `services/` |
| 与 contracts 可演进 | 过 | 冻 dispatch / DomainCommand / DOMAIN_EVENTS / APP_PORTS；闸 id 与现仓一致 |
| 不假装微服务 / 已交付 | 过 | 禁止 Day-1 网格；合规「技术条件≠证书」；真 LLM 非 case-core MVP 必做 |
| A/B/C + 真实开源名 | 过 | LangGraph / MAF / CrewAI / Dify / LlamaIndex 分许可与自托管；「需再核」处不编造 |
| 推荐默认可落地 | 过 | **C 混合 + LangGraph 库**；否决官方 Server/Dify/Foundry 作默认 |
| 拓扑：Agent 不直接改库 | 过 | 硬规则 + 序列图 + 否决题 N1–N7 |

## 抽查要点（与仓）

- HITL 闸：`go_nogo` / `approve_strategy` / `authorize_file` / `pay_unlock` / `confirm_quote` 在 `packages/contracts/src/keys.ts`；`request_changes` 为 handoff action（文中「+」可接受）。
- `TOOL_TO_COMMAND`、`AGENT_CATALOG`、`AGENT_SCRIPTS`、`AgentContext`、`apps/agent/README` 路径存在。
- `AUDIT_SCHEMA_VERSION` = `2026.09.1` 与文一致。
- landing 七面命名与 `landing/backends.md` 一致；提醒/审计裂缝处理与 landing roadmap 同向。

## 非阻塞建议

1. **先推仓**再总验，REVIEW/总控回报带真实 SHA。
2. LangGraph.js vs Python 已要求 spike 再承诺——保持；勿在未 spike 前写进装机清单。
3. `request_changes` 若不想与 HitlGateId 混淆，可在 agent-platform §0 脚注标明「handoff action，非 gate id」（可选）。

## 裁决

**通过。** 可总控总验（推仓后）。不要求为建议项重开全稿。
