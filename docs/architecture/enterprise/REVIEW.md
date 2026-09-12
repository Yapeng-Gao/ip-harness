# enterprise 架构评审记录

| 项 | 值 |
|----|-----|
| 评审角色 | 架构评审 |
| 对象 | `docs/architecture/enterprise/` 五篇（README · backend-enterprise · agent-platform · agent-topology · decision-matrix） |
| 对象 SHA | **`2376eb6`**（正文）· 本 REVIEW 复验对齐 HEAD **`93db5af`**（含初版 REVIEW 推仓） |
| 日期 | 2026-09-12 |
| **结论** | **通过**（推仓后复验维持） |

## 尺子对照

| 尺子 | 结果 | 说明 |
|------|------|------|
| 留档 / 父索引 | 过 | 五篇已入库；父 `architecture/README` 已链 |
| 样机诚实 vs 落地 | 过 | Agent 今=UI+mock；非真 harness/模型/网格 |
| 与 landing 七面 / 默认栈 | 过 | 不另起服务名/命令/事件；TS+PG+Redis+OIDC+S3+OTel |
| contracts 可演进 | 过 | 冻 dispatch / DomainCommand / DOMAIN_EVENTS / APP_PORTS |
| 不假装已交付 | 过 | 一期 `services/`；真 LLM 晚于 case-core MVP |
| A/B/C 真实开源名 | 过 | LangGraph / MAF / CrewAI / Dify 分许可；「需再核」不编造 |
| **C + LangGraph 库（非官方 Server）** | **过 · 站得住** | 见下节专项 |
| 拓扑：Agent 不直改库 | 过 | 硬规则 + 否决题 N1–N7 |

## 专项：C + LangGraph 库是否站得住

| 检查 | 结果 |
|------|------|
| 推荐句是否锁「库」而非 Cloud/Server | 是（README 一句话；agent-platform §3.3；decision-matrix 推荐行） |
| 官方 Agent Server 是否剔除默认 | 是（许可 key / beacon；A1 私有化 ●○○；N4 否决） |
| 与现仓 HITL/Command 同构理由 | 成立：interrupt↔ConfirmBar；写只经 dispatch；UI `5175` 保留 |
| 相对 A（当平台）/ B（全自建） | 成立：避免双会话面；避免从零造编排 |
| 已知风险是否诚实 | 是：JS vs Python 须 spike；勿混 LangSmith Deployments；langhost 不升格默认 |
| 是否把 Server 偷渡进装机清单 | 否 |

**专项裁决：站得住。** 改锁须书面（法务→B；MS 栈→C′），不得在实现 PR 默默换成 Server/Dify。

## 非阻塞（维持）

1. LangGraph.js vs Python：spike 后再进装机清单。
2. 可选：脚注 `request_changes` 为 handoff action、非 HitlGateId。

## 裁决

**通过。** 可总控总验。
