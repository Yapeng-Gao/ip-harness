# 应用拓扑与 `services/` 目录（dev-spec）

> **样机诚实**：今日无 `services/`；进程真相 = 五 Vite 壳（5173–5177）+ `apps/api-mock`（5180 内存）。  
> **落地目标**：同仓长出 `services/`；进程边界对齐 landing 七面；端口建议继续 `5180` 替换 api-mock，或显式标注网关迁移；与 `APP_PORTS` 五壳对照清楚。

## 1. 建议目录树（一期同仓）

```text
services/
  case-core/                 # 案件聚合 · command · handoff · audit · 案读
    package.json             # @ip/case-core（或 services/case-core）
    src/
      http/                  # 冻 URL 路由（health/cases/inbox/dispatch）
      domain/                # 调 @ip/domain；不复制规则
      db/                    # PG repos（cases / handoffs / audit_log / commands）
      projections/           # CaseSummary / Inbox 投影
  workbench-command/         # 【一期建议并入 case-core】Flow 进度读模型；无新命令名
  agent-session/             # 会话 · HITL 闸 · DSH/Codex sidecar 适配
    src/
      http/                  # /v1/agent/sessions · gate clear（建议）
      runtime/               # DSH 和/或 Codex app-server 客户端
      db/                    # agent_sessions · hitl_gate_clears
  iam/                       # OIDC 验签 · 租户/Persona 声明；不持 PatentCase
  notify/                    # outbox 消费 · 最小通道；不持 PatentCase
  docket/                    # 期限事件 · 扫描 worker；升级仍走 DomainCommand
  ops/                       # 配置/密钥引用 · 健康聚合 · OTel 导出钩子
  shared/                    # （可选）pg 池 · redis · otel bootstrap · 错误码
```

对齐 [landing/backends.md](../landing/backends.md)：七面名不另起。billing 一期可挂 `case-core` schema，不单开服务。

## 2. 进程边界

| 落地名 | 职责摘要 | 一期形态 | 持有写权 |
|--------|----------|----------|----------|
| **case-core** | 唯一办案写：`POST /v1/commands/dispatch`；案/handoff/audit；案读与 Inbox 投影 | **必做进程或单体入口** | Case 聚合、audit、commands |
| **workbench-command** | Flow/阶段编排与 `flowProgress` 读模型 | **一期并入 case-core**（目录可留边界注释） | 仅进度投影；命令仍落 case-core |
| **agent-session** | `AgentSession`、HITL 闸、试运行/正式分界；调 DSH/Codex | MVP 可同进程模块 → 再拆 | 会话/闸；**无** Case 写 |
| **iam** | OIDC、租户、Persona 声明下发 | MVP 空态验 JWT | 用户/租户/persona_bindings |
| **notify** | 出站与用户提醒；消费事件/outbox | MVP worker 可挂 case-core 同机 | `notify_outbox` 状态；不存完整案 |
| **docket** | `docket_events`、到期扫描、升级意图 | MVP 同机模块 + Redis/DB job | docket 行；升级经 command |
| **ops**（ops-platform） | 配置/密钥引用、健康、OTel | MVP 薄；真观测跟采集 | 配置元数据；不持案 |

### 一期单体模块 vs 多进程

| 模式 | 何时 | 怎么跑 |
|------|------|--------|
| **推荐起步：单进程多模块** | Day0–MVP 前半 | 一个 Node 入口挂载 case-core HTTP + 内嵌 docket 扫描 + notify outbox poller + agent-session 路由；逻辑分包防循环依赖 |
| **双进程** | Agent spike 要 sidecar 隔离 | `case-core`（含读写 API）+ `agent-runtime`（DSH/Codex sidecar）；会话 API 可仍在主进程 |
| **多进程** | 生产或明确负载 | 按上表拆；共享 PG schema / Redis；**禁止**各进程各写一份 `CommandName` |

硬规则：无论几进程，**办案写库连接串只给 case-core**（Agent/runtime/工具沙箱无 PG 凭据）。

## 3. 端口建议

### 3.1 继续对齐 `APP_PORTS`（开发）

| 常量 | 端口 | 角色 | 落地变化 |
|------|------|------|----------|
| `mid` | 5173 | 中台壳 | 不变；消费者 |
| `workbench` | 5174 | 办理台壳 | 不变 |
| `agent` | 5175 | Agent 壳 | 不变；会话改打真 API |
| `ops` | 5176 | 运维壳 | 不变 |
| `iam` | 5177 | IAM 薄壳 | 接 OIDC 回调/空态 |
| `api` | **5180** | 今日 api-mock | **MVP：同一端口换成 case-core（或网关反代到 case-core）** |

权威：`packages/contracts/src/ports.ts`。改端口含义须全壳 + e2e 同 PR。

### 3.2 替换 api-mock 的两种标法

| 方案 | 说明 | 推荐 |
|------|------|------|
| **A. 同口替换** | `services/case-core` 监听 `5180`；停掉 `apps/api-mock`；`APP_DEV_URLS.api` 不变 | **MVP 默认** |
| **B. 新口 + 标注** | case-core 如 `5181`，文档与 env 写明「替换 api-mock」；壳改 `VITE_IP_API_BASE` | 仅当需双跑对照期 |

双跑对照期允许短暂两进程，但**写开关只能指向一个真相**（去双写目标，见 [build-guide.md](./build-guide.md)）。

### 3.3 可选内部端口（多进程时）

| 进程 | 建议开发口 | 备注 |
|------|------------|------|
| case-core（对外 API） | 5180 | 对壳唯一 |
| agent-session（若拆） | 5182 | 经网关或 BFF；壳勿散打 |
| DSH / Codex sidecar | 由 spike 文档定（如 8080/本地 socket） | **不对五壳直接暴露** |
| iam（若拆） | 5183 | 或只做中间件验签，无独立口 |

生产用 Nginx/Caddy 终止 TLS，主机名替代 localhost 端口；`APP_PORTS` 仍只服务本地联调语义。

## 4. 与五壳的关系

```text
mid / workbench / agent / ops / iam  (Vite · APP_PORTS)
        │  @ip/api · fetch
        ▼
   API :5180  (今日 api-mock → 明日 case-core / 网关)
        │
        ├── case-core 模块（command + read）
        ├── agent-session（HITL → 再 POST dispatch）
        ├── iam 中间件（JWT/OIDC claims）
        └── 异步：docket worker · notify outbox
```

- 壳 **不是**微服务；不把 mid/workbench 升级成服务。
- ops 壳只读配置/指标深链，**不**持 `PatentCase`。
- iam 壳今日空态占位；落地后只负责登录/换 Persona UI，办案鉴权在服务端。

## 5. 仓库落点

- 一期：`services/` 进**本 monorepo**（对齐 [repos-and-vcs.md](../repos-and-vcs.md)）。
- workspace 依赖：`@ip/contracts`、`@ip/domain`（执法不重写）。
- `apps/api-mock`：MVP 切换日后标 deprecated 或改为 thin shim；勿对外称生产。

## 6. 相关链接

- [architecture.md](./architecture.md) · [api-contracts.md](./api-contracts.md) · [build-guide.md](./build-guide.md)
- [../landing/backends.md](../landing/backends.md) · [../landing/stack.md](../landing/stack.md)
- [../../../apps/api-mock/README.md](../../../apps/api-mock/README.md)
