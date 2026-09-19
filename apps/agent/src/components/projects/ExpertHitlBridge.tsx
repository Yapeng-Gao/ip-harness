import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAgents, type HitlSessionAction } from '@shared/context/AgentContext'
import { useApp } from '@shared/context/AppContext'
import { getAgent } from '@shared/data/agents'
import { SessionConfirmBar } from '../session/SessionConfirmBar'
import {
  gateToAction,
  sortGatesForRole,
} from '../session/sessionGates'
import type { HitlGateId } from '@shared/types'
import type { ProjectExpertDef, ProjectThread } from '../../projects/types'
import { useProjectFolder } from '../../projects/ProjectFolderContext'

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
  const { workspace, role, getHandoff, hasBlockingInvoiceForCase } = useApp()
  const { bindSession, setThreadHitl, appendMessage } = useProjectFolder()
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
      goal: `${expert.name} · 项目 HITL：${expert.specialty}`,
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
        content: `已绑定底层会话 ${sess.id}（HITL Confirm → DomainCommand，backend=mock）`,
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
        blocked: false,
        reason: '未绑案件时 Confirm 仍走会话闸，写库命令可能被领域层拒绝',
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
          return g === 'approve_strategy'
            ? null
            : 'FTO 样机仅开放策略确认口径'
        }
      }
      if (g === 'authorize_file' && role !== 'enterprise') {
        return '仅企业可授权递交'
      }
      return null
    },
    [expert.domainCommandCandidates, expert.id, role],
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
            '已确认 FTO 报告口径（内存草稿 · 未写案 · 非法律意见）。backend=mock',
          meta: { backend: 'mock' },
        })
        setToast('FTO 口径已确认（未写库）')
        return
      }
      const r = await sessionHitlAction(
        sess.id,
        action,
        opts?.note,
        opts?.stepwise != null ? { stepwise: opts.stepwise } : undefined,
      )
      setToast(r.message)
      if (r.ok) {
        setThreadHitl(projectId, expert.id, false)
        appendMessage(projectId, expert.id, {
          role: 'system',
          content: `HITL ${action} → ${r.message}`,
          meta: { backend: 'mock' },
        })
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
    ],
  )

  if (!needHitl) return null

  if (!catalogId) {
    // General bots / orchestrator: local weak ack only — no patent catalog bind.
    return (
      <div className="flex items-center justify-between gap-2 border-t border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        <span>
          {expert.role === 'orchestrator'
            ? '总控席无 HITL 写库闸（只能拆派/汇总）。'
            : '弱确认 · 未绑专利 catalog · 不写 DomainCommand（通用 bot）。'}
        </span>
        {expert.role !== 'orchestrator' ? (
          <button
            type="button"
            className="btn-press focus-ring rounded border border-amber-400 bg-white px-2 py-1 text-[11px] font-medium"
            onClick={() => {
              setThreadHitl(projectId, expert.id, false)
              appendMessage(projectId, expert.id, {
                role: 'system',
                content: '已本地弱确认（无 catalog · 未写库）。backend=mock',
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
        正在绑定底层 AgentSession 以接入 Confirm → DomainCommand…
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
        写库路径：Confirm → sessionHitlAction → DomainCommand · 试运行不写 · 无真 LLM
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
