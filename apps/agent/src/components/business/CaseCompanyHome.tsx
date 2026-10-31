import { Link } from 'react-router-dom'
import { ArrowRight, Bell, ChevronDown, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
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

type Props = {
  caseId: string
  title: string
  summary?: string
}

/**
 * 公司首页 · product-pages §4.3 / vision §6.3a
 * 定位句 + 八部等宽卡片网格（当前高亮；卡底≤3专家照片头像）+ 点部右侧抽屉（≤3专家+头像、交卷态一句、去该部干活）
 * + 页级主 CTA「去当前部门」；浅色壳；右侧禁假指标/执行集群/工具引擎
 */
export function CaseCompanyHome({ caseId, title, summary }: Props) {
  const { getProgress, getPendingConfirms, cases } = useBusinessCases()
  const { deptLabel } = useOrgConfig()
  const [moreOpen, setMoreOpen] = useState(false)
  const [drawerDeptId, setDrawerDeptId] = useState<OrgDeptId | null>(null)
  const prog = getProgress(caseId)
  const pending = getPendingConfirms(caseId)

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

  const rollups = useMemo(
    () =>
      rollupByDept({
        cases,
        getProgress,
        pending: getPendingConfirms(),
      }),
    [cases, getProgress, getPendingConfirms],
  )

  const moreDepts: OrgDept[] = useMemo(() => {
    const mainIds = new Set(MAIN_CHAIN_DEPTS.map((d) => d.id))
    return [...PRE_DEPTS, ...POST_DEPTS_LIST].filter((d) => !mainIds.has(d.id))
  }, [])

  const drawerDept = useMemo(
    () =>
      drawerDeptId
        ? MAIN_CHAIN_DEPTS.find((d) => d.id === drawerDeptId) ?? null
        : null,
    [drawerDeptId],
  )

  const openDrawer = (id: OrgDeptId) => setDrawerDeptId(id)
  const closeDrawer = () => setDrawerDeptId(null)

  return (
    <div
      className="mx-auto flex w-full max-w-5xl flex-col gap-5"
      data-testid="case-company-home"
      data-case-id={caseId}
    >
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p
            className="text-[13px] font-medium text-slate-800"
            data-testid="company-tagline"
          >
            一案一家 Novada Team
          </p>
          <span
            className="font-mono text-[11px] text-slate-400"
            data-testid="company-case-id"
          >
            {caseId}
          </span>
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
          案况总览。点某部开抽屉；主按钮去当前部门——拍板在工作台右栏。
        </p>
        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <h2 className="text-[16px] font-semibold text-slate-900">{title}</h2>
          {summary ? (
            <span className="text-[12px] text-slate-500">{summary}</span>
          ) : null}
        </div>
        <p className="mt-2 text-[12px] text-slate-600">
          当前部门：
          <span className="font-semibold text-slate-900">
            {deptLabel(currentDept)}
          </span>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to={currentHref}
            className="btn-press focus-ring inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
            data-testid="company-go-current-dept"
          >
            去当前部门
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <Link
            to={
              pending[0]
                ? workbenchAskPath(caseId, pending[0].kind, {
                    confirmId: pending[0].id,
                  })
                : currentHref
            }
            className="btn-press focus-ring inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-950"
            data-testid="company-pending-link"
          >
            <Bell className="h-3.5 w-3.5" aria-hidden />
            待确认{pending.length > 0 ? ` · ${pending.length}` : ''}
          </Link>
          <Link
            to={`/agent/cases/${caseId}/depts/disclosure?docket=1`}
            className="btn-press focus-ring inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
            data-testid="company-link-case-file"
          >
            案卷
          </Link>
          <Link
            to={`/agent/cases/${caseId}/docket`}
            className="btn-press focus-ring inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
            data-testid="company-link-docket"
          >
            近期限
          </Link>
        </div>
        <p
          className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400"
          data-testid="company-logistics-links"
        >
          <span>后勤</span>
          <Link
            to={`/agent/cases/${caseId}/billing`}
            className="focus-ring rounded-sm underline-offset-2 hover:text-slate-600 hover:underline"
            data-testid="company-link-billing"
          >
            账单
          </Link>
          <Link
            to={`/agent/cases/${caseId}/members`}
            className="focus-ring rounded-sm underline-offset-2 hover:text-slate-600 hover:underline"
            data-testid="company-link-members"
          >
            成员
          </Link>
        </p>
      </section>

      <section aria-labelledby="eight-dept-map-title">
        <div className="mb-2 flex items-baseline gap-2">
          <h3
            id="eight-dept-map-title"
            className="text-[13px] font-semibold text-slate-900"
          >
            主链部门
          </h3>
          <span className="text-[11px] text-slate-500">
            ①立项 → ②激发 → ③挖掘 → ④交底 → ⑤申请 → ⑥答复 → ⑦维护 → ⑧复盘
          </span>
        </div>
        <ol
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
          data-testid="eight-dept-map"
        >
          {MAIN_CHAIN_DEPTS.map((dept, i) => {
            const st = deptStatus({
              dept,
              progress: prog,
              pending,
              confirmKind: confirmKindOf(dept),
            })
            const active = dept.id === currentDept.id
            const selected = drawerDeptId === dept.id
            const roll = rollups[dept.id]
            return (
              <li key={dept.id} className="min-w-0">
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
          })}
        </ol>
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
          更多部门
          <span className="font-normal text-slate-400">
            （布局 / 前研 / 授权后，默认折叠）
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
