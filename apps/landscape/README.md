# apps/landscape · 产业全景（样机）

汽车种子域 Taxonomy + 企业档案 + 三类洞察 + 假 SearchHit 下钻。  
**样机 · 汽车种子域 · 无全球实时产业库**。

**不改** mid / workbench / agent / ops / iam / doc-harness / ai-* / search / fto / figure / mining 业务代码；**不改** `packages/contracts` `APP_PORTS`（端口仅在本 app Vite 固定 **5186**）。  
**禁止** DomainCommand / PatentCase / case-core 写库；**禁止**真图 DB / 真爬取。

规格：`docs/architecture/landscape/`（只读参考）。

## 启动

在 **repo 根**：

```bash
npm run dev:landscape
```

→ http://localhost:5186

```bash
npm run typecheck -w @ip/landscape
```

## 路由

| 路径 | 说明 |
|------|------|
| `/` | 域选择：汽车可用；其他 disabled +「另立项」 |
| `/tree` | 主画布：左树≥3层 · 中摘要 · 右洞察入口 |
| `/nodes/:nodeId` | 企业+布局+竞品+三类洞察+Hit；工作篮 toast 占位 |
| `/orgs/:orgId` | 企业档案 |
| `/insights` | 卡脖子/围剿/前沿（可筛 kind） |
| `/ingest` | 多源入库假任务 |
| `*` | → `/` |

侧栏导航 + 诚实横幅 + 顶栏「不改 APP_PORTS」+ 深链 search `http://localhost:5182`（只读）。

## 可点清单（deep-demo）

1. 选域「汽车」→ 展开 ≥3 层树（整车→动力系统→电驱动→电机/逆变器…）
2. 点节点 → 企业（地位）+ 专利布局示意 + 竞品对照
3. 卡脖子 / 围剿 / 前沿 三类洞察卡可点
4. 假 Hit →「加入工作篮」toast 占位（不跨口）
5. 横幅：样机 · 汽车种子域 · 无全球实时产业库

## 诚实边界

| 项 | 现状 |
|----|------|
| 产业库 | **汽车种子**；非全球实时 |
| 图数据库 | **无**；边用字段表达 |
| 爬取 / 入库 | **假进度**；不接真爬虫 |
| 工作篮跨口 | **无**；仅 toast |
| APP_PORTS | **不改**；仅本壳 Vite `:5186` |
| Agent API | `src/lib/agentApi.ts` mock，`backend: 'mock'` |
| 数据 | 全内存；刷新即失 |

## 改动边界

只改 `apps/landscape/**`；根 `package.json` 仅 additive `dev:landscape`。

## 非目标

真全行业库、真图数据库、真持续爬取、改 APP_PORTS、写 case-core、把图谱塞进 ai-data。
