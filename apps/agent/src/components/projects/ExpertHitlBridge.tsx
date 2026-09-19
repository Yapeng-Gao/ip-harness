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
import { midCaseHref } from '../../lib/deepLinks'
import type { CommandName } from '@ip/domain'

const ACTION_LABEL: Record<string, string> = {
  approve_strategy: '批准策略',
  authorize_file: '授权递交',
  confirm_quote: '确认报价',
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
  const [toast, setToast] = useState<string | null>(null)
  const [ensuring, setEnsuring] = useState(false)

  const catalogId = expert.catalogAgentId
  const agent = catalogId ? getAgent(catalogId) : undefined
  const isEnterprise = workspace.kind === 'enterprise'

  const needHitl = !!thread.pendingHitl && expert.hitlGates.length > 0

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
      caseId: caseId || undefined,
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
    caseId,
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
    caseId && handoffKey ? getHandoff(caseId, handoffKey) : undefined

  const block = useMemo(() => {
    if (expert.id === 'expert-fto') {
      return {
        blocked: false,
        reason:
          'FTO 报告默认不写案；Confirm 仅确认口径（非法律入库）',
      }
    }
    if (!caseId) {
      return {
        blocked: true,
        reason: NO_CASE_GATE_REASON,
      }
    }
    if (hasBlockingInvoiceForCase(caseId)) {
      return { blocked: true, reason: '存在阻塞发票，授权类闸可能不可用' }
    }
    return { blocked: false }
  }, [expert.id, caseId, hasBlockingInvoiceForCase])

  const gateDisabledReason = useCallback(
    (g: HitlGateId): string | null => {
      if (expert.domainCommandCandidates.every((c) => c.command === null)) {
        if (expert.id === 'expert-fto') {
          // FTO 无案可确认口径（不写库）；其它闸仍禁
          return g === 'approve_strategy'
            ? null
            : 'FTO 样机仅开放策略确认口径'
        }
      }
      // P0 HITL：无案仅禁须案闸；approve_strategy / go_nogo 可点清
      if (!caseId && gateRequiresCase(g)) return NO_CASE_GATE_REASON
      if (g === 'authorize_file' && role !== 'enterprise') {
        return '仅企业可授权递交'
      }
      return null
    },
    [expert.domainCommandCandidates, expert.id, role, caseId],
  )

  const runHitl = useCallback(
    async (action: HitlSessionAction, opts?: { stepwise?: boolean; note?: string }) => {
      if (!sess) {
        setToast('尚未绑定底层会话')
        return
      }
      // FTO: confirm口径 only — still call sessionHitlAction if case-bound; else local ack
      if (
        expert.id === 'expert-fto' &&
        !caseId &&
        (action === 'approve_strategy' || action === 'approve')
      ) {
        setThreadHitl(projectId, expert.id, false)
        appendMessage(projectId, expert.id, {
          role: 'system',
          content:
            '已确认自由实施报告口径（本机草稿 · 未写入案件 · 非法律意见）。',
          meta: { backend: 'mock' },
        })
        setToast('自由实施口径已确认（未写库）')
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
        const effectiveCaseId = caseId || 'case-mock-l3'
        const payload: Record<string, unknown> =
          cmd === 'createCaseFromInsight'
            ? {
                type: cmd,
                title: 'L3 挖掘洞察建案（样机）',
                stage: 'decision',
                fromInsight: true,
                actor: 'agent',
              }
            : cmd === 'saveDraft'
              ? {
                  type: cmd,
                  caseId: effectiveCaseId,
                  handoffKey: 'draft_claims',
                  note: 'L3 Confirm → saveDraft 写库示意',
                  actor: 'agent',
                }
              : cmd === 'submitHandoff'
                ? {
                    type: cmd,
                    caseId: effectiveCaseId,
                    handoffKey: 'disclosure_pack',
                    note: 'L3 Confirm → submitHandoff 写库示意',
                    actor: 'agent',
                  }
                : {
                    type: cmd,
                    caseId: effectiveCaseId,
                    note: `L3 Confirm → ${cmd} 写库示意`,
                    actor: 'agent',
                  }
        const href = midCaseHref(effectiveCaseId)
        recordDomainCommandWrite({
          projectId,
          expertId: expert.id,
          command: cmd,
          payload,
          midCaseHref: href,
          note: `${writeCand.label} · ${reason}`,
        })
        void dispatchCommand(payload as never).catch(() => {
          /* local log already recorded */
        })
        appendMessage(projectId, expert.id, {
          role: 'system',
          content: `写库示意 · DomainCommand.${cmd} → mid ${effectiveCaseId} · ${reason}`,
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
        recordL3Write(`HITL ${action} · 样机内存（非真 case-core）`)
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
      caseId,
      sessionHitlAction,
      setThreadHitl,
      projectId,
      appendMessage,
      expert.domainCommandCandidates,
      recordDomainCommandWrite,
      dispatchCommand,
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
      <div className="px-2 py-1 text-[10px] text-slate-400">
        确认后写入案件 · 试运行不写
      </div>
      <SessionConfirmBar
        sessionId={sess.id}
        agent={agent}
        gates={gates}
        clearedGates={clearedGates}
        handoffStatus={handoffStatus}
        handoffKey={handoffKey}
        caseId={caseId}
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
