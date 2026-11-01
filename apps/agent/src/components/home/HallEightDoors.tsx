import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import {
  HALL_DEPT_DOORS,
  hallDeptHref,
  type HallDeptDoor,
} from '../../business/hallDepts'
import { hallDeptExpertPreviews } from '../../business/hallDeptPreview'
import { ExpertAvatar } from '../departments/ExpertAvatar'

type Props = {
  caseId?: string
}

/**
 * 大厅八部门牌 · §100
 * 名牌 + 一句话 + 薄专家预览（≤3）；点门牌＝开工进部台；禁编制/管理入口。
 */
export function HallEightDoors({ caseId }: Props) {
  const [openDuty, setOpenDuty] = useState<string | null>(null)

  return (
    <section
      aria-labelledby="home-eight-depts-title"
      className="mb-2 mt-3 border-t border-slate-100 pt-2.5"
      data-testid="home-eight-depts-fold"
      data-folded="0"
      data-hall-block="eight-depts"
      data-dept-tone="steady"
    >
      <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2">
        <h2
          id="home-eight-depts-title"
          className="text-[11px] font-semibold tracking-wide text-slate-600"
        >
          八个部门
        </h2>
        <span className="text-[10px] font-normal text-slate-400">
          熟客直达 · 一句话 + 专家
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
            dutyOpen={openDuty === d.deptId}
            onToggleDuty={() =>
              setOpenDuty((cur) => (cur === d.deptId ? null : d.deptId))
            }
          />
        ))}
      </ol>
      <button
        type="button"
        className="sr-only"
        aria-expanded={true}
        data-testid="home-eight-depts-toggle"
        tabIndex={-1}
      >
        八个部门
      </button>
    </section>
  )
}

function HallDoorCard({
  door,
  caseId,
  dutyOpen,
  onToggleDuty,
}: {
  door: HallDeptDoor
  caseId?: string
  dutyOpen: boolean
  onToggleDuty: () => void
}) {
  const experts = hallDeptExpertPreviews(door)
  const lead = experts.find((e) => e.lead) ?? experts[0]

  return (
    <li className="min-w-0">
      <div
        className="flex h-full flex-col rounded-md border border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/90"
        data-testid={`home-dept-card-${door.slug}`}
        data-thin={door.thin ? '1' : '0'}
      >
        <Link
          to={hallDeptHref(caseId, door)}
          className="btn-press focus-ring flex flex-1 flex-col items-start rounded-t-md px-2 py-1.5"
          data-testid={`home-dept-door-${door.slug}`}
          data-thin={door.thin ? '1' : '0'}
          title={`${door.label} · ${door.desc}`}
        >
          <span className="flex w-full items-center gap-0.5 text-[9px] font-medium text-slate-400">
            <span>{door.num}</span>
            {door.thin ? (
              <span className="rounded px-0.5 text-[8px] font-normal text-slate-400/90">
                薄
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 text-[12px] font-semibold leading-tight text-slate-900">
            {door.label}
          </span>
          <span
            className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-slate-500"
            data-testid={`home-dept-blurb-${door.slug}`}
          >
            {door.desc}
          </span>
          <ul
            className="mt-1.5 flex w-full flex-wrap items-center gap-1"
            data-testid={`home-dept-experts-${door.slug}`}
            aria-label={`${door.label}专家预览`}
          >
            {experts.map((e) => (
              <li
                key={e.id}
                className="flex max-w-full items-center gap-0.5 rounded-full bg-slate-50 px-1 py-0.5 outline outline-1 -outline-offset-1 outline-black/5"
                title={e.duty}
                data-testid={`home-dept-expert-${door.slug}-${e.id}`}
                data-lead={e.lead ? '1' : '0'}
              >
                <ExpertAvatar name={e.name} seed={e.id} size="sm" />
                <span className="max-w-[4.5rem] truncate text-[9px] font-medium text-slate-600">
                  {e.name}
                </span>
              </li>
            ))}
          </ul>
        </Link>
        <button
          type="button"
          className="btn-press focus-ring flex items-center gap-0.5 border-t border-slate-100 px-2 py-1 text-left text-[9px] font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600"
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
            {dutyOpen ? '收起' : `进${door.label}办事`}
          </span>
        </button>
        {dutyOpen ? (
          <p
            className="border-t border-slate-50 px-2 pb-1.5 pt-1 text-[10px] leading-snug text-slate-500"
            data-testid={`home-dept-duty-${door.slug}`}
          >
            {lead?.duty || door.desc}
            <span className="mt-0.5 block text-[9px] text-slate-400">
              点上方门牌进部台办事
            </span>
          </p>
        ) : null}
      </div>
    </li>
  )
}
