# incoming · 讨论源稿 / 定稿快照

> **纪律**：本目录保留外部定稿与讨论原文，**不擅自改内容**。日常开发以正式稿为准；对照时回链到这里。

## AgentOS 设计文档集 v1.1（2026-09-21 · 冻结快照）

**产品目标全景**（用户确认：当前 `apps/agent` 样机较接近此方向）。  
原件目录：`Downloads/AgentOS-design-docs-v1.1/` → 已原样归档：

**[AgentOS-design-docs-v1.1/](./AgentOS-design-docs-v1.1/)**（入口 [README](./AgentOS-design-docs-v1.1/README.md)）

| # | 快照文件 | 仓内正式 / 产品面对应 | 说明 |
|---|----------|----------------------|------|
| 1 | [agent-sandbox-platform-design.md](./AgentOS-design-docs-v1.1/agent-sandbox-platform-design.md) | [../agent-platform.md](../agent-platform.md) · [../enterprise/](../enterprise/README.md) | 平台技术方案；本仓另有较早 [agent-sandbox-platform-design.md](./agent-sandbox-platform-design.md) 单篇副本 |
| 2 | [patent-domain-pack-design.md](./AgentOS-design-docs-v1.1/patent-domain-pack-design.md) | [../domain-packs/patent-pack-design.md](../domain-packs/patent-pack-design.md) | F1–F9 · 16 bot · 内/外循环 · 时序；正式稿已吸收 v2 loops |
| 3 | [patent-domain-pack-implementation.md](./AgentOS-design-docs-v1.1/patent-domain-pack-implementation.md) | [../domain-packs/patent-pack-impl.md](../domain-packs/patent-pack-impl.md) | 运行时 / Validator / FlowEngine / 排期；本仓另有 [patent-domain-pack-impl.md](./patent-domain-pack-impl.md) |
| 4 | [agent-platform-ui-wireframes.md](./AgentOS-design-docs-v1.1/agent-platform-ui-wireframes.md) | **尚无独立正式稿** · 对照 [../product-apps/](../product-apps/README.md) | UI 线框 / IA / Tokens；样机对照 `apps/agent` |
| 5 | [bot-expert-assets.md](./AgentOS-design-docs-v1.1/bot-expert-assets.md) | **尚无独立正式稿** · 叠深度优化 | 16 bot × 四资产台账；对齐 [agent-depth-reliability](../product-apps/agent-depth-reliability.md) |
| — | [README.md](./AgentOS-design-docs-v1.1/README.md) | 本文索引 | 阅读地图与原则速记 |

### 与当前样机

| 样机 | 关系 |
|------|------|
| `apps/agent` :5175 | Solo/Team/Domain 入口已接近；剧本深度仍薄 → [agent-depth-reliability](../product-apps/agent-depth-reliability.md) |
| 业务模式 / 席=bot | [agent-business-mode](../product-apps/agent-business-mode.md) · [agent-seat-as-bot](../product-apps/agent-seat-as-bot.md) |
| Pack 环边样机 | [agent-pack-loops-roadmap](../product-apps/agent-pack-loops-roadmap.md) |
| 平台差距 | [agent-platform-gap](../product-apps/agent-platform-gap.md) |

**样机诚实**：今日无真沙箱 / 无真 harness / 无真商业库；v1.1 是目标设计，不等于已交付。

## 较早散落副本（保留，勿删）

| 文件 | 备注 |
|------|------|
| [agent-sandbox-platform-design.md](./agent-sandbox-platform-design.md) | 平台稿较早入库副本；完整 v1.1 见上表 |
| [patent-domain-pack-design.md](./patent-domain-pack-design.md) | 设计稿 v1 |
| [patent-domain-pack-design-v2-loops.md](./patent-domain-pack-design-v2-loops.md) | 内/外循环升级；已精修进正式 `patent-pack-design` |
| [patent-domain-pack-impl.md](./patent-domain-pack-impl.md) | 实现稿较早副本 |

## 归档规则

1. **新增外部定稿**：整包进 `incoming/<名>-vX.Y/`，保留原 README，再在本页登记一行。  
2. **吸收进正式稿**：改 `agent-platform.md` / `domain-packs/*` / `product-apps/*`，文首注明源快照路径；**不改**快照正文。  
3. **线框 / 资产台账**（v1.1 新增两篇）：待产品点头后再升格为正式篇；此前以快照 + 本页指针为准。
