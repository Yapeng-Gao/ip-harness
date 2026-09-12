import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppLink } from '../components/AppLink'
import {
  CalendarDays,
  List,
  Clock,
  FileText,
  Plus,
  BookOpen,
  AlertTriangle,
  X,
  Bell,
  ArrowUpRight,
  Flag,
  CheckCircle2,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import {
  DOCKET_RULES,
  type DocketRuleId,
  generateDocketFromEvent,
} from '../data/docketRules'
import { daysUntil, urgencyChipClass, urgencyLabel, urgencyLevel } from '../utils/deadline'
import {
  ESCALATION_LABELS,
  effectiveEscalationLevel,
  ladderNextActions,
  type DocketEscalateAction,
} from '../utils/docketEscalate'
import { workbenchPathForStage } from '../data/workbenchMap'
import { getStageMeta } from '../data/stages'
import { PageHeader, EmptyState } from '../components/PageHeader'


export function Docket() {
  const {
    visibleCases: cases,
    visibleDocketEvents: docketEvents,
    addDocketEvent,
    escalateDocketEvent,
    getCase,
    getMaintainSchedule,
    persona,
  } = useApp()
  const docketWriteBlocked = persona === 'inventor' || persona === 'committee'

  const [searchParams, setSearchParams] = useSearchParams()
  const caseFilter = searchParams.get('case') ?? ''
  const focusRisk = searchParams.get('focus') === 'risk'
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [toast, setToast] = useState<string | null>(null)
  const [genOpen, setGenOpen] = useState(false)
  const [genCaseId, setGenCaseId] = useState(cases[0]?.id ?? 'c1')
  const [genRule, setGenRule] = useState<DocketRuleId>('oa1_response')
  const [genTrigger, setGenTrigger] = useState('2026-09-01')
  const caseSectionRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!caseFilter && !focusRisk) return
    const t = window.setTimeout(() => {
      const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      caseSectionRef.current?.scrollIntoView({
        behavior: reduce ? 'auto' : 'smooth',
        block: 'start',
      })
    }, 80)
    return () => window.clearTimeout(t)
  }, [caseFilter, focusRisk, docketEvents])

  useEffect(() => {
    if (!genOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGenOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [genOpen])

  const sorted = useMemo(() => {
    let list = caseFilter
      ? docketEvents.filter((e) => e.caseId === caseFilter)
      : docketEvents
    if (focusRisk) {
      list = list.filter((e) => {
        if (e.status === 'done') return false
        if (e.atRisk || e.escalationLevel === 'at_risk') return true
        const level = urgencyLevel(daysUntil(e.dueDate))
        return level === 'critical' || level === 'warn'
      })
    }
    return [...list].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  }, [docketEvents, caseFilter, focusRisk])

  const byMonth = useMemo(() => {
    const map = new Map<string, typeof sorted>()
    for (const e of sorted) {
      const key = e.dueDate.slice(0, 7)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    }
    return [...map.entries()]
  }, [sorted])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleGenerate = () => {
    if (docketWriteBlocked) {
      showToast('当前 Persona 不可生成官方期限')
      return
    }
    const c = getCase(genCaseId)
    const ev = generateDocketFromEvent({
      caseId: genCaseId,
      ruleId: genRule,
      triggerDate: genTrigger,
      caseTitle: c?.title,
      linkedHandoffKey:
        genRule === 'oa1_response' || genRule === 'oa_subsequent'
          ? 'prosecution_response'
          : genRule === 'annuity' || genRule === 'grant_registration'
            ? 'maintain_annuity'
            : genRule === 'application_fee'
              ? 'draft_claims'
              : undefined,
    })
    addDocketEvent(ev)
    setGenOpen(false)
    showToast(`已生成期限：${ev.title} · 到期 ${ev.dueDate}`)
  }

  const ACTION_LABEL: Record<DocketEscalateAction, string> = {
    remind: '提醒',
    escalate_enterprise: '升级到企业 IP',
    mark_at_risk: '标记风险',
    complete: '办结',
  }

  const handleEscalate = (eventId: string, action: DocketEscalateAction) => {
    if (docketWriteBlocked) {
      showToast('当前 Persona 不可升级/办结官方期限')
      return
    }
    const r = escalateDocketEvent(eventId, action)
    showToast(r.ok ? r.message : `失败：${r.message}`)
  }

  const clearCaseFilter = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('case')
    setSearchParams(next, { replace: true })
  }

  const clearRiskFocus = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('focus')
    setSearchParams(next, { replace: true })
  }

  const filteredCase = caseFilter ? getCase(caseFilter) : undefined

  return (
    <div className="p-6 lg:p-8">
      <div role="status" aria-live="polite" aria-atomic="true" className="pointer-events-none fixed right-6 top-6 z-50">
        {toast && (
          <div className="pointer-events-auto rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800 shadow-lg">
            {toast}
          </div>
        )}
      </div>

      <PageHeader
        title="官方期限 Docket"
        context="中国发明 · 期限引擎 · 逾期可走升级阶梯（提醒→企业 IP→风险）· 示意规则 · 不接真通知"
        primary={{
          label: '由事件生成期限',
          onClick: () => {
            if (docketWriteBlocked) {
              showToast('当前 Persona 不可生成官方期限')
              return
            }
            setGenOpen(true)
          },
          icon: <Plus className="h-3.5 w-3.5" aria-hidden />,
        }}
        secondary={{ label: '打开工作台待办', to: '/workbench' }}
      >
        <div className="mt-3 flex flex-wrap gap-2">
          <div className="segmented" role="group" aria-label="视图切换">
            <button
              type="button"
              onClick={() => setView('list')}
              aria-pressed={view === 'list'}
              className="segmented-item btn-press focus-ring inline-flex items-center gap-1"
            >
              <List className="h-3.5 w-3.5" aria-hidden /> 列表视图
            </button>
            <button
              type="button"
              onClick={() => setView('calendar')}
              aria-pressed={view === 'calendar'}
              className="segmented-item btn-press focus-ring inline-flex items-center gap-1"
            >
              <CalendarDays className="h-3.5 w-3.5" aria-hidden /> 日历视图
            </button>
          </div>
        </div>
      </PageHeader>

      {/* Fix3：维持日程与 Docket 分表对齐提示（只读 · 非双写） */}
      {caseFilter ? (
        (() => {
          const rows = getMaintainSchedule(caseFilter)
          if (!rows.length) return null
          return (
            <div
              className="wb-inset mb-4 text-xs text-slate-600"
              role="note"
            >
              <span className="font-medium text-slate-800">本案另有维持年费日程 {rows.length} 笔</span>
              （办理台账 · 全局 store）· 本页为官方期限另表；Inbox 按 due 去重，勿当成两套待办。
              <AppLink
                to={`/workbench/maintain/${caseFilter}`}
                className="btn-press ml-2 font-medium text-slate-800 hover:underline"
              >
                打开授权维持 →
              </AppLink>
            </div>
          )
        })()
      ) : (
        <div
          className="mb-4 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-2.5 text-[11px] text-slate-400"
          role="note"
        >
          年费办理日程在「授权维持」工作台；Docket 仅官方期限事件。筛案件后可对照本案维持台账。
        </div>
      )}

      {focusRisk && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-2.5 text-sm text-amber-950">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" aria-hidden />
          <span className="font-medium">风险聚焦</span>
          <span className="text-amber-900/80">仅显示紧急官方期限（≤7 天 / 已逾期）</span>
          <AppLink
            to="/workbench/watch"
            className="text-xs font-medium text-amber-900 underline hover:no-underline"
          >
            竞品/侵权办理 → 监控办理
          </AppLink>
          <button
            type="button"
            onClick={clearRiskFocus}
            className="btn-press ml-auto inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-2.5 py-1 text-xs text-amber-800 hover:bg-amber-100 focus-ring"
          >
            <X className="h-3 w-3" aria-hidden /> 显示全部期限
          </button>
        </div>
      )}

      {caseFilter && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800">
          <span className="font-medium">已按案件筛选</span>
          <span className="font-mono text-xs">{filteredCase?.caseNo ?? caseFilter}</span>
          <span className="text-slate-600">{filteredCase?.title ?? ''}</span>
          <button
            type="button"
            onClick={clearCaseFilter}
            className="btn-press ml-auto inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100 focus-ring"
          >
            <X className="h-3 w-3" aria-hidden /> 清除筛选
          </button>
        </div>
      )}

      <section className="surface-card mb-6 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <BookOpen className="h-4 w-4 text-slate-700" aria-hidden />
          <h2 className="text-balance text-sm font-medium text-slate-800">规则表（示意）</h2>
          <span className="text-xs text-slate-400">
            标注来源示意·专利法实施细则/审查指南
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">规则</th>
                <th scope="col" className="px-4 py-2.5 font-medium">触发</th>
                <th scope="col" className="px-4 py-2.5 font-medium">期限</th>
                <th scope="col" className="px-4 py-2.5 font-medium">官费提示</th>
                <th scope="col" className="px-4 py-2.5 font-medium">来源标注</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DOCKET_RULES.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <th scope="row" className="px-4 py-2.5 text-xs font-medium text-slate-800">{r.name}</th>
                  <td className="px-4 py-2.5 text-xs text-slate-600">{r.triggerLabel}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-700">{r.periodHint}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{r.officialFeeHint}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-400">{r.sourceNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {view === 'list' ? (
        <section
          ref={caseSectionRef}
          className="surface-card overflow-hidden"
        >
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-slate-800">
            即将到期 · {sorted.length} 条
            {caseFilter || focusRisk ? '（已筛选）' : ''}
          </div>
          {sorted.length === 0 ? (
            <EmptyState
              title="暂无期限事件"
              description={
                caseFilter
                  ? '当前案件筛选下无期限，可清除筛选或生成新期限。'
                  : '可由官方事件生成期限，或前往工作台继续办理。'
              }
              primary={
                caseFilter
                  ? { label: '清除案件筛选', onClick: clearCaseFilter }
                  : {
                      label: '由事件生成期限',
                      onClick: () => setGenOpen(true),
                      icon: <Plus className="h-3.5 w-3.5" aria-hidden />,
                    }
              }
              secondary={
                caseFilter
                  ? {
                      label: '由事件生成期限',
                      onClick: () => setGenOpen(true),
                    }
                  : { label: '打开工作台待办', to: '/workbench' }
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {sorted.map((e) => {
                const c = getCase(e.caseId)
                const days = daysUntil(e.dueDate)
                const level = urgencyLevel(days)
                const rowState =
                  e.status === 'done'
                    ? 'done'
                    : e.status === 'overdue' || level === 'critical'
                      ? 'critical'
                      : level === 'warn'
                        ? 'warn'
                        : e.fromHandoffWriteback
                          ? 'writeback'
                          : 'default'
                return (
                  <li
                    key={e.id}
                    id={`docket-event-${e.id}`}
                    className="mid-docket-row"
                    data-state={rowState}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate text-sm font-medium text-slate-900">{e.title}</div>
                        {e.fromHandoffWriteback && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                            业务回写
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono">{c?.caseNo ?? e.caseId}</span>
                        {c && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5">
                            {getStageMeta(c.stage).shortName}
                          </span>
                        )}
                        <span>触发 {e.triggerDate}</span>
                        {e.note && <span className="text-slate-400">· {e.note}</span>}
                        {e.receiptNo && (
                          <span className="font-mono text-slate-800">回执 {e.receiptNo}</span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">{e.officialFeeHint}</div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${urgencyChipClass(level)}`}
                    >
                      <Clock className="h-3 w-3" aria-hidden />
                      {urgencyLabel(days)} · {e.dueDate}
                    </span>
                    {(() => {
                      const esc = effectiveEscalationLevel(e)
                      if (esc === 'none' && !e.atRisk) return null
                      return (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                            esc === 'at_risk' || e.atRisk
                              ? 'border-rose-200 bg-rose-50 text-rose-800'
                              : esc === 'escalated_enterprise'
                                ? 'border-indigo-200 bg-indigo-50 text-indigo-800'
                                : 'border-amber-200 bg-amber-50 text-amber-900'
                          }`}
                        >
                          {(esc === 'at_risk' || e.atRisk) && (
                            <Flag className="h-3 w-3" aria-hidden />
                          )}
                          {ESCALATION_LABELS[esc]}
                          {(esc === 'at_risk' || e.atRisk) && ' · 风险'}
                        </span>
                      )
                    })()}
                    {ladderNextActions(e).map((action) => {
                      const isPrimary =
                        action === 'escalate_enterprise' ||
                        action === 'mark_at_risk'
                      const Icon =
                        action === 'remind'
                          ? Bell
                          : action === 'escalate_enterprise'
                            ? ArrowUpRight
                            : action === 'mark_at_risk'
                              ? Flag
                              : CheckCircle2
                      return (
                        <button
                          key={action}
                          type="button"
                          disabled={docketWriteBlocked}
                          title={docketWriteBlocked ? '当前 Persona 只读浏览期限' : undefined}
                          onClick={() => handleEscalate(e.id, action)}
                          className={`btn-press inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:cursor-not-allowed disabled:opacity-50 ${
                            action === 'complete'
                              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              : isPrimary
                                ? 'border border-indigo-200 bg-indigo-50 text-indigo-900 hover:bg-indigo-100'
                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                          aria-label={`${ACTION_LABEL[action]} · ${e.title}`}
                        >
                          <Icon className="h-3 w-3" aria-hidden />
                          {ACTION_LABEL[action]}
                        </button>
                      )
                    })}
                    {c && (
                      <AppLink
                        to={workbenchPathForStage(c.stage, c.id)}
                        className="btn-press rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                      >
                        办理
                      </AppLink>
                    )}
                    <AppLink
                      to={`/cases/${e.caseId}`}
                      className="btn-press rounded-lg px-1.5 py-1 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                    >
                      案件
                    </AppLink>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      ) : (
        <section ref={caseSectionRef} className="space-y-4">
          {byMonth.map(([month, events]) => (
            <div
              key={month}
              className="surface-card overflow-hidden"
            >
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800">
                {month}
              </div>
              <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((e) => {
                  const days = daysUntil(e.dueDate)
                  const level = urgencyLevel(days)
                  const calState =
                    e.status === 'done'
                      ? 'done'
                      : e.status === 'overdue' || level === 'critical'
                        ? 'critical'
                        : level === 'warn'
                          ? 'warn'
                          : e.fromHandoffWriteback
                            ? 'writeback'
                            : 'default'
                  return (
                    <div
                      key={e.id}
                      className="mid-docket-cal"
                      data-state={calState}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-medium text-slate-500">{e.dueDate}</div>
                        {e.fromHandoffWriteback && (
                          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700">
                            业务回写
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs font-medium text-slate-900 line-clamp-2">{e.title}</div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className={`rounded-full border px-1.5 py-0.5 text-xs ${urgencyChipClass(level)}`}>
                          {urgencyLabel(days)}
                        </span>
                        <span className="text-xs text-slate-400">
                          {DOCKET_RULES.find((r) => r.id === e.ruleId)?.name}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </section>
      )}

      {genOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="docket-gen-title"
          onClick={(e) => { if (e.target === e.currentTarget) setGenOpen(false) }}
        >
          <div className="overscroll-contain w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 id="docket-gen-title" className="text-balance text-sm font-semibold text-slate-900">由事件生成期限</h3>
                <p className="mt-1 text-xs text-slate-500">
                  选择规则与触发日，引擎按示意法律规则计算 dueDate
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGenOpen(false)}
                className="icon-btn rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                aria-label="关闭对话框"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <label className="block text-xs" htmlFor="gen-case">
                <span className="mb-1 block text-slate-600">案件</span>
                <select
                  id="gen-case"
                  name="genCaseId"
                  autoComplete="off"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  value={genCaseId}
                  onChange={(e) => setGenCaseId(e.target.value)}
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </label>
              <label className="block text-xs" htmlFor="gen-rule">
                <span className="mb-1 block text-slate-600">规则</span>
                <select
                  id="gen-rule"
                  name="genRule"
                  autoComplete="off"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  value={genRule}
                  onChange={(e) => setGenRule(e.target.value as DocketRuleId)}
                >
                  {DOCKET_RULES.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} · {r.periodHint}</option>
                  ))}
                </select>
              </label>
              <label className="block text-xs" htmlFor="gen-trigger">
                <span className="mb-1 block text-slate-600">触发日</span>
                <input
                  id="gen-trigger"
                  name="genTrigger"
                  type="date"
                  autoComplete="off"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  value={genTrigger}
                  onChange={(e) => setGenTrigger(e.target.value)}
                />
              </label>
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                计算结果为示意，非正式法律意见；请以官方通知书指定期限为准。
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setGenOpen(false)}
                className="btn-press rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                className="btn-press cta-work inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium focus-ring"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden /> 生成
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <FileText className="h-3.5 w-3.5" aria-hidden />
        审查答复办理页递交归档后将回写 Docket，并带「业务回写」角标
      </div>
    </div>
  )
}
