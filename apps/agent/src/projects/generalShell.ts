/**
 * Implicit workspace for general Grok shell (case bind only).
 * Free bots live in GeneralBotsContext — NOT welded patent experts.
 * Spec: docs/architecture/product-apps/agent-entry-modes.md (cec9d79)
 */
import type { AgentProject } from './types'
import { freeBotPath } from './generalBots'

export const GENERAL_SHELL_ID = 'ws-general-shell'

/** @deprecated Shell no longer hosts patent seats; free bots are separate. */
export const GENERAL_SHELL_DEFAULT_BOT = 'bot-seed-assistant'

/** Empty — general shell does not weld patent experts (freedom freeze). */
export const GENERAL_SHELL_EXPERT_IDS: never[] = []

/** @deprecated Prefer free bot list from GeneralBotsContext */
export const GENERAL_SHELL_SIDEBAR: Array<{
  id: string
  label: string
  disabled?: boolean
  note?: string
}> = []

export function isGeneralShellId(id: string | undefined | null): boolean {
  return id === GENERAL_SHELL_ID
}

/** Case-bind host only — no fixed expert roster on the general shell. */
export function buildGeneralShellProject(nowIso: string): AgentProject {
  return {
    id: GENERAL_SHELL_ID,
    title: '通用 Agent · 自由 bot',
    summary: '自由 bot 工作区 · 可新建 / 一对一 / 转发 · 非项目花名册',
    kind: 'general',
    caseBindState: 'none',
    expertIds: [],
    createdAt: nowIso,
    updatedAt: nowIso,
  }
}

/** Prefer freeBotPath; kept for sessions aggregation compat. */
export function generalBotPath(botId: string): string {
  return freeBotPath(botId)
}
