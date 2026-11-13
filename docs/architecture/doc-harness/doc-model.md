# 文档模型（Document / Revision）

> **样机诚实**：MVP 内存或 localStorage；无 Postgres、无对象存储正文。  
> **落地目标**：表可并入 case-core 或独立 `doc` schema；正文可进对象存储；版本与审计可追溯。

## 1. 绑定字段（冻结）

每份工作文档必须挂：

| 字段 | MVP 值（权利要求链） | 来源 |
|------|----------------------|------|
| `caseId` | 种子案 id（如 `c-doc-1`） | 与案聚合对齐 |
| `stageId` | `drafting` | `@ip/contracts` `StageId` |
| `handoffKey` | `draft_claims` | `ARTIFACT_FOR_STAGE.drafting` |
| SKU（展示） | `wb.stage.draft` | [STAGE_MODULE_SKU](../../workbench/STAGE_MODULE_SKU.md) |

## 2. 类型（规格级）

```ts
/** 样机规格 · 非已实现包导出 */
interface Document {
  id: string
  caseId: string
  stageId: 'drafting' // MVP 钉死；未来可扩
  handoffKey: 'draft_claims'
  title: string
  chapterIds: string[] // 有序
  headRevisionId: string
}

interface DocumentChapter {
  id: string
  documentId: string
  key: 'abstract' | 'claims' | 'embodiment'
  title: string // 摘要 / 权利要求 / 实施例
  sort: number
}

interface DocumentRevision {
  id: string
  documentId: string
  chapterId: string
  seq: number
  body: string
  actor: 'user' | 'agent'
  /** 若由建议落入，对齐 DomainCommand.type 字符串，如 submitClaims / saveDraft */
  commandType?: string
  parentRevisionId?: string
  createdAt: string
  note?: string
}
```

## 3. MVP 种子

- 1 案 · 1 Document · **3 章**：摘要 / 权利要求 / 实施例。  
- 每章至少 1 条初始 revision（actor: user，seed）。  
- 默认打开「权利要求」章。

## 4. 与 DomainCommand 映射（形状对齐，非真执法）

| 用户动作 | mock commandType（示例） | 效果 |
|----------|--------------------------|------|
| 用户保存草稿 | `saveDraft` | 新 revision actor=user |
| Agent 建议批准写入权利要求 | `submitClaims`（或规格约定的 draft 写入命令名） | 新 revision actor=agent；正文=建议稿 |
| 驳回建议 | （无 command） | 仅会话消息 |

样机 **不**跑 `canPerformHandoff` / guardrails；落地必须经 case-core。

## 5. 未来

- 导出 DOCX / PDF。  
- 多文档/多 stage。  
- revision 进 PG + 对象存储；审计 `AuditEntry` 同源。
