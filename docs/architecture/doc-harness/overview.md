# 为何另壳：doc-harness 总览

> **样机诚实**：现有五壳原型**零改动**；本壳是并行对照样机，不是替换 workbench/agent。  
> **落地目标**：验证「文档为中心 + 右侧 harness」是否比「表单 Flow + 另开会话」更适合权利要求等长文档节点。

## 1. 动机

coding IDE（左树 / 中编辑 / 右助手）心智强。知产 **draft 权利要求** 等节点本质是长文档，而非短表单。  
另开 `apps/doc-harness` 可：

- **不打扰**已评审的五壳联调与 e2e 端口口径；
- 单独试「章节树 + revision + HITL」；
- 用 mock 闸演示 `wb.stage.draft` SKU，而不默认拆 workbench 为多 Vite app（与 [product-apps/workbench](../product-apps/workbench.md)「默认同壳」一致）。

## 2. 与 workbench 关系

| | workbench `:5174` | doc-harness `:5178` |
|--|-------------------|---------------------|
| 职责 | 全阶段 Flow / stages | **仅**文档中心对照（MVP=draft 权利要求） |
| 代码 | **本规格禁止改** | 仅新壳 `apps/doc-harness`（实现阶段另派） |
| SKU | `STAGE_MODULES` + `wb.stage.*` | mock 展示「已授权 `wb.stage.draft`」 |
| 写库 | DomainCommand（样机仍可本地） | mock dispatch **形状对齐** DomainCommand；落 `DocumentRevision` |

深链（可选）：doc-harness → mid 案详只读；**勿**用本口相对 `Link` 跳 5174 业务页冒充同壳。

## 3. 与 agent:5175

agent 壳保留 Catalog/多会话。doc-harness **自带右栏会话**，专绑当前文档/章节，不替代 `apps/agent`。

## 4. 与 enterprise C 混合

| 层 | 本样机 | 落地 |
|----|--------|------|
| ① runtime | **mock** 建议脚本（无 LLM） | DSH 和/或 Codex app-server |
| ② 领域闸 | Confirm UI 示意 `HitlGateId` | 自有 Persona/HITL + DomainCommand |
| ③ 工具 | mock diff 卡片 | 真实工具/MCP；副作用仍经命令 |

## 5. 附录 · APP_PORTS（可选后期）

**本期**：`5178` 只写在 `apps/doc-harness` 的 Vite/`package.json`，**不**改 `packages/contracts` `APP_PORTS`。  

**可选后期 additive**（需总控开闸 + contracts PR）：向 `APP_PORTS` 增加 `docHarness: 5178` 与 `APP_DEV_URLS`，便于深链类型化。非 MVP 必做。
