# 工作台 Owner 状态（apps/workbench · :5174）

> Owner：工作台应用助手 · 章程见 [TEAM_CHARTER.md](../TEAM_CHARTER.md)  
> 更新：2026-09-12 · 所有权见 [OWNERSHIP.md](./OWNERSHIP.md) · 可卖节点见 [STAGE_MODULE_SKU.md](./STAGE_MODULE_SKU.md)

## 边界

- **只改** `apps/workbench`（+ 本目录 docs）
- 共享：`@ip/contracts`（handoff keys/labels · ports）、`@ip/domain`（types · guardrails · handoff 逻辑 · getStageMeta）
- context / UI / seeds / hooks：**暂留** `@shared/*`（等 `@ip/app-state` 稳后再迁）
- **勿动** mid / agent / ops / iam / 根掏空
- **根 `src/pages/workbench`**：legacy only — 非本 app 所有；勿盲目 sync-copy（见 OWNERSHIP.md）

## 已完成

| 项 | 说明 |
|----|------|
| 壳 + 路由 | `npm run dev:workbench` → http://localhost:5174 · `/workbench/*` · `/inventor` |
| Flow 迁入 | `src/flows/{research,intake,draft,prosecution,maintain,monetize,watch,layout,home,inventor}` |
| P1 stages 边界 | `src/stages/*` + `STAGE_MODULES`（re-export；业务仍在 flows）；`App.tsx` 仅从 `./stages` 导入 |
| flows 桶 | `flows/index.ts` 标为 internal/deprecated；公共面只有 `stages/` |
| P0 跨口深链 | 相对路径 + `AppLink`/`navigateApp`；fallback「回作业中台」用 `AppLink to="/"`（无本地 `APP_DEV_URLS` fork） |
| domain 直连 | types/guardrails/handoff 逻辑/getStageMeta → `@ip/domain`；labels → `@ip/contracts` |
| 字体 | `main.tsx` → `@shared/index.css`（与根统一，无第二套 webfont） |
| 所有权文档 | `docs/workbench/OWNERSHIP.md`（stages vs root pages · InventorPortal） |
| Stage SKU 规格 | [STAGE_MODULE_SKU.md](./STAGE_MODULE_SKU.md)（可卖=模块+授权，非默认拆壳） |

## 怎么验

```bash
npm run dev:workbench          # http://localhost:5174/workbench
npm run typecheck -w @ip/workbench
```

冒烟：`/` · `/workbench` · `/workbench/research` · `/inventor` → 200；跨口链经 `AppLink`/`navigateApp` 解析为 `APP_DEV_URLS`（勿对本口外路径用裸 `Link`）。

## 已知债（不阻塞本单）

- 共享 `PageHeader` / 部分壳组件未替身（调用方已用 onClick / 绝对 href 绕过）
- stages 仅为边界+re-export，业务未物理拆进 stage 包
- 根 `src/pages/workbench` 与 app 已分叉；统一需单独 audit
- 等 `@ip/app-state` 后再迁 AppContext 等

## 建议下一步

1. 与 e2e：L0 壳可达 + L1 一条办理路径（research 或 intake）样机冒烟
2. `@ip/app-state` 可依赖后迁 context（保持 `@shared` re-export 兼容）
3. 按需把单段 Flow 实现渐进迁入对应 `stages/<id>/`（仍不双份 handoff）
4. Legacy audit：根 `src/pages/workbench` vs `apps/workbench` 差异清单后再谈删除或对齐
