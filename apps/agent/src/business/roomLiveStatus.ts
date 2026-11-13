/**
 * 楼层房间活状态 · 只读现有案子 / 席位进度，不另造真相。
 * 待机 / 进行中 / 待确认。薄部门的「更安静」由界面处理。
 */
import type { HallDeptDoor } from './hallDepts'
import type { CaseProgress } from './BusinessCaseContext'
import { orgDeptById } from '../departments/orgDepts'
import {
  confirmKindOf,
  deptStatus,
  type DeptStatus,
  type PendingLike,
} from '../departments/deptProgress'

export type RoomLiveStatus = '待机' | '进行中' | '待确认'

export type RoomCaseSnap = {
  progress: CaseProgress
  confirms: PendingLike[]
}

function collapse(statuses: DeptStatus[]): RoomLiveStatus {
  if (statuses.includes('待确认')) return '待确认'
  if (statuses.includes('进行中') || statuses.includes('退回')) return '进行中'
  return '待机'
}

export function roomLiveStatusForDoor(
  door: HallDeptDoor,
  snaps: RoomCaseSnap[],
): RoomLiveStatus {
  const dept = orgDeptById(door.deptId)
  if (!dept || snaps.length === 0) return '待机'
  const kind = confirmKindOf(dept)
  const statuses = snaps.map((snap) =>
    deptStatus({
      dept,
      progress: snap.progress,
      pending: kind
        ? snap.confirms.filter(
            (c) => c.caseId === snap.progress.caseId && c.kind === kind,
          )
        : [],
      confirmKind: kind,
    }),
  )
  return collapse(statuses)
}
