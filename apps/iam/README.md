# apps/iam · IAM 薄壳

Phase 0 原型：登录 / 工作区 / Persona 切换面。复用共享 `Login`、`PersonaSwitcher`、`WorkspaceMenu`，在本 app 内用包装层补齐文案、空态与跨口绝对深链。

## 诚实边界（非真 SSO）

- **不是**真实 SSO / OIDC / SAML；无企业 IdP、无令牌交换、无真 SSO 会话 cookie。
- Persona / 工作区写入的是**样机 cookie**（`CROSS_PORT_PERSONA_COOKIE` / `CROSS_PORT_WORKSPACE_COOKIE`），仅演示跨口身份态，**不是**真 SSO 会话 cookie。
- `/login` 顶部醒目标明「演示登录 · 非真 SSO / 非 OIDC」。
- 旁侧 **OIDC 空态**：说明「可接企业 IdP / OIDC，当前未接入」；示意按钮禁用，勿假装已接通。
- 选租户后共享 Login 的 multi-app 仍跳 mid / agent 根；包装层另提供 `?return=` / `?next=` 绝对深链回跳区（经 `isAllowedReturnUrl` 校验）。

### P2 真 IAM（占位 · 未排期）

企业 IdP、令牌交换、真会话 cookie —— 仅文档/空态占位，**未排期实现**。

## 跨口 / 存储（分口径）

常量唯一源：`@ip/contracts` `crossPortKeys`（本壳 `src/storageKeys.ts` 仅 re-export）。

| 机制 | Key | 能力 |
|------|-----|------|
| Cookie · localhost 跨端口（**样机**） | `ip_harness_persona` / `ip_harness_workspace` | Persona / 工作区真跨口；**非** SSO 会话 |
| localStorage · 同 origin+port | `ip-harness.cross.v1.snapshot` 等 | 同口多 tab；**不**跨端口共享 |
| BroadcastChannel | `ip-harness-cross-port-v1` | 同口 tab |
| mid bridge iframe | `crossPortBridgeHref()` → `${APP_DEV_URLS.mid}/__cross_port_bridge.html` | 跨口大块态（须 mid 在跑） |

**禁止**文案「各业务 app 同一套 localStorage」。cookie 跨口 vs 同口 LS 分口径；全量案件态跨端口依赖 mid bridge 或 `dev:legacy` 同口，非共享后端。

## 绝对深链（`src/lib/deepLinks.ts`）

与 agent `absDevUrl` 同模式：`midHref` / `workbenchHref` / `agentHref` / `opsHref` / `iamHref` 全部基于 `APP_DEV_URLS`；`resolveReturnUrl` 读 `return`|`next` 并校验前缀。页面内跨口 `<a href>` 禁止裸拼或硬编码端口。

## 字体

与 mid / workbench / agent / ops 一致：`main.tsx` 仅 `import '@shared/index.css'`（PingFang SC / 系统栈），不另起字体栈。字号对齐根 type scale（用 `text-xs`，不用 `text-[10px]` / `text-[11px]`）。

## 路由

| 路径 | 说明 |
|------|------|
| `/` | 首页：当前工作区 + Persona 切换 + 跨 app 绝对入口；顶栏标明非真 SSO |
| `/login` | 包装页：横幅 + OIDC 空态 + 共享 `<Login />` + 绝对深链回跳区 |

## 启动

在 **repo 根**：

```bash
npm run dev:iam
```

→ http://localhost:5177

```bash
npm run typecheck -w @ip/iam
```

## 改动边界

优先只改 `apps/iam/**`。跨口常量归属 `packages/contracts`；共享 AppContext / Login 增强由共享层落地。

## Owner 自检

- **Owner**：IAM应用助手 · 仅 `apps/iam` · `:5177`
- **身份空态**：OIDC 未接入（禁用按钮）· 样机 cookie ≠ SSO · P2 占位
- **路由**：`/` · `/login` · deepLinks 绝对回跳
- **怎么验**：
  - `npm run dev:iam` → http://localhost:5177
  - 目视顶栏 / OIDC 空态（首页与登录页均可见，无需先进 `/login`）
  - 可选 `npm run typecheck -w @ip/iam`（若共享迁移导致间接红，**不记本域债**）
- **已知不在本域**：共享 Login 不读 `return`（包装层另回跳）；真 IdP / 会话归 P2
