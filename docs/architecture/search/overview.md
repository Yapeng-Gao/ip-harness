# 为何独立：Search 平面

> **样机诚实**：今日 Agent 工具名如 `commercial_patent_search` 多为卡片/空实现；无统一检索产品面。  
> **落地目标**：检索是**共享能力**——人对齐操作台与 Agent 适配器消费同一 Query/Hit 形状。

## 1. 问题

- 智慧芽 / Innojoy 类产品：语义/关键词/高级式、结果表、过滤、同族/法律状态是**同一引擎上的多入口**。  
- 若只在 Agent 里塞「搜一下」字符串，人或评审无法复现；若只做人机 UI 却给 Agent 另一套假 API，契约会分叉。  
- 检索**不是**训推语料 Pipeline（ai-data），也**不是**办案写路径（case-core）。

## 2. 原则

1. **人 UI 与 Agent API 同引擎形状**（同一 `SearchQuery` / `SearchHit` / `FamilyGroup` 概念）。  
2. 产品默认独立壳 **`apps/search:5182`**。  
3. **无真后台**；结果为内存种子 + 可点过滤/同族展开。  
4. **≠ ai-data**：不生产 dataset version、不写湖。  
5. 写案仍走 DomainCommand；检索默认**只读**（可「收藏到案」将来另开闸，样机可做空态按钮）。

## 3. 与现仓工具目录

对齐 `commercial_patent_search` / `cluster_hits` 等**只读**工具名：落地时适配器打本平面 API；样机 Agent 可深链到 :5182 演示，**不**假装已接真库。
