/**
 * Implicit default workspace for the Grok-style general Agent shell.
 * Reuses ProjectFolderContext threads / experts — not shown as a project folder.
 * Spec: docs/architecture/product-apps/agent-entry-modes.md
 */
import { PATENT_PROJECT_EXPERT_IDS } from './expertsPatent'
import type { AgentProject, ProjectExpertId } from './types'

export const GENERAL_SHELL_ID = 'ws-general-shell'

/** Default bot when opening /agent with no :botId */
export const GENERAL_SHELL_DEFAULT_BOT: ProjectExpertId = 'orchestrator'

/** Shell-level patent pack seats (active). Mining is UI-only gray. */
export const GENERAL_SHELL_EXPERT_IDS: ProjectExpertId[] = [
  ...PATENT_PROJECT_EXPERT_IDS,
]

/** Sidebar order including grayed mining seat (not a real thread). */
export const GENERAL_SHELL_SIDEBAR: Array<{
  id: string
  label: string
  disabled?: boolean
  note?: string
}> = [
  { id: 'orchestrator', label: '总控席' },
  { id: 'expert-search', label: '检索专家' },
  { id: 'expert-draft', label: '撰稿专家' },
  { id: 'expert-fto', label: '自由实施专家' },
  {
    id: 'expert-mining',
    label: '挖掘专家',
    disabled: true,
    note: '样机灰显 · 另立项可用',
  },
]

export function isGeneralShellId(id: string | undefined | null): boolean {
  return id === GENERAL_SHELL_ID
}

export function buildGeneralShellProject(nowIso: string): AgentProject {
  return {
    id: GENERAL_SHELL_ID,
    title: '通用 Agent · Grok 壳',
    summary: '壳级专利专家 + 总控 · 无项目夹导航',
    kind: 'domain',
    domainPackId: 'patent',
    caseBindState: 'none',
    expertIds: [...GENERAL_SHELL_EXPERT_IDS],
    createdAt: nowIso,
    updatedAt: nowIso,
  }
}

export function generalBotPath(botId: ProjectExpertId | string): string {
  if (botId === 'orchestrator' || !botId) return '/agent'
  return `/agent/bots/${botId}`
}
