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

## 轻评补记 · cross-shell-basket（`4681bd4`）

| 项 | 值 |
|----|-----|
| 对象 | [cross-shell-basket.md](./cross-shell-basket.md) |
| 日期 | 2026-09-18 |
| **结论** | **通过**（search 主审通过维持） |

| # | 尺子 | 结果 | 说明 |
|---|------|------|------|
| ① | 分端口 LS 诚实 | **过** | 不同 Vite 端口=不同 origin；即便写 LS 亦不可跨 :5182↔:5183… |
| ② | 目标契约清晰 | 过 | `Basket`/`BasketItem` + GET/POST/DELETE/dispatch；禁第二套 Hit schema |
| ③ | 样机最小示意不假装共享后端 | 过 | 默认 A 共享种子 ID + 诚实 toast；N2 不做真 basket API；禁五壳 bridge 扛篮 |
| ④ | 与 search / FTO 边界 | 过 | 下游只读篮/深链；dispatch 不写 case-core；对齐 fto deep-demo「不依赖跨口 LS」 |

**非阻塞**：实现侧 toast 文案须含「跨口未共享 LS」；B 方案 URL 快照仅演示勿默认。

