# 处理流水线（怎么处理）

## 1. 阶段总览

| 阶段 | 输入 | 输出 | 关键动作 |
|------|------|------|----------|
| **Acquire** | 源配置、时间窗、官方 bulk/API | Raw blob + 收据 | 限速、断点续传、校验 checksum |
| **Parse** | PDF/XML/HTML/JSON | 结构化 Draft | 专利 XML、论文 PDF、网页抽取 |
| **Normalize** | Draft | `SearchDocument` | 字段字典、语言、日期、国家码 |
| **Dedup** | Document | 主文档 + 别名 id | 号归一、DOI、标题指纹、同族预链 |
| **Enrich** | Document | +IPC/CPC、同族、引用、机构解析 | 规则 + 模型辅助（可异步） |
| **Gate** | Document | pass / quarantine | 许可证、PII、禁运、质量分 |
| **Publish-to-store** | pass | 湖分区 + 对象正文 | 按 `ingestDate`/`pubDate` 分区 |
| **Index** | 变更集 | 倒排增量 + 向量增量 | 见 [storage](./storage.md) / [retrieval](./retrieval.md) |

## 2. 专利特有处理

- **号标准化**：申请号/公开号/公告号多形态 → canonical + aliases  
- **全文与权利要求分段**：独立字段 `claims[]`、`description`、`abstract`；附图 OCR/说明可选异步  
- **法律状态**：另表或 `legalEvents[]`，低频更新管道  
- **同族**：优先权威家族 ID；缺失时用优先权链启发式，标记 `familyConfidence`  
- **引用**：前向/后向；用于排序特征与全景，不阻塞首发索引  

## 3. 论文 / 公开资料

- 论文：DOI、作者、机构、摘要、全文（许可允许时）、主题词  
- 公开网页/年报/标准：许可证与 `robots`/合同；强制 `license` 字段；失败进 quarantine  

## 4. 增量策略

| 模式 | 适用 | 说明 |
|------|------|------|
| 时间窗增量 | 官方周更/日更 | watermark 存元数据 |
| 号列表补洞 | 漏采修复 | 优先级队列 |
| 全文回填 | 先题录后全文 | 两阶段索引：metadata-first |
| 重解析 | 解析器升级 | 按 parserVersion 重放，出新 indexVersion |

## 5. 失败与隔离

- `quarantine`：质量/合规不过，可人工放行  
- `poison`：解析器崩溃样本，进毒样库，不进热索引  
- 所有阶段写 **处理记录**（jobId、阶段、耗时、错误码）供血缘  

## 6. 与样机 `/corpus` 的映射

样机「入库→发布索引」对应本篇 Acquire→Index 的**状态机外形**；真落地拆成独立作业与存储，而非浏览器内存。
