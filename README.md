# IP Harness · Monorepo（Phase 0）

## 对外口径（冻结）

本仓是 **多壳 + 共享内核样机**：产品五壳与并行样机 Vite 壳共用 `@ip/*` 契约 / 领域 / 状态包。**非**微服务、**非**真 SSO、**非**真可观测（ops 仅占位）。日常开发分支：`dev`。

**规模（当前）**：**16** 个 `apps/*` workspace + **5** 个 `packages/*`（`contracts` / `domain` / `app-state` / `api` / `ui`）。端口以 [`packages/contracts/src/ports.ts`](./packages/contracts/src/ports.ts) 的 `APP_PORTS` 为准（下表与之一字对齐）。

## 仓库有多少项目

### 产品五壳

| App | 包名 | 端口 (`APP_PORTS`) | 说明 |
|-----|------|-------------------|------|
| **mid** | `@ip/mid` | **5173** | 作业中台：Dashboard、Case*、Pipeline、Docket、Billing… |
| **workbench** | `@ip/workbench` | **5174** | 办理台：`/workbench/*` Flow + InventorPortal |
| **agent** | `@ip/agent` | **5175** | 知产 Agent：`/agent/*` |
| **ops** | `@ip/ops` | **5176** | **占位** — 运维面由运维平台助手建设 |
| **iam** | `@ip/iam` | **5177** | 占位薄壳：Login / 工作区 / Persona |

### HTTP 样机

| App | 包名 | 端口 | 启动脚本 | 说明 |
|-----|------|------|----------|------|
| **api-mock** | `@ip/api-mock` | **5180** (`api`) | `npm run dev:api` | 同仓命令/案件/Inbox HTTP mock（非真后端） |
| **search-api** | `@ip/search-api` | **5190** (`searchApi`) | `npm run dev:search-api` | 检索数据面 HTTP（可选；含 `better-sqlite3` 原生依赖） |

### 并行样机壳

| App | 包名 | 端口 (`APP_PORTS` 键) | 启动脚本 |
|-----|------|----------------------|----------|
| **doc-harness** | `@ip/doc-harness` | **5178** (`docHarness`) | `npm run dev:doc-harness` |
| **ai-infra** | `@ip/ai-infra` | **5179** (`aiInfra`) | `npm run dev:ai-infra` |
| **ai-data** | `@ip/ai-data` | **5181** (`aiData`) | `npm run dev:ai-data` |
| **search** | `@ip/search` | **5182** (`search`) | `npm run dev:search` |
| **fto** | `@ip/fto` | **5183** (`fto`) | `npm run dev:fto` |
| **mining** | `@ip/mining` | **5184** (`mining`) | `npm run dev:mining` |
| **inspire** | `@ip/inspire` | **5185** (`inspire`) | `npm run dev:inspire` |
| **landscape** | `@ip/landscape` | **5186** (`landscape`) | `npm run dev:landscape` |
| **figure** | `@ip/figure` | **5187** (`figure`) | `npm run dev:figure` |

### 共享包 `packages/`（5）

| 包 | 说明 |
|----|------|
| `@ip/contracts` | 命令/审计 schema、handoff、事件、`APP_PORTS` / `APP_DEV_URLS` |
| `@ip/domain` | 领域模型与纯逻辑 |
| `@ip/app-state` | App/Agent/Product context + cross-port store |
| `@ip/api` | 薄 HTTP 客户端（优先 api-mock，失败 fallback 内存） |
| `@ip/ui` | 共享 UI 原语 |

## 环境配置

| 项 | 说明 |
|----|------|
| Node | 建议 **Node 20+**（本机开发常用 v20.19.x） |
| 包管理 | **npm workspaces**；在**仓根**执行 `npm install` |
| 分支 | 日常 **`dev`**；`main` 为可演示/生产候选 |
| 密钥 / `.env` | **Phase 0 默认无强制密钥**；多数壳开箱即 mock |
| 原生依赖 | `apps/search-api` 使用 **`better-sqlite3`**，`npm install` 时需能编译原生模块（缺构建链时仅影响 search-api） |
| 口径 | 多壳 + 共享内核样机；**非**微服务拆分、**非**真 SSO / 真可观测 |

协作与 Owner：[`CONTRIBUTING.md`](./CONTRIBUTING.md) · [`docs/TEAM_CHARTER.md`](./docs/TEAM_CHARTER.md) · 文档索引 [`docs/README.md`](./docs/README.md)。

## 怎么启动

```bash
git clone git@github.com:Yapeng-Gao/ip-harness.git
cd ip-harness
git checkout dev
npm install

# 默认 = mid（作业中台）
npm run dev              # → http://localhost:5173
```

### 产品五壳 + HTTP 样机

```bash
npm run dev:mid          # 5173
npm run dev:workbench    # 5174
npm run dev:agent        # 5175
npm run dev:ops          # 5176
npm run dev:iam          # 5177
npm run dev:api          # 5180  api-mock
npm run dev:search-api   # 5190  search-api
```

### 并行样机壳

```bash
npm run dev:doc-harness  # 5178
npm run dev:ai-infra     # 5179
npm run dev:ai-data      # 5181
npm run dev:search       # 5182
npm run dev:fto          # 5183
npm run dev:mining       # 5184
npm run dev:inspire      # 5185
npm run dev:landscape    # 5186
npm run dev:figure       # 5187
```

检索 UI 指向本地 search-api（可选）：

```bash
npm run dev:search:api   # search + VITE_SEARCH_API_URL=http://localhost:5190
```

兼容入口（拆分前完整路由，调试用）：

```bash
npm run dev:legacy       # 根 Vite → 仍用 src/App.tsx
```

**推荐联调**：同时开 **mid + workbench + agent**（可选再开 `dev:api`）。顶栏「IP Apps」深链到各端口。

```bash
npm run typecheck:contracts   # @ip/contracts
npm run typecheck             # 见根 package.json（含 mid 等）
```

## 目录结构

```
ip-harness/
  README.md · CONTRIBUTING.md
  apps/
    mid/ workbench/ agent/ ops/ iam/
    api-mock/ search-api/
    doc-harness/ ai-infra/ ai-data/
    search/ fto/ mining/ inspire/ landscape/ figure/
  packages/
    contracts/ domain/ app-state/ api/ ui/
  src/                 共享业务源码（@shared；渐进迁入）
  e2e/                 Playwright
  docs/                架构 · 章程 · 索引（见 docs/README.md）
  tools/               vite 等辅助
```

端口权威源：[`packages/contracts/src/ports.ts`](./packages/contracts/src/ports.ts)。  
完整分层：[`docs/architecture/codebase.md`](./docs/architecture/codebase.md) · 文档索引：[`docs/README.md`](./docs/README.md)。

## 产品与路由（逻辑面 · 五壳摘要）

### mid · 作业中台

`/` 仪表盘 · `/pipeline` · `/cases` · `/docket` · `/insight/*` · `/billing` · `/settings`…

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
详见 [`apps/api-mock/README.md`](./apps/api-mock/README.md)。

并行样机（doc-harness / ai-* / search / fto / mining / inspire / landscape / figure）各自 README 见对应 `apps/<name>/README.md`。

## 共享领域命令

Form SaaS 与 知产 Agent **共用** `dispatchCommand`（类型与审计 schema 在 `@ip/contracts`）。  
详见 [`docs/COMMANDS.md`](./docs/COMMANDS.md) · [`docs/HARNESS.md`](./docs/HARNESS.md)。

## 技术栈

Vite + React 19 + TypeScript · Tailwind CSS v4 · react-router-dom · lucide-react · npm workspaces
