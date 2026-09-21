> **变更摘要（2026-09-21 · 案页三刀）**：[agent-biz-case-ia](./agent-biz-case-ia.md) = 两栏 / 单一主 CTA / 单一进度。
> **变更摘要（2026-09-21 · 席=bot）**：[agent-seat-as-bot](./agent-seat-as-bot.md) = 案内席独立会话 / 交卷 HITL。  
> **变更摘要（2026-09-21 · 环边三刀）**：[agent-pack-loops-roadmap](./agent-pack-loops-roadmap.md) = Pack 内/外循环样机派工。  
> **变更摘要（2026-09-21 · 业务模式）**：[agent-business-mode](./agent-business-mode.md) = 专利业务冷启动（我的案子）。  
> **变更摘要（2026-09-21）**：索引补 **agent-platform** · **domain-packs** · **agent-platform-gap**；Solo/Team/Domain 叠名见 [agent-layers](./agent-layers.md)。
# 产品面规格（product-apps）

> **样机诚实**：今日是多 Vite 壳（`APP_PORTS`）+ 共享 `@ip/*` + `api-mock:5180` 内存店；无真 SSO、真 MCP、真 Agent harness、真可观测。  
> **落地目标**：本目录按**产品壳**写开发可照着设计的规格——路由面、读写边界、与 landing 七面 / case-core / Agent 分层对齐。  
> **不是**架构评审文（评审见 landing / enterprise / dev-spec 的 REVIEW）；**不是**已交付实现说明。
## 本目录

| 篇 | 路径 | 回答什么 |
|----|------|----------|
| 索引（本页） | [README.md](./README.md) | 与五壳对照、阅读序、回链 |
| 作业中台 | [mid.md](./mid.md) | mid:5173 职责、路由面、读/写、与 case-core |
| SaaS 工作台 | [workbench.md](./workbench.md) | stages/flows；**每节点是否可独立应用** |
| 运维壳 | [ops.md](./ops.md) | 六路由→ops-platform；禁真通道除非开闸 |
| 身份壳 | [iam.md](./iam.md) | 租户/Persona/OIDC；cookie→真会话 |
| Agent 产品面 | [agent-surface.md](./agent-surface.md) | 5175 Catalog/会话/Confirm；与 ① runtime 分层 |
| 工具与 MCP | [agent-tools-mcp.md](./agent-tools-mcp.md) | tools[] vs MCP；副作用→DomainCommand |
| Agent 插件 | [agent-plugins.md](./agent-plugins.md) | AgentDef 插件；版本化 catalog；对齐 stage |
| Agent 项目文件夹 IA | [agent-project-folder.md](./agent-project-folder.md) | 项目=文件夹；专家分剧本；总控只编排 |
| Agent 入口模式 | [agent-entry-modes.md](./agent-entry-modes.md) | 通用 Grok**自由**（自设 bot+互通）；项目**专家固定** |
| Grok Bot 复刻 | [agent-grok-replica.md](./agent-grok-replica.md) | **优先**：通用壳布局/交互对标 Grok |
| Agent 三层叠法 | [agent-layers.md](./agent-layers.md) | **L1→L2→L3**；非并列双产品；L3↔中台映射 |
| L2 团队互通 | [agent-l2-team.md](./agent-l2-team.md) | bot 自发消息；协作任务样机；仅 /agent/team |
| L3 专利 bot | [agent-l3-patent.md](./agent-l3-patent.md) | 固定专家；产出↔中台；仅项目模式 |
| **业务模式** | [agent-business-mode.md](./agent-business-mode.md) | **业务冷启动**：我的案子+向导+待确认；Catalog 降级 |
| **席=独立 bot** | [agent-seat-as-bot.md](./agent-seat-as-bot.md) | 点席=人↔席会话；交卷→本案 HITL；与旧推进关系 |
| **业务案页 IA 三刀** | [agent-biz-case-ia.md](./agent-biz-case-ia.md) | 两栏 · 藏工程词+单一主 CTA · 单一进度 |
| **Pack 环边三刀** | [agent-pack-loops-roadmap.md](./agent-pack-loops-roadmap.md) | F5 内循环+跨席 · F6 OA N通 · F9→F3；样机无真沙箱 |
| 专利 Agent 壳（专家台） | [agent-patent-shell.md](./agent-patent-shell.md) | 专家工作台/双文件；路由 `/agent/catalog` |
| **平台差距表** | [agent-platform-gap.md](./agent-platform-gap.md) | 样机 ↔ Solo/Team/Domain+Pack 目标；**样机本轮未动** |
| 专利席花名册副本 | [patent-drill-ref/](./patent-drill-ref/) | SEAT_ROSTER / OWNER 矩阵 / PROCESS_VISIBILITY |
| Agent 案绑定 | [agent-case-binding.md](./agent-case-binding.md) | 先聊/先项目；案可后创建或绑定；不挡入口 |
| 跨面项目串接 | [project-cross-surface.md](./project-cross-surface.md) | 建项目串 mid/workbench/Agent/IAM；禁专家中截 |
| Sessions×项目线程 | [agent-sessions-project-threads.md](./agent-sessions-project-threads.md) | 列表聚合展示；存储可分；标签筛选 |
| 横切 | [cross-cutting.md](./cross-cutting.md) | 深链、contracts、禁壳直写库、Persona、e2e |

## 与五壳 + api 对照表

权威端口：`packages/contracts/src/ports.ts`（`APP_PORTS` / `APP_DEV_URLS`）。

| 壳 / 面 | 端口 | 仓路径 | 产品面规格 | 落地服务面（landing） |
|---------|------|--------|------------|----------------------|
| mid | 5173 | `apps/mid` | [mid.md](./mid.md) | 消费者 → **case-core** 读/写 |
| workbench | 5174 | `apps/workbench` | [workbench.md](./workbench.md) | Flow UI → case-core；进度可并 workbench-command |
| agent | 5175 | `apps/agent` | [agent-surface.md](./agent-surface.md) 等 | UI → **agent-session**；写仍经 case-core |
| ops | 5176 | `apps/ops` | [ops.md](./ops.md) | → **ops-platform**（不持案） |
| iam | 5177 | `apps/iam` | [iam.md](./iam.md) | → **iam**（OIDC / Persona 声明） |
| api | 5180 | `apps/api-mock`（今日） | 见 [cross-cutting.md](./cross-cutting.md) | MVP 同口换 **case-core** / 网关 |

壳 **不是**微服务；勿把 mid/workbench 升级成服务进程。

## 并行样机壳（非五壳规格正文）

| 壳 | 端口 | 规格 |
|----|------|------|
| doc-harness | 5178 | [../doc-harness/](../doc-harness/README.md) |
| ai-infra | 5179 | [../ai-infra/](../ai-infra/README.md) |
| ai-data | **5181** | [../ai-data/](../ai-data/README.md) |
| search | **5182** | [../search/](../search/README.md) |
| fto | **5183** | [../fto/](../fto/README.md) |
| mining | **5184** | [../mining/](../mining/README.md) |
| inspire | **5185** | [../inspire/](../inspire/README.md) |
| landscape | **5186** | [../landscape/](../landscape/README.md) |
| figure | **5187** | [../figure/](../figure/README.md) |

以上**不**改 `APP_PORTS`；不扩写为本目录九篇正文。


## 阅读顺序

1. 本页（对照表与边界）
2. [mid.md](./mid.md) → [workbench.md](./workbench.md)（办理主路径）
3. [agent-surface.md](./agent-surface.md) → [agent-tools-mcp.md](./agent-tools-mcp.md) → [agent-plugins.md](./agent-plugins.md)
4. [ops.md](./ops.md) → [iam.md](./iam.md)
5. [cross-cutting.md](./cross-cutting.md)（深链 / 契约 / e2e）

上游（先读、不掏空）：

| 上游 | 路径 |
|------|------|
| 落地七面 / 栈 / 路线 | [../landing/README.md](../landing/README.md) |
| 企业级 + Agent（C 混合 · DSH/Codex + 自有闸） | [../enterprise/README.md](../enterprise/README.md) |
| 开发前规格（开 PR） | [../dev-spec/README.md](../dev-spec/README.md) |
| 样机数据流 / 模型 | [../data-flow.md](../data-flow.md) · [../data-model.md](../data-model.md) |
| Harness / 命令纪律 | [../../HARNESS.md](../../HARNESS.md) · [../../COMMANDS.md](../../COMMANDS.md) |

| Agent 沙箱平台（正式） | [../agent-platform.md](../agent-platform.md) | L0 工具层 · Solo/Team/Domain · 一 Run 一沙箱 · Driver |
| Domain Packs | [../domain-packs/README.md](../domain-packs/README.md) | 专利 Pack 设计/实现蓝图；16 席 · F1–F9 |
| 运维可观测样机 | [../ops-observability.md](../ops-observability.md) |
| workbench Owner 现状 | [../../workbench/OWNER_STATUS.md](../../workbench/OWNER_STATUS.md) |
| mid Owner 现状 | [../../mid/STATUS.md](../../mid/STATUS.md) |

## 评审

- [REVIEW.md](./REVIEW.md) — 架构评审结论：**通过**（正文 `fd604db` · REVIEW Pass `fb2b1d3`；非阻塞：handoff 可补 `ARTIFACT_FOR_STAGE`）。

## 纪律（写产品面时自检）

- 每篇开篇保持「样机诚实 vs 落地目标」；勿假装已有真 MCP / 真 harness / 真通道。
- 写库唯一入口：`DomainCommand` → `dispatchCommand` / 落地 `POST /v1/commands/dispatch`。
- Agent **禁止**直连 PG；工具副作用必须可映射到 DomainCommand 或只读。
- 企业 Agent 默认：**C 混合** = ① DSH 和/或 Codex app-server + 自有 Persona/HITL/Command；LangGraph 仅可选子图。
- 本目录**只写文档**；不交架构评审、不改业务代码。

## 回链

- 架构总索引：[../README.md](../README.md)
- 文档总索引：[../../README.md](../../README.md)
