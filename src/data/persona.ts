/**
 * Compat: domain persona rules in packages/domain; URL route isolation stays here.
 */
export {
  type PersonaId,
  type PersonaDef,
  PERSONAS,
  PERSONA_BY_ID,
  personaToRole,
  defaultPersonaForRole,
  personaBlocksHandoffAction,
  personaBlocksHitlGate,
  personaBlocksPay,
  personaCanGo,
  personaCanVote,
  personaVoteIsAuditable,
  personaCanAccessWorkbench,
  personaPrefersPortal,
  personaInboxMode,
  PERSONA_LABELS,
  personaCanAccessAgent,
  personaCanCreateAgentSession,
} from '../../packages/domain/src/persona'

import type { PersonaId } from '../../packages/domain/src/persona'

export type PersonaRouteDecision = {
  blocked: boolean
  reason?: string
  redirectTo?: string
  redirectLabel?: string
}

const CASE_DETAIL_RE = /^\/cases\/[^/]+/

function isBillingPath(pathname: string): boolean {
  return (
    pathname.startsWith('/billing') ||
    pathname === '/settings/billing' ||
    pathname.startsWith('/settings/billing/')
  )
}

function isWorkbenchPath(pathname: string): boolean {
  return pathname === '/workbench' || pathname.startsWith('/workbench/')
}

function isAgentPath(pathname: string): boolean {
  return (
    pathname === '/agent' ||
    pathname.startsWith('/agent/') ||
    pathname.startsWith('/ip-agent') ||
    pathname === '/agents' ||
    pathname.startsWith('/agents/')
  )
}

/** 委员可写：立项投票；其余工作台阶段视为写操作页 */
export function isCommitteeWriteWorkbench(pathname: string): boolean {
  if (!isWorkbenchPath(pathname)) return false
  if (pathname === '/workbench' || pathname === '/workbench/') return false
  if (pathname === '/workbench/intake' || pathname.startsWith('/workbench/intake/')) {
    return false
  }
  return true
}

/**
 * Persona URL 硬隔离（演示可执法 · 非真 IAM）。
 * 发明人：工作台 / Agent / 付款 / 案件详情（含批准）→ 门户。
 * 委员：工作台写操作页 / 付款 / 案件详情 / 全部 /agent → 立项台。
 */
export function personaRouteAccess(
  persona: PersonaId,
  pathname: string,
): PersonaRouteDecision {
  if (persona === 'inventor') {
    if (isWorkbenchPath(pathname)) {
      return {
        blocked: true,
        reason: '发明人 Persona：工作台办理（批准/授权/递交）已隔离；请用交底门户提报',
        redirectTo: '/inventor',
        redirectLabel: '前往交底门户',
      }
    }
    if (isAgentPath(pathname)) {
      return {
        blocked: true,
        reason: '发明人 Persona：IP 办理会话含 HITL 批准/授权，已隔离',
        redirectTo: '/inventor',
        redirectLabel: '前往交底门户',
      }
    }
    if (isBillingPath(pathname)) {
      return {
        blocked: true,
        reason: '发明人 Persona：不可进入费用/付款页',
        redirectTo: '/inventor',
        redirectLabel: '前往交底门户',
      }
    }
    if (CASE_DETAIL_RE.test(pathname)) {
      return {
        blocked: true,
        reason: '发明人 Persona：案件详情含批准/付款动作，已隔离',
        redirectTo: '/inventor',
        redirectLabel: '前往交底门户',
      }
    }
  }
  if (persona === 'committee') {
    if (isCommitteeWriteWorkbench(pathname)) {
      return {
        blocked: true,
        reason: '委员 Persona：仅可立项投票，不可进入撰写/答复/维持等写操作页',
        redirectTo: '/workbench/intake',
        redirectLabel: '前往立项投票',
      }
    }
    if (isBillingPath(pathname)) {
      return {
        blocked: true,
        reason: '委员 Persona：不可进入费用/付款页',
        redirectTo: '/workbench/intake',
        redirectLabel: '前往立项投票',
      }
    }
    if (CASE_DETAIL_RE.test(pathname)) {
      return {
        blocked: true,
        reason: '委员 Persona：案件详情含批准/付款，已隔离；请在立项台投票',
        redirectTo: '/workbench/intake',
        redirectLabel: '前往立项投票',
      }
    }
    // Fix3：与发明人对齐 — 目录/列表/新建亦隔离（勿只拦 sessions/:id）
    if (isAgentPath(pathname)) {
      return {
        blocked: true,
        reason: '委员 Persona：IP 办理（目录/会话/HITL）已隔离；仅可立项投票',
        redirectTo: '/workbench/intake',
        redirectLabel: '前往立项投票',
      }
    }
  }
  return { blocked: false }
}
