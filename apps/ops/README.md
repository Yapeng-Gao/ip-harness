# apps/ops · 运维面（样机 · 非生产可观测）

可点击 IA 原型，**不接**真 ELK / Prometheus / GPU 集群，**不改**办案面。

## 启动

```bash
npm run dev:ops
```

→ http://localhost:5176（根 `package.json` 已有 `dev:ops`，勿改）

类型检查：

```bash
npm run typecheck -w @ip/ops
```

## IA 路由（BrowserRouter）

| 路径 | 页面 |
| --- | --- |
| `/` | 总览 Overview（健康摘要 + 快捷入口 + 中台深链） |
| `/logs` | 日志平台（应用 / 审计示意 / 登录越权 / Agent·HITL） |
| `/monitor` | 监控（服务健康 + 业务 SLA） |
| `/models` | 模型监控 |
| `/infra` | 基础设施 |
| `/config` | 配置 / 密钥 / License / runbook + **通知渠道**（锚点 `#alerts`） |
| `*` | `Navigate` → `/` |

侧栏（窄屏为顶栏）覆盖以上分区。顶栏保留 `<AppSurfaceLinks current="ops" />`。

## 中台深链

作业中台端口见 `@ip/contracts` `APP_DEV_URLS.mid`（5173）：

- Inbox：`/`
- Docket：`/docket`
- Billing：`/billing`
- 案详审计：`/cases/:id?tab=audit`（中台同步就绪后可用；未就绪时仍落到案详）

## 通知渠道（开发者告警样机）

- 入口：侧栏「配置」页内「通知渠道」区块，或 Overview 快捷入口 → `/config#alerts`。
- 渠道：邮件 / 短信 / Webhook。字段与「保存」仅 **local state / sessionStorage**，文案标明不落真实通道。
- 「试发」→ Toast「样机不发真邮件/短信」（Webhook：「样机不发真 Webhook」）并追加本地通知日志（`skipped` / `mock`）。可选手动 / `ip.command.failed` / `ip.docket.escalated` 作为触发事件示意（常量来自 `@ip/contracts`，未接总线）。sessionStorage 空时预置 seed 行。
- **不接**真 SMTP / 短信网关 / Webhook 出站；程序 error/warn **未接** Sentry/ELK；业务 SLA 为本地 mock 聚合示意 · **非 live**，≠ 运行时异常监控。

## 边界

- 只改本目录。禁止改 `apps/mid|workbench|agent|iam` 及办案主路径。
- `packages/contracts` 只读引用（端口、`DOMAIN_EVENTS`、`AUDIT_SCHEMA_VERSION` / `CASE_CONTEXT_SCHEMA_VERSION`）。
- 数字与表格均为本地 mock；过滤 / 导出 / 开关不落真实后端。
- 导出按钮提示「样机不落真实导出」。
- 不削弱 Persona / guardrails，不实现发布流水线或真可观测。
- 不接真 SMTP / 短信 / Webhook；通知仅为诚实样机。
