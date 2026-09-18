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
| [architecture/README.md](./architecture/README.md) | 架构目录索引 · 已知裂缝表 |
| [**PROTOTYPE_MASTER_PLAN.md**](./PROTOTYPE_MASTER_PLAN.md) | **原型总方案执行表**（已有/在建/待建 · 波次 · 端口） |
| [**SCHEME_WAVE.md**](./SCHEME_WAVE.md) | **方案波**（停原型 · 检索数据面 · 模型训练） |
| [architecture/e2e-hunt/](./architecture/e2e-hunt/README.md) | **e2e 猎虫 Harness**（通用层 + Adapter；≠ L0/L1） |
| [architecture/codebase.md](./architecture/codebase.md) | **代码架构 / 目录地图 / 分层** |
| [architecture/data-flow.md](./architecture/data-flow.md) | 多壳读写数据流 |
| [architecture/data-model.md](./architecture/data-model.md) | 数据模型与包归属 |
| [architecture/backends.md](./architecture/backends.md) | 未来后端边界 |
| [architecture/landing/README.md](./architecture/landing/README.md) | 原型后落地：切分 / 栈 / 路线图 / 提醒 |
| [architecture/enterprise/README.md](./architecture/enterprise/README.md) | 企业级后端 + Agent 平台（C 混合 / DSH 和或 Codex + 自有闸；见 [agent-runtime-options](./architecture/enterprise/agent-runtime-options.md)） |
| [architecture/dev-spec/README.md](./architecture/dev-spec/README.md) | **开发前规格包**（照文档开 PR：拓扑 / 落地表 / 冻 URL / 构建 / ADR） |
| [architecture/product-apps/README.md](./architecture/product-apps/README.md) | **产品面规格**（五壳对照 · workbench 节点是否拆 app · Agent/工具/插件 · 横切） |
| [architecture/ai-infra/README.md](./architecture/ai-infra/README.md) | **AI Infra**（≠ ops：训推基建 · 建议壳 :5179） |
| [architecture/ai-data/README.md](./architecture/ai-data/README.md) | **AI Data**（≠ ops/ai-infra：数据 Pipeline · 建议壳 :5181） |
| [architecture/ops-observability.md](./architecture/ops-observability.md) | 运维可观测（样机） |
| [architecture/repos-and-vcs.md](./architecture/repos-and-vcs.md) | 单仓→多仓策略 |

## 工程纪律（活）

| 文档 | 说明 |
|------|------|
| [PACKAGES_SPLIT.md](./PACKAGES_SPLIT.md) | `@ip/*` 拆包纪律（**在 docs/，不在根**） |
| [HARNESS.md](./HARNESS.md) | Harness / CaseContext（**在 docs/，不在根**） |
| [COMMANDS.md](./COMMANDS.md) | 领域命令（**在 docs/，不在根**） |
| [OPTIMIZE_NOTES.md](./OPTIMIZE_NOTES.md) | 口径与联调笔记 |

## 产品分区笔记

| 路径 | 说明 |
|------|------|
| [mid/STATUS.md](./mid/STATUS.md) | 作业中台 Owner 现状（`apps/mid` :5173） |
| [workbench/OWNER_STATUS.md](./workbench/OWNER_STATUS.md) | 办理台 Owner 现状（`apps/workbench` :5174 · flows/stages） |

## 审计台账

| 路径 | 说明 |
|------|------|
| [audit/CROSS_PORT_DEBT.md](./audit/CROSS_PORT_DEBT.md) | 跨口债务台账 |

## 测试（e2e）

| 路径 | 说明 |
|------|------|
| [../e2e/REVIEW_RUBRIC.md](../e2e/REVIEW_RUBRIC.md) | L0/L1 尺子 |
| [../e2e/PLAN-L0-L1.md](../e2e/PLAN-L0-L1.md) | 计划 |
| [../e2e/PLAN-API-MOCK-SMOKE.md](../e2e/PLAN-API-MOCK-SMOKE.md) | api-mock 冒烟计划 |
| [../e2e/RESULTS.md](../e2e/RESULTS.md) | 最近跑分 |

## 冷归档

历史评测、多轮 UI 审计、评测截图 → [archive/](./archive/)。**不以归档文替代现状架构。**  
子树：`archive/reviews/` · `archive/evals/` · `archive/shots/`（见 [archive/README](./archive/README.md)）。

## 归档规则（约定）

1. 根目录只留 `README.md` + `CONTRIBUTING.md`（+ 工程配置）。`HARNESS` / `COMMANDS` / `PACKAGES_SPLIT` 已在 `docs/`。
2. 新设计 / 纪律文进 `docs/` 或 `docs/architecture/`。
3. 一次性评测、多轮 R2/R3 审计、过期截图 → `docs/archive/{reviews,evals,shots}/`，并在 `archive/README` 登记。
4. 演示用编号截图可留根 `shots/`；评测子目录勿再堆根。
5. 从 `docs/architecture/*` 链纪律文用 `../HARNESS.md` 等；勿写 `../../HARNESS.md`（根已无该文件）。
