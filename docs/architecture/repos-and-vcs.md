# 仓库数量与版本控制（样机 → 后端）

> 口径：多壳 + 共享内核样机；**先设计留档**，真 GitHub 远程由用户提供 org/URL 后再接。  
> 现状：`/workspace/ip-harness` **尚无 `.git`**，不在用户本机磁盘。

## 结论（建议）

| 阶段 | GitHub 仓库数 | 说明 |
|------|---------------|------|
| **现在～接第一批后端** | **1 个 monorepo** | 保持现仓：`apps/*` + `packages/*` + `docs/` |
| **后端多服务成熟后（可选）** | 仍优先 **1**；或 **2**（`platform` 前端壳+契约 / `services` 后端） | 不要按 mid/workbench/agent/ops/iam **一人一仓** |
| **不推荐** | 5～6 个前端仓 + N 个后端仓起步 | 契约双份、深链/端口/e2e 会碎 |

**一句话：应用拆开是进程/端口拆分，不是仓库拆分。契约在 `@ip/contracts`，一仓最省事。**

## 为什么不要「一应用一仓」

- 共享内核：`@ip/domain` / `app-state` / `ui` / `api` / `contracts` 被多壳共用。
- 跨口深链、Persona cookie、api-mock、e2e 多 project 都假设同仓可改。
- 一改命令名要发 5 个 PR → 样机节奏扛不住。

## 目标后端怎么放（仍可一仓）

建议目录（目标设计，今日可只建空目录/文档）：

```text
apps/mid|workbench|agent|ops|iam|api-mock   # 已有壳 + mock
packages/contracts|domain|app-state|ui|api # 已有
services/case-command/                     # 未来命令写服务
services/case-query/                       # 未来读模型
services/iam/                              # 未来真身份（可后置）
docs/architecture/                         # 设计留档
```

- **短中期**：后端也进**同一 monorepo**（`services/`），用 path/workspace 或各自 Dockerfile。
- **长期**：若团队/权限强隔离，再拆 **第 2 仓**只放 `services/*`，契约用 npm 包或 git submodule/`packages/contracts` 发布；前端壳仍共一仓。

对齐 [backends.md](./backends.md) 服务候选；事件名仍以 `@ip/contracts` `DOMAIN_EVENTS` 为准。

## 分支策略（建议起步）

单仓足够用经典 trunk：

| 分支 | 用途 |
|------|------|
| `main` | 可演示的样机；保护分支；PR 合入 |
| `feat/<域>-<简述>` | Owner 按域开刀（例 `feat/ops-alerts`、`feat/api-mock-read`） |
| `fix/<简述>` | 紧急修演示 |
| 可选 `release/demo-YYYYMMDD` | 对外演示冻结标签；不强制长期 release 枝 |

规则（样机级）：

1. **禁止**直接推 `main`（接好 GitHub 后开 branch protection）。
2. PR 描述写：Owner / 留档路径 / 怎么验（tsc / e2e / 手点端口）。
3. 跨域改 `packages/contracts`：PR 必须 @总控或架构评审过一眼。
4. 标签：`demo-YYYYMMDD` 打在通过 e2e L0+L1 的 commit。

不引入复杂 gitflow（develop/release/hotfix 全家桶），除非多人并行冲突变大。

## 版本号

- 根与各 workspace 包：起步可用 `0.0.0` / 日历版本；真发 npm 再 semver。
- **契约破坏**（改 `CommandName` / handoff key）：在 `packages/contracts` CHANGELOG 留一行；多壳同 PR 升级。

## 与「我怎么看文档」的关系

| 方式 | 何时用 |
|------|--------|
| 本仓初始化 git + 推你的 GitHub **一个** remote | **推荐**：你克隆后本地看 docs + 跑 dev |
| zip 拷到本机 | 临时看文档，不做版本控制 |
| 多仓 | 仅当后端团队强制隔离时再开第 2 仓 |

## 落地清单（待用户给 GitHub）

1. 用户创建 **1** 个空仓（例 `org/ip-harness`），私钥/权限给本机或 bot。
2. 总控：`git init` → 首 commit（含 docs）→ `main` → 推 remote。
3. 写 `CONTRIBUTING.md`（分支表 + Owner 表链 [TEAM_CHARTER](../TEAM_CHARTER.md)）。
4. 开 PR template；可选 GitHub Actions：`typecheck` + `test:e2e`（需起端口或改 e2e webServer）。

---

**决策冻结（2026-09-12）**：默认 **单 monorepo**；不按前端壳拆仓；后端先同仓 `services/`；分支用 `main` + `feat/*`。

## 后面正式开发：应用要不要分仓？

**默认仍然：前端多壳共一仓。**  
「应用已拆」= 可独立部署的 **app/进程**；「分仓」= 独立 **版本与权限边界**。二者不等价。

### 继续共仓（推荐多数情况）

同时满足时别拆：

- 改一次 `@ip/contracts` / handoff / 命令名，**多个壳要同一天跟上**
- 同一产品团队维护 mid + workbench + agent
- 还要共用 Persona、深链、e2e、设计文档

部署仍可分开：CI 按 `apps/mid` 等分别 build/镜像，**一仓多制品**。

### 什么时候才该分仓

出现下面 **组织或发布** 问题，再拆，而不是按壳名机械拆：

| 信号 | 可拆成 |
|------|--------|
| 前后端团队权限/发布节奏完全不同 | 第 2 仓：`services/*`（后端） |
| 某壳成独立售卖产品、独立版本号与客户 | 该壳迁出（少见；迁出时必须 **发布 contracts npm 包**） |
| 开源一部分、闭源一部分 | 按开源边界拆，不是按 mid/wb/agent |

### 仍不建议的拆法

- mid / workbench / agent / ops / iam **一人一仓**（契约地狱）
- 每个微服务一个仓 + 前端再五仓（起步过碎）

### 演进路线（冻结建议）

```text
现在     →  1 仓 monorepo（壳 + packages + docs + 以后 services/）
接后端   →  仍 1 仓；services/ 同仓；制品分开部署
团队变大 →  可选 2 仓：platform（壳+契约） / services（后端）
产品线裂 →  再评估单壳迁出（有成本，需契约包）
```

**判据一句话：** 共享契约还在高频改 → 共仓；只有部署/权限要隔离 → 先共仓分制品，再考虑分仓。

## 企业 / 生产：多仓选项（用户偏好）

> 用户口径（2026-09-12）：生产要分仓库；当前环境继续开发；代码进不同 Git 仓；分支 **`dev` = 开发，`main` = 生产**。

### 先澄清

- **企业级 ≠ 每个 Vite 壳必须独立 GitHub 仓。** 很多企业生产用 monorepo + 分制品部署；也有企业强制多仓（合规/采购/多供应商）。
- 若组织要求多仓：**按发布与权限边界拆**，并强制 **契约仓/包** 当胶水，禁止五壳各写一份命令名。

### 推荐的企业多仓切法（3～4 仓，不是 5+N）

| 仓 | 内容 | 生产制品 |
|----|------|----------|
| **`ip-contracts`**（或 npm 私有包源） | `@ip/contracts`（+ 可选 domain 纯类型） | 版本化契约包 |
| **`ip-web`** | `apps/mid|workbench|agent|ops|iam` + `packages/app-state|ui|api` + 前端 docs | 多个前端镜像/静态资源（CI 分 matrix build） |
| **`ip-services`** | 未来 `services/*` 命令/查询/通知等 | 多个后端服务镜像 |
| **可选 `ip-infra`** | Terraform/Helm/GitOps | 集群配置 |

**仍不推荐起步就拆：** `ip-mid` / `ip-workbench` / `ip-agent` / `ip-ops` / `ip-iam` 五个前端仓——除非五个供应商五套权限，且接受契约发版延迟。

若必须「一应用一仓」（硬政策）：

```text
ip-contracts          # 必有
ip-app-mid
ip-app-workbench
ip-app-agent
ip-app-ops
ip-app-iam
ip-services-*         # 后端按域
```

每个 app 仓 **只依赖已发布的 `@ip/contracts@x.y.z`**；改契约先发 contracts，再 bump 各 app。成本高，要专人盯兼容。

### 分支模型（按你的要求）

每个业务仓统一：

| 分支 | 含义 |
|------|------|
| **`dev`** | 日常集成 / 联调 / 预发候选 |
| **`main`** | 生产可发布；只收来自 `dev` 的 PR（或 release PR） |

规则：

1. 功能在 `feat/*` 开 → PR 进 **`dev`**。
2. 生产发布：`dev` → PR → **`main`**，打 tag `vX.Y.Z`（或 `prod-YYYYMMDD`）。
3. 热修：`fix/*` 可从 `main` 拉 → 合回 `main` 并 **回合并 `dev`**，防漂移。
4. **`ip-contracts`**：破坏性变更先在 `dev` 发 `x.y.z-dev` / 预发版，各 app `dev` 升依赖后再一起进 `main`。

（这与「仅 main+feat」的样机简化模型不同；**生产切换到 dev/main 双轨**。）

### 和「现在环境开发」的关系

- 开发机 / Grok Bot 箱上可继续是 **一个工作区目录**（今天的 monorepo 树）。
- 对外用 **多个 remote** 或定期 `git subtree split` / 发布脚本推到各仓；或迁到多仓后本地用 meta 工具（如 `git submodule` / `pnpm workspace` 多根——有成本）。
- **短期务实路径：** 先 **1 个 GitHub 仓** 接上 `dev`/`main` 跑起来；组织强制多仓时，按上表拆出 `contracts` + `web` + `services`，而不是先拆五个壳。

### 决策（待用户拍板二选一）

| 方案 | 仓数 | 适用 |
|------|------|------|
| **A. 企业稳健** | 3：contracts + web + services | 推荐生产默认 |
| **B. 政策硬拆壳** | 1 contracts + 5 app + services | 仅政策强制时 |

分支：**一律 `dev` / `main`。**
