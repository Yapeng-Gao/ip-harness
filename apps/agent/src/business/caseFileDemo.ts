/**
 * 案卷抽屉演示内容 · 交互大纲 §4.5（样机壳，不写真实卷宗引擎）
 */
import type {
  CaseFileCheckRow,
  CaseFileJudgment,
  CaseFileMaterial,
} from '../components/business/CaseFileDrawer'
import {
  disclosureToDraftTicket,
  type InterDeptTicket,
} from './interDeptTicket'
import type { OrgDeptId } from '../departments/orgDepts'

export function demoCaseFileMaterials(opts?: {
  disclosureDone?: boolean
  draftStarted?: boolean
}): CaseFileMaterial[] {
  return [
    { label: '技术说明', status: '有' },
    { label: '图纸 / 照片', status: '有' },
    {
      label: '交底定稿',
      status: opts?.disclosureDone ? '有' : '缺口',
      note: opts?.disclosureDone ? undefined : '待全绿',
    },
    {
      label: '申请文件包',
      status: opts?.draftStarted ? '有' : '缺口',
    },
    { label: '通知书', status: '缺口', note: '未到⑥' },
  ]
}

export function demoCaseFileChecks(opts?: {
  disclosureDone?: boolean
}): CaseFileCheckRow[] {
  return [
    {
      dept: '④ 交底部',
      kind: '进入',
      summary: '技术事实材料到位',
      ok: true,
    },
    {
      dept: '④ 交底部',
      kind: '结束',
      summary: opts?.disclosureDone
        ? '交底质检全绿 · 可交⑤'
        : '未全绿 · 不可开「现在做⑤」',
      ok: !!opts?.disclosureDone,
    },
    {
      dept: '⑤ 申请部',
      kind: '进入',
      summary: '须合格交底（工单或自带）',
      ok: !!opts?.disclosureDone,
    },
    {
      dept: '⑤ 申请部',
      kind: '结束',
      summary: '申请文件可递交（过线）· 尚未',
      ok: false,
    },
    {
      dept: '⑥ 答复部',
      kind: '本轮',
      summary: '本轮答复可递交（D 过线）· 未到',
      ok: false,
    },
  ]
}

export function demoCaseFileTickets(
  caseId: string,
  opts?: { disclosureDone?: boolean },
): InterDeptTicket[] {
  if (!opts?.disclosureDone) return []
  return [disclosureToDraftTicket(caseId)]
}

export function demoCaseFileJudgments(opts?: {
  disclosureDone?: boolean
}): CaseFileJudgment[] {
  const rows: CaseFileJudgment[] = [
    { at: '前台', text: '确认去④（材料像交底向）' },
  ]
  if (opts?.disclosureDone) {
    rows.push(
      {
        at: '④',
        text: '事实确认 → 质检再检 → 全绿 → 可交⑤',
      },
      {
        at: '工单',
        text: '交底部负责人打包「现在做⑤」· 申请尚未过线',
      },
    )
  }
  return rows
}

export function demoLineBadges(opts?: {
  disclosureDone?: boolean
}): string[] {
  return [
    opts?.disclosureDone ? '交底质检全绿' : '交底质检 · 未全绿',
    '申请文件可递交（过线）· 未',
    '本轮答复可递交（D 过线）· 未到',
  ]
}

export function isDisclosureDept(deptId: OrgDeptId | undefined): boolean {
  return deptId === 'dept-disclosure'
}

export function isDraftDept(deptId: OrgDeptId | undefined): boolean {
  return deptId === 'dept-draft'
}
