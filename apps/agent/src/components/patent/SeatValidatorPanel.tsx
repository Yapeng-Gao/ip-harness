import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, RefreshCw, Send } from 'lucide-react'
import {
  hasMockValidator,
  mockValidate,
  type ValidatorResult,
} from '../../projects/pack/patentValidator'
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
 * Mock validator + self-heal + handoff envelope (no real harness).
 */
export function SeatValidatorPanel({
  expertId,
  projectId,
  onPass,
  onHandoffAppend,
}: Props) {
  const { setThreadHitl, appendMessage, getThread } = useProjectFolder()
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<ValidatorResult | null>(null)
  const [envelope, setEnvelope] = useState<HandoffEnvelope | null>(null)
  const [worklogExtra, setWorklogExtra] = useState('')
  const packHitl = packHitlForSeat(expertId)
  const enabled = hasMockValidator(expertId)

  const thread = projectId ? getThread(projectId, expertId) : undefined

  const run = (nextAttempt: number) => {
    const r = mockValidate(expertId, nextAttempt)
    setAttempt(nextAttempt)
    setResult(r)
    if (r.pass) {
      onPass?.(r)
      if (projectId && packHitl) {
        setThreadHitl(projectId, expertId, true, packHitl.gate)
        appendMessage(projectId, expertId, {
          role: 'system',
          content: `【validator Pass】spec=${r.specName} · attempt=${r.attempt} → 已解锁 HITL（${packHitl.label} / ${packHitl.gate}）`,
          meta: { backend: 'mock' },
        })
      }
    } else if (projectId) {
      appendMessage(projectId, expertId, {
        role: 'system',
        content: `【validator Issue×${r.issues.length}】请自修复重跑（mock · 无真 harness）`,
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
    if (result.pass) return 'Pass · 可进 HITL'
    const blockers = result.issues.filter((i) => i.blocker).length
    return `Fail · blocker ${blockers} / total ${result.issues.length}`
  }, [result])

  if (!enabled) {
    return (
      <div
        className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] text-slate-400"
        data-testid="seat-validator-na"
      >
        本席暂无 mock validator 示意（非主链演示席）
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
          Mock validator
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
          onClick={() => run(1)}
          className="btn-press focus-ring inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-800"
          data-testid="validator-run"
        >
          产出→校验
        </button>
        <button
          type="button"
          onClick={() => run(Math.max(attempt, 1) + 1)}
          disabled={!result || result.pass}
          className="btn-press focus-ring inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-950 disabled:cursor-not-allowed disabled:opacity-40"
          data-testid="validator-self-heal"
        >
          <RefreshCw className="h-3 w-3" aria-hidden />
          自修复重跑
        </button>
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
