# AGENT_STEPWISE_STRICT 修复报告 · Must×7 · 2026-09-19

| 项 | 值 |
|----|-----|
| **日期** | 2026-09-19 13:18 CST（Asia/Shanghai） |
| **基线评** | `docs/ui-polish/REVIEW_AGENT_STEPWISE_STRICT_2026-09-19.md`（`41beb03`） |
| **范围** | `apps/agent/**` + 共享 `src/index.css` / `apps/agent/src/agent.css` |
| **typecheck** | `@ip/agent` **green** |
| **硬闸** | 保持：无 mid CTA · 无 BillingHold 全宽 · Home case entry=1 · ART/ATT · filter URL |
| **逻辑** | 无 HITL/DomainCommand **逻辑**变更 · 仅呈现/文案/布局 |
| **Cloud Agent** | 未使用 |

## Must 逐项勾选

| ID | 验收 | 结果 | AFTER 证据 |
|----|------|------|------------|
| **SS-M-S0-1** Home | 实心主 CTA 仅「开始办理」；Core 默认不占 compose 下整行；待确认弱于主 CTA | ✅ | `S0/S0-home-after.png` · Core 入「常用」`<details>`；chip 白底描边 |
| **SS-M-S2-1** 无案会话 | 实心主 CTA≤1（启动）；匹配条弱提示+文案钮；已匹配人话；空态锚句 | ✅ | `S2/S2-session-after.png` |
| **SS-M-S4-1** HITL Confirm | 「去补全」直达表；无 Full-check/Persona/HITL 对外；字≥12；「查看全部条件」 | ✅ | `S4/S4-confirm-after.png` |
| **SS-M-S6-1** 会话列表 | 搜索=1；新建=1；文案统一「新建会话」 | ✅ | `S6/S6-list-after.png` · H1「待确认会话」 |
| **SS-M-S7-1** Catalog | 启动 h≥36（实测 40）；「稍后关联」间距≥8px | ✅ | `S7/S7-catalog-after.png` |
| **SS-M-S8-1** general | 实心分派≤1；pill≥32/12；composer 内容带≥72（实测 140）；右栏非实心 | ✅ | `S8/S8-general-after.png` |
| **SS-M-S9-1** patent 专家 | 无全宽琥珀绑案；仅「推进一步」实心；下一步自洽；无 snake_case | ✅ | `S9/S9-expert-after.png` |

**Must 7/7 Pass** · 探针 ` _probe.json` · `allPass=true`

## 活口抽检 URL（localhost:5175）

| 步 | URL |
|----|-----|
| S0 | http://127.0.0.1:5175/agent |
| S2 | http://127.0.0.1:5175/agent →「开始办理」 |
| S4 | http://127.0.0.1:5175/agent/sessions/sess-oa-1?focus=hitl |
| S6 | http://127.0.0.1:5175/agent/sessions?filter=needs_human |
| S7 | http://127.0.0.1:5175/agent/agents |
| S8 | http://127.0.0.1:5175/agent/projects/proj-demo-general |
| S9 | http://127.0.0.1:5175/agent/projects/proj-demo-patent/bots/expert-search |

## 主要改动文件

- `apps/agent/src/pages/AgentHome.tsx` · `AgentSessionsList.tsx` · `projects/ProjectWorkspacePage.tsx`
- `apps/agent/src/components/AgentSessionSidebar.tsx` · `AgentPickerCard.tsx`
- `apps/agent/src/components/session/SessionWorkspaceHeader.tsx` · `SessionTimeline.tsx` · `SessionConfirmBar.tsx`
- `apps/agent/src/components/case/CaseBindControls.tsx`
- `apps/agent/src/components/projects/ProjectChatPane.tsx` · `ProjectTimelinePanel.tsx` · `ExpertHitlBridge.tsx`
- `apps/agent/src/projects/expertsPatent.ts` · `ProjectFolderContext.tsx`
- `apps/agent/src/agent.css` · `src/index.css`

## Should（顺手，不阻塞）

- SS-S-S0-1 meta 收一行
- SS-S-S6-1 H1「待确认会话」
- SS-S-S8-1 DomainPack 顶栏人话
- SS-S-S9-1 检索说明去工程词 / snake_case

## Blockers

无。

## SHA

见 git commit（本报告随 commit 写入后回填）。

---
*AGENT_STEPWISE_STRICT fix · 2026-09-19 13:18 CST*
