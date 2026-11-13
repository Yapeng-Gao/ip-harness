# Playwright 样机级 e2e · L0 + L1 用例计划

> **依据**：`e2e/REVIEW_RUBRIC.md`（已验收 · 本计划严格按尺子）  
> **立场**：多壳 + 共享内核样机；不是生产全量回归  
> **本交付**：只出计划表，**不写 spec**、不改 `apps/`、不改现有 spec、不跑全量 Playwright  
> **日期**：2026-09-12（UTC+8）

---

## 1. 端口 / 壳对照表

| 壳 / 服务 | 端口 | 包名 | Dev 脚本 | Playwright 口径 |
|-----------|------|------|----------|-----------------|
| mid | **5173** | `@ip/mid` | `npm run dev:mid` | project `mid` / 显式 URL |
| workbench | **5174** | `@ip/workbench` | `npm run dev:workbench` | project `workbench`（历史单 baseURL） |
| agent | **5175** | `@ip/agent` | `npm run dev:agent` | project `agent` |
| ops | **5176** | `@ip/ops` | `npm run dev:ops` | project `ops` |
| iam | **5177** | `@ip/iam` | `npm run dev:iam` | project `iam` |
| api-mock | **5180** | `@ip/api-mock` | `npm run dev:api` | `request.get`（非 UI） |

来源：`packages/contracts` `APP_PORTS` / `APP_DEV_URLS`；各 `apps/*/vite.config.ts`。  
**诚实前提**：host 一律 `localhost`（禁止 `127.0.0.1`，跨壳 cookie / `APP_DEV_URLS`）。**单端口绿 ≠ 多壳绿**（尺子 R3）。

---

## 2. 现有 e2e 盘点（只读）

### 2.1 文件与脚本

| 路径 | 作用 |
|------|------|
| `e2e/critical-paths.spec.ts` | 唯一现有 spec |
| `e2e/RESULTS.md` | 17 passed · baseURL `5174` only |
| `e2e/REVIEW_RUBRIC.md` | 分层尺子（本计划权威） |
| `playwright.config.ts` | 单 baseURL 5174 · 无 webServer · 单 chromium |
| `package.json` → `test:e2e` | `playwright test` |

### 2.2 `enterWorkspace` 位置与用法

- **位置**：`e2e/helpers/enterWorkspace.ts`（从 critical-paths 抽出）。
- **用法**：强制 `http://localhost:5177/login` → heading `IP Harness` → group「产品切换」选「作业中台」|「知产 Agent」→ 点 `进入工作区 {星河智造|德恒}`。
- **多壳注意**：登录页属 **iam:5177** `/login`（共享 `Login`）；`VITE_MULTI_APP=true` 时选仓后 `window.location` → mid/agent。`enterWorkspace` **强制** `http://localhost:5177/login`（§7 已决）。

### 2.3 critical-paths 覆盖摘要 → 尺子裁定

| 现有用例 | 裁定 | 本计划处置 |
|----------|------|------------|
| Login SaaS → dashboard | L1 | **保留** → L1-01 |
| Workbench 业务工作台 | L1 偏薄 | **保留/升格** → L1-05 |
| Agent home composer | L1 | **保留**（可并入 L0-AG 或作 L1 辅助） |
| HITL 抽样 oa/layout/intake/watch | L1 | **收敛** → L1-02（代表 Inbox→HITL，不必四条全留） |
| Catalog 全 9 heading | L0/L1 边界 | **保留为清单烟** → L1-06；禁止对 9 卡深交互 |
| `all agents session` ×9 formal play | **超标** | **收敛为 1～2 代表路径**（L1-07）；其余 **L2 暂缓** |

---

## 3. 各壳关键路由（只读摘要）

| 壳 | 关键入口 | 装饰/占位（默认不测深） |
|----|----------|-------------------------|
| mid | `/` 仪表盘；`/cases/:id`（审计 tab） | Insight 全图、OrgSettings 深表、Pipeline 拖拽、Docket 全列 |
| workbench | `/workbench`；一阶段如 `/workbench/research` | 全阶段 Flow 深填表 |
| agent | `/agent`；`/agent/sessions/:id`（HITL）；`/agent/agents`（heading 清单） | 九 Agent formal play 矩阵 |
| ops | `/` 总览；通知/试发控件（AlertNotify 区） | ELK、渠道矩阵、规则 DSL |
| iam | `/` 或 `/login` 薄壳地标 | 真 SSO / OIDC |
| api-mock | `GET /health` | 命令矩阵当生产契约 |

---

## 4. 用例表

列：`ID | 层级 | 壳 | 路由/路径 | 断言要点 | 优先级 | 备注`

选择器纪律（尺子硬）：`getByRole` / heading / 作用域内 CTA（如 `.confirm-hitl`）；**禁止**全局 `getByText('批准策略')`、脆 CSS、多步装饰 click。

### 4.1 L0 — 路由冒烟（必保）

**允许**：`goto` / `request.get` + 可见地标。**禁止**：多步 click 链、填表、formal play。

| ID | 层级 | 壳 | 路由/路径 | 断言要点 | 优先级 | 备注 |
|----|------|-----|-----------|----------|--------|------|
| L0-MID-01 | L0 | mid | `http://localhost:5173/` | 可见「资产与任务」或跳转落地（未进仓只验壳可达） | P0 | **新建**；L0 零 click |
| L0-WB-01 | L0 | workbench | `http://localhost:5174/workbench` | 可见「业务工作台」 | P0 | **新建**（与 L1-05 可共用 goto；L0 无 click） |
| L0-AG-01 | L0 | agent | `http://localhost:5175/agent` | 可见「要办哪件事」或发送/启动/办理目标 | P0 | **新建**；对齐 critical Agent home 地标 |
| L0-OPS-01 | L0 | ops | `http://localhost:5176/` | 可见「运维面总览」或占位标题/横幅 | P0 | **新建**；不验真实监控数据 |
| L0-IAM-01 | L0 | iam | `http://localhost:5177/login`（或 `/`） | 可见「IP Harness」heading，或 Persona/工作区薄壳地标 | P0 | **新建**；优先 `/login` 与进仓对齐 |
| L0-API-01 | L0 | api-mock | `GET http://localhost:5180/health` | HTTP 2xx + 健康 JSON（或约定字段） | P0 | **新建**；`request` fixture；非 UI |

**L0 合计：6**（五壳入口 + api health）。侧栏全 link、Insight/Billing 子页 → **不进 L0**（R1）。

### 4.2 L1 — 关键路径（必保五条 + 收敛自 critical-paths）

| ID | 层级 | 壳 | 路由/路径 | 断言要点 | 优先级 | 备注 |
|----|------|-----|-----------|----------|--------|------|
| L1-01 | L1 | iam→mid | `http://localhost:5177/login` → 选「作业中台」→「进入工作区 星河智造」→ mid `/` | 复用 `enterWorkspace`（强制 iam:5177）；落 mid 见「资产与任务」 | P0 | **保留** critical #1；尺子 §1 路径 1 |
| L1-02 | L1 | agent | `/agent/sessions/sess-oa-1`（或同等 needs_human） | Inbox/会话进入后 `.confirm-hitl` 可见；作用域内专科 CTA（如「批准策略」）**只可见不点**；不等 play | P0 | **收敛** critical #4 抽样；尺子 §1 路径 2 Inbox→HITL；代表 1× needs_human |
| L1-03 | L1 | mid | `/cases/c1?tab=audit`（seed 从 cases 挑，如 c1） | 地标「最近领域命令」可见；**不点导出** | P0 | **新建**；尺子 §1 路径 3；不遍历全 tab |
| L1-04 | L1 | ops | `http://localhost:5176/config#alerts` | 「通知渠道」+「试发」可见且可点 **一次**；不要求真投递 | P0 | **新建**；路由钉死 `/config#alerts`；尺子 §1 路径 4 |
| L1-05 | L1 | workbench | `/workbench` + 一阶段（建议 `/workbench/research`） | 首页「业务工作台」+ 阶段入口标题正确可达 | P0 | **保留/升格** critical #2；尺子 §1 路径 5；禁止全阶段深填表 |
| L1-06 | L1 | agent | `/agent/agents` | 9 个目录 **heading** 可见（调研检索…布局） | P0 | **保留** critical #5 为**清单烟**；禁止对 9 卡各开深交互 |
| L1-07 | L1 | agent | `/agent/sessions/sess-disclosure-1` | queued → 点「启动\|发送」一次 → `.confirm-hitl` 内 CTA 可见（timeout 可放宽） | P0 | **收敛**自 ×9：代表 **1× queued→启动→HITL**；套件内**唯一** play 启动 click |

**L1 必保（尺子 §1 五条）**：L1-01 … L1-05。  
**L1 收敛加项**：L1-06（Catalog 清单 heading）、L1-07（queued 代表 play）。  
**L1-02** 同时满足「Inbox→HITL」与「1× needs_human 代表路径」（只可见不点 CTA）。  
**L1-08** 已并入 L0-AG-01，删除。

### 4.3 L2 暂缓（不写进必跑套件）

| ID | 层级 | 壳 | 路由/路径 | 断言要点 | 优先级 | 备注 |
|----|------|-----|-----------|----------|--------|------|
| L2-AG-PLAY-* | L2 | agent | 其余 seed sessions（research/intake/claims/annuity/watch/monetize/layout 等未入 L1-02/07 者） | formal play / 全闸门 | — | **L2 暂缓**；原 `all agents session` ×9 减去 2 条代表 |
| L2-HITL-EXTRA | L2 | agent | sess-layout / intake / watch 额外 HITL 深断言 | sheet 折叠、Full-check 墙等 | — | **L2 暂缓**；critical #4b–4d 深细节 |
| L2-INSIGHT | L2 | mid | `/insight/*` 全图交互 | — | — | **L2 暂缓** |
| L2-BILLING | L2 | mid | Billing 会计细则 | — | — | **L2 暂缓** |
| L2-DECOR | L2 | mid/wb/ops | 装饰页 click 链 | — | — | **L2 暂缓**（R1） |
| L2-SSO-OBS | L2 | iam/ops | 真 SSO / 真可观测 / 真投递 | — | — | **L2 暂缓** |

---

## 5. 数量汇总

| 层级 | 用例数 | 说明 |
|------|--------|------|
| **L0** | **6** | 五壳入口 + api `/health` |
| **L1** | **7** | 必保五条（L1-01…05）+ Catalog 清单（L1-06）+ queued 代表（L1-07）；L1-08 已删 |
| **L2 暂缓** | （原 ×9 减 2 + 装饰族） | 不进必跑；RESULTS 不得标「通过」掩饰未跑 |

**代表路径收敛（相对 critical-paths ×9 formal play）**：

1. **needs_human**：L1-02 → `sess-oa-1`（只验 HITL 可见，默认可不点 CTA；若需与历史等价可保留「可见」深度）  
2. **queued→启动→HITL**：L1-07 → `sess-disclosure-1`（套件内唯一 play 启动 click）  
3. **其余 7～8 个 session formal play** → **L2 暂缓**

---

## 6. 技术备注（实现阶段建议 · 本文件不改代码）

1. **拆文件**：`e2e/l0-smoke.spec.ts`（多 port）+ `e2e/critical-paths.spec.ts` 收敛为仅 L1。  
2. **config**：`projects` 按壳分 baseURL；api 用 `request`；**勿**宣称单 5174 全绿（R3）。  
3. **跑前**：确认 `5173–5177`、`5180` 已起；缺端口 RESULTS 写「未跑」。  
4. **结果**：写入 `e2e/RESULTS.md`，含**端口矩阵**。  
5. **host**：一律 `localhost`（禁止 `127.0.0.1`）。  
6. **Helper**：抽 `enterWorkspace` 到 `e2e/helpers/`，默认 origin = iam:5177。

---

## 7. 已决（评审拍板 · 2026-09-12 UTC+8）

评审结论：

1. **L1-01 登录强制 iam:5177** — 是。`enterWorkspace` 默认 `http://localhost:5177/login`；mid `/login` 仅外跳，禁止当登录入口。
2. **host 统一 `localhost`** — 禁止 `127.0.0.1`（跨壳 cookie / `APP_DEV_URLS` 对齐）。
3. **L1-07** = `sess-disclosure-1`（queued → 点「启动|发送」一次 → `.confirm-hitl` CTA）。
4. **L1-02** 只可见不点 CTA：Inbox→HITL 以 `.confirm-hitl` 内专科 CTA **可见** 即满足；禁止点批准。
5. **L1-03** = `/cases/<seedId>?tab=audit`，地标「最近领域命令」，seed 从 cases 挑（如 `c1`）；**不点导出**。
6. **L1-04** = `goto http://localhost:5176/config#alerts`（通知渠道 + 试发可点一次）。
7. **L1-08** 并入 L0-AG-01 后删除（不再单列）。

硬约束：

- L0-MID 未进仓可只验壳可达（地标或跳转落地）
- L0 零 click
- L1-07 为套件内**唯一** play 启动 click
- Catalog 仅 heading（禁止对 9 卡深交互）

---

## 8. 成功标准（本交付）

- [x] 计划路径：`/workspace/ip-harness/e2e/PLAN-L0-L1.md`
- [x] 严格对齐 `REVIEW_RUBRIC.md`：L0 五壳+health；L1 必保五条；×9→1～2 代表；Catalog 仅 heading
- [x] 未写 spec、未改业务代码


---

## 9. 并行壳 L0 增量（2026-09-18 UTC+8）

五壳 + api 的 L0/L1 **本文件仍为权威**，不因并行壳改编号或推翻。

**并行壳首页 L0（5182–5187）**另立计划：[`PLAN-L0-PARALLEL-5182-5187.md`](./PLAN-L0-PARALLEL-5182-5187.md)（search/fto/mining/inspire/landscape/figure · 仅 L0 · Hunt 不进）。

RESULTS 端口矩阵已**追加** 5182–5187（见 `RESULTS.md` 并行壳 L0 表）；未跑标「未跑」，禁止用五壳绿掩饰并行壳未覆盖。实现：`e2e/l0-parallel-smoke.spec.ts` + config 六 project。
