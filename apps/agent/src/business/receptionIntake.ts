import { HALL_DEPT_DOORS } from './hallDepts'
import { suggestFromReceptionInput, type ReceptionSuggest } from './receptionSuggest'

export type ReceptionGoal = { slug: string; label: string }
export const RECEPTION_GOALS: ReceptionGoal[] = [
  { slug: 'intake', label: '判断方向，决定要不要立项' },
  { slug: 'inspire', label: '研发卡住了，想找改进方案' },
  { slug: 'mining', label: '从研发资料里找创新点、拆专利' },
  { slug: 'disclosure', label: '把技术说清楚，写好或修改交底' },
  { slug: 'draft', label: '准备专利申请文件' },
  { slug: 'oa', label: '处理审查意见或补正' },
  { slug: 'annuity', label: '管理年费、期限和专利台账' },
  { slug: 'monetize', label: '做阶段或年度复盘' },
]
const patterns: Record<string, RegExp> = {
  intake: /立项|建项目|开个项目|立不立|值不值得|是否值得|要不要申请|是否申请/,
  inspire: /没思路|想办法|卡点|卡住|激发|改进方案|改进思路/,
  mining: /挖掘|挖专利|挖.*创新|找创新点|拆案|拆专利|布局/,
  disclosure: /写.*交底|改.*交底|整理.*交底|交底.*修改|技术事实|写成交底/,
  draft: /申请|递交|权利要求|说明书|撰写/,
  oa: /答.?oa|审查意见|通知书|驳回|补正/,
  annuity: /年费|授权|别超时|台账|缴费|期限管理/,
  monetize: /复盘|年底|创新总结|年度总结/,
}
export type ReceptionIntake =
  | { kind: 'clarify'; topic: 'intent' | 'priority' | 'disclosure'; question: string; explanation: string; choices: ReceptionGoal[] }
  | { kind: 'ready'; goal: ReceptionGoal; suggest: ReceptionSuggest; goalSummary: string }

/** Front desk routing only: selected files are metadata, never evidence of content or completeness. */
export function assessReceptionIntake(input: {
  goalText: string
  fileNames: string[]
  chosenGoal?: ReceptionGoal
  disclosureState?: 'have' | 'missing' | 'unsure'
}): ReceptionIntake {
  const text = input.goalText.trim()
  let goals = RECEPTION_GOALS.filter((g) => patterns[g.slug]!.test(text))
  // A decision about applying is one intent; mentioning application does not add a second task.
  if (/值不值得|是否值得|要不要申请|是否申请/.test(text) && !/还要|再.*申请|然后.*申请|并.*申请/.test(text)) goals = goals.filter((g) => g.slug !== 'draft')
  // A notice is an object, not a second request when another task is explicitly stated.
  if (goals.length > 1 && /有.*通知书|收到.*通知书/.test(text) && !/答复|处理.*通知书|处理.*审查/.test(text)) goals = goals.filter((g) => g.slug !== 'oa')
  if (!input.chosenGoal && goals.length !== 1) {
    const multiple = goals.length > 1
    return { kind: 'clarify', topic: multiple ? 'priority' : 'intent',
      question: multiple ? '这次有几件事，想先办成哪一件？' : input.fileNames.length ? '文件名已登记。这次最希望用这些材料办成什么事？' : '没关系，我们先选一个最接近的目标。你想先办成什么事？',
      explanation: multiple ? '先确定本次重点，其他目标保留在来意里，后续继续办理。' : input.fileNames.length ? '目前尚未读取文件正文；文件名只能提供线索，不能替你决定用途。' : '可以点一个选项，也可以补充自己的说法；暂时没有材料也能开始。',
      choices: multiple ? goals : RECEPTION_GOALS }
  }
  const goal = input.chosenGoal ?? goals[0]!
  const state = input.disclosureState ?? (/不确定.*交底|不清楚.*交底/.test(text) ? 'unsure' : /没有.*交底|无交底|还没.*交底|尚未.*交底/.test(text) ? 'missing' : /已有.*交底|有.*交底书/.test(text) ? 'have' : undefined)
  if (goal.slug === 'draft' && !state) {
    return { kind: 'clarify', topic: 'disclosure', question: '准备申请前，你手上有交底书吗？',
      explanation: input.fileNames.some((name) => /交底/.test(name)) ? '文件名里有“交底”，但还没读取正文。请确认它是否是这次申请要用的材料。' : '只确认材料现状。没有或不确定也没关系，我会说明下一步。',
      choices: [{ slug: 'have', label: '有交底书，准备写申请' }, { slug: 'missing', label: '还没有，只有技术说明或想法' }, { slug: 'unsure', label: '不确定，想先请专家看看' }] }
  }
  const legacy = suggestFromReceptionInput({ goalText: text, fileNames: input.fileNames })
  const targetSlug = goal.slug === 'draft' && state !== 'have' ? 'disclosure' : goal.slug
  const primary = HALL_DEPT_DOORS.find((d) => d.slug === targetSlug)!
  const altSlugs = targetSlug !== goal.slug ? [goal.slug] : goal.slug === 'disclosure' ? ['draft', 'mining'] : []
  const materialNote = goal.slug === 'draft' ? state === 'have' ? '；用户表示已有交底书，内容与完整性待部门检查' : state === 'missing' ? '；用户表示尚无交底书' : '；用户不确定交底材料是否可用' : ''
  const summary = `${text || (input.fileNames.length ? '用户先提供文件名称' : '用户通过前台选择目标')}${text ? '；' : '，'}本次先办：${goal.label}${materialNote}`
  const reason = targetSlug !== goal.slug ? '你想准备申请；交底材料尚未明确，建议先由交底部整理或检查。也可以选择申请部先沟通。' : `按你确认的目标，建议由${primary.label}承接。`
  const gaps: Record<string, string> = {
    intake: '可补充：方向背景、希望解决的问题、预算或时间要求。',
    inspire: '可补充：卡住的问题、已尝试的方法、希望达到的效果。没有文档也可先描述。',
    mining: '可附研发说明、图纸或实验记录，帮助定位创新点；手头有多少先给多少。',
    disclosure: '可附技术说明、图纸、实验记录或交底草稿，用于说清结构、步骤和效果。没有文件也可口述。',
    draft: '可附交底书和已有申请草稿，用于核对技术事实与保护范围；是否足够由部门检查。',
    oa: '可附通知书、对比文件和原申请文本，并说明截止时间，便于确定答复范围。',
    annuity: '可附专利台账、缴费或期限通知，便于核对需要管理的事项。',
    monetize: '可附阶段目标、项目或专利台账、已有总结，用于确定复盘范围。',
  }
  return { kind: 'ready', goal, goalSummary: summary, suggest: { ...legacy, primary, alts: altSlugs.map((slug) => HALL_DEPT_DOORS.find((d) => d.slug === slug)!),
    intents: [goal.label], reason, roughGaps: [gaps[targetSlug]!] } }
}
