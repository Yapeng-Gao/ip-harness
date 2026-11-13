# AGENT_STEPWISE_STRICT 修复报告 · Should×8 · 2026-09-19

| 项 | 值 |
|----|-----|
| **日期** | 2026-09-19 13:53 CST（Asia/Shanghai） |
| **基线评** | `docs/ui-polish/REVIEW_AGENT_STEPWISE_STRICT_2026-09-19.md` |
| **Must 基线** | `b0a0a00`（Must×7；本轮叠在当前 `dev` HEAD 上只做 Should） |
| **范围** | `apps/agent/**`（+ `apps/agent/src/agent.css`） |
| **typecheck** | `@ip/agent` **green** |
| **硬闸** | 保持：无 mid CTA · 无 BillingHold 全宽 · Home case entry=1 · ART/ATT · filter URL |
| **逻辑** | 无 HITL/DomainCommand **逻辑**变更 · 仅呈现/文案/布局 |
| **Cloud Agent** | 未使用 |

## Should 逐项勾选

| ID | 验收 | 结果 | AFTER 证据 |
|----|------|------|------------|
| **SS-S-S0-1** Home | 双行 11px 产品 meta → 一行或「说明」popover | ✅ | `S0/S0-home-after.png` · `[data-testid=home-meta-help]` 默认合上 |
| **SS-S-S3-1** Timeline | 同工具重复调用行 → 可展开组；细节默认折叠 | ✅ | `S3/S3-timeline-after.png` · `调用组 · OA 争点分析 ×2` |
| **SS-S-S4-1** HITL 右栏 | HITL 时右栏次要块默认折叠 | ✅ | `S4/S4-hitl-after.png` · `[data-testid=aside-hitl-collapse]` 默认合上 |
| **SS-S-S5-1** 绑案后匹配条 | 已绑案后降级/收起「切换到该 Agent」 | ✅ | `S5/S5-bound-after.png` · route banner 要求 `!caseId` |
| **SS-S-S6-1** 列表 H1 | 「待确认会话」（非「待确认 · 通用历史」） | ✅ | `S6/S6-list-after.png` · H1=`待确认会话` |
| **SS-S-S7-1** Assist 卡 | 说明墙更短（line-clamp / 折叠） | ✅ | `S7/S7-catalog-after.png` · tier-note `-webkit-line-clamp: 1` |
| **SS-S-S8-1** 创建/列表/总控 | 去掉用户面 mock / DomainPack 行话 | ✅ | `S8/S8-list-after.png` · 「领域」「专利」· 样机案文案 |
| **SS-S-S9-1** 专家说明 | 人话步骤（非「布尔检索 → …」工程链） | ✅ | `S9/S9-expert-after.png` · 检索专家 description 人话 |

**Should 8/8 Pass** · 探针 `_probe.json`

## 活口抽检 URL（localhost:5175）

| 步 | URL |
|----|-----|
| S0 | http://127.0.0.1:5175/agent |
| S3 | http://127.0.0.1:5175/agent/sessions/sess-oa-1 |
| S4 | http://127.0.0.1:5175/agent/sessions/sess-oa-1?focus=hitl |
| S5 | http://127.0.0.1:5175/agent →「开始办理」→ 创建样机案并绑定 |
| S6 | http://127.0.0.1:5175/agent/sessions?filter=needs_human |
| S7 | http://127.0.0.1:5175/agent/agents |
| S8 | http://127.0.0.1:5175/agent/projects |
| S9 | http://127.0.0.1:5175/agent/projects/proj-demo-patent/bots/expert-search |

## 主要改动文件

- `apps/agent/src/pages/AgentHome.tsx` · `AgentSessionWorkspace.tsx`
- `apps/agent/src/components/session/SessionTimeline.tsx` · `SessionContextPanel.tsx`
- `apps/agent/src/components/case/CaseBindControls.tsx`
- `apps/agent/src/pages/projects/ProjectListPage.tsx`
- `apps/agent/src/projects/expertsPatent.ts` · `expertsGeneral.ts` · `ProjectFolderContext.tsx`
- `apps/agent/src/components/projects/ExpertHitlBridge.tsx`
- `apps/agent/src/agent.css`

## 硬闸自检

| 闸 | 结果 |
|----|------|
| mid CTA / `a[href*=5173]` | Pass（0） |
| BillingHold 全宽 | Pass（无） |
| Home case entry | Pass（=1） |
| filter URL | 保持（未改逻辑） |

## Blockers

无。

## SHA

`0fe67d5`（`0fe67d5a7a0f61f3b51b55a7b8ea8b69b544ec51`）


---
*AGENT_STEPWISE_STRICT Should×8 · 2026-09-19 13:53 CST*
