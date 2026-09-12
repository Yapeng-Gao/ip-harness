# 仓内代码架构与目录地图

> **现状**：单 monorepo · 多 Vite 壳 + 共享内核样机。  
> **不是**微服务分仓、**不是**真后端。权威运行时口径见 [data-flow](./data-flow.md)。

## 分层（自上而下）

```text
┌─────────────────────────────────────────────────────────────┐
│  apps/*          产品壳（路由入口、端口、壳级 shell）          │
├─────────────────────────────────────────────────────────────┤
│  packages/ui     弱上下文展示组件（渐进迁入）                   │
│  packages/api    薄 HTTP 客户端 → api-mock / fallback          │
│  packages/app-state  App/Agent/Product context · crossPort   │
├─────────────────────────────────────────────────────────────┤
│  packages/domain   领域逻辑（commands / guardrails / stages） │
│  packages/contracts  纯类型 · 端口 · 事件名 · schemaVersion   │
├─────────────────────────────────────────────────────────────┤
│  src/            共享业务源码（页面/组件；@shared 别名）       │
│  tools/          Vite 多 app 工厂等                           │
└─────────────────────────────────────────────────────────────┘
```

依赖方向（硬纪律，见 [PACKAGES_SPLIT](../PACKAGES_SPLIT.md)）：

`contracts` ← `domain` ← `app-state` / `api` ← `ui` / `apps` / `src`  
禁止反向依赖；contracts **零** React。

## 根树（归档后）

```text
ip-harness/
├── README.md                 # 入口 · 端口表 · 快速开始（根只留此 + CONTRIBUTING）
├── CONTRIBUTING.md           # 分支 / PR / Owner
├── package.json              # npm workspaces
├── playwright.config.ts
├── vite.config.ts            # legacy 单体入口
├── apps/
│   ├── mid/                  # :5173 作业中台
│   ├── workbench/            # :5174 办理台（src/{flows,stages}）
│   ├── agent/                # :5175 知产 Agent
│   ├── ops/                  # :5176 运维样机（非真可观测）
│   ├── iam/                  # :5177 IAM 薄壳（非真 SSO）
│   └── api-mock/             # :5180 同仓 HTTP mock
├── packages/
│   ├── contracts/            # @ip/contracts
│   ├── domain/               # @ip/domain
│   ├── app-state/            # @ip/app-state
│   ├── api/                  # @ip/api
│   └── ui/                   # @ip/ui
├── src/                      # 共享页面/组件（渐进迁入 packages）
│   ├── pages/                # mid 主路径 + workbench/ + agent/
│   ├── components/
│   ├── context/              # → re-export @ip/app-state
│   ├── domain/               # → re-export @ip/domain
│   ├── data/                 # seed / mock 数据
│   └── …
├── e2e/                      # Playwright L0/L1 + RESULTS
├── docs/                     # 活文档 + 冷归档（见下）
├── shots/                    # 演示编号截图；评测图在 docs/archive/shots
└── tools/viteAppConfig.ts
```

### docs/ 树（活文档在此，不在根）

根目录 **不再** 放 `HARNESS.md` / `COMMANDS.md` / `PACKAGES_SPLIT.md`（已迁入 `docs/`）。

```text
docs/
├── README.md                 # 文档索引
├── TEAM_CHARTER.md
├── HARNESS.md                # Harness / CaseContext（原根路径已迁）
├── COMMANDS.md               # 领域命令（原根路径已迁）
├── PACKAGES_SPLIT.md         # @ip/* 拆包纪律（原根路径已迁）
├── OPTIMIZE_NOTES.md
├── architecture/             # 活架构：codebase / data-flow / data-model / …
├── mid/                      # 中台 Owner 留档（STATUS.md）
├── workbench/                # 工作台 Owner 留档（OWNER_STATUS.md）
├── audit/                    # 跨口债务等（CROSS_PORT_DEBT.md）
└── archive/                  # 冷归档 reviews | evals | shots
```

相对链接：从 `docs/architecture/*` 指纪律文用 `../HARNESS.md` 等；**勿**再写 `../../HARNESS.md`（会落到已空的根）。

## apps 边界

| App | 改什么 | 不改什么 |
|-----|--------|----------|
| mid | `apps/mid` 壳、中台路由挂载 | workbench/agent 业务页源文件 |
| workbench | `apps/workbench` · `flows/*` · `stages/*` | mid Dashboard 业务 |
| agent | `apps/agent` · HITL/会话壳 | mid/workbench 办案页 |
| ops | 日志/监控/告警**样机** UI | 办案 Flow、真 SMTP/Sentry |
| iam | Login / Persona / 工作区示意 | 真 IdP、办案命令 |
| api-mock | HTTP 路由与内存 store | 壳内 UI |

跨口深链与 `APP_PORTS`：权威在 `packages/contracts/src/ports.ts`。

### workbench 壳内树（实码）

```text
apps/workbench/src/
├── App.tsx                   # 路由挂载自 stages/*
├── main.tsx
├── components/               # FlowChrome、Banner、flow/* 壳件
├── lib/deepLinks.ts
├── flows/                    # 业务实现（ResearchFlow、IntakeFlow、…）
│   ├── {research,intake,draft,prosecution,maintain,
│   │    monetize,watch,layout,home,inventor}/
│   └── index.ts
└── stages/                   # 边界 + re-export + STAGE_MODULES
    ├── {同上十段}/index.ts   # 各段 re-export 对应 flow
    └── index.ts              # STAGE_MODULES 清单
```

口径（与 [workbench/OWNER_STATUS](../workbench/OWNER_STATUS.md) 一致）：**业务在 `flows/`**；`stages/` 只做可独立依赖的边界与清单，尚未把实现物理拆进 stage 包。旧副本仍可能在 `src/pages/workbench/*`（legacy / `@shared` 路径）。

## packages 地图

| 包 | 职责 | 典型入口 |
|----|------|----------|
| `@ip/contracts` | `CommandName`、`DomainCommand`、handoff 键、`DOMAIN_EVENTS`、`APP_PORTS`、audit/CaseContext schema | `packages/contracts/src/index.ts` |
| `@ip/domain` | guardrails、stages、persona、caseContext 构建；re-export contracts 命令面 | `packages/domain/src/index.ts` |
| `@ip/app-state` | `AppProvider` / `AgentProvider` / `ProductProvider`、`dispatchCommand`、crossPortStore、apiMock 读/写接线 | `packages/app-state/src/` |
| `@ip/api` | `createApiClient`；优先 `:5180`，失败由 app-state fallback 内存 | `packages/api/src/` |
| `@ip/ui` | 弱上下文 UI：`ProgressBar` / `RiskBadge` / `StageBadge` / `HandoffChip` / `FulfillmentModeBadge` | `packages/ui/src/` |

根 `src/domain/*`、`src/context/*`、部分 `src/components/{ProgressBar,…}` 为 **完整 re-export**，禁止掏空后留空壳。

## src/ 共享面（仍重）

```text
src/
├── pages/           # Case*、Dashboard、Pipeline、Insight*…
│   ├── workbench/   # 旧 Flow 副本（legacy 仍可能引用）
│   └── agent/       # Agent 页
├── components/      # 跨面组件；workbench/ · agent/ 子树
├── data/            # seed（app-state 仍大量 @shared/data/*）
├── lib/ · hooks/ · utils/ · types/
└── App.tsx          # legacy 单体路由（npm run dev:legacy）
```

办理台**新代码**优先落 `apps/workbench/src/flows/*`（经 `stages/*` 挂载）；勿在 `apps/ops` 业务页预埋假后端。

## docs 归档策略

见 [docs/README.md](../README.md) · [docs/archive/README.md](../archive/README.md)。

- **活文档**：`docs/architecture/*`、`docs/TEAM_CHARTER`、`docs/PACKAGES_SPLIT`、`docs/HARNESS`、`docs/COMMANDS`、`docs/OPTIMIZE_NOTES`、`docs/mid/*`、`docs/workbench/*`、`docs/audit/*`
- **冷归档**：`docs/archive/reviews|evals|shots` — 历史评测/审计/截图，只读参考，不当作现状权威
- **根只留**：`README.md` + `CONTRIBUTING.md`（+ 工程配置）

## 相关

- [data-flow](./data-flow.md) · [data-model](./data-model.md) · [backends](./backends.md) · [repos-and-vcs](./repos-and-vcs.md)
- [PACKAGES_SPLIT](../PACKAGES_SPLIT.md) · [e2e/REVIEW_RUBRIC](../../e2e/REVIEW_RUBRIC.md)
