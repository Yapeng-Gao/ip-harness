/**
 * Enterprise Wave1 · Persona（演示可执法，非真 SSO/IAM）
 * UserRole 仍为 enterprise|agency；Persona 映射 role + 细权限。
 */
import type { HandoffAction } from '@ip/contracts'
import type { HitlGateId, PersonaId, UserRole } from './types'

export type { PersonaId }

export interface PersonaDef {
  id: PersonaId
  label: string
  shortLabel: string
  description: string
  /** 兼容现网 UserRole */
  role: UserRole
  /** 建议工作区 kind；切换时若不符可自动对齐租户 */
  workspaceKind: 'enterprise' | 'agency'
}

export const PERSONAS: PersonaDef[] = [
  {
    id: 'enterprise_ip',
    label: '企业 IP',
    shortLabel: '企业IP',
    description: '批准 / 授权 / Go / 法务相关企业动作',
    role: 'enterprise',
    workspaceKind: 'enterprise',
  },
  {
    id: 'agency',
    label: '代理所',
    shortLabel: '代理',
    description: '撰写 / 提交 / 递交（现网 agency）',
    role: 'agency',
    workspaceKind: 'agency',
  },
  {
    id: 'inventor',
    label: '发明人',
    shortLabel: '发明人',
    description: '仅交底门户提报与交底包办理；禁工作台批准/授权/file',
    role: 'enterprise',
    workspaceKind: 'enterprise',
  },
  {
    id: 'committee',
    label: '评审委员',
    shortLabel: '委员',
    description: '仅 Intake 投票；禁 Go / 批准 / 授权 / file',
    role: 'enterprise',
    workspaceKind: 'enterprise',
  },
]

export const PERSONA_BY_ID: Record<PersonaId, PersonaDef> = Object.fromEntries(
  PERSONAS.map((p) => [p.id, p]),
) as Record<PersonaId, PersonaDef>

export function personaToRole(persona: PersonaId): UserRole {
  return PERSONA_BY_ID[persona].role
}

export function defaultPersonaForRole(role: UserRole): PersonaId {
  return role === 'agency' ? 'agency' : 'enterprise_ip'
}

/** 交接动作是否被 Persona 硬禁 */
export function personaBlocksHandoffAction(
  persona: PersonaId,
  action: HandoffAction,
): { blocked: boolean; reason?: string } {
  if (persona === 'enterprise_ip' || persona === 'agency') {
    return { blocked: false }
  }
  if (persona === 'inventor') {
    if (
      action === 'approve' ||
      action === 'authorize' ||
      action === 'file' ||
      action === 'start_review' ||
      action === 'request_changes'
    ) {
      return {
        blocked: true,
        reason: '发明人 Persona：不可批准/授权/递交/审核；请用交底门户办理交底包',
      }
    }
    // 工作台提交亦禁；交底走门户
    if (action === 'submit' || action === 'save_draft') {
      return {
        blocked: true,
        reason: '发明人 Persona：工作台交接动作已禁用；请前往交底门户提报',
      }
    }
  }
  if (persona === 'committee') {
    if (
      action === 'approve' ||
      action === 'authorize' ||
      action === 'file' ||
      action === 'start_review' ||
      action === 'request_changes' ||
      action === 'submit' ||
      action === 'save_draft'
    ) {
      return {
        blocked: true,
        reason: '委员 Persona：仅可 Intake 投票，不可批准/授权/递交/提交',
      }
    }
  }
  return { blocked: false }
}

/** Agent HITL 闸是否被 Persona 硬禁 */
export function personaBlocksHitlGate(
  persona: PersonaId,
  gate: HitlGateId,
): { blocked: boolean; reason?: string } {
  if (persona === 'enterprise_ip') return { blocked: false }
  if (persona === 'agency') {
    // 与现网一致：代理可走 approve_strategy 提交链，其余企业闸禁
    if (
      gate === 'go_nogo' ||
      gate === 'confirm_quote' ||
      gate === 'pay_unlock' ||
      gate === 'authorize_file'
    ) {
      return { blocked: true, reason: '代理 Persona：该闸仅企业可确认' }
    }
    return { blocked: false }
  }
  if (persona === 'inventor') {
    return {
      blocked: true,
      reason: '发明人 Persona：不可确认 HITL 闸（批准/授权/Go）；请用交底门户',
    }
  }
  if (persona === 'committee') {
    if (gate === 'go_nogo') {
      return { blocked: true, reason: '委员 Persona：不可 Go/No-Go（须企业 IP）' }
    }
    return {
      blocked: true,
      reason: '委员 Persona：不可批准/授权；仅可 Intake 投票',
    }
  }
  return { blocked: false }
}


/** 付款解锁 / payInvoice 是否被 Persona 硬禁（发明人/委员硬禁；代理按现网仅企业可付） */
export function personaBlocksPay(
  persona: PersonaId,
): { blocked: boolean; reason?: string } {
  // 与 pay_unlock HITL 闸对齐
  return personaBlocksHitlGate(persona, 'pay_unlock')
}

export function personaCanGo(persona: PersonaId): boolean {
  return persona === 'enterprise_ip'
}

export function personaCanVote(persona: PersonaId): boolean {
  return persona === 'committee' || persona === 'enterprise_ip'
}

/** 委员投票写入视为「有效可审计」；enterprise 可代看/代填但不冒充委员审计 */
export function personaVoteIsAuditable(persona: PersonaId): boolean {
  return persona === 'committee'
}

export function personaCanAccessWorkbench(persona: PersonaId): boolean {
  return persona !== 'inventor'
}

export function personaPrefersPortal(persona: PersonaId): boolean {
  return persona === 'inventor'
}

export function personaInboxMode(
  persona: PersonaId,
): 'full' | 'portal' | 'committee' {
  if (persona === 'inventor') return 'portal'
  if (persona === 'committee') return 'committee'
  return 'full'
}

export const PERSONA_LABELS: Record<PersonaId, string> = {
  enterprise_ip: '企业 IP',
  agency: '代理所',
  inventor: '发明人',
  committee: '评审委员',
}

/** 可否进入知产 Agent 壳（目录/会话） */
export function personaCanAccessAgent(persona: PersonaId): boolean {
  return persona === 'enterprise_ip' || persona === 'agency'
}

/** 可否新建 Agent 会话（与路由闸同口径） */
export function personaCanCreateAgentSession(persona: PersonaId): boolean {
  return personaCanAccessAgent(persona)
}
