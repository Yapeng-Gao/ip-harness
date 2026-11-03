import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import {
  currentSeatForProgress,
} from '../../business/businessSeats'
import {
  MAIN_CHAIN_DEPTS,
  deptSlug,
  orgDeptByLeadSeat,
} from '../../departments/orgDepts'
import {
  peerDisplayLabel,
} from '../../departments/deptPageNarrative'
import {
  handoffIncompleteSentence,
  handoffPhaseFromStatus,
  handoffPhaseLabel,
  handoffStatusSentence,
} from '../../departments/handoffPhase'
import {
  confirmKindOf,
  deptStatus,
} from '../../departments/deptProgress'
import { useOrgConfig } from '../../departments/OrgConfigContext'

type Props = {
  caseId: string
  title: string
  summary?: string
}

/**
 * 本案概况 · §114/§118 次入口路牌（一期真源）
 * 案名 + 一句卡点 +「去当前部」；列表主路径已直达部台。
 * §118：卸薄八部（进部=大厅/部台侧栏）；卸「全部案子」（回列表走壳「项目」）。
 */
export function CaseCompanyHome({ caseId, title, summary }: Props) {
  const {
    getProgress,
    getPendingConfirms,
  } = useBusinessCases()
  const { deptLabel } = useOrgConfig()
  const prog = getProgress(caseId)
  const pending = getPendingConfirms(caseId)

  const currentSeat = useMemo(
    () =>
      currentSeatForProgress({
        stageId: prog.stageId,
        doneSeatIds: prog.doneSeatIds,
        moreSeatIds: prog.moreSeatIds,
      }),
    [prog.stageId, prog.doneSeatIds, prog.moreSeatIds],
  )
  const currentDept =
    orgDeptByLeadSeat(currentSeat) ?? MAIN_CHAIN_DEPTS[0]!
  const currentHref = `/agent/cases/${caseId}/depts/${deptSlug(currentDept.id)}`

  const currentSt = useMemo(
    () =>
      deptStatus({
        dept: currentDept,
        progress: prog,
        pending,
        confirmKind: confirmKindOf(currentDept),
      }),
    [currentDept, prog, pending],
  )

  const gapBlock = useMemo(() => {
    const phase = handoffPhaseFromStatus(currentSt)
    const deptName = deptLabel(currentDept)
    const del = prog.delegate
    let checkpoint: string
    if (phase === '待确认') {
      checkpoint = `卡点：${deptName}待你拍板`
    } else if (phase === '退回') {
      checkpoint = `卡点：${deptName}已驳回 · 回流补齐`
    } else if (phase === '齐套中') {
      checkpoint =
        handoffIncompleteSentence(currentDept.id) ??
        `卡点：${deptName}齐套中`
      if (!checkpoint.startsWith('卡点')) {
        checkpoint = `卡点：${checkpoint}`
      }
    } else if (phase === '已确认可往下') {
      checkpoint = `卡点：${deptName}已确认 · 可往下一部`
    } else {
      checkpoint = `卡点：当前停在${deptName} · ${handoffPhaseLabel(phase)}`
    }
    let nextStep =
      phase === '待确认'
        ? `下一步：进${deptName}右栏拍板`
        : `下一步：去${deptName}继续`
    if (del?.stepLabel) {
      nextStep = `下一步：${del.stepLabel}（计划）`
    } else if (prog.casePlan?.includes('下一步：')) {
      const m = prog.casePlan.match(/下一步[：:]\s*(.+)/)
      if (m?.[1]) nextStep = `下一步：${m[1].trim()}（计划）`
    }
    const whoPeers =
      currentDept.peers
        .slice(0, 3)
        .map((peer) =>
          peerDisplayLabel(currentDept.id, peer.id, peer.label),
        )
        .join(' · ') || deptName
    const who = del
      ? `谁在干：顾言已分发 · ${del.stepLabel}`
      : `谁在干：${whoPeers}`
    return {
      checkpoint,
      nextStep,
      who,
      statusLine: handoffStatusSentence(currentDept.id, currentSt),
    }
  }, [currentDept, currentSt, deptLabel, prog.delegate, prog.casePlan])

  /** §97：本案尚无开场材料时给下一步（去大厅交材料） */
  const noOpeningMaterials =
    !String(prog.casePlan ?? '').trim() &&
    !prog.delegate &&
    (prog.doneSeatIds?.length ?? 0) === 0 &&
    pending.length === 0 &&
    !String(summary ?? '').trim()

  return (
    <div
      className="mx-auto flex w-full max-w-3xl flex-col gap-4"
      data-testid="case-company-home"
      data-case-id={caseId}
      data-company-density="thin-wayfind-v118"
      data-page-title="本案概况"
      data-no-materials={noOpeningMaterials ? '1' : '0'}
    >
      <header className="min-w-0" data-testid="company-hero">
        <p
          className="text-[11px] font-medium text-slate-400"
          data-testid="company-page-eyebrow"
        >
          本案概况
        </p>
        <h1
          className="mt-0.5 text-balance text-[20px] font-semibold tracking-tight text-slate-900"
          data-testid="company-case-title"
        >
          {title}
        </h1>
        {summary ? (
          <p className="mt-1 text-[13px] text-slate-500" data-testid="company-case-summary">
            {summary}
          </p>
        ) : null}
      </header>

      {noOpeningMaterials ? (
        <section
          className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-5 text-center shadow-sm"
          data-testid="company-no-materials"
          data-empty-tone="office"
        >
          <p className="text-[15px] font-semibold text-slate-900">
            本案还没有开场材料
          </p>
          <Link
            to="/agent"
            className="btn-press focus-ring mt-3 inline-flex items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-[13px] font-semibold text-white hover:bg-slate-800"
            data-testid="company-no-materials-cta"
          >
            去大厅交材料
          </Link>
        </section>
      ) : null}

      {/* 薄路牌：一句卡点 + 去当前部（非营销大卡） */}
      <section
        className="rounded-lg border border-slate-200 bg-white px-4 py-3"
        data-testid="company-gap-cta"
        data-gap-density="thin"
        aria-labelledby="company-gap-title"
      >
        <p
          id="company-gap-title"
          className="text-[11px] font-medium text-slate-400"
        >
          本案卡点
        </p>
        <p
          className="mt-1 text-[15px] font-semibold leading-snug text-slate-900"
          data-testid="company-gap-checkpoint"
        >
          {gapBlock.checkpoint}
        </p>
        <p
          className="mt-1 text-[12px] text-slate-500"
          data-testid="company-gap-next"
        >
          {gapBlock.nextStep}
        </p>
        <p className="sr-only" data-testid="company-gap-who">
          {gapBlock.who}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Link
            to={currentHref}
            className="btn-press focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
            data-testid="company-go-current-dept"
          >
            去当前部 · {deptLabel(currentDept)}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <span
            className="text-[11px] tabular-nums text-slate-400"
            data-testid="company-pending-hint"
            data-pending={pending.length}
          >
            {pending.length > 0
              ? `要你拍 ${pending.length} · 左栏待办或部台右栏`
              : '拍板入口在左栏待办'}
          </span>
        </div>
        <p className="mt-2 text-[10px] text-slate-400">{gapBlock.statusLine}</p>
      </section>


      {/* 次要后勤 · 不抢首屏主链 */}
      <nav
        className="flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-slate-100 pt-3 text-[11px] text-slate-500"
        aria-label="本案次要入口"
        data-testid="company-logistics-links"
        data-secondary="1"
      >
        <Link
          to={`/agent/cases/${caseId}/depts/disclosure?docket=1`}
          className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
          data-testid="company-link-case-file"
        >
          案卷
        </Link>
        <span aria-hidden className="text-slate-300">
          ·
        </span>
        <Link
          to={`/agent/cases/${caseId}/billing`}
          className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
          data-testid="company-link-billing"
        >
          账单
        </Link>
        <span aria-hidden className="text-slate-300">
          ·
        </span>
        <Link
          to={`/agent/cases/${caseId}/members`}
          className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
          data-testid="company-link-members"
        >
          成员
        </Link>
        <span aria-hidden className="text-slate-300">
          ·
        </span>
        <Link
          to={`/agent/cases/${caseId}/professional`}
          className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
          data-testid="company-link-professional"
        >
          本案部门
        </Link>
      </nav>
    </div>
  )
}
