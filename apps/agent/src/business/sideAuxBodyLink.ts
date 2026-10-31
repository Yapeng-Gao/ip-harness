/**
 * SIDE_AUX（查新·附图·递交）↔ 工作台中栏（样机；非官报）
 * 与本稿零件同语感：点挂件 → 打开宿主部台中栏种子；禁真检索/真递交。
 */
import type { OrgDeptId } from '../departments/orgDepts'
import { deptSlug } from '../departments/orgDepts'
import {
  PROF_AUX_HONEST,
  SIDE_AUX_DEPTS,
  type ManuscriptPart,
} from './professionalAuxParts'

export const SIDE_AUX_BODY_HONEST =
  '辅链挂件联中栏 · 样机示意 · 非真检索 / 非真递交 / 非官报'

/** 辅链挂件落在哪一主部改稿（不另开第九部门） */
export const SIDE_AUX_HOST: Record<string, OrgDeptId> = {
  research: 'dept-disclosure',
  figure: 'dept-draft',
  file: 'dept-oa',
}

export type SideAuxDept = (typeof SIDE_AUX_DEPTS)[number]

export function findSideAuxDept(sideId: string): SideAuxDept | undefined {
  return SIDE_AUX_DEPTS.find((d) => d.id === sideId)
}

export function findSideAuxPart(
  sideId: string,
  partId: string,
): ManuscriptPart | undefined {
  return findSideAuxDept(sideId)?.parts.find((p) => p.id === partId)
}

export function sideAuxHostDeptId(sideId: string): OrgDeptId {
  return SIDE_AUX_HOST[sideId] ?? 'dept-disclosure'
}

/** 材料树 id：side-{sideId}-{partId} */
export function sideAuxMaterialId(sideId: string, partId: string): string {
  return `side-${sideId}-${partId}`
}

export function parseSideAuxMaterialId(
  materialId: string,
): { sideId: string; partId: string } | null {
  if (!materialId.startsWith('side-')) return null
  const rest = materialId.slice('side-'.length)
  const i = rest.indexOf('-')
  if (i <= 0) return null
  const sideId = rest.slice(0, i)
  const partId = rest.slice(i + 1)
  if (!sideId || !partId) return null
  if (!findSideAuxPart(sideId, partId)) return null
  return { sideId, partId }
}

/** 专业面 / 挂件 → 宿主部台中栏 */
export function sideAuxWorkbenchHref(input: {
  caseId: string
  sideId: string
  partId: string
}): string {
  const host = sideAuxHostDeptId(input.sideId)
  const slug = deptSlug(host)
  const q = new URLSearchParams()
  q.set('side', input.sideId)
  q.set('sidePart', input.partId)
  return `/agent/cases/${encodeURIComponent(input.caseId)}/depts/${slug}?${q.toString()}`
}

/** 卡上辅链钩子 id → 默认打开的 SIDE_AUX 零件 */
export function auxHookToSideTarget(
  hookId: string,
): { sideId: string; partId: string } | null {
  if (hookId.startsWith('research') || hookId.includes('research')) {
    return { sideId: 'research', partId: 'hit-list' }
  }
  if (hookId.startsWith('fig') || hookId.includes('figure')) {
    return { sideId: 'figure', partId: 'sheet' }
  }
  if (
    hookId.startsWith('file') ||
    hookId.includes('fee') ||
    hookId.includes('pack')
  ) {
    return { sideId: 'file', partId: 'pack' }
  }
  return null
}

export function seedBodyForSideAux(input: {
  sideId: string
  part: ManuscriptPart
  sideLabel?: string
}): string {
  const side = findSideAuxDept(input.sideId)
  const custom = SIDE_SEED_EXTRA[`${input.sideId}:${input.part.id}`]
  const lines = [
    `# ${input.part.label}`,
    '',
    `> ${PROF_AUX_HONEST}`,
    `> ${SIDE_AUX_BODY_HONEST}`,
    '',
    `## 辅链 · ${side?.label ?? input.sideId}`,
    input.part.hint,
    '',
    side?.honest ? `> ${side.honest}` : '',
    '',
  ].filter((x) => x !== '')
  if (custom) {
    lines.push(...custom, '')
  } else {
    lines.push(
      '## 挂件草稿（待改）',
      '（种子）在中栏改挂件说明；不代替真库检索 / 真制图 / 真递交。',
      '',
    )
  }
  lines.push(
    `— ${input.sideLabel ?? side?.label ?? '辅链'} · 挂件「${input.part.label}」`,
  )
  return lines.join('\n')
}

const SIDE_SEED_EXTRA: Record<string, string[]> = {
  'research:hit-list': [
    '## 对比清单稿（示意）',
    '| # | 对照点 | 初判 |',
    '|---|---|---|',
    '| 1 | （示意条目） | 待核 |',
    '| 2 | （示意条目） | 待核 |',
    '',
    '非真库命中 · 仅给主链对照用。',
  ],
  'research:concl': [
    '## 结论一页（示意）',
    '新颖性 / 创造性要点各一句；交主链立项或交底对照，非官文。',
  ],
  'figure:sheet': [
    '## 图面一览（示意）',
    '| 图号 | 内容 | 与权要 |',
    '|---|---|---|',
    '| 图1 | 系统框图 | 待对齐 |',
    '| 图2 | 流程 | 待对齐 |',
  ],
  'figure:callout': [
    '## 标注校对条',
    '- [ ] 图注 ⊆ 权项术语',
    '- [ ] 图号已冻结（样机）',
  ],
  'file:pack': [
    '## 递交包目录（示意）',
    '- [ ] 请求书',
    '- [ ] 说明书 / 权要 / 摘要',
    '- [ ] 附图',
    '',
    '**禁真递交官方** · 仅齐套勾选示意。',
  ],
  'file:receipt': [
    '## 回执备忘（示意）',
    '样机回执占位；非官方通道、非真案号。',
  ],
}

export function resolveSideAuxBody(input: {
  materialId: string
}): { sideId: string; part: ManuscriptPart; body: string } | null {
  const parsed = parseSideAuxMaterialId(input.materialId)
  if (!parsed) return null
  const part = findSideAuxPart(parsed.sideId, parsed.partId)
  if (!part) return null
  return {
    sideId: parsed.sideId,
    part,
    body: seedBodyForSideAux({ sideId: parsed.sideId, part }),
  }
}
