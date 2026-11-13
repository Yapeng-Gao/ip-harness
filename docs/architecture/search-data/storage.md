# 存储分层（怎么存储）

## 1. 四层（冻结心智）

| 层 | 技术选型倾向 | 存什么 | 不存什么 |
|----|--------------|--------|----------|
| **L0 对象存储** | S3/MinIO | PDF/原 XML/附图大对象 | 查询热路径 |
| **L1 湖（列存）** | Parquet/Iceberg 等 | 归一化 Document 宽表、增量快照 | 低延迟点查主路径（可辅） |
| **L2 元数据行存** | PostgreSQL | Source、Job、权限、indexVersion、实体、同族指针、质量分 | 全文倒排 |
| **L3 检索引擎** | 倒排（ES/OpenSearch 类）+ 向量（专用或同引擎） | 可检索字段、embedding、facet | 原始 PDF |

可选 **L4 图/实体边**（产业全景）：零件↔文献↔企业；可后置，不阻塞检索 MVP。

## 2. SearchDocument 最小字段集

| 字段 | 说明 |
|------|------|
| `id` / `aliases[]` | 稳定主键 + 别名 |
| `docType` | patent / paper / web / standard |
| `title` / `abstract` / `claims` / `body` | 分字段；可空 |
| `lang` / `country` / `pubDate` | 过滤 |
| `ipc[]` / `cpc[]` | 分类 facet |
| `applicants[]` / `orgIds[]` | 原始名 + 解析实体 |
| `familyId` / `familyConfidence` | 同族 |
| `license` / `piiFlags` / `qualityScore` | 门禁 |
| `sourceId` / `ingestJobId` / `contentHash` | 血缘 |
| `ext` | 源特有 JSON |

## 3. 索引存储

- **倒排**：`title^`、`abstract`、`claims`、`body` 分字段；phrase / 布尔；过滤器（日期、国家、IPC、docType）  
- **向量**：默认对 `title+abstract(+claims 截断)` 编码；模型与维度写入 `indexVersion.embeddingModel`  
- **同族折叠**：预计算 `FamilyGroup` 表；查询时 collapse，而非每次在线聚簇  

## 4. 生命周期

| 动作 | 行为 |
|------|------|
| 发布新 indexVersion | 新写入别名切换；旧版本保留 N 代可回滚 |
| 文档删除/下线 | 软删标记 → 索引 delete-by-query；湖保留合规审计副本 |
| 重建 | 从湖按版本重放 Indexer；不从 UI 内存重建 |

## 5. 容量与分片（指导级）

- 按 `country` 或 `pubDate` 年分片倒排；向量可按同一键或全局  
- 热/温：近 20 年专利热分片；更早温存储 + 较慢副本  

## 6. 安全

- 租户/许可证 ACL 在 L2；查询规划强制 filter  
- 训练导出走 ai-data 作业，**另桶另密钥**，不读检索热副本冒充训练仓  
