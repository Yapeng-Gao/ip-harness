# iam · 身份 / 租户 / Persona（:5177）

> **样机诚实**：`apps/iam` 是 Login / Persona / 工作区**薄壳**；挂 `AppProvider` 但不做真 SSO；跨口靠 `CROSS_PORT_PERSONA_COOKIE` / `CROSS_PORT_WORKSPACE_COOKIE`（localhost）。  
> **落地目标**：**iam** 服务面做 OIDC 验签、租户与 Persona 声明下发；各壳消费 JWT/会话，**不再**用可改 cookie 当身份真相；iam **不持** `PatentCase`。

端口：`APP_PORTS.iam = 5177`。路由样机：`/` · `/login`（`apps/iam/src/App.tsx`）。

## 1. 职责

| 职责 | 说明 |
|------|------|
| 登录 UI | 样机选 Persona / 工作区；落地接 IdP（OIDC） |
| Persona 切换 | `PersonaId`：`enterprise_ip` \| `agency` \| `inventor` \| `committee`（`@ip/contracts`） |
| 工作区 | demo workspace 选择；落地映射租户 / org |
| 声明下发 | 落地：iss/aud/tenant/persona/roles；壳只读 claims |

**不做**：办案命令执法；持有案件库；替代 case-core 鉴权（落地鉴权在服务端）。

## 2. 与各壳会话

| 壳 | 样机今 | 落地目标 |
|----|--------|----------|
| mid / workbench / agent | `PersonaRouteGate` 读 cookie / context | 同一会话 cookie/Bearer；闸改为服务端声明 + 前端只读 |
| ops | 基本无 Persona 办案闸 | 运维角色可另声明；仍不持案 |
| iam | 写 cookie | 登录回调 / 换票 / 登出；可选薄 BFF |

演示可执法（样机）≠ 生产授权。审计 `actor` 仍须可区分 `user` / `agent`。

## 3. cookie → 真会话迁移

```text
今日：iam UI → 写 host-only cookie → 各壳读 Persona/workspace
      + mid bridge 同步大块态（非身份）

目标：IdP (OIDC) → iam/回调 → 会话（HttpOnly / JWT）
      → 各壳 @ip/api 带凭证 → case-core / agent-session 验签
      → 删除「cookie 当身份真相」与 bridge 同步通道
```

| 步骤 | 内容 |
|------|------|
| 1 | 冻 PersonaId / 路由闸语义（勿另起 id） |
| 2 | MVP：OIDC 空态验 JWT（dev-spec）；壳改读 Authorization |
| 3 | 租户与 persona_bindings 落库（iam 面） |
| 4 | 关掉跨口 persona cookie 写入路径；e2e 改登入流 |
| 5 | mid bridge 仅过渡期；大块态改 API |

## 4. 样机 vs 落地

| 项 | 样机今 | 落地目标 |
|----|--------|----------|
| SSO | 无 | OIDC（可关的私有化 IdP） |
| 会话 | cookie 可手工改 | 签名会话；防伪 |
| 多租户 | workspace 示意 | tenant 隔离（enterprise） |
| 与 Agent | Persona 影响可见性 / 建议 | 同声明进 CaseContext；Agent 不自签身份 |

## 5. 相关链接

- [../data-flow.md](../data-flow.md)（§ Persona / cookie）
- [../dev-spec/app-topology.md](../dev-spec/app-topology.md)（iam 进程）
- [../enterprise/README.md](../enterprise/README.md)（多租户 / 安全）
- [cross-cutting.md](./cross-cutting.md)
