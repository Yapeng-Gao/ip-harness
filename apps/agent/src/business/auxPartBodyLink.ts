/**
 * 辅链/本稿零件 ↔ 工作台中栏正文联动（样机；非官报）
 * 点零件 → 打开部台中栏并写入种子正文；Office 语感：章节/附件，非法条号。
 */
import type { OrgDeptId } from '../departments/orgDepts'
import { deptSlug } from '../departments/orgDepts'
import {
  PROF_AUX_HONEST,
  auxBundleFor,
  type ManuscriptPart,
} from './professionalAuxParts'

export const AUX_BODY_LINK_HONEST =
  '零件联正文 · 样机示意 · 非真官报 / 非真检索'

/** 材料树 / 选中态 id */
export function partMaterialId(partId: string): string {
  return `part-${partId}`
}

export function parsePartMaterialId(
  materialId: string,
): string | null {
  if (!materialId.startsWith('part-')) return null
  const id = materialId.slice('part-'.length)
  return id || null
}

/** 专业面 → 部台中栏深链 */
export function partWorkbenchHref(input: {
  caseId: string
  deptId: OrgDeptId
  partId: string
}): string {
  const slug = deptSlug(input.deptId)
  const q = new URLSearchParams()
  q.set('part', input.partId)
  return `/agent/cases/${encodeURIComponent(input.caseId)}/depts/${slug}?${q.toString()}`
}

export function findManuscriptPart(
  deptId: OrgDeptId,
  partId: string,
): ManuscriptPart | undefined {
  return auxBundleFor(deptId).parts.find((p) => p.id === partId)
}

/** 按零件拼种子正文（Office 章节感；禁假官报） */
export function seedBodyForPart(input: {
  part: ManuscriptPart
  deptLabel?: string
}): string {
  const custom = PART_SEED_EXTRA[input.part.id]
  const lines = [
    `# ${input.part.label}`,
    '',
    `> ${PROF_AUX_HONEST}`,
    `> ${AUX_BODY_LINK_HONEST}`,
    '',
    '## 本章用途',
    input.part.hint,
    '',
  ]
  if (custom) {
    lines.push(...custom, '')
  } else {
    lines.push(
      '## 正文草稿（待改）',
      '（种子段落）请在中栏改稿；齐套后再交卷。本稿零件示意，不代替正式文书。',
      '',
    )
  }
  lines.push(
    `— ${input.deptLabel ?? '本部门'} · 本稿零件「${input.part.label}」`,
  )
  return lines.join('\n')
}

/** 若干高频零件加厚一两段（仍样机） */
const PART_SEED_EXTRA: Record<string, string[]> = {
  'six-sec': [
    '## 六段事实稿（骨架）',
    '1. 技术领域',
    '2. 背景与痛点',
    '3. 发明目的',
    '4. 技术方案要点',
    '5. 有益效果',
    '6. 实施例摘要',
    '',
    '## 待补',
    '- [ ] 关键参数 / 边界条件',
    '- [ ] 与附图图号对齐（辅链挂件）',
  ],
  ownership: [
    '## 权属声明（示意）',
    '发明人 / 申请人关系待核对；本页为齐套附件种子，非签字原件。',
    '',
    '## 核对清单',
    '- [ ] 发明人名单',
    '- [ ] 职务发明说明',
    '- [ ] 委托/代理关系（如有）',
  ],
  embod: [
    '## 实施例摘录',
    '择一可复现路径写清步骤与结果；可迁入说明书对应段。',
  ],
  claims: [
    '## 权利要求稿（示意）',
    '1. 一种……，其特征在于……',
    '2. 根据权利要求 1 所述的……，其中……',
    '',
    '（种子权要 · 非定稿 · 非真递交）',
  ],
  spec: [
    '## 说明书章节（示意）',
    '技术领域 / 背景技术 / 发明内容 / 附图说明 / 具体实施方式 —— 按本稿改写。',
  ],
  'dir-brief': [
    '## 立题一页纸',
    '方向、边界、不做什么；开篇给立项/交底对齐用。',
  ],
  'oa-strategy': [
    '## 答复策略条',
    '本轮争点 · 拟采纳/争辩要点 · 改稿范围（示意，非官文）。',
  ],
}

/** 从材料 id 解析并取出零件 + 种子正文 */
export function resolvePartBody(input: {
  deptId: OrgDeptId
  materialId: string
  deptLabel?: string
}): { part: ManuscriptPart; body: string } | null {
  const partId = parsePartMaterialId(input.materialId)
  if (!partId) return null
  const part = findManuscriptPart(input.deptId, partId)
  if (!part) return null
  return {
    part,
    body: seedBodyForPart({ part, deptLabel: input.deptLabel }),
  }
}
