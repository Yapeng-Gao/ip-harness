# Agent 席「推进」真更新 UX（2026-09-21 CST）

只改 `apps/agent/**` + 本短记/截图。禁 Cloud；未改 mid/packages。  
叠 `e7c0e1f`（席位焊接）；**勿回退**开聊首页 / 席列表。

## P0 根因

点「推进一步」几乎只像步骤 pill / tab 在变：`advanceSeatWork` 主要抬 `stepIndex`，双文件区仍绑静态 `sampleArtifact` / `sampleWorklog`。

## 修法

| 项 | 改动 |
|----|------|
| 成果/办理过程随步 | `seatStepBodies`：按 `stepIndex` 追加「本步做了什么 / 产出片段」 |
| 过程面板新行 | `advanceSeatWork` 写 `kind:'advance'` 过程日志 |
| 推进后反馈 | 自动切「办理过程」tab + 正文闪黄 + 新日志行高亮 |
| 按钮文案 | 未到 HITL → **完成本步**；HITL/交卷步 → **交卷待确认** |
| 步骤条 | 保留进度色；`pointer-events-none` 只读，不可点假切 |

## 验收（:5175 · Asia/Shanghai）

- [x] 交底席连点推进：成果/过程正文变 + 过程面板有新行
- [x] 最后一步出现待确认（交卷）
- [x] `npm run typecheck -w @ip/agent` 通过

## 截图

`docs/ui-polish/agent-advance-ux/`

| 文件 | 内容 |
|------|------|
| `01-disclosure-step0.png` | 交底席初始 · 完成本步 |
| `02-after-advance-worklog.png` | 推进后 · 办理过程 tab + 新日志 |
| `03-artifact-grew.png` | 成果随步追加段落 |
| `04-hitl-pending.png` | 交卷待确认 → 待我确认闸口 |
