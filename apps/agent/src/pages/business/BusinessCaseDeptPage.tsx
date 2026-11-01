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
  orgDeptByLeadSeat,
  deptSlug,
  MAIN_CHAIN_DEPTS,
  MAIN_CHAIN_DEPT_IDS,
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
  missingChecklistLabels,
} from '../../business/confirmGate'
import {
  confirmKindOf,
  deptStatus,
} from '../../departments/deptProgress'
import { useOrgConfig } from '../../departments/OrgConfigContext'
import type { ProjectExpertId } from '../../projects/types'
import { ArrowRight, Building2, FolderOpen, PanelLeft, PanelRightClose, PanelRightOpen, MessageSquare, X } from 'lucide-react'
import { formatArtifactSavedAt } from '../../business/artifactVersions'
import {
  AUX_BODY_LINK_HONEST,
  findManuscriptPart,
  partMaterialId,
  parsePartMaterialId,
  resolvePartBody,
  seedBodyForPart,
} from '../../business/auxPartBodyLink'
import {
  SIDE_AUX_BODY_HONEST,
  findSideAuxDept,
  findSideAuxPart,
  parseSideAuxMaterialId,
  seedBodyForSideAux,
  sideAuxMaterialId,
} from '../../business/sideAuxBodyLink'
import { KIT_STEP_SYNC_HONEST } from '../../business/kitStepSync'
import { KIT_DIFF_AUTO_HONEST } from '../../business/kitDiffAuto'
import {
  officialDemoKindFromSide,
} from '../../business/officialDemoHonest'
import {
  AUX_VERSION_BIND_HONEST,
  bindSideAuxBodyToRevision,
  buildAuxRevisionStamp,
  materialLabelWithRevision,
  parseVersionMaterialId,
} from '../../business/auxVersionBind'
import { appendArtifactVersion } from '../../business/artifactVersions'
import { getProjectExpert } from '../../projects/experts'
import { SIDE_AUX_DEPTS } from '../../business/professionalAuxParts'
import { auxBundleFor } from '../../business/professionalAuxParts'
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
import { DeptHandoffOfferBubble } from '../../components/business/DeptHandoffOfferBubble'
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
import { ThickStepWorkPanel } from '../../components/business/ThickStepWorkPanel'
import { SoftEmpty } from '../../components/soft/SoftEmpty'
import { BranchFlowPanel } from '../../components/business/BranchFlowPanel'
import { AuxChainBanner } from '../../components/business/AuxChainBanner'
import { ThreeLineStatusStrip } from '../../components/business/ThreeLineStatusStrip'
import { TeachingFadeTip } from '../../components/business/TeachingFadeTip'
import { TrueDiffPanel } from '../../components/business/TrueDiffPanel'
import { OfficialDemoHonestBanner } from '../../components/business/OfficialDemoHonestBanner'
import {
  SEED_DIFF_LEFT,
  SEED_DIFF_RIGHT,
} from '../../business/trueDiffDemo'
import { buildBranchJudgment } from '../../business/judgmentArchive'
import { useEntryRole } from '../../business/useEntryRole'
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
      ? `本站产出：${dual.title}（样机摘要）`
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
    getKitChecklist,
    toggleKitCheck,
    seedKitComplete,
    syncKitFromSeatStep,
    syncKitFromDiff,
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
  /** 已按 ?part= 写入中栏种子的零件 id（防重复刷） */
  const [partInsertedId, setPartInsertedId] = useState<string | null>(null)
  /** 已按 ?side=&sidePart= 写入中栏的辅链挂件 */
  const [sideInsertedId, setSideInsertedId] = useState<string | null>(null)
  /** 浏览另存版本时仍钉住辅链挂件上下文 */
  const [pinnedSide, setPinnedSide] = useState<{
    sideId: string
    partId: string
  } | null>(null)
  /** 编制默认收；工具/巡检点开再看 */
  const [rosterOpen, setRosterOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  /** 窄屏：左目录可收起；右栏改底抽屉（G1 交卷可达） */
  const [leftOpen, setLeftOpen] = useState(false) // §109/§111：材料目录默认 toc/抽屉
  /** §122/§124：本步助手默认关；侧抽屉不拆读、不挡主稿意思 */
  const [stepToolsOpen, setStepToolsOpen] = useState(false)
  const [mobileRightOpen, setMobileRightOpen] = useState(false)
  /** §111：右栏领导对话可折（桌面） */
  const [rightRailOpen, setRightRailOpen] = useState(true)
  /** 演示：强制当前步（不改闸口真值） */
  const [forceStepId, setForceStepId] = useState<string | null>(
    params.get('step') || null,
  )
  /** 案卷抽屉 · 交互大纲 §4.5 */
  const [caseFileOpen, setCaseFileOpen] = useState(
    params.get('docket') === '1' || params.get('file') === '1',
  )
  const [askBusy, setAskBusy] = useState(false)
  /** §128：收口「以后做」后收起本站领进汇报 */
  const [handoffLaterDismissed, setHandoffLaterDismissed] = useState(false)
  useEffect(() => {
    setHandoffLaterDismissed(false)
  }, [caseId, slug])
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
  const partParam = params.get('part')
  const sideParam = params.get('side')
  const sidePartParam = params.get('sidePart')
  useEffect(() => {
    if (!askParam) return
    setSeatOpen(true)
    setMobileRightOpen(true)
  }, [askParam])

  /** ?part= → 中栏聚焦该零件并写入种子正文（样机；空稿或换零件时写） */
  useEffect(() => {
    if (!dept || !partParam) return
    const part = findManuscriptPart(dept.id, partParam)
    if (!part) return
    setSelectedMaterialId(partMaterialId(part.id))
    if (!activeSeat) return
    if (partInsertedId === `${dept.id}:${part.id}`) return
    const existing = getThread(caseId, activeSeat)?.artifactMarkdown?.trim() || ''
    const marker = `本稿零件「${part.label}」`
    if (existing && existing.includes(marker)) {
      setPartInsertedId(`${dept.id}:${part.id}`)
      return
    }
    // 空稿或仍是别的零件种子 → 写入本章种子
    if (
      !existing ||
      existing.includes('本稿零件「') ||
      existing.includes(AUX_BODY_LINK_HONEST)
    ) {
      const body = seedBodyForPart({
        part,
        deptLabel: deptLabel(dept),
      })
      patchThread(caseId, activeSeat, { artifactMarkdown: body })
      setPartInsertedId(`${dept.id}:${part.id}`)
    } else {
      // 已有用户正文：只聚焦材料树，不覆盖
      setPartInsertedId(`${dept.id}:${part.id}:focus-only`)
    }
  }, [
    dept,
    partParam,
    activeSeat,
    caseId,
    partInsertedId,
    getThread,
    patchThread,
    deptLabel,
  ])

  /** ?side=&sidePart= → 中栏聚焦辅链挂件并写入种子（样机；禁真检索/递交） */
  useEffect(() => {
    if (!sideParam || !sidePartParam) return
    const part = findSideAuxPart(sideParam, sidePartParam)
    if (!part) return
    const matId = sideAuxMaterialId(sideParam, sidePartParam)
    // 用户正在看另存修订/差分时，不要被 ?side= 抢回挂件节点
    setSelectedMaterialId((cur) =>
      cur.startsWith('version-') || cur === 'seed-diff' ? cur : matId,
    )
    if (!activeSeat) return
    const key = `${sideParam}:${sidePartParam}`
    if (sideInsertedId === key) return
    const existing = getThread(caseId, activeSeat)?.artifactMarkdown?.trim() || ''
    const marker = `挂件「${part.label}」`
    if (existing && existing.includes(marker)) {
      setSideInsertedId(key)
      return
    }
    if (
      !existing ||
      existing.includes('挂件「') ||
      existing.includes(SIDE_AUX_BODY_HONEST) ||
      existing.includes('本稿零件「') ||
      existing.includes(AUX_BODY_LINK_HONEST)
    ) {
      const body = seedBodyForSideAux({
        sideId: sideParam,
        part,
        sideLabel: findSideAuxDept(sideParam)?.label,
      })
      patchThread(caseId, activeSeat, { artifactMarkdown: body })
      setSideInsertedId(key)
    } else {
      setSideInsertedId(`${key}:focus-only`)
    }
  }, [
    sideParam,
    sidePartParam,
    activeSeat,
    caseId,
    sideInsertedId,
    getThread,
    patchThread,
  ])

  const thread = getThread(caseId, activeSeat)
  const stepIndex = thread?.stepIndex ?? 0

  /** 齐套 ↔ 步进：席步进变化时同步勾选（末项 hold） */
  useEffect(() => {
    if (!activeSeat || !dept) return
    if (orgDeptByLeadSeat(activeSeat)?.id !== dept.id) return
    if (stepIndex <= 0) return
    syncKitFromSeatStep(caseId, activeSeat)
  }, [caseId, activeSeat, dept, stepIndex, syncKitFromSeatStep])

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
  /** 仅本部门待拍才驱动「去确认」——禁案级 OA 等串进他部脚栏 */
  const thisDeptConfirmPending = awaitingThis || pendingForDept.length > 0
  const thisDeptConfirmId =
    askConfirmId && pendingForDept.some((p) => p.id === askConfirmId)
      ? askConfirmId
      : pendingForDept[0]?.id

  const onAskConfirm = async (
    confirmId: string,
    opts?: { reason?: string; riskAccepted?: boolean },
  ) => {
    setAskBusy(true)
    try {
      const synced = await confirmItem(confirmId, opts)
      if (!synced.businessOk) return
      // §128 / §127：确认「可交下一站」后留在本站，抬收口「要不要现在开下一部」；禁止静默跳部
      setHandoffLaterDismissed(false)
      void getConfirm(confirmId)
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

  /** 齐套逐项联办完闸：以 progress.kitDoneByDept 为准（未勾=缺；样机可勾齐） */
  const checklistItems = useMemo(() => {
    if (!slug) return [] as { label: string; done: boolean }[]
    return getKitChecklist(caseId, slug)
  }, [caseId, slug, getKitChecklist, prog.kitDoneByDept])
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
    const versionChildren: MaterialsTreeNode[] = [
      {
        id: 'seed-diff',
        label: '差分示意（样机）',
        kind: 'version' as const,
        hint: '左右对照 · 非真官报',
      },
      ...versions.map((v, i) => ({
        id: `version-${i}`,
        label: `版本 ${i + 1}`,
        kind: 'version' as const,
        hint: formatArtifactSavedAt(new Date(v.savedAt)),
      })),
    ]
    const partChildren: MaterialsTreeNode[] = dept
      ? auxBundleFor(dept.id).parts.map((part) => ({
          id: partMaterialId(part.id),
          label: part.label,
          kind: 'section' as const,
          hint: part.hint,
        }))
      : []
    return [
      {
        id: 'deliverable',
        label: '本站交卷物',
        kind: 'deliverable',
        hint: handoff.deliverable.slice(0, 28) || '权威产出',
      },
      ...(partChildren.length > 0
        ? [
            {
              id: 'manuscript-parts',
              label: '本稿零件',
              kind: 'section' as const,
              hint: '点开写入章节种子',
              defaultCollapsed: true,
              children: partChildren,
            },
          ]
        : []),
      {
        id: 'side-aux',
        label: '辅链挂件',
        kind: 'section' as const,
        hint: '查新·附图·递交',
        defaultCollapsed: true,
        children: SIDE_AUX_DEPTS.flatMap((d) =>
          d.parts.map((part) => {
            const base = `${d.label.replace('（辅链）', '')} · ${part.label}`
            const stamp = buildAuxRevisionStamp({
              stepIndex,
              versionCount: versions.length,
            })
            return {
              id: sideAuxMaterialId(d.id, part.id),
              label: materialLabelWithRevision({ baseLabel: base, stamp }),
              kind: 'section' as const,
              hint: part.hint,
            }
          }),
        ),
      },
      {
        id: 'attachments',
        label: '附件',
        kind: 'attachment',
        hint: '本站附件夹 · 可点开',
      },
      {
        id: 'versions',
        label: '版本',
        kind: 'section',
        hint:
          versions.length > 0
            ? `${versions.length} 个另存 + 示意`
            : '示意可点 · 尚无另存',
        defaultCollapsed: true,
        children: versionChildren,
      },
    ]
  }, [handoff.deliverable, versions, dept, stepIndex])

  const onSubmit = () => {
    if (thisDeptConfirmPending && thisDeptConfirmId && kindForDept) {
      navigate(
        workbenchAskPath(caseId, kindForDept, { confirmId: thisDeptConfirmId }),
      )
      return
    }
    if (thisDeptConfirmPending && thisDeptConfirmId) {
      navigate(pendingAuditPath(thisDeptConfirmId, slug || undefined))
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
            回本案概况
          </Link>
        </div>
      </div>
    )
  }

  const primaryLabel =
    thisDeptConfirmPending
      ? `去确认 · ${pendingAskItem?.title || pendingForDept[0]?.title || '待你确认'}`
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

  /** §128：主链下一部（收口「现在做」目标）；无下一部则不抬领进汇报 */
  const nextStationDept = (() => {
    if (!dept) return null
    const idx = MAIN_CHAIN_DEPTS.findIndex((d) => d.id === dept.id)
    if (idx < 0 || idx >= MAIN_CHAIN_DEPTS.length - 1) return null
    return MAIN_CHAIN_DEPTS[idx + 1]
  })()
  const nextStationHref = nextStationDept
    ? `/agent/cases/${caseId}/depts/${deptSlug(nextStationDept.id)}?ticket=1`
    : null
  const showHandoffOffer =
    Boolean(dept) &&
    Boolean(nextStationDept) &&
    Boolean(nextStationHref) &&
    !awaitingThis &&
    !handoffLaterDismissed &&
    (st === '已完成' || handoffPhase === '已确认可往下')

  /* §128：换站靠收口工单 / 回大厅；左栏不再作八部 peer 切部 */

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

  /** §111/§120：顶栏/中栏标题 = 稿名，禁止席位名（如「撰写代理师」） */
  const manuscriptTitle =
    stepKind === 'd4'
      ? `${c.title} · 交底书`
      : stepKind === 'd5'
        ? `${c.title} · 权利要求与说明书`
        : stepKind === 'd6'
          ? `${c.title} · 答复稿`
          : thinShell
            ? thinMeta?.workTitle || `${c.title} · 作业稿`
            : `${c.title} · 本稿`

  const stepOrdinal =
    currentStep && stepList.length > 0
      ? Math.max(1, stepList.findIndex((s) => s.id === currentStep.id) + 1)
      : 0

  const focusedPart =
    dept && parsePartMaterialId(selectedMaterialId)
      ? findManuscriptPart(dept.id, parsePartMaterialId(selectedMaterialId)!)
      : undefined
  const focusedSideParsed = parseSideAuxMaterialId(selectedMaterialId)
  useEffect(() => {
    if (focusedSideParsed) {
      setPinnedSide(focusedSideParsed)
      return
    }
    if (
      selectedMaterialId === 'deliverable' ||
      selectedMaterialId === 'manuscript-parts' ||
      selectedMaterialId === 'attachments' ||
      !!parsePartMaterialId(selectedMaterialId)
    ) {
      setPinnedSide(null)
    }
  }, [focusedSideParsed, selectedMaterialId])

  const urlSide =
    sideParam && sidePartParam
      ? { sideId: sideParam, partId: sidePartParam }
      : null
  const activeSide = focusedSideParsed ?? pinnedSide ?? urlSide
  const focusedSidePart = activeSide
    ? findSideAuxPart(activeSide.sideId, activeSide.partId)
    : undefined
  const focusedSideLabel = activeSide
    ? findSideAuxDept(activeSide.sideId)?.label
    : undefined
  const focusedSideParsedActive = activeSide

  const seatDef = activeSeat ? getProjectExpert(activeSeat) : null
  const stepLabelNow = seatDef?.steps[stepIndex]?.label
  const viewingVersionIdx = parseVersionMaterialId(selectedMaterialId)
  const viewingVersion =
    viewingVersionIdx !== null ? versions[viewingVersionIdx] : undefined
  const auxRevStamp = buildAuxRevisionStamp({
    stepIndex,
    stepLabel: stepLabelNow,
    versionCount: versions.length,
    viewingVersionIndex: viewingVersionIdx,
    seedDiff: selectedMaterialId === 'seed-diff',
    versionSavedAt: viewingVersion?.savedAt,
  })

  const centerTitle =
    selectedMaterialId === 'attachments'
      ? '附件'
      : selectedMaterialId === 'seed-diff'
        ? focusedSidePart
          ? `辅链差分 · ${focusedSidePart.label}`
          : '差分示意'
        : selectedMaterialId.startsWith('version-')
          ? focusedSidePart
            ? `辅链 · ${focusedSidePart.label} · 对照修订版 ${(viewingVersionIdx ?? 0) + 1}`
            : '版本正文'
          : selectedMaterialId === 'versions'
            ? '版本'
            : selectedMaterialId === 'manuscript-parts'
              ? '本稿零件'
              : selectedMaterialId === 'side-aux'
                ? '辅链挂件'
                : focusedSidePart
                  ? `辅链 · ${focusedSidePart.label}`
                  : focusedPart
                    ? `本稿 · ${focusedPart.label}`
                    : '产出正文'

  const centerBody = (() => {
    if (selectedMaterialId === 'attachments') {
      return '本站附件为样机占位。正式上传与格式检查后置，不在此装完成。'
    }
    if (selectedMaterialId === 'seed-diff' && !focusedSidePart) {
      return '下方为 seed 左右差分示意（非真官报）。点「左右对照 / 统一差分」切换视图。'
    }
    if (selectedMaterialId === 'versions') {
      return versions.length === 0
        ? '尚无另存版本。可先点「差分示意（样机）」看左右对照；或在右栏专家岗「成果」里另存。'
        : '在左侧点某一版本查看正文与差分；或点「差分示意（样机）」。'
    }
    if (selectedMaterialId.startsWith('version-') && !focusedSidePart) {
      const idx = Number(selectedMaterialId.replace('version-', ''))
      const v = versions[idx]
      return v?.markdown?.trim() || '该版本无正文。'
    }
    if (selectedMaterialId === 'manuscript-parts') {
      return '左侧点某一本稿零件，中栏打开该章种子正文；可写入本席成果改稿。'
    }
    if (selectedMaterialId === 'side-aux') {
      return '左侧点查新·附图·递交挂件，中栏打开种子说明；修订号随席步进/另存版本更新（样机）。'
    }
    if (focusedSideParsedActive && focusedSidePart) {
      const baseSeed = seedBodyForSideAux({
        sideId: focusedSideParsedActive.sideId,
        part: focusedSidePart,
        sideLabel: focusedSideLabel,
      })
      if (viewingVersionIdx !== null && viewingVersion) {
        const fromVer = viewingVersion.markdown?.trim() || baseSeed
        const withMarker = fromVer.includes(`挂件「${focusedSidePart.label}」`)
          ? fromVer
          : `${fromVer}

— 挂件「${focusedSidePart.label}」`
        return bindSideAuxBodyToRevision({
          body: withMarker,
          stamp: auxRevStamp,
          partLabel: focusedSidePart.label,
        })
      }
      if (selectedMaterialId === 'seed-diff') {
        return bindSideAuxBodyToRevision({
          body: baseSeed,
          stamp: auxRevStamp,
          partLabel: focusedSidePart.label,
        })
      }
      const cur = thread?.artifactMarkdown?.trim() || ''
      const raw =
        cur && cur.includes(`挂件「${focusedSidePart.label}」`)
          ? cur
          : baseSeed
      return bindSideAuxBodyToRevision({
        body: raw,
        stamp: auxRevStamp,
        partLabel: focusedSidePart.label,
      })
    }
    if (dept && parsePartMaterialId(selectedMaterialId)) {
      const resolved = resolvePartBody({
        deptId: dept.id,
        materialId: selectedMaterialId,
        deptLabel: deptLabel(dept),
      })
      if (resolved) {
        // 若本席成果已是该零件种子或用户改稿，优先显示成果
        const cur = thread?.artifactMarkdown?.trim() || ''
        if (cur && cur.includes(`本稿零件「${resolved.part.label}」`)) {
          return cur
        }
        return resolved.body
      }
    }
    return artifactBody || handoff.deliverable || '暂无产出正文。点右侧专家岗起草后，正文会出现在此。'
  })()

  // 齐套 ↔ 正文 / 差分 / 材料树自动勾（样机；空稿收束；hold 须内容 warrant）
  useEffect(() => {
    if (!dept || !slug) return
    syncKitFromDiff(caseId, slug, {
      materialId: selectedMaterialId,
      bodyText: centerBody,
    })
  }, [
    caseId,
    slug,
    dept,
    selectedMaterialId,
    centerBody,
    syncKitFromDiff,
  ])


  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50"
      data-testid="business-case-dept-page"
      data-case-id={caseId}
      data-dept-id={dept.id}
      data-seat-open={seatOpen ? '1' : '0'}
      data-layout="cursor-three-pane"
      data-left-open={leftOpen ? '1' : '0'}
      data-step-tools-open={stepToolsOpen ? '1' : '0'}
      data-approach="A"
      data-wb-zones="v130"
      data-handoff-offer={showHandoffOffer ? '1' : '0'}
      data-handoff-later={handoffLaterDismissed ? '1' : '0'}
      data-mobile-right-open={mobileRightOpen ? '1' : '0'}
      data-step-kind={stepKind ?? 'thin'}
      data-step-id={currentStep?.id ?? ''}
      data-ask={askParam ?? ''}
      data-part={partParam ?? ''}
      data-part-inserted={partInsertedId ? '1' : '0'}
      data-side={sideParam ?? ''}
      data-side-part={sidePartParam ?? ''}
      data-side-inserted={sideInsertedId ? '1' : '0'}
      data-aux-rev={focusedSidePart ? auxRevStamp.revCode : ''}
      data-aux-rev-step={String(stepIndex)}
      data-aux-rev-versions={String(versions.length)}
    >
      {/* §111：顶栏 = 稿名作业台；质检线/工单不进阅读心智 */}
      <div
        className="shrink-0 border-b border-slate-200 bg-white px-4 py-2.5 lg:px-6"
        data-testid="dept-manuscript-chrome"
        data-approach="A"
      >
        <div className="mb-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <Link to={companyHref} className="focus-ring rounded-sm hover:underline">
            {c.title}
          </Link>
          <span>/</span>
          <span className="text-slate-500">{deptLabel(dept)}</span>
        </div>
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1
              className="truncate text-[17px] font-semibold text-slate-900"
              data-testid="dept-manuscript-title"
            >
              {manuscriptTitle}
            </h1>
            <p className="sr-only" data-testid="dept-qualify-line">
              质检线：{qualifyLine}
              {awaitingThis
                ? ' · 已交卷，待你拍板'
                : !allChecklistDone
                  ? ' · 交卷前还须齐套'
                  : st === '已完成'
                    ? ' · 本站已确认可往下'
                    : st
                      ? ` · ${st}`
                      : ''}
              {currentStep ? ` · 本步 ${currentStep.label}` : thinShell ? ' · 薄部同壳' : ''}
            </p>
            {currentStep && stepList.length > 0 ? (
              <div className="mt-1" data-testid="dept-process-teach">
                <p
                  className="text-[11px] tabular-nums text-slate-500"
                  data-testid="dept-process-topstrip"
                  data-process-density="thin-top"
                >
                  主稿阶段 · {stepOrdinal}/{stepList.length} · {currentStep.label}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400" data-testid="dept-main-doc-hint">
                  一部多步 · 产出仍是这份主稿
                </p>
              </div>
            ) : thinShell ? (
              <p
                className="mt-1 text-[11px] text-slate-500"
                data-testid="dept-process-topstrip"
                data-process-density="thin-top"
              >
                薄部同壳作业
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setLeftOpen((v) => !v)}
              className="btn-press focus-ring inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
              data-testid="dept-materials-toc-toggle"
              aria-pressed={leftOpen}
              aria-controls="dept-left-tree"
            >
              <PanelLeft className="h-3.5 w-3.5" aria-hidden />
              {leftOpen ? '收起目录' : '目录'}
            </button>
            <button
              type="button"
              onClick={() => setCaseFileOpen(true)}
              className="btn-press focus-ring inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
              data-testid="dept-open-case-file"
            >
              <FolderOpen className="h-3.5 w-3.5" aria-hidden />
              案卷
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
                  setRightRailOpen((v) => !v)
                } else {
                  setMobileRightOpen(true)
                }
              }}
              className="btn-press focus-ring inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
              data-testid="dept-right-rail-toggle"
              aria-pressed={rightRailOpen}
              aria-label={rightRailOpen ? '收起对话' : '展开对话'}
            >
              {rightRailOpen ? (
                <PanelRightClose className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <PanelRightOpen className="h-3.5 w-3.5" aria-hidden />
              )}
              对话
            </button>
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
              自带交底缺口：交底未全绿 / 无交底→申请工单 · 请回交底部补料或走工单，禁止未全绿硬写。
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
                回本案概况
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
        {/* 左·材料目录 · §109 默认收折；展开为 toc 抽屉，非常驻宽柱 */}
        <aside
          className={`${
            leftOpen ? 'flex' : 'hidden'
          } max-h-48 shrink-0 flex-col border-b border-slate-200 bg-white lg:max-h-none lg:w-44 lg:border-b-0 lg:border-r`}
          id="dept-left-tree"
          data-testid="dept-left-tree"
          data-slot="materials-tree"
          data-collapsed={leftOpen ? '0' : '1'}
          data-materials-mode={leftOpen ? 'drawer' : 'toc-folded'}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-2 py-1.5">
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
          <DeptMaterialsTree nodes={materialNodes}
            selectedId={selectedMaterialId}
            onSelect={(id) => {
              setSelectedMaterialId(id)
              // 点选后保持抽屉开以便连点；中栏已切产物
            }}
          />
        </aside>

        {/* 中·产出物工作区：不放交卷 / 确认主按钮 */}
        <main
          className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-4 lg:px-5"
          data-testid="dept-center-output"
          data-slot="output-body"
        >
          <section
            className="mx-auto flex w-full max-w-4xl flex-col gap-2"
            data-testid="dept-deliverable"
            aria-labelledby="dept-output-title"
          >
            {/* §120：流程细条在顶栏 dept-process-topstrip；阅读区不重复 */}
            <div className="sr-only" data-testid="dept-meta-fold" data-meta-default="off-reading">
              <TeachingFadeTip deptId={dept.id} />
              {!MAIN_CHAIN_DEPT_IDS.includes(dept.id) ? (
                <AuxChainBanner deptLabel={deptLabel(dept)} />
              ) : (
                <ThreeLineStatusStrip prog={getProgress(caseId)} dense foldByDefault />
              )}
              <BranchFlowPanel
                branch={params.get('branch')}
                caseId={caseId}
                deptSlug={slug || deptSlug(dept.id)}
                onRecordJudgment={(j) => recordJudgment(j)}
              />
            </div>

            {stepKind && currentStep && selectedMaterialId === 'deliverable' ? (
              <div
                className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5"
                data-wb-density="v3-manuscript"
                data-mid-primary="manuscript"
                data-approach="A"
              >
                <h2
                  id="dept-output-title"
                  className="text-[15px] font-semibold tracking-tight text-slate-900"
                >
                  {manuscriptTitle}
                </h2>
                <p className="sr-only" data-testid="dept-step-caption">
                  {currentStep.mainFocus}
                </p>
                {/* §111：全页纸感正文；本步/控件不进首屏阅读 */}
                <article
                  className="mt-4 rounded-lg border border-slate-200/70 bg-[#fbfaf7] px-5 py-6 shadow-sm"
                  data-testid="dept-manuscript-paper"
                  data-doc-feel="1"
                >
                  <pre
                    className="max-h-[min(78vh,48rem)] overflow-auto text-[13.5px] leading-[1.75] text-slate-800 whitespace-pre-wrap font-sans"
                    data-testid="dept-output-body"
                    data-empty={centerBody.trim() ? '0' : '1'}
                  >
                    {centerBody.trim() ||
                      currentStep.mainBody ||
                      '暂无产出正文。点右侧专家岗起草后，正文会出现在此。'}
                  </pre>
                </article>
                {/* §124 G01：本步助手芯片；侧抽屉不拆稿 */}
                <div
                  className="mt-3"
                  data-testid="dept-step-demo"
                  data-step-dense={stepToolsOpen ? 'drawer' : 'folded'}
                  data-open={stepToolsOpen ? '1' : '0'}
                  data-fold-not-split="1"
                >
                  <button
                    type="button"
                    onClick={() => setStepToolsOpen(true)}
                    className="btn-press focus-ring hit-40 inline-flex min-h-[2.5rem] items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                    data-testid="dept-step-demo-open"
                    aria-expanded={stepToolsOpen}
                    title="办好本步用的助手 · 主稿仍是上方这份"
                  >
                    本步助手 · {currentStep.label}
                    <span className="ml-1.5 text-[10px] font-normal text-slate-400">
                      不改主稿位置
                    </span>
                  </button>
                </div>
                {stepToolsOpen ? (
                  <div
                    className="fixed inset-0 z-50 flex items-end justify-end sm:items-stretch"
                    data-testid="dept-step-tools-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-label="本步助手"
                    data-drawer-side="end"
                  >
                    <button
                      type="button"
                      className="absolute inset-0 bg-slate-900/15"
                      aria-label="关闭本步助手"
                      data-testid="dept-step-tools-backdrop"
                      onClick={() => setStepToolsOpen(false)}
                    />
                    <div
                      className="relative z-10 flex h-[min(88vh,100%)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-xl sm:h-full sm:max-h-none sm:rounded-none sm:rounded-l-2xl sm:border-l"
                      data-testid="dept-step-tools-drawer"
                      data-step-dense="drawer"
                      data-keep-paper="1"
                    >
                      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-slate-800">
                            本步助手 · {currentStep.label}
                          </p>
                          <p className="text-[10px] font-normal text-slate-400">
                            服务本步 · 产出仍是上方主稿
                          </p>
                        </div>
                        <button
                          type="button"
                          className="btn-press focus-ring rounded-md border border-slate-200 px-2 py-1 text-[10px] text-slate-600"
                          data-testid="dept-step-tools-close"
                          onClick={() => setStepToolsOpen(false)}
                        >
                          收起
                        </button>
                      </div>
                      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setForceStepId(currentStep.id)}
                            className="btn-press focus-ring rounded-full border border-slate-900 bg-slate-900 px-2.5 py-0.5 text-[10px] font-medium text-white"
                            data-testid={`dept-step-${currentStep.id}`}
                            data-step-current="1"
                          >
                            {currentStep.label}
                          </button>
                          <details className="relative" data-testid="dept-step-more">
                            <summary className="btn-press focus-ring cursor-pointer list-none rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-500 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                              换步 · {stepList.length}
                            </summary>
                            <div className="absolute left-0 z-10 mt-1 flex min-w-[10rem] flex-col gap-1 rounded-lg border border-slate-200 bg-white p-1.5 shadow-md">
                              {stepList
                                .filter((s) => s.id !== currentStep.id)
                                .map((s) => (
                                  <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setForceStepId(s.id)}
                                    className="btn-press focus-ring rounded-md px-2 py-1 text-left text-[10px] text-slate-700 hover:bg-slate-50"
                                    data-testid={`dept-step-${s.id}`}
                                    data-step-menu="1"
                                  >
                                    {s.label}
                                  </button>
                                ))}
                              <button
                                type="button"
                                onClick={() => setForceStepId(null)}
                                className="btn-press focus-ring rounded-md border border-dashed border-slate-200 px-2 py-1 text-left text-[10px] text-slate-500"
                                data-testid="dept-step-auto"
                              >
                                跟随当前齐套
                              </button>
                            </div>
                          </details>
                        </div>
                        <ThickStepWorkPanel
                          kind={stepKind}
                          step={currentStep}
                          caseId={caseId}
                          embedMode="widgets-only"
                          onRecordNote={(note) => {
                            if (note.includes('不申')) {
                              recordJudgment(
                                buildBranchJudgment({
                                  caseId,
                                  gate: '申不申',
                                  conclusion: '不申（主栏示意）',
                                  option: '不申结案',
                                  reason: '厚步 B 点选 · 正式拍板在右栏',
                                  compare: '不申却出申请号 = 禁止',
                                }),
                              )
                            }
                          }}
                        />
                        {showDraftInherit ? (
                          <div
                            className="mt-2 rounded-lg border border-violet-200/80 bg-violet-50/70 px-3 py-2 text-[11px] leading-relaxed text-slate-800"
                            data-testid="dept-draft-inherit-handoff"
                            data-fold-slot="step-tools"
                            role="status"
                          >
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-700/80">
                              接交底工单
                            </p>
                            <p className="mt-0.5 font-medium">{draftInheritedHandoffLine()}</p>
                          </div>
                        ) : null}
                        {/* §122/§124：齐套勾选在本步助手；右栏不设缺项墙 */}
                        {!allChecklistDone ? (
                          <div
                            className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2"
                            data-testid="dept-kit-in-tools"
                          >
                            <p className="text-[11px] font-semibold text-slate-800">
                              本步还差 {missingLabels.length} 项
                            </p>
                            <p className="mt-0.5 text-[10px] text-slate-500">
                              在助手里勾选 · 主稿仍在背后纸面
                            </p>
                            <ul
                              className="mt-1.5 space-y-1 text-[11px] text-slate-700"
                              data-testid="dept-checklist-items"
                              data-kit-interactive="1"
                            >
                              {checklistItems.map((x) => (
                                <li key={x.label} className="flex items-start gap-2">
                                  <label className="flex cursor-pointer items-start gap-1.5">
                                    <input
                                      type="checkbox"
                                      className="mt-0.5"
                                      checked={x.done}
                                      data-testid={`dept-kit-check-${x.label}`}
                                      onChange={() => {
                                        if (slug) toggleKitCheck(caseId, slug, x.label)
                                      }}
                                    />
                                    <span className={x.done ? 'line-through text-slate-500' : ''}>
                                      {x.label}
                                    </span>
                                  </label>
                                </li>
                              ))}
                            </ul>
                            <div
                              className="mt-2 flex flex-wrap items-center gap-1.5"
                              data-testid="dept-kit-tool-row"
                            >
                              <button
                                type="button"
                                className="btn-press focus-ring rounded-full border border-dashed border-violet-600/40 bg-white/80 px-2.5 py-1 text-[10px] font-medium text-violet-950/80 hover:bg-white"
                                data-testid="dept-seed-kit"
                                title="演示：勾齐本稿齐套 · 非一键交卷 · 非官报"
                                onClick={() => {
                                  if (slug) seedKitComplete(caseId, slug)
                                }}
                              >
                                演示勾齐
                              </button>
                              <button
                                type="button"
                                className="btn-press focus-ring rounded-full border border-dashed border-sky-500/40 bg-white/80 px-2.5 py-1 text-[10px] font-medium text-sky-950/80 hover:bg-white"
                                data-testid="dept-sync-kit-from-diff"
                                title={KIT_DIFF_AUTO_HONEST}
                                onClick={() => {
                                  if (slug)
                                    syncKitFromDiff(caseId, slug, {
                                      materialId: selectedMaterialId,
                                      bodyText: centerBody,
                                    })
                                }}
                              >
                                按正文勾
                              </button>
                              <button
                                type="button"
                                className="btn-press focus-ring rounded-full border border-dashed border-slate-400/50 bg-white/80 px-2.5 py-1 text-[10px] font-medium text-slate-700 hover:bg-white"
                                data-testid="dept-sync-kit-from-step"
                                title={KIT_STEP_SYNC_HONEST}
                                onClick={() => {
                                  if (activeSeat) syncKitFromSeatStep(caseId, activeSeat)
                                }}
                              >
                                按进度勾选
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-3 text-[11px] text-emerald-700" data-testid="dept-kit-in-tools">
                            齐套已齐
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
                {askParam ? (
                  <p
                    className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-950"
                    data-testid="dept-ask-banner"
                  >
                    请看右栏对话。
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
                {/* 合格线/边界改由 ThinDeptWorkPanel 单点展示，避免中栏双份 */}
                <p className="sr-only" data-testid="dept-qualify-line-body">
                  合格线：{thinMeta?.line ?? qualifyLine}
                </p>
                <ThinDeptWorkPanel
                  deptId={dept.id}
                  caseId={caseId}
                  onRecordNote={(note) => {
                    if (params.get('branch') === 'b7' && note.includes('只读不拍')) {
                      recordJudgment(
                        buildBranchJudgment({
                          caseId,
                          gate: '只读不拍',
                          conclusion: '本轮只读不拍',
                          option: '只读不拍',
                          reason: '不回写维护部维持/放弃台账',
                          compare: '未拍却改台账 = 禁止',
                        }),
                      )
                    }
                  }}
                />
                <p className="mt-3 text-[11px] text-slate-500">
                  示意作业 · 非真挂接。
                </p>
                {askParam ? (
                  <p
                    className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-950"
                    data-testid="dept-ask-banner"
                  >
                    请看右栏对话。
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
                {selectedMaterialId === 'attachments' ? (
                <div className="mt-3" data-testid="dept-attachments-empty-wrap">
                  <SoftEmpty
                    kind="wb-attachments"
                    testId="dept-attachments-empty"
                    density="block"
                    className="bg-white"
                  />
                  <p className="sr-only" data-testid="dept-output-body" data-empty="1">
                    {centerBody}
                  </p>
                </div>
              ) : selectedMaterialId === 'versions' && versions.length === 0 ? (
                <div className="mt-3">
                  <SoftEmpty
                    kind="wb-versions"
                    testId="dept-versions-empty"
                    density="block"
                    className="bg-white"
                  />
                  <p className="sr-only" data-testid="dept-output-body" data-empty="1">
                    {centerBody}
                  </p>
                </div>
              ) : !centerBody.trim() ? (
                <div className="mt-3">
                  <SoftEmpty
                    kind="wb-body"
                    testId="dept-body-empty"
                    density="block"
                    className="bg-white"
                  />
                  <p className="sr-only" data-testid="dept-output-body" data-empty="1" />
                </div>
              ) : (
                <pre
                  className="mt-3 max-h-[min(70vh,36rem)] overflow-auto rounded-lg border border-slate-100 bg-slate-50/80 p-3.5 text-[12px] leading-relaxed text-slate-700 whitespace-pre-wrap"
                  data-testid="dept-output-body"
                  data-part-id={
                    parsePartMaterialId(selectedMaterialId) ?? undefined
                  }
                  data-side-id={focusedSideParsedActive?.sideId}
                  data-side-part-id={focusedSideParsedActive?.partId}
                  data-aux-rev={focusedSidePart ? auxRevStamp.revCode : undefined}
                  data-empty="0"
                >
                  {centerBody}
                </pre>
              )}
                {focusedPart ? (
                  <div
                    className="mt-2 flex flex-wrap items-center gap-2"
                    data-testid="dept-part-body-actions"
                  >
                    <button
                      type="button"
                      className="btn-press focus-ring rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white"
                      data-testid="dept-part-insert-body"
                      onClick={() => {
                        if (!activeSeat || !dept) return
                        const body = seedBodyForPart({
                          part: focusedPart,
                          deptLabel: deptLabel(dept),
                        })
                        patchThread(caseId, activeSeat, {
                          artifactMarkdown: body,
                        })
                        setPartInsertedId(`${dept.id}:${focusedPart.id}`)
                        setSelectedMaterialId(partMaterialId(focusedPart.id))
                      }}
                    >
                      写入本稿（种子）
                    </button>
                    <span className="text-[10px] text-slate-500">
                      {AUX_BODY_LINK_HONEST}
                    </span>
                  </div>
                ) : null}
                {focusedSidePart && focusedSideParsedActive ? (
                  <OfficialDemoHonestBanner
                    kind={officialDemoKindFromSide(
                      focusedSideParsedActive.sideId,
                    )}
                    className="mt-2"
                    ctaGuard={focusedSideParsedActive.sideId === 'file'}
                  />
                ) : null}
                {focusedSidePart && focusedSideParsedActive ? (
                  <div
                    className="mt-2 flex flex-wrap items-center gap-2"
                    data-testid="dept-side-aux-body-actions"
                  >
                    <span
                      className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-950 ring-1 ring-violet-200/80"
                      data-testid="dept-side-aux-rev-badge"
                      title={AUX_VERSION_BIND_HONEST}
                      data-rev={auxRevStamp.revCode}
                    >
                      {auxRevStamp.badge}
                    </span>
                    <button
                      type="button"
                      className="btn-press focus-ring rounded-full bg-violet-900 px-2.5 py-1 text-[11px] font-semibold text-white"
                      data-testid="dept-side-aux-insert-body"
                      onClick={() => {
                        if (!activeSeat || !focusedSideParsedActive) return
                        const body = bindSideAuxBodyToRevision({
                          body: seedBodyForSideAux({
                            sideId: focusedSideParsedActive.sideId,
                            part: focusedSidePart,
                            sideLabel: focusedSideLabel,
                          }),
                          stamp: auxRevStamp,
                          partLabel: focusedSidePart.label,
                        })
                        patchThread(caseId, activeSeat, {
                          artifactMarkdown: body,
                        })
                        setSideInsertedId(
                          `${focusedSideParsedActive.sideId}:${focusedSideParsedActive.partId}`,
                        )
                        setPinnedSide(focusedSideParsedActive)
                        setSelectedMaterialId(
                          sideAuxMaterialId(
                            focusedSideParsedActive.sideId,
                            focusedSideParsedActive.partId,
                          ),
                        )
                      }}
                    >
                      写入挂件（种子）
                    </button>
                    <button
                      type="button"
                      className="btn-press focus-ring rounded-full border border-violet-300 bg-white px-2.5 py-1 text-[11px] font-medium text-violet-950"
                      data-testid="dept-side-aux-save-version"
                      title="另存为成果修订版 · 样机示意 · 非官报"
                      onClick={() => {
                        if (!activeSeat || !focusedSideParsedActive) return
                        const body = bindSideAuxBodyToRevision({
                          body: seedBodyForSideAux({
                            sideId: focusedSideParsedActive.sideId,
                            part: focusedSidePart,
                            sideLabel: focusedSideLabel,
                          }),
                          stamp: auxRevStamp,
                          partLabel: focusedSidePart.label,
                        })
                        const cur = getThread(caseId, activeSeat)
                        const { versions: next, hint } = appendArtifactVersion({
                          versions: cur?.artifactVersions ?? [],
                          markdown: body,
                        })
                        patchThread(caseId, activeSeat, {
                          artifactMarkdown: body,
                          artifactVersions: next,
                        })
                        setSideInsertedId(
                          `${focusedSideParsedActive.sideId}:${focusedSideParsedActive.partId}`,
                        )
                        setPinnedSide(focusedSideParsedActive)
                        // 选中刚另存的修订版，中栏挂件徽章切到「对照修订版」
                        setSelectedMaterialId(`version-${next.length - 1}`)
                        void hint
                      }}
                    >
                      另存为修订版
                    </button>
                    <span className="text-[10px] text-slate-500">
                      {AUX_VERSION_BIND_HONEST}
                    </span>
                  </div>
                ) : null}
                {selectedMaterialId === 'seed-diff' ? (
                  <>
                    <OfficialDemoHonestBanner kind="diff" className="mt-2" />
                    <TrueDiffPanel
                      left={SEED_DIFF_LEFT}
                      right={SEED_DIFF_RIGHT}
                      leftTitle="当前稿（seed）"
                      rightTitle="对照版（seed）"
                      seedMode
                    />
                  </>
                ) : null}
                {selectedMaterialId.startsWith('version-') ? (
                  <TrueDiffPanel
                    left={
                      thread?.artifactMarkdown?.trim() ||
                      deliverableSummary ||
                      handoff.deliverable
                    }
                    right={(() => {
                      const idx = Number(
                        selectedMaterialId.replace('version-', ''),
                      )
                      return versions[idx]?.markdown?.trim() || ''
                    })()}
                    leftTitle="当前稿"
                    rightTitle="选中版本"
                    onApprove={() => {
                      if (!activeSeat) return
                      const idx = Number(
                        selectedMaterialId.replace('version-', ''),
                      )
                      const markdown = versions[idx]?.markdown?.trim()
                      if (!markdown) return
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
                aria-label="不申结案"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-800/80">
                  支路 · 不申结案
                </p>
                <p className="mt-0.5 font-medium">
                  本步拍「不申」：结案/转秘密 · <strong>不</strong>出申请号 · 可不进 C
                </p>
                <div
                  className="mt-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-[11px]"
                  data-testid="branch-b5-no-appno"
                >
                  <p className="font-semibold text-rose-900">结案证明（演示）</p>
                  <p className="mt-0.5 text-slate-700">申请号：<span className="font-mono text-slate-400">—（不出）</span></p>
                  <p className="text-slate-700">局端递交：未发起 · 禁假装已递交</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-press focus-ring rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white"
                    data-testid="branch-b5-no-apply"
                    onClick={() => {
                      recordJudgment(
                        buildBranchJudgment({
                          caseId,
                          gate: '申不申',
                          conclusion: '不申',
                          option: '不申结案',
                          reason: '不出申请号',
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


            {showDraftInherit && !(stepKind && currentStep && selectedMaterialId === 'deliverable') ? (
              <details
                className="rounded-lg border border-dashed border-violet-200 bg-violet-50/50 px-2.5 py-1.5"
                data-testid="dept-draft-inherit-fold"
              >
                <summary className="cursor-pointer select-none text-[10px] font-medium text-violet-800/80">
                  接交底工单
                </summary>
                <div
                  className="mt-2 text-[11px] text-slate-800"
                  data-testid="dept-draft-inherit-handoff"
                >
                  <p className="font-medium">{draftInheritedHandoffLine()}</p>
                </div>
              </details>
            ) : null}

            {showHandoffTicket ? (
              <div
                className={
                  params.get('ticket') === '1'
                    ? ''
                    : 'sr-only'
                }
                data-testid="dept-handoff-ticket-details"
                data-ticket-in-reading={
                  params.get('ticket') === '1' ? '1' : '0'
                }
                data-handoff-double-teach={showHandoffOffer ? '0' : undefined}
              >
                {params.get('ticket') === '1' ? (
                  <details
                    className="rounded-lg border border-emerald-200/80 bg-emerald-50/30 px-2.5 py-2"
                    data-testid="dept-handoff-ticket-fold"
                    open
                  >
                    <summary className="cursor-pointer select-none text-[11px] font-medium text-emerald-900">
                      部间工单记录
                    </summary>
                    <div className="mt-2">
                      <DeptHandoffTicket
                        caseId={caseId}
                        ticket={interTicket}
                        side={isDraftDept(dept.id) ? 'to' : 'from'}
                      />
                    </div>
                  </details>
                ) : (
                  <DeptHandoffTicket
                    caseId={caseId}
                    ticket={interTicket}
                    side={isDraftDept(dept.id) ? 'to' : 'from'}
                  />
                )}
              </div>
            ) : null}

            <p className="sr-only" data-testid="dept-demo-footer">
              示意稿件面 · 非真递交
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
          } min-h-0 w-full shrink-0 flex-col border-t border-slate-200 bg-white ${
            rightRailOpen
              ? 'lg:static lg:z-auto lg:flex lg:max-h-none lg:w-[21.25rem] lg:border-l lg:border-t-0 lg:shadow-none xl:w-[21.25rem]'
              : 'lg:hidden'
          }`}
          data-testid="dept-right-rail"
          data-slot="dialogue-confirm"
          data-mobile-drawer={mobileRightOpen ? '1' : '0'}
          data-rail-model="leader-chat"
          data-rail-collapsed={rightRailOpen ? '0' : '1'}
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
                    <span className="sr-only" data-testid="agent-style-tag">
                      手法 · {styleTagForDept(dept.id).label}
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
                <ul className="flex flex-nowrap gap-2 overflow-x-auto pb-0.5" data-testid="dept-right-roster-row">
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
                          {adopted ? '已选' : '选用'}
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
                <p
                  className="mt-1 text-[10px] text-slate-500"
                  data-testid="agent-style-tag-roster"
                  title={styleTagForDept(dept.id).line}
                >
                  手法 · {styleTagForDept(dept.id).label}
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
                    className="ask-sticky-rail sticky top-0 z-[5] flex flex-wrap items-center gap-1.5 rounded-[10px] border border-amber-200/90 bg-gradient-to-b from-amber-50 to-white px-2.5 py-1.5 shadow-sm"
                    data-testid="ask-sticky"
                  >
                    <span className="text-[9px] font-extrabold uppercase tracking-wide text-amber-800">
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

                {showHandoffOffer && dept && nextStationDept && nextStationHref ? (
                  <DeptHandoffOfferBubble
                    fromLabel={deptLabel(dept)}
                    toLabel={deptLabel(nextStationDept)}
                    nowHref={nextStationHref}
                    leadName={businessSeatLabel(dept.leadSeatId)}
                    qualifyLine={qualifyLine}
                    onLater={() => setHandoffLaterDismissed(true)}
                  />
                ) : handoffLaterDismissed &&
                  dept &&
                  (st === '已完成' || handoffPhase === '已确认可往下') &&
                  nextStationDept ? (
                  <div
                    className="max-w-[95%] rounded-2xl rounded-tl-md border border-slate-200/70 bg-slate-50 px-3 py-2 text-[12px] leading-relaxed text-slate-700"
                    role="status"
                    data-testid="dept-handoff-later-note"
                    data-station-quiet="1"
                  >
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                      {businessSeatLabel(dept.leadSeatId)} · 本站办完
                    </p>
                    <p className="mt-0.5 font-medium">已记以后做</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      要开{deptLabel(nextStationDept)}时，回大厅选站即可
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

                {/* §130 G01/G03：收口/以后做时齐套≠汇报，静默；有硬请示时亦静默 */}
                {!allChecklistDone && (showHandoffOffer || handoffLaterDismissed) ? (
                  <div
                    className="sr-only"
                    data-testid="dept-ask-bubble-g1"
                    data-ask-kind="g1"
                    data-kit-compact="1"
                    data-kit-folded="1"
                    data-kit-wall="0"
                    data-kit-priority="silent"
                    data-kit-suppressed-handoff="1"
                  >
                    <span data-testid="dept-checklist-missing" data-missing-count={missingLabels.length}>
                      齐套另记 · 收口态静默
                    </span>
                    <div data-testid="dept-checklist" aria-hidden>
                      齐套缺项 · 收口态不占第一眼
                    </div>
                  </div>
                ) : !allChecklistDone && awaitingThis ? (
                  <p
                    className="px-0.5 text-[10px] leading-snug text-slate-400"
                    data-testid="dept-ask-bubble-g1"
                    data-ask-kind="g1"
                    data-kit-compact="1"
                    data-kit-folded="1"
                    data-kit-wall="0"
                    data-kit-priority="silent"
                  >
                    <span data-testid="dept-checklist-missing" data-missing-count={missingLabels.length}>
                      齐套另记 · 还差 {missingLabels.length} 项
                    </span>
                    <button
                      type="button"
                      className="btn-press focus-ring ml-1 text-slate-500 underline-offset-2 hover:underline"
                      data-testid="dept-kit-open-tools"
                      onClick={() => setStepToolsOpen(true)}
                    >
                      本步助手
                    </button>
                  </p>
                ) : !allChecklistDone ? (
                  <div
                    className="max-w-[95%] rounded-2xl rounded-tl-md border border-slate-200/80 bg-white px-3 py-2 text-[12px] leading-relaxed text-slate-800"
                    data-testid="dept-ask-bubble-g1"
                    data-ask-kind="g1"
                    data-kit-compact="1"
                    data-kit-folded="1"
                    data-kit-wall="0"
                    data-kit-priority="secondary"
                  >
                    <p className="text-[9px] font-semibold text-slate-500">
                      {businessSeatLabel(dept.leadSeatId)} · 进度一句
                    </p>
                    <p className="mt-0.5 font-medium">
                      本步还差 {missingLabels.length} 项，先把上方主稿补齐
                    </p>
                    <p
                      className="mt-0.5 text-[10px] text-slate-500"
                      data-testid="dept-checklist-missing"
                      data-missing-count={missingLabels.length}
                    >
                      拍板仍在对话 · 勾选可开本步助手
                    </p>
                    <button
                      type="button"
                      className="btn-press focus-ring mt-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-white"
                      data-testid="dept-kit-open-tools"
                      onClick={() => setStepToolsOpen(true)}
                    >
                      打开本步助手
                    </button>
                    <details className="sr-only" data-testid="dept-kit-missing-fold" hidden>
                      <summary>展开缺项清单</summary>
                      <ul data-testid="dept-checklist-items-rail-legacy">
                        {missingLabels.map((label) => (
                          <li key={label}>{label}</li>
                        ))}
                      </ul>
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
                      quietChrome={showHandoffOffer || handoffLaterDismissed}
                      deliverBlockedReason={
                        awaitingThis
                          ? '已交卷，待你确认；请在上方汇报拍板，不能再交卷'
                          : st === '已完成' || handoffPhase === '已确认可往下'
                            ? '本站已确认可往下，无需再交卷'
                            : missingLabels.length
                              ? `本稿要点未齐 · 缺：${missingLabels.join('、')}（可开本步助手）`
                              : '本稿要点未齐，不能交卷；拍板请在上方汇报'
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

            {/* 底：主 CTA 一行 + 巡检辅 */}
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
                  请在上方汇报气泡确认或驳回
                </p>
              ) : canSubmit || thisDeptConfirmPending ? (
                <button
                  type="button"
                  onClick={onSubmit}
                  title={
                    thisDeptConfirmPending ? AWAITING_ADVANCE_LOCK_HINT : undefined
                  }
                  className="btn-press focus-ring inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                  data-testid="dept-primary-cta"
                  data-can-submit={canSubmit ? '1' : '0'}
                  data-awaiting-confirm="0"
                  data-cta-wall="0"
                >
                  {thisDeptConfirmPending ? primaryLabel : '交卷'}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              ) : showHandoffOffer ||
                handoffLaterDismissed ||
                st === '已完成' ||
                handoffPhase === '已确认可往下' ? (
                <p
                  className="text-center text-[10px] leading-relaxed text-slate-500"
                  data-testid="dept-primary-cta-demoted"
                  data-cta-wall="0"
                  data-footer-quiet="1"
                >
                  {showHandoffOffer
                    ? '请看上方收口汇报'
                    : handoffLaterDismissed
                      ? '本站已办完 · 换站回大厅'
                      : '本站已确认可往下'}
                  <span
                    className="sr-only"
                    data-testid="dept-primary-cta"
                    data-can-submit="0"
                    data-awaiting-confirm="0"
                  >
                    {primaryLabel}
                  </span>
                </p>
              ) : (
                <p
                  className="text-center text-[10px] leading-relaxed text-slate-500"
                  data-testid="dept-primary-cta-demoted"
                  data-cta-wall="0"
                >
                  本稿要点未齐 · 先补主稿或开本步助手
                  <span
                    className="sr-only"
                    data-testid="dept-primary-cta"
                    data-can-submit="0"
                    data-awaiting-confirm="0"
                  >
                    {primaryLabel}
                  </span>
                </p>
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
                  {toolsOpen ? '收起巡检' : '巡检'}
                </button>
                <Link
                  to={companyHref}
                  className="btn-press focus-ring inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600"
                  data-testid="dept-side-back-company"
                >
                  <Building2 className="h-3 w-3" aria-hidden />
                  公司
                </Link>
                {/* §128：换站回大厅或收口现在做；不作左/右切部主航 */}
                <span className="sr-only" data-testid="dept-side-switch-depts" data-removed="v128">
                  换站请回大厅或用收口「现在做」
                </span>
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

