/** Mock case helpers — agent-case-binding · no real case-core */

/** none / bound / pending_create（创建并绑定短瞬 loading，见 CaseBindControls） */
export type CaseBindState = 'none' | 'bound' | 'pending_create'

export function newMockCaseId(): string {
  return `mock-case-${Date.now()}`
}

export function isMockCaseId(id: string | undefined): boolean {
  return !!id && (id.startsWith('mock-case-') || id.startsWith('c-mock-'))
}

export function caseBindStateFromId(caseId: string | undefined): CaseBindState {
  return caseId ? 'bound' : 'none'
}

export function mockCaseLabel(title: string, caseId: string): string {
  return `${title || '样机案'}（未进中台库 · ${caseId}）`
}
