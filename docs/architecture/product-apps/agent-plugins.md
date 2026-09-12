# agent-plugins · AgentDef 插件模型

> **样机诚实**：专业 Agent = `AGENT_CATALOG` 里的 `AgentDef` 对象（TS 常量）；无独立发版管道、无远程插件包。  
> **落地目标**：**单个 Agent = 一条 AgentDef 插件**（prompt / tools / gates / tier / handoffKey…）；用**版本化 catalog** 独立演进/发布，**不要**拆成微服务乱炖。

类型权威：`packages/domain/src/types` → `AgentDef`。目录：`src/data/agents.ts`。纪律：[../../HARNESS.md](../../HARNESS.md)。

## 1. 插件形状（AgentDef）

| 字段 | 作用 |
|------|------|
| `id` / `name` / `specialty` / `description` | 身份与文案 |
| `stage` | 对齐领域 `StageId` |
| `tools[]` | 工具目录名（见 [agent-tools-mcp.md](./agent-tools-mcp.md)） |
| `hitlGates[]` | 本 Agent 必经人工闸 |
| `tier` / `tierNote?` | Core / Assist / Beta；诚实空态 |
| `handoffKey` | 与 workbench 交接键对齐 |
| `workbenchPath` | 深链办理台 |
| `systemPromptBrief` | UI/短提示（落地可扩完整 prompt 包） |
| `raciHint` / `whenToUse` / `inputsHint` / `outputsHint` / `guardrails` | Catalog 元数据 |
| `status` | active 等 |

Harness 运行时 **唯一**；专业 Agent **多个**插件挂载——不「一 Agent 一服务进程」。

## 2. 独立演进 / 发布（版本化 catalog）

推荐：

```text
catalog@version
  agent-research@1.2.0
  agent-claims@1.0.3
  …
```

| 做法 | 说明 |
|------|------|
| **要** | 变更 prompt/tools/gates 走 catalog 版本；评测门禁；兼容 `handoffKey` |
| **要** | Core/Assist/Beta 纪律写进发布说明；Beta 不进采购主路径 |
| **不要** | 每 Agent 独立微服务 + 独立库 + 独立 Command 方言 |
| **不要** | 绕过 `@ip/contracts` 私自加 CommandName |

与 C 混合：① runtime 可热插插件循环；**领域闸与写**仍在自有层。

## 3. 与 stage / workbench 对齐

| Agent 侧 | Workbench 侧 |
|----------|--------------|
| `stage` | Flow 所属 `StageId` |
| `handoffKey` | `STAGE_MODULES[].handoffKey` / contracts |
| `workbenchPath` | 如 `/workbench/research`、`/inventor` |
| HITL → Command | 与 Flow 批准/授权/付款同一命令名 |

交底 vs 立项：`disclosure_pack` ≠ `intake_quote`（Catalog 已分 Agent）；勿混交接键。

Auto 路由（样机 `suggestAgent`）：按交接/HITL、阶段、关键词推荐——落地可保留策略，数据改读真会话与案态。

## 4. 样机 vs 落地

| 项 | 样机今 | 落地目标 |
|----|--------|----------|
| 存储 | TS 数组 | 配置仓 / DB + 版本 |
| 发布 | 跟前端同发 | catalog 版本可独立促；壳读兼容集 |
| Runtime | 脚本回放 | DSH/Codex 加载同 id 插件清单 |
| 进程 | 无 | **仍**不按 Agent 拆微服务 |

## 5. 相关链接

- [workbench.md](./workbench.md) · [agent-surface.md](./agent-surface.md)
- [../enterprise/agent-topology.md](../enterprise/agent-topology.md)
