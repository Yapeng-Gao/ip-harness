import type { AgentDef } from '../../types'
import {
  HITL_GATE_LABELS,
  BETA_HONEST_COPY,
  agentTierNote,
} from '../../data/agents'
import { getStageMeta } from '../../data/stages'
import { toolCatalogLabel } from '../../data/sessions'
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
 * Shared agent picker card — used on Catalog (dense rows on Agent Home).
 * White surface, hairline border, hover lift; keeps business meta (HITL / tier / details).
 * Beta: honest copy + soft CTA (not one-click as Core closed loop).
 */
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
      className={`group flex h-full flex-col rounded-md border bg-white p-3.5 transition-shadow hover:shadow-sm ${
        highlight
          ? 'border-slate-400 ring-1 ring-slate-300'
          : isBeta
            ? 'border-amber-200/80 hover:border-amber-300'
            : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="text-sm font-semibold text-slate-900">{a.name}</h3>
            <AgentTierBadge tier={a.tier} />
            {a.status === 'maintenance' && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-px text-[10px] font-medium text-slate-500">
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

      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
        {blurb}
      </p>

      {(isBeta || a.tier === 'assist') && (
        <p
          className={`mt-1.5 text-[11px] leading-snug ${
            isBeta ? 'text-amber-900/90' : 'text-sky-900/80'
          }`}
          role="note"
        >
          {isBeta ? BETA_HONEST_COPY : agentTierNote(a)}
          {isBeta && a.tierNote && a.tierNote !== BETA_HONEST_COPY
            ? ` · ${a.tierNote.replace(/^Beta·非采购闭环[：:]?\s*/, '')}`
            : null}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-1 pt-2.5">
        <button
          type="button"
          onClick={onStart}
          className={
            isBeta
              ? 'btn-press focus-ring w-full rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-950 hover:bg-amber-100'
              : 'btn-press focus-ring cta-work w-full rounded-md px-3 py-1.5 text-xs font-medium'
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
            className={`truncate text-center text-[10px] leading-tight ${
              caseHint.mismatch ? 'text-amber-800' : 'text-slate-400'
            }`}
            title={caseHint.title}
          >
            所选案 · {caseHint.stageShort}
            {caseHint.mismatch ? ' · 阶段与 Agent 可能错配' : ''}
          </span>
        ) : showDetails ? (
          <span className="text-center text-[10px] text-slate-400">
            {isBeta ? '试用 · 稍后关联 · 非采购闭环' : '稍后关联'}
          </span>
        ) : null}
      </div>

      {showDetails && (
        <details className="mt-2 border-t border-slate-100 pt-2">
          <summary className="cursor-pointer text-[11px] text-slate-400 hover:text-slate-600">
            详情
            {a.tools.length > 0 ? ` · 工具 ${a.tools.length}` : ''}
            {a.hitlGates.length > 0 ? ` · 需确认 ${a.hitlGates.length}` : ''}
          </summary>
          <div className="mt-1.5 space-y-1.5 border-l-2 border-slate-100 pl-2.5">
            {a.whenToUse && (
              <p className="text-xs text-slate-600">
                <span className="text-[11px] font-medium text-slate-400">何时用 · </span>
                {a.whenToUse}
              </p>
            )}
            {a.inputsHint && (
              <p className="text-xs text-slate-600">
                <span className="text-[11px] font-medium text-slate-400">输入 · </span>
                {a.inputsHint}
              </p>
            )}
            {a.outputsHint && (
              <p className="text-xs text-slate-600">
                <span className="text-[11px] font-medium text-slate-400">输出 · </span>
                {a.outputsHint}
              </p>
            )}
            {a.guardrails?.length > 0 && (
              <p className="text-xs text-slate-600">
                <span className="text-[11px] font-medium text-slate-400">护栏 · </span>
                {a.guardrails.join(' · ')}
              </p>
            )}
            {a.hitlGates.length > 0 && (
              <p className="text-xs text-slate-600">
                <span className="text-[11px] font-medium text-slate-400">需确认 · </span>
                {a.hitlGates.map((g) => HITL_GATE_LABELS[g]).join(' · ')}
              </p>
            )}
            {a.tools.length > 0 && (
              <p className="text-xs text-slate-600" title={toolLabels.join(' · ')}>
                <span className="text-[11px] font-medium text-slate-400">工具 · </span>
                {toolPreview}
              </p>
            )}
            <p className="text-xs text-slate-500">
              <span className="text-[11px] font-medium text-slate-400">谁负责 · </span>
              {a.raciHint}
            </p>
            <p className="text-xs text-slate-600">
              <span className="text-[11px] font-medium text-slate-400">分层 · </span>
              {agentTierNote(a)}
            </p>
          </div>
        </details>
      )}
    </article>
  )
}
