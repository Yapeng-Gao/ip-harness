# IP Harness · Monorepo（Phase 0）

## 对外口径（冻结）

本仓是 **多壳 + 共享内核样机**：mid / workbench / agent 等 Vite 壳共用根 `src/` 与 `@ip/*` 契约包。**非**微服务、**非**真 SSO、**非**真可观测（ops 仅占位）。

一个前端 harness，物理拆成多 Vite 应用（**非真微服务**）：

| App | 包名 | 端口 | 说明 |
|-----|------|------|------|
| **mid** | `@ip/mid` | **5173** | 作业中台：Dashboard、Case*、Pipeline、Docket、Billing、OrgSettings、Insight… |
| **workbench** | `@ip/workbench` | **5174** | 办理台：`/workbench/*` Flow + InventorPortal |
| **agent** | `@ip/agent` | **5175** | 知产 Agent：`/agent/*` |
| **ops** | `@ip/ops` | **5176** | **占位** — 运维面由运维平台助手建设（不实现 ELK） |
| **iam** | `@ip/iam` | **5177** | 占位薄壳：Login / 工作区 / Persona |
| **api-mock** | `@ip/api-mock` | **5180** | **同仓样机 · 非真后端** HTTP mock（命令/案件/Inbox） |

共享契约：`packages/contracts`（`@ip/contracts`）— commands、AUDIT / CaseContext `schemaVersion`、handoff 键、事件名、guardrail 纯类型、`APP_PORTS.api`。

共享领域：`packages/domain`（`@ip/domain`）。共享应用状态：`packages/app-state`（`@ip/app-state`）— App/Agent/Product context + crossPortStore；根 `@shared/context/*` 仍为完整 re-export。

薄 API 客户端：`packages/api`（`@ip/api`）— 已接线 `@ip/app-state` 读/写路径（优先 api-mock:5180，失败 fallback 内存；见 `apps/api-mock/README.md`）。

共享业务源码暂仍在根 `src/`（渐进迁入；各 app 经 `@shared` 别名引用）。

浅色主题 · 中文 UI · 纯前端 mock。

## 仓库

- GitHub：https://github.com/Yapeng-Gao/ip-harness
- 分支：`dev`（开发）· `main`（生产候选）
- 协作：[`CONTRIBUTING.md`](./CONTRIBUTING.md) · [`docs/TEAM_CHARTER.md`](./docs/TEAM_CHARTER.md)
- 架构：[`docs/architecture/`](./docs/architecture/)

## 快速开始

```bash
git clone git@github.com:Yapeng-Gao/ip-harness.git
cd ip-harness
git checkout dev
npm install

# 默认 = 作业中台（可演示主路径）
npm run dev          # → http://localhost:5173  (= mid)

# 分应用
npm run dev:mid          # 5173
npm run dev:workbench    # 5174
npm run dev:agent        # 5175
npm run dev:ops          # 5176 占位
npm run dev:iam          # 5177 薄壳
npm run dev:api          # 5180 同仓样机 mock（非真后端）

# 单体兼容入口（拆分前完整路由，调试用）
npm run dev:legacy       # 根 vite → 仍用 src/App.tsx
```

建议同时开 mid + workbench + agent 做跨面演示；顶栏「IP Apps」深链到各端口。

```bash
npm run typecheck:contracts   # @ip/contracts
npm run typecheck             # contracts + mid
```

## 目录结构

```
ip-harness/
  README.md · CONTRIBUTING.md
  apps/{mid,workbench,agent,ops,iam,api-mock}/   # 多壳 · 端口见上表
  packages/{contracts,domain,app-state,api,ui}/  # @ip/* 共享内核
  src/                      共享业务源码（@shared；渐进迁入）
  e2e/                      Playwright L0/L1
  docs/                     架构 · 章程 · 纪律 · archive/
  shots/                    演示截图（评测图见 docs/archive/shots）
  tools/viteAppConfig.ts
```

完整分层与归档规则：[`docs/architecture/codebase.md`](./docs/architecture/codebase.md) · 文档索引：[`docs/README.md`](./docs/README.md)。

## 产品与路由（逻辑面）

### mid · 作业中台

`/` 仪表盘 · `/pipeline` · `/cases` · `/docket` · `/insight/*` · `/billing` · `/settings`…

跨 app：侧栏 `/workbench/*`、`/agent` 在 multi-app 下深链到 5174 / 5175。

### workbench · 办理台

`/workbench/*` Flow · `/inventor` 发明人门户

### agent · 知产 Agent

`/agent` · `/agent/sessions` · `/agent/agents` · `/agent/harness`

### ops · 运维占位

壳页文案：「运维面由运维平台助手建设」。详见 [`apps/ops/README.md`](./apps/ops/README.md)。

### iam · IAM 薄壳

Login / Persona / 工作区；非真 SSO。详见 [`apps/iam/README.md`](./apps/iam/README.md)。

### api-mock · 同仓样机（非真后端）

内存 HTTP mock：`/health` · `/v1/cases` · `/v1/inbox` · `POST /v1/commands/dispatch`。  
详见 [`apps/api-mock/README.md`](./apps/api-mock/README.md)。写路径优先 mock；`crossPortStore` / bridge 仍作 fallback。

## 共享领域命令

Form SaaS 与 知产 Agent **共用** `dispatchCommand`（类型与审计 schema 在 `@ip/contracts`）。  
详见 [`docs/COMMANDS.md`](./docs/COMMANDS.md) · [`docs/HARNESS.md`](./docs/HARNESS.md)。

## 技术栈

Vite + React 19 + TypeScript · Tailwind CSS v4 · react-router-dom · lucide-react · npm workspaces
