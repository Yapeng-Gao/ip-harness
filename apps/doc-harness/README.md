# apps/doc-harness · 文档 Harness 并行样机

对照样机：左文档树 · 中章节 textarea · 右 Agent mock + HITL Confirm。  
**不改** mid / workbench / agent / ops / iam 业务代码；**不改** `packages/contracts` `APP_PORTS`（端口仅在本 app Vite 固定 **5178**）。

规格：`docs/architecture/doc-harness/`（overview / ui-shell / doc-model / harness-loop）。

## 启动

在 **repo 根**：

```bash
npm run dev:doc-harness
```

→ http://localhost:5178

```bash
npm run typecheck -w @ip/doc-harness
```

## 诚实边界

| 项 | 现状 |
|----|------|
| LLM | **无**真模型；建议稿为本地脚本改写（前缀/尾注标明 mock） |
| SSO / OIDC | **无**真身份；本壳自包含，不接 IAM 会话 |
| Harness runtime | **无** DSH / Codex / MCP；右栏为 mock 会话 |
| DomainCommand | mock dispatch **形状对齐**（`submitClaims` / `saveDraft`）；**不**写入 DomainCommand union，**不**经 case-core 执法 |
| Word / TipTap | MVP 仅 **textarea**；无真 Word、无 TipTap |
| 数据 | 内存 state；刷新即失 |

## 种子与绑定

- 案：`c-doc-1`（演示案 · 智能传感装置）
- 文档：`专利申请草稿`
- 三章：发明摘要 / 权利要求 / 实施例（默认打开 **权利要求**）
- 钉死：`stageId: drafting` · `handoffKey: draft_claims` · 顶栏 SKU mock `wb.stage.draft`

## Harness loop（样机）

1. **试运行**：生成 mock 建议预览，**不**落库、**不**进 Confirm 写入  
2. **正式建议**（「请 Agent 改写当前章」同义）：`DocProposal` → ConfirmBar  
3. **确认**：mock `{ command: { type: 'submitClaims', caseId }, meta: { actor: 'agent', agentId: 'doc-harness-mock', ... } }` → 新 `DocumentRevision`（actor=agent）并更新正文  
4. **拒绝**：丢弃建议；无 command、无 revision  
5. **保存草稿**：用户手改 → `saveDraft` revision（actor=user）

内部日志旁注可含 `doc.apply_revision` hint；对外 `revision.commandType` / 命令日志以 `submitClaims` / `saveDraft` 为准。

## 改动边界

优先只改 `apps/doc-harness/**`。根 `package.json` 仅加 script `dev:doc-harness`。禁止改五壳与 packages 行为。
