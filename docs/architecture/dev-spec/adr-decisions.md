# ADR / 已拍板决策（dev-spec）

> **样机诚实**：下列决策指导**尚未落地**的实现；仓内仍跑 api-mock + 浏览器执法。  
> **落地目标**：开发开 PR 时勿重开已拍板项；未冻项（Fastify vs Hono）须在 MVP 开工前勾选。

继承 [../landing/](../landing/) 与 [../enterprise/](../enterprise/)；冲突时以 enterprise 对 Agent runtime 的修订为准（**DSH/Codex 优先**，LangGraph 降档）。

---

## 已拍板

### ADR-001 · 默认技术栈

| 层 | 选择 | 状态 |
|----|------|------|
| 语言 | TypeScript · Node | **已拍板** |
| DB | PostgreSQL | **已拍板** |
| 队列/缓存 | Redis | **已拍板** |
| 鉴权 | OIDC（可私有化 IdP） | **已拍板** |
| 对象存储 | S3 兼容（如 MinIO） | **已拍板** |
| 观测 | OpenTelemetry | **已拍板** |
| 契约 | 继续 `@ip/contracts` / `@ip/domain` | **已拍板** |

依据：[../landing/stack.md](../landing/stack.md)。

### ADR-002 · Agent runtime = C 混合（DSH 和/或 Codex）

- **① runtime**：DeepSeek Harness（DSH）**和/或** OpenAI Codex app-server。  
- **自有**：Persona、HITL ConfirmBar、`DomainCommand` / `TOOL_TO_COMMAND`。  
- **LangGraph**：仅可选 **② 领域子图**，**禁止**写回「默认 runtime = LangGraph」。  
- 任何开源 runtime **不保证**业务 Agent 质量。

依据：[../enterprise/agent-platform.md](../enterprise/agent-platform.md) · [../enterprise/agent-runtime-options.md](../enterprise/agent-runtime-options.md)。

### ADR-003 · 禁 Agent 直写库

- Agent / sidecar / 工具沙箱：**无**办案 PG 凭据。  
- 凡改交接、阶段、Docket、发票、派所、建案 → 只经 `POST /v1/commands/dispatch`。  
- `meta.actor: 'agent'`；审计强制 `AUDIT_SCHEMA_VERSION`。

依据：[../../HARNESS.md](../../HARNESS.md) · [../../COMMANDS.md](../../COMMANDS.md) · enterprise 硬规则。

### ADR-004 · 一期 `services/` 同仓

- MVP 在本 monorepo 建 `services/`；**不是** Day-1 多仓微服务网格。  
- 后续再按 [../repos-and-vcs.md](../repos-and-vcs.md) 演进。

### ADR-005 · 冻 URL / 命令名 / 事件名 / 端口常量

- URL 五条见 [api-contracts.md](./api-contracts.md)。  
- `DomainCommand` / `CommandName` / `DOMAIN_EVENTS` / `APP_PORTS` 变更 = 破坏性，全壳+e2e 同 PR。  
- 新增命令/事件：**先改** `@ip/contracts`。

### ADR-006 · `workbench-command` 一期并入 case-core

- 保留逻辑边界与目录注释；无第二套命令名。

### ADR-007 · 开发 API 口默认 5180

- 用 case-core **同口替换** api-mock 为默认；双跑对照须单写真相。

---

## MVP 开工前必须冻结

### ADR-008 · HTTP 框架：Fastify **或** Hono

| 选项 | 倾向 |
|------|------|
| Fastify | 插件生态、schema；略重 |
| Hono | 轻、边缘友好；与样机节奏近 |

landing REVIEW 已记「非阻塞：MVP 冻 Fastify/Hono」。  

**开工前勾选（只留一个）：**

- [ ] Fastify
- [ ] Hono

冻结后写入 `services/case-core/README.md` 首段；禁止同 PR 无故对打两套。

---

## 明确拒绝 / 缓议

| 项 | 结论 |
|----|------|
| Day-1 Kafka 网格 | 缓；MVP 用 PG outbox + Redis |
| 起步多语言重写 domain | 拒绝 |
| cookie Persona 当生产鉴权 | 拒绝 |
| Agent 直连 `UPDATE cases` | 拒绝 |
| 默认 runtime = LangGraph | **废止**（曾出现在旧 enterprise 口径） |
| 把 api-mock 对外称生产 | 拒绝 |
| 改 `apps/ops` 业务页预埋假后端 | 拒绝（纪律） |

---

## 决策日志（短）

| 日期（用户区） | 项 | 结论 |
|----------------|----|------|
| 2026-09（landing 评审通过） | 七面 + 栈 + 冻 URL | 通过 |
| 2026-09（enterprise 再评） | C + DSH/Codex；LangGraph 降档 | 通过 |
| 本目录建立时 | 开发前规格包；框架二选一待勾 | 本文 |

（精确 git SHA 以 landing/enterprise 的 REVIEW 为准，推仓后回填。）

---

## 相关链接

- [README.md](./README.md) · [build-guide.md](./build-guide.md)
- [../landing/REVIEW.md](../landing/REVIEW.md) · [../enterprise/REVIEW.md](../enterprise/REVIEW.md)
