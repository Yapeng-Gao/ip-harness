/**
 * §134 · 一期八部各阶段产物样机目录（演示稿，非真案卷）
 * 真源：一期节点 ①–⑧ + 产品逻辑交底/申请/答复按步主稿。
 * 用途：工作台 mid / 薄部同壳正文同源；e2e 用 marker 断言非空壳。
 * 不宣称四维/六维；不碰 main-path-sample。
 */
import type { OrgDeptId } from '../departments/orgDepts'
import { HALL_DEPT_DOORS } from './hallDepts'
import {
  D4_STEPS,
  D5_STEPS,
  D6_STEPS,
  THIN_LINE_BY_DEPT,
  stepfulKindForDept,
  type WorkbenchStepDef,
} from './workbenchSteps'

export const STAGE_FIXTURE_HONEST = '样机产物 · 非真案卷 / 非官报'

export type StageStepFixture = {
  id: string
  label: string
  marker: string
  mainBody: string
}

export type StageProductFixture = {
  deptId: OrgDeptId
  hallNum: string
  label: string
  slug: string
  kind: 'thin' | 'd4' | 'd5' | 'd6'
  /** 中栏 / 薄部可检索标记（e2e） */
  marker: string
  productTitle: string
  /** 主稿或薄部作业全文 */
  productBody: string
  qualifyLine: string
  steps: StageStepFixture[]
}

function stepFixtures(steps: WorkbenchStepDef[], prefix: string): StageStepFixture[] {
  return steps.map((s) => ({
    id: s.id,
    label: s.label,
    marker: `【样机产物·${prefix}·${s.label}】`,
    mainBody: s.mainBody,
  }))
}

/** 八部大厅门牌 → 产物样机（与 workbenchSteps / 薄部同壳对齐） */
export function buildHallStageFixtures(): StageProductFixture[] {
  return HALL_DEPT_DOORS.map((door) => {
    const kindRaw = stepfulKindForDept(door.deptId)
    const kind: StageProductFixture['kind'] = kindRaw ?? 'thin'
    const thin = THIN_LINE_BY_DEPT[door.deptId]
    if (kind === 'd4') {
      const steps = stepFixtures(D4_STEPS, '交底')
      return {
        deptId: door.deptId,
        hallNum: door.num,
        label: door.label,
        slug: door.slug,
        kind,
        marker: '【样机产物·交底书】',
        productTitle: '交底书',
        productBody: D4_STEPS[0]!.mainBody,
        qualifyLine: '交底质检全绿',
        steps,
      }
    }
    if (kind === 'd5') {
      const steps = stepFixtures(D5_STEPS, '申请')
      return {
        deptId: door.deptId,
        hallNum: door.num,
        label: door.label,
        slug: door.slug,
        kind,
        marker: '【样机产物·申请包】',
        productTitle: '权利要求与说明书',
        productBody: D5_STEPS[0]!.mainBody,
        qualifyLine: '申请文件可递交（过线）',
        steps,
      }
    }
    if (kind === 'd6') {
      const steps = stepFixtures(D6_STEPS, '答复')
      return {
        deptId: door.deptId,
        hallNum: door.num,
        label: door.label,
        slug: door.slug,
        kind,
        marker: '【样机产物·答复包】',
        productTitle: '答复稿',
        productBody: D6_STEPS[0]!.mainBody,
        qualifyLine: '本轮答复可递交（D 过线）',
        steps,
      }
    }
    return {
      deptId: door.deptId,
      hallNum: door.num,
      label: door.label,
      slug: door.slug,
      kind: 'thin',
      marker: thin?.workBody.includes('【样机产物')
        ? (thin.workBody.match(/【样机产物[^】]*】/)?.[0] ?? `【样机产物·${door.label}】`)
        : `【样机产物·${door.label}】`,
      productTitle: thin?.workTitle ?? `${door.label} · 作业稿`,
      productBody: thin?.workBody ?? '',
      qualifyLine: thin?.line ?? '本站合格线待配置',
      steps: [],
    }
  })
}

export const HALL_STAGE_FIXTURES: StageProductFixture[] = buildHallStageFixtures()

export function stageFixtureForDept(
  deptId: OrgDeptId,
): StageProductFixture | undefined {
  return HALL_STAGE_FIXTURES.find((f) => f.deptId === deptId)
}

export function stageFixtureForSlug(slug: string): StageProductFixture | undefined {
  return HALL_STAGE_FIXTURES.find((f) => f.slug === slug)
}

/** 每部产物正文须够读（防空壳） */
export const MIN_STAGE_BODY_CHARS = 80

export type StageFixtureGap = {
  deptId: OrgDeptId
  label: string
  reason: string
}

export function findStageFixtureGaps(
  fixtures: StageProductFixture[] = HALL_STAGE_FIXTURES,
): StageFixtureGap[] {
  const gaps: StageFixtureGap[] = []
  if (fixtures.length < 8) {
    gaps.push({
      deptId: 'dept-intake',
      label: '大厅八部',
      reason: `期望 8 部样机，实得 ${fixtures.length}`,
    })
  }
  for (const f of fixtures) {
    if (!f.productBody.trim() || f.productBody.trim().length < MIN_STAGE_BODY_CHARS) {
      gaps.push({
        deptId: f.deptId,
        label: f.label,
        reason: `主稿过短（${f.productBody.trim().length} < ${MIN_STAGE_BODY_CHARS}）`,
      })
    }
    if (!f.marker.includes('样机产物')) {
      gaps.push({
        deptId: f.deptId,
        label: f.label,
        reason: '缺少样机产物 marker',
      })
    }
    if (f.kind !== 'thin' && f.steps.length === 0) {
      gaps.push({
        deptId: f.deptId,
        label: f.label,
        reason: '厚部缺按步样机',
      })
    }
    for (const s of f.steps) {
      if (!s.mainBody.trim() || s.mainBody.trim().length < 40) {
        gaps.push({
          deptId: f.deptId,
          label: `${f.label}/${s.label}`,
          reason: `步正文过短（${s.mainBody.trim().length}）`,
        })
      }
      if (!s.mainBody.includes('【样机产物') && !s.marker) {
        gaps.push({
          deptId: f.deptId,
          label: `${f.label}/${s.label}`,
          reason: '步正文无样机标记',
        })
      }
    }
  }
  return gaps
}

export function allHallStageFixturesOk(): boolean {
  return findStageFixtureGaps().length === 0
}
