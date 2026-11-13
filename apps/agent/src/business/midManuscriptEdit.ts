/**
 * §136：部台中栏主稿可编辑 / 另存；划选后问 AI / 改这段 → 右栏 composer。
 * §138：收口/待拍/回看默认只读；脏改须再请示；选区 chip 在待拍/收口降级。
 * 不接 Word 式批注气泡。
 */

export const MID_EDIT_DIRTY_HINT = '未保存的改动'
export const MID_SAVE_HINT = '已保存到本席成果'
export const MID_SAVE_VERSION_PREFIX = '已另存'
export const MID_SEALED_READONLY_HINT = '本站已确认 · 稿面只读'
export const MID_AWAITING_READONLY_HINT = '待你拍板 · 稿面只读'
export const MID_LOOKBACK_READONLY_HINT = '回看已办 · 只读案卷'
export const MID_DIRTY_NEED_REASK_HINT = '改后须再请示'
export const MID_UNLOCK_EDIT_LABEL = '改技术含义（须再请示）'
export const MID_SELECTION_WARN_HINT = '改后须再请示'

export function isMidManuscriptDirty(draft: string, source: string): boolean {
  return draft !== source
}

/** 收口 / 待拍 / 回看：中栏默认只读 */
export function isMidManuscriptSealed(input: {
  stationClosed: boolean
  awaitingConfirm: boolean
  lookback: boolean
}): boolean {
  return input.lookback || input.stationClosed || input.awaitingConfirm
}

/**
 * 选区 chip：待拍/回看/未解锁收口 → 收起；解锁后改稿 → 警告；否则正常。
 */
export function midSelectionChipMode(input: {
  sealed: boolean
  unlocked: boolean
  awaitingConfirm: boolean
  lookback: boolean
}): 'hide' | 'warn' | 'ok' {
  if (input.lookback || input.awaitingConfirm) return 'hide'
  if (input.sealed && !input.unlocked) return 'hide'
  if (input.sealed && input.unlocked) return 'warn'
  return 'ok'
}

/** 顶条：收口态回看语义，勿「1/4 · 站收口已确认」拧成步骤装饰 */
export function midProcessTopstrip(input: {
  sealed: boolean
  stepOrdinal: number
  stepCount: number
  stepLabel: string
}): { line: string; hint: string; density: 'lookback' | 'step' } {
  if (input.sealed) {
    return {
      line: '本站已确认 · 回看案卷',
      hint: '步条仅回看 · 不是未收口步骤',
      density: 'lookback',
    }
  }
  return {
    line: `主稿阶段 · ${input.stepOrdinal}/${input.stepCount} · ${input.stepLabel}`,
    hint: '一部多步 · 产出仍是这份主稿',
    density: 'step',
  }
}

/** 划选进右栏驾驭框的带引用草稿 */
export function buildSelectionAskDraft(input: {
  selection: string
  mode: 'ask' | 'revise'
  manuscriptTitle?: string
  needReask?: boolean
}): string {
  const raw = input.selection.replace(/\s+$/g, '').replace(/^\s+/g, '')
  if (!raw) return ''
  const clipped = raw.length > 900 ? `${raw.slice(0, 900)}…` : raw
  const quoted = clipped
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n')
  const from = input.manuscriptTitle?.trim()
    ? `选自「${input.manuscriptTitle.trim()}」\n`
    : ''
  const reask = input.needReask ? `\n（本稿已收口：改技术含义后须再请示）` : ''
  if (input.mode === 'revise') {
    return `${from}${quoted}\n\n请改这段（保持本案口径，直接给改写稿）：${reask}`
  }
  return `${from}${quoted}\n\n请就以上选段回答：${reask}`
}

export function midEditSavePayload(draft: string): { artifactMarkdown: string } {
  return { artifactMarkdown: draft }
}

/** 收口后保存提示：不能静默当已拍 */
export function midSaveHintAfterSeal(dirtySaved: boolean): string {
  return dirtySaved ? `${MID_SAVE_HINT} · ${MID_DIRTY_NEED_REASK_HINT}` : MID_SAVE_HINT
}
