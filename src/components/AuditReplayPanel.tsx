import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import {
  AUDIT_SCHEMA_VERSION,
  COMMAND_LABELS,
  auditSchemaVersionLabel,
  isLegacyAudit,
  type AuditEntry,
} from '../domain/commands'

type Props = {
  entries: AuditEntry[]
  className?: string
  /** 链到「导出证据包」 */
  onExportEvidence?: () => void
}

function fmtAt(iso: string): string {
  if (!iso) return '—'
  return iso.length >= 19 ? iso.slice(0, 19).replace('T', ' ') : iso
}

function actorLabel(a: AuditEntry): string {
  if (a.actor === 'agent') {
    return a.agentId ? `agent:${a.agentId}` : 'agent'
  }
  return 'user'
}

/**
 * Enterprise Wave3 · 审计回放：按时间序逐步高亮本案命令（原型 · 内存 auditLog）
 */
export function AuditReplayPanel({ entries, className = '', onExportEvidence }: Props) {
  const chronological = useMemo(
    () =>
      entries
        .slice()
        .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0)),
    [entries],
  )

  const [step, setStep] = useState(0)

  useEffect(() => {
    setStep((s) => {
      if (chronological.length === 0) return 0
      return Math.min(s, chronological.length - 1)
    })
  }, [chronological.length])

  const current = chronological[step] ?? null
  const total = chronological.length

  const go = (n: number) => {
    if (total === 0) return
    setStep(Math.max(0, Math.min(total - 1, n)))
  }

  return (
    <div
      className={`rounded-2xl border border-[color-mix(in_srgb,var(--color-accent)_28%,transparent)] bg-accent-soft/50 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium text-slate-800">审计回放</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            按时间序回放本案领域命令 · schema{' '}
            <span className="font-mono tabular-nums">{AUDIT_SCHEMA_VERSION}</span>
            {' '}· 缺版本显示 legacy · 内存原型
          </p>
          {onExportEvidence ? (
            <button
              type="button"
              onClick={onExportEvidence}
              className="mt-1.5 text-[11px] font-medium text-accent-muted underline-offset-2 hover:underline focus-ring rounded"
            >
              导出证据包
            </button>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="btn-press inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus-ring disabled:opacity-40"
            disabled={total === 0 || step <= 0}
            onClick={() => go(0)}
            aria-label="第一条"
            title="第一条"
          >
            <ChevronsLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            className="btn-press inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus-ring disabled:opacity-40"
            disabled={total === 0 || step <= 0}
            onClick={() => go(step - 1)}
            aria-label="上一步"
            title="上一步"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <span className="min-w-[4.5rem] text-center text-xs tabular-nums text-slate-600">
            {total === 0 ? '0 / 0' : `${step + 1} / ${total}`}
          </span>
          <button
            type="button"
            className="btn-press inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus-ring disabled:opacity-40"
            disabled={total === 0 || step >= total - 1}
            onClick={() => go(step + 1)}
            aria-label="下一步"
            title="下一步"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            className="btn-press inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus-ring disabled:opacity-40"
            disabled={total === 0 || step >= total - 1}
            onClick={() => go(total - 1)}
            aria-label="最后一条"
            title="最后一条"
          >
            <ChevronsRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      {current ? (
        <div className="mb-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium text-accent-muted">
              当前步
            </span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                current.actor === 'agent'
                  ? 'token-info-soft'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {actorLabel(current)}
            </span>
            <code className="font-mono text-slate-800">
              {COMMAND_LABELS[current.command]}
            </code>
            <span
              className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums ${
                isLegacyAudit(current)
                  ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
                  : 'bg-emerald-50 text-emerald-800'
              }`}
              title="audit schemaVersion"
            >
              {auditSchemaVersionLabel(current.schemaVersion)}
            </span>
            <span className="ml-auto tabular-nums text-slate-400">{fmtAt(current.at)}</span>
          </div>
          <p className="mt-1.5 leading-relaxed text-slate-600">
            {current.detail || '（无结果摘要）'}
          </p>
        </div>
      ) : (
        <p className="mb-3 rounded-xl border border-dashed border-slate-200 bg-white/70 px-3 py-6 text-center text-xs text-slate-400">
          尚无领域命令 · 在工作台或知产 Agent 正式执行后可回放
        </p>
      )}

      <ul className="max-h-64 space-y-1 overflow-y-auto" role="listbox" aria-label="审计命令序">
        {chronological.map((a, i) => {
          const active = i === step
          const legacy = isLegacyAudit(a)
          return (
            <li key={a.id}>
              <button
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => go(i)}
                className={`btn-press flex w-full flex-wrap items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors focus-ring ${
                  active
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`tabular-nums ${active ? 'text-slate-200' : 'text-slate-400'}`}
                >
                  #{i + 1}
                </span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                    active
                      ? 'bg-white/20 text-white'
                      : a.actor === 'agent'
                        ? 'token-info-soft'
                        : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {actorLabel(a)}
                </span>
                <code className={`font-mono ${active ? 'text-white' : 'text-slate-700'}`}>
                  {COMMAND_LABELS[a.command]}
                </code>
                <span
                  className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums ${
                    active
                      ? 'bg-white/15 text-slate-50'
                      : legacy
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-emerald-50 text-emerald-800'
                  }`}
                >
                  {auditSchemaVersionLabel(a.schemaVersion)}
                </span>
                <span
                  className={`min-w-0 flex-1 truncate ${
                    active ? 'text-slate-200' : 'text-slate-500'
                  }`}
                >
                  {a.detail}
                </span>
                <span
                  className={`tabular-nums ${active ? 'text-slate-300' : 'text-slate-400'}`}
                >
                  {fmtAt(a.at)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
