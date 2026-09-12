# apps/doc-harness · 文档 Harness 并行样机

对照样机：左文档树 · 中 **TipTap 纸面文档** · 右 **批注 | Agent**（Tab；默认批注）+ HITL Confirm（在 Agent tab）。  
**TipTap 批注样机 · 非 Word 修订/协同**（亦非 OnlyOffice / DOCX 批注 / 真 OT / 多人光标）。

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
| LLM | **无**真模型；建议稿为本地脚本改写（HTML 标注段标明 mock） |
| SSO / OIDC | **无**真身份；本壳自包含，不接 IAM 会话 |
| Harness runtime | **无** DSH / Codex / MCP；右栏 Agent 为 mock 会话 |
| DomainCommand | mock dispatch **形状对齐**（`submitClaims` / `saveDraft`）；**不**写入 DomainCommand union，**不**经 case-core 执法 |
| Word / TipTap | **TipTap 批注样机 · 非 Word 修订/协同**；正文存 HTML（含 `annotation` Mark） |
| 批注 | 内存数组 + TipTap Mark 高亮；一层回复；解决/删除；**非**真协同 OT |
| 数据 | 内存 state；刷新即失 |

## 批注（MVP）

1. 选中正文 → 工具栏「加批注」（空选区禁用）→ prompt 输入内容  
2. TipTap 自定义 Mark `annotation`（attr `annotationId`）淡黄底+下划线；可点高亮  
3. 右栏「批注」列表：作者 mock「演示用户」、时间、摘录 quote；点条目滚动/选中 Mark  
4. 回复（一层）、解决/取消解决、删除（去记录 + unset Mark）  
5. 换章过滤；Agent 确认写入/`setContent` 可能冲掉 marks（样机诚实可接受）

## 种子与绑定

- 案：`c-doc-1`（演示案 · 智能传感装置）
- 文档：`专利申请草稿`
- 三章：发明摘要 / 权利要求 / 实施例（默认打开 **权利要求**）；章 `body` 为带标题/段落/列表的 HTML
- 权利要求预置 1 条批注 Mark（`ann-seed-1` · 「滤波与特征提取」）
- 钉死：`stageId: drafting` · `handoffKey: draft_claims` · 顶栏 SKU mock `wb.stage.draft`

## Harness loop（样机）

1. **试运行**：生成 mock 建议预览（HTML 可读预览 + 去标签对照），**不**落库、**不**进 Confirm 写入  
2. **正式建议**（「请 Agent 改写当前章」同义）：`DocProposal` → ConfirmBar（Agent tab）  
3. **确认**：mock `{ command: { type: 'submitClaims', caseId }, meta: { actor: 'agent', agentId: 'doc-harness-mock', ... } }` → 新 `DocumentRevision`（actor=agent）并用 `setContent` 同步中栏  
4. **拒绝**：丢弃建议；无 command、无 revision  
5. **保存草稿**：用户手改 → `saveDraft` revision（actor=user）

内部日志旁注可含 `doc.apply_revision` hint；对外 `revision.commandType` / 命令日志以 `submitClaims` / `saveDraft` 为准。

## 改动边界

优先只改 `apps/doc-harness/**`（本壳可加 TipTap 依赖；根 lockfile 随之更新）。根 `package.json` 仅加 script `dev:doc-harness`。禁止改五壳与 packages 行为。
