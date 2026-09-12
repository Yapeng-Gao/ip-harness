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
├── README.md                 # 入口 · 端口表 · 快速开始
├── CONTRIBUTING.md           # 分支 / PR / Owner
├── package.json              # npm workspaces
├── playwright.config.ts
├── vite.config.ts            # legacy 单体入口
├── apps/
│   ├── mid/                  # :5173 作业中台
│   ├── workbench/            # :5174 办理台（stages/* 模块）
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
├── docs/                     # 设计 / 章程 / 归档（见 docs/README）
├── shots/                    # 演示截图（编号）；评测图已归档
└── tools/viteAppConfig.ts
```

## apps 边界

| App | 改什么 | 不改什么 |
|-----|--------|----------|
| mid | `apps/mid` 壳、中台路由挂载 | workbench/agent 业务页源文件 |
| workbench | `apps/workbench` · `stages/*` · `flows/*` | mid Dashboard 业务 |
| agent | `apps/agent` · HITL/会话壳 | mid/workbench 办案页 |
| ops | 日志/监控/告警**样机** UI | 办案 Flow、真 SMTP/Sentry |
| iam | Login / Persona / 工作区示意 | 真 IdP、办案命令 |
| api-mock | HTTP 路由与内存 store | 壳内 UI |

跨口深链与 `APP_PORTS`：权威在 `packages/contracts/src/ports.ts`。

## packages 地图

| 包 | 职责 | 典型入口 |
|----|------|----------|
| `@ip/contracts` | `CommandName`、handoff 键、`DOMAIN_EVENTS`、`APP_PORTS`、audit/CaseContext schema | `packages/contracts/src/index.ts` |
| `@ip/domain` | `dispatch` 相关领域、guardrails、stages、persona 纯逻辑 | `packages/domain/src/index.ts` |
| `@ip/app-state` | `AppProvider`、`dispatchCommand`、crossPortStore | `packages/app-state/src/` |
| `@ip/api` | fetch 读/写；优先 `:5180`，失败 fallback 内存 | `packages/api/src/` |
| `@ip/ui` | 弱上下文 UI（Banner 等渐进迁入） | `packages/ui/src/` |

根 `src/domain/*`、`src/context/*` 为 **完整 re-export**，禁止掏空后留空壳。

## src/ 共享面（仍重）

```text
src/
├── pages/           # Case*、Dashboard、Pipeline、Insight*…
│   ├── workbench/   # 办理台页（legacy 路径仍引用）
│   └── agent/       # Agent 页
├── components/      # 跨面组件；workbench/ · agent/ 子树
├── data/            # seed
├── lib/ · hooks/ · utils/ · types/
└── App.tsx          # legacy 单体路由（npm run dev:legacy）
```

workbench 新代码优先落 `apps/workbench/src/stages/*`；旧页仍可能在 `src/pages/workbench`。

## docs 归档策略

见 [docs/README.md](../README.md) · [docs/archive/README.md](../archive/README.md)。

- **活文档**：`docs/architecture/*`、`TEAM_CHARTER`、`PACKAGES_SPLIT`、`HARNESS`、`COMMANDS`、`OPTIMIZE_NOTES`、`docs/audit/*`
- **冷归档**：`docs/archive/reviews|evals|shots` — 历史评测/审计/截图，只读参考，不当作现状权威

## 相关

- [data-flow](./data-flow.md) · [data-model](./data-model.md) · [backends](./backends.md) · [repos-and-vcs](./repos-and-vcs.md)
- [PACKAGES_SPLIT](../PACKAGES_SPLIT.md) · [e2e/REVIEW_RUBRIC](../../e2e/REVIEW_RUBRIC.md)
