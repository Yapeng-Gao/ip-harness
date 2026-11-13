# 检索数据面 · 落地 MVP 任务单

> **依据**：[README](./README.md) · [roadmap](./roadmap.md) · [SCHEME_WAVE](../../SCHEME_WAVE.md)（定稿）。  
> **本页**：第一刀**可开工**范围；文档任务单，**不**改 `apps/*`（接线另开 PR）。

## 1. 目标一句话

单源专利可检索：对象存储 + PG 元数据 + 倒排 + **Search API**，形状对齐现样机 `SearchQuery` / `SearchHit`；`apps/search:5182` 可从 mock 切到真 API。

## 2. 第一刀范围（做）

| # | 工作包 | 交付物 |
|---|--------|--------|
| 1 | 契约冻 | `@ip/contracts`（或等价）冻 Search API 路径与 `SearchQuery`/`SearchHit`/`backend` 字段 |
| 2 | 入库最小链 | 一种专利 XML/JSON → Parse/Normalize → 写对象正文 + PG 元数据 |
| 3 | 索引 | 单集群倒排（title/abstract/claims 分字段）；发布一个 `indexVersion` + 别名 `search_current` |
| 4 | Search API | keyword + 基础 filter（日期/国家/IPC 可选子集）；返回 Hit 列表 |
| 5 | 质量 | 必填失败 → **quarantine**（见 [ops-quality](./ops-quality.md)）；quarantine ≠ 热索引 |
| 6 | 接线准备 | 文档/旗标说明：`apps/search` 如何改 `backend`（**本单不改壳码**） |

可选（仍算 MVP 内若有余力）：同族 collapse 用规则种子表；**不含**完整向量混合。

## 3. 明确不做

| 不做 | 说明 |
|------|------|
| 真全球专利库 / 商业源采购落地 | 单源或小样本即可 |
| 真权威同族源 | 规则/种子即可 |
| 完整向量 + RRF | 归增强阶段 |
| 湖仓 Iceberg 生产治理 | MVP 可用对象+PG；湖可后置 |
| 训练导出进 ai-data | 不阻塞本 MVP；另刀 |
| 改 `apps/*` 大改 / 新壳 | 本单文档+后端切片；壳接线另 PR |
| case-core 当检索主存 | 禁 |

## 4. 验收标准

- [ ] 用固定样本集（≥100 篇或约定 N）经 API 关键词检索有稳定命中  
- [ ] 响应含 `backend` ≠ `mock`（或等价引擎标识）  
- [ ] 必填缺失文献进 quarantine，不出现在默认检索结果  
- [ ] `indexVersion` 可记录且别名可指回（至少演练一次回滚文档/脚本）  
- [ ] Agent 与人机约定同一 Hit schema（对照 [search/agent-api-shape](../search/agent-api-shape.md)）  
- [ ] 书面确认：未把 PatentCase / 训练桶混进检索热路径  

## 5. 与现样机壳关系

| 壳 / 包 | 关系 |
|---------|------|
| **`apps/search:5182`** | 继续可演示 mock；MVP 后端就绪后**另 PR** 切 API；IA/三模式不变 |
| **FTO / mining / landscape** | 仍吃 Hit；跨口篮见 [cross-shell-basket](../search/cross-shell-basket.md)（种子策略不变，直至 basket API） |
| **`apps/ai-data` / ai-infra** | 不依赖本 MVP；禁结果页一键进训湖 |
| **五壳办案** | 无关；不写 DomainCommand |

## 6. 建议 Owner / 依赖

- 实现：检索服务 + 后端/接口样机协作（总控指派）  
- 契约：共享包 / contracts  
- 阻塞：无样本、无 PG/对象/倒排环境则不可开刀——需总控开基建闸  
