# apps/search · 检索服务（样机）

对照样机：关键词 / 语义 / 高级（字段行）三模式、结果过滤、同族折叠、详情抽屉、工作篮「送 Agent」、Agent JSON 同引擎形状。  
**样机 · 无真检索后台 · 非真专利库 / 非真 ES·向量 · 用法对标智慧芽/Innojoy**。

**不改** mid / workbench / agent / ops / iam / doc-harness / ai-infra / ai-data 业务代码；**不改** `packages/contracts` `APP_PORTS`（端口仅在本 app Vite 固定 **5182**）。  
**禁止**持有或写入 `PatentCase` / DomainCommand。

规格：`docs/architecture/search/`（已有 overview / human-ui / agent-api-shape / deep-demo；本 README 不替代架构篇）。

## 启动

在 **repo 根**：

```bash
npm run dev:search
```

→ http://localhost:5182

```bash
npm run typecheck -w @ip/search
```

## 可点闭环（B1 / W0）

| # | 面 | 如何点通 |
|---|-----|----------|
| 1 | 三模式 | 顶栏切「关键词 / 语义 / 高级」；草稿保留；空查询或坏布尔 / 空高级行 → 输入下红色 `role=alert` |
| 2 | 检索 → 列表 | 点「检索」→ `idle→running→done|empty|error`（假延迟）；`backend: mock` 与 `tookMs` 可见 |
| 3 | 过滤 + 同族 | 改国家/IPC/申请人/日期/法律状态 →「应用过滤并重跑」；勾选同族折叠 → 代表件 +「同族 N 件」展开 |
| 4 | 详情抽屉 | 点命中行 → 右侧抽屉；Esc / 遮罩关闭；可加篮 / 收藏 |
| 5 | 工作篮 + 送 Agent | 加篮后点「送 Agent」→ 事件日志（样机·未真派发）；`/saved` 同能力 |
| 6 | Agent JSON | 右侧（或窄屏折叠）面板：SearchQuery + SearchResponse + commercial_patent_search / cluster_hits |
| 7 | 诚实横幅 | `role=status` 含「无真检索后台」 |

可选：勾「下次强制失败」验证 error → 关闭回 idle。同族深链 `/families/:familyId`。

## 诚实边界

| 项 | 现状 |
|----|------|
| ES / 向量 / 商业库 | **无**；内存种子评分 |
| 同族 | 预置 `familyId`，非真 INPADOC |
| Agent | 面板 JSON + 事件日志；**无**真派发 |
| PatentCase | **禁止**写入 |
| APP_PORTS | **不改**；仅本壳 Vite `:5182` `strictPort` |

## 改动边界

只改 `apps/search/**`；根 `package.json` 仅增加 `dev:search`。禁止改五壳、doc-harness、ai-*、packages 行为与 e2e。

## 非本波（W0 明确不做）

- **C1** `/corpus` 语料平面  
- **C2** FTO / mining 下游  

（见 `docs/PROTOTYPE_MASTER_PLAN.md`；本壳只关 B1 deep-demo。）
