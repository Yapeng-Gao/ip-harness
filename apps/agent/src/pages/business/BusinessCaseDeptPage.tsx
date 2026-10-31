import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import {
  businessSeatLabel,
  currentSeatForProgress,
  nextSeatAfterConfirm,
  normalizeResearchPass,
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
  orgDeptByLeadSeat,
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
import { ArrowRight, Building2, FolderOpen, PanelLeft, MessageSquare, Package, X } from 'lucide-react'
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
import { evaluateEntryGate } from '../../business/entryGate'
import { DeptHandoffTicket } from '../../components/business/DeptHandoffTicket'
import { CaseFileDrawer } from '../../components/business/CaseFileDrawer'
import { DeptAskReportBubble } from '../../components/business/DeptAskReportBubble'
import {
  disclosureToDraftTicket,
  draftInheritedHandoffLine,
} from '../../business/interDeptTicket'
import {
  demoCaseFileChecks,
  demoCaseFileMaterials,
  demoCaseFileTickets,
  demoLineBadges,
  isDisclosureDept,
  isDraftDept,
} from '../../business/caseFileDemo'
import { ThinDeptWorkPanel } from '../../components/business/ThinDeptWorkPanel'
import { BranchFlowPanel } from '../../components/business/BranchFlowPanel'
import { TeachingFadeTip } from '../../components/business/TeachingFadeTip'
import { lineDiff, diffStats } from '../../business/lineDiff'
import { buildBranchJudgment } from '../../business/judgmentArchive'
import { useEntryRole } from '../../business/useEntryRole'
import { prefsHintForDept } from '../../business/preferenceStore'
import { styleTagForDept, normalizePeerJobTitle } from '../../business/agentStyle'

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
  const { entryRole } = useEntryRole()
  const {
    getCase,
    getProgress,
    getPendingConfirms,
    getConfirm,
    primaryCta,
    lastReturnHint,
    clearReturnHint,
    confirmItem,
    returnItem,
    getJudgments,
    getPreferences,
    recordJudgment,
    savePreferenceById,
    precipitateJudgment,
  } = useBusinessCases()
  const { getThread, patchThread } = useProjectFolder()
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
  /** 案卷抽屉 · 交互大纲 §4.5 */
  const [caseFileOpen, setCaseFileOpen] = useState(
    params.get('docket') === '1' || params.get('file') === '1',
  )
  const [askBusy, setAskBusy] = useState(false)
  const [focusConfirmId, setFocusConfirmId] = useState<string | null>(
    params.get('confirm') || params.get('askId') || null,
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
  const pendingForDept = useMemo(() => {
    if (!kindForDept) return [] as typeof pending
    return pending.filter((p) => p.kind === kindForDept && p.status === 'pending')
  }, [pending, kindForDept])
  const askConfirmId =
    focusConfirmId && pendingForDept.some((p) => p.id === focusConfirmId)
      ? focusConfirmId
      : params.get('confirm') && pendingForDept.some((p) => p.id === params.get('confirm'))
        ? params.get('confirm')!
        : cta.confirmId && pendingForDept.some((p) => p.id === cta.confirmId)
          ? cta.confirmId
          : pendingForDept[0]?.id
  const pendingAskItem = askConfirmId
    ? getConfirm(askConfirmId) ?? pendingForDept.find((p) => p.id === askConfirmId)
    : undefined

  const onAskConfirm = async (
    confirmId: string,
    opts?: { reason?: string; riskAccepted?: boolean },
  ) => {
    setAskBusy(true)
    try {
      const synced = await confirmItem(confirmId, opts)
      if (!synced.businessOk) return
      const item = getConfirm(confirmId)
      if (!item) return
      const pass = normalizeResearchPass(getProgress(caseId).researchPass)
      const nextSeat = nextSeatAfterConfirm(item.kind, pass)
      const nextDept = orgDeptByLeadSeat(nextSeat)
      if (nextDept) {
        navigate(
          `/agent/cases/${caseId}/depts/${deptSlug(nextDept.id)}?seat=${nextSeat}`,
          { state: { confirmed: item.kind } },
        )
      }
    } finally {
      setAskBusy(false)
    }
  }

  const onAskReturn = async (confirmId: string, note: string) => {
    setAskBusy(true)
    try {
      await returnItem(confirmId, note)
    } finally {
      setAskBusy(false)
    }
  }

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

  const disclosureDone =
    Boolean(dept && isDisclosureDept(dept.id) && st === '已完成') ||
    Boolean(prog.doneSeatIds?.includes('expert-disclosure'))
  const showHandoffTicket =
    Boolean(dept) &&
    (params.get('ticket') === '1' ||
      (isDisclosureDept(dept?.id) &&
        (st === '已完成' || handoffPhase === '已确认可往下' || params.get('ticket') === '1')))
  const showDraftInherit =
    Boolean(dept && isDraftDept(dept.id) && disclosureDone)
  const interTicket = disclosureToDraftTicket(caseId)

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
  const entryGate = evaluateEntryGate({
    deptId: dept.id,
    doneSeatIds: prog.doneSeatIds ?? [],
    filed: Boolean(prog.filed),
    disclosureConfirmed: disclosureDone,
    agencyEscort:
      entryRole === 'agency' && params.get('escort') === '1',
    bypass: params.get('gate') === 'bypass',
  })
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
            <button
              type="button"
              onClick={() => setCaseFileOpen(true)}
              className="btn-press focus-ring inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
              data-testid="dept-open-case-file"
            >
              <FolderOpen className="h-3.5 w-3.5" aria-hidden />
              案卷
            </button>
            {isDisclosureDept(dept.id) && disclosureDone ? (
              <button
                type="button"
                onClick={() => {
                  const el = document.querySelector('[data-testid="dept-handoff-ticket"]')
                  el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                }}
                className="btn-press focus-ring inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-medium text-emerald-900"
                data-testid="dept-open-handoff-ticket"
              >
                <Package className="h-3.5 w-3.5" aria-hidden />
                ④→⑤ 工单
              </button>
            ) : null}
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

      {!entryGate.ok ? (
        <div
          className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-3 lg:px-6"
          data-testid="dept-entry-gate"
          data-gate-ok="0"
          role="alert"
        >
          <div
            data-testid={
              dept && isDraftDept(dept.id) ? 'b2-block' : 'entry-gate-block'
            }
          >
          <p className="text-[13px] font-semibold text-amber-950">{entryGate.title}</p>
          <p className="mt-0.5 text-[12px] text-amber-900/90">{entryGate.reason}</p>
          <p className="mt-1 text-[11px] text-amber-800/80">{entryGate.fixHint}</p>
          <p className="mt-1 text-[10px] text-amber-700/70">{entryGate.honesty}</p>
          {dept && isDraftDept(dept.id) ? (
            <p className="mt-2 text-[11px] font-medium text-amber-950" data-testid="b2-gaps">
              B2 缺口：交底未全绿 / 无④→⑤工单 · 请回④补料或走工单，禁止未全绿硬写。
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2">
            {entryGate.fixHrefHint === 'disclosure' ? (
              <Link
                to={`/agent/cases/${caseId}/depts/disclosure`}
                className="btn-press focus-ring rounded-md bg-amber-900 px-2.5 py-1 text-[11px] font-semibold text-white"
                data-testid="dept-entry-gate-fix"
              >
                去交底部补门槛
              </Link>
            ) : null}
            {entryGate.fixHrefHint === 'draft' ? (
              <Link
                to={`/agent/cases/${caseId}/depts/draft`}
                className="btn-press focus-ring rounded-md bg-amber-900 px-2.5 py-1 text-[11px] font-semibold text-white"
                data-testid="dept-entry-gate-fix"
              >
                去申请部补门槛
              </Link>
            ) : null}
            {entryGate.fixHrefHint === 'company' ? (
              <Link
                to={`/agent/cases/${caseId}`}
                className="btn-press focus-ring rounded-md bg-amber-900 px-2.5 py-1 text-[11px] font-semibold text-white"
                data-testid="dept-entry-gate-fix"
              >
                回公司首页
              </Link>
            ) : null}
            <Link
              to={`/agent/cases/${caseId}/depts/${deptSlug(dept.id)}?gate=bypass`}
              className="btn-press focus-ring rounded-md border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-medium text-amber-900"
              data-testid="dept-entry-gate-bypass"
            >
              演示旁路（不装已过线）
            </Link>
          </div>
          </div>
        </div>
      ) : (
        <div className="sr-only" data-testid="dept-entry-gate" data-gate-ok="1">
          {entryGate.title}
        </div>
      )}

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
            <TeachingFadeTip deptId={dept.id} />
            {prefsHintForDept(deptLabel(dept)).length > 0 ? (
              <aside
                className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2"
                data-testid="pref-dept-hints"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800/80">
                  跨案偏好提示 · 可读可写演示仓
                </p>
                <ul className="mt-1 space-y-1">
                  {prefsHintForDept(deptLabel(dept)).slice(0, 3).map((p) => (
                    <li key={p.id} className="text-[11px] text-slate-800" data-testid="pref-dept-hint">
                      {p.text}
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}
            <BranchFlowPanel
              branch={params.get('branch')}
              caseId={caseId}
              deptSlug={slug || deptSlug(dept.id)}
              onRecordJudgment={(j) => recordJudgment(j)}
            />
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
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                data-testid="dept-thin-work"
              >
                <h2
                  id="dept-output-title"
                  className="text-[14px] font-semibold text-slate-900"
                >
                  {thinMeta?.workTitle ?? `${deptLabel(dept)} · 同壳作业`}
                </h2>
                <p className="mt-2 text-[12px] text-slate-600" data-testid="dept-qualify-line-body">
                  合格线：{thinMeta?.line ?? qualifyLine}
                </p>
                {thinMeta?.ban ? (
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                    边界：{thinMeta.ban}
                  </p>
                ) : null}
                <ThinDeptWorkPanel
                  deptId={dept.id}
                  caseId={caseId}
                  onRecordNote={(note) => {
                    if (params.get('branch') === 'b7' && note.includes('只读不拍')) {
                      recordJudgment(
                        buildBranchJudgment({
                          caseId,
                          gate: '⑧只读不拍',
                          conclusion: '本轮只读不拍',
                          option: '只读不拍',
                          reason: 'B7 · 不回写⑦维持/放弃台账',
                          compare: '未拍却改台账 = 禁止',
                        }),
                      )
                    }
                  }}
                />
                <p className="mt-3 text-[11px] text-slate-500">
                  示意作业 · 非真零件挂接；官报/真检索不在范围。
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
                {selectedMaterialId.startsWith('version-') ? (
                  <VersionDiffPanel
                    current={
                      thread?.artifactMarkdown?.trim() ||
                      deliverableSummary ||
                      handoff.deliverable
                    }
                    selectedMaterialId={selectedMaterialId}
                    versions={versions}
                    onApprove={(markdown) => {
                      if (!activeSeat) return
                      patchThread(caseId, activeSeat, {
                        artifactMarkdown: markdown,
                      })
                      setSelectedMaterialId('deliverable')
                    }}
                    onKeep={() => setSelectedMaterialId('deliverable')}
                  />
                ) : null}
              </div>
            )}
            
            {params.get('branch') === 'b5' && dept && isDraftDept(dept.id) ? (
              <div
                className="rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-[12px] leading-relaxed text-slate-800"
                data-testid="branch-b5-panel"
                role="region"
                aria-label="B5 不申结案"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-800/80">
                  B5 · 不申结案
                </p>
                <p className="mt-0.5 font-medium">
                  ⑤ B 拍「不申」：结案/转秘密 · <strong>不</strong>出申请号 · 可不进 C
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-press focus-ring rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white"
                    data-testid="branch-b5-no-apply"
                    onClick={() => {
                      recordJudgment(
                        buildBranchJudgment({
                          caseId,
                          gate: '⑤申不申',
                          conclusion: '不申',
                          option: '不申结案',
                          reason: 'B5 · 不出申请号',
                          compare: '不申却出申请号 = 禁止假装',
                        }),
                      )
                    }}
                  >
                    确认不申结案
                  </button>
                  <Link
                    to={`/agent/cases/${caseId}/depts/draft?step=b`}
                    className="btn-press focus-ring rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-medium text-slate-700"
                  >
                    改拍「申请」
                  </Link>
                </div>
              </div>
            ) : null}

            {showDraftInherit ? (
              <div
                className="rounded-xl border border-violet-200 bg-violet-50/80 px-4 py-3 text-[12px] leading-relaxed text-slate-800"
                data-testid="dept-draft-inherit-handoff"
                role="status"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-700/80">
                  接④工单
                </p>
                <p className="mt-0.5 font-medium">{draftInheritedHandoffLine()}</p>
                <p className="mt-1 text-[11px] text-slate-600">
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                    交底质检全绿
                  </span>{' '}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    申请尚未过线
                  </span>
                </p>
              </div>
            ) : null}

            {showHandoffTicket ? (
              <DeptHandoffTicket
                caseId={caseId}
                ticket={interTicket}
                side={isDraftDept(dept.id) ? 'to' : 'from'}
              />
            ) : null}

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
                    <span
                      className="rounded-full bg-violet-600/10 px-1.5 py-0.5 text-[9px] font-medium text-violet-800"
                      data-testid="agent-style-tag"
                      title={styleTagForDept(dept.id).line}
                    >
                      风格 · {styleTagForDept(dept.id).label}
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
                    const label = normalizePeerJobTitle(peerDisplayLabel(dept.id, peer.id, peer.label))
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
              <section
                className="flex shrink-0 items-center gap-1.5 border-b border-slate-100 px-3 py-1.5"
                data-testid="dept-right-experts"
                data-roster-folded="1"
                aria-label="编制已收起 · 头像条"
              >
                <button
                  type="button"
                  onClick={openLeadSeat}
                  className="focus-ring rounded-full"
                  title={businessSeatLabel(dept.leadSeatId)}
                  data-testid="dept-side-expert-lead-folded"
                >
                  <ExpertAvatar
                    name={businessSeatLabel(dept.leadSeatId)}
                    seed={dept.leadSeatId}
                    size="sm"
                  />
                </button>
                {peers.slice(0, 5).map((peer) => {
                  const label = normalizePeerJobTitle(peerDisplayLabel(dept.id, peer.id, peer.label))
                  return (
                    <button
                      key={peer.id}
                      type="button"
                      onClick={() => {
                        setRosterOpen(true)
                        openPeer(peer)
                      }}
                      className="focus-ring rounded-full"
                      title={label}
                      data-testid={`dept-side-expert-folded-${peer.id}`}
                    >
                      <ExpertAvatar name={label} size="sm" />
                    </button>
                  )
                })}
                {peers.length > 5 ? (
                  <span className="text-[9px] text-slate-400">+{peers.length - 5}</span>
                ) : null}
                <span className="sr-only">编制已收起</span>
              </section>
            )}

            {/* 对话吃高：硬请示气泡 + 席会话 + composer（席内钉底） */}
            <div
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
              data-slot="conversation"
              data-testid="dept-right-chat"
            >
              <div className="shrink-0 space-y-2 px-3 pt-2">
                <p
                  className="text-[10px] leading-snug text-slate-400"
                  data-testid="agent-style-line"
                >
                  {styleTagForDept(dept.id).line}
                </p>
                {/* 硬请示 = 汇报气泡（一句结论 + 选项）；不另开 sticky 同文卡 */}
                {/* 多项未关请示：仅跳转 chip（样机 askSticky · 禁同文复述） */}
                {pendingForDept.length > 1 ? (
                  <div
                    className="flex flex-wrap items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5"
                    data-testid="ask-sticky"
                  >
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                      跳转
                    </span>
                    {pendingForDept.map((p, i) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setFocusConfirmId(p.id)}
                        className={`btn-press focus-ring rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          p.id === askConfirmId
                            ? 'bg-slate-900 text-white'
                            : 'border border-slate-200 bg-white text-slate-600'
                        }`}
                        data-testid="ask-sticky-chip"
                        data-ask-jump={p.id}
                      >
                        {i + 1}. {(p.title || p.summary).slice(0, 14)}
                      </button>
                    ))}
                    <span className="text-[9px] text-slate-400">{pendingForDept.length}</span>
                  </div>
                ) : (
                  <div className="hidden" data-testid="ask-sticky" hidden />
                )}

                {awaitingThis && pendingAskItem ? (
                  <DeptAskReportBubble
                    item={pendingAskItem}
                    leadName={businessSeatLabel(dept.leadSeatId)}
                    leadSeed={dept.leadSeatId}
                    deptSlug={slug || undefined}
                    busy={askBusy}
                    onConfirm={onAskConfirm}
                    onReturn={onAskReturn}
                  />
                ) : awaitingThis ? (
                  <div
                    className="max-w-[95%] rounded-2xl rounded-tl-md bg-violet-50 px-3 py-2 text-[12px] leading-relaxed text-slate-900"
                    role="status"
                    data-testid="dept-ask-bubble-confirm"
                    data-ask-kind="confirm"
                    data-awaiting-banner="1"
                  >
                    <span className="sr-only" data-testid="dept-awaiting-confirm-banner">
                      待你确认
                    </span>
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-violet-700/80">
                      {businessSeatLabel(dept.leadSeatId)} · 汇报
                    </p>
                    <p className="mt-0.5 font-medium">本站已交卷，待你拍板。</p>
                    <p className="mt-0.5 text-[11px] text-slate-600">
                      {AWAITING_ADVANCE_LOCK_HINT}
                    </p>
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
                    <details
                      className="mt-2 rounded-md border border-violet-100 bg-white/70 px-2 py-1.5"
                      data-testid="ask-more"
                      data-ask-kind-g1-t4="1"
                    >
                      <summary className="cursor-pointer select-none text-[10px] font-medium text-slate-500">
                        展开依据链（G1 齐套 · 缺项即缺口）
                      </summary>
                      <ul className="mt-1.5 space-y-1.5 text-[10px] text-slate-600" data-testid="ask-t4-pieces">
                        <li data-testid="ask-t4-conclusion" data-present="1">
                          <span className="font-semibold">结论</span> · 齐套未齐，禁止交卷入「待你确认」。
                        </li>
                        <li data-testid="ask-t4-source" data-present="1">
                          <span className="font-semibold">来源</span> · 本站检查表缺项（演示）。
                        </li>
                        <li
                          data-testid="ask-t4-reasoning"
                          data-present={missingLabels.length ? '1' : '0'}
                        >
                          <span className="font-semibold">推演</span> · 缺「
                          {missingLabels.join('、') || '—'}」则不可装已交卷。
                        </li>
                        <li data-testid="ask-t4-contrast" data-present="1">
                          <span className="font-semibold">对比</span> · 齐套已齐才可进硬请示；缺项≠已确认。
                        </li>
                      </ul>
                      <p className="mt-1 text-[9px] text-slate-400" data-testid="ask-t4-honesty">
                        T4↔G1：软/齐套请示同样挂四件套；不提供一键全绿。
                      </p>
                    </details>
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
              {/* 待确认：主选项在汇报气泡；底栏降为次达，禁黄钮堆叠 */}
              {awaitingThis ? (
                <p
                  className="text-center text-[10px] leading-relaxed text-slate-500"
                  data-testid="dept-primary-cta-demoted"
                >
                  拍板请用上方「要你拍」汇报气泡 · 确认/驳回就地完成
                </p>
              ) : (
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={!canSubmit && cta.action !== 'confirm'}
                  title={
                    cta.action === 'confirm'
                      ? AWAITING_ADVANCE_LOCK_HINT
                      : !canSubmit
                        ? missingLabels.length
                          ? `缺项：${missingLabels.join('、')}`
                          : '齐套要点未齐，暂不可交卷'
                        : undefined
                  }
                  className="btn-press focus-ring inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  data-testid="dept-primary-cta"
                  data-can-submit={canSubmit ? '1' : '0'}
                  data-awaiting-confirm="0"
                >
                  {primaryLabel}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              )}
              {/* 兼容闸：待确认时仍挂可达 testid（气泡链） */}
              {awaitingThis ? (
                <span className="sr-only" data-testid="dept-primary-cta" data-awaiting-confirm="1" data-can-submit="0">
                  {primaryLabel}
                </span>
              ) : null}

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
          className="btn-press focus-ring inline-flex flex-[1.4] items-center justify-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-[11px] font-semibold text-white"
          data-testid="dept-mobile-open-right"
        >
          <MessageSquare className="h-3.5 w-3.5" aria-hidden />
          对话{awaitingThis ? ' · 待拍' : ''}
        </button>
      </div>

      <CaseFileDrawer
        open={caseFileOpen}
        onClose={() => setCaseFileOpen(false)}
        caseId={caseId}
        caseTitle={c.title}
        materials={demoCaseFileMaterials({
          disclosureDone,
          draftStarted: Boolean(prog.doneSeatIds?.includes('expert-draft')),
        })}
        checks={demoCaseFileChecks({ disclosureDone })}
        tickets={demoCaseFileTickets(caseId, { disclosureDone })}
        judgments={getJudgments(caseId)}
        preferences={getPreferences()}
        onSavePreference={savePreferenceById}
        onPrecipitateJudgment={precipitateJudgment}
        lineBadges={demoLineBadges({ disclosureDone })}
        initialTab={
          params.get('fileTab') === '工单'
            ? '工单'
            : params.get('fileTab') === '判断档案'
              ? '判断档案'
              : '材料'
        }
      />
    </div>
  )
}

function VersionDiffPanel({
  current,
  selectedMaterialId,
  versions,
  onApprove,
  onKeep,
}: {
  current: string
  selectedMaterialId: string
  versions: { savedAt: string; markdown: string }[]
  onApprove: (markdown: string) => void
  onKeep: () => void
}) {
  const idx = Number(selectedMaterialId.replace('version-', ''))
  const v = versions[idx]
  const versionText = v?.markdown?.trim() || ''
  const lines = lineDiff(current, versionText)
  const stats = diffStats(lines)
  return (
    <div
      className="mt-3 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5"
      data-testid="dept-version-diff"
    >
      <p className="text-[11px] font-semibold text-slate-800">
        版本对照 · 行级 diff
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
        +{stats.added} / −{stats.removed} · 认可后写回主栏；非专业 diff 引擎，但是真行对照。
      </p>
      <pre
        className="mt-2 max-h-48 overflow-auto rounded-md border border-slate-200 bg-white p-2 font-mono text-[10px] leading-relaxed"
        data-testid="dept-version-diff-body"
      >
        {lines.slice(0, 80).map((l, i) => (
          <div
            key={i}
            className={
              l.type === 'add'
                ? 'bg-emerald-50 text-emerald-900'
                : l.type === 'del'
                  ? 'bg-rose-50 text-rose-900'
                  : 'text-slate-600'
            }
          >
            {l.type === 'add' ? '+' : l.type === 'del' ? '−' : ' '}
            {l.text || ' '}
          </div>
        ))}
        {lines.length > 80 ? (
          <div className="text-slate-400">…共 {lines.length} 行</div>
        ) : null}
      </pre>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-press focus-ring rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white"
          data-testid="dept-version-approve"
          disabled={!versionText}
          onClick={() => {
            if (!versionText) return
            onApprove(versionText)
          }}
        >
          认可此版写回
        </button>
        <button
          type="button"
          className="btn-press focus-ring rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-medium text-slate-700"
          data-testid="dept-version-keep"
          onClick={onKeep}
        >
          保持当前稿
        </button>
      </div>
    </div>
  )
}
