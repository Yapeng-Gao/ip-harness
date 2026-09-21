# Agent 案子席位焊接（2026-09-21 CST）

只改 `apps/agent/**` + 本短记/截图。禁 Cloud；未改 mid/packages。  
叠 `b02264a`（开聊首页）+ `d38dcb9`（向导 sticky）；**勿回退**。

## P0

| 活口 | 修法 |
|------|------|
| 工作台几乎只见待确认 | **席列表**（7+已加更多）+ 点席见步骤条 / 成果+过程 / **推进一步**；待确认仍是闸口 |
| 案与 Catalog 分叉 | `createCaseFromWizard` / 种子同步：`caseId = projectId`（一案子一 id） |
| 单聊交付另开确认宇宙 | 席交付 `triggersHitl` → `prepareConfirm` 写入**本案**待确认；专家台 Confirm/退回同 store |
| Catalog 平行宇宙 | 专家台可选业务案 →「进本案」进 `/agent/projects/:caseId/bots/:seat`；过程面板同源 |

## 验收（:5175 · Asia/Shanghai）

- [x] 业务案可点查新/交底/撰写…见该席工作与双文件过程
- [x] 推进交底 →「确认交底」待确认；确认后进度前进
- [x] Catalog 进同一案席位不丢待确认
- [x] `/agent` 开聊首页不回退（侧栏历史 + 空态）
- [x] `npm run typecheck -w @ip/agent` 通过

## 截图

`docs/ui-polish/agent-biz-seat-weld/`

| 文件 | 内容 |
|------|------|
| `01-home-chat-intact.png` | 开聊首页未回退 |
| `02-case-seat-rail.png` | 案子席列表 + 工作面 |
| `03-advance-disclosure.png` | 推进交底 → 待确认 |
| `04-catalog-biz-weld.png` | Catalog「进同一业务案」选择条 |
| `04b-catalog-seat-biz-btn.png` | 席卡「进本案」 |
| `05-catalog-into-case-seat.png` | 进本案席位（同 projectId） |
