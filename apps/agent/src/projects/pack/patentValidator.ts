/**
 * Mock validator — schema/chapter Issue list (no real harness).
 * Spec: patent-pack-impl §3 · agent-platform-gap §3 next knife.
 */
import type { ProjectExpertId } from '../types'
import { deliverableForExpert } from '../patentDeliverables'

export type ValidatorIssue = {
  code: string
  message: string
  blocker: boolean
}

export type ValidatorResult = {
  seatId: ProjectExpertId
  specName: string
  issues: ValidatorIssue[]
  pass: boolean
  attempt: number
}

/** Required chapter markers per seat (mock schema). */
const REQUIRED_CHAPTERS: Partial<
  Record<ProjectExpertId, { spec: string; chapters: string[] }>
> = {
  'expert-research': {
    spec: 'prior_art_report',
    chapters: ['检索式', '命中', '三性', '结论'],
  },
  'expert-disclosure': {
    spec: 'disclosure',
    chapters: ['背景', '方案', '效果', '实施例'],
  },
  'expert-draft': {
    spec: 'claim_drafting',
    chapters: ['独权', '从权', '说明书', '支持性'],
  },
  'expert-intake': {
    spec: 'valuation',
    chapters: ['评分', '范围', 'Go'],
  },
  'expert-layout': {
    spec: 'layout_graph',
    chapters: ['主从案', '保护网', '拍板'],
  },
  'expert-oa': {
    spec: 'oa_response',
    chapters: ['争点', '策略', '陈述'],
  },
  'expert-mining': {
    spec: 'ideation',
    chapters: ['七问', '提案', '特征'],
  },
}

/**
 * attempt=1: inject 1–2 Issues (demo fail → self-heal).
 * attempt>=2: Pass (自修复重跑 mock).
 */
export function mockValidate(
  seatId: ProjectExpertId,
  attempt = 1,
): ValidatorResult {
  const cfg = REQUIRED_CHAPTERS[seatId]
  const d = deliverableForExpert(seatId)
  const specName = cfg?.spec ?? `mock_${seatId}`

  if (!cfg) {
    return {
      seatId,
      specName,
      issues: [],
      pass: true,
      attempt,
    }
  }

  if (attempt >= 2) {
    return { seatId, specName, issues: [], pass: true, attempt }
  }

  const issues: ValidatorIssue[] = []
  // Demo: first chapter missing + one soft issue
  const miss = cfg.chapters[0]
  issues.push({
    code: `${specName}.missing_chapter`,
    message: `缺少章节「${miss}」· 请按 output_spec 补齐后重跑（面向 bot 指令）`,
    blocker: true,
  })
  if (cfg.chapters.length > 2) {
    issues.push({
      code: `${specName}.thin_section`,
      message: `章节「${cfg.chapters[2]}」证据不足 · 补可核验摘录`,
      blocker: false,
    })
  }
  if (d && !d.sampleWorklog.includes('步骤时间线')) {
    issues.push({
      code: 'dual_file.worklog',
      message: '过程 worklog 缺步骤时间线 · 双文件不合格',
      blocker: true,
    })
  }

  return {
    seatId,
    specName,
    issues,
    pass: issues.filter((i) => i.blocker).length === 0,
    attempt,
  }
}

export function validatorSpecForSeat(seatId: ProjectExpertId): string {
  return REQUIRED_CHAPTERS[seatId]?.spec ?? `mock_${seatId}`
}

export function hasMockValidator(seatId: ProjectExpertId): boolean {
  return seatId in REQUIRED_CHAPTERS
}
