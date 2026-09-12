# 文档编辑器 + IP harness 并行样机（doc-harness）

> **样机诚实**：本规格描述**另开一壳**的对照样机；**不改**现有 mid/workbench/agent/ops/iam 五壳业务代码。今日无真 LLM、无真 Word、无真 SSO/MCP/harness runtime。  
> **落地目标**：用「IDE + coding harness」隐喻，演示**案卷章节编辑 + 右侧 Agent 建议/HITL**；闸门形状对齐 `@ip/contracts` DomainCommand；落地时接 enterprise **C 混合**（DSH/Codex + 自有闸）。

## 与五壳对照

| 面 | 端口 | 本规格关系 |
|----|------|------------|
| mid | 5173 | 不改；深链只读回案详可选 |
| workbench | 5174 | **不改代码**；本壳对照演示 `wb.stage.draft`（见 [STAGE_MODULE_SKU](../../workbench/STAGE_MODULE_SKU.md)） |
| agent | 5175 | 不改；会话/Confirm 交互可对照，本壳自带右栏 |
| ops / iam | 5176 / 5177 | 不改 |
| api-mock | 5180 | 可选 mock dispatch；**不**改 APP_PORTS |
| **doc-harness（新）** | **5178（app 内固定）** | 本目录；**不**写入 `APP_PORTS`（可选后期 additive 见 overview 附录） |

## 本目录

| 篇 | 回答什么 |
|----|----------|
| [overview.md](./overview.md) | 为何另壳；与 workbench/product-apps 关系 |
| [ui-shell.md](./ui-shell.md) | 三栏布局与交互 |
| [doc-model.md](./doc-model.md) | Document / Revision；draft 权利要求种子链 |
| [harness-loop.md](./harness-loop.md) | mock 建议 → Confirm → DomainCommand 形 mock dispatch |

## 已定设计（冻结）

1. 新壳 `apps/doc-harness`，Vite **5178**（仅 app 配置；不改 `packages/contracts` `APP_PORTS`）。
2. 三栏：左文档树 · 中编辑器 · 右 Agent 会话 + HITL Confirm。
3. 数据：`Document` / `DocumentRevision` 挂 `caseId` + `stageId` + `handoffKey`；MVP 钉 **draft 权利要求**（`stageId: drafting` · `handoffKey: draft_claims` · SKU `wb.stage.draft`）。
4. 编辑器 MVP：结构化章节 + textarea/简易富文本；**不上**真 Word；DOCX 导出标未来。
5. Harness loop：mock 建议 diff → Confirm → 形状对齐 DomainCommand 的 mock dispatch 落 revision；禁假装真 LLM。
6. 与 enterprise C 混合对齐：落地 DSH/Codex + 自有闸；本样机只示意闸。
7. STAGE_MODULE_SKU：本壳可演示 `wb.stage.draft` 授权（mock）；不改 workbench。
8. 诚实：无真 SSO / MCP / harness runtime。

## 上游

- [product-apps](../product-apps/README.md) · [enterprise](../enterprise/README.md) · [dev-spec](../dev-spec/README.md)
- [STAGE_MODULE_SKU](../../workbench/STAGE_MODULE_SKU.md) · [HARNESS](../../HARNESS.md) · [COMMANDS](../../COMMANDS.md)
