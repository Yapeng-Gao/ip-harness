/**
 * §136：部台中栏主稿可编辑 / 另存；划选后问 AI / 改这段 → 右栏 composer。
 * 不接 Word 式批注气泡。
 */

export const MID_EDIT_DIRTY_HINT = '未保存的改动'
export const MID_SAVE_HINT = '已保存到本席成果'
export const MID_SAVE_VERSION_PREFIX = '已另存'

export function isMidManuscriptDirty(draft: string, source: string): boolean {
  return draft !== source
}

/** 划选进右栏驾驭框的带引用草稿 */
export function buildSelectionAskDraft(input: {
  selection: string
  mode: 'ask' | 'revise'
  manuscriptTitle?: string
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
  if (input.mode === 'revise') {
    return `${from}${quoted}\n\n请改这段（保持本案口径，直接给改写稿）：`
  }
  return `${from}${quoted}\n\n请就以上选段回答：`
}

export function midEditSavePayload(draft: string): { artifactMarkdown: string } {
  return { artifactMarkdown: draft }
}
