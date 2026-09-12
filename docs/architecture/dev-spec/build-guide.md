# 构建指南（Day0 → MVP 骨架 · dev-spec）

> **样机诚实**：下列步骤**尚未**在仓内完成；今日可跑的是 `npm run dev:api`（api-mock）与五壳。  
> **落地目标**：按序开 PR 的施工单；**每步带可勾选验收**。框架选型（Fastify/Hono）见 [adr-decisions.md](./adr-decisions.md)——**MVP 开工前冻结**。

对齐 [../landing/roadmap.md](../landing/roadmap.md)；本篇更细、可执行。

---

## Day 0 — 环境

**做：**

- [ ] Node 与仓库 `package.json` engines 对齐；`npm install` 绿
- [ ] 本地 Postgres（Docker Compose 建议）空库可连
- [ ] 本地 Redis 可 `PING`
- [ ] 选并**文档冻结** HTTP 框架：Fastify **或** Hono（写入 ADR 勾选）
- [ ] 约定 env 前缀（如 `IP_DATABASE_URL` / `IP_REDIS_URL` / `IP_OIDC_*`）；**不**提交密钥
- [ ] 读完 [README.md](./README.md) 阅读顺序与 [api-contracts.md](./api-contracts.md) 冻 URL

**验收：**

- [ ] `psql`（或客户端）连上空库；`redis-cli PING` → PONG
- [ ] ADR 中 Fastify/Hono 一行已勾「已冻」
- [ ] 五壳 + api-mock 仍能按根 README 启动（回归未破坏样机）

---

## Step 1 — `services/case-core` 骨架

**做：**

- [ ] 建 `services/case-core` workspace 包；依赖 `@ip/contracts`、`@ip/domain`
- [ ] HTTP 骨架挂载：`GET /health`（`mock:false`, `service:case-core`）
- [ ] 开发监听 **5180**（或 env 标明替换 api-mock；双跑时勿两写）
- [ ] 目录边界：`http/` · `db/` · `domain/`（只调 domain，不复制规则）
- [ ] CI/本地脚本：`npm run dev:case-core`（名可调，写进 docs/COMMANDS 或 package scripts）

**验收：**

- [ ] `curl -s localhost:5180/health` → `ok:true`, `mock:false`
- [ ] 包能 `tsc`/测试空跑绿
- [ ] **未**改 apps 业务页；**未**删 api-mock（可并存）

---

## Step 2 — 迁 dispatch（去双写目标）

**做：**

- [ ] 实现 `POST /v1/commands/dispatch`：解析 `DomainCommand` + `CommandMeta`
- [ ] 调用 `@ip/domain`：`evaluateGuardrails` / `canPerformHandoff`（相对 api-mock **升级执法**）
- [ ] 内存或 PG 事务写案（本步可先内存，Step 3 换 PG——但接口形状一次到位）
- [ ] 返回 `CommandResult`；错误码按 [api-contracts.md](./api-contracts.md) §4
- [ ] 壳切换计划：feature flag 指向 case-core；成功路径计划关闭 `dispatchCommandLocal` 真相角色

**验收：**

- [ ] `curl` POST `submitResearch` 等白名单命令 → `ok` 与领域规则一致（非法交接被拒）
- [ ] 未知 `type` → 400
- [ ] 文档/PR 写明：切换日之后 **禁止**「HTTP 成功 + local 再写一份真相」长期并存
- [ ] 现有 e2e L0 对冻 URL 有更新计划或已绿（指向新服务时）

---

## Step 3 — Postgres

**做：**

- [ ] Migration：至少 `tenants`（可种子）、`cases`、`handoffs`、`commands`、`audit_log`（见 [data-model.md](./data-model.md)）
- [ ] seed：从样机 cases 导入一版可演示数据
- [ ] `GET /v1/cases` · `GET /v1/cases/:id` · `GET /v1/inbox` 读 PG 投影
- [ ] dispatch 同事务写 cases/handoffs + commands + audit_log；强制 `AUDIT_SCHEMA_VERSION`
- [ ] 建案 id 可被列表读到（消「仅 API 有则跳过」）

**验收：**

- [ ] **杀进程重启**后 cases/audit 仍在
- [ ] `GET /v1/cases/:id` 404 语义保留
- [ ] 双份 audit 不再作为产品真相（壳改为读 API 或明确废弃）
- [ ] 租户列存在；即便 MVP 单租户也写入 `tenant_id`

---

## Step 4 — Redis / outbox

**做：**

- [ ] `notify_outbox` 表（或 Redis Stream + PG 日志）
- [ ] command 成功后写入 `ip.command.dispatched` / `ip.handoff.changed` 等
- [ ] 最小 worker：claim → 打日志或假通道（真 SMTP 可后置，但队列要通）
- [ ] docket：`docket_events` + 扫描 job（到期 → 出站或 `docketEscalate`）

**验收：**

- [ ] 人为插入到期 docket → 扫描跑一次 → outbox 或命令痕迹可见
- [ ] worker 崩溃重试不丢 pending（至少 at-least-once + 幂等键）
- [ ] outbox payload **无**完整 PatentCase 大对象

---

## Step 5 — `agent-session` 接 DSH 或 Codex spike

**做：**

- [ ] `services/agent-session` 模块（可同进程）：会话 CRUD 建议路由
- [ ] 表 `agent_sessions` / `hitl_gate_clears`
- [ ] Spike：**二选一或双适配** DeepSeek Harness (DSH) **或** Codex app-server
- [ ] ConfirmBar 确认 → **只** `POST /v1/commands/dispatch`（`actor:agent`）；禁 runtime 直写 PG
- [ ] LangGraph 若出现：仅子图，文档标明非默认 runtime
- [ ] 试运行模式不写 handoffs

**验收：**

- [ ] Spike README：如何起 sidecar、如何映射 approval↔ConfirmBar
- [ ] 一次 HITL 确认在 PG `commands` + `audit_log` 可见且 `meta.actor=agent`
- [ ] runtime 进程环境**无** `IP_DATABASE_URL`
- [ ] 失败命令可走 `ip.command.failed` outbox（可先断言行存在）

---

## Step 6 — IAM OIDC 空态

**做：**

- [ ] 选可私有化 IdP（Keycloak / Authentik 等）本地容器
- [ ] case-core 中间件验 JWT；无 token → 401
- [ ] 声明映射：`sub` · `tenant_id` · `persona_id`（与 `persona_bindings`）
- [ ] iam 壳：登录跳转 / 回调空态页（不伪装已完成企业 SSO 产品化）
- [ ] 明确：**cookie Persona 不是生产鉴权**

**验收：**

- [ ] 无 `Authorization` 调 dispatch → **401/403**
- [ ] 合法 token + 错租户案 id → 403
- [ ] 文档演示：如何用 device/password 拿 token 调 curl
- [ ] 样机 cookie 路径仍可标「仅 UX」，不作为 API 信任源

---

## 总验收（MVP 切片可宣称时）

- [ ] 冻五 URL 行为与 [api-contracts.md](./api-contracts.md) 一致（含鉴权）
- [ ] 重启不丢案与审计
- [ ] 去双写：壳成功路径只认服务端
- [ ] 最小提醒/到期链路可演示
- [ ] Agent spike 证明 C 混合闸，而非 LangGraph 默认 runtime
- [ ] **未**宣称真微服务网格 / 真全通道 SMTP / 真生产 SSO 完成

---

## 相关链接

- [app-topology.md](./app-topology.md) · [adr-decisions.md](./adr-decisions.md)
- [../landing/roadmap.md](../landing/roadmap.md) · [../landing/stack.md](../landing/stack.md)
- [../../COMMANDS.md](../../COMMANDS.md) · [../../HARNESS.md](../../HARNESS.md)
