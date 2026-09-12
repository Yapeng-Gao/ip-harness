/**
 * Domain / UI event name constants (no bus implementation — contract only).
 * Apps may emit or listen under these names in Phase 1+.
 */
export const DOMAIN_EVENTS = {
  commandDispatched: 'ip.command.dispatched',
  commandFailed: 'ip.command.failed',
  handoffChanged: 'ip.handoff.changed',
  auditAppended: 'ip.audit.appended',
  caseContextBuilt: 'ip.caseContext.built',
  personaChanged: 'ip.persona.changed',
  productSwitched: 'ip.product.switched',
  docketEscalated: 'ip.docket.escalated',
  billingHoldChanged: 'ip.billing.holdChanged',
} as const

export type DomainEventName = (typeof DOMAIN_EVENTS)[keyof typeof DOMAIN_EVENTS]
