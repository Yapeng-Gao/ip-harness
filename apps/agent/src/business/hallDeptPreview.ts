/**
 * 大厅八部门牌薄专家预览 · DEMO seed
 * 编制取自 MAIN_CHAIN_DEPTS / getProjectExpert；大厅禁止铺全员墙（每部 ≤3）。
 */
import { normalizePeerJobTitle } from './agentStyle'
import type { HallDeptDoor } from './hallDepts'
import { HALL_DEPT_DOORS } from './hallDepts'
import { orgDeptById } from '../departments/orgDepts'
import { getProjectExpert } from '../projects/experts'

export type HallDeptExpertPreview = {
  id: string
  /** 短名（上屏） */
  name: string
  /** 职责一句（悬停 / 小展开） */
  duty: string
  /** 负责人 */
  lead?: boolean
}

/** 岗名门口短称 · Office 语感 */
export function hallExpertShortName(raw: string): string {
  return normalizePeerJobTitle(raw)
    .replace(/撰写代理师/g, '申请代理师')
    .replace(/OA答复代理师/g, '答复代理师')
    .replace(/年费管家/g, '维护管家')
    .replace(/转化顾问/g, '复盘顾问')
    .trim()
}

/** 每部门牌 1–3 人：负责人 + peers；诚实 DEMO */
export function hallDeptExpertPreviews(
  door: HallDeptDoor,
): HallDeptExpertPreview[] {
  const dept = orgDeptById(door.deptId)
  if (!dept) {
    return [
      {
        id: `${door.deptId}:fallback`,
        name: door.label.replace(/部$/, '负责人'),
        duty: door.desc,
        lead: true,
      },
    ]
  }
  const lead = getProjectExpert(dept.leadSeatId)
  const out: HallDeptExpertPreview[] = [
    {
      id: dept.leadSeatId,
      name: hallExpertShortName(lead.name),
      duty: (lead.specialty || door.desc).trim(),
      lead: true,
    },
  ]
  for (const p of dept.peers) {
    if (out.length >= 3) break
    out.push({
      id: p.id,
      name: hallExpertShortName(p.label),
      duty: `${door.label} · ${hallExpertShortName(p.label)}`,
    })
  }
  return out
}

export function assertHallDoorBlurbsPresent(): boolean {
  return HALL_DEPT_DOORS.every((d) => d.desc.trim().length > 0)
}

export function assertHallExpertsBounded(): boolean {
  return HALL_DEPT_DOORS.every((d) => {
    const n = hallDeptExpertPreviews(d).length
    return n >= 1 && n <= 3
  })
}
