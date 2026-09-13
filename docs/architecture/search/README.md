# Search（检索样机平面）

> **样机诚实**：对标智慧芽 / Innojoy 的**用法与交互形状**；**无真检索后台**、无真专利库、无真同族权威源。  
> **落地目标（远期）**：人用 UI 与 Agent 工具走**同一查询/结果契约**；今日仅内存 mock。  
> **≠** [ai-data](../ai-data/README.md)（语料 Pipeline / dataset version）。

## 定调（冻结）

| 做 | 不做 |
|----|------|
| 人机三模式检索 UI + 结果/过滤/同族示意 | 真 ES / 向量库 / 商业库账号 |
| Agent **同引擎形状**的 API 契约（mock） | 与 `DomainCommand` 混写案 |
| 独立壳 `apps/search` **:5182**（不改 `APP_PORTS`） | 把检索塞进 ai-data / ops |

## 本目录

| 篇 | 内容 |
|----|------|
| [overview.md](./overview.md) | 为何独立平面；人+Agent 同形状 |
| [human-ui.md](./human-ui.md) | 三模式 · 结果 · 过滤 · 同族 |
| [agent-api-shape.md](./agent-api-shape.md) | Agent 侧查询/结果契约 |
| [deep-demo.md](./deep-demo.md) | 内存状态机（可点闭环规格） |
| [vs-ai-data.md](./vs-ai-data.md) | 与 ai-data 边界 |
| [REVIEW.md](./REVIEW.md) | 架构评审结论 |

## 产品壳

| 项 | 值 |
|----|-----|
| 路径 | `apps/search`（实现 Owner：检索服务助手） |
| 端口 | **5182**（app 内 Vite 固定；**不**改 `packages/contracts` `APP_PORTS`） |
| 说明 | 勿与 [dev-spec/app-topology](../dev-spec/app-topology.md) 里曾示意的后端 `agent-session` 端口号候选混淆——本篇是**前端样机壳** |

## 上游

- [enterprise/agent-topology](../enterprise/agent-topology.md)（工具只读检索） · [product-apps/agent-tools-mcp](../product-apps/agent-tools-mcp.md) · [ai-data](../ai-data/README.md)
