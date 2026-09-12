# 文档索引

## 入口（先读）

| 文档 | 说明 |
|------|------|
| [../README.md](../README.md) | 仓简介 · 端口 · 快速开始 |
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | 分支 · PR · 自检 |
| [TEAM_CHARTER.md](./TEAM_CHARTER.md) | 助手 Owner · 协作制 |

## 架构（活）

| 文档 | 说明 |
|------|------|
| [architecture/README.md](./architecture/README.md) | 架构目录索引 |
| [architecture/codebase.md](./architecture/codebase.md) | **代码架构 / 目录地图 / 分层** |
| [architecture/data-flow.md](./architecture/data-flow.md) | 多壳读写数据流 |
| [architecture/data-model.md](./architecture/data-model.md) | 数据模型与包归属 |
| [architecture/backends.md](./architecture/backends.md) | 未来后端边界 |
| [architecture/ops-observability.md](./architecture/ops-observability.md) | 运维可观测（样机） |
| [architecture/repos-and-vcs.md](./architecture/repos-and-vcs.md) | 单仓→多仓策略 |

## 工程纪律（活）

| 文档 | 说明 |
|------|------|
| [PACKAGES_SPLIT.md](./PACKAGES_SPLIT.md) | `@ip/*` 拆包纪律 |
| [HARNESS.md](./HARNESS.md) | Harness / CaseContext |
| [COMMANDS.md](./COMMANDS.md) | 领域命令 |
| [OPTIMIZE_NOTES.md](./OPTIMIZE_NOTES.md) | 口径与联调笔记 |
| [audit/CROSS_PORT_DEBT.md](./audit/CROSS_PORT_DEBT.md) | 跨口债务台账 |

## 产品分区笔记

| 路径 | 说明 |
|------|------|
| [mid/](./mid/) | 中台相关留档 |
| [workbench/](./workbench/) | 工作台相关留档 |

## 测试

| 路径 | 说明 |
|------|------|
| [../e2e/REVIEW_RUBRIC.md](../e2e/REVIEW_RUBRIC.md) | L0/L1 尺子 |
| [../e2e/PLAN-L0-L1.md](../e2e/PLAN-L0-L1.md) | 计划 |
| [../e2e/RESULTS.md](../e2e/RESULTS.md) | 最近跑分 |

## 冷归档

历史评测、多轮 UI 审计、评测截图 → [archive/](./archive/)。**不以归档文替代现状架构。**

## 归档规则（约定）

1. 根目录只留 `README.md` + `CONTRIBUTING.md`（+ 工程配置）。
2. 新设计 / 纪律文进 `docs/` 或 `docs/architecture/`。
3. 一次性评测、多轮 R2/R3 审计、过期截图 → `docs/archive/{reviews,evals,shots}/`，并在 `archive/README` 登记。
4. 演示用编号截图可留 `shots/`；评测子目录勿再堆根。
