import { getAgent } from '../data/agents'

/** User-facing agent label: Auto →「自动匹配 · {名}」, else agent name */
export function agentDisplayLabel(
  agentId: string | 'auto',
  resolvedName?: string,
): string {
  if (agentId === 'auto') {
    return resolvedName ? `自动匹配 · ${resolvedName}` : '自动匹配'
  }
  return getAgent(agentId)?.name ?? resolvedName ?? agentId
}
