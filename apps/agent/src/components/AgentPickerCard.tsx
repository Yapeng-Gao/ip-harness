import type { AgentDef } from '@shared/types'
import {
  HITL_GATE_LABELS,
  BETA_HONEST_COPY,
  agentTierNote,
} from '@shared/data/agents'
import { getStageMeta } from '@shared/data/stages'
import { toolCatalogLabel } from '@shared/data/sessions'
import { AgentTierBadge } from './AgentTierBadge'

const STATUS_LABEL: Record<string, string> = {
  active: '可用',
  beta: '试用',
  maintenance: '维护',
}

export type AgentPickerCardProps = {
  agent: AgentDef
  /** Highlight (e.g. deep-link from ?agent=) */
  highlight?: boolean
  /** Optional case binding hint under the CTA */
  caseHint?: {
    title: string
    stageShort: string
    mismatch?: boolean
  } | null
  /** Primary CTA */
  onStart: () => void
  startLabel?: string
  /** Catalog: expand when / inputs / guardrails / outputs */
  showDetails?: boolean
  /** id for scroll-into-view */
  id?: string
}

/**
 * Shared agent picker card — Catalog / Home density.
 * Six-section meta hierarchy in details; Core/Assist/Beta badge on face.
 * Visual-only polish (Deep W6); start/HITL semantics unchanged.
 */

/** P1-B · catalog meta: two-col dl + clamp + 「更多」 — visual only */
function AgentMetaSections({
  rows,
}: {
  rows: { label: string; value: string; title?: string }[]
}) {
  const primary = rows.slice(0, 3)
  const rest = rows.slice(3)
  return (
    <div className="agent-meta-grid" role="list">
      {primary.map((r) => (
        <div key={r.label} className="agent-meta-row" role="listitem" title={r.title}>
          <span className="agent-meta-label">{r.label}</span>
          <span className="agent-meta-value agent-meta-value--clamp">{r.value}</span>
        </div>
      ))}
      {rest.length > 0 && (
        <details className="agent-meta-more">
          <summary className="agent-meta-more-summary">更多 · {rest.length} 项</summary>
          <div className="agent-meta-more-body" role="list">
            {rest.map((r) => (
              <div key={r.label} className="agent-meta-row" role="listitem" title={r.title}>
                <span className="agent-meta-label">{r.label}</span>
                <span className="agent-meta-value agent-meta-value--clamp">{r.value}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

export function AgentPickerCard({
  agent: a,
  highlight,
  caseHint,
  onStart,
  startLabel,
  showDetails = false,
  id,
}: AgentPickerCardProps) {
  const stage = getStageMeta(a.stage)
  const blurb =
    (a.specialty || a.whenToUse || a.description).split(/[·\n]/)[0]?.trim() ||
    a.description
  const toolLabels = a.tools.map((t) => toolCatalogLabel(t))
  const toolPreview =
    toolLabels.length <= 4
      ? toolLabels.join(' · ')
      : `${toolLabels.slice(0, 4).join(' · ')} · +${toolLabels.length - 4}`
  const isBeta = a.tier === 'beta'
  const resolvedStart =
    startLabel ??
    (isBeta ? '试用 · 非闭环' : caseHint ? '启动' : '启动')

  return (
    <article
      id={id}
      className="agent-picker-card surface-card group"
      data-tier={a.tier}
      data-highlight={highlight ? 'true' : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="text-balance text-sm font-semibold tracking-tight text-slate-900">
              {a.name}
            </h3>
            <AgentTierBadge tier={a.tier} />
            {a.status === 'maintenance' && (
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-1.5 py-px text-[10px] font-medium text-slate-500">
                维护
              </span>
            )}
          </div>
          {showDetails && (
            <div className="mt-0.5 text-[11px] text-slate-400">
              {stage.name} · {STATUS_LABEL[a.status] ?? a.status}
            </div>
          )}
        </div>
      </div>

      <p className="agent-picker-card__blurb">{blurb}</p>

      {(isBeta || a.tier === 'assist') && (
        <details
          className="agent-picker-card__tier-note-details"
          data-tier={a.tier}
        >
          <summary className="agent-picker-card__tier-note-summary">
            <span
              className="agent-picker-card__tier-note"
              data-tier={a.tier}
              role="note"
            >
              {isBeta ? BETA_HONEST_COPY : agentTierNote(a)}
              {isBeta && a.tierNote && a.tierNote !== BETA_HONEST_COPY
                ? ` · ${a.tierNote.replace(/^Beta·非采购闭环[：:]?\s*/, '')}`
                : null}
            </span>
            <span className="agent-picker-card__tier-note-more">详情</span>
          </summary>
          <p className="agent-picker-card__tier-note-full text-xs leading-relaxed text-slate-600">
            {isBeta ? BETA_HONEST_COPY : agentTierNote(a)}
            {isBeta && a.tierNote && a.tierNote !== BETA_HONEST_COPY
              ? ` · ${a.tierNote.replace(/^Beta·非采购闭环[：:]?\s*/, '')}`
              : null}
          </p>
        </details>
      )}

            <div className="mt-auto flex flex-col gap-1 pt-2.5">
        <button
          type="button"
          onClick={onStart}
          className={
            isBeta
              ? 'ui-btn ui-btn-sm btn-press focus-ring w-full border border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100'
              : 'ui-btn ui-btn-sm ui-btn-primary btn-press focus-ring w-full'
          }
          aria-label={
            caseHint
              ? `${isBeta ? '试用' : '启动'} ${a.name}（带案 ${caseHint.title}）`
              : `${isBeta ? '试用' : '启动'} ${a.name}`
          }
        >
          {resolvedStart}
        </button>
        {caseHint ? (
          <span
            className="agent-picker-card__hint truncate"
            data-tone={caseHint.mismatch ? 'warn' : undefined}
            title={caseHint.title}
          >
            所选案 · {caseHint.stageShort}
            {caseHint.mismatch ? ' · 阶段与 Agent 可能错配' : ''}
          </span>
        ) : showDetails && !resolvedStart.includes('稍后关联') ? (
          <span className="agent-picker-card__hint" role="note">
            {isBeta ? '试用 · 稍后关联 · 非采购闭环' : '稍后关联'}
          </span>
        ) : null}
      </div>

      {showDetails && (
        <details className="mt-2.5 border-t border-slate-100/90 pt-2">
          <summary className="agent-picker-card__details-summary">
            详情
            {a.tools.length > 0 ? ` · 工具 ${a.tools.length}` : ''}
            {a.hitlGates.length > 0 ? ` · 需确认 ${a.hitlGates.length}` : ''}
          </summary>
          {/* P1-B · 两列定义列表 + 弱标签 + 超高「更多」— visual only */}
          <AgentMetaSections
            rows={[
              a.whenToUse ? { label: '何时用', value: a.whenToUse } : null,
              a.inputsHint ? { label: '输入', value: a.inputsHint } : null,
              a.outputsHint ? { label: '输出', value: a.outputsHint } : null,
              a.guardrails?.length
                ? { label: '护栏', value: a.guardrails.join(' · ') }
                : null,
              a.tools.length
                ? {
                    label: '工具',
                    value: toolPreview,
                    title: toolLabels.join(' · '),
                  }
                : null,
              {
                label: '谁负责',
                value: [
                  a.raciHint,
                  a.hitlGates.length > 0
                    ? `需确认 ${a.hitlGates.map((g) => HITL_GATE_LABELS[g]).join(' / ')}`
                    : null,
                  agentTierNote(a),
                ]
                  .filter(Boolean)
                  .join(' · '),
              },
            ].filter(Boolean) as { label: string; value: string; title?: string }[]}
          />
        </details>
      )}
    </article>
  )
}
