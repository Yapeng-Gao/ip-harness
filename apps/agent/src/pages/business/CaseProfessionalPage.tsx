import { Link, useParams } from 'react-router-dom'
import { SoftEmpty } from '../../components/soft/SoftEmpty'
import { useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { HALL_DEPT_DOORS } from '../../business/hallDepts'
import {
  MAIN_CHAIN_DEPTS,
  deptSlug,
  orgDeptById,
  type OrgDept,
} from '../../departments/orgDepts'
import {
  confirmKindOf,
  deptStatus,
  type DeptStatus,
} from '../../departments/deptProgress'
import { useOrgConfig } from '../../departments/OrgConfigContext'
import {
  readExtraSeats,
  removeExtraSeat,
  rosterSeats,
  sortProfessionalCards,
  thickenStatus,
  writeExtraSeat,
  type ExtraSeat,
  type ThickStatus,
} from '../../business/professionalThicken'
import {
  PROF_AUX_HONEST,
  SIDE_AUX_DEPTS,
  auxBundleFor,
  methodLabelFromSkill,
  type AuxHook,
  type ManuscriptPart,
} from '../../business/professionalAuxParts'
import { partWorkbenchHref } from '../../business/auxPartBodyLink'
import {
  auxHookToSideTarget,
  sideAuxWorkbenchHref,
} from '../../business/sideAuxBodyLink'

/**
 * 本案部门（案级专业面）· 只回答三件事：谁能接 / 谁在办 / 哪有缺口 → 进部台。
 * 公司级编制（部门管理）在 /agent/departments；本页不交卷、不拍板。
 */

type CardRow = {
  door: (typeof HALL_DEPT_DOORS)[number]
  dept: OrgDept
  st: DeptStatus
  line: ThickStatus
  seats: ReturnType<typeof rosterSeats>
  extras: ExtraSeat[]
  href: string
  skillNames: string[]
  parts: ManuscriptPart[]
  auxHooks: AuxHook[]
}

function statusTone(kind: ThickStatus['kind']) {
  if (kind === 'gap') return 'text-amber-900'
  if (kind === 'work') return 'text-sky-900'
  return 'text-slate-500'
}

function statusPill(kind: ThickStatus['kind']) {
  if (kind === 'gap')
    return 'bg-amber-100 text-amber-950'
  if (kind === 'work')
    return 'bg-sky-100 text-sky-950'
  return 'bg-slate-100 text-slate-600'
}

function statusWord(kind: ThickStatus['kind']) {
  if (kind === 'gap') return '缺口'
  if (kind === 'work') return '在办'
  return '未到站'
}

export function CaseProfessionalPage() {
  const { caseId = '' } = useParams()
  const { getCase, getProgress, getPendingConfirms } = useBusinessCases()
  const { deptLabel, getExpertConfig } = useOrgConfig()
  const c = getCase(caseId)
  const home = `/agent/cases/${caseId}`
  const prog = getProgress(caseId)
  const pending = getPendingConfirms(caseId)
  const [extraTick, setExtraTick] = useState(0)
  const [addingFor, setAddingFor] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')

  const cards = useMemo(() => {
    void extraTick
    const raw: CardRow[] = HALL_DEPT_DOORS.map((door) => {
      const dept =
        orgDeptById(door.deptId) ??
        MAIN_CHAIN_DEPTS.find((d) => d.id === door.deptId)
      if (!dept) return null
      const st = deptStatus({
        dept,
        progress: prog,
        pending,
        confirmKind: confirmKindOf(dept),
      })
      const line = thickenStatus(st, dept, prog)
      const cfg = getExpertConfig(dept.leadSeatId)
      const skillNames = cfg.skills
        .filter((s) => s.enabled)
        .slice(0, 3)
        .map((s) => methodLabelFromSkill(s.name))
      const bundle = auxBundleFor(dept.id)
      return {
        door,
        dept,
        st,
        line,
        seats: rosterSeats(dept),
        extras: readExtraSeats(caseId, dept.id),
        href: `${home}/depts/${deptSlug(dept.id)}`,
        skillNames,
        parts: bundle.parts,
        auxHooks: bundle.aux,
      }
    }).filter(Boolean) as CardRow[]
    return sortProfessionalCards(raw)
  }, [prog, pending, home, caseId, getExpertConfig, extraTick])

  const active = useMemo(
    () => cards.filter((x) => x.line.kind === 'gap' || x.line.kind === 'work'),
    [cards],
  )
  const idle = useMemo(
    () => cards.filter((x) => x.line.kind === 'idle'),
    [cards],
  )
  const summary = useMemo(
    () => ({
      gap: cards.filter((x) => x.line.kind === 'gap').length,
      work: cards.filter((x) => x.line.kind === 'work').length,
      idle: idle.length,
    }),
    [cards, idle.length],
  )

  if (!c) {
    return (
      <div
        className="flex flex-1 items-center justify-center p-8"
        data-testid="case-professional-page"
        data-empty-tone="office"
      >
        <SoftEmpty
          kind="professional-missing"
          testId="case-professional-empty"
          className="max-w-sm bg-white"
          action={
            <Link
              to="/agent/cases"
              className="text-sm font-medium text-slate-900 underline underline-offset-2"
            >
              返回案盘
            </Link>
          }
        />
      </div>
    )
  }

  const commitExtra = (deptId: string) => {
    writeExtraSeat(caseId, deptId, draftName)
    setDraftName('')
    setAddingFor(null)
    setExtraTick((n) => n + 1)
  }

  const renderDeptRow = (row: CardRow, mode: 'active' | 'idle') => {
    const { door, dept, line, seats, extras, href, skillNames, parts, auxHooks } =
      row

    return (
      <li
        key={dept.id}
        className={`rounded-lg border bg-white px-4 py-3 ${
          line.kind === 'gap'
            ? 'border-amber-200'
            : line.kind === 'work'
              ? 'border-sky-200'
              : 'border-slate-200'
        }`}
        data-testid={
          mode === 'idle'
            ? `case-professional-card-idle-${door.slug}`
            : `case-professional-card-${door.slug}`
        }
        data-dept-status={line.kind}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                className="text-[15px] font-semibold text-slate-900"
                id={`case-pro-dept-${door.slug}`}
              >
                {deptLabel(dept)}
              </h2>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusPill(line.kind)}`}
              >
                {statusWord(line.kind)}
              </span>
            </div>
            <p
              className={`mt-1 text-[13px] font-medium ${statusTone(line.kind)}`}
              data-testid={`case-professional-status-${door.slug}`}
              aria-labelledby={`case-pro-dept-${door.slug}`}
            >
              {line.text}
            </p>
            {line.detail ? (
              <p
                className="mt-0.5 text-[12px] text-slate-500"
                data-testid={`case-professional-status-detail-${door.slug}`}
              >
                {line.detail}
              </p>
            ) : null}
            <p className="mt-2 text-[11px] text-slate-400">谁能接</p>
            <div
              className="mt-1 flex flex-wrap gap-1"
              data-testid={`case-professional-roster-${door.slug}`}
              data-roster="chips-only"
            >
              {seats.map((s) => (
                <span
                  key={s.id}
                  title={s.invited ? s.label : `${s.label} · 未请来`}
                  className={`inline-flex h-7 max-w-[6.5rem] items-center gap-1 rounded-full border pl-0.5 pr-1.5 text-[10px] font-medium ${
                    s.invited
                      ? 'border-slate-200 bg-slate-50 text-slate-700'
                      : 'border-dashed border-slate-300 bg-white text-slate-400'
                  }`}
                  data-invited={s.invited ? '1' : '0'}
                >
                  <span
                    className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${
                      s.invited
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                    aria-hidden
                  >
                    {s.initial}
                  </span>
                  <span className="truncate">
                    {s.invited ? s.label : `未请来 · ${s.label}`}
                  </span>
                </span>
              ))}
            </div>
            <span className="sr-only" data-testid="case-professional-seats">
              {seats.map((s) => s.label).join(' · ')}
            </span>
          </div>
          <Link
            to={href}
            className={`btn-press focus-ring inline-flex min-h-10 shrink-0 items-center rounded-md px-3 py-2 text-[12px] font-semibold ${
              mode === 'active'
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
            }`}
            data-testid={
              mode === 'active'
                ? `case-professional-start-${door.slug}`
                : `case-professional-enter-${door.slug}`
            }
            data-start-semantic="dept-workbench"
          >
            {mode === 'active' ? '进部台干活' : '进部台'}
          </Link>
        </div>

        {mode === 'active' ? (
          <details
            className="mt-3 border-t border-slate-100 pt-2"
            data-testid="case-professional-card-fold"
          >
            <summary className="cursor-pointer select-none text-[11px] font-medium text-slate-500">
              备忘岗 · 本稿 · 辅链（收折）
            </summary>
            <div className="mt-2 flex flex-wrap items-center gap-1">
              {extras.map((e) => (
                <span
                  key={e.id}
                  className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-slate-300 bg-slate-50 pl-1.5 pr-0.5 text-[10px] font-medium text-slate-600"
                  data-testid="case-professional-extra-seat"
                  title="案内备忘 · 非正式编制"
                >
                  备忘 · {e.name}
                  <button
                    type="button"
                    className="btn-press focus-ring hit-expand inline-flex min-h-10 min-w-10 items-center justify-center rounded-full text-slate-500 hover:text-slate-800"
                    aria-label={`移除备忘 ${e.name}`}
                    onClick={() => {
                      removeExtraSeat(caseId, dept.id, e.id)
                      setExtraTick((n) => n + 1)
                    }}
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </span>
              ))}
              {addingFor === dept.id ? (
                <span className="inline-flex items-center gap-1">
                  <label className="sr-only" htmlFor={`case-pro-add-${dept.id}`}>
                    案内备忘岗名
                  </label>
                  <input
                    id={`case-pro-add-${dept.id}`}
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder="备忘岗名"
                    autoComplete="off"
                    name="seat-title"
                    className="focus-ring h-10 w-24 rounded border border-slate-200 px-2 text-[12px]"
                    data-testid="case-professional-add-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        commitExtra(dept.id)
                      }
                      if (e.key === 'Escape') {
                        setAddingFor(null)
                        setDraftName('')
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-press focus-ring inline-flex min-h-10 items-center rounded-md bg-slate-900 px-2.5 text-[11px] font-semibold text-white"
                    data-testid="case-professional-add-confirm"
                    onClick={() => commitExtra(dept.id)}
                  >
                    加
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  className="btn-press focus-ring inline-flex min-h-10 items-center gap-0.5 rounded-full border border-dashed border-slate-300 px-2.5 text-[11px] font-medium text-slate-500 hover:border-slate-400 hover:text-slate-800"
                  data-testid={`case-professional-add-${door.slug}`}
                  onClick={() => {
                    setAddingFor(dept.id)
                    setDraftName('')
                  }}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  加备忘岗
                </button>
              )}
            </div>

            <div className="mt-2" data-testid="case-professional-parts">
              <p className="text-[10px] font-semibold text-slate-400">本稿章节</p>
              <ul className="mt-1 space-y-0.5">
                {parts.map((part) => (
                  <li
                    key={part.id}
                    className="flex items-baseline gap-1.5 text-[11px] text-slate-700"
                  >
                    <Link
                      to={partWorkbenchHref({
                        caseId,
                        deptId: dept.id,
                        partId: part.id,
                      })}
                      className="btn-press focus-ring inline-flex min-h-10 items-center font-medium text-slate-800 underline-offset-2 hover:underline"
                      data-testid={`case-professional-part-${part.id}`}
                      title="打开工作台中栏"
                    >
                      {part.label}
                    </Link>
                    <span className="truncate text-[10px] text-slate-400">
                      {part.hint}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {auxHooks.length > 0 ? (
              <ul
                className="mt-2 flex flex-wrap gap-1"
                data-testid="case-professional-aux-hooks"
                aria-label="辅助材料"
              >
                {auxHooks.map((a) => {
                  const target = auxHookToSideTarget(a.id)
                  const chipClass =
                    'btn-press focus-ring inline-flex min-h-10 items-center rounded-full border border-dashed border-violet-200 bg-violet-50/70 px-2.5 text-[11px] font-medium text-violet-900'
                  return (
                    <li key={a.id}>
                      {target ? (
                        <Link
                          to={sideAuxWorkbenchHref({
                            caseId,
                            sideId: target.sideId,
                            partId: target.partId,
                          })}
                          className={chipClass}
                          title={a.relation}
                          data-testid={`case-professional-aux-${a.id}`}
                        >
                          辅 · {a.label}
                        </Link>
                      ) : (
                        <span
                          className={chipClass}
                          title={a.relation}
                          data-testid={`case-professional-aux-${a.id}`}
                        >
                          辅 · {a.label}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            ) : null}

            {skillNames.length > 0 ? (
              <ul
                className="mt-2 flex flex-wrap gap-1"
                data-testid="case-professional-skill-chips"
                aria-label="能力挂接示意"
              >
                {skillNames.map((n) => (
                  <li
                    key={n}
                    className="rounded bg-slate-50 px-1.5 py-px text-[9px] text-slate-500 ring-1 ring-slate-100"
                  >
                    {n}
                  </li>
                ))}
              </ul>
            ) : null}
          </details>
        ) : null}
      </li>
    )
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="case-professional-page"
      data-professional="roster-clarify-v2"
      data-case-id={caseId}
    >
      <div className="mx-auto max-w-2xl">
        <nav
          className="mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500"
          aria-label="本案部门次要入口"
          data-testid="case-professional-secondary"
        >
          <Link
            to={home}
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="case-professional-back-home"
          >
            本案
          </Link>
          <span aria-hidden className="text-slate-300">
            ·
          </span>
          <Link
            to="/agent/departments"
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="case-professional-to-departments"
          >
            部门管理
          </Link>
        </nav>

        <h1
          className="text-balance text-[20px] font-semibold text-slate-900"
          data-testid="case-professional-heading"
        >
          本案部门
        </h1>
        <p
          className="mt-1 text-[14px] leading-snug text-slate-600"
          data-testid="case-professional-promise"
        >
          本案各部门：谁能接活、谁在办、哪有缺口。点部门进部台干活——本页不交卷、不拍板。
        </p>
        <p
          className="mt-1 text-[12px] text-slate-400"
          data-testid="case-professional-hint"
          role="status"
        >
          {c.title}
        </p>

        <div
          className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-slate-100 pb-3"
          data-testid="case-professional-summary"
          aria-label="在办与缺口汇总"
        >
          <span className="text-[13px] font-semibold text-slate-800">要处理</span>
          <span
            className="text-[13px] font-semibold tabular-nums text-amber-900"
            data-testid="case-professional-summary-gap"
          >
            缺口 {summary.gap}
          </span>
          <span
            className="text-[13px] font-semibold tabular-nums text-sky-900"
            data-testid="case-professional-summary-work"
          >
            在办 {summary.work}
          </span>
          <span
            className="ml-auto text-[12px] tabular-nums text-slate-400"
            data-testid="case-professional-summary-idle"
          >
            未到站 {summary.idle}
          </span>
        </div>

        {active.length > 0 ? (
          <ul
            className="mt-4 space-y-2.5"
            data-testid="case-professional-cards"
            aria-label="要处理的部门"
          >
            {active.map((row) => renderDeptRow(row, 'active'))}
          </ul>
        ) : (
          <p
            className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-3 py-3 text-[13px] text-slate-600"
            data-testid="case-professional-primary-empty"
          >
            暂无缺口或在办。可从下方「未到站」进部台查看，或回公司案首页看卡点。
          </p>
        )}

        {idle.length > 0 ? (
          <details
            className="mt-5"
            data-testid="case-professional-idle-fold"
          >
            <summary
              className="cursor-pointer select-none text-[13px] font-medium text-slate-600"
              data-testid="case-professional-idle-summary"
            >
              未到站 · {idle.length}（默折）
            </summary>
            <ul
              className="mt-3 space-y-2"
              data-testid="case-professional-idle-cards"
            >
              {idle.map((row) => renderDeptRow(row, 'idle'))}
            </ul>
          </details>
        ) : null}

        <details
          className="mt-6 border-t border-slate-100 pt-4"
          data-testid="case-professional-skills-fold"
          data-aux-parts="1"
        >
          <summary
            className="cursor-pointer text-[12px] font-medium text-slate-500"
            data-testid="case-professional-aux-summary"
          >
            辅链（查新 / 附图 / 递交）· 不占八部大门
          </summary>
          <p
            className="mt-2 text-[11px] text-slate-500"
            data-testid="case-professional-aux-honest"
          >
            {PROF_AUX_HONEST}
          </p>
          <p
            className="mt-1 text-[10px] text-slate-400"
            data-testid="case-professional-honest"
          >
            样机示意材料，点开进部台中栏。
          </p>
          <ul
            className="mt-3 grid gap-2 sm:grid-cols-3"
            data-testid="case-professional-side-aux"
          >
            {SIDE_AUX_DEPTS.map((d) => (
              <li
                key={d.id}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-2"
                data-testid={`case-professional-side-aux-${d.id}`}
              >
                <p className="text-[11px] font-semibold text-slate-800">{d.label}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">{d.honest}</p>
                <ul className="mt-1.5 space-y-0.5">
                  {d.parts.map((part) => (
                    <li
                      key={part.id}
                      className="text-[11px] text-slate-700"
                      data-testid={`case-professional-side-part-${part.id}`}
                    >
                      <Link
                        to={sideAuxWorkbenchHref({
                          caseId,
                          sideId: d.id,
                          partId: part.id,
                        })}
                        className="font-medium text-slate-800 underline-offset-2 hover:underline"
                        data-testid={`case-professional-side-part-link-${part.id}`}
                      >
                        {part.label}
                      </Link>
                      <span className="text-slate-400"> · {part.hint}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </details>

        <div className="mt-6">
          <Link
            to={home}
            className="btn-press focus-ring inline-flex min-h-10 items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-700"
            data-testid="case-professional-to-company"
          >
            回公司案首页
          </Link>
        </div>
      </div>
    </div>
  )
}
