import { Link } from 'react-router-dom'
import { ArrowRight, Bell, ChevronDown, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import {
  HANDOFF_PLAN_GATE_HONEST,
  confirmKindForPlanSlug,
  planAdvanceHandoffGate,
} from '../../business/handoffPlanGate'
import {
  KIT_STEP_SYNC_HONEST,
  kitProgressForPlanStep,
} from '../../business/kitStepSync'
import {
  currentSeatForProgress,
} from '../../business/businessSeats'
import {
  MAIN_CHAIN_DEPTS,
  PRE_DEPTS,
  POST_DEPTS_LIST,
  deptSlug,
  orgDeptByLeadSeat,
  type OrgDept,
  type OrgDeptId,
} from '../../departments/orgDepts'
import {
  peerDisplayLabel,
} from '../../departments/deptPageNarrative'
import {
  handoffIncompleteSentence,
  handoffPhaseFromStatus,
  handoffPhaseLabel,
  handoffStatusSentence,
  latestReturnNote,
} from '../../departments/handoffPhase'
import {
  confirmKindOf,
  deptStatus,
  rollupByDept,
} from '../../departments/deptProgress'
import { useOrgConfig } from '../../departments/OrgConfigContext'
import { DeptStatusDot } from '../departments/DeptStatusDot'
import { workbenchAskPath } from '../../business/pendingDeptQuery'
import { DeptSideDrawer } from '../departments/DeptSideDrawer'
import { ExpertAvatar } from '../departments/ExpertAvatar'
import { ThreeLineStatusStrip } from './ThreeLineStatusStrip'
import { HealthBillStrip } from './HealthBillStrip'

type Props = {
  caseId: string
  title: string
  summary?: string
}

/**
 * 公司首页 · 一期真源（大厅→公司→部台）；非 lifecycle 三档「项目」页
 * 墨色缺口卡（卡点/下一步/谁在干）+ 最近案条 + 当前部默认露出（其余可折）
 * + 八部抽屉进干活；浅色壳；禁假指标/执行集群
 */
export function CaseCompanyHome({ caseId, title, summary }: Props) {
  const {
    getProgress,
    getPendingConfirms,
    getCaseConfirms,
    cases,
    advancePlanChainStep,
    seedPlanHandoffPass,
    getKitChecklist,
    seedKitComplete,
  } = useBusinessCases()
  const { deptLabel } = useOrgConfig()
  const [moreOpen, setMoreOpen] = useState(false)
  const [mapExpanded, setMapExpanded] = useState(false)
  const [drawerDeptId, setDrawerDeptId] = useState<OrgDeptId | null>(null)
  const prog = getProgress(caseId)
  const pending = getPendingConfirms(caseId)

  const caseConfirms = getCaseConfirms(caseId)
  const activePlanStep = prog.delegate?.chain?.find((s) => s.status === 'active')
  const planKitChecklist = useMemo(() => {
    if (!activePlanStep) return []
    return getKitChecklist(caseId, activePlanStep.deptSlug)
  }, [activePlanStep, caseId, getKitChecklist, prog.kitDoneByDept])

  const planHandoffGate = useMemo(() => {
    if (!activePlanStep) return null
    return planAdvanceHandoffGate({
      activeDeptSlug: activePlanStep.deptSlug,
      confirms: caseConfirms,
      checklist: planKitChecklist,
    })
  }, [activePlanStep, caseConfirms, planKitChecklist])

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
    // 委托计划写入 progress 后，缺口卡反映计划下一步（示意）
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
      hasPlan: Boolean(del || prog.casePlan?.trim()),
    }
  }, [currentDept, currentSt, deptLabel, prog.delegate, prog.casePlan])

  const rollups = useMemo(
    () =>
      rollupByDept({
        cases,
        getProgress,
        pending: getPendingConfirms(),
      }),
    [cases, getProgress, getPendingConfirms],
  )

  const recentCases = useMemo(() => {
    const ranked = cases
      .map((c) => ({
        c,
        at: getProgress(c.id).updatedAt || c.createdAt || '',
      }))
      .sort((a, b) => b.at.localeCompare(a.at))
    const others = ranked.filter((r) => r.c.id !== caseId).slice(0, 4)
    const self = ranked.find((r) => r.c.id === caseId)
    return {
      selfTitle: self?.c.title ?? title,
      others: others.map((r) => r.c),
    }
  }, [cases, caseId, getProgress, title])

  const moreDepts: OrgDept[] = useMemo(() => {
    const mainIds = new Set(MAIN_CHAIN_DEPTS.map((d) => d.id))
    return [...PRE_DEPTS, ...POST_DEPTS_LIST].filter((d) => !mainIds.has(d.id))
  }, [])

  /** §97：本案尚无开场材料时给下一步（去大厅交材料） */
  const noOpeningMaterials =
    !String(prog.casePlan ?? '').trim() &&
    !prog.delegate &&
    (prog.doneSeatIds?.length ?? 0) === 0 &&
    pending.length === 0 &&
    !String(summary ?? '').trim()

  const drawerDept = useMemo(
    () =>
      drawerDeptId
        ? MAIN_CHAIN_DEPTS.find((d) => d.id === drawerDeptId) ?? null
        : null,
    [drawerDeptId],
  )

  const openDrawer = (id: OrgDeptId) => setDrawerDeptId(id)
  const closeDrawer = () => setDrawerDeptId(null)

  const renderDeptCard = (
    dept: (typeof MAIN_CHAIN_DEPTS)[number],
    i: number,
    opts?: { visuallyHidden?: boolean },
  ) => {
    const st = deptStatus({
      dept,
      progress: prog,
      pending,
      confirmKind: confirmKindOf(dept),
    })
    const active = dept.id === currentDept.id
    const selected = drawerDeptId === dept.id
    const roll = rollups[dept.id]
    const hidden = Boolean(opts?.visuallyHidden)
    return (
      <li
        key={dept.id}
        className={hidden ? 'hidden min-w-0' : 'min-w-0'}
        aria-hidden={hidden || undefined}
      >
        <button
          type="button"
          className={`btn-press focus-ring flex h-full w-full flex-col items-start gap-1 rounded-lg border px-2.5 py-2.5 text-left transition ${
            active
              ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
              : selected
                ? 'border-slate-400 bg-white text-slate-800 ring-2 ring-slate-300'
                : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
          }`}
          onClick={() => openDrawer(dept.id)}
          aria-pressed={selected}
          data-testid={`dept-map-card-${dept.id}`}
          data-active={active ? '1' : '0'}
          data-drawer-open={selected ? '1' : '0'}
          data-map-secondary={active || mapExpanded ? '0' : '1'}
        >
          <span className="flex w-full items-center gap-1.5">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                active
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {i + 1}
            </span>
            <DeptStatusDot status={st} withLabel={false} />
          </span>
          <span className="w-full truncate text-[12px] font-semibold leading-snug">
            {deptLabel(dept)}
          </span>
          <span
            className={`line-clamp-2 text-[10px] leading-snug ${
              active ? 'text-white/70' : 'text-slate-500'
            }`}
            data-testid={`dept-map-phase-${dept.id}`}
            data-handoff-phase={handoffPhaseFromStatus(st)}
          >
            {handoffPhaseFromStatus(st) === '齐套中'
              ? (handoffIncompleteSentence(dept.id) ??
                handoffPhaseLabel('齐套中'))
              : handoffPhaseLabel(handoffPhaseFromStatus(st))}
            {roll?.pendingCount && st !== '待确认'
              ? ` · 待确认 ${roll.pendingCount}`
              : ''}
          </span>
          <span
            className="mt-auto flex items-center pt-1.5"
            data-testid={`dept-map-avatars-${dept.id}`}
            aria-hidden
          >
            {dept.peers.slice(0, 3).map((peer, pi) => (
              <span
                key={peer.id}
                className={pi > 0 ? '-ml-1.5' : undefined}
                style={{ zIndex: 3 - pi }}
              >
                <ExpertAvatar
                  name={peerDisplayLabel(
                    dept.id,
                    peer.id,
                    peer.label,
                  )}
                  size="sm"
                  tone={active ? 'onDark' : 'light'}
                  seed={peer.id}
                />
              </span>
            ))}
          </span>
        </button>
      </li>
    )
  }

  return (
    <div
      className="mx-auto flex w-full max-w-5xl flex-col gap-3"
      data-testid="case-company-home"
      data-case-id={caseId}
      data-company-density="gap-first-v97"
      data-no-materials={noOpeningMaterials ? '1' : '0'}
    >
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
      {/* P0 · 墨色缺口卡 · 卡点/下一步/谁在干 */}
      <section
        className="rounded-xl border border-slate-900 bg-slate-900 p-4 text-white shadow-sm"
        data-testid="company-gap-cta"
        aria-labelledby="company-gap-title"
      >
        <p
          id="company-gap-title"
          className="text-[11px] font-medium uppercase tracking-wider text-white/60"
        >
          本案卡点
        </p>
        <p
          className="mt-1.5 text-[15px] font-semibold leading-snug"
          data-testid="company-gap-checkpoint"
        >
          {gapBlock.checkpoint}
        </p>
        <p
          className="mt-1 text-[12px] text-white/80"
          data-testid="company-gap-next"
        >
          {gapBlock.nextStep}
        </p>
        <p
          className="mt-0.5 text-[12px] text-white/70"
          data-testid="company-gap-who"
        >
          {gapBlock.who}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Link
            to={currentHref}
            className="btn-press focus-ring inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-900"
            data-testid="company-go-current-dept"
          >
            卡点 → 去当前部门
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          {pending.length > 0 ? (
            <Link
              to={workbenchAskPath(caseId, pending[0]!.kind, {
                confirmId: pending[0]!.id,
              })}
              className="btn-press focus-ring inline-flex items-center gap-1 rounded-full border border-amber-300/80 bg-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-50"
              data-testid="company-pending-link"
            >
              <Bell className="h-3 w-3" aria-hidden />
              待你拍 · {pending.length}
            </Link>
          ) : (
            <span
              className="text-[11px] text-white/50"
              data-testid="company-pending-link"
              data-pending="0"
              data-empty-tone="office"
              title="各部交卷后的硬请示会出现在这里"
            >
              暂无待你拍
            </span>
          )}
        </div>
        <p className="mt-2 text-[10px] text-white/45">{gapBlock.statusLine}</p>
      </section>

      {gapBlock.hasPlan ? (
        <section
          className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2.5"
          data-testid="company-plan-persist"
          aria-label="本案委托计划"
        >
          <p className="text-[11px] font-semibold text-emerald-950">
            本案排期（可接着办）
          </p>
          <p
            className="mt-1 whitespace-pre-wrap text-[11px] leading-relaxed text-emerald-900/90"
            data-testid="company-plan-text"
          >
            {(prog.casePlan ?? prog.delegate?.goalText ?? '').slice(0, 280)}
          </p>
          {prog.delegate?.chain && prog.delegate.chain.length > 0 ? (
            <ol
              className="mt-2 space-y-0.5"
              data-testid="company-plan-chain"
              aria-label="排期辅链"
            >
              {prog.delegate.chain.map((s, i) => {
                const kitMeta = kitProgressForPlanStep({
                  deptSlug: s.deptSlug,
                  kitDoneByDept: prog.kitDoneByDept,
                })
                return (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center gap-1.5 text-[11px] text-emerald-950/90"
                  data-testid={`company-plan-chain-${s.id}`}
                  data-status={s.status}
                  data-kit-phase={kitMeta.phase}
                  data-kit-done={String(kitMeta.done)}
                  data-kit-total={String(kitMeta.total)}
                >
                  <span className="tabular text-emerald-800/70">{i + 1}.</span>
                  <span
                    className={
                      s.status === 'skipped' ? 'line-through opacity-50' : ''
                    }
                  >
                    {s.label}
                  </span>
                  <span className="rounded-full bg-white/80 px-1.5 py-px text-[10px] font-medium text-emerald-900/80 ring-1 ring-emerald-200/80">
                    {s.status === 'active'
                      ? '本章在办'
                      : s.status === 'queued'
                        ? '其后待办'
                        : s.status === 'done'
                          ? '已办完'
                          : '已暂缓'}
                  </span>
                  {s.status !== 'skipped' ? (
                    <span
                      className={
                        kitMeta.phase === 'complete'
                          ? 'rounded-full bg-emerald-100/90 px-1.5 py-px text-[10px] font-medium text-emerald-900 ring-1 ring-emerald-300/70'
                          : kitMeta.phase === 'partial'
                            ? 'rounded-full bg-violet-50 px-1.5 py-px text-[10px] font-medium text-violet-900 ring-1 ring-violet-200/80'
                            : 'rounded-full bg-white/60 px-1.5 py-px text-[10px] font-medium text-emerald-900/55 ring-1 ring-emerald-100'
                      }
                      data-testid={`company-plan-chain-kit-${s.id}`}
                      title={KIT_STEP_SYNC_HONEST}
                    >
                      {kitMeta.short}
                    </span>
                  ) : null}
                </li>
                )
              })}
            </ol>
          ) : null}
          {prog.delegate ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Link
                to={`/agent/cases/${caseId}/depts/${prog.delegate.deptSlug}?delegate=1`}
                className="btn-press focus-ring inline-flex text-[11px] font-semibold text-emerald-950 underline-offset-2 hover:underline"
                data-testid="company-plan-go"
              >
                去本章 · {prog.delegate.stepLabel}
              </Link>
              {prog.delegate.chain?.some((s) => s.status === 'active') &&
              planHandoffGate ? (
                planHandoffGate.allow ? (
                  <button
                    type="button"
                    className="btn-press focus-ring rounded-full bg-emerald-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-800"
                    data-testid="company-plan-advance"
                    data-handoff-gate={planHandoffGate.code}
                    onClick={() => {
                      advancePlanChainStep(caseId)
                    }}
                  >
                    {prog.delegate.chain.some((s) => s.status === 'queued')
                      ? '本章办完 · 推进下一节'
                      : '本章办完 · 结排期'}
                  </button>
                ) : planHandoffGate.cta === 'go_confirm' ? (
                  <Link
                    to={(() => {
                      const kind = activePlanStep
                        ? confirmKindForPlanSlug(activePlanStep.deptSlug)
                        : null
                      const hit = kind
                        ? caseConfirms.find(
                            (c) => c.kind === kind && c.status === 'pending',
                          )
                        : undefined
                      return kind
                        ? workbenchAskPath(caseId, kind, {
                            confirmId: hit?.id,
                          })
                        : `/agent/cases/${caseId}`
                    })()}
                    className="btn-press focus-ring rounded-full bg-amber-800 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-amber-700"
                    data-testid="company-plan-go-confirm"
                    data-handoff-gate={planHandoffGate.code}
                  >
                    去拍板 · 通过后办完本章
                  </Link>
                ) : planHandoffGate.cta === 'go_kit' ? (
                  <Link
                    to={`/agent/cases/${caseId}/depts/${prog.delegate.deptSlug}?delegate=1&kit=1`}
                    className="btn-press focus-ring rounded-full bg-violet-800 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-violet-700"
                    data-testid="company-plan-go-kit"
                    data-handoff-gate={planHandoffGate.code}
                  >
                    先去勾齐套
                  </Link>
                ) : (
                  <Link
                    to={`/agent/cases/${caseId}/depts/${prog.delegate.deptSlug}?delegate=1`}
                    className="btn-press focus-ring rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-slate-700"
                    data-testid="company-plan-go-submit"
                    data-handoff-gate={planHandoffGate.code}
                  >
                    先去本章交卷
                  </Link>
                )
              ) : null}
              {prog.delegate.chain?.some((s) => s.status === 'active') &&
              planHandoffGate &&
              !planHandoffGate.allow ? (
                <details
                  className="w-full"
                  data-testid="company-plan-demo-fold"
                >
                  <summary className="cursor-pointer select-none text-[10px] font-medium text-emerald-900/55 hover:text-emerald-900/80">
                    样机补记（验收用 · 默认收起）
                  </summary>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {planHandoffGate.code === 'kit_incomplete' ? (
                      <button
                        type="button"
                        className="btn-press focus-ring rounded-full border border-dashed border-violet-700/40 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-violet-950/80 hover:bg-white"
                        data-testid="company-plan-seed-kit"
                        title="样机勾齐本稿齐套 · 非一键交卷 · 非官报"
                        onClick={() => {
                          if (activePlanStep)
                            seedKitComplete(caseId, activePlanStep.deptSlug)
                        }}
                      >
                        样机·勾齐齐套
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-press focus-ring rounded-full border border-dashed border-emerald-700/40 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-emerald-950/80 hover:bg-white"
                        data-testid="company-plan-seed-handoff"
                        title={HANDOFF_PLAN_GATE_HONEST}
                        onClick={() => {
                          seedPlanHandoffPass(caseId)
                        }}
                      >
                        样机·补记本稿已通过
                      </button>
                    )}
                  </div>
                </details>
              ) : null}
              {!planHandoffGate?.allow &&
              planHandoffGate?.code === 'kit_incomplete' &&
              planHandoffGate.missing?.length ? (
                <ul
                  className="mt-1 w-full list-disc pl-4 text-[10px] text-violet-900/70"
                  data-testid="company-plan-kit-missing"
                >
                  {planHandoffGate.missing.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
          <p
            className="mt-1 text-[10px] text-emerald-900/50"
            data-testid="company-plan-kit-sync-hint"
          >
            {KIT_STEP_SYNC_HONEST}
            {activePlanStep
              ? ` · 在办章 ${kitProgressForPlanStep({ deptSlug: activePlanStep.deptSlug, kitDoneByDept: prog.kitDoneByDept }).short}`
              : ''}
          </p>
          <p
            className="mt-1.5 text-[10px] text-emerald-900/60"
            data-testid="company-plan-advance-hint"
            data-handoff-gate={planHandoffGate?.code ?? 'none'}
          >
            {planHandoffGate
              ? `${planHandoffGate.hint} · ${HANDOFF_PLAN_GATE_HONEST}`
              : '排期无在办章 · 样机示意非官报'}
          </p>
        </section>
      ) : null}

      <section
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        data-testid="company-hero"
        data-company-dedupe="cta-v1"
      >
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p
            className="text-[13px] font-medium text-slate-800"
            data-testid="company-tagline"
          >
            一案一家 Novada Team
          </p>
          <span
            className="rounded bg-amber-100 px-1.5 py-px text-[10px] font-semibold text-amber-900"
            data-testid="company-case-demo-chip"
          >
            DEMO · 示意案
          </span>
          <details className="text-[10px] text-slate-400" data-testid="company-case-id-more">
            <summary className="cursor-pointer select-none hover:text-slate-600">样机编号</summary>
            <span className="font-mono" data-testid="company-case-id">{caseId}</span>
          </details>
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
          盯本案卡点，从八部地图进部干活；拍板在工作台右栏。
        </p>
        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <h2 className="text-[16px] font-semibold text-slate-900">{title}</h2>
          {summary ? (
            <span className="text-[12px] text-slate-500">{summary}</span>
          ) : null}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="text-[12px] text-slate-600">
            当前：
            <span className="font-semibold text-slate-900">
              {deptLabel(currentDept)}
            </span>
          </p>
        </div>
        <nav
          className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500"
          aria-label="本案次要入口"
          data-testid="company-logistics-links"
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
            to={`/agent/cases/${caseId}/docket`}
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="company-link-docket"
          >
            近期限
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
            编制名册
          </Link>
        </nav>
      </section>

      {/* P1 · 最近案条 · 默认折 · 不抢卡点首屏 */}
      <details
        className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2"
        data-testid="company-recent-cases"
        aria-label="本案与最近案"
      >
        <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-2 select-none">
          <h3 className="text-[12px] font-semibold text-slate-800">
            本案 · 最近案
          </h3>
          <span className="text-[10px] text-slate-400">默认收 · 点开切换</span>
          <Link
            to="/agent/cases"
            className="focus-ring ml-auto text-[11px] font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
            data-testid="company-recent-all"
            onClick={(e) => e.stopPropagation()}
          >
            全部案子 / 案盘
          </Link>
        </summary>
        <ul className="mt-1.5 flex flex-col gap-1" data-testid="company-recent-list">
          <li className="flex items-center gap-2 text-[12px]">
            <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              本案
            </span>
            <span className="font-medium text-slate-900">
              {recentCases.selfTitle}
            </span>
          </li>
          {recentCases.others.map((c) => (
            <li key={c.id}>
              <Link
                to={`/agent/cases/${c.id}`}
                className="focus-ring flex items-center gap-2 rounded-md px-0.5 py-0.5 text-[12px] text-slate-700 hover:bg-white hover:text-slate-900"
                data-testid={`company-recent-case-${c.id}`}
              >
                <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                  最近
                </span>
                <span className="truncate font-medium">{c.title}</span>
              </Link>
            </li>
          ))}
          {recentCases.others.length === 0 ? (
            <li className="text-[11px] text-slate-500" data-testid="company-other-cases-empty" data-empty-tone="office">暂无其他案子 · 本案之外的案卷切换会出现在这里</li>
          ) : null}
        </ul>
      </details>

      <details className="rounded-lg border border-slate-100 px-2 py-1" data-testid="company-status-fold">
        <summary className="cursor-pointer select-none text-[11px] font-medium text-slate-500">
          三线状态 · 默认收
        </summary>
        <div className="mt-1.5">
          <ThreeLineStatusStrip prog={prog} dense />
        </div>
      </details>

      <section aria-labelledby="eight-dept-map-title">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h3
            id="eight-dept-map-title"
            className="text-[13px] font-semibold text-slate-900"
          >
            八个部门
          </h3>
          <span className="text-[11px] text-slate-500">
            当前部默认露出 · 其余可折 · 点开抽屉再进干活
          </span>
          <button
            type="button"
            className="btn-press focus-ring ml-auto inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700"
            onClick={() => setMapExpanded((o) => !o)}
            aria-expanded={mapExpanded}
            data-testid="eight-dept-map-toggle"
          >
            {mapExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            )}
            {mapExpanded ? '收起其余部门' : '展开其余部门'}
          </button>
        </div>
        <ol
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
          data-testid="eight-dept-map"
          data-folded={mapExpanded ? '0' : '1'}
        >
          {MAIN_CHAIN_DEPTS.map((dept, i) => {
            const active = dept.id === currentDept.id
            if (!mapExpanded && !active) {
              /* 仍挂 DOM 以保 company-dedupe 八卡计数；视觉折起 */
              return renderDeptCard(dept, i, { visuallyHidden: true })
            }
            return renderDeptCard(dept, i)
          })}
        </ol>
        {!mapExpanded ? (
          <ul
            className="mt-2 flex flex-wrap gap-1.5"
            data-testid="eight-dept-map-chips"
            aria-label="其余部门（次级）"
          >
            {MAIN_CHAIN_DEPTS.filter((d) => d.id !== currentDept.id).map(
              (dept) => (
                <li key={dept.id}>
                  <button
                    type="button"
                    onClick={() => openDrawer(dept.id)}
                    className="btn-press focus-ring rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600 hover:border-slate-300 hover:text-slate-900"
                    data-testid={`dept-map-chip-${dept.id}`}
                  >
                    {deptLabel(dept)}
                  </button>
                </li>
              ),
            )}
          </ul>
        ) : null}
      </section>

      <section>
        <button
          type="button"
          className="focus-ring flex w-full items-center gap-1.5 rounded-md px-1 py-1 text-left text-[12px] font-medium text-slate-600 hover:text-slate-900"
          onClick={() => setMoreOpen((o) => !o)}
          data-testid="company-more-depts-toggle"
          aria-expanded={moreOpen}
        >
          {moreOpen ? (
            <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          )}
          辅链能力
          <span className="font-normal text-slate-400">
            （查新/附图等 · 不占八部大门 · 默认折叠）
          </span>
        </button>
        {moreOpen && (
          <ul
            className="mt-2 grid gap-1.5 sm:grid-cols-2"
            data-testid="company-more-depts"
          >
            {moreDepts.map((dept) => (
              <li key={dept.id}>
                <Link
                  to={`/agent/cases/${caseId}/depts/${deptSlug(dept.id)}`}
                  className="focus-ring flex items-center justify-between rounded-md border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2 text-[12px] text-slate-700 hover:border-slate-300"
                >
                  <span className="font-medium">{deptLabel(dept)}</span>
                  <span className="text-[11px] text-slate-400">{dept.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <details
        className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-3 py-2"
        data-testid="company-health-fold"
      >
        <summary className="cursor-pointer select-none text-[11px] font-medium text-slate-600">
          健康账单（演示 · 默认收起 · 非 KPI）
        </summary>
        <div className="mt-2">
          <HealthBillStrip caseTitle={title} />
        </div>
      </details>

      {drawerDept ? (
        <DeptSideDrawer
          open
          onClose={closeDrawer}
          overlayTestId="company-dept-drawer"
          deptLabel={deptLabel(drawerDept)}
          statusLine={handoffStatusSentence(
            drawerDept.id,
            deptStatus({
              dept: drawerDept,
              progress: prog,
              pending,
              confirmKind: confirmKindOf(drawerDept),
            }),
          )}
          status={deptStatus({
            dept: drawerDept,
            progress: prog,
            pending,
            confirmKind: confirmKindOf(drawerDept),
          })}
          experts={drawerDept.peers.slice(0, 3).map((peer) => ({
            id: peer.id,
            label: peerDisplayLabel(drawerDept.id, peer.id, peer.label),
          }))}
          returnHint={latestReturnNote(
            pending,
            confirmKindOf(drawerDept),
          )}
          primaryAction={{
            label: '去该部干活',
            href: `/agent/cases/${caseId}/depts/${deptSlug(drawerDept.id)}`,
            onClick: closeDrawer,
            testId: `company-drawer-go-${drawerDept.id}`,
          }}
        />
      ) : null}
    </div>
  )
}
