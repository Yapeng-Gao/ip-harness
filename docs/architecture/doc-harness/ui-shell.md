# UI 壳：三栏与交互

> **样机诚实**：静态/本地 React 壳即可；无协同光标、无真 OT、无 Word 插件。  
> **落地目标**：三栏信息架构稳定，右栏 Confirm 可映射落地审批暂停钩。

## 1. 布局

```text
┌────────────┬──────────────────────────┬─────────────────────┐
│ 左 · 文档树 │ 中 · 编辑器               │ 右 · Agent + HITL    │
│ 案卷章节    │ 当前章节正文              │ 会话 / 建议 diff     │
│            │                          │ ConfirmBar 示意      │
└────────────┴──────────────────────────┴─────────────────────┘
顶栏：案号 · stage「撰写/draft」· SKU 徽标 mock「wb.stage.draft」· 回中台深链（可选）
```

- 视口建议 ≥1280；左栏可折叠；右栏可折叠（折叠时 Confirm 以抽屉补）。

## 2. 左栏 · 文档树

- 树节点 = `Document` 下章节（MVP：摘要 / 权利要求 / 实施例）。
- 选中切换中栏；显示「有未确认建议」徽标（来自右栏 pending proposal）。
- 不在此栏直接 dispatch。

## 3. 中栏 · 编辑器

- MVP：章节标题 + `textarea` 或极简富文本（加粗/列表可选）。
- 显示当前 `revision` 序号与「相对上一版 diff 摘要」（只读条）。
- **禁止**：真 Word、OnlyOffice、协同编辑（标未来）。
- 用户手改正文 → 本地 dirty；保存可写一条 `DocumentRevision`（actor: user），与 Agent 建议分轨。

## 4. 右栏 · Agent + HITL

- 会话列表极简（单会话 MVP 即可）。
- 「试运行」：只追加 mock 建议卡片，**不**落库、**不**改正文。
- 「正式建议」：生成 `Proposal`（见 harness-loop），进入 Confirm。
- Confirm：展示建议 diff；**批准** → mock DomainCommand 形 dispatch → 新 revision；**驳回/请修改** → 不写 revision（可记会话消息）。

## 5. 关键交互（样机）

1. 打开种子案 → 默认章节「权利要求」。  
2. 点「生成建议」→ 右栏出现 mock diff。  
3. Confirm 批准 → 中栏正文更新为建议稿 + revision+1。  
4. 顶栏保持 `wb.stage.draft` mock 授权可见。
