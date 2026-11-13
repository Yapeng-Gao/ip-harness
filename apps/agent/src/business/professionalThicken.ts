/**
 * 专业面再加厚 · 在办/缺口文案与排序（样机；非官报）
 * vision：专业=选部开工；编制+能力+在办/缺口；CTA=让该部接活
 */
import type { OrgDept } from '../departments/orgDepts'
import {
  confirmLabelOf,
  type DeptStatus,
} from '../departments/deptProgress'
import { businessSeatLabel } from './businessSeats'
import type { CaseProgress } from './BusinessCaseContext'

export type StatusKind = 'work' | 'gap' | 'idle'

export type ThickStatus = {
  kind: StatusKind
  /** 主行 */
  text: string
  /** 次行（谁在干 / 拍什么） */
  detail?: string
}

export function thickenStatus(
  st: DeptStatus,
  dept: OrgDept,
  progress: CaseProgress,
): ThickStatus {
  const lead = businessSeatLabel(dept.leadSeatId)
  const confirm = confirmLabelOf(dept)
  switch (st) {
    case '进行中':
      return {
        kind: 'work',
        text: '当前在办',
        detail: `${lead} 主责 · 本稿交后要你拍（示意 · 左栏待办）`,
      }
    case '待确认':
      return {
        kind: 'gap',
        text: '缺口：要你拍板',
        detail: confirm
          ? `${confirm} · 左栏待办或部台右栏`
          : '左栏待办或部台右栏',
      }
    case '退回':
      return {
        kind: 'gap',
        text: '缺口：退回补齐',
        detail: `${lead} 待按意见改一版稿`,
      }
    case '已完成':
      return {
        kind: 'idle',
        text: '本稿已交',
        detail: `${lead} 已过本站章节`,
      }
    case '锁定':
      return {
        kind: 'idle',
        text: '锁定（未递交前）',
        detail: progress.filed ? '已递交后可开' : '主链递交前不开后部',
      }
    default:
      return {
        kind: 'idle',
        text: '未到站',
        detail: '上游过线后再接稿',
      }
  }
}

/** 缺口 > 在办 > 其余；同档保原序 */
export function sortProfessionalCards<T extends { line: { kind: StatusKind } }>(
  cards: readonly T[],
): T[] {
  const rank = (k: StatusKind) => (k === 'gap' ? 0 : k === 'work' ? 1 : 2)
  return cards
    .map((c, i) => ({ c, i }))
    .sort((a, b) => {
      const d = rank(a.c.line.kind) - rank(b.c.line.kind)
      return d !== 0 ? d : a.i - b.i
    })
    .map((x) => x.c)
}

export type RosterSeat = {
  id: string
  label: string
  initial: string
  /** false = 未请来（灰显 · 建议后请示） */
  invited: boolean
}

export function rosterSeats(dept: OrgDept): RosterSeat[] {
  const rows: RosterSeat[] = [
    {
      id: dept.leadSeatId,
      label: businessSeatLabel(dept.leadSeatId),
      initial: businessSeatLabel(dept.leadSeatId).slice(0, 1),
      invited: true,
    },
  ]
  for (const p of dept.peers.slice(0, 6)) {
    if (p.sessionSeatId) {
      const label = businessSeatLabel(p.sessionSeatId)
      rows.push({
        id: p.sessionSeatId,
        label,
        initial: label.slice(0, 1),
        invited: true,
      })
    } else {
      rows.push({
        id: p.id,
        label: p.label,
        initial: p.label.slice(0, 1),
        invited: false,
      })
    }
  }
  return rows
}

const EXTRA_LS = 'ip-agent-prof-extra-seats-v1'

export type ExtraSeat = { id: string; name: string }

export function readExtraSeats(
  caseId: string,
  deptId: string,
): ExtraSeat[] {
  try {
    const raw = localStorage.getItem(EXTRA_LS)
    if (!raw) return []
    const all = JSON.parse(raw) as Record<string, ExtraSeat[]>
    return all[`${caseId}::${deptId}`] ?? []
  } catch {
    return []
  }
}

export function writeExtraSeat(
  caseId: string,
  deptId: string,
  name: string,
): ExtraSeat[] {
  const clean = name.trim().slice(0, 16)
  if (!clean) return readExtraSeats(caseId, deptId)
  const seat: ExtraSeat = {
    id: `extra-${Date.now().toString(36)}`,
    name: clean,
  }
  try {
    const raw = localStorage.getItem(EXTRA_LS)
    const all = (raw ? JSON.parse(raw) : {}) as Record<string, ExtraSeat[]>
    const key = `${caseId}::${deptId}`
    const next = [...(all[key] ?? []), seat].slice(-6)
    all[key] = next
    localStorage.setItem(EXTRA_LS, JSON.stringify(all))
    return next
  } catch {
    return [seat]
  }
}

export function removeExtraSeat(
  caseId: string,
  deptId: string,
  seatId: string,
): ExtraSeat[] {
  try {
    const raw = localStorage.getItem(EXTRA_LS)
    if (!raw) return []
    const all = JSON.parse(raw) as Record<string, ExtraSeat[]>
    const key = `${caseId}::${deptId}`
    const next = (all[key] ?? []).filter((s) => s.id !== seatId)
    all[key] = next
    localStorage.setItem(EXTRA_LS, JSON.stringify(all))
    return next
  } catch {
    return []
  }
}
