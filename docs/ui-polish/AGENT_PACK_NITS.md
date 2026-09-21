# Agent Pack Nits（Confirm 假闭环 / 总览不同步 · 2026-09-21 CST）

叠 `3d69dd8` Pack HF。仅 `apps/agent/**` + 本短记/截图。禁 Cloud；未改 mid/packages。

## 必消

| 问题 | 处理 |
|------|------|
| Confirm 假闭环（年费「付款解锁」、转化「确认报价」能进卡却提交被挡） | 演示项目 / `case-mock-pack-hf` / 内存-only 席：Confirm **真成功**（`setThreadHitl(false)` → `hitlCleared`，会话闸已清）。mock 案不做发票硬挡；红字改人话。未开放项按钮禁用 +「演示不可提交」。 |
| 一键①–⑥「已到 6/6」总览仍大量「未到」 | Catalog / 工作区 / 单聊总览接 `packHitlSeatProgress`（`pendingHitl`→待确认，`hitlCleared`→已确认），与演示条同源。 |

## 轻改

- Confirm 阻塞红字人话（别「裂项」「授权类」）
- Catalog / 演示条 / validator 减工程师口吻；validator →「样机校验」

## 自点（`:5175` · Asia/Shanghai）

- [x] 一键①–⑥ 后 HITL 卡与条一致（①–⑥「待确认」）
- [x] ⑦⑧ Confirm 能提交到「已确认」（SPA 同会话）
- [x] `npm run typecheck -w @ip/agent` 通过

## 截图

`docs/ui-polish/agent-pack-nits/`

- `02` 一键后总览①–⑥=待确认
- `05`/`07` 年费/转化 Confirm 成功
- `10` SPA 确认后⑦⑧=已确认
