# apps/mining · 专利挖掘（样机）

对照样机：交底/技术点 → 候选发明点列表 → 评分 → 送立项/撰写占位。  
**样机 · 无真挖掘引擎 · 不写立案库**。

**不改** mid / workbench / agent / ops / iam / doc-harness / ai-* / search / fto / figure 业务代码；**不改** `packages/contracts` `APP_PORTS`（端口仅在本 app Vite 固定 **5184**）。  
**禁止** DomainCommand / PatentCase / case-core 写库。

规格：`docs/architecture/mining/`（README · overview · human-ui · deep-demo · REVIEW）。

## 启动

在 **repo 根**：

```bash
npm run dev:mining
```

→ http://localhost:5184

```bash
npm run typecheck -w @ip/mining
```

## 四步主路径

| # | 路径 | 说明 |
|---|------|------|
| 入口 | `/` | 默认 1 个样机项目卡片 → `/disclosure` |
| ① | `/disclosure` | 交底分节（背景/技术点/效果）；种子加载/清空；关联 Search Hit 多选 |
| ② | `/candidates` | 「拆解生成」≈600ms → ≥3 条示意候选；可手增删改 |
| ③ | `/score` | 新颖性/价值/可写性假分（0–5，标「示意」）+ 总分排序 |
| ④ | `/send` | 多选 → 送立项/送撰写 → toast + intents[]；深链 workbench:5174 / doc-harness:5178 |
| `*` | → `/` | |

侧栏 + 顶栏步骤条；允许回退。

## 门禁（deep-demo）

- 无候选 → 送出禁用
- 送出仅内存 `HandoffIntent` 事件，**无** DomainCommand
- 横幅含「不写立案库」
- 种子 ≥3 条 SearchHit；交底默认关联 ≥1 条

## 诚实边界

| 项 | 现状 |
|----|------|
| 挖掘引擎 | **无**；段落/关键词示意拆解 |
| 立案库 / PatentCase | **不写**；禁用「已创建案件」文案 |
| DomainCommand | **禁止** |
| 跨口 Search 篮 | **无**；本壳种子 Hit |
| APP_PORTS | **不改**；仅本壳 Vite `:5184` |
| 数据 | 全内存 mock；刷新即失 |

## 改动边界

只改 `apps/mining/**`；根 `package.json` 仅 additive `dev:mining`。

## 非目标

真引擎、真建案、改 APP_PORTS / 五壳 / search / fto、塞 ai-data。
