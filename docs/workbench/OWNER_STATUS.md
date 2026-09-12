# 工作台 Owner 状态（apps/workbench · :5174）

> Owner：工作台应用助手 · 章程见 [TEAM_CHARTER.md](../TEAM_CHARTER.md)  
> 更新：2026-09-12

## 边界

- **只改** `apps/workbench`
- 共享：`@ip/contracts`（handoff keys/labels · ports）、`@ip/domain`（types · guardrails · handoff 逻辑 · getStageMeta）
- context / UI / seeds / hooks：**暂留** `@shared/*`（等 `@ip/app-state` 稳后再迁）
- **勿动** mid / agent / ops / iam / 根掏空

## 已完成

| 项 | 说明 |
|----|------|
| 壳 + 路由 | `npm run dev:workbench` → http://localhost:5174 · `/workbench/*` · `/inventor` |
| Flow 迁入 | `src/flows/{research,intake,draft,prosecution,maintain,monetize,watch,layout,home,inventor}` |
| P1 stages 边界 | `src/stages/*` + `STAGE_MODULES`（re-export；业务仍在 flows） |
| P0 跨口深链 | 相对路径 + `AppLink`/`navigateApp`（与根对齐）；本地 Banner 替身；`lib/deepLinks` re-export `@shared` |
| domain 直连 | types/guardrails/handoff 逻辑/getStageMeta → `@ip/domain`；labels → `@ip/contracts` |
| 字体 | `main.tsx` → `@shared/index.css`（与根统一，无第二套 webfont） |
| AppLink 对齐 | 2026-09-12 与业务审计根 src 扫尾同口径；tsc 绿 |

## 怎么验

```bash
npm run dev:workbench          # http://localhost:5174/workbench
npm run typecheck -w @ip/workbench
```

冒烟：`/` · `/workbench` · `/workbench/research` · `/inventor` → 200；跨口链经 `AppLink`/`navigateApp` 解析为 `APP_DEV_URLS`（勿对本口外路径用裸 `Link`）。

## 已知债（不阻塞本单）

- 共享 `PageHeader` / 部分壳组件未替身（调用方已用 onClick / 绝对 href 绕过）
- stages 仅为边界+re-export，业务未物理拆进 stage 包
- 等 `@ip/app-state` 后再迁 AppContext 等

## 建议下一步

1. 与 e2e：L0 壳可达 + L1 一条办理路径（research 或 intake）样机冒烟
2. `@ip/app-state` 可依赖后迁 context（保持 `@shared` re-export 兼容）
3. 按需把单段 Flow 实现渐进迁入对应 `stages/<id>/`（仍不双份 handoff）
