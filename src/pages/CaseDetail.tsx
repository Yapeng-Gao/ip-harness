import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AppLink } from '../components/AppLink'
import {
  CheckCircle2,
  Circle,
  RotateCcw,
  AlertCircle,
  Check,
  Briefcase,
  UserPlus,
  X,
  Receipt,
  Plus,
  Bot,
  Download,
  ChevronRight,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAgents } from '../context/AgentContext'
import {
  evaluatePayUnlock,
  firstGuardrailMessage,
} from '../domain/guardrails'
import { STAGES, getStageMeta, getStageIndex } from '../data/stages'
import { ProgressBar } from '../components/ProgressBar'
import { workbenchPathForStage } from '../data/workbenchMap'
import { FLOW_CATALOG, FLOW_KEY_BY_STAGE } from '../data/flowSteps'
import { CaseHeaderBar } from '../components/workbench/FlowChrome'
import { ARTIFACT_FOR_STAGE } from '../data/handoff'
import { RaciPanel } from '../components/RaciPanel'
import { FulfillmentModeBadge } from '../components/FulfillmentModeBadge'
import { AGENCIES } from '../data/agencies'
import { TenantBanner } from '../components/TenantBanner'
import {
  AUDIT_SCHEMA_VERSION,
  COMMAND_LABELS,
  auditSchemaVersionLabel,
  isLegacyAudit,
} from '../domain/commands'
import { AuditReplayPanel } from '../components/AuditReplayPanel'
import { setLastCaseId } from '../utils/lastVisited'
import { mergeDriveAndArtifacts } from '../utils/productDisplay'
import {
  EVIDENCE_PACK_DISCLAIMER,
  exportCaseEvidencePack,
} from '../utils/caseEvidencePack'
import { buildCaseContext, CASE_CONTEXT_SCHEMA_VERSION } from '../domain/caseContextContract'
import { AGENT_CATALOG } from '../data/agents'
import { CaseContextContractPanel } from '../components/CaseContextContractPanel'

/** UTC ISO → Asia/Shanghai 短标签 */
function formatFlowProgressAt(iso: string): string {
  try {
    const d = new Date(iso)
    return (
      d.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }) + ' CST'
    )
  } catch {
    return iso
  }
}


type DetailTab = 'overview' | 'handoff' | 'billing' | 'audit'

function parseDetailTab(raw: string | null): DetailTab {
  if (raw === 'overview' || raw === 'handoff' || raw === 'billing' || raw === 'audit') return raw
  return 'overview'
}

export function CaseDetail() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const fromAgent = searchParams.get('from') === 'agent'
  const detailTab = parseDetailTab(searchParams.get('tab'))
  const setDetailTab = (id: DetailTab) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', id)
    setSearchParams(next, { replace: true })
  }
  const navigate = useNavigate()
  const {
    getCase,
    toggleChecklist,
    rejectGate,
    setFulfillmentMode,
    canAccessCase,
    workspace,
    visibleDocketEvents,
    addInvoice,
    dispatchCommand,
    getAuditForCase,
    getCaseDriveItems,
    role,
    persona,
    getDisclosurePackCheck,
    getDraftFilingCheck,
    getFullCheckLite,
    hasBlockingInvoiceForCase,
    overdueStopEnabled,
    getMaintainSchedule,
    getCaseFlowProgress,
    agencyIntents,
    acceptAgencyIntent,
    ignoreAgencyIntent,
  } = useApp()
  const { visibleSessions } = useAgents()
  const c = getCase(id!)
  const caseFlowProgress = useMemo(
    () => (c ? getCaseFlowProgress(c.id) : {}),
    [c, getCaseFlowProgress],
  )
  const productRows = useMemo(
    () => (c ? mergeDriveAndArtifacts(getCaseDriveItems(c.id), c.artifacts) : []),
    // getCaseDriveItems is stable enough via context; recompute when case identity / artifacts change
    [c, getCaseDriveItems],
  )
  const caseContextSnap = useMemo(
    () => (c ? buildCaseContext(c, c.handoffs, { persona, agents: AGENT_CATALOG }) : null),
    [c, persona],
  )
  const [toast, setToast] = useState<string | null>(null)
  const [toastError, setToastError] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [exportIncludeJson, setExportIncludeJson] = useState(false)
  /** UI-only: which flow node stages are expanded in overview */
  const [expandedNodeKeys, setExpandedNodeKeys] = useState<Record<string, boolean> | null>(null)

  useEffect(() => {
    if (!pickerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPickerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pickerOpen])

  useEffect(() => {
    if (id && c && canAccessCase(id)) {
      setLastCaseId(id, c.stage)
    }
  }, [id, c, canAccessCase])

  useEffect(() => {
    if (!id) return
    if (c && !canAccessCase(id)) {
      setToast('无权访问：该案未分配给当前租户')
      setToastError(true)
      const t = window.setTimeout(() => navigate('/cases', { replace: true }), 1200)
      return () => window.clearTimeout(t)
    }
    if (!c) {
      // may still be loading-less; leave not-found UI
    }
  }, [id, c, canAccessCase, navigate])

  if (c && !canAccessCase(id!)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8">
        {toast && (
          <div className="fixed right-6 top-6 z-50 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700 shadow-xl">
            <AlertCircle className="h-4 w-4" />
            {toast}
          </div>
        )}
        <p className="text-slate-500">正在返回案件库…</p>
      </div>
    )
  }

  if (!c) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8">
        <p className="text-slate-400">案件不存在</p>
        <AppLink to="/pipeline" className="text-sm text-slate-700">
          返回流水线
        </AppLink>
      </div>
    )
  }

  const stageMeta = getStageMeta(c.stage)
  const stageIdx = getStageIndex(c.stage)
  const requiredDone = c.checklist.filter((i) => i.required && i.done).length
  const requiredTotal = c.checklist.filter((i) => i.required).length
  const stageHandoffKey = ARTIFACT_FOR_STAGE[c.stage]
  const stageHandoffStatus = stageHandoffKey
    ? c.handoffs[stageHandoffKey]?.status
    : undefined
  const handoffPassOk =
    !stageHandoffKey ||
    stageHandoffStatus === 'approved' ||
    stageHandoffStatus === 'filed' ||
    stageHandoffStatus === 'authorized_to_file'
  const canPass = requiredDone === requiredTotal && handoffPassOk
  const mode = c.fulfillmentMode ?? 'delegated'

  const showToast = (msg: string, isError = false) => {
    setToast(msg)
    setToastError(isError)
    setTimeout(() => setToast(null), 2800)
  }

  const handlePass = async () => {
    // 与工作台同命令：advanceStage → advanceFromWorkbench（清单+交接硬闸）
    const res = await dispatchCommand(
      { type: 'advanceStage', caseId: c.id, note: '案件详情闸门通过' },
      { actor: 'user', detail: '案件详情：通过闸门' },
    )
    showToast(res.message, !res.ok)
  }

  const handleReject = () => {
    if (stageIdx <= 0) {
      showToast('已在首阶段，无法退回', true)
      return
    }
    rejectGate(c.id)
    showToast('已退回上一阶段')
  }

  const handlePickAgency = (name: string) => {
    void dispatchCommand({ type: 'assignAgency', caseId: c.id, agencyName: name }, { actor: 'user' })
    setPickerOpen(false)
    showToast(`已派单给「${name}」，办理模式切换为已委托代理`)
  }

  const toggleMode = () => {
    const next = mode === 'self_serve' ? 'delegated' : 'self_serve'
    setFulfillmentMode(c.id, next)
    showToast(
      next === 'self_serve'
        ? '已切换为企业自助'
        : '已切换为已委托代理（可继续派单）',
    )
  }

  const handleExportEvidencePack = () => {
    const exportedAt = new Date().toISOString()
    // 证据包 v2：本案未归档会话全量摘要（最近优先）；无则诚实「无会话链」
    const caseSessions = visibleSessions
      .filter((s) => !s.archived && s.caseId === c.id)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    const boundSess = caseSessions[0]
    exportCaseEvidencePack(
      {
        caseData: c,
        workspace: {
          id: workspace.id,
          name: workspace.name,
          kind: workspace.kind,
          chipLabel: workspace.chipLabel,
          role: workspace.role,
        },
        persona,
        role,
        personaSnapshotAt: exportedAt,
        auditLog: getAuditForCase(c.id),
        driveItems: getCaseDriveItems(c.id),
        disclosurePackCheck: getDisclosurePackCheck(c.id),
        draftFilingCheck: getDraftFilingCheck(c.id),
        fullCheckLite: getFullCheckLite(c.id),
        // 原型 store 无 checkedBy/at — 导出侧写「未记录操作者」，勿伪造
        fullCheckMeta: undefined,
        exportedAt,
        clearedHitlGates: boundSess?.clearedHitlGates,
        sessionId: boundSess?.id,
        sessionCaseId: boundSess?.caseId ?? null,
        sessionHitlSummary: boundSess
          ? {
              sessionId: boundSess.id,
              title: boundSess.title,
              agentId: boundSess.agentId,
              clearedGates: boundSess.clearedHitlGates ?? [],
              status: boundSess.status,
            }
          : null,
        sessionHitlSummaries: caseSessions.map((s) => ({
          sessionId: s.id,
          title: s.title,
          agentId: s.agentId,
          clearedGates: s.clearedHitlGates ?? [],
          status: s.status,
        })),
      },
      { includeJson: exportIncludeJson },
    )
    showToast(
      exportIncludeJson
        ? '已导出审计证据包（.md + .json）· 原型内存快照'
        : '已导出审计证据包（.md）· 原型内存快照',
    )
  }

  return (
    <div className="px-5 py-5 lg:px-8 lg:py-6">
      <TenantBanner />
      {fromAgent && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-950">
          <Bot className="h-3.5 w-3.5 shrink-0 text-emerald-700" aria-hidden />
          <span className="min-w-0 flex-1">知产 Agent 已写入本案件</span>
          <AppLink
            to="/agent"
            className="btn-press shrink-0 font-medium text-emerald-800 underline-offset-2 hover:underline"
          >
            回知产 Agent
          </AppLink>
        </div>
      )}
      <div role="status" aria-live="polite" aria-atomic="true" className="pointer-events-none fixed right-6 top-6 z-50">
        {toast && (
          <div
            className={`toast-enter ui-toast ${
              toastError ? 'ui-toast-error' : 'ui-toast-success'
            }`}
          >
            {toastError ? <AlertCircle className="h-4 w-4" aria-hidden /> : <Check className="h-4 w-4" aria-hidden />}
            {toast}
          </div>
        )}
      </div>

      {pickerOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="agency-picker-title"
          onClick={(e) => { if (e.target === e.currentTarget) setPickerOpen(false) }}
        >
          <div className="overscroll-contain max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 id="agency-picker-title" className="text-balance text-sm font-semibold text-slate-900">派单 / 更换代理</h3>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="icon-btn rounded-md p-1 text-slate-400 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                aria-label="关闭派单对话框"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <ul className="divide-y divide-slate-100 p-2">
              {AGENCIES.map((ag) => (
                <li key={ag.id}>
                  <button
                    type="button"
                    onClick={() => handlePickAgency(ag.name)}
                    className="focus-row flex w-full flex-col gap-1 rounded-xl px-3 py-3 text-left hover:bg-slate-100"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-800">{ag.name}</span>
                      <span className="text-xs text-amber-600">★ {ag.rating}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      擅长：{ag.specialties.join(' · ')} · {ag.priceRange}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <CaseHeaderBar
        caseData={c}
        handoffKey={ARTIFACT_FOR_STAGE[c.stage]}
        backTo="/pipeline"
        backLabel="返回流水线"
        mainCta={
          <>
            <AppLink
              to={workbenchPathForStage(c.stage, c.id)}
              className="ui-btn ui-btn-primary btn-press cta-work focus-ring"
              aria-label="在工作台办理本案"
            >
              <Briefcase className="h-4 w-4" aria-hidden />
              在工作台办理
            </AppLink>
            <button
              type="button"
              onClick={handlePass}
              disabled={!canPass}
              title={
                !canPass
                  ? !handoffPassOk
                    ? `交接未批准（${stageHandoffKey ?? '—'}：${stageHandoffStatus ?? '无'}），与工作台同闸`
                    : '必做清单未齐'
                  : '清单齐套且交接已批准后晋级'
              }
              className={`btn-press hit-40 inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border px-4 py-2 text-sm font-medium focus-ring ${
                canPass
                  ? 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
                  : 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              通过闸门
            </button>
            <button
              type="button"
              onClick={handleExportEvidencePack}
              title={EVIDENCE_PACK_DISCLAIMER}
              className="btn-press hit-40 inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-[var(--shadow-rest)] hover:bg-slate-50 focus-ring"
              aria-label="导出本案审计证据包"
            >
              <Download className="h-4 w-4" aria-hidden />
              导出审计证据包
            </button>
            <label className="hit-40 inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] border border-slate-100 bg-slate-50 px-2.5 py-2 text-xs text-slate-600">
              <input
                type="checkbox"
                className="rounded border-slate-300"
                checked={exportIncludeJson}
                onChange={(e) => setExportIncludeJson(e.target.checked)}
              />
              含 JSON
            </label>
            <details className="relative">
              <summary className="btn-press focus-ring hit-40 list-none cursor-pointer rounded-[var(--radius-sm)] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-[var(--shadow-rest)] hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                更多
              </summary>
              <div className="absolute right-0 z-30 mt-1 min-w-[10rem] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-[var(--shadow-elevated)]">
                <button
                  type="button"
                  onClick={handleReject}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                  退回
                </button>
                <AppLink
                  to={`/agent?case=${c.id}`}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                  aria-label="用知产 Agent 处理本案"
                >
                  <Bot className="h-3.5 w-3.5" aria-hidden />
                  用知产 Agent
                </AppLink>
              </div>
            </details>
          </>
        }
      />

      {(() => {
        const block = hasBlockingInvoiceForCase(c.id)
        if (!block.blocked || !overdueStopEnabled) return null
        return (
          <div
            className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
            role="alert"
          >
            <div className="font-medium">逾期发票停权</div>
            <p className="mt-1 text-xs text-rose-800/90">
              {block.reason}
              {role === 'agency'
                ? ' · 提交与递交已禁用，请先结清。'
                : ' · 代理提交/递交已停权；企业仍可审核策略。'}
            </p>
            <AppLink
              to="/billing/cases?tab=ledger&status=逾期"
              className="btn-press mt-2 inline-flex text-xs font-medium text-rose-950 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            >
              前往费用中心结清 →
            </AppLink>
          </div>
        )
      })()}

      {workspace.kind === 'enterprise' &&
        agencyIntents.filter((i) => i.caseId === c.id && i.status === 'intent').length > 0 && (
          <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-medium text-slate-950">待处理询价意向</h3>
            <ul className="mt-2 space-y-2">
              {agencyIntents
                .filter((i) => i.caseId === c.id && i.status === 'intent')
                .map((i) => (
                  <li
                    key={i.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
                  >
                    <div className="text-xs text-slate-700">
                      <span className="font-medium">{i.agencyName}</span>
                      <span className="text-slate-500"> · 节点 {i.node}</span>
                      {i.quoteBudget && (
                        <span className="text-slate-500"> · 报价 {i.quoteBudget}</span>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        className="btn-press rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                        aria-label={`接受报价 ${i.agencyName}`}
                        onClick={() => {
                          const res = acceptAgencyIntent(i.id)
                          showToast(res.message, !res.ok)
                        }}
                      >
                        接受报价
                      </button>
                      <button
                        type="button"
                        className="btn-press rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                        aria-label={`忽略意向 ${i.agencyName}`}
                        onClick={() => {
                          const res = ignoreAgencyIntent(i.id)
                          showToast(res.message, !res.ok)
                        }}
                      >
                        忽略
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        )}

      {/* Detail tabs */}
      <div className="segmented mb-5 w-full max-w-xl sm:w-auto" role="tablist" aria-label="案件详情">
        {(
          [
            ['overview', '概览'],
            ['handoff', '交接'],
            ['billing', '费用'],
            ['audit', '审计'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={detailTab === id}
            onClick={() => setDetailTab(id)}
            className="segmented-item btn-press focus-ring flex-1 sm:flex-none"
          >
            {label}
          </button>
        ))}
      </div>

      {detailTab === 'overview' && (
      <>
      {/* Meta (期限/交接/模式) lives in CaseHeaderBar — avoid duplicate grid */}

      <div className="surface-card mb-6 p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-balance text-sm font-medium text-slate-800">阶段进度</h2>
          <span className="text-xs tabular-nums text-slate-500">
            当前：{stageMeta.name} · {c.progress}%
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {STAGES.map((s, i) => {
            const done = i < stageIdx
            const current = i === stageIdx
            return (
              <div key={s.id} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={`h-2 w-full rounded-full ${done || current ? '' : 'bg-slate-100'} ${
                    current ? 'ring-2 ring-[var(--color-accent)]/30 ring-offset-1' : ''
                  }`}
                  style={{
                    background: done || current ? s.color : undefined,
                    opacity: current ? 1 : done ? 0.55 : 1,
                  }}
                />
                <span
                  className={`text-[11px] ${
                    current ? 'font-semibold text-slate-900' : done ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {s.shortName}
                </span>
              </div>
            )
          })}
        </div>
        <div className="mt-3">
          <ProgressBar value={c.progress} color={stageMeta.color} />
        </div>
      </div>

      <div className="surface-card mb-6 p-5">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-slate-800">节点进度（工作台写回）</h2>
          <span className="text-xs text-slate-500">只读 · 可展开 · 当前步高亮</span>
        </div>
        <p className="mb-4 text-xs text-slate-500 text-pretty">
          进度来自各办理台 STEPS 写回；非 stages.runners 静态目录。点步骤不编辑。默认展开当前阶段。
        </p>
        <div className="space-y-2">
          {STAGES.map((s) => {
            const flowKey = FLOW_KEY_BY_STAGE[s.id]
            const flow = flowKey ? FLOW_CATALOG.find((f) => f.key === flowKey) : undefined
            const prog = flowKey ? caseFlowProgress[flowKey] : undefined
            const stepIndex = prog?.stepIndex ?? -1
            const isCurrentStage = s.id === c.stage
            const nodeKey = flowKey ?? s.id
            const isOpen =
              expandedNodeKeys != null
                ? (expandedNodeKeys[nodeKey] ?? isCurrentStage)
                : isCurrentStage
            const toggleOpen = () =>
              setExpandedNodeKeys((prev) => {
                const base =
                  prev ??
                  Object.fromEntries(
                    STAGES.map((st) => {
                      const fk = FLOW_KEY_BY_STAGE[st.id]
                      return [fk ?? st.id, st.id === c.stage]
                    }).concat([['layout', false]]),
                  )
                return { ...base, [nodeKey]: !isOpen }
              })
            return (
              <div
                key={s.id}
                className="mid-node-stage"
                data-current={isCurrentStage ? 'true' : 'false'}
                data-open={isOpen ? 'true' : 'false'}
              >
                <button
                  type="button"
                  className="mid-node-stage-toggle focus-ring btn-press"
                  aria-expanded={isOpen}
                  onClick={toggleOpen}
                >
                  <ChevronRight className="mid-node-chevron h-3.5 w-3.5" aria-hidden />
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ background: s.color }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                    {s.name}
                  </span>
                  {isCurrentStage && (
                    <span className="rounded-full bg-slate-900 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      当前阶段
                    </span>
                  )}
                  {flow && (
                    <span className="tabular text-[11px] text-slate-400">
                      {stepIndex >= 0 ? `s${stepIndex + 1}/${flow.steps.length}` : `0/${flow.steps.length}`}
                    </span>
                  )}
                </button>
                <div className="mid-node-stage-body">
                  {!flow ? (
                    <p className="px-1 text-xs text-slate-500">无对应 Flow</p>
                  ) : (
                    <>
                      <div className="mb-2 flex justify-end px-1">
                        <AppLink
                          to={`${flow.path}/${c.id}`}
                          className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          打开办理台 →
                        </AppLink>
                      </div>
                      <ul className="space-y-0.5" aria-label={`${flow.label} 子步骤`}>
                        {flow.steps.map((label, i) => {
                          const done = stepIndex >= 0 && i < stepIndex
                          const active = stepIndex >= 0 && i === stepIndex
                          return (
                            <li
                              key={`${flow.key}-${i}`}
                              className="mid-node-step text-xs"
                              data-active={active ? 'true' : 'false'}
                              data-done={done ? 'true' : 'false'}
                              data-pending={!done && !active ? 'true' : 'false'}
                            >
                              {done ? (
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                              ) : active ? (
                                <Circle className="h-3.5 w-3.5 shrink-0 fill-[var(--color-accent)] text-[var(--color-accent)]" aria-hidden />
                              ) : (
                                <Circle className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden />
                              )}
                              <span className="min-w-0 flex-1">
                                <span className="tabular mr-1 text-slate-400">{i + 1}.</span>
                                {label}
                                {active ? (
                                  <span className="ml-1 text-[10px] font-medium text-[var(--color-accent-muted)]">
                                    当前
                                  </span>
                                ) : done ? (
                                  <span className="ml-1 text-[10px] text-emerald-700/80">已覆盖</span>
                                ) : null}
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                      <div className="mt-2 px-1 text-[11px] tabular-nums text-slate-400">
                        {prog
                          ? `水位 s${prog.stepIndex} · 更新 ${formatFlowProgressAt(prog.updatedAt)}`
                          : '尚未写回（进入办理台步进后可见）'}
                      </div>
                      {s.runners.length > 0 && (
                        <details className="mt-2 px-1">
                          <summary className="cursor-pointer text-[11px] text-slate-400 hover:text-slate-600">
                            静态 runners 目录（非 Live · {s.runners.length}）
                          </summary>
                          <ul className="mt-1 space-y-0.5 border-l border-slate-200 pl-3 text-[11px] text-slate-400">
                            {s.runners.map((r) => (
                              <li key={r.id}>
                                {r.name}
                                <span className="text-slate-300"> · {r.steps.length} 概念步</span>
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
          {/* layout 辅台 */}
          {(() => {
            const flow = FLOW_CATALOG.find((f) => f.key === 'layout')!
            const prog = caseFlowProgress.layout
            const stepIndex = prog?.stepIndex ?? -1
            const isOpen =
              expandedNodeKeys != null
                ? (expandedNodeKeys.layout ?? false)
                : false
            const toggleOpen = () =>
              setExpandedNodeKeys((prev) => {
                const base =
                  prev ??
                  Object.fromEntries(
                    STAGES.map((st) => {
                      const fk = FLOW_KEY_BY_STAGE[st.id]
                      return [fk ?? st.id, st.id === c.stage]
                    }).concat([['layout', false]]),
                  )
                return { ...base, layout: !isOpen }
              })
            return (
              <div
                className="mid-node-stage border-dashed"
                data-current="false"
                data-open={isOpen ? 'true' : 'false'}
              >
                <button
                  type="button"
                  className="mid-node-stage-toggle focus-ring btn-press"
                  aria-expanded={isOpen}
                  onClick={toggleOpen}
                >
                  <ChevronRight className="mid-node-chevron h-3.5 w-3.5" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                    {flow.label}
                  </span>
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                    辅台
                  </span>
                  <span className="tabular text-[11px] text-slate-400">
                    {stepIndex >= 0 ? `s${stepIndex + 1}/${flow.steps.length}` : `0/${flow.steps.length}`}
                  </span>
                </button>
                <div className="mid-node-stage-body">
                  <div className="mb-2 flex justify-end px-1">
                    <AppLink
                      to={`${flow.path}/${c.id}`}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      打开 →
                    </AppLink>
                  </div>
                  <ul className="space-y-0.5" aria-label={`${flow.label} 子步骤`}>
                    {flow.steps.map((label, i) => {
                      const done = stepIndex >= 0 && i < stepIndex
                      const active = stepIndex >= 0 && i === stepIndex
                      return (
                        <li
                          key={`layout-${i}`}
                          className="mid-node-step text-xs"
                          data-active={active ? 'true' : 'false'}
                          data-done={done ? 'true' : 'false'}
                          data-pending={!done && !active ? 'true' : 'false'}
                        >
                          {done ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                          ) : active ? (
                            <Circle className="h-3.5 w-3.5 shrink-0 fill-[var(--color-accent)] text-[var(--color-accent)]" aria-hidden />
                          ) : (
                            <Circle className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden />
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="tabular mr-1 text-slate-400">{i + 1}.</span>
                            {label}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                  <div className="mt-2 px-1 text-[11px] tabular-nums text-slate-400">
                    {prog
                      ? `水位 s${prog.stepIndex} · 更新 ${formatFlowProgressAt(prog.updatedAt)}`
                      : '尚未写回'}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </div>


      <div className="mb-6">
        <CaseContextContractPanel snap={caseContextSnap} />
      </div>

      </>
      )}

      {detailTab === 'handoff' && (
      <>
      {Object.entries(c.handoffs)
        .filter(([, h]) => h?.status === 'filed' && h.receiptNo)
        .map(([key, h]) => (
          <div
            key={key}
            className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900"
          >
            <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
              递交回执已归档
            </div>
            <div className="mt-1 font-mono text-base tabular-nums">{h!.receiptNo}</div>
            <div className="mt-0.5 text-xs text-slate-600">递交日 {h!.filedAt}</div>
          </div>
        ))}

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="surface-card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-slate-800">委托关系</h2>
            <div className="flex flex-wrap items-center gap-2">
              <FulfillmentModeBadge mode={mode} onToggle={toggleMode} />
              {workspace.kind === 'enterprise' && (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="btn-press inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                >
                  <UserPlus className="h-3.5 w-3.5" aria-hidden />
                  派单/更换代理
                </button>
              )}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="text-xs text-slate-500">企业联系人</div>
              <div className="mt-1 text-sm text-slate-800">{c.enterpriseContact}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">承办代理所</div>
              <div className="mt-1 text-sm text-slate-800">
                {mode === 'self_serve' ? (
                  <span className="text-slate-400">未委托</span>
                ) : (
                  c.agencyName
                )}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">委托阶段</div>
              <div className="mt-1 text-sm text-slate-800">{c.engagement.phase}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">报价 / 预算</div>
              <div className="mt-1 text-sm text-slate-800">{c.engagement.quoteBudget}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">付款状态</div>
              <div className="mt-1">
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                    c.engagement.paymentStatus === '已结清'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : c.engagement.paymentStatus === '逾期'
                        ? 'border-rose-200 bg-rose-50 text-rose-700'
                        : c.engagement.paymentStatus.includes('待确认') ||
                            c.engagement.paymentStatus === '未报价'
                          ? 'border-amber-200 bg-amber-50 text-amber-800'
                          : 'border-blue-200 bg-blue-50 text-blue-700'
                  }`}
                >
                  {c.engagement.paymentStatus}
                </span>
              </div>
              {c.engagement.feeNotes && (
                <div className="mt-1 text-xs text-slate-500">{c.engagement.feeNotes}</div>
              )}
            </div>
          </div>
        </div>


        {/* Fix3：年费日程只读台账提示 · 与 Docket 官方期限分表，勿当真双写 */}
        {(() => {
          const rows = getMaintainSchedule(c.id)
          if (!rows.length) return null
          const unpaid = rows.filter((r) => !r.paid)
          return (
            <div className="surface-card mb-6 p-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-medium text-slate-800">年费日程台账（只读）</h2>
                <AppLink
                  to={`/workbench/maintain/${c.id}`}
                  className="btn-press text-xs font-medium text-slate-700 hover:text-slate-900"
                >
                  打开授权维持 →
                </AppLink>
              </div>
              <p className="mb-3 text-[11px] leading-snug text-slate-400" role="note">
                办理台账在维持工作台全局 store；下方 Docket/官方期限为另表事件，Inbox 按 due 去重 · 非双写。
              </p>
              <ul className="space-y-1.5">
                {rows.slice(0, 4).map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center gap-2 text-xs text-slate-700"
                  >
                    <span className="tabular-nums text-slate-500">Y{r.year}</span>
                    <span className="tabular-nums">{r.due}</span>
                    <span>{r.amount}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                        r.paid
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {r.paid ? '已缴' : '待缴'}
                    </span>
                    {r.label ? <span className="text-slate-400">{r.label}</span> : null}
                  </li>
                ))}
              </ul>
              {unpaid.length > 0 && (
                <p className="mt-2 text-[11px] text-amber-800/80">
                  待缴 {unpaid.length} 笔 · 缴费请走发票付款解锁（非本台账直改）
                </p>
              )}
              <AppLink
                to={`/docket?case=${c.id}`}
                className="btn-press mt-2 inline-block text-[11px] text-slate-500 hover:text-slate-800"
              >
                对照官方期限 Docket →
              </AppLink>
            </div>
          )
        })()}

        <RaciPanel stage={c.stage} mode={mode} />

      </div>
      </>
      )}

      {detailTab === 'billing' && (
      <>
      <div className="surface-card mb-6 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-medium text-slate-800">
            <Receipt className="h-4 w-4 text-slate-700" aria-hidden />
            预算与发票
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {c.engagement.budgetApproved && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200">
                已批预算 {c.engagement.budgetApproved}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                const due = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
                addInvoice(c.id, {
                  title: `补充费用 · ${stageMeta.name}`,
                  amount: '¥5,000',
                  status: '待开票',
                  due,
                  relatedStage: stageMeta.name,
                })
                showToast('已添加示意发票行')
              }}
              className="btn-press inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
              aria-label="添加示意发票"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              添加发票
            </button>
          </div>
        </div>
        <ul className="space-y-2">
          {(c.engagement.invoices ?? []).map((inv) => (
            <li
              key={inv.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-800">{inv.title}</div>
                <div className="text-xs text-slate-500">
                  {inv.relatedStage} · 到期 {inv.due}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="tabular-nums text-sm font-medium text-slate-900">{inv.amount}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    inv.status === '已付款'
                      ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                      : inv.status === '逾期'
                        ? 'bg-rose-50 text-rose-800 ring-1 ring-rose-200'
                        : inv.status === '已开票'
                          ? 'bg-sky-50 text-sky-800 ring-1 ring-sky-200'
                          : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
                  }`}
                >
                  {inv.status}
                </span>
                {role === 'agency' && inv.status === '待开票' && (
                  <button
                    type="button"
                    onClick={() => {
                      void dispatchCommand({ type: 'issueInvoice', caseId: c.id, invoiceId: inv.id }, { actor: 'user' })
                      showToast('已开具发票')
                    }}
                    className="btn-press focus-ring rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-800 ring-1 ring-sky-200"
                    aria-label={`开具发票 ${inv.title}`}
                  >
                    开具发票
                  </button>
                )}
                {(inv.status === '已开票' || inv.status === '逾期') && (() => {
                  const payGr = evaluatePayUnlock({
                    case: c,
                    persona,
                    role,
                    isEnterprise: role === 'enterprise',
                  })
                  const payBlocked = !payGr.ok
                  const payReason = firstGuardrailMessage(payGr)
                  return (
                    <button
                      type="button"
                      disabled={payBlocked}
                      title={payBlocked ? (payReason ?? '不可付款解锁') : undefined}
                      onClick={() => {
                        void (async () => {
                          const r = await dispatchCommand(
                            { type: 'payInvoice', caseId: c.id, invoiceId: inv.id },
                            { actor: 'user' },
                          )
                          showToast(r.ok ? '已标记付款' : r.message, !r.ok)
                        })()
                      }}
                      className="btn-press focus-ring rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={
                        payBlocked
                          ? `不可付款：${payReason ?? ''}`
                          : `标记已付款 ${inv.title}`
                      }
                    >
                      标记已付款
                    </button>
                  )
                })()}
              </div>
            </li>
          ))}
          {(c.engagement.invoices ?? []).length === 0 && (
            <li className="py-6 text-center text-xs text-slate-500">暂无发票 · 可添加示意行</li>
          )}
        </ul>
        <AppLink
          to="/billing/cases"
          className="mt-3 inline-block text-xs text-slate-700 hover:text-slate-900"
        >
          打开案件费用台账 →
        </AppLink>
      </div>
      </>
      )}

      {detailTab === 'overview' && (
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="surface-card p-5 lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-800">当前闸门清单</h2>
            <span className="text-xs tabular-nums text-slate-500">
              {requiredDone}/{requiredTotal} 必做
            </span>
          </div>
          <ul className="space-y-1.5">
            {c.checklist.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => toggleChecklist(c.id, item.id)}
                  className="wb-check-row focus-ring btn-press w-full text-left"
                  data-checked={item.done ? 'true' : 'false'}
                >
                  {item.done ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                  )}
                  <span
                    className={`text-sm leading-snug ${
                      item.done ? 'text-slate-500 line-through' : 'text-slate-800'
                    }`}
                  >
                    {item.label}
                    {item.required && <span className="ml-1 text-xs text-rose-500">*</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-card p-5">
          <h2 className="mb-1 text-sm font-medium text-slate-800">产物单源（只读合并 · 去重）</h2>
          <p className="mb-4 text-xs text-slate-500">
            按 title/summary/kind 去重展示 · 同一逻辑产物一条 · 标签标来源 · 存储仍分通道 · 非真网盘
          </p>
          <ul className="space-y-2">
            {productRows.map((row) => (
              <li
                key={row.key}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {row.sources.includes('Drive') && (
                    <span className="rounded border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-800">
                      Drive
                    </span>
                  )}
                  {row.sources.includes('工件') && (
                    <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                      工件
                    </span>
                  )}
                  {row.sources.length > 1 && (
                    <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">
                      已去重
                    </span>
                  )}
                  <span className="font-medium text-slate-800">{row.title}</span>
                </div>
                <div className="mt-0.5 text-slate-500">{row.detail}</div>
              </li>
            ))}
            {productRows.length === 0 && (
              <li className="py-6 text-center text-xs text-slate-500">
                暂无产物 · 批准 / 调研 / OA 确认后写入 Drive；交接提交写入工件
              </li>
            )}
          </ul>
        </div>

      </div>
      )}

      {detailTab === 'audit' && (
      <>
      <div className="mb-4">
        <CaseContextContractPanel snap={caseContextSnap} />
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 text-xs text-amber-950">
        <p className="min-w-0 flex-1 leading-relaxed">
          <span className="font-medium">审计证据包</span>
          ：含契约{' '}
          <span className="font-mono tabular-nums">v{CASE_CONTEXT_SCHEMA_VERSION}</span>
          {' '}· 命令序 schema{' '}
          <span className="font-mono tabular-nums">{AUDIT_SCHEMA_VERSION}</span>
          {' '}· 从内存 store 组装 Markdown（主）与可选 JSON · {EVIDENCE_PACK_DISCLAIMER}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-amber-900">
            <input
              type="checkbox"
              className="rounded border-amber-300"
              checked={exportIncludeJson}
              onChange={(e) => setExportIncludeJson(e.target.checked)}
            />
            含 JSON
          </label>
          <button
            type="button"
            onClick={handleExportEvidencePack}
            className="btn-press inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-950 hover:bg-amber-50 focus-ring"
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            导出审计证据包
          </button>
        </div>
      </div>
      <div className="mb-4">
        <AuditReplayPanel
          entries={getAuditForCase(c.id)}
          onExportEvidence={handleExportEvidencePack}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <h2 className="mb-3 text-sm font-medium text-slate-700">最近领域命令</h2>
          <ul className="space-y-1.5">
            {getAuditForCase(c.id).slice(0, 8).map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center gap-2 rounded-xl bg-white px-2.5 py-1.5 text-xs ring-1 ring-slate-200"
              >
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${
                    a.actor === 'agent'
                      ? 'bg-sky-50 text-sky-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {a.actor === 'agent' ? `agent${a.agentId ? `:${a.agentId}` : ''}` : 'user'}
                </span>
                <code className="font-mono text-slate-700">{COMMAND_LABELS[a.command]}</code>
                <span
                  className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums ${
                    isLegacyAudit(a)
                      ? 'bg-amber-50 text-amber-800'
                      : 'bg-emerald-50 text-emerald-800'
                  }`}
                  title="audit schemaVersion"
                >
                  {auditSchemaVersionLabel(a.schemaVersion)}
                </span>
                <span className="min-w-0 flex-1 truncate text-slate-500">{a.detail}</span>
                <span className="tabular-nums text-slate-400">{a.at.slice(0, 19).replace('T', ' ')}</span>
              </li>
            ))}
            {getAuditForCase(c.id).length === 0 && (
              <li className="text-xs text-slate-400">尚无领域命令写入（表单或 知产 Agent 正式执行后出现）</li>
            )}
          </ul>
        </div>

        <div className="surface-card p-5">
          <h2 className="mb-4 text-balance text-sm font-medium text-slate-800">时间线</h2>
          <ul className="space-y-4">
            {visibleDocketEvents
              .filter((e) => e.caseId === c.id && e.fromHandoffWriteback)
              .map((e) => (
                <li key={`wb-${e.id}`} className="flex gap-3 rounded-xl bg-slate-50 px-2 py-1.5 ring-1 ring-slate-200">
                  <div className="flex flex-col items-center">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-slate-500" />
                    <div className="mt-1 w-px flex-1 bg-slate-100" />
                  </div>
                  <div className="pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs tabular-nums text-slate-500">{e.triggerDate}</span>
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700">
                        业务回写
                      </span>
                    </div>
                    <div className="text-sm text-slate-800">{e.title}</div>
                    <div className="text-xs text-slate-500">
                      {e.note ?? e.officialFeeHint}
                      {e.receiptNo ? ` · 回执 ${e.receiptNo}` : ''}
                    </div>
                    <AppLink
                      to={`/docket?case=${c.id}`}
                      className="btn-press mt-1 inline-block text-xs text-slate-700 hover:text-slate-900"
                    >
                      在 Docket 中查看
                    </AppLink>
                  </div>
                </li>
              ))}
            {c.timeline.map((ev) => {
              const colors = {
                info: 'bg-blue-500',
                success: 'bg-emerald-500',
                warning: 'bg-amber-500',
                action: 'bg-slate-700',
              }
              const isWriteback = ev.badge === '业务回写' || (ev.desc?.includes('回执') ?? false)
              return (
                <li key={ev.id} className={`flex gap-3 ${isWriteback ? 'rounded-xl bg-slate-50/80 px-2 py-1' : ''}`}>
                  <div className="flex flex-col items-center">
                    <div className={`mt-1.5 h-2 w-2 rounded-full ${isWriteback ? 'bg-slate-500' : colors[ev.type]}`} />
                    <div className="mt-1 w-px flex-1 bg-slate-100" />
                  </div>
                  <div className="pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs tabular-nums text-slate-500">{ev.time}</span>
                      {(ev.badge || isWriteback) && (
                        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700">
                          {ev.badge ?? '业务回写'}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-800">{ev.title}</div>
                    <div className="text-xs text-slate-500">{ev.desc}</div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
      </>
      )}
    </div>
  )
}
