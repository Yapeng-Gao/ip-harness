# Agent 开聊首页（2026-09-21 CST）

只改 `apps/agent/**` + 本短记/截图。禁 Cloud；未改 mid/packages。基线 `dev` @ `d38dcb9`（**勿回退**向导 sticky）。

## P0

| 活口 | 修法 |
|------|------|
| `/agent` 整页案子列表 | 中间改为 **开聊空态**（大标题 + 主输入 /「开一个新案子」+ chip） |
| 历史占主区 | **左侧栏** `BusinessCaseSidebar`：全部案子可展开/搜索；点开进工作台 |
| 待确认占满首屏 | 顶栏铃铛保留；主区仅 **一行预览**（可进 inbox） |

## 纪律

- 仍非 Catalog 冷启动；专家工作台侧栏底 + 主区弱链（旁路）
- 禁 mid 深链
- `/agent/cases/new` sticky 底栏保留（`business-wizard-footer`）；首页输入/chip 经 `location.state` 预填向导

## 验收（:5175 · Asia/Shanghai）

- [x] `/agent` 像开聊首页；侧栏有历史案子（seed 4）
- [x] 输入或 chip → 进向导；侧栏点案 → 工作台
- [x] 待确认一行预览 + 顶栏铃铛；中间无整页列表
- [x] 向导短视口 sticky 未回退
- [x] `npm run typecheck -w @ip/agent` 通过

## 截图

`docs/ui-polish/agent-biz-home-chat/`

| 文件 | 内容 |
|------|------|
| `01-home-chat.png` | 开聊空态 + 侧栏历史 + 一行待确认 |
| `02-wizard-from-chip.png` | chip「从查新开始」进向导 |
| `03-case-from-sidebar.png` | 侧栏进案子工作台 |
| `04-wizard-from-input.png` | 主输入预填 summary |
| `05-wizard-sticky-mobile.png` | 390×640 办理路线 sticky 底栏 |
