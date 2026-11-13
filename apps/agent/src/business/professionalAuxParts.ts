/**
 * 本案部门 · 本稿章节 / 辅助材料 / 能力挂接示意（样机；非官报）
 * 一期：辅链≠八部大门；禁任务板/CLI；非 lifecycle「专业」第三进门。
 */
import type { OrgDeptId } from '../departments/orgDepts'

export const PROF_AUX_HONEST =
  '样机示意 · 非真官报 · 非真检索 · 辅链不占主链序号'

export type ManuscriptPart = {
  id: string
  /** 本稿零件名（文书/声明/表） */
  label: string
  /** 短注 */
  hint: string
}

export type AuxHook = {
  id: string
  label: string
  /** 与主八部关系一句 */
  relation: string
}

export type DeptAuxBundle = {
  deptId: OrgDeptId
  /** 该部常出的本稿零件 */
  parts: ManuscriptPart[]
  /** 常挂的辅链（查新/附图/递交等） */
  aux: AuxHook[]
}

const BUNDLES: Record<string, DeptAuxBundle> = {
  'dept-intake': {
    deptId: 'dept-intake',
    parts: [
      {
        id: 'dir-brief',
        label: '立题一页纸',
        hint: '方向与边界 · 开篇用',
      },
      {
        id: 'quote-outline',
        label: '报价提纲',
        hint: '费用口袋示意 · 非账单',
      },
    ],
    aux: [
      {
        id: 'research-pre',
        label: '查新对照',
        relation: '辅链挂件 · 不占立项序号',
      },
    ],
  },
  'dept-inspire': {
    deptId: 'dept-inspire',
    parts: [
      {
        id: 'spark-list',
        label: '创新点清单',
        hint: '可写进交底的点子',
      },
      {
        id: 'kill-note',
        label: '不申备忘',
        hint: 'B 支路示意 · 非结案官文',
      },
    ],
    aux: [],
  },
  'dept-mining': {
    deptId: 'dept-mining',
    parts: [
      {
        id: 'blank-map',
        label: '空白点表',
        hint: '布局用 · 示意',
      },
      {
        id: 'prior-skim',
        label: '近案速览稿',
        hint: '辅读 · 非检索报告',
      },
    ],
    aux: [
      {
        id: 'research-map',
        label: '查新辅读',
        relation: '辅链 · 给布局对照',
      },
    ],
  },
  'dept-disclosure': {
    deptId: 'dept-disclosure',
    parts: [
      {
        id: 'six-sec',
        label: '六段事实稿',
        hint: '本稿主干章节',
      },
      {
        id: 'ownership',
        label: '权属声明',
        hint: '齐套常用附件',
      },
      {
        id: 'embod',
        label: '实施例摘录',
        hint: '可进说明书的段落',
      },
    ],
    aux: [
      {
        id: 'fig-hook',
        label: '附图挂件',
        relation: '辅链 · 图号与正文对齐',
      },
      {
        id: 'research-after',
        label: '交底后查新',
        relation: '辅链 · 主链过线用',
      },
    ],
  },
  'dept-draft': {
    deptId: 'dept-draft',
    parts: [
      {
        id: 'claims',
        label: '权利要求稿',
        hint: '权要章节 · 可另存版本',
      },
      {
        id: 'spec',
        label: '说明书章节',
        hint: '正文修订示意',
      },
      {
        id: 'abs',
        label: '摘要一页',
        hint: '短摘要 · 附件感',
      },
    ],
    aux: [
      {
        id: 'fig-pack',
        label: '附图成套',
        relation: '辅链零件 · 非申请部大门',
      },
      {
        id: 'file-pack',
        label: '递交包清单',
        relation: '后勤挂件 · 非官报通道',
      },
    ],
  },
  'dept-oa': {
    deptId: 'dept-oa',
    parts: [
      {
        id: 'oa-strategy',
        label: '答复策略条',
        hint: '本轮怎么回 · 示意',
      },
      {
        id: 'oa-amend',
        label: '修改说明',
        hint: '对照权要的修订说明',
      },
      {
        id: 'oa-args',
        label: '意见陈述稿',
        hint: '文书章节 · 非官文',
      },
    ],
    aux: [
      {
        id: 'research-oa',
        label: '对比文件辅读',
        relation: '辅链 · 非真检索结果',
      },
    ],
  },
  'dept-annuity': {
    deptId: 'dept-annuity',
    parts: [
      {
        id: 'renew-sheet',
        label: '续费备忘单',
        hint: '期限台账用 · 示意',
      },
      {
        id: 'holder-note',
        label: '权利人核对',
        hint: '维护章节',
      },
    ],
    aux: [
      {
        id: 'fee-pocket',
        label: '官费口袋示意',
        relation: '账单辅读 · 非真扣款',
      },
    ],
  },
  'dept-monetize': {
    deptId: 'dept-monetize',
    parts: [
      {
        id: 'retro',
        label: '复盘五块稿',
        hint: '经验沉淀章节',
      },
      {
        id: 'pref-cand',
        label: '偏好候选条',
        hint: '可收入判断档案',
      },
    ],
    aux: [],
  },
}

/** 查新/附图等真辅链部（非主八）的示意零件——专业面折叠区用 */
export const SIDE_AUX_DEPTS: {
  id: string
  label: string
  parts: ManuscriptPart[]
  honest: string
}[] = [
  {
    id: 'research',
    label: '查新（辅链）',
    parts: [
      { id: 'hit-list', label: '对比清单稿', hint: '示意条目 · 非真库结果' },
      { id: 'concl', label: '结论一页', hint: '给主链对照用' },
    ],
    honest: '查新辅链示意 · 不占主链序号 · 非真库实查',
  },
  {
    id: 'figure',
    label: '附图（辅链）',
    parts: [
      { id: 'sheet', label: '图面一览', hint: '图号与部件' },
      { id: 'callout', label: '标注校对条', hint: '与权要引用对齐' },
    ],
    honest: '附图辅链示意 · 主链零件感 · 非第九部门',
  },
  {
    id: 'file',
    label: '递交与程序（辅链）',
    parts: [
      { id: 'pack', label: '递交包目录', hint: '齐套勾选示意' },
      { id: 'receipt', label: '回执备忘', hint: '非真递交通道' },
    ],
    honest: '递交辅链示意 · 后勤挂件 · 禁真递交 / 非官报通道',
  },
]

export function auxBundleFor(deptId: OrgDeptId): DeptAuxBundle {
  return (
    BUNDLES[deptId] ?? {
      deptId,
      parts: [
        {
          id: 'generic-part',
          label: '本稿摘录',
          hint: '示意零件',
        },
      ],
      aux: [],
    }
  )
}

/** 把 skill 名收成能力挂接短标（去掉引擎味） */
export function methodLabelFromSkill(name: string): string {
  const t = name.trim()
  if (!t) return '能力'
  if (/MCP|Prompt|Agent|API|CLI/i.test(t)) return '能力挂接（示意）'
  return t.length > 14 ? `${t.slice(0, 14)}…` : t
}
