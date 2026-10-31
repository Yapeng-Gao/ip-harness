/**
 * 进入门槛硬挡 · 对齐 00-用户与系统 §6
 * 大厅可点进任一部门 ≠ 已满足开干条件。演示用 progress/pending 启发式；非真鉴权。
 */
import type { OrgDeptId } from '../departments/orgDepts'
import type { ProjectExpertId } from '../projects/types'

export type EntryGateInput = {
  deptId: OrgDeptId
  /** 已完成席 */
  doneSeatIds: readonly ProjectExpertId[]
  filed?: boolean
  /** 是否已有交底齐套确认 */
  disclosureConfirmed?: boolean
  /** URL 强制旁路演示：?gate=bypass */
  bypass?: boolean
  /**
   * 代理陪同绕 B2（N-P1-2）：仅 agency + escort 可无交底进⑤壳。
   * 企业无工单仍硬挡。
   */
  agencyEscort?: boolean
}

export type EntryGateResult = {
  /** true = 可开干主作业；false = 硬挡（可看壳、不可假装已开干） */
  ok: boolean
  title: string
  reason: string
  /** 诚实：演示启发式，非官报/真鉴权 */
  honesty: string
  fixHint: string
  fixHrefHint: 'disclosure' | 'draft' | 'hall' | 'company' | null
}

const HONEST =
  '演示门槛 · 非真鉴权 / 非官报通道；过线以案卷材料与硬请示为准。'

export function evaluateEntryGate(input: EntryGateInput): EntryGateResult {
  if (input.bypass) {
    return {
      ok: true,
      title: '已旁路进入门槛（演示）',
      reason: 'URL ?gate=bypass · 仅本地演示',
      honesty: HONEST,
      fixHint: '',
      fixHrefHint: null,
    }
  }

  const done = new Set(input.doneSeatIds)
  const disclosureOk =
    input.disclosureConfirmed || done.has('expert-disclosure')
  const draftLikeOk =
    done.has('expert-draft') || done.has('expert-filing') || Boolean(input.filed)

  switch (input.deptId) {
    case 'dept-draft':
    case 'dept-filing':
      if (!disclosureOk) {
        if (input.agencyEscort) {
          return {
            ok: true,
            title: '代理陪同进入⑤（演示）',
            reason:
              '代理身份陪同可绕 B2 进申请部壳；企业无工单仍须交底全绿。不装交底已过线。',
            honesty: HONEST,
            fixHint: '',
            fixHrefHint: null,
          }
        }
        return {
          ok: false,
          title: '⑤ 进入门槛未过',
          reason: '开写/递交前须交底全绿（或④→⑤工单已确认可交）。B2：自带交底不过→退④/补料。',
          honesty: HONEST,
          fixHint: '先去交底部完成事实确认与全绿，或打开④→⑤工单。',
          fixHrefHint: 'disclosure',
        }
      }
      break
    case 'dept-oa':
      if (!draftLikeOk && !input.filed) {
        return {
          ok: false,
          title: '⑥ 进入门槛未过',
          reason: '开干答复前通常须已有申请号/已递交态（演示：已递交或撰写席完成）。',
          honesty: HONEST,
          fixHint: '先完成⑤递交确认，或从公司首页确认本案已递交。',
          fixHrefHint: 'draft',
        }
      }
      break
    case 'dept-annuity':
      if (!input.filed && !draftLikeOk) {
        return {
          ok: false,
          title: '⑦ 进入门槛未过',
          reason: '维护托管针对确权/已递交后资产；本案尚未到可托管态（演示）。',
          honesty: HONEST,
          fixHint: '确权或至少完成递交后再进维护部。',
          fixHrefHint: 'company',
        }
      }
      break
    default:
      break
  }

  return {
    ok: true,
    title: '进入门槛已满足（演示）',
    reason: '可开干本部门主作业；结束仍看合格线与硬请示。',
    honesty: HONEST,
    fixHint: '',
    fixHrefHint: null,
  }
}
