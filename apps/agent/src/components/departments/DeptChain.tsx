import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  Cpu,
  MessageSquare,
  Settings2,
  Users,
  Wrench,
} from 'lucide-react'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import type { BusinessConfirmItem } from '../../business/BusinessCaseContext'
import { getProjectExpert, expertAccentClass } from '../../projects/experts'
import { useOrgConfig } from '../../departments/OrgConfigContext'
import {
  MAIN_CHAIN_DEPTS,
  PRE_DEPTS,
  POST_DEPTS_LIST,
  ORG_DEPTS,
  type OrgDept,
} from '../../departments/orgDepts'
import {
  LEVEL_LABEL,
  levelFromXp,
  DEPT_MAIN_XP,
  DEPT_RICH,
  deptLoad,
  type DeptRich,
} from '../../departments/orgData'
import {
  confirmKindOf,
  confirmLabelOf,
  deptExpertRows,
  deptHeadline,
  deptStatus,
  rollupByDept,
  type DeptRollup,
} from '../../departments/deptProgress'
import type { ProjectExpertId } from '../../projects/types'
import { DeptStatusDot } from './DeptStatusDot'

type Props = {
  onConfigure: (seatId: ProjectExpertId, dept: OrgDept) => void
}

/**
 * 8 节点串联 · 主作业链
 * 布局 → 立项 → 交底 → 查新 → 撰写 → 附图 → 递交 → 审查答复
 */
export function DeptChain({ onConfigure }: Props) {
  const { cases, getProgress, getPendingConfirms } = useBusinessCases()
  const { deptLabel } = useOrgConfig()
  const pending = getPendingConfirms()

  const rollups = useMemo(
    () => rollupByDept({ cases, getProgress, pending }),
    [cases, getProgress, pending],
  )

  return (
    <section aria-labelledby="dept-chain-title" data-testid="dept-chain">
      <div className="mb-2.5 flex flex-wrap items-baseline gap-2">
        <h2
          id="dept-chain-title"
          className="text-[13px] font-semibold tracking-tight text-slate-900"
        >
          主作业链
        </h2>
        <span className="text-[11px] text-slate-500">
          8 个交卷节点 · 一次只有一个部门在进行中
        </span>
      </div>

      <ol className="dept-chain" role="list">
        {MAIN_CHAIN_DEPTS.map((dept, i) => (
          <li key={dept.id} className="dept-chain__item">
            <DeptCard
              dept={dept}
              label={deptLabel(dept)}
              rollup={rollups[dept.id]}
              cases={cases}
              getProgress={getProgress}
              pending={pending}
              onConfigure={onConfigure}
              index={i + 1}
            />
            {i < MAIN_CHAIN_DEPTS.length - 1 && (
              <ArrowRight
                className="dept-chain__arrow h-4 w-4 text-slate-300"
                strokeWidth={1.75}
                aria-hidden
              />
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

export function DeptCard({
  dept,
  label,
  rollup,
  cases,
  getProgress,
  pending,
  onConfigure,
  index,
}: {
  dept: OrgDept
  label: string
  rollup: DeptRollup | undefined
  cases: ReturnType<typeof useBusinessCases>['cases']
  getProgress: ReturnType<typeof useBusinessCases>['getProgress']
  pending: BusinessConfirmItem[]
  onConfigure: Props['onConfigure']
  index?: number
}) {
  const [open, setOpen] = useState(false)
  const { getExpertConfig } = useOrgConfig()
  const lead = getProjectExpert(dept.leadSeatId)
  const expertRows = deptExpertRows(dept, lead?.name ?? dept.leadSeatId)
  const rich = DEPT_RICH[dept.id]
  const load = deptLoad(
    rollup?.pendingCount ?? 0,
    rollup?.activeCount ?? 0,
  )

  /** 主责的养成档位：样机基准 xp（orgData）+ 用户在抽屉里的训练量 */
  const leadLevel = useMemo(() => {
    if (!rich) return null
    const cfgXp = getExpertConfig(dept.leadSeatId).xp
    const base = DEPT_MAIN_XP[dept.id] ?? 0
    return levelFromXp(base + cfgXp)
  }, [rich, dept.id, dept.leadSeatId, getExpertConfig])

  /** 本案状态：优先取第一个在这个部门有活动的案 */
  const caseState = useMemo(() => {
    const kind = confirmKindOf(dept)
    for (const c of cases) {
      const progress = getProgress(c.id)
      const mine = kind
        ? pending.filter((p) => p.caseId === c.id && p.kind === kind)
        : pending.filter((p) => p.caseId === c.id)
      const status = deptStatus({ dept, progress, pending: mine, confirmKind: kind })
      if (status !== '未到' && status !== '锁定') return { status, caseTitle: c.title }
    }
    return { status: '未到' as const, caseTitle: null as string | null }
  }, [cases, dept, getProgress, pending])

  const accent = expertAccentClass(lead?.accent ?? 'slate')
  const gate = confirmLabelOf(dept)
  const headline = deptHeadline(dept, rollup)

  return (
    <article
      className="dept-card group"
      data-testid={`dept-card-${dept.id}`}
      data-status={caseState.status}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="focus-ring flex w-full items-start gap-2 rounded-[var(--radius-md)] p-2.5 text-left"
      >
        {index !== undefined && (
          <span className="mt-0.5 shrink-0 tabular text-[10px] font-semibold text-slate-500">
            {String(index).padStart(2, '0')}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-semibold text-slate-900">
              {label}
            </span>
            <DeptStatusDot status={caseState.status} />
            <span className="ml-auto shrink-0">
              <LoadDot load={load} />
            </span>
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-slate-600">
            {headline}
          </span>
          <span className="mt-1 flex items-center gap-1">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-semibold ${accent}`}
              aria-hidden
            >
              {(lead?.name ?? '?').slice(0, 1)}
            </span>
            <span className="truncate text-[11px] text-slate-600">
              {lead?.name ?? dept.leadSeatId}
            </span>
            {rich ? (
              <span className="inline-flex shrink-0 items-center gap-1">
                <span className="rounded-full bg-sky-50 px-1.5 py-px text-[10px] font-medium text-sky-700">
                  {LEVEL_LABEL[leadLevel!]}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-500">
                  <Bot className="h-3 w-3 text-slate-400" strokeWidth={1.75} aria-hidden />
                  {rich.mainAgent.name}
                </span>
              </span>
            ) : (
              <span className="shrink-0 text-[10px] text-slate-500">
                +{expertRows.length - 1}
              </span>
            )}
          </span>
        </span>
        <ChevronDown
          className={`mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>

      {caseState.caseTitle && (
        <p className="border-t border-slate-100 px-2.5 py-1.5 text-[11px] text-slate-600">
          <span className="font-medium text-slate-800">{caseState.caseTitle}</span>
          {gate ? ` · ${gate}` : ''}
        </p>
      )}

      {open && (
        <div className="border-t border-slate-100 px-2.5 py-2">
          {rich && (
            <DeptRichPanel rich={rich} leadSeatId={dept.leadSeatId} />
          )}
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            部内 · {expertRows.length} 人
          </p>
          <ul className="space-y-0.5">
            {expertRows.map((row) => (
              <li
                key={row.id}
                className="flex items-center gap-1.5 rounded-[var(--radius-sm)] px-1 py-1 text-[11px]"
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    row.isLead ? 'bg-sky-600' : row.navigable ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                  aria-hidden
                />
                <span
                  className={`min-w-0 flex-1 truncate ${
                    row.navigable ? 'text-slate-800' : 'text-slate-500'
                  }`}
                >
                  {row.label}
                </span>
                <span className="shrink-0 text-[10px] text-slate-500">{row.note}</span>
                {row.seatId && (
                  <button
                    type="button"
                    onClick={() => onConfigure(row.seatId!, dept)}
                    className="focus-ring shrink-0 rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    aria-label={`配置 ${row.label}`}
                    title="配置 role / skill"
                  >
                    <Settings2 className="h-3 w-3" strokeWidth={1.75} aria-hidden />
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-1.5 flex flex-wrap gap-1 border-t border-slate-100 pt-1.5">
            <Link
              to="/agent/cases/new"
              className="focus-ring inline-flex min-h-8 items-center gap-1 rounded-[var(--radius-sm)] px-1.5 text-[11px] font-medium text-sky-700 hover:bg-sky-50"
            >
              <MessageSquare className="h-3 w-3" strokeWidth={1.75} aria-hidden />
              开会话
            </Link>
            <Link
              to="/agent/projects"
              className="focus-ring inline-flex min-h-8 items-center gap-1 rounded-[var(--radius-sm)] px-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
            >
              <Users className="h-3 w-3" strokeWidth={1.75} aria-hidden />
              建项目
            </Link>
          </div>
        </div>
      )}
    </article>
  )
}

/** 部门运营面板（样机）：主理 Agent · 专家 Agent · 执行集群 · 支撑工具 */
function DeptRichPanel({
  rich,
  leadSeatId,
}: {
  rich: DeptRich
  leadSeatId: ProjectExpertId
}) {
  const { getExpertConfig } = useOrgConfig()
  const main = rich.mainAgent
  const leadXp = getExpertConfig(leadSeatId).xp

  return (
    <div className="mb-2 space-y-2">
      {/* 主理 Agent */}
      <div className="rounded-[var(--radius-sm)] bg-sky-50/70 px-2 py-1.5">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-900">
          <Bot className="h-3.5 w-3.5 text-sky-600" strokeWidth={1.75} aria-hidden />
          主理 Agent · {main.name}
          <span className="tabular font-normal text-sky-700/80">{main.code}</span>
        </p>
        <p className="mt-0.5 text-[10px] leading-relaxed text-sky-800/80">{main.duty}</p>
        <p className="mt-1 flex flex-wrap gap-1">
          {main.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-white px-1.5 py-px text-[10px] text-sky-700"
            >
              {t}
            </span>
          ))}
        </p>
      </div>

      {/* 专家 Agent（档位 = 基准 xp + 训练量） */}
      <div>
        <p className="mb-1 flex items-baseline gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          专家 Agent · {rich.experts.length}
          <span className="font-normal normal-case tracking-normal text-slate-400">
            样机 · 可在「配置」里养
          </span>
        </p>
        <ul className="grid gap-1 sm:grid-cols-2">
          {rich.experts.map((e) => {
            // 主责（合成 id 与 leadSeatId 对不上）：专家档位 = 基准 xp；
            // 若该专家就是主责，则叠上用户在抽屉里训练出的 xp
            const isLead = e.id === leadSeatId
            const level = levelFromXp(e.baseXp + (isLead ? leadXp : 0))
            return (
              <li
                key={e.id}
                className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-slate-100 bg-slate-50/60 px-1.5 py-1 text-[11px]"
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    e.status === '任务中'
                      ? 'bg-amber-500'
                      : e.status === '运行中'
                        ? 'bg-emerald-500'
                        : 'bg-slate-300'
                  }`}
                  aria-hidden
                />
                <span className="min-w-0 truncate text-slate-800">{e.name}</span>
                <span className="shrink-0 text-[10px] text-slate-500">{e.specialty}</span>
                <span className="ml-auto shrink-0 rounded-full bg-white px-1.5 py-px text-[10px] font-medium text-slate-600">
                  {LEVEL_LABEL[level]}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* 执行集群 + 支撑工具 */}
      <div className="grid gap-1.5 sm:grid-cols-2">
        <div className="rounded-[var(--radius-sm)] border border-slate-100 px-2 py-1.5">
          <p className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
            <Cpu className="h-3 w-3 text-slate-400" strokeWidth={1.75} aria-hidden />
            执行集群
            <span className="tabular ml-auto font-normal text-slate-600">
              {rich.workerCount} 台
            </span>
          </p>
          <p className="tabular mt-0.5 truncate text-[10px] text-slate-500">
            {rich.workerPrefix}-01 … {rich.workerPrefix}-
            {String(rich.workerCount).padStart(2, '0')}
          </p>
        </div>
        <div className="rounded-[var(--radius-sm)] border border-slate-100 px-2 py-1.5">
          <p className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
            <Wrench className="h-3 w-3 text-slate-400" strokeWidth={1.75} aria-hidden />
            支撑工具
            <span className="tabular ml-auto font-normal text-slate-600">
              {rich.tools.length}
            </span>
          </p>
          <ul className="mt-0.5 space-y-px">
            {rich.tools.map((t) => (
              <li key={t.id} className="flex items-baseline gap-1 text-[10px] text-slate-600">
                <span className="min-w-0 truncate">{t.name}</span>
                <span className="tabular shrink-0 text-slate-400">
                  {t.version} · 周{t.weeklyCalls}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/** 负荷点：高负荷=琥珀 · 运转中=绿 · 待命=灰 */
function LoadDot({ load }: { load: '高负荷' | '运转中' | '待命' }) {
  const color =
    load === '高负荷'
      ? 'bg-amber-500'
      : load === '运转中'
        ? 'bg-emerald-500'
        : 'bg-slate-300'
  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full ${color}`}
      title={load}
      aria-label={`负荷 · ${load}`}
    />
  )
}

/** 非主链分组：前研 / 授权后，各自折叠 */
export function DeptGroups({ onConfigure }: Props) {
  const { deptLabel } = useOrgConfig()
  const { cases, getProgress, getPendingConfirms } = useBusinessCases()
  const pending = getPendingConfirms()
  const rollups = useMemo(
    () => rollupByDept({ cases, getProgress, pending }),
    [cases, getProgress, pending],
  )

  return (
    <div className="mt-5 grid gap-3 lg:grid-cols-2">
      <DeptGroup
        title="前研"
        hint="开案前可选 · 覆盖行业与竞争对手"
        depts={PRE_DEPTS}
        deptLabel={deptLabel}
        rollups={rollups}
        onConfigure={onConfigure}
      />
      <DeptGroup
        title="授权后"
        hint="授权之后才能开启 · 三部并行"
        depts={POST_DEPTS_LIST}
        deptLabel={deptLabel}
        rollups={rollups}
        onConfigure={onConfigure}
      />
    </div>
  )
}

function DeptGroup({
  title,
  hint,
  depts,
  deptLabel,
  rollups,
  onConfigure,
}: {
  title: string
  hint: string
  depts: OrgDept[]
  deptLabel: (d: OrgDept) => string
  rollups: Record<string, DeptRollup>
  onConfigure: Props['onConfigure']
}) {
  const [open, setOpen] = useState(true)
  return (
    <section className="rounded-[var(--radius-lg)] border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="focus-ring flex w-full items-center gap-2 rounded-[var(--radius-lg)] px-3 py-2.5 text-left"
      >
        <span className="text-[12px] font-semibold text-slate-900">{title}</span>
        <span className="tabular rounded-full bg-slate-100 px-1.5 py-px text-[10px] font-medium text-slate-700">
          {depts.length}
        </span>
        <span className="ml-auto truncate text-[11px] text-slate-500">{hint}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>
      {open && (
        <ul className="grid gap-1.5 border-t border-slate-100 p-2 sm:grid-cols-2">
          {depts.map((d) => (
            <li key={d.id}>
              <DeptMiniCard
                dept={d}
                label={deptLabel(d)}
                rollup={rollups[d.id]}
                onConfigure={onConfigure}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function DeptMiniCard({
  dept,
  label,
  rollup,
  onConfigure,
}: {
  dept: OrgDept
  label: string
  rollup: DeptRollup | undefined
  onConfigure: Props['onConfigure']
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-[var(--radius-md)] border border-slate-100 bg-slate-50/60 px-2 py-1.5"
      data-testid={`dept-mini-${dept.id}`}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-medium text-slate-800">
          {label}
        </span>
        <span className="block truncate text-[11px] text-slate-600">
          {deptHeadline(dept, rollup)}
        </span>
      </span>
      <button
        type="button"
        onClick={() => onConfigure(dept.leadSeatId, dept)}
        className="focus-ring shrink-0 rounded p-1 text-slate-500 hover:bg-white hover:text-slate-800"
        aria-label={`配置 ${label}`}
      >
        <Settings2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  )
}

/** 校验：所有部门都进了一处展示，不漏 */
export function assertDeptCoverage(): boolean {
  const shown = new Set<string>([
    ...MAIN_CHAIN_DEPTS.map((d) => d.id),
    ...PRE_DEPTS.map((d) => d.id),
    ...POST_DEPTS_LIST.map((d) => d.id),
  ])
  return ORG_DEPTS.every((d) => shown.has(d.id))
}

/** 未使用但保留：完成态图标（供向导复用） */
export function DeptDoneIcon() {
  return <Check className="h-3 w-3" strokeWidth={2} aria-hidden />
}
