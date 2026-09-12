# mid · 作业中台（:5173）

> **样机诚实**：`apps/mid` 是作业中台 Vite 壳；页本体多仍 `@shared`；读优先 `@ip/api`→api-mock，失败 fallback 内存 seed；写经 `AppProvider.dispatchCommand`；跨口大块态靠 cookie + mid iframe bridge。  
> **落地目标**：中台仍是**产品壳**（非微服务），对接 **case-core** 冻 URL；持有案件总览 / Inbox / Docket / Billing UI；不另起命令名。

Owner 现状笔记：[../../mid/STATUS.md](../../mid/STATUS.md)。端口权威：`APP_PORTS.mid = 5173`。

## 1. 职责

| 职责 | 说明 |
|------|------|
| 作业总览 | Dashboard：案件队列、阶段分布、待办入口 |
| 案件库与案详 | CaseLibrary / CaseDetail（handoff / billing / audit Tab） |
| 管道与期限 | Pipeline；Docket（含 risk focus） |
| 洞察入口 | Insight tracks / innovate / layout / chain / sources（产品导航，非独立服务） |
| 组织与计费 UI | OrgSettings；Billing（一期数据仍属 case-core） |
| 跨口枢纽 | `stage/:stageId` → workbench:5174；login → iam:5177；深链到 agent/ops |

**不做**：真 SSO；真可观测；直接写 PG；把 Flow 表单搬进 mid（办理在 workbench）。

## 2. 路由面（样机 · `apps/mid/src/App.tsx`）

| 路由 | 页面意图 |
|------|----------|
| `/` | Dashboard |
| `/pipeline` | 阶段管道 |
| `/cases` | 案件库 |
| `/cases/:id` | 案详；`?tab=overview\|handoff\|billing\|audit` |
| `/docket` | 期限台；`?focus=risk` |
| `/monitor` | → `/docket?focus=risk`（重定向） |
| `/agencies` | 代理所 |
| `/insight/tracks` · `innovate` · `layout` · `chain` · `sources` | 洞察导航 |
| `/settings` · `/settings/data` · `/settings/billing` · `/settings/org` | 设置 / 数据策略 / 计费 / 组织 |
| `/billing` · `/billing/cases` | 计费面 |
| `/stage/:stageId` | 跳转 workbench 对应 stage |
| `/login` | 外链 iam |
| `/hub` | → `/` |

深链约定：案详审计 `http://localhost:5173/cases/:id?tab=audit`（ops Logs/Monitor 已对齐）。

## 3. 读 / 写边界

```text
[读]  UI → @ip/api (GET /v1/cases · /v1/cases/:id · /v1/inbox …)
        → 失败 fallback 内存 seed / AppContext
[写]  UI → AppContext.dispatchCommand(DomainCommand)
        → 可选 POST /v1/commands/dispatch（api-mock）
        → 本地 reducer + auditLog（双份 audit 裂缝见 architecture README）
```

| 边界 | 规则 |
|------|------|
| 写库 | **只**经 `DomainCommand`；禁壳内直接 mutate seed 当正式路径 |
| 读模型 | Dashboard / Inbox / CaseSummary 属 case-core 投影；中台不自建第二真相 |
| Persona | `PersonaRouteGate`；演示执法，非真 SSO |
| 跨口 | 深链用 `AppLink` / `navigateApp` / `APP_DEV_URLS`；勿对本口外路径用裸 `Link` |

## 4. 与 case-core（落地）

对齐 [../landing/backends.md](../landing/backends.md) · [../dev-spec/app-topology.md](../dev-spec/app-topology.md)：

| 中台能力 | 落地归属 |
|----------|----------|
| 案读 / Inbox / 审计 Tab | **case-core** |
| 交接 / 命令 / billing 字段 | **case-core**（billing 一期挂同 schema） |
| Docket 列表 UI | 读 docket 投影；升级意图仍 `docketEscalate` 等 DomainCommand |
| 组织设置 | iam 声明 + 租户配置；中台只 UI |
| 洞察页 | 产品面；后端可后置，勿 Day-1 拆洞察微服务 |

中台壳 **不**升级为 case-core 进程；`5180` 换真 API 后壳仍消费者。

## 5. 样机 vs 落地

| 项 | 样机今 | 落地目标 |
|----|--------|----------|
| 数据 | 内存 seed + api-mock | Postgres（case-core） |
| 跨口态 | cookie + mid bridge | 后端会话 + API；删 bridge 作同步通道 |
| 审计 | 壳内 auditLog ≠ mock store | 单源 `audit_log`；案详只读 |
| mock 建案 id | `c-mock-*` 读路径可能跳过 | 读写同库，裂缝消失 |
| 页本体 | 多 `@shared` | 可渐进迁 `apps/mid`；契约仍 `@ip/*` |

## 6. 相关链接

- [../data-flow.md](../data-flow.md) · [../data-model.md](../data-model.md)
- [../../COMMANDS.md](../../COMMANDS.md)
- [workbench.md](./workbench.md) · [cross-cutting.md](./cross-cutting.md)
