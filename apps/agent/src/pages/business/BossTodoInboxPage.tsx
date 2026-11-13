/**
 * 老板驾驶舱 · 01c §3
 * view=board|transit|delivered；board 内支持 seg=AB|A|B|C
 */
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { businessSeatDisplayName, CONFIRM_META } from '../../business/businessSeats'
import {
  collectBossTodos,
  type BossTodoItem,
  type BossTodoKind,
} from '../../business/bossTodos'
import { enrichConfirmForCockpit, planLineFromConfirm, evidenceSummaryFromConfirm } from '../../business/cockpitRows'
import {
  confirmKindFromDeptQuery,
  deptSlugForConfirmKind,
  normalizeDeptQuery,
  pendingAuditPath,
  workbenchAskPath,
} from '../../business/pendingDeptQuery'
import {
  MAIN_CHAIN_DEPTS,
  orgDeptById,
  orgDeptByLeadSeat,
  deptSlug,
  deptIdFromSlug,
} from '../../departments/orgDepts'
import { confirmKindOf, deptStatus } from '../../departments/deptProgress'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import { getProjectExpert } from '../../projects/experts'
import { DEPT_HANDOFF } from '../../departments/deptPageNarrative'
import { isBusinessSeedCaseId } from '../../business/businessSeeds'
import { pendingCardFacts } from '../../business/companyActivity'
import { CompanyActivityFeed } from '../../components/home/CompanyActivityFeed'
import { useOrgConfig } from '../../departments/OrgConfigContext'

type TodoSeg = BossTodoKind | 'AB'
type CockpitView = 'board' | 'transit' | 'delivered'

function h3Label(st: string): string {
  if (st === '待确认') return '等你拍'
  if (st === '退回') return '退回'
  if (st === '进行中') return '在途'
  if (st === '已完成') return '已完成'
  if (st === '锁定') return '锁定'
  return '未到'
}

export function BossTodoInboxPage() {
  const {
    getPendingConfirms,
    getCaseConfirms,
    cases,
    getCase,
    getProgress,
    getConfirm,
    getJudgments,
  } = useBusinessCases()
  const { deptLabel } = useOrgConfig()
  const { getThread } = useProjectFolder()
  const [params, setParams] = useSearchParams()
  const filterCaseId = params.get('caseId')?.trim() || undefined
  const scope = params.get('scope') === 'demo' || (filterCaseId && isBusinessSeedCaseId(filterCaseId)) ? 'demo' : 'workspace'
  const deptQuery = normalizeDeptQuery(params.get('dept'))
  const kindFilter = confirmKindFromDeptQuery(deptQuery)
  const viewParam = params.get('view')
  const view: CockpitView =
    viewParam === 'transit' || viewParam === 'delivered' || viewParam === 'board'
      ? viewParam
      : 'board'
  const segParam = params.get('seg')
  const seg: TodoSeg =
    segParam === 'B' || segParam === 'C' || segParam === 'A' || segParam === 'AB' ? segParam : 'AB'

  const progressById = useMemo(() => {
    const map: Record<string, ReturnType<typeof getProgress>> = {}
    for (const c of cases) map[c.id] = getProgress(c.id)
    return map
  }, [cases, getProgress])

  const rawInbox = getPendingConfirms(filterCaseId)
  const inbox = useMemo(
    () => rawInbox.filter((i) =>
      isBusinessSeedCaseId(i.caseId) === (scope === 'demo') &&
      (!deptQuery || deptSlugForConfirmKind(i.kind) === deptQuery),
    ),
    [rawInbox, scope, deptQuery],
  )

  const todos = useMemo(() => {
    const scopedCases = filterCaseId
      ? cases.filter((c) => c.id === filterCaseId)
      : cases
    const scopedProgress =
      filterCaseId && progressById[filterCaseId]
        ? { [filterCaseId]: progressById[filterCaseId]! }
        : progressById
    return collectBossTodos({
      scope,
      deptSlug: deptQuery,
      pending: inbox,
      cases: scopedCases,
      progressById: scopedProgress,
    })
  }, [inbox, cases, progressById, filterCaseId, scope, deptQuery])

  const filterCase = filterCaseId ? getCase(filterCaseId) : undefined
  const deptFilterLabel = (() => {
    if (!kindFilter) {
      const d = orgDeptById(deptIdFromSlug(deptQuery ?? '') ?? '')
      return d ? deptLabel(d) : deptQuery
    }
    const d = orgDeptByLeadSeat(CONFIRM_META[kindFilter].seatId)
    return d ? deptLabel(d) : deptQuery
  })()

  const auditMode = params.get('audit') === '1'

  const segRows: BossTodoItem[] =
    seg === 'AB' ? todos.allSorted.filter((item) => item.kind !== 'C') : seg === 'A' ? todos.a : seg === 'B' ? todos.b : todos.c

  const setScope = (next: 'workspace' | 'demo') => {
    const p = new URLSearchParams(params)
    p.delete('caseId')
    if (next === 'demo') p.set('scope', 'demo')
    else p.delete('scope')
    setParams(p, { replace: true })
  }

  const setView = (next: CockpitView) => {
    const p = new URLSearchParams(params)
    p.set('view', next)
    setParams(p, { replace: true })
  }

  const setSeg = (next: TodoSeg) => {
    const p = new URLSearchParams(params)
    p.set('seg', next)
    p.set('view', 'board')
    setParams(p, { replace: true })
  }

  const emptyCopy =
    seg === 'AB' ? '当前范围内暂无待处理事项。新办事项请从大厅选择部门。' : seg === 'A'
      ? '暂时没有要你拍板的。'
      : seg === 'B'
        ? '暂无带截止日的催办。'
        : '暂无进行中的部间工单。'

  const judgments = useMemo(() => {
    const list = getJudgments(filterCaseId)
    return list.filter((j) => isBusinessSeedCaseId(j.caseId) === (scope === 'demo') && (!deptQuery || (j.kind && confirmKindFromDeptQuery(deptQuery) === j.kind)) && (j.decision === 'confirmed' || (!j.decision && j.option.startsWith('确认')))).sort((a, b) => (a.at < b.at ? 1 : -1))
  }, [getJudgments, filterCaseId, scope, deptQuery])

  const transitRows = useMemo(() => {
    const scoped = filterCaseId
      ? cases.filter((c) => c.id === filterCaseId)
      : cases
    const rows: Array<{
      key: string
      caseId: string
      caseTitle: string
      deptLabel: string
      status: string
      h3: string
      href: string
      owner: string
      task: string
      next: string
      gap: string
      demo: boolean
    }> = []
    for (const c of scoped) {
      if (isBusinessSeedCaseId(c.id) !== (scope === 'demo')) continue
      const prog = progressById[c.id] ?? getProgress(c.id)
      const pending = getCaseConfirms(c.id)
      for (const d of MAIN_CHAIN_DEPTS) {
        const st = deptStatus({
          dept: d,
          progress: prog,
          pending,
          confirmKind: confirmKindOf(d),
        })
        if (st === '进行中' && !isBusinessSeedCaseId(c.id) && prog.receptionHandoff && prog.receptionHandoff.selectedSlug !== deptSlug(d.id) && !getThread(c.id, d.leadSeatId)) continue
        if (st === '未到' || st === '锁定' || st === '已完成') continue
        if (deptQuery && deptSlug(d.id) !== deptQuery) continue
        const kind = confirmKindOf(d)
        const latest = pending.find((item) => item.kind === kind)
        const ask = pending.find((item) => item.kind === kind && item.status === 'pending')
        const thread = getThread(c.id, d.leadSeatId)
        const step = getProjectExpert(d.leadSeatId).steps[thread?.stepIndex ?? 0]
        const paused = thread?.followUpMode === 'paused'
        const strategy = thread?.followUpMode === 'strategy'
        rows.push({
          key: `${c.id}-${d.id}`,
          caseId: c.id,
          caseTitle: c.title,
          deptLabel: deptLabel(d),
          status: st,
          h3: paused ? '已暂停' : strategy ? '待讨论策略' : h3Label(st),
          owner: businessSeatDisplayName(d.leadSeatId),
          task: ask ? planLineFromConfirm(ask) : step?.label || DEPT_HANDOFF[d.id]?.purpose || d.blurb,
          next: paused ? '等你恢复办理' : strategy ? '与你讨论修改方向，确认后再继续' : st === '待确认' ? '等你确认方案或提出修改意见' : st === '退回' ? '负责人按退回意见修改，再向你汇报' : '负责人继续办理，形成成果后向你汇报',
          gap: ask ? evidenceSummaryFromConfirm(ask) : st === '退回' ? latest?.returnNote || '待明确修改意见' : '当前没有待你拍板的事项',
          demo: isBusinessSeedCaseId(c.id),
          href: `/agent/cases/${c.id}/depts/${deptSlug(d.id)}`,
        })
      }
    }
    return rows
  }, [
    cases,
    filterCaseId,
    progressById,
    getProgress,
    getCaseConfirms,
    getThread,
    deptQuery,
    deptLabel,
    scope,
  ])

  const groupedBoard = useMemo(() => {
    const map = new Map<string, BossTodoItem[]>()
    for (const item of segRows) {
      const key = item.deptSlug
      const list = map.get(key) ?? []
      list.push(item)
      map.set(key, list)
    }
    return [...map.entries()]
  }, [segRows])

  if (deptQuery && kindFilter && inbox.length === 1 && (auditMode || filterCaseId)) {
    const only = inbox[0]!
    return (
      <Navigate
        to={auditMode
          ? pendingAuditPath(only.id, deptQuery)
          : workbenchAskPath(only.caseId, only.kind, { confirmId: only.id })}
        replace
      />
    )
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="pending-confirm-page"
      data-boss-cockpit="1"
      data-cockpit-view={view}
      data-todo-segs="abc"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]" data-testid="boss-cockpit">
        <div className="min-w-0">
        <nav
          className="mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500"
          aria-label="待办次要入口"
        >
          <Link
            to="/agent"
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:underline"
          >
            大厅
          </Link>
          {filterCaseId ? (
            <>
              <span aria-hidden className="text-slate-300">
                ·
              </span>
              <Link
                to={`/agent/cases/${filterCaseId}`}
                className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:underline"
              >
                {filterCase?.title ?? '本案'}
              </Link>
            </>
          ) : null}
        </nav>

        <h1
          className="text-balance text-[20px] font-semibold text-slate-900"
          data-testid="pending-inbox-heading"
        >
          {view === 'transit' ? '部门在途' : view === 'delivered' ? '已交付回查' : deptFilterLabel ? deptFilterLabel + ' · 待处理' : '待处理事项'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {scope === 'demo' ? '演示案件 · 流程示例' : '我的项目 · 不含内置演示案件'}
          {deptFilterLabel
            ? ` · 按部 ${deptFilterLabel}`
            : filterCaseId
              ? ' · 仅本案'
              : ''}
        </p>
        {filterCaseId || deptQuery ? (
          <p className="mt-1 text-[11px] text-slate-400">
            <Link
              to={scope === 'demo' ? '/agent/pending?scope=demo' : '/agent/pending'}
              className="font-medium text-slate-600 underline-offset-2 hover:underline"
              data-testid="pending-show-all"
            >
              查看全部
            </Link>
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="待办数据范围">
          <button type="button" aria-pressed={scope === 'workspace'} onClick={() => setScope('workspace')} className={'focus-ring min-h-9 rounded-lg border px-3 py-2 text-xs ' + (scope === 'workspace' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600')}>我的项目</button>
          <button type="button" aria-pressed={scope === 'demo'} onClick={() => setScope('demo')} className={'focus-ring min-h-9 rounded-lg border px-3 py-2 text-xs ' + (scope === 'demo' ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-slate-200 bg-white text-slate-500')}>演示案件（单独查看）</button>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">待处理数 = 待你确认 + 期限提醒，按事项条数统计。{scope === 'demo' ? '当前为演示数据，不计入大厅和左侧待办数字。' : '与大厅部门待处理和左侧待办采用相同口径。'}</p>

        <div
          className="mt-4 flex flex-wrap gap-1.5"
          role="tablist"
          aria-label="驾驶舱视图"
          data-testid="boss-cockpit-views"
        >
          {(
            [
              ['board', '待处理'],
              ['transit', '部门在途'],
              ['delivered', '已交付回查'],
            ] as const
          ).map(([id, label]) => {
            const on = view === id
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={on}
                data-testid={`boss-cockpit-view-${id}`}
                className={`btn-press focus-ring min-h-10 rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                  on
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                onClick={() => setView(id)}
              >
                {label}
              </button>
            )
          })}
        </div>

        {view === 'board' ? (
          <>
            <div
              className="mt-3 flex flex-wrap gap-1.5"
              role="tablist"
              aria-label="待办分类"
              data-testid="pending-todo-segs"
            >
              {(
                [
                  ['AB', '全部待处理', todos.counts.badge],
                  ['A', '待你确认', todos.counts.a],
                  ['B', '期限', todos.counts.b],
                  ['C', '协作工单', todos.counts.c],
                ] as const
              ).map(([id, label, n]) => {
                const on = seg === id
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    id={`pending-tab-${id}`}
                    aria-selected={on}
                    aria-controls={`pending-panel-${id}`}
                    tabIndex={on ? 0 : -1}
                    data-testid={`pending-seg-${id}`}
                    data-selected={on ? '1' : '0'}
                    className={`btn-press focus-ring min-h-10 rounded-full px-3 py-1.5 text-[12px] font-semibold tabular-nums ${
                      on
                        ? 'bg-slate-800 text-white'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                    onClick={() => setSeg(id)}
                  >
                    {label}
                    <span
                      className={`ml-1 ${on ? 'text-white/80' : 'text-slate-400'}`}
                    >
                      {n}
                    </span>
                  </button>
                )
              })}
            </div>

            <div
              role="tabpanel"
              id={`pending-panel-${seg}`}
              aria-labelledby={`pending-tab-${seg}`}
              data-testid={`pending-panel-${seg}`}
            >
              {segRows.length === 0 ? (
                <EmptyBlock title={emptyCopy} />
              ) : (
                <div className="mt-5 space-y-4">
                  {groupedBoard.map(([deptKey, rows]) => {
                    const first = rows[0]!
                    const dept = orgDeptById(first.deptId)
                    const dName = dept ? deptLabel(dept) : deptKey
                    return (
                      <section key={deptKey}>
                        <h2 className="mb-1.5 text-[11px] font-semibold text-slate-500">
                          {dName}
                        </h2>
                        <ul className="space-y-2" data-testid={`pending-seg-list-${seg}`}>
                          {rows.map((item) => {
                            const confirmId =
                              item.kind === 'A' && item.id.startsWith('a-')
                                ? item.id.slice(2)
                                : item.id
                            const confirm =
                              item.kind === 'A' ? getConfirm(confirmId) : undefined
                            const enrich = confirm
                              ? enrichConfirmForCockpit(confirm)
                              : null
                            return (
                              <li key={item.id}>
                                <div
                                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                                  data-testid={
                                    item.kind === 'A'
                                      ? `pending-row-${confirmId}`
                                      : `pending-todo-row-${item.id}`
                                  }
                                  data-boss-cockpit-row={
                                    item.kind === 'A' ? confirmId : item.id
                                  }
                                  data-kind={item.kind}
                                  data-dept={item.deptSlug}
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                                      <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                          item.kind === 'A'
                                            ? 'bg-amber-100 text-amber-950'
                                            : item.kind === 'B'
                                              ? item.overdue
                                                ? 'bg-rose-100 text-rose-950'
                                                : 'bg-orange-100 text-orange-950'
                                              : 'bg-slate-100 text-slate-800'
                                        }`}
                                      >
                                        {item.kind === 'A'
                                          ? '要你拍'
                                          : item.kind === 'B'
                                            ? item.overdue
                                              ? '已逾期'
                                              : '期限催办'
                                            : '进行中'}
                                      </span>
                                      <div className="text-sm font-semibold text-slate-900">
                                        {item.reason}
                                      </div>
                                    </div>
                                    {enrich?.waitLabel ? (
                                      <span
                                        className="shrink-0 text-[10px] tabular-nums text-slate-400"
                                        data-testid={`boss-wait-${confirmId}`}
                                      >
                                        {enrich.waitLabel}
                                      </span>
                                    ) : null}
                                  </div>
                                  {enrich ? (
                                    <div className="mt-1.5 space-y-0.5 text-[11px] leading-snug text-slate-600">
                                      <p>方案：{enrich.planLine}</p>
                                      <details className="text-slate-500">
                                        <summary className="cursor-pointer select-none text-[10px] font-medium text-slate-500">
                                          依据与建议
                                        </summary>
                                        <p className="mt-0.5">依据：{enrich.evidenceLine}</p>
                                        <p className="mt-0.5">专家：{enrich.assistLine}</p>
                                      </details>
                                    </div>
                                  ) : null}
                                  {(() => {
                                    const facts = pendingCardFacts({
                                      kind: confirm?.kind ?? (item.kind === 'B' ? 'oa_strategy' : undefined),
                                      createdAt: confirm?.createdAt,
                                      resultPreview: confirm?.resultPreview || item.reason,
                                    })
                                    const factId = item.kind === 'A' ? confirmId : item.id
                                    return (
                                      <div className="mt-2 space-y-0.5 text-[11px] text-slate-600" data-testid={`pending-live-${factId}`}>
                                        <p data-testid={`pending-stage-${factId}`}>阶段 · {facts.stage}</p>
                                        <p className="tabular-nums" data-testid={`pending-elapsed-${factId}`}>
                                          已进行 {facts.elapsed}
                                        </p>
                                        <p className="line-clamp-2 text-slate-500" data-testid={`pending-artifact-${factId}`}>
                                          {facts.artifactPreview}
                                        </p>
                                      </div>
                                    )
                                  })()}
                                  <p className="mt-1 text-[11px] tabular-nums text-slate-400">
                                    {[
                                      dName,
                                      item.caseTitle,
                                      isBusinessSeedCaseId(item.caseId) ? '演示案件' : null,
                                      item.dueAt
                                        ? `${item.dueAt}${item.demo ? ' · 样机日' : ''}`
                                        : null,
                                    ]
                                      .filter(Boolean)
                                      .join(' · ')}
                                  </p>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <Link
                                      to={item.href}
                                      className="btn-press focus-ring inline-flex min-h-10 items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-[12px] font-semibold text-white hover:bg-slate-800"
                                      data-testid={
                                        item.kind === 'A'
                                          ? `pending-cta-confirm-${confirmId}`
                                          : `pending-todo-cta-${item.id}`
                                      }
                                    >
                                        {item.kind === 'A' ? '查看并拍板' : '去处理'}
                                    </Link>
                                    {item.kind === 'A' ? (
                                      <Link
                                        to="/agent"
                                        className="btn-press focus-ring inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
                                        data-testid={`pending-cta-later-${confirmId}`}
                                      >
                                        稍后
                                      </Link>
                                    ) : null}
                                  </div>
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      </section>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        ) : null}

        {view === 'transit' ? (
          <div className="mt-5" data-testid="boss-cockpit-transit">
            {transitRows.length === 0 ? (
              <EmptyBlock title="暂无进行中、待确认或退回的部门事项。" />
            ) : (
              <ul className="space-y-2">
                {transitRows.map((row) => (
                  <li key={row.key}>
                    <Link
                      to={row.href}
                      className="btn-press focus-ring block rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-slate-300"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-800">
                          {row.h3}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          {row.deptLabel}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {row.caseTitle}{row.demo ? ' · 演示案件' : ''} · 负责人：{row.owner}
                      </p>
                      <p className="mt-2 text-sm text-slate-800">正在办理：{row.task}</p>
                      <p className="mt-1 text-xs text-slate-600">关注事项：{row.gap}</p>
                      <p className="mt-1 text-xs font-medium text-slate-700">下一步：{row.next}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {view === 'delivered' ? (
          <div className="mt-5" data-testid="boss-cockpit-delivered">
            <p className="mb-3 text-xs text-slate-500">查看你确认过的阶段成果、当时版本及决策依据。退回记录保留在案卷判断档案中。</p>
            {judgments.length === 0 ? (
              <EmptyBlock title="尚无已确认的阶段成果。确认专家汇报后，可在这里回查。" />
            ) : (
              <ul className="space-y-3">
                {judgments.map((j) => {
                  const c = getCase(j.caseId)
                  const d = j.kind ? orgDeptByLeadSeat(CONFIRM_META[j.kind].seatId) : undefined
                  const base = d ? `/agent/cases/${j.caseId}/depts/${deptSlug(d.id)}` : `/agent/cases/${j.caseId}`
                  return (
                    <li key={j.id} className="rounded-xl border border-slate-200 bg-white p-4" data-testid={`boss-delivered-${j.id}`}>
                      <p className="text-xs text-slate-500">{c?.title ?? j.caseId} · {j.at}</p>
                      <h2 className="mt-1 text-sm font-semibold text-slate-900">{j.gate} · 阶段成果已确认</h2>
                      <p className="mt-2 text-sm text-slate-700">{j.conclusion}</p>
                      <p className="mt-2 text-xs text-slate-600">你的决定：{j.option} · {j.reason}</p>
                      <details className="mt-3 text-xs text-slate-600">
                        <summary className="cursor-pointer font-medium">查看确认版本与依据</summary>
                        <p className="mt-2">{j.artifactSnapshot ? `确认快照 · 第 ${j.artifactSnapshot.version} 版 · ${j.artifactSnapshot.savedAt}` : '历史记录未保存成果快照，可进入部门查看当前成果。'}</p>
                        {j.artifactSnapshot ? <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-sans">{j.artifactSnapshot.markdown}</pre> : null}
                        <p className="mt-2">来源：{j.source || '当时未记录来源'}</p>
                        <p className="mt-1">对比：{j.compare || '当时未记录对比'}</p>
                        <p className="mt-1">依据记录：{j.evidenceAnchor || '未记录'} · 资料仍待实际核验</p>
                      </details>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-slate-800">
                        <Link className="focus-ring rounded underline" to={base}>查看当前成果</Link>
                        <Link className="focus-ring rounded underline" to={`${base}?file=1&fileTab=判断档案&judgment=${encodeURIComponent(j.id)}`}>查看这次决策</Link>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ) : null}

        <div
          className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-3 py-2 text-center"
          data-testid="boss-cockpit-kpi-note"
        >
          <p className="text-[10px] font-semibold text-slate-500">
            前台 KPI（样机示意 · 非真统计）
          </p>
          <p className="mt-1 text-[11px] tabular-nums text-slate-600">
            分诊准确率 — · 引导完成率 — · 绕过率 —
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400">
            试点数据尚未接入
          </p>
        </div>
        </div>
        <div className="min-h-[24rem] lg:sticky lg:top-0 lg:min-h-0 lg:self-start">
          <CompanyActivityFeed />
        </div>
      </div>
    </div>
  )
}

function EmptyBlock({ title }: { title: string }) {
  return (
    <div
      className="mt-8 rounded-xl border border-slate-200 bg-white px-5 py-10 text-center"
      data-testid="pending-empty"
    >
      <p className="text-sm text-slate-600">{title}</p>
      <Link
        to="/agent"
        className="btn-press focus-ring mt-4 inline-flex rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700"
      >
        回大厅
      </Link>
    </div>
  )
}
