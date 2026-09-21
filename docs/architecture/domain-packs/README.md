# Domain Packs（领域包）索引

> Domain Pack = 预编排的领域 Bot 阵容 + 流程（flows）+ 知识库 + 产物规范（output_spec）+ HITL。  
> 运行时与 **Team（L2）共用同一多 bot 引擎**；差异在分工是否固化为 SOP。  
> 平台总览：[../agent-platform.md](../agent-platform.md)。

## 本目录

| 篇 | 路径 | 内容 |
|----|------|------|
| 专利 Pack · 设计 | [patent-pack-design.md](./patent-pack-design.md) | F1–F9 · 16 席 · 五层逻辑 · HITL×8 · Handoff · egress |
| 专利 Pack · 实现蓝图 | [patent-pack-impl.md](./patent-pack-impl.md) | BotRuntime / FlowEngine / validator / YAML 装配 · 四原型 · 排期 |
| 讨论源稿 | [../incoming/](../incoming/) | 未删；文首指针指向正式稿 |

## 与产品面

| 产品面 | 关系 |
|--------|------|
| [agent-patent-shell](../product-apps/agent-patent-shell.md) | 专利壳 IA；当前 Catalog 为 Pack **子集/过渡** |
| [agent-l3-patent](../product-apps/agent-l3-patent.md) | 中台 STAGE / HandoffArtifactKey 映射 |
| [agent-platform-gap](../product-apps/agent-platform-gap.md) | 样机 ↔ Pack 目标差距 |

## 纪律

- 本目录**只写规格**；本轮不落 `packages/**` 真代码。  
- 端用户路径**禁止**中台 mid 可点深链当验收（映射 + DomainCommand 示意即可）。  
- 样机诚实：无真沙箱 / 无真 harness / 无真 validator 接线，直至 gap 页前置条件满足。
