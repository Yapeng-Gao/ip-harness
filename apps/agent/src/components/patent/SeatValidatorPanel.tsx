import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, RefreshCw, Send } from 'lucide-react'
import {
  hasMockValidator,
  mockValidate,
  type ValidatorResult,
} from '../../projects/pack/patentValidator'
import {
  OA_BLOCKER_SELF_HEAL_MAX,
  SELF_HEAL_MAX,
} from '../../business/packLoops'
import {
  envelopeToWorklogLines,
  sampleEnvelopeForSeat,
  type HandoffEnvelope,
} from '../../projects/pack/patentHandoff'
import { packHitlForSeat } from '../../projects/pack/patentHitl8'
import type { ProjectExpertId } from '../../projects/types'
import { useProjectFolder } from '../../projects/ProjectFolderContext'

type Props = {
  expertId: ProjectExpertId
  projectId?: string
  /** Called when validator passes — parent may unlock HITL */
  onPass?: (result: ValidatorResult) => void
  /** Append handoff lines into process visibility */
  onHandoffAppend?: (lines: string) => void
}

/**
 * 样机校验 + self-heal + handoff envelope (no real harness).
 */
export function SeatValidatorPanel({
  expertId,
  projectId,
  onPass,
  onHandoffAppend,
}: Props) {
  const { setThreadHitl, appendMessage, getThread, getProject, patchProject } = useProjectFolder()
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<ValidatorResult | null>(null)
  const [envelope, setEnvelope] = useState<HandoffEnvelope | null>(null)
  const [worklogExtra, setWorklogExtra] = useState('')
  const [escalated, setEscalated] = useState(false)
  const packHitl = packHitlForSeat(expertId)
  const enabled = hasMockValidator(expertId)
  const isOaSeat = expertId === 'expert-oa'

  const thread = projectId ? getThread(projectId, expertId) : undefined

  /** Knife2：超范围 blocker · 0 次自修复 · 禁自动重试假闭环 */
  const runOaScopeBlocker = () => {
    setAttempt(1)
    setEscalated(true)
    setResult({
      seatId: expertId,
      specName: 'oa_scope_blocker',
      issues: [
        {
          code: 'oa.scope.no_basis',
          message:
            '超范围红线 · 修改无原始依据 · 需人工接手（0 次自修复，禁自动重试）',
          blocker: true,
        },
      ],
      pass: false,
      attempt: 1,
    })
    if (projectId) {
      appendMessage(projectId, expertId, {
        role: 'system',
        content:
          '【需人工接手】超范围 blocker · 自修复 0/0 · 已直接升级（禁静默重跑）',
        meta: { backend: 'mock' },
      })
    }
  }

  const run = (nextAttempt: number) => {
    if (escalated) return
    // Knife1：超 SELF_HEAL_MAX → 需人工接手，禁静默死循环
    if (nextAttempt > SELF_HEAL_MAX) {
      setAttempt(nextAttempt)
      setEscalated(true)
      setResult({
        seatId: expertId,
        specName: 'escalate',
        issues: [
          {
            code: 'escalate.human',
            message: '需人工接手 · 自修复已超上限（禁静默死循环）',
            blocker: true,
          },
        ],
        pass: false,
        attempt: nextAttempt,
      })
      if (projectId) {
        appendMessage(projectId, expertId, {
          role: 'system',
          content: `【需人工接手】检查未通过·已重试 ${SELF_HEAL_MAX}/${SELF_HEAL_MAX} · 已升级兜底`,
          meta: { backend: 'mock' },
        })
      }
      return
    }
    const r = mockValidate(expertId, nextAttempt)
    setAttempt(nextAttempt)
    setResult(r)
    if (r.pass) {
      onPass?.(r)
      if (projectId && packHitl) {
        const proj = getProject(projectId)
        if (
          !proj?.caseId &&
          (packHitl.gate === 'pay_unlock' ||
            packHitl.gate === 'confirm_quote' ||
            packHitl.gate === 'go_nogo')
        ) {
          patchProject(projectId, {
            caseId: 'case-mock-pack-hf',
            caseBindState: 'bound',
          })
        }
        setThreadHitl(projectId, expertId, true, packHitl.gate)
        appendMessage(projectId, expertId, {
          role: 'system',
          content: `【检查通过】已重试 ${r.attempt}/${SELF_HEAL_MAX} → 已到确认点（${packHitl.label}）`,
          meta: { backend: 'mock' },
        })
      }
    } else if (projectId) {
      appendMessage(projectId, expertId, {
        role: 'system',
        content: `【检查未通过·已重试 ${nextAttempt}/${SELF_HEAL_MAX}】请改后再跑（样机示意）`,
        meta: { backend: 'mock' },
      })
    }
  }

  const writeHandoff = () => {
    const env = sampleEnvelopeForSeat(expertId)
    if (!env) return
    if (result?.pass) {
      env.audit = {
        ...env.audit!,
        validator_results: 'pass',
      }
    }
    setEnvelope(env)
    const lines = envelopeToWorklogLines(env)
    setWorklogExtra((prev) => prev + lines)
    onHandoffAppend?.(lines)
    if (projectId) {
      appendMessage(projectId, expertId, {
        role: 'system',
        content: `【Handoff】${env.type} ${env.from} → ${env.to} · ${env.acceptance}`,
        meta: { backend: 'mock' },
      })
    }
  }

  const summary = useMemo(() => {
    if (!result) return null
    if (escalated && result.specName === 'oa_scope_blocker') {
      return `需人工接手 · 超范围 · 自修复 ${OA_BLOCKER_SELF_HEAL_MAX}/${OA_BLOCKER_SELF_HEAL_MAX}`
    }
    if (escalated) return `需人工接手 · 已重试 ${SELF_HEAL_MAX}/${SELF_HEAL_MAX}`
    if (result.pass) return `检查通过 · 重试 ${result.attempt}/${SELF_HEAL_MAX}`
    return `检查未通过·已重试 ${result.attempt}/${SELF_HEAL_MAX}`
  }, [result, escalated])

  if (!enabled) {
    return (
      <div
        className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] text-slate-400"
        data-testid="seat-validator-na"
      >
        本席暂无样机校验（非主链演示席）
      </div>
    )
  }

  return (
    <div
      className="space-y-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm"
      data-testid="seat-validator-panel"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-slate-800">
          样机校验
        </span>
        <span className="rounded bg-slate-100 px-1 text-[9px] text-slate-500">
          无真沙箱
        </span>
        {packHitl && (
          <span className="rounded border border-violet-200 bg-violet-50 px-1 text-[9px] text-violet-800">
            HITL{['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'][packHitl.n - 1]}{' '}
            {packHitl.label}
          </span>
        )}
        {thread?.pendingHitl && (
          <span className="rounded bg-amber-100 px-1 text-[9px] text-amber-900">
            HITL 已解锁
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => {
            setEscalated(false)
            run(1)
          }}
          className="btn-press focus-ring inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-800"
          data-testid="validator-run"
        >
          产出→校验
        </button>
        <button
          type="button"
          onClick={() => run(Math.max(attempt, 1) + 1)}
          disabled={!result || result.pass || escalated}
          className="btn-press focus-ring inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-950 disabled:cursor-not-allowed disabled:opacity-40"
          data-testid="validator-self-heal"
        >
          <RefreshCw className="h-3 w-3" aria-hidden />
          自动修好再跑（{Math.min(attempt, SELF_HEAL_MAX)}/{SELF_HEAL_MAX}）
        </button>
        <button
          type="button"
          onClick={() => run(SELF_HEAL_MAX + 1)}
          disabled={escalated || result?.pass}
          className="btn-press focus-ring inline-flex items-center gap-1 rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-950 disabled:cursor-not-allowed disabled:opacity-40"
          data-testid="validator-escalate"
        >
          演示超限→人工接手
        </button>
        {isOaSeat && (
          <button
            type="button"
            onClick={runOaScopeBlocker}
            disabled={escalated}
            className="btn-press focus-ring inline-flex items-center gap-1 rounded-md border border-rose-400 bg-rose-100 px-2 py-1 text-[11px] font-medium text-rose-950 disabled:cursor-not-allowed disabled:opacity-40"
            data-testid="validator-oa-blocker"
          >
            <AlertTriangle className="h-3 w-3" aria-hidden />
            超范围 blocker→需人工接手（0次）
          </button>
        )}
        <button
          type="button"
          onClick={writeHandoff}
          className="btn-press focus-ring inline-flex items-center gap-1 rounded-md border border-sky-300 bg-sky-50 px-2 py-1 text-[11px] font-medium text-sky-950"
          data-testid="handoff-write"
        >
          <Send className="h-3 w-3" aria-hidden />
          写 Handoff 信封
        </button>
      </div>

      {summary && (
        <div
          className={`flex items-center gap-1 text-[11px] font-semibold ${
            result?.pass ? 'text-emerald-700' : 'text-amber-800'
          }`}
          data-testid="validator-summary"
        >
          {result?.pass ? (
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
          )}
          {summary}
        </div>
      )}

      {result && result.issues.length > 0 && (
        <ul className="space-y-1" data-testid="validator-issues">
          {result.issues.map((iss) => (
            <li
              key={iss.code}
              className={`rounded border px-2 py-1 text-[10px] ${
                iss.blocker
                  ? 'border-rose-200 bg-rose-50 text-rose-900'
                  : 'border-amber-200 bg-amber-50 text-amber-900'
              }`}
            >
              <span className="font-mono text-[9px]">{iss.code}</span>
              <div>{iss.message}</div>
            </li>
          ))}
        </ul>
      )}

      {envelope && (
        <pre
          className="max-h-28 overflow-y-auto whitespace-pre-wrap rounded border border-sky-100 bg-sky-50/60 p-1.5 font-mono text-[9px] text-sky-950"
          data-testid="handoff-envelope"
        >
          {JSON.stringify(
            {
              id: envelope.id,
              type: envelope.type,
              from: envelope.from,
              to: envelope.to,
              acceptance: envelope.acceptance,
              audit: envelope.audit,
            },
            null,
            2,
          )}
        </pre>
      )}

      {worklogExtra && (
        <pre
          className="max-h-24 overflow-y-auto whitespace-pre-wrap rounded border border-amber-100 bg-amber-50/50 p-1.5 font-mono text-[9px] text-amber-950"
          data-testid="handoff-worklog-append"
        >
          {worklogExtra}
        </pre>
      )}
    </div>
  )
}
