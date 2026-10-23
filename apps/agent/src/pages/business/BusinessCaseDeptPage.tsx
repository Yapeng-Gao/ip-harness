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
import {
  DeptMaterialsTree,
  type MaterialsTreeNode,
} from '../../components/departments/DeptMaterialsTree'
import { ExpertAvatar } from '../../components/departments/ExpertAvatar'
import { DeptStatusDot } from '../../components/departments/DeptStatusDot'
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
  ADOPT_CTA_DONE_LABEL,
  ADOPT_CTA_LABEL,
  ADOPT_NE_CONFIRM_NOTE,
  handoffPhaseFromStatus,
  handoffPhaseLabel,
  handoffStatusSentence,
  latestReturnNote,
} from '../../departments/handoffPhase'
import {
  AWAITING_ADVANCE_LOCK_HINT,
  canSubmitDeliverable,
  isAwaitingConfirm,
  isDeptAdvanceLocked,
  missingChecklistLabels,
} from '../../business/confirmGate'
import {
  confirmKindOf,
  deptStatus,
} from '../../departments/deptProgress'
import { useOrgConfig } from '../../departments/OrgConfigContext'
import type { ProjectExpertId } from '../../projects/types'
import { CheckCircle2, Circle, ArrowRight, Building2, PanelLeft, MessageSquare, X } from 'lucide-react'
import { formatArtifactSavedAt } from '../../business/artifactVersions'

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
 * 部门工作台 · product-pages §2 Cursor 三栏（85d64e4 / Frame 5）
 * 左·材料目录 | 中·产出正文 | 右·对话 + G1 交卷 + 待你确认
 * 交卷 / 确认主 CTA 仅在右栏；不放顶栏 / 中栏。confirmGate 只接线不改逻辑。
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
  const [seatOpen, setSeatOpen] = useState(() => Boolean(params.get('seat')))
  const [adoptedPeerIds, setAdoptedPeerIds] = useState<string[]>([])
  const [selectedMaterialId, setSelectedMaterialId] = useState('deliverable')
  /** 窄屏：左目录可收起；右栏改底抽屉（G1 交卷可达） */
  const [leftOpen, setLeftOpen] = useState(true)
  const [mobileRightOpen, setMobileRightOpen] = useState(false)

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
      setMobileRightOpen(true)
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
  const kindForDept = dept ? confirmKindOf(dept) : null
  const awaitingThis = isAwaitingConfirm(pending, kindForDept)
  const checklistReady = leadDone || st === '待确认' || st === '已完成' || awaitingThis
  const checklistItems = handoff.checklist.map((label, i) => ({
    label,
    done: checklistReady || (leadDone ? true : i === 0 && stepIndex > 0),
  }))
  const allChecklistDone = canSubmitDeliverable(checklistItems)
  const missingLabels = missingChecklistLabels(checklistItems)
  const canSubmit =
    allChecklistDone && !awaitingThis && st !== '已完成' && cta.action !== 'confirm'

  const peers: DeptPeer[] = (dept?.peers ?? []).slice(0, 3)

  const dual = dept ? deliverableForExpert(dept.leadSeatId) : undefined
  const deliverableSummary = dual?.sampleArtifact
    ? dual.sampleArtifact.split('\n').slice(0, 6).join('\n')
    : null

  const artifactBody =
    thread?.artifactMarkdown?.trim() ||
    deliverableSummary ||
    handoff.deliverable

  const versions = thread?.artifactVersions ?? []

  const materialNodes: MaterialsTreeNode[] = useMemo(() => {
    const versionChildren: MaterialsTreeNode[] = versions.map((v, i) => ({
      id: `version-${i}`,
      label: `版本 ${i + 1}`,
      kind: 'version' as const,
      hint: formatArtifactSavedAt(new Date(v.savedAt)),
    }))
    return [
      {
        id: 'deliverable',
        label: '本站交卷物',
        kind: 'deliverable',
        hint: handoff.deliverable.slice(0, 28) || '权威产出',
      },
      {
        id: 'attachments',
        label: '附件',
        kind: 'attachment',
        hint: '样机占位 · 暂无上传',
      },
      {
        id: 'versions',
        label: '版本',
        kind: 'section',
        hint:
          versionChildren.length > 0
            ? `${versionChildren.length} 个另存`
            : '尚无另存版本',
        children: versionChildren,
      },
    ]
  }, [handoff.deliverable, versions])

  const onSubmit = () => {
    if (cta.action === 'confirm' && cta.confirmId) {
      navigate(`/agent/pending/${cta.confirmId}`)
      return
    }
    if (!canSubmit) return
    if (!seatOpen) {
      setSeatOpen(true)
      setPickedSeat(defaultSeat)
      setMobileRightOpen(true)
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
    cta.action === 'confirm' || awaitingThis
      ? `去确认 · ${cta.label || '待你确认'}`
      : !canSubmit
        ? '交卷（未齐套）'
        : '交卷'

  const switchSeat = (next: ProjectExpertId) => {
    setPickedSeat(next)
    setSeatOpen(true)
    setMobileRightOpen(true)
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
      setMobileRightOpen(true)
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

  const companyHref = `/agent/cases/${caseId}`
  const statusLine = st
    ? handoffStatusSentence(dept.id, st)
    : handoff.deliverable
  // 持久回流意见（pending.returned.returnNote）；不依赖会 6s 清空的 lastReturnHint
  const persistentReturnNote = latestReturnNote(pending, kindForDept)
  const returnHintText = persistentReturnNote || lastReturnHint || null
  // 退回相：st=======退回 / 持久 returnNote / 短暂 lastReturnHint 任一即标「退回」（与公司抽屉一致）
  const handoffPhase = st
    ? st === '退回' || persistentReturnNote || lastReturnHint
      ? ('退回' as const)
      : handoffPhaseFromStatus(st)
    : ('齐套中' as const)

  const switchDepts = MAIN_CHAIN_DEPTS.map((d) => {
    const locked = isDeptAdvanceLocked({
      currentDeptId: dept.id,
      targetDeptId: d.id,
      awaitingConfirm: awaitingThis,
    })
    return {
      id: d.id,
      label: deptLabel(d),
      href: `/agent/cases/${caseId}/depts/${deptSlug(d.id)}`,
      active: d.id === dept.id,
      locked,
      lockReason: locked ? AWAITING_ADVANCE_LOCK_HINT : undefined,
    }
  })

  const centerTitle =
    selectedMaterialId === 'attachments'
      ? '附件'
      : selectedMaterialId.startsWith('version-')
        ? '版本正文'
        : selectedMaterialId === 'versions'
          ? '版本'
          : '产出正文'

  const centerBody = (() => {
    if (selectedMaterialId === 'attachments') {
      return '本站附件为样机占位。正式上传与格式检查后置，不在此装完成。'
    }
    if (selectedMaterialId === 'versions') {
      return versions.length === 0
        ? '尚无另存版本。在右栏专家岗「成果」里可另存。'
        : '在左侧点某一版本查看正文。'
    }
    if (selectedMaterialId.startsWith('version-')) {
      const idx = Number(selectedMaterialId.replace('version-', ''))
      const v = versions[idx]
      return v?.markdown?.trim() || '该版本无正文。'
    }
    return artifactBody || handoff.deliverable || '暂无产出正文。点右侧专家岗起草后，正文会出现在此。'
  })()

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50"
      data-testid="business-case-dept-page"
      data-case-id={caseId}
      data-dept-id={dept.id}
      data-seat-open={seatOpen ? '1' : '0'}
      data-layout="cursor-three-pane"
      data-left-open={leftOpen ? '1' : '0'}
      data-mobile-right-open={mobileRightOpen ? '1' : '0'}
    >
      {/* 顶栏：案 / 部门 / 铃铛 / 期限；不放交卷主 CTA（§2） */}
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
        <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <Link to="/agent/cases" className="focus-ring rounded-sm hover:underline">
            多案流水
          </Link>
          <span>/</span>
          <Link to={companyHref} className="focus-ring rounded-sm hover:underline">
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
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={companyHref}
              className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
            >
              回公司首页
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
          </div>
        </header>
      </div>

      {/* Cursor 三栏 */}
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row"
        data-testid="dept-handoff-shell"
        data-layout="cursor-three-pane"
      >
        {/* 左·目录（窄屏可收起） */}
        <aside
          className={`${
            leftOpen ? 'flex' : 'hidden'
          } max-h-48 shrink-0 flex-col border-b border-slate-200 bg-white lg:flex lg:max-h-none lg:w-56 lg:border-b-0 lg:border-r`}
          data-testid="dept-left-tree"
          data-slot="materials-tree"
          data-collapsed={leftOpen ? '0' : '1'}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-2 py-1.5 lg:hidden">
            <span className="text-[11px] font-medium text-slate-600">材料目录</span>
            <button
              type="button"
              onClick={() => setLeftOpen(false)}
              className="btn-press focus-ring rounded-md px-2 py-1 text-[11px] text-slate-500"
              data-testid="dept-left-collapse"
              aria-label="收起材料目录"
            >
              收起
            </button>
          </div>
          <DeptMaterialsTree
            nodes={materialNodes}
            selectedId={selectedMaterialId}
            onSelect={setSelectedMaterialId}
          />
        </aside>

        {/* 中·产出物工作区：不放交卷 / 确认主按钮 */}
        <main
          className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-4 lg:px-5"
          data-testid="dept-center-output"
          data-slot="output-body"
        >
          <section
            className="mx-auto flex w-full max-w-3xl flex-col gap-3"
            data-testid="dept-deliverable"
            aria-labelledby="dept-output-title"
          >
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-baseline justify-between gap-2">
                <h2
                  id="dept-output-title"
                  className="text-[13px] font-semibold text-slate-900"
                >
                  {centerTitle}
                </h2>
                <span className="text-[10px] text-slate-400">
                  中栏=产出正文 · 对话/交卷在右栏
                </span>
              </div>
              {selectedMaterialId === 'deliverable' ? (
                <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
                  {handoff.deliverable}
                </p>
              ) : null}
              <pre
                className="mt-3 max-h-[min(70vh,36rem)] overflow-auto rounded-md bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-700 whitespace-pre-wrap"
                data-testid="dept-output-body"
              >
                {centerBody}
              </pre>
              {/* 与当前产出相关的齐套可附旁，不抢阅读 */}
              {selectedMaterialId === 'deliverable' ? (
                <ul
                  className="mt-3 flex flex-wrap gap-2"
                  data-testid="dept-checklist-inline"
                  aria-label="与本产出相关的齐套项"
                >
                  {checklistItems.map((item) => (
                    <li
                      key={item.label}
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${
                        item.done
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-white text-slate-500'
                      }`}
                    >
                      {item.done ? (
                        <CheckCircle2 className="h-3 w-3" aria-hidden />
                      ) : (
                        <Circle className="h-3 w-3" aria-hidden />
                      )}
                      {item.label}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <p className="text-center text-[11px] text-slate-400">
              演示环境：进度与确认为样机闭环，非真递交局端。
            </p>
          </section>
        </main>

        {/* 窄屏：右栏底抽屉遮罩 */}
        {mobileRightOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-slate-900/20 lg:hidden"
            aria-label="关闭对话交卷"
            data-testid="dept-mobile-right-backdrop"
            onClick={() => setMobileRightOpen(false)}
          />
        ) : null}

        {/* 右·对话区：专家 + 对话/过程 + 缺项 + 交卷 + 确认（禁成果阅读面） */}
        <aside
          className={`${
            mobileRightOpen ? 'fixed inset-x-0 bottom-0 z-40 flex max-h-[min(90vh,40rem)] shadow-xl' : 'hidden'
          } min-h-0 w-full shrink-0 flex-col border-t border-slate-200 bg-white lg:static lg:z-auto lg:flex lg:max-h-none lg:w-[22rem] lg:border-l lg:border-t-0 lg:shadow-none xl:w-[24rem]`}
          data-testid="dept-right-rail"
          data-slot="dialogue-confirm"
          data-mobile-drawer={mobileRightOpen ? '1' : '0'}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 lg:hidden">
              <p className="text-[12px] font-semibold text-slate-800">对话 · 交卷</p>
              <button
                type="button"
                onClick={() => setMobileRightOpen(false)}
                className="btn-press focus-ring inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-slate-500"
                data-testid="dept-mobile-right-close"
                aria-label="关闭"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
                收起
              </button>
            </div>
            {/* slot: 交卷态 */}
            <header
              className="shrink-0 border-b border-slate-200 px-3 py-2.5"
              data-slot="handoff-status"
              data-testid="dept-right-status"
            >
              <div className="flex flex-wrap items-center gap-1.5">
                {st ? <DeptStatusDot status={st} withLabel={false} /> : null}
                <span
                  className="text-[11px] font-medium text-slate-700"
                  data-testid="dept-checklist-phase"
                  data-handoff-phase={handoffPhase}
                >
                  {handoffPhaseLabel(handoffPhase)}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                {statusLine}
              </p>
            </header>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
              {/* slot: 专家协作 */}
              <section data-slot="experts" data-testid="dept-right-experts">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  专家协作（≤3）
                </p>
                <ul className="space-y-2">
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
                        className={`rounded-lg border px-2.5 py-2 ${
                          selected
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-800'
                        }`}
                        data-testid={`dept-side-expert-${peer.id}`}
                      >
                        <button
                          type="button"
                          onClick={() => openPeer(peer)}
                          className="focus-ring flex w-full items-center gap-2 text-left"
                        >
                          <ExpertAvatar
                            name={label}
                            tone={selected ? 'onDark' : 'light'}
                          />
                          <span className="min-w-0 flex-1 text-[12px] font-medium">
                            {label}
                          </span>
                        </button>
                        {hint ? (
                          <p
                            className={`mt-1 pl-9 text-[11px] leading-relaxed ${
                              selected ? 'text-white/75' : 'text-slate-500'
                            }`}
                          >
                            {hint}
                          </p>
                        ) : null}
                        <div className="mt-1.5 flex flex-wrap gap-2 pl-9">
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
                                  : 'bg-white text-slate-700 outline outline-1 -outline-offset-1 outline-black/10'
                            }`}
                            data-testid={`dept-side-adopt-${peer.id}`}
                          >
                            {adopted ? ADOPT_CTA_DONE_LABEL : ADOPT_CTA_LABEL}
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
                <p
                  className="mt-2 text-[10px] leading-relaxed text-slate-400"
                  data-slot="adopt-ne-confirm"
                  data-testid="dept-side-adopt-ne-confirm"
                >
                  {ADOPT_NE_CONFIRM_NOTE}
                </p>
                <button
                  type="button"
                  onClick={openLeadSeat}
                  className="btn-press focus-ring mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700"
                  data-testid="dept-enter-seat"
                >
                  进入专家岗 · {businessSeatLabel(dept.leadSeatId)}
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </button>
              </section>

              {/* slot: 对话 */}
              <section data-slot="conversation" data-testid="dept-right-chat">
                {seatOpen ? (
                  <div
                    className="rounded-xl border border-slate-200 bg-slate-50/80 p-2"
                    data-testid="dept-seat-workbench-wrap"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2 px-1">
                      <p className="text-[11px] font-medium text-slate-500">
                        对话 · {businessSeatLabel(activeSeat)}
                      </p>
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
                        className="btn-press focus-ring rounded-md px-2 py-1 text-[11px] font-medium text-slate-500 underline-offset-2 hover:underline"
                        data-testid="dept-close-seat"
                      >
                        收起对话
                      </button>
                    </div>
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
                      hideArtifactPanel
                      deliverBlocked={
                        !allChecklistDone || awaitingThis || st === '已完成'
                      }
                      deliverBlockedReason={
                        awaitingThis
                          ? '已交卷，待你确认；不能再交卷，也不能换部推进'
                          : st === '已完成'
                            ? '本站已确认可往下，无需再交卷'
                            : missingLabels.length
                              ? `齐套未齐，不能进待确认。缺项：${missingLabels.join('、')}`
                              : '齐套未齐，不能交卷入待你确认'
                      }
                      onAdvanced={(confirmId) => {
                        if (confirmId) navigate(`/agent/pending/${confirmId}`)
                      }}
                      onSwitchSeat={switchSeat}
                    />
                  </div>
                ) : (
                  <p
                    className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-center text-[11px] text-slate-400"
                    data-testid="dept-seat-collapsed-hint"
                  >
                    对话区默认收起。点上方专家岗后在此协作（过程可看；成果只在中栏）。交卷与确认在本栏底部。
                  </p>
                )}
              </section>

              {/* slot: 缺项 G1 */}
              <section
                data-slot="missing-checklist"
                data-testid="dept-checklist"
                aria-labelledby="dept-right-missing-title"
              >
                <h3
                  id="dept-right-missing-title"
                  className="text-[10px] font-semibold uppercase tracking-wide text-slate-400"
                >
                  齐套缺项（G1）
                </h3>
                {!allChecklistDone ? (
                  <div
                    className="mt-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] text-amber-950"
                    data-testid="dept-checklist-missing"
                  >
                    <p className="font-medium">缺项未清 · 交卷不可用</p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-4">
                      {checklistItems
                        .filter((x) => !x.done)
                        .map((x) => (
                          <li key={x.label}>{x.label}</li>
                        ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    齐套已齐。交卷后将进「待你确认」；确认权在人，专家建议稿不算拍板。
                  </p>
                )}
              </section>

              {/* slot: 回流 · 持久 pending.returnNote 优先，短暂 lastReturnHint 并存兜底 */}
              <section data-slot="return-hint" data-testid="dept-right-return">
                {returnHintText ? (
                  <div
                    className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] text-amber-950"
                    data-testid="dept-return-hint"
                    role="status"
                    data-return-source={
                      persistentReturnNote
                        ? 'pending'
                        : lastReturnHint
                          ? 'flash'
                          : undefined
                    }
                  >
                    回流意见：{returnHintText}
                  </div>
                ) : null}
                {awaitingThis ? (
                  <div
                    className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-2 text-[11px] font-medium text-amber-950"
                    role="status"
                    data-testid="dept-awaiting-confirm-banner"
                  >
                    待你确认 · 未拍板 · {AWAITING_ADVANCE_LOCK_HINT}
                  </div>
                ) : null}
              </section>
            </div>

            {/* 底：交卷 + 确认（仅右栏） */}
            <footer
              className="shrink-0 space-y-2 border-t border-slate-200 px-3 py-3"
              data-slot="submit-confirm"
              data-testid="dept-right-submit"
            >
              <button
                type="button"
                onClick={onSubmit}
                disabled={!canSubmit && cta.action !== 'confirm' && !awaitingThis}
                title={
                  awaitingThis || cta.action === 'confirm'
                    ? AWAITING_ADVANCE_LOCK_HINT
                    : !canSubmit
                      ? missingLabels.length
                        ? `缺项：${missingLabels.join('、')}`
                        : '齐套要点未齐，暂不可交卷'
                      : undefined
                }
                className={`btn-press focus-ring inline-flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                  cta.action === 'confirm' || awaitingThis
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-900 text-white'
                }`}
                data-testid="dept-primary-cta"
                data-can-submit={canSubmit ? '1' : '0'}
                data-awaiting-confirm={awaitingThis ? '1' : '0'}
              >
                {primaryLabel}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>

              {(cta.action === 'confirm' || awaitingThis) && cta.confirmId ? (
                <Link
                  to={`/agent/pending/${cta.confirmId}`}
                  className="btn-press focus-ring block w-full rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-center text-[11px] font-medium text-amber-950"
                  data-testid="dept-right-confirm-link"
                >
                  打开确认页 · 过 / 驳回
                </Link>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Link
                  to={companyHref}
                  className="btn-press focus-ring inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
                  data-testid="dept-side-back-company"
                >
                  <Building2 className="h-3 w-3" aria-hidden />
                  回公司首页
                </Link>
              </div>

              <div data-testid="dept-side-switch-depts">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  换部
                </p>
                <ul className="flex flex-wrap gap-1">
                  {switchDepts.map((d) => (
                    <li key={d.id}>
                      {d.locked && !d.active ? (
                        <span
                          className="inline-block cursor-not-allowed rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-400"
                          title={d.lockReason ?? '待你确认后才能推进'}
                          data-testid={`dept-side-switch-${d.id}`}
                          data-locked="1"
                          aria-disabled="true"
                        >
                          {d.label} · 锁
                        </span>
                      ) : (
                        <Link
                          to={d.href}
                          className={`focus-ring inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            d.active
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          data-testid={`dept-side-switch-${d.id}`}
                          data-locked="0"
                        >
                          {d.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </footer>
          </div>
        </aside>
      </div>

      {/* 窄屏底栏：目录开关 + 打开对话/交卷（G1 可达） */}
      <div
        className="flex shrink-0 items-center gap-2 border-t border-slate-200 bg-white px-3 py-2 lg:hidden"
        data-testid="dept-mobile-dock"
      >
        <button
          type="button"
          onClick={() => setLeftOpen((v) => !v)}
          className="btn-press focus-ring inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-700"
          data-testid="dept-mobile-toggle-left"
          aria-pressed={leftOpen}
        >
          <PanelLeft className="h-3.5 w-3.5" aria-hidden />
          {leftOpen ? '收起目录' : '材料目录'}
        </button>
        <button
          type="button"
          onClick={() => setMobileRightOpen(true)}
          className={`btn-press focus-ring inline-flex flex-[1.4] items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[11px] font-semibold ${
            awaitingThis || cta.action === 'confirm'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-900 text-white'
          }`}
          data-testid="dept-mobile-open-right"
        >
          <MessageSquare className="h-3.5 w-3.5" aria-hidden />
          对话 · 交卷
        </button>
      </div>
    </div>
  )
}
