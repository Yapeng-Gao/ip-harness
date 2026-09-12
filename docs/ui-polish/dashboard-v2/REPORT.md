# Dashboard v2 — mid IA redesign

## 1. 改了什么

### `src/pages/Dashboard.tsx`
- 接入共享 `PageHeader` + `EmptyState`：主 CTA / 次 CTA 用 `ui-btn`，次要导航链保留为轻链
- 首屏新增 **「下一步 · 优先办理」** hero（`inbox[0]`），直接回答「现在该做什么」
- KPI 三卡：次级指标改为 `kpi-chip` 可读 pill，不再挤成一行点分文案
- Inbox：`surface-card` 面板 + 列头（来源 / 事项 / 期限·谁该动 / 动作）+ **工作台 / Agent / 期限与监控** 视觉分组（同源数据，仅 UI 分组）
- 行改为 `dash-inbox-row` 对齐网格；深链 / Persona / `buildOpsInbox` 未动
- 空态改用 `EmptyState` + 工作台 / Agent CTA
- 折叠 Agent 会话与次级漏斗改 `surface-card`

### `src/components/TenantBanner.tsx`
- 对齐 `surface-card` token（去掉手写 border/shadow）

### `src/pages/DashboardSecondary.tsx`
- `<details>` 容器改 `surface-card`

### `src/index.css`
- 加深 KPI 卡比例（min-height / 大号 tabular value / flex 列）
- 新增 `kpi-tile-chips` / `kpi-chip`
- 新增 dashboard inbox 工具类：`dash-next` / `dash-inbox*`（list-row 对齐）

## 2. 截图路径

`docs/ui-polish/dashboard-v2/` 与 `.ui-evidence/dashboard-v2/`：

| 文件 | 说明 |
|------|------|
| `full-before.png` | 改前整页（未覆盖） |
| `kpi-before.png` | 改前 KPI 特写（未覆盖） |
| `full-after.png` | 改后整页 |
| `kpi-after.png` | 改后 KPI 特写 |
| `hero-after.png` | 改后视口（含下一步 + KPI） |

## 3. 怎么验

```bash
# mid 已在 5173
open http://127.0.0.1:5173/
npm run typecheck -w @ip/mid
```

看点：首屏「下一步」→ KPI 三卡 chips → Inbox 分组列对齐；点 KPI「待我办理」锚到 `#ops-inbox`；行链仍进原 workbench/agent/docket 深链。

## 4. 刻意未做

- 未改 Persona / `buildOpsInbox` / 计数语义 / 深链 href
- 未动 ops / 业务闸 / contracts
- 未 push；停在 `dev`
- 未拆 Dashboard 为多文件；未改 Cloud Agent

## 5. typecheck

`npm run typecheck -w @ip/mid` — **PASS**

## 6. blockers

- mid Vite 对共享 `src/index.css` 偶发不热更新；本波曾重启 `npm run dev -w @ip/mid` 后 CSS 才生效。无功能 blocker。
