# Domain Packs（领域包）索引

> Domain Pack = 预编排的领域 Bot 阵容 + 流程（flows）+ 知识库 + 产物规范（output_spec）+ HITL。  
> 运行时与 **Team（L2）共用同一多 bot 引擎**；差异在分工是否固化为 SOP。  
> 平台总览：[../agent-platform.md](../agent-platform.md)。

## 本目录

| 篇 | 路径 | 内容 |
|----|------|------|
| 专利 Pack · 设计 | [patent-pack-design.md](./patent-pack-design.md) | F1–F9 · 16 席 · **内/外循环** · Loop 总索引 · HITL×8 · Handoff · egress |
| 专利 Pack · 实现蓝图 | [patent-pack-impl.md](./patent-pack-impl.md) | BotRuntime / FlowEngine / validator / YAML 装配 · 四原型 · 排期 |
| 讨论源稿 / 定稿快照 | [../incoming/](../incoming/README.md) | 含 **AgentOS v1.1** 整包；文首指针指向正式稿 |
| AgentOS · UI 线框（快照） | [../incoming/AgentOS-design-docs-v1.1/agent-platform-ui-wireframes.md](../incoming/AgentOS-design-docs-v1.1/agent-platform-ui-wireframes.md) | 尚未升格正式篇；对照 product-apps / `apps/agent` |
| AgentOS · 专家资产台账（快照） | [../incoming/AgentOS-design-docs-v1.1/bot-expert-assets.md](../incoming/AgentOS-design-docs-v1.1/bot-expert-assets.md) | 16 bot × 四资产；叠 [agent-depth-reliability](../product-apps/agent-depth-reliability.md) |

## 与产品面

| 产品面 | 关系 |
|--------|------|
| [agent-patent-shell](../product-apps/agent-patent-shell.md) | 专利壳 IA；当前 Catalog 为 Pack **子集/过渡** |
| [agent-business-mode](../product-apps/agent-business-mode.md) | 业务冷启动（我的案子）；环边用人话，不暴露 Pack 黑话 |
| [agent-pack-loops-roadmap](../product-apps/agent-pack-loops-roadmap.md) | **环边三刀**：F5 内循环+跨席 · F6 N通 · F9→F3（样机无真沙箱） |
| [agent-l3-patent](../product-apps/agent-l3-patent.md) | 中台 STAGE / HandoffArtifactKey 映射 |
| [agent-platform-gap](../product-apps/agent-platform-gap.md) | 样机 ↔ Pack 目标差距 |

## 纪律

- 本目录**只写规格**；本轮不落 `packages/**` 真代码。  
- 端用户路径**禁止**中台 mid 可点深链当验收（映射 + DomainCommand 示意即可）。  
- 样机诚实：无真沙箱 / 无真 harness / 无真 validator 接线，直至 gap 页前置条件满足。
