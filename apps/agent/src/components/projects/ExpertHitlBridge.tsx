import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAgents, type HitlSessionAction } from '@shared/context/AgentContext'
import { useApp } from '@shared/context/AppContext'
import { getAgent } from '@shared/data/agents'
import { SessionConfirmBar } from '../session/SessionConfirmBar'
import {
  gateRequiresCase,
  gateToAction,
  NO_CASE_GATE_REASON,
  sortGatesForRole,
} from '../session/sessionGates'
import type { HitlGateId } from '@shared/types'
import type { ProjectExpertDef, ProjectThread } from '../../projects/types'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import type { CommandName } from '@ip/domain'
import { primaryHandoffKeyForExpert } from '../../projects/patentMidMap'
import { PACK_DEMO_PROJECT_ID } from '../../projects/pack/patentHitlWalk'
import { Link } from 'react-router-dom'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { confirmKindForSeat } from '../../business/businessSeats'

const ACTION_LABEL: Record<string, string> = {
  approve_strategy: '批准策略',
  authorize_file: '授权递交',
  confirm_quote: '确认报价',
  pay_unlock: '付款解锁',
  request_changes: '退回修改',
  approve: '批准',
}
function projectToolLabelSafe(action: string): string {
  return ACTION_LABEL[action] ?? action.replace(/_/g, '·')
}


type Props = {
  projectId: string
  expert: ProjectExpertDef
  thread: ProjectThread
  caseId?: string
}

/**
 * Bind a real AgentSession so Confirm → sessionHitlAction → DomainCommand stays intact.
 * Orchestrator / read-only FTO still surface honesty; no bypass of dispatchCommand.
 */
export function ExpertHitlBridge({
  projectId,
  expert,
  thread,
  caseId,
}: Props) {
  const { createSession, getSession, patchSession, sessionHitlAction } =
    useAgents()
  const { workspace, role, getHandoff, hasBlockingInvoiceForCase, dispatchCommand } = useApp()
  const { bindSession, setThreadHitl, appendMessage, recordDomainCommandWrite } = useProjectFolder()
  const {
    isBusinessCase,
    prepareConfirm,
    confirmItem,
    returnItem,
    getPendingConfirms,
  } = useBusinessCases()
  const bizCase = isBusinessCase(projectId)
  const effectiveCaseId = caseId || (bizCase ? projectId : undefined)
  const bizPending = bizCase
    ? getPendingConfirms(projectId).find((c) => {
        const kind = confirmKindForSeat(expert.id)
        return kind != null && c.kind === kind && c.status === 'pending'
      })
    : undefined
  const [toast, setToast] = useState<string | null>(null)
  const [ensuring, setEnsuring] = useState(false)

  const catalogId = expert.catalogAgentId
  const agent = catalogId ? getAgent(catalogId) : undefined
  const isEnterprise = workspace.kind === 'enterprise'

  const needHitl = !!thread.pendingHitl && expert.hitlGates.length > 0

  // 业务案：席交付过检 → 写入本案待确认（同一 store）
  useEffect(() => {
    if (!needHitl || !bizCase) return
    const kind = confirmKindForSeat(expert.id)
    if (!kind) return
    const existing = getPendingConfirms(projectId).find(
      (c) => c.kind === kind && c.status === 'pending',
    )
    if (existing) return
    prepareConfirm(projectId, kind)
  }, [needHitl, bizCase, expert.id, projectId, getPendingConfirms, prepareConfirm])

  useEffect(() => {
    if (!needHitl || !catalogId || ensuring) return
    if (thread.boundSessionId && getSession(thread.boundSessionId)) {
      const sess = getSession(thread.boundSessionId)!
      if (sess.status !== 'needs_human' && !sess.hitlPending) {
        patchSession(sess.id, {
          status: 'needs_human',
          hitlPending: true,
        })
      }
      return
    }
    setEnsuring(true)
    const sess = createSession({
      goal: `${expert.name} · 项目确认：${expert.specialty}`,
      agentId: catalogId,
      caseId: effectiveCaseId || undefined,
      title: `项目闸 · ${expert.name}`,
      confirmedNonCoreTier: true,
    })
    if (sess) {
      patchSession(sess.id, {
        status: 'needs_human',
        hitlPending: true,
      })
      bindSession(projectId, expert.id, sess.id)
      appendMessage(projectId, expert.id, {
        role: 'system',
        content: `已接入确认条（会话 ${sess.id}）`,
        meta: { backend: 'mock' },
      })
    }
    setEnsuring(false)
  }, [
    needHitl,
    catalogId,
    thread.boundSessionId,
    thread.pendingHitl,
    ensuring,
    createSession,
    getSession,
    patchSession,
    bindSession,
    projectId,
    expert.id,
    expert.name,
    expert.specialty,
    effectiveCaseId,
    appendMessage,
  ])

  const sess = thread.boundSessionId
    ? getSession(thread.boundSessionId)
    : undefined

  const gates = useMemo(
    () =>
      sortGatesForRole(
        expert.hitlGates.length
          ? expert.hitlGates
          : (agent?.hitlGates ?? []),
        isEnterprise,
      ),
    [expert.hitlGates, agent?.hitlGates, isEnterprise],
  )

  const clearedGates = sess?.clearedHitlGates ?? []
  const handoffKey = agent?.handoffKey
  const handoffStatus =
    effectiveCaseId && handoffKey ? getHandoff(effectiveCaseId, handoffKey) : undefined

  const block = useMemo(() => {
    if (expert.id === 'expert-fto') {
      return {
        blocked: false,
        reason:
          'FTO 报告默认不写案；Confirm 仅确认口径（非法律入库）',
      }
    }
    if (!effectiveCaseId) {
      return {
        blocked: true,
        reason: NO_CASE_GATE_REASON,
      }
    }
    // 演示 mock 案不做发票硬挡（避免「能点进确认卡却交不了」）
    if (effectiveCaseId === 'case-mock-pack-hf') {
      return { blocked: false }
    }
    const inv = hasBlockingInvoiceForCase(effectiveCaseId)
    if (inv?.blocked) {
      return {
        blocked: true,
        reason: '还有未结清的费用，付款或签字确认暂时不能提交',
      }
    }
    return { blocked: false }
  }, [expert.id, effectiveCaseId, hasBlockingInvoiceForCase])

  const memoryOnly =
    expert.domainCommandCandidates.length > 0 &&
    expert.domainCommandCandidates.every((c) => c.command === null)

  const gateDisabledReason = useCallback(
    (g: HitlGateId): string | null => {
      // 样机仅内存确认的席（年费/转化/FTO 等）：只开放本席 hitlGates，禁「看起来能点其实点不动」
      if (memoryOnly) {
        if (expert.hitlGates.includes(g)) return null
        return '演示不可提交：本席未开放该确认项'
      }
      // P0 HITL：无案仅禁须案闸；approve_strategy / go_nogo 可点清
      if (!effectiveCaseId && gateRequiresCase(g)) return NO_CASE_GATE_REASON
      if (g === 'authorize_file' && role !== 'enterprise') {
        return '仅企业可授权递交'
      }
      return null
    },
    [memoryOnly, expert.hitlGates, role, effectiveCaseId],
  )

  const runHitl = useCallback(
    async (action: HitlSessionAction, opts?: { stepwise?: boolean; note?: string }) => {
      if (!sess) {
        setToast('尚未绑定底层会话')
        return
      }
      const isDemoPack =
        projectId === PACK_DEMO_PROJECT_ID || effectiveCaseId === 'case-mock-pack-hf'

      const finishMemoryConfirm = (detail: string) => {
        const gate = thread.pendingGate ?? expert.hitlGates[0]
        if (gate) {
          patchSession(sess.id, {
            clearedHitlGates: Array.from(
              new Set([...(sess.clearedHitlGates ?? []), gate]),
            ),
            hitlPending: false,
            status: 'done',
          })
        } else {
          patchSession(sess.id, { hitlPending: false, status: 'done' })
        }
        setThreadHitl(projectId, expert.id, false)
        appendMessage(projectId, expert.id, {
          role: 'system',
          content: `已确认 · ${projectToolLabelSafe(action)}（${detail}）`,
          meta: { backend: 'mock' },
        })
        setToast(`已确认（演示·内存）· ${projectToolLabelSafe(action)}`)
      }

      // 内存-only 席（年费⑦ / 转化⑧ / FTO…）：演示路径直接内存→已确认，不走发票/写库硬闸
      if (memoryOnly) {
        const allowed =
          expert.hitlGates.some((g) => gateToAction(g) === action) ||
          (expert.id === 'expert-fto' && action === 'approve_strategy')
        if (!allowed) {
          setToast('演示不可提交：本席未开放该确认项')
          return
        }
        finishMemoryConfirm(
          expert.id === 'expert-fto' && !effectiveCaseId
            ? '本机草稿 · 未写入案件 · 非法律意见'
            : '样机内存 · 非真缴费/签约',
        )
        return
      }

      const r = await sessionHitlAction(
        sess.id,
        action,
        opts?.note,
        opts?.stepwise != null ? { stepwise: opts.stepwise } : undefined,
      )
      setToast(r.message)

      const writeCand = expert.domainCommandCandidates.find(
        (c) => c.command != null,
      )

      const recordL3Write = (reason: string) => {
        if (!writeCand?.command) return
        const cmd = writeCand.command as CommandName
        const writeCaseId = effectiveCaseId || 'case-mock-l3'
        // Per-seat handoff key (audit 8049acd): disclosure→disclosure_pack, draft→draft_claims,
        // oa→prosecution_response; filing has null — never hard-bind claims.
        const seatKey = primaryHandoffKeyForExpert(expert.id)
        const payload: Record<string, unknown> =
          cmd === 'createCaseFromInsight'
            ? {
                type: cmd,
                title: 'L3 挖掘洞察建案（样机）',
                stage: 'decision',
                fromInsight: true,
                actor: 'agent',
              }
            : cmd === 'saveDraft' || cmd === 'submitHandoff' || cmd === 'submitClaims'
              ? {
                  type: cmd,
                  caseId: writeCaseId,
                  ...(seatKey ? { handoffKey: seatKey } : {}),
                  note: seatKey
                    ? `L3 Confirm → ${cmd} · ${seatKey}`
                    : `L3 Confirm → ${cmd}（本席无 handoff 键，不绑 claims）`,
                  actor: 'agent',
                }
              : {
                    type: cmd,
                    caseId: writeCaseId,
                    ...(seatKey && cmd === 'submitResearch' ? { handoffKey: seatKey } : {}),
                    note: `L3 Confirm → ${cmd} 写库示意`,
                    actor: 'agent',
                  }
        recordDomainCommandWrite({
          projectId,
          expertId: expert.id,
          command: cmd,
          payload,
          note: `${writeCand.label} · ${reason} · 中台节点示意案 ${writeCaseId}`,
        })
        void dispatchCommand(payload as never).catch(() => {
          /* local log already recorded */
        })
        appendMessage(projectId, expert.id, {
          role: 'system',
          content: `写库示意 · DomainCommand.${cmd} → mid ${writeCaseId} · ${reason}`,
          meta: { backend: 'mock' },
        })
        setToast(`DomainCommand.${cmd} 已记入 L3 写库示意`)
      }

      if (r.ok) {
        setThreadHitl(projectId, expert.id, false)
        appendMessage(projectId, expert.id, {
          role: 'system',
          content: `已确认 · ${projectToolLabelSafe(action)} → ${r.message}`,
          meta: { backend: 'mock' },
        })
        if (bizCase) {
          const kind = confirmKindForSeat(expert.id)
          const pending = kind
            ? getPendingConfirms(projectId).find(
                (c) => c.kind === kind && c.status === 'pending',
              )
            : undefined
          if (pending) confirmItem(pending.id)
        }
        recordL3Write(`HITL ${action} · 样机内存（非真 case-core）`)
      } else if (
        isDemoPack &&
        (action === 'pay_unlock' || action === 'confirm_quote')
      ) {
        // 演示项目⑦⑧：正式闸（无票等）失败时仍内存确认，避免假闭环
        finishMemoryConfirm(`正式闸未过（${r.message}）· 演示已内存确认`)
      } else if (writeCand?.command) {
        // Formal gate may block (e.g. disclosure not ready); still surface L3 write shape.
        recordL3Write(
          `正式闸未过（${r.message}）；仍记 DomainCommand 写库示意（样机）`,
        )
      }
    },
    [
      sess,
      expert.id,
      effectiveCaseId,
      sessionHitlAction,
      setThreadHitl,
      projectId,
      appendMessage,
      expert.domainCommandCandidates,
      expert.hitlGates,
      recordDomainCommandWrite,
      dispatchCommand,
      memoryOnly,
      thread.pendingGate,
      patchSession,
      bizCase,
      getPendingConfirms,
      confirmItem,
    ],
  )

  if (!needHitl) return null

  if (!catalogId) {
    // General bots / orchestrator: local weak ack only — no patent catalog bind.
    return (
      <div className="flex items-center justify-between gap-2 border-t border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        <span>
          {expert.role === 'orchestrator'
            ? '总控席无写库确认闸（只能拆派/汇总）。'
            : '弱确认 · 未绑专利目录 · 本席不写案件库（通用协作）。'}
        </span>
        {expert.role !== 'orchestrator' ? (
          <button
            type="button"
            className="btn-press focus-ring rounded border border-amber-400 bg-white px-2 py-1 text-[11px] font-medium"
            onClick={() => {
              setThreadHitl(projectId, expert.id, false)
              appendMessage(projectId, expert.id, {
                role: 'system',
                content: '已本地弱确认（未写库）。',
                meta: { backend: 'mock' },
              })
              setToast('弱确认完成（未写库）')
            }}
          >
            确认已阅
          </button>
        ) : null}
      </div>
    )
  }

  if (!sess) {
    return (
      <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        正在接入确认条…
      </div>
    )
  }

  return (
    <div className="shrink-0 border-t border-slate-200 bg-white">
      {toast && (
        <div className="border-b border-slate-100 px-3 py-1.5 text-[11px] text-slate-600">
          {toast}
        </div>
      )}
      {bizCase && (
        <div
          className="border-b border-amber-100 bg-amber-50/80 px-3 py-2 text-[11px] text-amber-950"
          data-testid="expert-biz-confirm-weld"
        >
          <div className="font-semibold">本案待确认（同源 store · 非平行宇宙）</div>
          {bizPending ? (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Link
                to={`/agent/pending/${bizPending.id}`}
                className="underline"
                data-testid="expert-biz-pending-link"
              >
                {bizPending.title}
              </Link>
              <button
                type="button"
                className="btn-press focus-ring rounded border border-amber-400 bg-white px-2 py-0.5 text-[10px] font-semibold"
                data-testid="expert-biz-confirm"
                onClick={() => {
                  confirmItem(bizPending.id)
                  setThreadHitl(projectId, expert.id, false)
                  setToast('已确认 · 业务进度已更新')
                }}
              >
                确认
              </button>
              <button
                type="button"
                className="btn-press focus-ring rounded border border-slate-300 bg-white px-2 py-0.5 text-[10px]"
                data-testid="expert-biz-return"
                onClick={() => {
                  returnItem(bizPending.id, '请按意见修改')
                  setToast('已退回 · 请按意见修改')
                }}
              >
                退回
              </button>
              <Link
                to={`/agent/cases/${projectId}?seat=${expert.id}`}
                className="text-[10px] text-slate-500 underline"
              >
                回案子工作台
              </Link>
            </div>
          ) : (
            <div className="mt-1 text-slate-600">交付后将写入待我确认…</div>
          )}
        </div>
      )}
      <div className="px-2 py-1 text-[10px] text-slate-400">
        {bizCase
          ? '业务案：确认/退回走待我确认 store；下方为专家台示意闸'
          : '确认后写入案件 · 试运行不写'}
      </div>
      <SessionConfirmBar
        sessionId={sess.id}
        agent={agent}
        gates={gates}
        clearedGates={clearedGates}
        handoffStatus={handoffStatus}
        handoffKey={handoffKey}
        caseId={effectiveCaseId}
        isEnterprise={isEnterprise}
        role={role}
        block={block}
        gateDisabledReason={gateDisabledReason}
        onGate={(g, opts) => {
          void runHitl(gateToAction(g), opts)
        }}
        onHitl={(action, opts) => {
          void runHitl(action, opts)
        }}
        onBlockedGateClick={(g, reason) => {
          setToast(`${ACTION_LABEL[g] ?? g} · ${reason}`)
        }}
        runMode="formal"
        focusGate={thread.pendingGate ?? null}
        focusHitl
      />
      {expert.domainCommandCandidates.length > 0 && (
        <div className="flex flex-wrap gap-1 border-t border-slate-100 px-3 py-1.5">
          {expert.domainCommandCandidates.map((c) => (
            <span
              key={c.label}
              className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600"
              title={c.note}
            >
              命令候选：{c.command ?? 'null（只读）'} · {c.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
