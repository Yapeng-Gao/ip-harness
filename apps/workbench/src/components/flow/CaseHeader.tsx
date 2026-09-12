import { useState, type ReactNode } from 'react'
import { AppLink } from '@shared/components/AppLink'
import { ArrowLeft, Building2, Scale, Bot } from 'lucide-react'
import type { HandoffArtifactKey, PatentCase, StageId } from '@ip/domain/types'
import { useApp } from '@shared/context/AppContext'
import { getStageMeta } from '@ip/domain'
import { RiskBadge } from '@shared/components/RiskBadge'
import { HandoffChip } from '@shared/components/HandoffChip'
import { ARTIFACT_FOR_STAGE } from '@ip/contracts'
import { FulfillmentModeBadge } from '@shared/components/FulfillmentModeBadge'
import { CurrentVersionBadge } from '../VersionPanel'
import { DeadlineChip } from './Deadline'
import { getRaciForStage } from '@shared/data/raci'

export function CaseHeaderBar({
  caseData,
  handoffKey,
  mainCta,
  backTo = '/workbench',
  backLabel = '返回工作台待办',
  agentAssist,
}: {
  caseData: PatentCase
  handoffKey?: HandoffArtifactKey
  mainCta?: ReactNode
  backTo?: string
  backLabel?: string
  /** Show 「知产 Agent 协助」 for research / OA / draft flows */
  agentAssist?: boolean
}) {
  const { role, workspace, visibleDocketEvents } = useApp()
  const meta = getStageMeta(caseData.stage)
  const key = handoffKey ?? ARTIFACT_FOR_STAGE[caseData.stage]
  const status = key ? (caseData.handoffs[key]?.status ?? 'drafting') : undefined
  const counterpart =
    role === 'enterprise' ? caseData.agencyName : caseData.enterpriseContact
  const receipt = key ? caseData.handoffs[key] : undefined
  const nextOfficial = [...visibleDocketEvents]
    .filter((e) => e.caseId === caseData.id && e.status !== 'done')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="mb-6">
      <AppLink
        to={backTo}
        className="btn-press mb-3 inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-1.5 py-1 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-ring"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> {backLabel}
      </AppLink>
      <div className="sticky-chrome surface-card p-3 sm:p-4">
        {/* One-line summary (default) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-slate-900 sm:text-lg">
            {caseData.title}
          </h1>
          <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700">
            {meta.name}
          </span>
          <DeadlineChip deadline={caseData.nextDeadline} compact />
          {status && <HandoffChip status={status} />}
          {(() => {
            const raci = getRaciForStage(
              caseData.stage,
              caseData.fulfillmentMode ?? 'delegated',
            )
            const side = role === 'enterprise' ? raci.enterprise : raci.agency
            const who = raci.agencyDisabled
              ? '企业自助'
              : side.R && side.A
                ? '本方执行+拍板'
                : side.R
                  ? '本方执行'
                  : side.A
                    ? '本方拍板'
                    : side.C
                      ? '本方咨询'
                      : '本方知会'
            return (
              <span
                className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600"
                title={raci.note}
              >
                谁该动 · {who}
              </span>
            )
          })()}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="btn-press focus-ring shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
            aria-expanded={expanded}
          >
            {expanded ? '收起' : '详情'}
          </button>
          {mainCta && <div className="flex flex-wrap gap-2">{mainCta}</div>}
          {agentAssist && (
            <AppLink
              to={`/agent?case=${caseData.id}`}
              className="btn-press focus-ring inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
              aria-label="知产 Agent 协助办理本案"
            >
              <Bot className="h-3.5 w-3.5 text-slate-500" aria-hidden />
              知产 Agent 协助
            </AppLink>
          )}
        </div>

        {expanded && (
          <div className="nest-inset mt-3 space-y-3 border-t border-slate-100 bg-slate-50/50 p-3 pt-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="font-mono text-xs text-slate-500">{caseData.caseNo}</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                {caseData.type}
              </span>
              <RiskBadge risk={caseData.risk} />
              <FulfillmentModeBadge mode={caseData.fulfillmentMode ?? 'delegated'} />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <DeadlineChip deadline={caseData.nextDeadline} />
              {nextOfficial && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium tabular-nums text-amber-800">
                  官方期限 {nextOfficial.dueDate} · {nextOfficial.title.split('·')[0].trim()}
                </span>
              )}
              {key && <CurrentVersionBadge caseId={caseData.id} handoffKey={key} />}
              <span className="inline-flex items-center gap-1">
                {role === 'enterprise' ? (
                  <Scale className="h-3.5 w-3.5" />
                ) : (
                  <Building2 className="h-3.5 w-3.5" />
                )}
                {caseData.fulfillmentMode === 'self_serve'
                  ? '办理模式：企业自助（未委托代理）'
                  : role === 'enterprise'
                    ? `承办代理所：${counterpart}`
                    : `企业联系人：${counterpart}`}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${workspace.brandColor} border-current/20 bg-white`}
              >
                {workspace.chipLabel}
              </span>
            </div>
            {status === 'filed' && receipt?.receiptNo && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900">
                <span className="font-medium">递交回执 · </span>
                <span className="font-mono">{receipt.receiptNo}</span>
                <span className="ml-2 text-slate-600">递交日 {receipt.filedAt}</span>
              </div>
            )}
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-100">
              <span className="font-medium text-slate-700">委托信息 · </span>
              {caseData.fulfillmentMode === 'self_serve'
                ? `企业自助办理 · 企业联系人 ${caseData.enterpriseContact}`
                : `承办代理所 ${caseData.agencyName} · 企业联系人 ${caseData.enterpriseContact}`}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function FlowHeader({
  title,
  subtitle,
  caseData,
}: {
  title: string
  subtitle: string
  caseData?: PatentCase
}) {
  const { role } = useApp()
  if (caseData) {
    const assistStages: StageId[] = ['pre_research', 'prosecution', 'drafting']
    return (
      <CaseHeaderBar
        caseData={caseData}
        agentAssist={assistStages.includes(caseData.stage)}
        mainCta={
          <div className="rounded-[var(--radius-md)] border border-slate-200/90 bg-slate-50 px-3 py-2 text-xs">
            <div className="text-slate-500">流程</div>
            <div className="font-medium text-slate-800">{title}</div>
          </div>
        }
      />
    )
  }
  return (
    <div className="mb-6">
      <AppLink
        to="/workbench"
        className="btn-press mb-3 inline-flex items-center gap-1.5 rounded-lg text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> 返回工作台待办
      </AppLink>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">{subtitle}</p>
        </div>
        <div className="surface-card px-3 py-2 text-xs">
          <div className="text-slate-500">工作区</div>
          <div className="font-medium text-slate-800">
            {role === 'enterprise' ? '企业租户' : '代理所租户'}
          </div>
        </div>
      </div>
    </div>
  )
}
