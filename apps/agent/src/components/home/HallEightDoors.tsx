import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import {
  HALL_DEPT_DOORS,
  hallDeptHref,
  type HallDeptDoor,
} from '../../business/hallDepts'
import { hallDeptExpertPreviews } from '../../business/hallDeptPreview'
import { collectBossTodos } from '../../business/bossTodos'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { ExpertAvatar } from '../departments/ExpertAvatar'

type Props = {
  caseId?: string
  compact?: boolean
}

/**
 * 大厅八部门牌 · §100 + A/B 角标（交互大纲 §2.2.3）
 * 负责人半身主像 + 同伴脸；点门牌＝开工进部台；禁编制/管理入口。
 */
export function HallEightDoors({ caseId, compact = false }: Props) {
  const [openDuty, setOpenDuty] = useState<string | null>(null)
  const { getPendingConfirms, cases, getProgress } = useBusinessCases()

  const progressById = useMemo(() => {
    const map: Record<string, ReturnType<typeof getProgress>> = {}
    for (const c of cases) map[c.id] = getProgress(c.id)
    return map
  }, [cases, getProgress])

  const { countByDept } = useMemo(
    () =>
      collectBossTodos({
        pending: getPendingConfirms(),
        cases,
        progressById,
      }),
    [getPendingConfirms, cases, progressById],
  )

  return (
    <section
      aria-labelledby="home-eight-depts-title"
      className="mb-2 mt-2 border-t border-slate-100 pt-2"
      data-testid="home-eight-depts-fold"
      data-folded="0"
      data-hall-block="eight-depts"
      data-dept-tone="steady"
      data-boss-todo-badges="ab"
      data-first-visit-compact={compact ? '1' : '0'}
    >
      <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2">
        <h2
          id="home-eight-depts-title"
          className="text-[11px] font-semibold tracking-wide text-slate-600"
        >
          八个部门
        </h2>
        <span className="text-[10px] font-normal text-slate-400">
          点部门新办 · 待处理查看已有事项
        </span>
      </div>
      <ol
        className="grid grid-cols-2 gap-1.5 sm:grid-cols-4"
        data-testid="home-eight-depts"
        data-dept-density="preview-v100"
        data-dept-grid="2x4"
      >
        {HALL_DEPT_DOORS.map((d) => (
          <HallDoorCard
            key={d.deptId}
            door={d}
            caseId={caseId}
            abCount={countByDept[d.deptId] ?? 0}
            dutyOpen={openDuty === d.deptId}
            compact={compact}
            onToggleDuty={() =>
              setOpenDuty((cur) => (cur === d.deptId ? null : d.deptId))
            }
          />
        ))}
      </ol>
    </section>
  )
}

function HallDoorCard({
  door,
  caseId,
  abCount,
  dutyOpen,
  compact,
  onToggleDuty,
}: {
  door: HallDeptDoor
  caseId?: string
  abCount: number
  dutyOpen: boolean
  compact: boolean
  onToggleDuty: () => void
}) {
  const experts = hallDeptExpertPreviews(door)
  const lead = experts.find((e) => e.lead) ?? experts[0]
  const peers = experts.filter((e) => e.id !== lead?.id)

  return (
    <li className="min-w-0">
      <div
        className="relative flex h-full flex-col overflow-visible rounded-lg border border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/90"
        data-testid={`home-dept-card-${door.slug}`}
        data-thin={door.thin ? '1' : '0'}
        data-ab-count={abCount}
      >
        {abCount > 0 ? (
          <Link
            to={'/agent/pending?dept=' + door.slug + '&seg=AB'}
            className="focus-ring mx-2 mt-2 inline-flex min-h-8 self-end items-center rounded-md bg-amber-50 px-2 py-1 text-[11px] font-semibold tabular-nums text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100"
            data-testid={`home-dept-ab-badge-${door.slug}`}
            aria-label={`${door.label}待处理 ${abCount} 项，查看已有事项`}
            title={`查看${door.label}的待确认事项和期限提醒，共 ${abCount} 项`}
          >
            待处理 {abCount}
          </Link>
        ) : null}
        <Link
          to={hallDeptHref(caseId, door)}
          className="btn-press focus-ring flex flex-1 flex-col items-stretch rounded-t-lg px-2 pb-1.5 pt-2"
          data-testid={`home-dept-door-${door.slug}`}
          data-thin={door.thin ? '1' : '0'}
          title={`${door.label} · ${door.desc}`}
        >
          <div
            className="flex items-start gap-2"
            data-testid={`home-dept-lead-row-${door.slug}`}
          >
            {lead && !compact ? (
              <ExpertAvatar
                name={lead.name}
                seed={lead.id}
                size="md"
                kind="expert"
                deptId={door.deptId}
                lead
                appearance="stylized"
                presence={abCount > 0 ? 'waiting' : 'idle'}
              />
            ) : null}
            <span className="min-w-0 flex-1 pt-0.5">
              <span className="block text-[12px] font-semibold leading-tight text-slate-900">
                {door.label}
              </span>
              {lead && !compact ? (
                <span
                  className="mt-0.5 block truncate text-[10px] font-medium text-slate-600"
                  data-testid={`home-dept-lead-name-${door.slug}`}
                >
                  {lead.name}
                  {abCount > 0 ? (
                    <span className="ml-1 text-amber-700">· 有待处理</span>
                  ) : null}
                </span>
              ) : null}
              <span
                className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-slate-500"
                data-testid={`home-dept-blurb-${door.slug}`}
              >
                {door.desc}
              </span>
            </span>
          </div>
          {peers.length > 0 && !compact ? (
            <ul
              className="mt-1.5 flex w-full flex-wrap items-center gap-1 border-t border-slate-100/90 pt-1.5"
              data-testid={`home-dept-experts-${door.slug}`}
              aria-label={`${door.label}同伴`}
            >
              {peers.map((e) => (
                <li
                  key={e.id}
                  className="flex max-w-full items-center gap-0.5 rounded-full bg-slate-50 px-1 py-0.5 outline outline-1 -outline-offset-1 outline-black/5"
                  title={e.duty}
                  data-testid={`home-dept-expert-${door.slug}-${e.id}`}
                  data-lead="0"
                >
                  <ExpertAvatar
                    name={e.name}
                    seed={e.id}
                    size="sm"
                    kind="expert"
                    deptId={door.deptId}
                    lead={false}
                    presence="idle"
                  />
                  <span className="max-w-[4.2rem] truncate text-[9px] font-medium text-slate-600">
                    {e.name}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <ul
              className="sr-only"
              data-testid={`home-dept-experts-${door.slug}`}
              aria-label={`${door.label}专家预览`}
            >
              {lead ? (
                <li data-testid={`home-dept-expert-${door.slug}-${lead.id}`} data-lead="1">
                  {lead.name}
                </li>
              ) : null}
            </ul>
          )}
        </Link>
        <button
          type="button"
          className="btn-press focus-ring flex min-h-10 items-center gap-0.5 border-t border-slate-100 px-2 py-2 text-left text-[10px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          data-testid={`home-dept-duty-toggle-${door.slug}`}
          aria-expanded={dutyOpen}
          onClick={onToggleDuty}
        >
          {dutyOpen ? (
            <ChevronDown className="h-3 w-3 shrink-0" aria-hidden />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
          )}
          <span className="truncate">
            {dutyOpen ? '收起职责' : '查看职责'}
          </span>
        </button>
        {dutyOpen ? (
          <p
            className="border-t border-slate-50 px-2 pb-1.5 pt-1 text-[10px] leading-snug text-slate-500"
            data-testid={`home-dept-duty-${door.slug}`}
          >
            {lead?.duty || door.desc}
            <span className="mt-0.5 block text-[9px] text-slate-400">
              点部门卡片新办；已有事项从待处理或项目列表进入
            </span>
          </p>
        ) : null}
      </div>
    </li>
  )
}
