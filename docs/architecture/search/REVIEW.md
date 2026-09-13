# search 架构评审记录

| 项 | 值 |
|----|-----|
| 评审角色 | 架构评审 |
| 对象 | `docs/architecture/search/`（README · overview · human-ui · agent-api-shape · deep-demo · vs-ai-data） |
| 对象 SHA | **`623df3d`**（`docs(architecture): add search plane (human+Agent same engine)`） |
| 日期 | 2026-09-13 |
| **结论** | **通过** |

## 尺子对照（总控点名）

| 尺子 | 结果 | 说明 |
|------|------|------|
| **人+Agent 同形状** | 过 | 共用 `SearchQuery`/`SearchHit`/`FamilyGroup`；禁 Agent 另一套 hit 字段；深演示「复制为工具参数」 |
| **≠ ai-data** | 过 | vs-ai-data 对照表；禁一键进湖；dataset 不在本平面 |
| **无真后台诚实** | 过 | `backend:'mock'` 必填；横幅；无 ES/向量/商业库 |
| **:5182 可落地** | 过 | 独立壳；不改 APP_PORTS；Owner=检索服务助手；与后端端口候选澄清 |
| **三模式+过滤+同族同族** | 过 | semantic/keyword/advanced 同结果管道；filters 写入 Query；FamilyGroup 预置 |
| 只读 / 禁混 DomainCommand | 过 | 不写案；导入案须另走 command+HITL |

## 非阻塞建议

1. 实现时 `SearchResponse.backend` UI 可见（deep-demo 验收已列）。
2. 类型冻入 `@ip/contracts` 属后期 additive，样机可先壳内 TS。
3. 仓内若已有 `apps/search/` 实现，对照 deep-demo 验收勾，不在本规格评审范围。

## 裁决

**通过。** 可总控总验。
