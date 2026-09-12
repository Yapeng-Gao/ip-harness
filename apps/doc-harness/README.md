# apps/doc-harness · 文档 Harness 并行样机

对照样机：左文档树（案名标题）· 中 **TipTap 纸面文档** · 右 **批注 | Agent**（Tab；默认批注）+ HITL Confirm（在 Agent tab）。  
顶栏 **compact CaseSwitcher**（唯一入口）。  
**TipTap 批注样机 · 非 Word 修订/协同**（亦非 OnlyOffice / DOCX 批注 / 真 OT / 多人光标）。

**不改** mid / workbench / agent / ops / iam 业务代码；**不改** `packages/contracts` `APP_PORTS`（端口仅在本 app Vite 固定 **5178**）；**不碰** `apps/ai-infra`。

规格：`docs/architecture/doc-harness/`（overview / ui-shell / doc-model / harness-loop）。  
视觉：`docs/ui-polish/DESIGN_SYSTEM.md`（navy 主 CTA · surface-50 底 · accent 仅 focus/选中 · **勿乱紫**）。

## 启动

在 **repo 根**：

```bash
npm run dev:doc-harness
```

→ http://localhost:5178

```bash
npm run typecheck -w @ip/doc-harness
```

## 三案（CaseSwitcher · 仅顶栏）

| 短名 | caseId | stageId | handoff / SKU（示意 string） | 章节 |
|------|--------|---------|------------------------------|------|
| **撰写稿** | `c-draft-sensing` | `drafting` | `draft_claims` / `wb.stage.draft` | 发明摘要（≥3 段）· 权利要求（独立+≥3 从属）· 实施例（≥2 节） |
| **OA 答复** | `c-oa-response` | `prosecution` | `oa_response` / `wb.stage.prosecution` | 审查意见要点 · 答复策略 · 修改后权利要求 |
| **发明人交底** | `c-inventor-disclosure` | `inventor` | `inventor_disclosure` / `wb.stage.inventor` | 技术交底书 · 已有方案 · 附图说明（**locked** SKU 闸 mock） |

- 种子入口：`buildCaseBundle(caseId)` / `CASES[]`；App 按 caseId 加载整包 runtime（document + chapters + revisions + annotations）。
- 每案自有 Document、若干预置批注、≥1 条历史 revision（非空壳）。
- 切换案/章：清或换 proposal、批注焦点、选中章；**未保存策略见下**。

`Document.stageId` / `handoffKey` / `skuLabel` 在**本 app types** 放宽为 string 联合（含 `prosecution` / `inventor` 等），**未改** `@ip/contracts`。

## 能力表

| 能力 | 现状 |
|------|------|
| 多案切换 | **仅顶栏** compact `CaseSwitcher` · 左树保留案名标题 · ≥3 案 |
| TipTap 纸面 | 工具栏 · 页感 · annotation Mark |
| 批注 | 侧栏内联新建（**无** `window.prompt`）· Mark↔列表联动 · **已解决默认折叠** · 左树章旁未解决徽标 · orphan 提示 |
| Agent mock | 按 chapter key 模板改写 · 试运行/正式 · Confirm **置顶** · Diff **默认折叠** · 单列「当前 → 建议」 |
| 提案历史 | runtime `proposalHistory` · 采纳/拒绝/preview 结束归档 · 只读看 proposedBody |
| Revision 时间线 | 左树底面板 · 按当前章列 seq/actor/commandType/时间/note · 只读预览 · Confirm 后「恢复此版」写新 revision |
| 批注保真 | 采纳时按 quote 重挂 open 批注；失败 → orphan |
| SKU/章闸 | 附图说明 `locked` → 只读 + **加深** slate banner；`authorized:false` 类型已预留 |
| 未保存离开 | **自动 saveDraft** + 顶栏「已自动保存 · {章名}」（与 dirty 互斥） |
| Cmd/Ctrl+S | 保存草稿 |
| 命令日志 | 带 `caseId`，右栏按案过滤 |

## 诚实边界

| 项 | 现状 |
|----|------|
| LLM | **无**真模型；`mockRewriteChapter(key, title, body)` 按章模板改写（非时间戳包装） |
| SSO / OIDC | **无**真身份 |
| Harness runtime | **无** DSH / Codex / MCP |
| DomainCommand | mock dispatch **形状对齐**（`submitClaims` / `saveDraft`）；**不**写入 union，**不**经 case-core |
| Word / 协同 | **非** Word 修订/协同；正文 HTML + TipTap Mark |
| 数据 | 内存 state（按案 runtime Map）；刷新即失 |
| SKU 闸 | **mock** 只读横幅；申请开通按钮无真开通 |

## 批注保真策略（采纳建议）

**策略：按 quote 重挂（非「保留原 body marks 再叠建议」）。**

1. Agent 正式建议的 `proposedBody` 为干净模板 HTML（通常不含原 Mark）。
2. 用户 Confirm 写入时：对**本章仍 open** 的 annotations，若 proposed HTML 尚无对应 `data-annotation-id`，则在 HTML 中查找 `quote` 原文并包裹 `<mark …>`。
3. 找不到 quote → 该条 `orphan: true`：侧栏保留条目并提示「Mark 缺失」，纸面无高亮。
4. 已 resolved 不重挂。换章再回：body 与 annotations 仍在本案 runtime，Mark 随 HTML 保留。

实现：`src/lib/annotationFidelity.ts` → `reattachOpenAnnotationsByQuote`。

## 未保存离开策略

**自动保存（推荐策略已落地）：**

- 切换章或案前，若当前章 dirty 且可编（已授权且未 locked）→ 自动 `saveDraft` revision + 命令日志。
- 顶栏短暂显示「已自动保存 · {被保存章 title}」（dirty 时不显示，与保存 CTA 互斥）。
- 另：Cmd/Ctrl+S 手动保存（提示「已保存 · {章名}」）。

未采用 `window.confirm`，避免打断多案演示流。

## Revision 时间线 / 预览

1. 左树底 `RevisionTimeline`：按**当前章**列出 revisions。
2. 点条目 → 编辑器进 preview（editable false + 横幅「预览 revision #n · 返回编辑」）；**不**改 head body。
3. 「恢复此版」→ Confirm 对话框 → 新 revision（actor=user，note「恢复自 seq N」）并更新 chapter body。

## 批注 UX

1. 选中正文 → 工具栏「加批注」（空选区禁用）→ 切到批注 Tab，侧栏内联表单（预填 quote）提交。
2. 点 Mark ↔ 侧栏高亮（accent-soft）；**已解决默认隐藏**（可「显示已解决」）；左树当前章旁未解决数量徽标。
3. 空选区禁用；无批注 / 全解决 empty state：`surface-50` + caption + navy CTA。

## Harness loop（样机）

1. **试运行**：mock 建议预览 + 逐段对照，**不**落库、**不**进 Confirm 写入；结束/替换时进 `proposalHistory`  
2. **正式建议**：`DocProposal` → ConfirmBar（置顶）· Diff 默认折叠  
3. **确认**：mock dispatch `submitClaims` → 批注按 quote 重挂 → 新 revision（actor=agent）→ 归档 accepted  
4. **拒绝**：丢弃建议；无 command、无 revision → 归档 rejected  
5. **保存草稿** / 自动保存 / 恢复 revision：`saveDraft` revision（actor=user）

## 改动边界

只改 `apps/doc-harness/**`（+ 本 app 依赖 / 根 lockfile 如有）与本 README。禁止改五壳、`packages/**`、`APP_PORTS`、`apps/ai-infra`。
