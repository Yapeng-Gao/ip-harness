# apps/fto · FTO 自由实施分析（样机）

对照样机：产品特征 → 检索命中 → 权利要求对比矩阵 → 风险等级 → 报告 Confirm。  
**样机 · 无真 FTO 引擎 · 非法律意见**。

**不改** mid / workbench / agent / ops / iam / doc-harness / ai-* / search 业务代码；**不改** `packages/contracts` `APP_PORTS`（端口仅在本 app Vite 固定 **5183**）。  
**禁止**持有或写入 `PatentCase` / DomainCommand / case-core。

规格：`docs/architecture/fto/`（README · overview · human-ui · deep-demo · agent-api-shape · REVIEW）。

## 启动

在 **repo 根**：

```bash
npm run dev:fto
```

→ http://localhost:5183

```bash
npm run typecheck -w @ip/fto
```

## 五步主路径

| # | 路径 | 说明 |
|---|------|------|
| 入口 | `/` | 默认样机项目卡片 → `/features` |
| ① | `/features` | 产品特征表：增删、上下移；种子 ≥2 行 |
| ② | `/hits` | 种子篮 ≥3 条 SearchHit；示意「从 Search 导入」（无跨口 LS） |
| ③ | `/matrix` | 特征×文献；自动填假比对（关键词重叠，非真引擎） |
| ④ | `/risk` | low\|medium\|high\|unclear；可 `overridden` |
| ⑤ | `/report` | 预览 → Confirm → 只读；复制 Markdown；重新打开编辑 |
| `*` | → `/` | |

顶栏深链只读：`检索 search → APP_DEV_URLS.search`（`@ip/contracts`）。

## 门禁（deep-demo）

- hits 为空 → 禁用「自动填假比对」/ 不能进矩阵下一步（命中页硬挡）
- 特征空或矩阵空 → 不能 Confirm
- Confirm **绝不**写 case-core / PatentCase

## 诚实边界

| 项 | 现状 |
|----|------|
| FTO 引擎 | **无**；假关键词重叠 |
| 法律意见 | **非**；横幅明示 |
| 跨口 Search 篮 | **无**；toast + 种子补齐 |
| PatentCase / DomainCommand | **禁止**写入 |
| APP_PORTS | **不改**；仅本壳 Vite `:5183` |
| 数据 | 内存 mock；刷新即失 |

## 可选 Agent 形状

壳内 `ftoAgentApi`（`src/lib/agentApi.ts`）：`getProject` / `runMockMatrix` / `getReportDraft` / `confirmReport` —— 与人机同一 store，非 HTTP。

## 改动边界

只改 `apps/fto/**`；根 `package.json` 仅 additive `dev:fto`。禁止改五壳、search、packages 行为与 e2e。

## 非目标

真引擎、真律师签章、改 APP_PORTS / search / 五壳、PatentCase 写库、塞 ai-data。
