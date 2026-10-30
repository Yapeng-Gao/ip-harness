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
import { ArrowRight, Building2, PanelLeft, MessageSquare, X } from 'lucide-react'
import { formatArtifactSavedAt } from '../../business/artifactVersions'
import {
  pendingAuditPath,
  workbenchAskPath,
} from '../../business/pendingDeptQuery'
import {
  isThinShellDept,
  resolveCurrentStep,
  stepfulKindForDept,
  stepsForKind,
  THIN_LINE_BY_DEPT,
} from '../../business/workbenchSteps'

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
 * 部门工作台 · product-pages §2 Cursor 三栏
 * 左·材料目录 | 中·产出正文 | 右·跟本部门负责人对话（编制/工具点开再看）
 * 硬请示进对话汇报气泡；交卷主 CTA 仍在右栏底。confirmGate 只接线不改逻辑。
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
  /** 右栏默认就跟本部门负责人对话（不再「对话区默认收起」） */
  const [seatOpen, setSeatOpen] = useState(true)
  const [adoptedPeerIds, setAdoptedPeerIds] = useState<string[]>([])
  const [selectedMaterialId, setSelectedMaterialId] = useState('deliverable')
  /** 编制默认收；工具/巡检点开再看 */
  const [rosterOpen, setRosterOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  /** 窄屏：左目录可收起；右栏改底抽屉（G1 交卷可达） */
  const [leftOpen, setLeftOpen] = useState(true)
  const [mobileRightOpen, setMobileRightOpen] = useState(false)
  /** 演示：强制当前步（不改闸口真值） */
  const [forceStepId, setForceStepId] = useState<string | null>(
    params.get('step') || null,
  )

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

  const askParam = params.get('ask')
  useEffect(() => {
    if (!askParam) return
    setSeatOpen(true)
    setMobileRightOpen(true)
  }, [askParam])

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

  const peers: DeptPeer[] = dept?.peers ?? []

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
    if (cta.action === 'confirm' && cta.confirmId && kindForDept) {
      navigate(
        workbenchAskPath(caseId, kindForDept, { confirmId: cta.confirmId }),
      )
      return
    }
    if (cta.action === 'confirm' && cta.confirmId) {
      navigate(pendingAuditPath(cta.confirmId, slug || undefined))
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
  // 持久回流意见（pending.returned.returnNote）；不依赖会 6s 清空的 lastReturnHint
  const persistentReturnNote = latestReturnNote(pending, kindForDept)
  const returnHintText = persistentReturnNote || lastReturnHint || null
  // 退回相：st===退回 / 持久 returnNote / 短暂 lastReturnHint 任一即标「退回」（与公司抽屉一致）
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

  const stepKind = stepfulKindForDept(dept.id)
  const thinShell = isThinShellDept(dept.id)
  const thinMeta = THIN_LINE_BY_DEPT[dept.id]
  const currentStep =
    stepKind != null
      ? resolveCurrentStep(stepKind, {
          stepIndex,
          awaitingConfirm: awaitingThis,
          leadDone,
          forceStepId,
          deptId: dept.id,
        })
      : null
  const stepList = stepKind != null ? stepsForKind(stepKind) : []
  const qualifyLine =
    thinMeta?.line ||
    (stepKind === 'd4'
      ? '交底质检全绿'
      : stepKind === 'd5'
        ? '申请文件可递交（过线）'
        : stepKind === 'd6'
          ? '本轮答复可递交（D 过线）'
          : handoff.deliverable.slice(0, 36) || '本站合格线')

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
      data-step-kind={stepKind ?? 'thin'}
      data-step-id={currentStep?.id ?? ''}
      data-ask={askParam ?? ''}
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
            <p
              className="mt-0.5 max-w-xl text-xs text-slate-600"
              data-testid="dept-qualify-line"
            >
              合格线：{qualifyLine}
              {st ? ` · ${st}` : ''}
              {currentStep ? ` · 本步 ${currentStep.label}` : thinShell ? ' · 薄部同壳' : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/agent"
              className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
              data-testid="dept-back-hall"
            >
              回大厅
            </Link>
            <Link
              to={companyHref}
              className="btn-press focus-ring rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
            >
              公司首页
            </Link>
            <Link
              to={
                pending[0] && kindForDept
                  ? workbenchAskPath(caseId, pending[0].kind, {
                      confirmId: pending[0].id,
                    })
                  : `/agent/pending?audit=1&caseId=${encodeURIComponent(caseId)}`
              }
              className="btn-press focus-ring rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-medium text-amber-950"
              data-testid="dept-pending-link"
            >
              要你拍{pending.length > 0 ? ` · ${pending.length}` : ''}
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
            {stepKind && currentStep && selectedMaterialId === 'deliverable' ? (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2" data-testid="dept-step-demo">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    本步
                  </span>
                  {stepList.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setForceStepId(s.id)}
                      className={`btn-press focus-ring rounded-full border px-2 py-0.5 text-[10px] ${
                        s.id === currentStep.id
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                      data-testid={`dept-step-${s.id}`}
                    >
                      {s.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setForceStepId(null)}
                    className="btn-press focus-ring rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-[10px] text-slate-500"
                    data-testid="dept-step-auto"
                  >
                    跟闸
                  </button>
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-2">
                  <h2
                    id="dept-output-title"
                    className="text-[13px] font-semibold text-slate-900"
                  >
                    {currentStep.label}
                    <span className="ml-2 text-[11px] font-normal text-slate-500">
                      {currentStep.hint}
                    </span>
                  </h2>
                  <span className="text-[10px] text-slate-400">
                    主栏=本步交付物 · 拍板在右栏
                  </span>
                </div>
                <p
                  className="mt-1 text-[12px] leading-relaxed text-slate-600"
                  data-testid="dept-step-caption"
                >
                  {currentStep.mainFocus}
                </p>
                <pre
                  className="mt-3 max-h-[min(70vh,36rem)] overflow-auto rounded-md bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-700 whitespace-pre-wrap"
                  data-testid="dept-output-body"
                >
                  {currentStep.mainBody}
                </pre>
                {askParam ? (
                  <p
                    className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-950"
                    data-testid="dept-ask-banner"
                  >
                    有要你拍的硬请示 —— 请看右侧对话（跟本部门负责人）。
                  </p>
                ) : null}
              </div>
            ) : thinShell && selectedMaterialId === 'deliverable' ? (
              <div
                className="rounded-xl border border-dashed border-slate-300 bg-white p-6 shadow-sm"
                data-testid="dept-thin-empty"
              >
                <h2
                  id="dept-output-title"
                  className="text-[14px] font-semibold text-slate-900"
                >
                  {deptLabel(dept)} · 同壳空态
                </h2>
                <p className="mt-2 text-[12px] text-slate-600" data-testid="dept-qualify-line-body">
                  合格线：{thinMeta?.line ?? qualifyLine}
                </p>
                {thinMeta?.ban ? (
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                    边界：{thinMeta.ban}
                  </p>
                ) : null}
                <p className="mt-4 text-[12px] text-slate-500">
                  薄部一期可进得去；主交付物未满时不堆假进度墙。硬请示仍在右栏对话。
                </p>
                {askParam ? (
                  <p
                    className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-950"
                    data-testid="dept-ask-banner"
                  >
                    有要你拍的硬请示 —— 请看右侧对话。
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-baseline justify-between gap-2">
                  <h2
                    id="dept-output-title"
                    className="text-[13px] font-semibold text-slate-900"
                  >
                    {centerTitle}
                  </h2>
                  <span className="text-[10px] text-slate-400">
                    中栏=产出正文 · 对话在右栏
                  </span>
                </div>
                <pre
                  className="mt-3 max-h-[min(70vh,36rem)] overflow-auto rounded-md bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-700 whitespace-pre-wrap"
                  data-testid="dept-output-body"
                >
                  {centerBody}
                </pre>
              </div>
            )}
            <p className="text-center text-[11px] text-slate-400">
              演示环境：按步主栏 · 非真递交局端。
            </p>
          </section>
        </main>

        {/* 窄屏：右栏底抽屉遮罩 */}
        {mobileRightOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-slate-900/20 lg:hidden"
            aria-label="关闭对话"
            data-testid="dept-mobile-right-backdrop"
            onClick={() => setMobileRightOpen(false)}
          />
        ) : null}

        {/* 右栏 = 跟本部门负责人对话；编制/工具点开再看；硬请示进对话气泡 */}
        <aside
          className={`${
            mobileRightOpen ? 'fixed inset-x-0 bottom-0 z-40 flex max-h-[min(90vh,40rem)] shadow-xl' : 'hidden'
          } min-h-0 w-full shrink-0 flex-col border-t border-slate-200 bg-white lg:static lg:z-auto lg:flex lg:max-h-none lg:w-[21.25rem] lg:border-l lg:border-t-0 lg:shadow-none xl:w-[21.25rem]`}
          data-testid="dept-right-rail"
          data-slot="dialogue-confirm"
          data-mobile-drawer={mobileRightOpen ? '1' : '0'}
          data-rail-model="leader-chat"
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 lg:hidden">
              <p className="text-[12px] font-semibold text-slate-800">对话</p>
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

            {/* 身份行：本部门负责人 + 编制开关 */}
            <header
              className="flex shrink-0 items-center gap-2 border-b border-slate-200 px-3 py-2"
              data-slot="identity"
              data-testid="dept-right-identity"
            >
              <button
                type="button"
                onClick={openLeadSeat}
                className="focus-ring flex min-w-0 flex-1 items-center gap-2 rounded-md text-left"
                data-testid="dept-right-leader"
                aria-label={`跟本部门负责人 ${businessSeatLabel(dept.leadSeatId)} 对话`}
              >
                <ExpertAvatar
                  name={businessSeatLabel(dept.leadSeatId)}
                  seed={dept.leadSeatId}
                  size="md"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-semibold text-slate-900">
                    {businessSeatLabel(dept.leadSeatId)}
                  </span>
                  <span
                    className="mt-0.5 flex flex-wrap items-center gap-1 text-[10px] text-slate-500"
                    data-testid="dept-right-status"
                  >
                    {st ? <DeptStatusDot status={st} withLabel={false} /> : null}
                    <span data-testid="dept-checklist-phase" data-handoff-phase={handoffPhase}>
                      本部门负责人
                      {st ? ` · ${handoffPhaseLabel(handoffPhase)}` : ''}
                    </span>
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRosterOpen((v) => !v)}
                className={`btn-press focus-ring shrink-0 rounded-md px-2 py-1 text-[11px] font-medium ${
                  rosterOpen
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-600'
                }`}
                data-testid="dept-roster-toggle"
                aria-expanded={rosterOpen}
              >
                编制{peers.length ? ` · ${peers.length}` : ''}
              </button>
            </header>

            {/* 编制：默认收；展开才见全专家 */}
            {rosterOpen ? (
              <section
                className="shrink-0 border-b border-slate-100 px-3 py-2"
                data-slot="experts"
                data-testid="dept-right-experts"
                data-roster-folded="0"
              >
                <ul className="flex flex-wrap gap-2" data-testid="dept-right-roster-row">
                  <li>
                    <button
                      type="button"
                      onClick={openLeadSeat}
                      className={`focus-ring inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] ${
                        activeSeat === dept.leadSeatId && seatOpen
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                      data-testid="dept-side-expert-lead"
                      title="本部门负责人"
                    >
                      <ExpertAvatar
                        name={businessSeatLabel(dept.leadSeatId)}
                        seed={dept.leadSeatId}
                        size="sm"
                        tone={activeSeat === dept.leadSeatId ? 'onDark' : 'light'}
                      />
                      负责人
                    </button>
                  </li>
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
                    const adopted = adoptedPeerIds.includes(peer.id)
                    return (
                      <li key={peer.id} className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openPeer(peer)}
                          className={`focus-ring inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] ${
                            selected
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-slate-200 bg-slate-50 text-slate-700'
                          }`}
                          data-testid={`dept-side-expert-${peer.id}`}
                          title={peerSuggestionHint(dept.id, peer.id) || label}
                        >
                          <ExpertAvatar
                            name={label}
                            size="sm"
                            tone={selected ? 'onDark' : 'light'}
                          />
                          <span className="max-w-[5.5rem] truncate">{label}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleAdopt(peer.id)}
                          className={`btn-press focus-ring rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                            adopted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-slate-500 outline outline-1 -outline-offset-1 outline-black/10'
                          }`}
                          data-testid={`dept-side-adopt-${peer.id}`}
                          title={adopted ? ADOPT_CTA_DONE_LABEL : ADOPT_CTA_LABEL}
                        >
                          {adopted ? '已采' : '采纳'}
                        </button>
                      </li>
                    )
                  })}
                </ul>
                <p
                  className="mt-1.5 text-[10px] leading-relaxed text-slate-400"
                  data-slot="adopt-ne-confirm"
                  data-testid="dept-side-adopt-ne-confirm"
                >
                  {ADOPT_NE_CONFIRM_NOTE}
                </p>
              </section>
            ) : (
              <div className="sr-only" data-testid="dept-right-experts" data-roster-folded="1">
                编制已收起
              </div>
            )}

            {/* 对话吃高：硬请示气泡 + 席会话 + composer（席内钉底） */}
            <div
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
              data-slot="conversation"
              data-testid="dept-right-chat"
            >
              <div className="shrink-0 space-y-2 px-3 pt-2">
                {/* 硬请示 = 汇报气泡（一句结论 + 选项）；不另开 sticky 同文卡 */}
                {awaitingThis ? (
                  <div
                    className="max-w-[95%] rounded-2xl rounded-tl-md bg-violet-50 px-3 py-2 text-[12px] leading-relaxed text-slate-900"
                    role="status"
                    data-testid="dept-ask-bubble-confirm"
                    data-ask-kind="confirm"
                    data-awaiting-banner="1"
                  >
                    {/* 兼容旧闸：保留 awaiting banner 语义 */}
                    <span className="sr-only" data-testid="dept-awaiting-confirm-banner">
                      待你确认
                    </span>
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-violet-700/80">
                      {businessSeatLabel(dept.leadSeatId)} · 汇报
                    </p>
                    <p className="mt-0.5 font-medium">
                      本站已交卷，待你拍板。
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-600">
                      {AWAITING_ADVANCE_LOCK_HINT}
                    </p>
                    {cta.confirmId ? (
                      <Link
                        to={
                          kindForDept
                            ? workbenchAskPath(caseId, kindForDept, {
                                confirmId: cta.confirmId,
                              })
                            : pendingAuditPath(cta.confirmId, slug || undefined)
                        }
                        className="btn-press focus-ring mt-2 inline-flex rounded-full bg-amber-600 px-3 py-1 text-[11px] font-semibold text-white"
                        data-testid="dept-right-confirm-link"
                      >
                        打开确认页 · 过 / 驳回
                      </Link>
                    ) : null}
                  </div>
                ) : null}

                {returnHintText && !awaitingThis ? (
                  <div
                    className="max-w-[95%] rounded-2xl rounded-tl-md bg-amber-50 px-3 py-2 text-[12px] leading-relaxed text-amber-950"
                    role="status"
                    data-testid="dept-return-hint"
                    data-return-source={
                      persistentReturnNote
                        ? 'pending'
                        : lastReturnHint
                          ? 'flash'
                          : undefined
                    }
                  >
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-amber-800/80">
                      {businessSeatLabel(dept.leadSeatId)} · 回流
                    </p>
                    <p className="mt-0.5">{returnHintText}</p>
                  </div>
                ) : null}

                {!allChecklistDone ? (
                  <div
                    className="max-w-[95%] rounded-2xl rounded-tl-md bg-violet-50 px-3 py-2 text-[12px] leading-relaxed text-slate-900"
                    data-testid="dept-ask-bubble-g1"
                    data-ask-kind="g1"
                  >
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-violet-700/80">
                      {businessSeatLabel(dept.leadSeatId)} · 汇报
                    </p>
                    <p className="mt-0.5 font-medium">齐套未齐，还不能交卷。</p>
                    <ul
                      className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-slate-600"
                      data-testid="dept-checklist-missing"
                    >
                      {checklistItems
                        .filter((x) => !x.done)
                        .map((x) => (
                          <li key={x.label}>{x.label}</li>
                        ))}
                    </ul>
                    {/* 兼容闸测：保留 checklist 槽，不占视觉墙 */}
                    <div className="sr-only" data-testid="dept-checklist" aria-hidden>
                      齐套缺项
                    </div>
                  </div>
                ) : (
                  <div className="sr-only" data-testid="dept-checklist">
                    齐套已齐
                  </div>
                )}

                {returnHintText && awaitingThis ? (
                  <div className="sr-only" data-testid="dept-right-return" />
                ) : (
                  <div className="sr-only" data-testid="dept-right-return" />
                )}
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {seatOpen ? (
                  <div
                    className="flex min-h-0 flex-1 flex-col"
                    data-testid="dept-seat-workbench-wrap"
                  >
                    <BusinessSeatWorkbench
                      caseId={caseId}
                      seatId={activeSeat}
                      workNonce={workNonce}
                      hideArtifactPanel
                      compactRail
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
                        if (confirmId)
                          navigate(
                            kindForDept
                              ? workbenchAskPath(caseId, kindForDept, {
                                  confirmId,
                                })
                              : pendingAuditPath(confirmId, slug || undefined),
                          )
                      }}
                      onSwitchSeat={switchSeat}
                    />
                  </div>
                ) : (
                  <p
                    className="px-3 py-3 text-center text-[11px] text-slate-400"
                    data-testid="dept-seat-collapsed-hint"
                  >
                    点上方负责人开始对话。
                  </p>
                )}
              </div>

              {/* 工具 / 巡检：点开再看，不抢对话高度 */}
              {toolsOpen ? (
                <div
                  className="max-h-[40%] shrink-0 overflow-y-auto border-t border-slate-100 px-2 py-2"
                  data-testid="dept-right-tools"
                >
                  <CaseAssistantPanel
                    caseId={caseId}
                    stageId={prog.stageId}
                    activeSeat={activeSeat}
                    onSwitchSeat={switchSeat}
                  />
                </div>
              ) : null}
            </div>

            {/* 底：主 CTA 一行 + 工具/换部辅 */}
            <footer
              className="shrink-0 space-y-1.5 border-t border-slate-200 px-3 py-2"
              data-slot="submit-confirm"
              data-testid="dept-right-submit"
            >
              {/* 待确认时气泡已带主选项；底栏不再复述同文 sticky，只留可达 CTA */}
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

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setToolsOpen((v) => !v)}
                  className={`btn-press focus-ring rounded-md px-2 py-1 text-[10px] font-medium ${
                    toolsOpen
                      ? 'bg-slate-800 text-white'
                      : 'border border-slate-200 bg-white text-slate-500'
                  }`}
                  data-testid="dept-tools-toggle"
                  aria-expanded={toolsOpen}
                >
                  {toolsOpen ? '收起工具' : '工具'}
                </button>
                <Link
                  to={companyHref}
                  className="btn-press focus-ring inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600"
                  data-testid="dept-side-back-company"
                >
                  <Building2 className="h-3 w-3" aria-hidden />
                  公司
                </Link>
                <details className="min-w-0 flex-1" data-testid="dept-side-switch-depts">
                  <summary className="cursor-pointer select-none text-[10px] font-medium text-slate-400">
                    换部
                  </summary>
                  <ul className="mt-1 flex flex-wrap gap-1">
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
                </details>
                <button
                  type="button"
                  onClick={openLeadSeat}
                  className="sr-only"
                  data-testid="dept-enter-seat"
                  tabIndex={-1}
                >
                  进入专家岗
                </button>
              </div>
            </footer>
          </div>
        </aside>
      </div>

      {/* 窄屏底栏：目录开关 + 打开对话（G1 可达） */}
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
          对话
        </button>
      </div>
    </div>
  )
}
