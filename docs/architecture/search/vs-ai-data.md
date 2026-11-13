# Search ≠ AI Data

| | **search**（本平面） | **ai-data** |
|--|----------------------|-------------|
| 目的 | 人对齐 + Agent **查专利/文献用法** | 大模型**训练语料** Pipeline |
| 主对象 | `SearchQuery` / `SearchHit` / `FamilyGroup` | `Dataset` / `DatasetVersion` / Manifest |
| 写 | 默认不写案；不写湖 | 发布 version；质量门；血缘 |
| 壳 | `apps/search:5182` | `apps/ai-data:5181` |
| 真源 | 无真检索后台（样机） | 无真 Spark/湖仓/PII（样机） |
| 下游 | Agent 只读工具；可选未来「引用进调研」经 command | ai-infra 训练/评测消费 dataset |

## 协作（可有、非必须）

- 脱敏导出 / 公开语料进入 **ai-data** 后，**不**经 search 壳当湖管理员。  
- search 命中若需进训练，须**另开**导出/标注流水线（ai-data），禁止从结果页「一键进湖」假装合规。

## 一句话

**Search 是找**；**AI Data 是养模型的粮仓。**
