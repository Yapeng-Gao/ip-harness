# IP Agent UX · P0/P1/P2 落地笔记

日期：2026-09-11。范围：会话管理与会话页文案克制；不改 Command / 双产品 / 租户语义。

## P0

1. **会话管理**
   - 侧栏与「全部会话」共享 `sessionSearch`（标题 / 目标 / 案件名）
   - 重命名：侧栏 ⋯ 菜单、列表行操作、会话页标题旁「改名」
   - 归档：`AgentSession.archived`；默认列表隐藏；「已归档」筛选经 `showArchivedSessions`
   - `patchSession` / `archiveSession` 已挂到 `AgentContext`

2. **会话页少工程师腔**
   - 待你确认时突出「请你确认」条；「预览一下」/「开始办理」为次要或按状态降级
   - 页脚：「办理结果会写回业务台账（演示）」
   - 流式：「正在处理…」
   - 右栏默认折叠（`rightOpen` 初始 false）

3. **未关联案件**
   - 无 `caseId` 时琥珀条：「尚未关联案件，确认后不会写回中台」+「去选案件」聚焦关联下拉

## P1

4. **失败态**：`status === 'failed'` + `failReason`；「重试」→ `playMockSession(..., formal)`（种子 `sess-failed-1`）
5. **确认成功**：消息前缀「中台已更新」+「去看案件」链（有案件时）
6. **Tools / 架构总览**：`PageHeader` + 主 CTA（去选 Agent / 新建会话）
7. **会话列表**：整行进入会话；搜索与侧栏同步
8. **换 Agent**：「已换人办理，确认步骤需重来」（清空确认步骤）

## P2

9. **会话页拆分**：`AgentSessionWorkspace` 薄编排；确认条 / 时间线 / 右栏 / 输入区抽到 `src/components/agent/session/`
   - `SessionConfirmBar` · `SessionTimeline` · `SessionContextPanel` · `SessionComposer`
10. **换人办理**：清空 `clearedHitlGates`；文案「已换人办理，确认步骤需重来」；有已通过步骤时内联确认「换人后要重新确认，继续？」；Auto 建议切换后短暂展示理由芯片
11. **中台同步感知**：确认写回成功后翠绿条「中台案件已同步更新」+「打开案件」+「打开对应工作台」；案件详情 `?from=agent` 横幅「来自 IP Agent 的办理已写入」
12. **sessionSearch**：共享 `utils/sessionSearch.ts`（`matchSessionSearch` / `SessionSearchState`）；`AgentContextValue` 类型导出

## 验收

- `npm run build` 通过
- Vite `0.0.0.0:5173`
- 中文白话；UI 不出现 HITL 行话


## Apple Audit 14 项（2026-09-11）

对照 `AGENT_APPLE_AUDIT.md` P0 1–4 / P1 5–9 / P2 10–14 已全部落地：顶栏换人只读、单一主 CTA、侧栏筛选瘦身、字号 ≥12px、去行话、横幅队列、focus-ring、soft-card、Timeline 非调试、单一 Agent 选择器、Catalog/Home/Skills/材质收敛。详见审计文件「已落地」节。

## Apple Audit R2 闭环（2026-09-11）

对照 `AGENT_APPLE_AUDIT_R2.md`：确认态单一主 CTA（Composer 降级）、交接/期限中文、Go/No-Go 与工具 label 扫清、Sessions「办理人」、横幅/toast 互斥、菜单 focus-ring + Home focus-within、侧栏更多筛选并入 ⋯、Timeline/Composer soft-card、非会话隐藏顶栏 chip、中文去 uppercase、ConfirmBar 步进实心钮。详见该文件「已落地」节。

## Apple Audit R3 收口（2026-09-11）

对照 `AGENT_APPLE_AUDIT_R3.md`：新建会话去 Harness/mock/试运行（统一「预览」）、toast 仅在失败横幅时抑制、Home/WorkspaceMenu focus-ring、createSession 中文回退（自动匹配 / 请办理人处理 IP 任务）、HarnessOverview 去 tracking-wider。详见该文件「已落地」节。

## Page Review P2 + 去 AI 模板味（2026-09-11）

对照 `AGENT_PAGE_REVIEW.md` Top6 + 强化去模板味：评价为 **web apple-design**（非完整原生 HIG）。Shell 筛选收敛、洞察去硬编码、Catalog/Skills/Harness/Timeline P2 全落地；主 CTA 近黑、扁平行列表、去 Sparkles/糖果芯片。详见该文件「P2 + 去 AI 模板味」节。


## Page Review R4 residual（2026-09-11）

对照 `AGENT_PAGE_REVIEW_R4.md`：① indigo toast/产物选中/focus-ring → slate·emerald ② ContextPanel 发丝扁平行 ③ `defaultSessionGoal` 消灭模板句 ④ Catalog「开始」降密度 ⑤ Harness 五格积木→文字列表。详见该文件「已落地」节。
