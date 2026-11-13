# Agent Pack Knife3 · F9→F3 飞轮 + 回流（2026-09-21 CST）

对齐 tip `917f7d8`（Knife2）叠刀1 `3dcc53f` · [agent-pack-loops-roadmap](../architecture/product-apps/agent-pack-loops-roadmap.md) Knife3 · patent-pack-design §5.3。  
仅 `apps/agent/**` + 本短记/截图。禁 Cloud；未改 mid/packages。无真监测爬虫。

## 做了什么

| 项 | 实现 |
|----|------|
| 飞轮 mock | 监测事件 → 布局漏洞报告 feedback → 布局策略师（F3）· 布局待拍板 |
| 串联灰入口 | 查新不乐观回流、立项低分回流（复用 Knife1 灰示意） |
| 业务壳 | 更多专家灰显「布局/维权」（≠ FTO 仍可选）；种子案 D 启用布局 → 待确认「请确认布局调整」 |
| 专家台 | `/agent/catalog` F9→F3 面板：漏洞回流→待拍板 · 未启用仅专家台 · 灰回流按钮 |
| ≠ FTO | 维权席 `expert-enforcement`；过程/面板明示 ≠ `expert-fto` |
| 禁 mid 深链 | 未加 mid 可点验收链 |

## 改动路径

```
apps/agent/src/business/packLoops.ts
apps/agent/src/business/businessSeats.ts
apps/agent/src/business/BusinessCaseContext.tsx
apps/agent/src/components/business/CaseProcessPanel.tsx
apps/agent/src/components/patent/PackLoopsPanel.tsx
apps/agent/src/pages/business/BusinessCasePage.tsx
apps/agent/src/pages/business/BusinessCaseNewPage.tsx
apps/agent/src/pages/business/PendingConfirmPage.tsx
docs/ui-polish/AGENT_PACK_KNIFE3.md
docs/ui-polish/agent-pack-knife3/*.png
```

种子案 `case-biz-layout-flywheel`（空白点补局 · 飞轮样机）：已启用布局 · 待确认布局调整。

## 自点（`:5175` · Asia/Shanghai）

- [x] 专家台：一条「布局漏洞回流 → 布局待拍板」过程可追踪（mock）
- [x] 业务面：启用布局（种子 D）待确认「请确认布局调整」；未启用布局仅专家台故事线
- [x] ≠ FTO：不把 `expert-fto` 当成维权席；新建案子布局/维权灰显
- [x] 无真监测爬虫；`/agent` 冷启动仍为我的案子；无 mid 深链
- [x] `npm run typecheck -w @ip/agent` 通过

## 截图

`docs/ui-polish/agent-pack-knife3/`

- `01` / `11` 我的案子冷启动（含飞轮种子）
- `02`–`03` 启用布局案子 + 飞轮办理过程
- `04`–`06` 待确认「请确认布局调整」· 确认后
- `07`–`09` 专家台 F9→F3 · 仅专家台 · 灰回流
- `10` 新建案子 · 布局/维权灰显（≠ FTO）
- `12`–`13` 维权席 vs FTO 席分开展示
