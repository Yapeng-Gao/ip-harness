# Agent 业务首页 + 新建向导活口（2026-09-21 CST）

只改 `apps/agent/**` + 本短记/截图。禁 Cloud；未改 mid/packages。基线 `dev` @ `8893016`。

## P0

| 活口 | 修法 |
|------|------|
| `/agent` 几乎只有案子列表 | 增 **进行中摘要**（N 案待确认 / M 案进行中）+ 顶栏 **专家工作台**入口；保留待我确认 / 新建；空态「先建第一个案子」 |
| 新建第二步（办理路线）走不动 | 底栏 **sticky 可见**；step1「下一步」**永不静默 disabled**；`BUSINESS_STAGES` 改为可点路线卡（点卡可进下一步） |

## 向导 `/agent/cases/new`

- 布局：内容区滚动 + `business-wizard-footer` sticky 底栏（上一步 / 下一步｜创建）
- 步1 → 步2（办理路线）→ 步3（专家席）→ 创建并进入案子
- `business-stages-list` / `business-stage-card-*`：5 段准备→立项→撰写申请→递交→审查答复正常渲染
- 点路线卡：同步「跳过准备」勾选，并直接进专家席步

## 首页「我的案子」

- 一眼：待我确认 · 新建案子 · **专家工作台**（`/agent/catalog`，非冷启动超市）
- 摘要条：`business-home-summary`（待确认案数/项数 · 进行中案数 · 快速新建）
- **仍勿** Catalog 作为 `/agent` 冷启动

## 验收（:5175 · Asia/Shanghai）

- [x] 新建三步（底栏或点路线卡）能走完 → 进入案子工作台
- [x] 手机视口 390×640：办理路线步底栏 `sticky`、下一步在视口内
- [x] 首页有确认 / 新建 / 专家台 + 进行中摘要
- [x] `npm run typecheck -w @ip/agent` 通过

## 截图

`docs/ui-polish/agent-biz-home-wizard/`

| 文件 | 内容 |
|------|------|
| `01-home-summary-expert.png` | 首页摘要 + 专家台 |
| `02-wizard-step1-basic.png` | 向导步1 + sticky 底栏 |
| `03-wizard-step2-route-mobile.png` | 办理路线（短视口 sticky） |
| `04-wizard-step3-experts.png` | 默认 7 席 |
| `05-wizard-more-phase.png` | 更多专家 / Phase 灰显 |
| `06-created-case.png` | 创建后进案子 |
| `07-home-final.png` | 回首页 |
