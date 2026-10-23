import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import {
  businessSeatLabel,
  currentSeatForProgress,
  seatsForCase,
} from '../../business/businessSeats'
import { navigablePeerSeatIds, type DeptPeer } from '../../business/deptRoster'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { advanceButtonLabel } from '../../business/seatStepBodies'
import { BusinessSeatWorkbench } from '../../components/business/BusinessSeatWorkbench'
import { CaseAssistantPanel } from '../../components/business/CaseAssistantPanel'
import { getProjectExpert } from '../../projects/experts'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import { deliverableForExpert } from '../../projects/patentDeliverables'
import {
  deptIdFromSlug,
  orgDeptById,
  deptSlug,
  MAIN_CHAIN_DEPTS,
  type OrgDeptId,
} from '../../departments/orgDepts'
import {
  confirmKindOf,
  deptStatus,
} from '../../departments/deptProgress'
import { useOrgConfig } from '../../departments/OrgConfigContext'
import type { ProjectExpertId } from '../../projects/types'
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react'

/** product-pages §4.4–4.10 白话交卷物 + 齐套要点（诚实占位，非法条） */
const DEPT_HANDOFF: Partial<
  Record<
    OrgDeptId,
    { deliverable: string; checklist: string[] }
  >
> = {
  'dept-disclosure': {
    deliverable: '交底包：六项技术说明 + 权属/署名/奖酬/公开时点四组事实',
    checklist: [
      '六项技术内容已填',
      '四组事实已闭合',
      '发明人已确认',
      '须法务会签时已通过',
    ],
  },
  'dept-research': {
    deliverable: '查新报告：检索式、命中对比、可专利性结论',
    checklist: [
      '检索式与范围已记',
      '对比文件已梳理',
      '可专利性结论已给出',
    ],
  },
  'dept-intake': {
    deliverable: '单案决策书 + 范围报价（决议签署、国际路径意向）',
    checklist: [
      '报价齐套（或 No-Go 理由已记）',
      '决议已签署或 No-Go 已归档',
      '国际路径意向已记',
    ],
  },
  'dept-draft': {
    deliverable: '权项与说明书（权利边界成型）',
    checklist: [
      '权项树非空',
      '说明书关键章节已齐',
      '与附图引用口径一致',
    ],
  },
  'dept-figure': {
    deliverable: '附图包：图号、简要说明与说明书引用一致',
    checklist: [
      '图号齐全',
      '与说明书实施例引用一致',
      '格式满足递交相关检查',
    ],
  },
  'dept-filing': {
    deliverable: '申请包 + 递交检查清单 + 回执/凭证',
    checklist: [
      '递交检查项全绿',
      '授权人确认就绪',
      '回执/凭证可登记',
    ],
  },
  'dept-oa': {
    deliverable: '答复包：争点、策略、修改对照、陈述确认',
    checklist: [
      '答复包必填项齐全',
      '策略有理由',
      '期限可见',
    ],
  },
}

function handoffForDept(deptId: OrgDeptId, leadSeatId: ProjectExpertId) {
  const known = DEPT_HANDOFF[deptId]
  if (known) return known
  const dual = deliverableForExpert(leadSeatId)
  return {
    deliverable: dual
      ? `本站产出：${dual.artifactKey}（样机摘要）`
      : '本站权威产出摘要（占位，待业务节点对齐）',
    checklist: [
      '关键产出已起草',
      '缺项已清或已说明',
      '可送确认',
    ],
  }
}

/**
 * 部门工作台 · product-pages §4.4+
 * 首屏：交卷物 + 齐套要点 + ≤3 专家岗；席位工作台降为岗内。
 * /agent/cases/:caseId/depts/:deptSlug
 */
export function BusinessCaseDeptPage() {
  const { caseId = '', deptSlug: slug = '' } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const {
    getCase,
    getProgress,
    getPendingConfirms,
    primaryCta,
    stageLabel,
    lastReturnHint,
    clearReturnHint,
  } = useBusinessCases()
  const { getThread } = useProjectFolder()
  const { deptLabel } = useOrgConfig()

  useEffect(() => {
    if (!lastReturnHint) return
    const t = window.setTimeout(() => clearReturnHint(), 6000)
    return () => window.clearTimeout(t)
  }, [lastReturnHint, clearReturnHint])

  const deptId = deptIdFromSlug(slug)
  const dept = deptId ? orgDeptById(deptId) : undefined
  const c = getCase(caseId)
  const prog = getProgress(caseId)
  const pending = getPendingConfirms(caseId)
  const cta = primaryCta(caseId)

  const seatIds = useMemo(() => {
    return [
      ...seatsForCase({
        expertIds: c?.expertIds,
        moreSeatIds: prog.moreSeatIds,
      }),
      ...navigablePeerSeatIds(),
    ]
  }, [c?.expertIds, prog.moreSeatIds])

  const defaultSeat = useMemo(() => {
    if (dept && seatIds.includes(dept.leadSeatId)) return dept.leadSeatId
    return currentSeatForProgress({
      stageId: prog.stageId,
      doneSeatIds: prog.doneSeatIds,
      moreSeatIds: prog.moreSeatIds,
    })
  }, [dept, seatIds, prog.stageId, prog.doneSeatIds, prog.moreSeatIds])

  const seatFromUrl = params.get('seat') as ProjectExpertId | null
  const [pickedSeat, setPickedSeat] = useState<ProjectExpertId | null>(null)
  /** 岗内：有 seat 深链或用户点了专家/进入席位后才展示工作台 */
  const [seatOpen, setSeatOpen] = useState(() => Boolean(params.get('seat')))

  const activeSeat: ProjectExpertId = (() => {
    if (pickedSeat && seatIds.includes(pickedSeat)) return pickedSeat
    if (seatFromUrl && seatIds.includes(seatFromUrl)) return seatFromUrl
    return defaultSeat
  })()

  useEffect(() => {
    if (!seatFromUrl) return
    if (seatIds.includes(seatFromUrl) && seatFromUrl !== pickedSeat) {
      setPickedSeat(seatFromUrl)
      setSeatOpen(true)
    }
  }, [seatFromUrl, seatIds, pickedSeat])

  const thread = getThread(caseId, activeSeat)
  const stepIndex = thread?.stepIndex ?? 0
  const def = getProjectExpert(activeSeat)
  const btnRaw = advanceButtonLabel(def.steps, stepIndex)

  const [workNonce, setWorkNonce] = useState(0)

  const handoff = dept
    ? handoffForDept(dept.id, dept.leadSeatId)
    : { deliverable: '', checklist: [] as string[] }

  const leadDone = dept ? prog.doneSeatIds.includes(dept.leadSeatId) : false
  const st = dept
    ? deptStatus({
        dept,
        progress: prog,
        pending,
        confirmKind: confirmKindOf(dept),
      })
    : null
  /** 样机：部门已完成 / 待确认视为可交卷；否则齐套未齐 */
  const checklistReady = leadDone || st === '待确认' || st === '已完成'
  const checklistItems = handoff.checklist.map((label, i) => ({
    label,
    done: checklistReady || (leadDone ? true : i === 0 && stepIndex > 0),
  }))
  const allChecklistDone = checklistItems.every((x) => x.done)
  const canSubmit =
    allChecklistDone || cta.action === 'confirm' || checklistReady

  const peers: DeptPeer[] = (dept?.peers ?? []).slice(0, 3)

  const dual = dept ? deliverableForExpert(dept.leadSeatId) : undefined
  const deliverableSummary = dual?.sampleArtifact
    ? dual.sampleArtifact.split('\n').slice(0, 6).join('\n')
    : null

  const onSubmit = () => {
    if (!canSubmit) return
    if (cta.action === 'confirm' && cta.confirmId) {
      navigate(`/agent/pending/${cta.confirmId}`)
      return
    }
    if (!seatOpen) {
      setSeatOpen(true)
      setPickedSeat(defaultSeat)
      return
    }
    setWorkNonce((n) => n + 1)
  }

  if (!c) {
    return (
      <div className="flex flex-1 items-center justify-center p-8" data-testid="business-case-missing">
        <div className="text-center">
          <p className="text-sm text-slate-600">找不到这个案子</p>
          <Link to="/agent/cases" className="mt-2 inline-block text-xs text-slate-800 underline">
            返回我的案子
          </Link>
        </div>
      </div>
    )
  }

  if (!dept) {
    return (
      <div className="flex flex-1 items-center justify-center p-8" data-testid="dept-missing">
        <div className="text-center">
          <p className="text-sm text-slate-600">没有这个部门</p>
          <Link
            to={`/agent/cases/${caseId}`}
            className="mt-2 inline-block text-xs text-slate-800 underline"
          >
            回公司首页
          </Link>
        </div>
      </div>
    )
  }

  const primaryLabel =
    cta.action === 'confirm'
      ? `去确认 · ${cta.label}`
      : !canSubmit
        ? '交卷（未齐套）'
        : !seatOpen
          ? '交卷'
          : btnRaw === '交卷待确认'
            ? '交卷'
            : '交卷'

  const switchSeat = (next: ProjectExpertId) => {
    setPickedSeat(next)
    setSeatOpen(true)
    const nextParams = new URLSearchParams(params)
    nextParams.set('seat', next)
    navigate(
      `/agent/cases/${caseId}/depts/${slug}?${nextParams.toString()}`,
      { replace: true },
    )
  }

  const openPeer = (peer: DeptPeer) => {
    const seat =
      peer.kind === 'session' && peer.sessionSeatId
        ? peer.sessionSeatId
        : peer.leadSeatId
    if (seatIds.includes(seat)) {
      switchSeat(seat)
    } else {
      setSeatOpen(true)
      setPickedSeat(dept.leadSeatId)
    }
  }

  const openLeadSeat = () => {
    switchSeat(dept.leadSeatId)
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      data-testid="business-case-dept-page"
      data-case-id={caseId}
      data-dept-id={dept.id}
      data-seat-open={seatOpen ? '1' : '0'}
    >
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
        <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <Link to="/agent/cases" className="hover:underline">
            多案流水
          </Link>
          <span>/</span>
          <Link to={`/agent/cases/${caseId}`} className="hover:underline">
            {c.title}
          </Link>
          <span>/</span>
          <span className="text-slate-600">{deptLabel(dept)}</span>
        </div>
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[18px] font-semibold text-slate-900">
              {deptLabel(dept)}
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              {dept.blurb}
              {' · '}
              {stageLabel(prog.stageId)}
              {st ? ` · ${st}` : ''}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {MAIN_CHAIN_DEPTS.map((d) => (
                <Link
                  key={d.id}
                  to={`/agent/cases/${caseId}/depts/${deptSlug(d.id)}`}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    d.id === dept.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {deptLabel(d)}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/agent/cases/${caseId}`}
              className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
            >
              公司首页
            </Link>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit && cta.action !== 'confirm'}
              title={
                !canSubmit && cta.action !== 'confirm'
                  ? '齐套要点未齐，暂不可交卷'
                  : undefined
              }
              className={`btn-press focus-ring rounded-md px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                cta.action === 'confirm'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-900 text-white'
              }`}
              data-testid="dept-primary-cta"
              data-can-submit={canSubmit ? '1' : '0'}
            >
              {primaryLabel}
            </button>
          </div>
        </header>
      </div>

      {lastReturnHint && (
        <div
          className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-950"
          role="status"
        >
          {lastReturnHint}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:px-6">
        <div
          className="mx-auto flex w-full max-w-4xl flex-col gap-4"
          data-testid="dept-handoff-shell"
        >
          <section
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            data-testid="dept-deliverable"
            aria-labelledby="dept-deliverable-title"
          >
            <h2
              id="dept-deliverable-title"
              className="text-[13px] font-semibold text-slate-900"
            >
              交卷物
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
              {handoff.deliverable}
            </p>
            {deliverableSummary ? (
              <pre className="mt-3 max-h-40 overflow-auto rounded-md bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600 whitespace-pre-wrap">
                {deliverableSummary}
              </pre>
            ) : (
              <p className="mt-2 text-[11px] text-slate-400">
                样机摘要占位：进专家岗后可在席位里起草与预览。
              </p>
            )}
          </section>

          <section
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            data-testid="dept-checklist"
            aria-labelledby="dept-checklist-title"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h2
                id="dept-checklist-title"
                className="text-[13px] font-semibold text-slate-900"
              >
                齐套要点
              </h2>
              <span className="text-[11px] text-slate-500">
                {allChecklistDone ? '可交卷' : '未齐套 · 交卷已禁用'}
              </span>
            </div>
            <ul className="mt-2 space-y-1.5">
              {checklistItems.map((item) => (
                <li
                  key={item.label}
                  className="flex items-start gap-2 text-[12px] text-slate-700"
                >
                  {item.done ? (
                    <CheckCircle2
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"
                      aria-hidden
                    />
                  ) : (
                    <Circle
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300"
                      aria-hidden
                    />
                  )}
                  <span className={item.done ? 'text-slate-700' : 'text-slate-500'}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
            {!allChecklistDone ? (
              <p className="mt-2 text-[11px] text-amber-800">
                缺项未清前不能交卷。可先点下方专家岗补齐，或进入席位继续办。
              </p>
            ) : null}
          </section>

          <section
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            data-testid="dept-experts"
            aria-labelledby="dept-experts-title"
          >
            <h2
              id="dept-experts-title"
              className="text-[13px] font-semibold text-slate-900"
            >
              专家岗
              <span className="ml-1.5 text-[11px] font-normal text-slate-400">
                ≤3 · 点岗进入席位
              </span>
            </h2>
            {peers.length === 0 ? (
              <p className="mt-2 text-[12px] text-slate-500">
                本部门暂无专家岗配置；可直接进入主席位。
              </p>
            ) : (
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-3">
                {peers.map((peer) => {
                  const peerSeat =
                    peer.kind === 'session' && peer.sessionSeatId
                      ? peer.sessionSeatId
                      : peer.leadSeatId
                  const selected =
                    seatOpen &&
                    (activeSeat === peerSeat ||
                      (peer.kind === 'placeholder' &&
                        activeSeat === peer.leadSeatId &&
                        pickedSeat === peer.leadSeatId))
                  return (
                    <li key={peer.id}>
                      <button
                        type="button"
                        onClick={() => openPeer(peer)}
                        className={`focus-ring flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-[12px] transition ${
                          selected
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300'
                        }`}
                        data-testid={`dept-expert-${peer.id}`}
                      >
                        <span className="font-medium">{peer.label}</span>
                        <ChevronRight
                          className={`h-3.5 w-3.5 shrink-0 ${
                            selected ? 'text-white/70' : 'text-slate-300'
                          }`}
                          aria-hidden
                        />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={openLeadSeat}
                className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
                data-testid="dept-enter-seat"
              >
                进入席位 · {businessSeatLabel(dept.leadSeatId)}
              </button>
              {seatOpen ? (
                <button
                  type="button"
                  onClick={() => {
                    setSeatOpen(false)
                    const nextParams = new URLSearchParams(params)
                    nextParams.delete('seat')
                    navigate(
                      `/agent/cases/${caseId}/depts/${slug}${
                        nextParams.toString() ? `?${nextParams}` : ''
                      }`,
                      { replace: true },
                    )
                  }}
                  className="btn-press focus-ring rounded-md px-2.5 py-1.5 text-[11px] font-medium text-slate-500 underline-offset-2 hover:underline"
                  data-testid="dept-close-seat"
                >
                  收起席位工作台
                </button>
              ) : null}
            </div>
          </section>

          {seatOpen ? (
            <section
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
              data-testid="dept-seat-workbench-wrap"
              aria-label="席位工作台"
            >
              <p className="mb-2 px-1 text-[11px] font-medium text-slate-500">
                岗内 · {businessSeatLabel(activeSeat)}
              </p>
              <CaseAssistantPanel
                caseId={caseId}
                stageId={prog.stageId}
                activeSeat={activeSeat}
                onSwitchSeat={switchSeat}
              />
              <BusinessSeatWorkbench
                caseId={caseId}
                seatId={activeSeat}
                workNonce={workNonce}
                onAdvanced={(confirmId) => {
                  if (confirmId) navigate(`/agent/pending/${confirmId}`)
                }}
                onSwitchSeat={switchSeat}
              />
            </section>
          ) : (
            <p
              className="text-center text-[11px] text-slate-400"
              data-testid="dept-seat-collapsed-hint"
            >
              席位工作台默认收起。点专家岗或「进入席位」后再打开。
            </p>
          )}

          <p className="mt-1 text-center text-[11px] text-slate-400">
            演示环境：进度与确认为样机闭环，非真递交局端。
          </p>
        </div>
      </div>
    </div>
  )
}
