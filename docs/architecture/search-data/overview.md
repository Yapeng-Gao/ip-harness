# 检索数据面 · 总览

## 1. 定位

**Search Data Plane** 生产「可检索的文献与实体索引」，对外只暴露 **Search API**（人 Web 与 Agent 工具同契约）。  
它**不是**办案库（case-core），**不是**训推数据集仓（ai-data）。

## 2. 原则（冻结）

| # | 原则 |
|---|------|
| 1 | **单一查询入口**：所有读路径经 Search API；禁止业务壳直连倒排/向量 |
| 2 | **索引与正文分离**：热索引可重建；正文/PDF 在对象存储 |
| 3 | **版本化索引**：`indexVersion` 可回滚；双写/蓝绿切换 |
| 4 | **多源统一文档模型**：专利/论文/网页 → 同一 `SearchDocument` 超集，源特有字段进 `ext` |
| 5 | **合规先于召回**：脱敏/许可证/禁爬名单在入库门禁，不在查询时临时猜 |
| 6 | **≠ ai-data**：检索语料可**另开导出作业**进训练，禁止混桶混权限 |

## 3. 逻辑架构

```text
Sources → Ingest Jobs → Parse/Normalize → Enrich (family, IPC, org resolve)
       → Document Store (lake + object) → Indexer → Inverted + Vector (+ optional KG edges)
       → Search API → UI / Agent / Landscape / FTO / Mining
```

## 4. 核心对象

| 对象 | 含义 |
|------|------|
| `Source` | 数据源登记（官方库、商业库、爬虫、合作方） |
| `IngestJob` | 一次入库/增量任务 |
| `SearchDocument` | 归一化文献（含 `docType`: patent\|paper\|web\|standard…） |
| `FamilyGroup` | 同族/扩展族 |
| `OrgEntity` | 申请人/权利人解析后实体 |
| `IndexShard` / `IndexVersion` | 索引分片与发布版本 |
| `SearchQuery` / `SearchHit` | 与 search 壳已冻形状对齐 |

## 5. 非目标

- 真全球专利采购商务条款  
- 在 Search API 内训练大模型  
- 用 case-core 当检索主存

## 6. MVP 最小切片（落地开工）

| 项 | MVP | 以后 |
|----|-----|------|
| 源 | 1 类专利 XML/JSON + 手工论文 CSV | 多商业源 + 爬虫治理 |
| 存储 | PG 元数据 + 对象存储正文；倒排单集群 | 湖 Iceberg + 分片 + 向量独立 |
| API | 与 search 壳同 `SearchQuery`/`SearchHit` | 异步 scroll、saved search |
| 同族 | 规则/号段种子 | 权威同族源 |
| 合规 | license 字段 + 禁爬名单表 | 自动 PII 扫描 |

## 7. 验收（规格级）

- [ ] 四层存储职责表无交叉糊弄  
- [ ] Agent/人同 API；禁止壳直连引擎  
- [ ] `indexVersion` 可回滚写进 ops 流程  
- [ ] 与 ai-data 导出路径分离（另桶另密钥）  

