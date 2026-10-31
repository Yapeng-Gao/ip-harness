import { Link, useParams } from 'react-router-dom'
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

/**
 * 专业/编制 · product-pages §4.3a · vision 选部开工
 * 机制：案级能力面——汇总 + 八部卡（编制/在办缺口/本稿零件/辅链挂件）+ 收折进阶辅链零件。
 * 禁：本页改交卷；第一屏技能墙；假编制无案；假官报；抢公司缺口主 CTA。
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

  const summary = useMemo(() => {
    const gap = cards.filter((x) => x.line.kind === 'gap').length
    const work = cards.filter((x) => x.line.kind === 'work').length
    const idle = cards.length - gap - work
    return { gap, work, idle }
  }, [cards])

  if (!c) {
    return (
      <div
        className="flex flex-1 items-center justify-center p-8"
        data-testid="case-professional-page"
      >
        <div className="text-center">
          <p className="text-sm text-slate-600">找不到这个案子</p>
          <p className="mt-1 text-[12px] text-slate-500">
            专业须带案 · 请先开案子或从案盘进入
          </p>
          <Link
            to="/agent/cases"
            className="mt-3 inline-block text-sm font-medium text-slate-900 underline"
          >
            返回案盘
          </Link>
        </div>
      </div>
    )
  }

  const commitExtra = (deptId: string) => {
    writeExtraSeat(caseId, deptId, draftName)
    setDraftName('')
    setAddingFor(null)
    setExtraTick((n) => n + 1)
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="case-professional-page"
      data-professional="aux-parts-v1"
      data-case-id={caseId}
    >
      <div className="mx-auto max-w-3xl">
        <nav
          className="mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500"
          aria-label="专业次要入口"
          data-testid="case-professional-secondary"
        >
          <Link
            to="/agent"
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="case-professional-back-hall"
          >
            回大厅
          </Link>
          <span aria-hidden className="text-slate-300">
            ·
          </span>
          <Link
            to={home}
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="case-professional-back-home"
          >
            公司案首页
          </Link>
          <span aria-hidden className="text-slate-300">
            ·
          </span>
          <Link
            to="/agent/departments"
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="case-professional-to-global"
          >
            全库编制旁路
          </Link>
        </nav>

        <p
          className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600"
          data-testid="case-professional-hint"
          role="status"
        >
          案级能力面 · 选部接稿 · 编制/在办/缺口/本稿零件可看 · 辅链零件默认收折 ·
          本页不改交卷 · 非第三套产品 · 样机示意非官报
        </p>

        <h1
          className="mt-3 text-[20px] font-semibold text-slate-900"
          data-testid="case-professional-heading"
        >
          专业能力 / 编制
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {c.title} · 谁能接、谁在办、哪有缺口 · 点开工进工作台
        </p>

        {/* 汇总条 · 做满密度 */}
        <div
          className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
          data-testid="case-professional-summary"
          aria-label="在办与缺口汇总"
        >
          <span className="text-[11px] font-semibold text-slate-700">本案编制面</span>
          <span
            className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900"
            data-testid="case-professional-summary-gap"
          >
            缺口 {summary.gap}
          </span>
          <span
            className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-900"
            data-testid="case-professional-summary-work"
          >
            在办 {summary.work}
          </span>
          <span
            className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
            data-testid="case-professional-summary-idle"
          >
            其余 {summary.idle}
          </span>
          <span className="ml-auto text-[10px] text-slate-400">
            缺口优先排上 · 墨色主 CTA 仍在公司
          </span>
        </div>

        <ul
          className="mt-4 grid gap-3 sm:grid-cols-2"
          data-testid="case-professional-cards"
        >
          {cards.map(({ door, dept, line, seats, extras, href, skillNames, parts, auxHooks }) => (
            <li
              key={dept.id}
              className={`flex flex-col rounded-xl border bg-white p-3.5 shadow-sm ${
                line.kind === 'gap'
                  ? 'border-amber-200'
                  : line.kind === 'work'
                    ? 'border-sky-200'
                    : 'border-slate-200'
              }`}
              data-testid={`case-professional-card-${door.slug}`}
              data-dept-status={line.kind}
            >
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11px] text-slate-400">{door.num}</span>
                <h2 className="text-[14px] font-semibold text-slate-900">
                  {deptLabel(dept)}
                </h2>
              </div>
              <p
                className="mt-1 text-[11px] leading-relaxed text-slate-600"
                data-testid="case-professional-blurb"
              >
                {dept.blurb || door.desc}
              </p>

              {/* 编制头像条 */}
              <div
                className="mt-2.5 flex flex-wrap items-center gap-1"
                data-testid="case-professional-roster"
              >
                {seats.map((s) => (
                  <span
                    key={s.id}
                    title={s.label}
                    className="inline-flex h-6 max-w-[5.5rem] items-center gap-1 rounded-full border border-slate-200 bg-slate-50 pl-0.5 pr-1.5 text-[10px] font-medium text-slate-700"
                  >
                    <span
                      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[9px] font-semibold text-white"
                      aria-hidden
                    >
                      {s.initial}
                    </span>
                    <span className="truncate">{s.label}</span>
                  </span>
                ))}
                {extras.map((e) => (
                  <span
                    key={e.id}
                    className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-emerald-300 bg-emerald-50 pl-1.5 pr-0.5 text-[10px] font-medium text-emerald-900"
                    data-testid="case-professional-extra-seat"
                  >
                    {e.name}
                    <button
                      type="button"
                      className="focus-ring rounded-full p-0.5 text-emerald-700 hover:text-emerald-950"
                      aria-label={`移除 ${e.name}`}
                      onClick={() => {
                        removeExtraSeat(caseId, dept.id, e.id)
                        setExtraTick((n) => n + 1)
                      }}
                    >
                      <X className="h-3 w-3" aria-hidden />
                    </button>
                  </span>
                ))}
                {addingFor === dept.id ? (
                  <span className="inline-flex items-center gap-1">
                    <input
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder="岗名"
                      className="focus-ring h-6 w-20 rounded border border-slate-200 px-1.5 text-[10px]"
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
                      className="btn-press focus-ring rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold text-white"
                      data-testid="case-professional-add-confirm"
                      onClick={() => commitExtra(dept.id)}
                    >
                      加
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="btn-press focus-ring inline-flex h-6 items-center gap-0.5 rounded-full border border-dashed border-slate-300 px-1.5 text-[10px] font-medium text-slate-500 hover:border-slate-400 hover:text-slate-800"
                    data-testid={`case-professional-add-${door.slug}`}
                    onClick={() => {
                      setAddingFor(dept.id)
                      setDraftName('')
                    }}
                  >
                    <Plus className="h-3 w-3" aria-hidden />
                    添加专家
                  </button>
                )}
              </div>
              <p
                className="mt-1 text-[10px] text-slate-400"
                data-testid="case-professional-seats"
              >
                编制 · {seats.map((s) => s.label).join(' · ')}
                {extras.length
                  ? ` · +${extras.map((e) => e.name).join(' · ')}`
                  : ''}
              </p>

              {/* 在办 / 缺口细行 */}
              <div
                className="mt-2 space-y-0.5"
                data-testid="case-professional-status-block"
              >
                <p
                  className={`text-[12px] font-medium ${
                    line.kind === 'gap'
                      ? 'text-amber-800'
                      : line.kind === 'work'
                        ? 'text-sky-800'
                        : 'text-slate-500'
                  }`}
                  data-testid="case-professional-status"
                >
                  {line.text}
                </p>
                {line.detail ? (
                  <p
                    className="text-[11px] text-slate-500"
                    data-testid="case-professional-status-detail"
                  >
                    {line.detail}
                  </p>
                ) : null}
              </div>

              {/* 本稿零件 */}
              <div
                className="mt-2.5"
                data-testid="case-professional-parts"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  本稿零件
                </p>
                <ul className="mt-1 space-y-0.5">
                  {parts.map((part) => (
                    <li
                      key={part.id}
                      className="flex items-baseline gap-1.5 text-[11px] text-slate-700"
                      data-testid={`case-professional-part-${part.id}`}
                    >
                      <span className="font-medium text-slate-800">
                        {part.label}
                      </span>
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
                  aria-label="辅链挂件"
                >
                  {auxHooks.map((a) => (
                    <li
                      key={a.id}
                      className="rounded-full border border-dashed border-violet-200 bg-violet-50/70 px-1.5 py-0.5 text-[9px] font-medium text-violet-900"
                      title={a.relation}
                      data-testid={`case-professional-aux-${a.id}`}
                    >
                      辅 · {a.label}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-auto pt-3">
                <Link
                  to={href}
                  className="btn-press focus-ring inline-flex flex-col rounded-md bg-slate-900 px-2.5 py-1.5 text-white hover:bg-slate-800"
                  data-testid={`case-professional-start-${door.slug}`}
                  data-start-semantic="dept-bots-work"
                >
                  <span className="text-[11px] font-semibold">让该部接稿</span>
                  <span className="text-[9px] font-normal text-slate-300">
                    部内接活 → 工作台改稿
                  </span>
                </Link>
              </div>

              {skillNames.length > 0 ? (
                <ul
                  className="mt-2 flex flex-wrap gap-1"
                  data-testid="case-professional-skill-chips"
                  aria-label="办事方法示意"
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
            </li>
          ))}
        </ul>

        <details
          className="mt-5 rounded-xl border border-dashed border-violet-200 bg-violet-50/40 px-3 py-2.5"
          data-testid="case-professional-skills-fold"
          data-aux-parts="1"
        >
          <summary
            className="cursor-pointer text-[12px] font-semibold text-violet-950"
            data-testid="case-professional-aux-summary"
          >
            进阶 · 辅链零件与办事方法（默认收折）
          </summary>
          <p
            className="mt-2 text-[11px] leading-relaxed text-violet-900/90"
            data-testid="case-professional-aux-honest"
          >
            {PROF_AUX_HONEST}。卡上已露「本稿零件 / 辅链挂件」；此处加厚查新·附图·递交等
            <strong className="font-semibold">非主八部</strong>
            挂件清单。主路径仍是编制 + 在办/缺口 +「让该部接稿」。
          </p>
          <ul
            className="mt-3 grid gap-2 sm:grid-cols-3"
            data-testid="case-professional-side-aux"
          >
            {SIDE_AUX_DEPTS.map((d) => (
              <li
                key={d.id}
                className="rounded-lg border border-violet-200/80 bg-white px-2.5 py-2"
                data-testid={`case-professional-side-aux-${d.id}`}
              >
                <p className="text-[11px] font-semibold text-violet-950">
                  {d.label}
                </p>
                <p className="mt-0.5 text-[10px] text-violet-800/70">{d.honest}</p>
                <ul className="mt-1.5 space-y-0.5">
                  {d.parts.map((part) => (
                    <li
                      key={part.id}
                      className="text-[11px] text-slate-700"
                      data-testid={`case-professional-side-part-${part.id}`}
                    >
                      <span className="font-medium">{part.label}</span>
                      <span className="text-slate-400"> · {part.hint}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <div
            className="mt-3 rounded-lg border border-dashed border-slate-200 bg-white px-2.5 py-2"
            data-testid="case-professional-methods-note"
          >
            <p className="text-[11px] font-semibold text-slate-800">
              办事方法（卡上芯片同源 · 示意）
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              方法≈怎么改稿/齐套的套路，不是 MCP
              墙。完整配置仍在部门编制旁路；本页只点到为止。
            </p>
          </div>
        </details>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to={home}
            className="btn-press focus-ring inline-flex rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700"
            data-testid="case-professional-to-company"
          >
            回公司案首页
          </Link>
        </div>
      </div>
    </div>
  )
}
