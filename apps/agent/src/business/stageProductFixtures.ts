/**
 * §135 · 一期八部各阶段产物目录（连贯演示案正文，稿面按真实 Office 产物口径）
 * 真源：一期节点 ①–⑧ + 产品逻辑交底/申请/答复按步主稿。
 * 用途：工作台 mid / 薄部同壳正文同源；e2e 用正文内容标记断言，不打「样机产物」横幅。
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

/** 内部说明：演示案卷非官报；勿渲染到中栏稿面横幅 */
export const STAGE_FIXTURE_HONEST = '演示案卷口径 · 非官报（不对用户稿面展示）'

/** 各部 / 各步用于 e2e 的正文内容标记（须出现在稿面正文中） */
export const STAGE_CONTENT_MARKERS: Record<string, string> = {
  intake: '【建项卡】',
  inspire: '【选题卡】',
  mining: '【专利挖掘 · 点包】',
  disclosure: '【技术交底书】',
  'disclosure-draft': '【技术交底书】',
  'disclosure-fact': '【交底事实确认单】',
  'disclosure-qc': '【交底质检卡】',
  'disclosure-hand': '【交底→申请 交接清单】',
  draft: '【开案理解纪要】',
  'draft-a': '【开案理解纪要】',
  'draft-b': '【查新与申不申建议】',
  'draft-c-qc': '【申请文件过线检查】',
  'draft-c-submit': '【确认递交清单】',
  oa: '【审查意见争点拆解】',
  'oa-a': '【审查意见争点拆解】',
  'oa-b': '【答复策略备忘】',
  'oa-c': '【意见陈述 / 修改说明（起草稿）】',
  annuity: '年费',
  monetize: '【阶段复盘报告】',
}

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
  /** 中栏 / 薄部可检索内容标记（e2e） */
  marker: string
  productTitle: string
  /** 主稿或薄部作业全文 */
  productBody: string
  qualifyLine: string
  steps: StageStepFixture[]
}

function stepFixtures(
  steps: WorkbenchStepDef[],
  slugPrefix: string,
): StageStepFixture[] {
  return steps.map((s) => ({
    id: s.id,
    label: s.label,
    marker:
      STAGE_CONTENT_MARKERS[`${slugPrefix}-${s.id}`] ??
      STAGE_CONTENT_MARKERS[slugPrefix] ??
      s.mainBody.slice(0, 24),
    mainBody: s.mainBody,
  }))
}

/** 八部大厅门牌 → 产物（与 workbenchSteps / 薄部同壳对齐） */
export function buildHallStageFixtures(): StageProductFixture[] {
  return HALL_DEPT_DOORS.map((door) => {
    const kindRaw = stepfulKindForDept(door.deptId)
    const kind: StageProductFixture['kind'] = kindRaw ?? 'thin'
    const thin = THIN_LINE_BY_DEPT[door.deptId]
    if (kind === 'd4') {
      const steps = stepFixtures(D4_STEPS, 'disclosure')
      return {
        deptId: door.deptId,
        hallNum: door.num,
        label: door.label,
        slug: door.slug,
        kind,
        marker: STAGE_CONTENT_MARKERS.disclosure,
        productTitle: '技术交底书',
        productBody: D4_STEPS[0]!.mainBody,
        qualifyLine: '交底质检全绿',
        steps,
      }
    }
    if (kind === 'd5') {
      const steps = stepFixtures(D5_STEPS, 'draft')
      return {
        deptId: door.deptId,
        hallNum: door.num,
        label: door.label,
        slug: door.slug,
        kind,
        marker: STAGE_CONTENT_MARKERS.draft,
        productTitle: '权利要求与说明书',
        productBody: D5_STEPS[0]!.mainBody,
        qualifyLine: '申请文件可递交（过线）',
        steps,
      }
    }
    if (kind === 'd6') {
      const steps = stepFixtures(D6_STEPS, 'oa')
      return {
        deptId: door.deptId,
        hallNum: door.num,
        label: door.label,
        slug: door.slug,
        kind,
        marker: STAGE_CONTENT_MARKERS.oa,
        productTitle: '答复稿',
        productBody: D6_STEPS[0]!.mainBody,
        qualifyLine: '本轮答复可递交（D 过线）',
        steps,
      }
    }
    const contentMarker =
      STAGE_CONTENT_MARKERS[door.slug] ??
      thin?.workBody.match(/【[^】]+】/)?.[0] ??
      `【${door.label}】`
    return {
      deptId: door.deptId,
      hallNum: door.num,
      label: door.label,
      slug: door.slug,
      kind: 'thin',
      marker: contentMarker,
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

const FORBIDDEN_BANNER = /【样机产物|样机产物 ·/

export function findStageFixtureGaps(
  fixtures: StageProductFixture[] = HALL_STAGE_FIXTURES,
): StageFixtureGap[] {
  const gaps: StageFixtureGap[] = []
  if (fixtures.length < 8) {
    gaps.push({
      deptId: 'dept-intake',
      label: '大厅八部',
      reason: `期望 8 部产物，实得 ${fixtures.length}`,
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
    if (!f.marker.trim()) {
      gaps.push({
        deptId: f.deptId,
        label: f.label,
        reason: '缺少内容标记 marker',
      })
    } else if (!f.productBody.includes(f.marker) && f.kind === 'thin') {
      // thin: marker should appear in body; thick uses first-step marker which may be step title
      if (!f.productBody.includes(f.marker.replace(/【|】/g, '').slice(0, 4))) {
        gaps.push({
          deptId: f.deptId,
          label: f.label,
          reason: `正文未含内容标记 ${f.marker}`,
        })
      }
    }
    if (FORBIDDEN_BANNER.test(f.productBody) || FORBIDDEN_BANNER.test(f.productTitle)) {
      gaps.push({
        deptId: f.deptId,
        label: f.label,
        reason: '稿面仍含「样机产物」横幅',
      })
    }
    if (f.kind !== 'thin' && f.steps.length === 0) {
      gaps.push({
        deptId: f.deptId,
        label: f.label,
        reason: '厚部缺按步产物',
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
      if (FORBIDDEN_BANNER.test(s.mainBody)) {
        gaps.push({
          deptId: f.deptId,
          label: `${f.label}/${s.label}`,
          reason: '步正文仍含「样机产物」横幅',
        })
      }
      if (s.marker && !s.mainBody.includes(s.marker)) {
        gaps.push({
          deptId: f.deptId,
          label: `${f.label}/${s.label}`,
          reason: `步正文未含标记 ${s.marker}`,
        })
      }
    }
  }
  return gaps
}

export function allHallStageFixturesOk(): boolean {
  return findStageFixtureGaps().length === 0
}
