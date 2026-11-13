# Agent Pack Knife2 · F6 OA N 通外循环（2026-09-21 CST）

对齐 tip `3dcc53f`（Knife1）· [agent-pack-loops-roadmap](../architecture/product-apps/agent-pack-loops-roadmap.md) Knife2 · patent-pack-design §5.2 / §5.5 F6 · [agent-business-mode](../architecture/product-apps/agent-business-mode.md)。  
仅 `apps/agent/**` + 本短记/截图。禁 Cloud；未改 mid/packages。无真局端 / 真超范围检查器。

## 做了什么

| 项 | 实现 |
|----|------|
| 理由分类 mock | 创造性 / 清楚性 / 公开不充分 / 新颖性分支（`oaClassifyLog`） |
| 子任务汇入 | 创造性→补充检索；清楚性→修术语/补实施例（示意） |
| HITL⑥ | 人话「确认答复策略」/「驳回策略」；过程可见策略驳回重做 |
| N 通外循环 | `oaRound` 计数；提交后可「第 2 通到达」→ 回答复入口 |
| 超范围 blocker | 一次失败→需人工接手；自修复 **0** 次（禁自动重试假闭环） |
| 业务壳 | 仅已递交解锁审查答复；进度显示「第 N 通」 |
| 专家台 | `/agent/catalog` F6 面板：N 通 + 策略驳回 + blocker |
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
docs/ui-polish/AGENT_PACK_KNIFE2.md
docs/ui-polish/agent-pack-knife2/*.png
```

种子案 `case-biz-oa-filed`（边缘散热结构 · 审查中）：已递交 · 第 1 通 · 待确认答复策略。

## 自点（`:5175` · Asia/Shanghai）

- [x] 业务面：未递交案子审查答复锁定「递交后解锁」；已递交解锁；人话「确认答复策略」；进度「第 N 通」
- [x] 提交后「第 2 通到达」→ 回答复入口；计数可见（专家台 / 案子页）
- [x] 专家台：N 通计数 + 策略驳回重做过程
- [x] blocker：一次失败→需人工接手；不出现「自动重试修改」假闭环（0 次自修复）
- [x] 无真局端；`/agent` 冷启动仍为我的案子；无 mid 深链验收
- [x] `npm run typecheck -w @ip/agent` 通过

## 截图

`docs/ui-polish/agent-pack-knife2/`

- `01` / `14` 我的案子冷启动（含已递交 OA 种子）
- `02` 未递交 · OA 锁定
- `03`–`04` 已递交 · 第 1 通 + 办理过程
- `05`–`08` 确认答复策略 · 驳回 · 确认提交
- `09`–`11` 专家台 F6 · 第 2 通 · blocker
- `12` 案子页第 2 通
- `13` 席位样机校验超范围 blocker（0 次）
