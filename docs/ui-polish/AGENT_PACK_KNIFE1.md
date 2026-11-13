# Agent Pack Knife1 · F5 内循环 + 跨席环边（2026-09-21 CST）

对齐 tip `9ddd475`（§1.3 权威=§5.5）· [agent-pack-loops-roadmap](../architecture/product-apps/agent-pack-loops-roadmap.md) Knife1 · [agent-business-mode](../architecture/product-apps/agent-business-mode.md)。  
仅 `apps/agent/**` + 本短记/截图。禁 Cloud；未改 mid/packages。无真沙箱 / 真公式。刀2/3 不做。

## 做了什么

| 项 | 实现 |
|----|------|
| 内循环 mock | 交底缺项追问轮次；查新覆盖度 / 撰写四类校验自修复≤3；超限→「需人工接手」escalate（禁静默死循环） |
| 外循环环边 | HITL③/⑤ 退回带批注→人话「请按意见修改」且该项回待确认；附图→撰写 feedback（术语不一致）；HITL④ 不乐观回流灰示意 |
| 业务壳 | `/agent` 仍=我的案子；案子页「办理过程」人话；退回提示条 |
| 专家台 | `/agent/catalog` `PackLoopsPanel`：重试 n/3 · 附图退回撰写 · 超3次升级；席位样机校验同口径 |
| 禁 mid 深链 | 未加 mid 可点验收链 |

## 改动路径

```
apps/agent/src/business/packLoops.ts
apps/agent/src/business/BusinessCaseContext.tsx
apps/agent/src/components/business/CaseProcessPanel.tsx
apps/agent/src/components/patent/PackLoopsPanel.tsx
apps/agent/src/components/patent/SeatValidatorPanel.tsx
apps/agent/src/pages/business/BusinessCasePage.tsx
apps/agent/src/pages/business/PendingConfirmPage.tsx
apps/agent/src/pages/patent/PatentCatalogPage.tsx
docs/ui-polish/AGENT_PACK_KNIFE1.md
docs/ui-polish/agent-pack-knife1/*.png
```

## 自点（`:5175` · Asia/Shanghai）

- [x] 业务时间线：确认交底/查新/权项可前进；退回后人话「请按意见修改」且回待确认
- [x] 专家台/过程：可见「检查未通过·已重试 n/3」或「附图退回撰写改术语」
- [x] 超 3 次：过程/样机校验出现「需人工接手」
- [x] `/agent` 冷启动仍为我的案子；无 mid 深链
- [x] `npm run typecheck -w @ip/agent` 通过

## 截图

`docs/ui-polish/agent-pack-knife1/`

- `01` / `11` 我的案子冷启动
- `02`–`03` 案子时间线 + 办理过程（重试 / escalate）
- `04`–`06` 待确认退回 · 人话提示 · 回待确认
- `07`–`08` 确认后进度前进
- `09` 专家台 F5 环边面板
- `10` 席位样机校验超限→需人工接手
