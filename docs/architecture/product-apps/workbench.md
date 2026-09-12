# workbench · SaaS 工作台（:5174）

> **样机诚实**：`apps/workbench` 单 Vite 壳；公共模块边界 `src/stages/*`（re-export）；业务实现仍在 `src/flows/*`；共享 `AppProvider` / `@ip/contracts` / `@ip/domain`。根 `src/pages/workbench` 为 legacy，非本 app 所有。  
> **落地目标**：办理表单 SaaS 面；进度读模型可并 case-core；**写库只经 DomainCommand**；默认保持**同壳模块化**，仅在强隔离条件满足时才拆独立 Vite app。

Owner 现状：[../../workbench/OWNER_STATUS.md](../../workbench/OWNER_STATUS.md) · [../../workbench/OWNERSHIP.md](../../workbench/OWNERSHIP.md)。端口：`APP_PORTS.workbench = 5174`。

## 1. 职责

- 按阶段办理 Flow（调研→立项→撰写→审查→维持→转化→监控 + 布局洞察）
- 发明人交底入口 `/inventor`（`disclosure_pack`）
- 与 Agent `handoffKey` / `workbenchPath` 对齐；HITL 结果以命令回写案态
- **不做**：独立微服务一人一仓；壳直写库；另起第二套 handoff keys

## 2. stages 列表（`STAGE_MODULES`）

权威：`apps/workbench/src/stages/index.ts`（App 只从 `./stages` 导入）。

| id | path | stageId（领域） | handoffKey |
|----|------|-----------------|------------|
| research | `/workbench/research` | `pre_research` | `research_report` |
| intake | `/workbench/intake` | `decision` | `intake_quote` |
| draft | `/workbench/draft` | `drafting` | `draft_claims` |
| prosecution | `/workbench/prosecution` | `prosecution` | （OA 相关交接） |
| maintain | `/workbench/maintain` | `maintenance` | （年费/维持） |
| monetize | `/workbench/monetize` | `commercialization` | （转化） |
| watch | `/workbench/watch` | `monitoring` | （监控） |
| layout | `/workbench/layout` | — | `layout_insight` |
| home | `/workbench` | — | — |
| inventor | `/inventor` | — | `disclosure_pack` |

实现桶：`flows/{research,intake,draft,prosecution,maintain,monetize,watch,layout,home,inventor}`；`flows/index.ts` 标 internal/deprecated。

## 3. 专节 · 每节点是否可独立应用

### 3.1 推荐默认：同壳模块化

**一句话推荐：阶段节点默认留在同一 workbench 壳内做 stages + flows（独立路由），共享 AppProvider/contracts；勿按节点拆成独立 Vite app / 微服务。**

理由：

- 已有清晰边界：`stages/` 清单 + 独立路由 + 共享 Persona / CaseContext / handoff 契约
- 深链、e2e、cookie、类型与命令名保持单源
- 对齐 landing：壳不是服务；workbench-command 一期并入 case-core

### 3.2 可选拆独立 Vite app 的条件

仅当**同时**出现下列强需求时，才评估「一 stage 一 Vite app」（仍同 monorepo，仍 `@ip/*`）：

| 条件 | 含义 |
|------|------|
| 团队/发布强隔离 | 不同团队独立发版窗口，且同壳发布冲突成本 > 多 app 成本 |
| 权限强隔离 | 需独立 CSP / 部署域 / 构建产物审计（不仅是 Persona 路由闸） |
| 流量与壳解耦 | 某节点流量/包体显著拖垮整壳，且 code-split 不够 |

### 3.3 代价（拆 app 必付）

| 代价 | 说明 |
|------|------|
| 深链 | `APP_DEV_URLS` / `AppLink` 矩阵膨胀；遗漏即跨口 404 |
| 共享 state | 无同壳 React tree；依赖 API / 会话，禁再扩 cookie 当全量态 |
| Persona cookie | 多口同步更脆；落地须真会话，样机期债加重 |
| e2e 多端口 | L0 每口可达 + L1 跨口路径组合爆炸 |
| 契约双发风险 | 易 fork `CommandName` / handoff keys → **禁止**；须同 PR 改 `@ip/contracts` |

### 3.4 边界（即使拆 app）

1. **写库仍只经 DomainCommand**（`dispatchCommand` / `POST /v1/commands/dispatch`）。
2. **勿一人一仓微服务**：拆的是前端 app 边界，不是按节点起 PG/服务。
3. handoff / StageId / 事件名仍唯一源 `@ip/contracts` + `@ip/domain`。
4. 与 Agent 对齐继续靠 `handoffKey` + `workbenchPath`，不另起平行目录。

### 3.5 「何时可拆」检查清单

拆独立 Vite app 前须全部勾选，否则保持同壳：

- [ ] 已用路由级 code-split / lazy 验证包体，仍不够？
- [ ] 是否存在独立发布/合规域需求（书面）？
- [ ] `@ip/contracts` 变更流程能否保证多 app 同版本消费（禁双发）？
- [ ] 深链表与 e2e 计划是否已扩到新端口并有人维护？
- [ ] Persona / 会话是否有落地路径（不靠再加 cookie）？
- [ ] 写路径是否仍唯一指向 case-core（无本地「方便写」）？
- [ ] Owner 边界是否写进 TEAM_CHARTER / OWNERSHIP（防双改 flows）？

任一「否」→ **不拆**，继续 stages + flows。

## 4. 样机 vs 落地

| 项 | 样机今 | 落地目标 |
|----|--------|----------|
| 模块边界 | stages re-export + flows 实现 | 可渐进把实现迁入 `stages/<id>/`；仍同壳 |
| Context | AppProvider（与 mid/agent 同） | 会话 JWT；案态 API |
| 进度 | `flowProgressByCase` 内存 | case-core 读模型 |
| 根 pages | legacy 分叉 | 单独 audit 后再删/对齐 |

## 5. 相关链接

- [../../HARNESS.md](../../HARNESS.md)（handoff / Agent 对齐）
- [agent-plugins.md](./agent-plugins.md) · [cross-cutting.md](./cross-cutting.md)
- [../dev-spec/app-topology.md](../dev-spec/app-topology.md)
