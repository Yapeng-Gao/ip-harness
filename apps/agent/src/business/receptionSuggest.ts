/**
 * 大厅接待 · 示意分析（01-接待与引导 §4.1）
 * DEMO：按文件名/原话弱规则打分；非真检索/真鉴权。定案权在用户。
 */
import { HALL_DEPT_DOORS, type HallDeptDoor } from './hallDepts'

export type ReceptionMaterialTag =
  | '技术说明·灵感草稿'
  | '交底书（草稿|成稿）'
  | '申请文件包'
  | '审查意见通知书·对比文件'
  | '授权证书·年费·期限函'
  | '立项材料·商业计划'
  | '挖掘·创新点清单'
  | '其他杂件'

export type ReceptionSuggest = {
  /** 材料清单（示意） */
  materials: Array<{ name: string; tag: ReceptionMaterialTag; confidence: '高' | '中' | '低' }>
  /** 意图假设 1～3 */
  intents: string[]
  /** 主推 */
  primary: HallDeptDoor
  /** 至多 2 备选 */
  alts: HallDeptDoor[]
  /** 一句话理由 */
  reason: string
  /** 相对主推的粗缺口 */
  roughGaps: string[]
  demo: true
}

function doorBySlug(slug: string): HallDeptDoor {
  return HALL_DEPT_DOORS.find((d) => d.slug === slug) ?? HALL_DEPT_DOORS[3]!
}

/** 文件名 / 用户原话 → 示意建议 */
export function suggestFromReceptionInput(input: {
  fileNames?: string[]
  goalText?: string
}): ReceptionSuggest {
  const names = (input.fileNames ?? []).map((n) => n.trim()).filter(Boolean)
  const text = (input.goalText ?? '').trim()
  const blob = `${names.join(' ')} ${text}`.toLowerCase()

  const materials = names.length
    ? names.map((name) => {
        const n = name.toLowerCase()
        if (/通知书|oa|审查意见|对比文件|驳回/.test(n))
          return { name, tag: '审查意见通知书·对比文件' as const, confidence: '高' as const }
        if (/授权|年费|缴费|证书|期限/.test(n))
          return { name, tag: '授权证书·年费·期限函' as const, confidence: '高' as const }
        if (/交底/.test(n))
          return { name, tag: '交底书（草稿|成稿）' as const, confidence: '中' as const }
        if (/申请|权利要求|说明书|摘要/.test(n))
          return { name, tag: '申请文件包' as const, confidence: '中' as const }
        if (/立项|商业计划|bp/.test(n))
          return { name, tag: '立项材料·商业计划' as const, confidence: '中' as const }
        if (/挖掘|创新点|拆案/.test(n))
          return { name, tag: '挖掘·创新点清单' as const, confidence: '中' as const }
        if (/技术|方案|图纸|说明/.test(n))
          return { name, tag: '技术说明·灵感草稿' as const, confidence: '中' as const }
        return { name, tag: '其他杂件' as const, confidence: '低' as const }
      })
    : [
        {
          name: text ? '（来稿口述/粘贴）' : '（尚未命名材料）',
          tag: '其他杂件' as const,
          confidence: '低' as const,
        },
      ]

  // 权重：用户原话 ＞ 强物件 ＞ 弱技术堆
  let primarySlug = 'disclosure'
  let reason = '材料偏技术说明，先建议交底部把事实写齐'
  let intents: string[] = ['你可能想先把技术事实写成合格交底']
  let roughGaps = ['尚缺合格交底书（示意粗看）']
  const alts: string[] = []

  if (/答.?oa|审查意见|通知书|驳回|补正/.test(blob) || materials.some((m) => m.tag === '审查意见通知书·对比文件')) {
    primarySlug = 'oa'
    reason = '看到审查意见类材料/说法，主推答复部'
    intents = ['你这次更像要答审查意见', '若尚未递交过，也可能要先走申请部']
    roughGaps = ['请确认通知书期限与对比文件是否齐（示意）']
    alts.push('draft')
  } else if (/年费|授权|别超时|台账|缴费/.test(blob) || materials.some((m) => m.tag === '授权证书·年费·期限函')) {
    primarySlug = 'annuity'
    reason = '授权/年费类材料，主推维护部'
    intents = ['你可能要盯期限或年费']
    roughGaps = ['请确认证书号与应缴期限（示意）']
    alts.push('monetize')
  } else if (/复盘|年底|创新总结/.test(blob)) {
    primarySlug = 'monetize'
    reason = '复盘/年度总结说法，主推复盘部'
    intents = ['你可能要做阶段/年度复盘']
    roughGaps = ['多案台账是否齐（示意）']
  } else if (/挖掘|拆案|布局|创新点/.test(blob) || materials.some((m) => m.tag === '挖掘·创新点清单')) {
    primarySlug = 'mining'
    reason = '挖掘/拆案诉求，主推专利挖掘部'
    intents = ['你可能要把研发资料拆成可写的创新点']
    roughGaps = ['研发资料是否成套（示意）']
    alts.push('disclosure')
  } else if (/立项|开个项目|立不立/.test(blob) || materials.some((m) => m.tag === '立项材料·商业计划')) {
    primarySlug = 'intake'
    reason = '立项/建项说法，主推立项部'
    intents = ['你可能要先判断方向立不立得住']
    roughGaps = ['决策材料是否齐（示意）']
    alts.push('inspire')
  } else if (/没思路|想办法|卡点|激发/.test(blob)) {
    primarySlug = 'inspire'
    reason = '问题卡点/没思路，主推创新激发部'
    intents = ['你可能要先找路径与方案']
    roughGaps = ['问题描述是否写清（示意）']
    alts.push('mining')
  } else if (
    (/申请|递交|开案撰写/.test(blob) || materials.some((m) => m.tag === '申请文件包')) &&
    !materials.some((m) => m.tag === '交底书（草稿|成稿）') &&
    !/交底/.test(blob)
  ) {
    // 要申请但无交底 → 建议改④
    primarySlug = 'disclosure'
    reason = '你要申请/递交，但材料里未见合格交底 → 建议先交底部（⑤门槛要交底）'
    intents = ['你可能想递申请', '材料侧更像还缺交底']
    roughGaps = ['缺合格交底书；坚持进申请部也可，进部后门槛检（示意）']
    alts.push('draft')
  } else if (
    (/申请|递交/.test(blob) || materials.some((m) => m.tag === '申请文件包')) &&
    (materials.some((m) => m.tag === '交底书（草稿|成稿）') || /交底/.test(blob))
  ) {
    primarySlug = 'draft'
    reason = '有交底迹象且要申请，主推申请部'
    intents = ['你这次更像要写申请/递交']
    roughGaps = ['交底是否已合格过线（进部门槛检，示意）']
    alts.push('disclosure')
  } else if (/写交底|交底不合格|技术事实/.test(blob) || materials.some((m) => m.tag === '交底书（草稿|成稿）') || materials.some((m) => m.tag === '技术说明·灵感草稿')) {
    primarySlug = 'disclosure'
    reason = '技术说明/交底诉求，主推交底部'
    intents = ['你可能想先把技术写成交底']
    roughGaps = ['图纸/实施例是否齐（示意粗看）']
    alts.push('draft', 'mining')
  } else if (!names.length && !text) {
    primarySlug = 'disclosure'
    reason = '尚未看到材料或目标，先介绍可从交底部或点八部门牌'
    intents = ['还不清楚这次要办成哪一件']
    roughGaps = ['请上传材料，或点下方目标/部门名牌']
  }

  const primary = doorBySlug(primarySlug)
  const altDoors = alts
    .filter((s) => s !== primarySlug)
    .slice(0, 2)
    .map(doorBySlug)

  return {
    materials,
    intents: intents.slice(0, 3),
    primary,
    alts: altDoors,
    reason,
    roughGaps,
    demo: true,
  }
}
