import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import {
  businessSeatLabel,
  currentSeatForProgress,
  seatsForCase,
} from '../../business/businessSeats'
import { navigablePeerSeatIds, type DeptPeer } from '../../business/deptRoster'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { BusinessSeatWorkbench } from '../../components/business/BusinessSeatWorkbench'
import { CaseAssistantPanel } from '../../components/business/CaseAssistantPanel'
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
  DEPT_HANDOFF,
  peerDisplayLabel,
  peerSuggestionHint,
} from '../../departments/deptPageNarrative'
import {
  confirmKindOf,
  deptStatus,
} from '../../departments/deptProgress'
import { useOrgConfig } from '../../departments/OrgConfigContext'
import type { ProjectExpertId } from '../../projects/types'
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react'

function handoffForDept(deptId: OrgDeptId, leadSeatId: ProjectExpertId) {
  const known = DEPT_HANDOFF[deptId]
  if (known) {
    return {
      purpose: known.purpose,
      deliverable: known.deliverable,
      checklist: known.checklist,
    }
  }
  const dual = deliverableForExpert(leadSeatId)
  return {
    purpose: '把本站交卷做齐',
    deliverable: dual
      ? `本站产出：${dual.artifactKey}（样机摘要）`
      : '本站权威产出摘要（占位，待业务节点对齐）',
    checklist: ['关键产出已起草', '缺项已清或已说明', '可送确认'],
  }
}

/**
 * 部门工作台 · product-pages §2 / §4.4+
 * 首屏三块：交卷物 | 齐套/硬闸 | ≤3 专家建议；岗内工作区默认收起。
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
  /** 岗内：有 seat 深链或用户点了专家/进入专家岗后才展示工作区 */
  const [seatOpen, setSeatOpen] = useState(() => Boolean(params.get('seat')))
  const [adoptedPeerIds, setAdoptedPeerIds] = useState<string[]>([])

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

  const [workNonce, setWorkNonce] = useState(0)

  const handoff = dept
    ? handoffForDept(dept.id, dept.leadSeatId)
    : { purpose: '', deliverable: '', checklist: [] as string[] }

  const leadDone = dept ? prog.doneSeatIds.includes(dept.leadSeatId) : false
  const st = dept
    ? deptStatus({
        dept,
        progress: prog,
        pending,
        confirmKind: confirmKindOf(dept),
      })
    : null
  /** 样机：部门已完成 / 待确认视为可交卷；否则齐套未齐（投影，非 nodes 真闸） */
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

  const toggleAdopt = (peerId: string) => {
    setAdoptedPeerIds((cur) =>
      cur.includes(peerId) ? cur.filter((id) => id !== peerId) : [...cur, peerId],
    )
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
            <p className="mt-0.5 max-w-xl text-xs text-slate-500">
              {handoff.purpose || dept.blurb}
              {' · '}
              {stageLabel(prog.stageId)}
              {st ? ` · ${st}` : ''}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5" aria-label="七部微进度">
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
            <Link
              to={pending[0] ? `/agent/pending/${pending[0].id}` : '/agent/pending'}
              className="btn-press focus-ring rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-medium text-amber-950"
              data-testid="dept-pending-link"
            >
              铃铛{pending.length > 0 ? ` · ${pending.length}` : ''}
            </Link>
            <Link
              to={`/agent/cases/${caseId}/docket`}
              className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
            >
              期限
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
          data-testid="dept-return-hint"
        >
          回流意见：{lastReturnHint}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:px-6">
        <div
          className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
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
              <pre className="mt-3 max-h-56 overflow-auto rounded-md bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600 whitespace-pre-wrap">
                {deliverableSummary}
              </pre>
            ) : (
              <p className="mt-2 text-[11px] text-slate-400">
                样机摘要占位：点右侧专家岗后，可在岗内工作区起草与预览。此处不编辑定稿、不改法律状态。
              </p>
            )}
          </section>

          <div className="flex flex-col gap-4">
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
                  齐套 / 硬闸
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
                  缺项未清前不能交卷。先点专家岗补建议，或进入专家岗继续办。
                </p>
              ) : null}
              <p className="mt-2 text-[10px] text-slate-400">
                样机投影：勾选状态非 nodes 真硬闸。
              </p>
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
                专家建议
                <span className="ml-1.5 text-[11px] font-normal text-slate-400">
                  ≤3 · 建议稿可采纳
                </span>
              </h2>
              {peers.length === 0 ? (
                <p className="mt-2 text-[12px] text-slate-500">
                  本部门暂无专家岗配置；可直接进入专家岗。
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
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
                    const label = peerDisplayLabel(dept.id, peer.id, peer.label)
                    const hint = peerSuggestionHint(dept.id, peer.id)
                    const adopted = adoptedPeerIds.includes(peer.id)
                    return (
                      <li
                        key={peer.id}
                        className={`rounded-lg border px-3 py-2 ${
                          selected
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-800'
                        }`}
                        data-testid={`dept-expert-${peer.id}`}
                      >
                        <button
                          type="button"
                          onClick={() => openPeer(peer)}
                          className="focus-ring flex w-full items-center justify-between text-left"
                        >
                          <span className="text-[12px] font-medium">{label}</span>
                          <ChevronRight
                            className={`h-3.5 w-3.5 shrink-0 ${
                              selected ? 'text-white/70' : 'text-slate-300'
                            }`}
                            aria-hidden
                          />
                        </button>
                        <p
                          className={`mt-1 text-[11px] leading-relaxed ${
                            selected ? 'text-white/75' : 'text-slate-500'
                          }`}
                        >
                          {hint}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => toggleAdopt(peer.id)}
                            className={`btn-press focus-ring rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                              adopted
                                ? selected
                                  ? 'bg-white text-slate-900'
                                  : 'bg-emerald-600 text-white'
                                : selected
                                  ? 'bg-white/15 text-white'
                                  : 'bg-white text-slate-700 ring-1 ring-slate-200'
                            }`}
                            data-testid={`dept-expert-adopt-${peer.id}`}
                          >
                            {adopted ? '已采纳意向' : '采纳'}
                          </button>
                          <span
                            className={`text-[10px] ${
                              selected ? 'text-white/50' : 'text-slate-400'
                            }`}
                          >
                            样机意向，不改法律状态
                          </span>
                        </div>
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
                  进入专家岗 · {businessSeatLabel(dept.leadSeatId)}
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
                    收起岗内工作区
                  </button>
                ) : null}
              </div>
            </section>

            {lastReturnHint ? null : (
              <section
                className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-3"
                data-testid="dept-reflow-empty"
              >
                <h2 className="text-[12px] font-semibold text-slate-700">回流 / 说明</h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  确认页驳回后意见会落在这里；当前无回流。
                </p>
              </section>
            )}
          </div>

          {seatOpen ? (
            <section
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:col-span-2"
              data-testid="dept-seat-workbench-wrap"
              aria-label="岗内工作区"
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
              className="text-center text-[11px] text-slate-400 lg:col-span-2"
              data-testid="dept-seat-collapsed-hint"
            >
              岗内工作区默认收起。点专家岗或「进入专家岗」后再打开；首屏先看交卷物与齐套。
            </p>
          )}

          <p className="mt-1 text-center text-[11px] text-slate-400 lg:col-span-2">
            演示环境：进度与确认为样机闭环，非真递交局端。
          </p>
        </div>
      </div>
    </div>
  )
}
