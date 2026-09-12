# agent-tools-mcp · 工具目录 vs MCP

> **样机诚实**：`AgentDef.tools[]` 是 **mock 卡片名字符串**（展示用）；无真工具执行、无 MCP server、无沙箱进程。HARNESS「Tools」描述目标形状。  
> **落地目标**：区分「产品工具目录」与「MCP/适配器传输」；工具副作用必须可映射到 **DomainCommand** 或 **只读**；执行进沙箱；禁工具直连 PG。

对齐：[../../HARNESS.md](../../HARNESS.md) · [../enterprise/agent-platform.md](../enterprise/agent-platform.md) · [agent-surface.md](./agent-surface.md)。

## 1. 两层概念（勿混）

| 层 | 是什么 | 例子 |
|----|--------|------|
| **工具目录（产品）** | Agent 声明的能力名 / 输入输出契约 / 是否有副作用 | `draft_claims`、`commercial_patent_search` |
| **MCP server / 适配器（传输）** | 把目录项接到具体实现（本地函数、HTTP、MCP、sidecar） | 某检索 MCP、文件只读 MCP、内部 command 适配器 |

- Catalog / UI 绑定的是**目录名**，不是某个 MCP 进程名。
- 可先无 MCP、用进程内适配器；引入 MCP 不改变 DomainCommand 纪律。
- **不假装**今日已有真 MCP。

## 2. 副作用纪律

| 工具结果类型 | 允许 | 禁止 |
|--------------|------|------|
| 只读 | 检索、聚类、摘要、校验报告 | 静默改 handoff / 发票 / 阶段 |
| 提案 | 生成草稿 artifact 文本，待 HITL | 未经闸直接 `ApproveHandoff` |
| 写库 | 映射到具名 `DomainCommand` 再 dispatch | 工具内 UPDATE 案件表 / 自写 audit |

规则：

1. 每个有副作用的工具 → 文档写清「对应 CommandName / 或 none（只读）」。
2. HITL 闸通过后的写，仍走 `POST /v1/commands/dispatch`，`actor: 'agent'`。
3. 框架/MCP 的「成功」≠ 业务过闸。

## 3. 沙箱

| 项 | 要求 |
|----|------|
| 网络 | 默认出站白名单；商业检索等显式开 |
| 凭证 | **无** case-core PG 连接串；无租户主密钥 |
| 文件系统 | 临时工作区；案附件经对象存储 API，不挂整盘 |
| 超时 / 配额 | 单工具时限；失败可审计 |

DSH / Codex 自带沙箱能力可复用，但**领域写权限**不交给沙箱默认策略。

## 4. 单工具 vs 平台工具

| 类型 | 定义 | 演进 |
|------|------|------|
| **单工具（Agent 私有）** | 仅某 `AgentDef` 声明；强绑定 stage/handoff | 随该 Agent 版本发布 |
| **平台工具** | 多 Agent 复用（检索、绑案只读、格式校验） | 平台目录版本化；变更走 contracts/评测 |

样机：`tools[]` 仅为卡片；落地登记时标注 private / platform，避免私有实现偷偷变全局。

## 5. 样机 `tools[]` = mock 卡片

```text
AgentDef.tools: string[]  →  UI 展示「将调用」卡片
                ↛  真 HTTP/MCP
                ↛  真写库
AGENT_SCRIPTS             →  演示步骤回放
```

开发对照：改卡片名不等于实现工具；实现时先补目录契约与 Command 映射表，再接适配器。

## 6. 样机 vs 落地

| 项 | 样机今 | 落地目标 |
|----|--------|----------|
| 执行 | 无 | 适配器 + 可选 MCP |
| 映射表 | 散落 HITL→Command 文档 | 工具→Command/只读 显式表 |
| MCP | 无 | 可选传输；非产品真相源 |
| 评测 | 无强制 | ③ 层评测集挡回归 |

## 7. 相关链接

- [agent-plugins.md](./agent-plugins.md)（谁声明 tools）
- [../../COMMANDS.md](../../COMMANDS.md)
