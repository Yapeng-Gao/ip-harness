# 运维面可观测 / 告警通知（样机设计）

> Owner：运维平台助手 · 边界仅 `apps/ops`（:5176）  
> 口径：样机 · 非生产可观测 · **不接**真 ELK / Prometheus / Sentry / SMTP / 短信 / Webhook，除非总控开闸。

## 现状（已落地）

| 能力 | 入口 | 实现 | 诚实边界 |
|------|------|------|----------|
| IA 六路由 | `/` `/logs` `/monitor` `/models` `/infra` `/config` | React Router + OpsShell | mock 数字/表格 |
| 业务 SLA 示意 | `/monitor` | **本地 mock 聚合示意** + 中台深链 + `DOMAIN_EVENTS` 订阅示意列表 | **非 live**；今日未订阅总线；api-mock 无 SLA 计数接口故不 fetch |
| 案详审计深链 | Logs/Monitor | `midCaseUrl` → `APP_DEV_URLS.mid/cases/:id?tab=audit` | 只读深链，不写办案 |
| 开发者告警通知 | `/config#alerts` | 邮件/短信/Webhook 表单 + sessionStorage | 试发 toast，不发真通道 |
| 通知日志事件名 | `/config#alerts` | 触发事件字段对齐 `ip.command.failed` / `ip.docket.escalated`；试发下拉 + seed 行 | 仅文案/mock 行；结果 skipped/mock；**未接总线** |
| 全局横幅 | OpsShell | 「样机·非生产可观测」 | 明示不接真可观测与出站 |

启动：`npm run dev:ops` → http://localhost:5176  
自测：`npm run typecheck -w @ip/ops`

## 数据流（样机）

```text
[办案 mid/workbench/agent] --深链只读--> [ops 监控/日志示意]
[ops /config#alerts] --试发--> Toast + sessionStorage 通知日志（含触发事件名示意）
                         \--X--> 真 SMTP / 短信网关 / Webhook
程序 error/warn --X--> Sentry / ELK（今日未接）
DOMAIN_EVENTS 常量 --只读展示--> Monitor 订阅示意 / 通知日志字段（今日未订阅）
业务 SLA mock =/= 运行时异常采集 · 非 live
```

与 [backends.md](./backends.md) 中 **notify（ops）** 行一致：今日明确不接真通道。

## 与中台联验

- 已通过：Logs/Monitor「案详审计」→ `?tab=audit` 且审计 Tab `aria-selected=true`。
- Inbox 积压 source 标签对齐中台口径：工作台 / Agent / 期限 / sla（`workbench` / `agent` / `docket` / `sla`）。
- ops **不**持有 `PatentCase`；不改闸门 / Flow / Persona。

## 建议下一步（待总控派工）

1. ~~P1：Monitor SLA 数字可选读 `@shared`/`api-mock` 示意聚合（仍标「非 live」）。~~ **已落地**：本地 mock 聚合示意 + 事件名列表；**非 live**。未为接 API 改 api-mock。
2. ~~P1：通知日志与 `ip.command.failed` / docket escalated **事件名示意**对齐（仅文案/mock 行，不接总线）。~~ **已落地**：触发事件字段 + 试发下拉 + seed。
3. 真通道 / 真可观测：**禁止**，除非总控开闸。不接真 SMTP / 短信 / Webhook / ELK / Sentry。

## 留档索引

- 应用说明：[apps/ops/README.md](../../apps/ops/README.md)
- 架构总览：[README.md](./README.md)
- 后端边界：[backends.md](./backends.md)
