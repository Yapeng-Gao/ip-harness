# 技术栈选项与推荐默认

> **样机诚实**：今日栈 = Vite/React 多壳 + TypeScript monorepo + Node 内置 `http` 的 `api-mock` + 浏览器内存 / cookie；无 Postgres、无 Redis、无 OIDC、无对象存储、无 OTel 采集。  
> **落地目标**：选可私有化、与现仓 TypeScript 一致、能从 `api-mock` 渐进替换的默认栈；对比项供评审，**推荐默认**见文末。

## 1. 对比表

### 1.1 API / 网关

| 选项 | 优点 | 风险 / 成本 | 私有化 | 与样机关系 |
|------|------|-------------|--------|------------|
| **Node/TS（Fastify 或 Hono）同仓 `services/`** | 与 `@ip/domain` / contracts 零语言缝；可复用类型 | 需自建结构 | 优 | **直接替换 api-mock 进程** |
| NestJS | 模块边界清晰、团队熟悉度高 | 偏重；样机节奏略慢 | 优 | 可，但一期偏厚 |
| Go / Java 独立服务 | 性能/企业存量 | 双语言契约同步痛；违背「与 monorepo 一致」 | 优 | 后期可混，不建议起步 |
| 云 API Gateway + Lambda | 弹性 | 私有化差；本地联调碎 | 差 | 不适合样机→私有化主线 |
| 仅反向代理（Caddy/Nginx）无 BFF | 简单 | 鉴权/聚合仍要有人做 | 优 | 可作边缘，不能代替 command 服务 |

### 1.2 数据库

| 选项 | 优点 | 风险 / 成本 | 私有化 | 与样机关系 |
|------|------|-------------|--------|------------|
| **PostgreSQL** | 事务强；JSONB 适合投影/审计；生态成熟 | 要迁移与备份纪律 | 优 | 替内存 store / seed |
| SQLite（嵌入） | 单机演示快 | 多实例/租户弱 | 优（单机） | 仅本地 demo，不宜生产默认 |
| MongoDB | 文档灵活 | 交接状态机+审计更爱关系+约束 | 优 | 非默认 |
| 云托管专有库 | 省运维 | 私有化/国产化受限 | 差～中 | 可选适配层，非默认 |

### 1.3 队列 / 缓存

| 选项 | 优点 | 风险 / 成本 | 私有化 | 与样机关系 |
|------|------|-------------|--------|------------|
| **Redis（队列 + 缓存 + 简易 scheduler 辅助）** | 一组件多用途；BullMQ/类似库成熟 | 要持久化与 failover 规划 | 优 | 填「无 bus / 无调度器」洞 |
| Postgres LISTEN/NOTIFY + SKIP LOCKED | 少依赖 | 吞吐与生态工具少 | 优 | MVP 可作 docket 备选 |
| Kafka / Pulsar | 大规模事件 | 运维重；样机过杀 | 中 | 生产后期可选 |
| 无队列（纯同步） | 简单 | **提醒/到期升级做不成真** | — | **即今日样机局限** |

### 1.4 鉴权

| 选项 | 优点 | 风险 / 成本 | 私有化 | 与样机关系 |
|------|------|-------------|--------|------------|
| **OIDC（Keycloak / 企业 IdP / Authentik 等）** | 标准；Persona/租户可映射 claim | 要对接与会话刷新 | 优 | 替 cookie Persona 假会话 |
| 自研 JWT + 密码表 | 快 | 安全债；无 SSO | 优 | 仅内测，勿当生产默认 |
| 云 Cognito / Auth0 | 省事 | 私有化/数据驻留 | 差～中 | 公有云部署可选 |
| 继续 cookie Persona | 零成本 | **不是鉴权** | — | **仅样机** |

### 1.5 文件 / 对象存储

| 选项 | 优点 | 风险 / 成本 | 私有化 | 与样机关系 |
|------|------|-------------|--------|------------|
| **S3 兼容（MinIO / 企数仓）** | 证据包、附件、导出；API 标准 | 要生命周期与加密 | 优 | 今日附件多在内存/静态 |
| 本地磁盘 PVC | 简单 | 多副本一致性差 | 优（单机） | 开发可用 |
| 仅 DB bytea | 少组件 | 备份膨胀 | 优 | 小文件权宜，非默认 |

### 1.6 可观测

| 选项 | 优点 | 风险 / 成本 | 私有化 | 与样机关系 |
|------|------|-------------|--------|------------|
| **OpenTelemetry → 自建/兼容后端（Jaeger/Tempo + Prometheus + Loki 等）** | 厂商中立；与 `DOMAIN_EVENTS`/HTTP 可同迹 | 要采集端与存储 | 优 | 替 ops mock 数字 |
| 仅应用日志文件 | 简单 | 无追踪关联 | 优 | 低于 MVP 门槛 |
| 云 APM SaaS | 快 | 私有化差 | 差 | 可选 |
| ops 壳 mock | 演示 IA | **非 live** | — | **今日诚实状态** |

---

## 2. 推荐默认栈（落地目标）

| 层 | 默认 | 理由（短） |
|----|------|------------|
| 语言 / 运行时 | **TypeScript · Node** | 与 monorepo、`@ip/domain`、contracts 一致；api-mock → `services/` 渐进 |
| API | **Fastify 或 Hono**（择一冻）+ 同仓 `services/` | 轻；一期单体多模块，对齐 [../repos-and-vcs.md](../repos-and-vcs.md) |
| 网关 / 边缘 | 开发用现端口；生产 **Nginx/Caddy** 终止 TLS | 不引入重网关产品 |
| DB | **PostgreSQL** | 命令事务 + 审计追加 + JSON 投影 |
| 队列 / 缓存 | **Redis**（缓存 + 任务队列；docket/notify 异步） | 一次解决「无调度器 / 无出站缓冲」 |
| 鉴权 | **OIDC** | 可私有化 IdP；声明进办案服务 |
| 文件 | **S3 兼容对象存储** | 证据包/附件；MinIO 可私有化 |
| 观测 | **OpenTelemetry** + 可自托管后端 | 对齐 ops 目标，不绑云 |
| 契约 | 继续 **`@ip/contracts`** | URL/命令名/事件名单源 |

### 样机 → 生产渐进

1. **原型（今）**：`api-mock` 内存 + 壳 fallback；契约已冻。  
2. **MVP**：同仓 `services/case-core`（可先单进程）接 Postgres；读/写 URL 不变；Redis 上 docket 扫描 + notify 队列；OIDC 最小回路；OTel 打通 traces。  
3. **生产**：按需拆进程；对象存储；密钥保险库；队列高可用；禁再双写浏览器 handler。

### 明确不选为默认（除非硬约束）

- 起步多语言微服务网  
- 无队列硬撑「到期提醒」  
- 把 cookie Persona 写成生产 SSO  
- 绑死单一公有云专有 API 而无法私有化

## 3. 相关链接

- [backends.md](./backends.md) · [roadmap.md](./roadmap.md)
- [../repos-and-vcs.md](../repos-and-vcs.md) · [../ops-observability.md](../ops-observability.md)
- [../../../apps/api-mock/README.md](../../../apps/api-mock/README.md)
