# Agent 逐步业务债复检 · P1 通用历史 + P2-S4 无案闸

> **日期**：2026-09-19（CST）· Owner：业务深度审计（B 席）  
> **对象 SHA**：`1b959d6`（`fix(agent): P1 通用历史心智 + P2 无案 Confirm 闸禁用`）  
> **基线**：`docs/audit/AGENT_STEPWISE_BIZ_2026-09-19.md`（`7057e37` 定稿；后续黄条 Won't 等）  
> **Owner 修复说明**：`docs/ui-polish/AGENT_STEPWISE_BIZ_FIX.md` · 自点证据 `docs/ui-polish/agent-stepwise-biz-fix/`  
> **性质**：只评不改产品码。

## 总判一行

所点两活口在 `1b959d6` **均已收**；`apps/agent/src` 无「全部会话」主标题字面；无案 Confirm 主闸芯片 `disabled` +「写入案件前须绑定」。未重开全宽黄条；未发现静默真写回潮。

## 活口对照

| 原债 | 活口 | 源码字面（`1b959d6`） | 判 |
|------|------|----------------------|-----|
| **P1** sessions「通用历史」 | `AgentSessionsList` H1 / context / 空态；`AgentSessionSidebar` 列表头·副文·底链·空态 | H1=`通用历史`（筛选取 `待确认 · 通用历史` 等）；副文「通用单聊历史 · 非项目文件夹」；底链「通用历史 →」；**无**「全部会话」 | **已收** |
| **P2-S4** 无案闸 disabled | Confirm 芯片；`gateDisabledReason`；`ExpertHitlBridge` | 无 `caseId` → `NO_CASE_GATE_REASON`=`写入案件前须绑定`；`disabled` + `data-testid=confirm-gate-no-case`；FTO `approve_strategy` 无案仍可确认口径（不写库）——例外诚实 | **已收** |

## 仍开（未在本复检范围，记账）

| 级 | 债 |
|----|-----|
| **P2** | ~~项目线程 ↔ sessions 未标签合流~~ → **已收**（`9598f6e` · 见 [合流复检](./AGENT_SESSIONS_THREADS_RECHECK_2026-09-19.md)） |
| **P2** | `pending_create` 死类型 |
| **P2** | Home 副文案偏领域闭环 |
| **Won't** | 全宽「样机 · 无真 LLM」琥珀黄条（禁恢复） |

## 计数（复检后）

P0=0 · P1=0 · P2=2（pending_create / Home 副文案；线程合流已收）· Won't=1

## 方法

静态读 `1b959d6` 树：`AgentSessionsList.tsx` · `AgentSessionSidebar.tsx` · `SessionConfirmBar.tsx` · `sessionGates.ts` · `AgentSessionWorkspace.tsx` · `ExpertHitlBridge.tsx`；交叉 Owner 自点说明与截图目录。未重跑浏览器（自点已有 `no-case-gate-ok.png` / `sessions-list.png`）。
