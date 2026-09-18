# apps/landscape · 产业全景（加深样机）

汽车种子域 Taxonomy + 企业档案 + 统一边邻居 + 三类洞察 + 假 SearchHit 下钻 + 假 ingest 追加。  
**样机 · 汽车种子域 · 加深图谱 · 无全球实时产业库**。

**方案 A（壳内 seed）**：图数据 = 模块 seed + 内存；`backend: 'seed-graph'`。  
**不改** mid / workbench / agent / ops / iam / doc-harness / ai-* / search / fto / figure / mining 业务代码；**不改** `packages/contracts` `APP_PORTS`（端口仅在本 app Vite 固定 **5186**）。  
**禁止** DomainCommand / PatentCase / case-core 写库；**禁止**真图 DB / 真爬取；**不开** `landscape-api` / **5191**。

规格：`docs/architecture/landscape/deepen-l1-l4.md`（只读参考）。

## 启动

在 **repo 根**：

```bash
npm run dev:landscape
```

→ http://localhost:5186

```bash
npm run typecheck -w @ip/landscape
```

可选：`curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:5186/`（需已起 dev）。

## 路由

| 路径 | 说明 |
|------|------|
| `/` | 域选择：汽车可用；其他 disabled +「另立项」 |
| `/tree` | 主画布：左树（深 0–4 / ≥30 节点）· 中摘要 · 右洞察入口 |
| `/nodes/:nodeId` | 企业+布局+竞品+洞察+Hit+**一度邻居表** |
| `/orgs/:orgId` | 企业档案 + 邻居（竞品 / 标准 / 集团持股示意） |
| `/insights` | 卡脖子/围剿/前沿（kind + **节点过滤/计数**） |
| `/ingest` | 假入库：可跑完并 **追加** Hit/边；计数可见变化 |
| `*` | → `/` |

侧栏：诚实横幅、图版本只读标签、`backend: seed-graph`、节点/边/Hit 计数；顶栏「不开 5191」+ 深链 search `http://localhost:5182`（只读）。

## 加深验收清单（L1–L4）

- [x] **L1** 节点 ≥30 或深度 ≥4（本种子两者皆达标）；节点含 `code?` / `aliases?`；图 `version`（automotive）；UI 只读版本标签可切换
- [x] **L2** 企业 ≥25；每企 `lines` ≥1；stance 可见；集团/持股示意（字段）
- [x] **L3** `/ingest` 假任务跑完后 Hit/边计数增加（内存追加）
- [x] **L4** 统一 Edge：`part-org` / `org-competitor` / `part-hit` / `node-insight` / `org-standard`；节点详情与企业页邻居表；UI ≥3 类边可列
- [x] **Hits** 含 `CN115123456A` 与 `CN118234567A`（SearchHit 子集）
- [x] **L5** 洞察按节点过滤/计数；非实时舆情
- [x] 横幅含「加深图谱」且「无全球实时」
- [x] 默认无新端口；不开 5191
- [x] 非汽车域仍 disabled；无他域 apps 变更

## 诚实边界

| 项 | 现状 |
|----|------|
| 产业库 | **汽车种子加深**；非全球实时 |
| 图数据库 | **无**；统一 `Edge` 内存数组 |
| 爬取 / 入库 | **假进度 + 预置追加**；不接真爬虫 |
| 工作篮跨口 | **无**；仅 toast |
| APP_PORTS | **不改**；仅本壳 Vite `:5186` |
| Agent API | `src/lib/agentApi.ts` · `backend: 'seed-graph'` |
| 数据 | 全内存；刷新即失 |

## 改动边界

只改 `apps/landscape/**`（及必要时 `docs/landscape/**` 实现备注）。

## 非目标

真全行业库、真图数据库、真持续爬取、改 APP_PORTS、写 case-core、开 5191、把图谱塞进 ai-data / search-api。
