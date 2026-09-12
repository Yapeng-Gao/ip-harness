import {
  AUDIT_SCHEMA_VERSION,
  type AuditEntry,
  type CommandName,
  type CommandMeta,
  type CommandResult,
  type DomainCommand,
} from '@ip/contracts'
import { SEED_CASES, type MockCase } from './data/cases.js'
import { SEED_INBOX, type MockInboxItem } from './data/inbox.js'

/**
 * CommandName 白名单（样机）。
 * 含 `docketEscalate` / `docketComplete`：二者在 `CommandName` 有名，
 * 但尚未收入 `DomainCommand` 联合（壳内走 AppContext 专用函数 + pushAudit）。
 * 与 docs/architecture/backends.md「api-mock 局限」一致；收齐联合前勿假装类型已统一。
 */
const KNOWN_COMMANDS = new Set<string>([
  'submitResearch',
  'approveHandoff',
  'requestChanges',
  'advanceStage',
  'submitClaims',
  'analyzeAndSubmitOA',
  'authorizeFile',
  'fileResponse',
  'confirmQuote',
  'assignAgency',
  'issueInvoice',
  'payInvoice',
  'createCaseFromInsight',
  'saveDraft',
  'submitHandoff',
  'startReview',
  'docketEscalate',
  'docketComplete',
])

export type DispatchInput =
  | DomainCommand
  | { type: string; caseId?: string; note?: string; [key: string]: unknown }

function cloneCases(): MockCase[] {
  return SEED_CASES.map((c) => ({ ...c }))
}

function cloneInbox(): MockInboxItem[] {
  return SEED_INBOX.map((i) => ({ ...i, personas: [...i.personas] }))
}

let cases = cloneCases()
let inbox = cloneInbox()
let auditLog: AuditEntry[] = []
let auditSeq = 0

export function resetStore(): void {
  cases = cloneCases()
  inbox = cloneInbox()
  auditLog = []
  auditSeq = 0
}

export function listCases(): MockCase[] {
  return cases.map((c) => ({ ...c }))
}

export function getCase(id: string): MockCase | undefined {
  const c = cases.find((x) => x.id === id)
  return c ? { ...c } : undefined
}

export function listInbox(persona?: string): MockInboxItem[] {
  const items = persona
    ? inbox.filter((i) => i.personas.includes(persona))
    : inbox
  return items.map((i) => ({
    id: i.id,
    caseId: i.caseId,
    title: i.title,
    kind: i.kind,
    due: i.due,
    risk: i.risk,
    personas: [...i.personas],
  }))
}

export function getAuditLog(): AuditEntry[] {
  return auditLog.map((e) => ({ ...e }))
}

function caseIdOf(cmd: DispatchInput): string | undefined {
  if ('caseId' in cmd && typeof cmd.caseId === 'string') return cmd.caseId
  return undefined
}

function applyLightMutation(cmd: DomainCommand): string | undefined {
  if (cmd.type === 'createCaseFromInsight') {
    const id = `c-mock-${Date.now()}`
    cases.push({
      id,
      title: cmd.title,
      caseNo: `MOCK-${id}`,
      stage: cmd.stage,
      risk: '中',
      nextDeadline: new Date().toISOString().slice(0, 10),
      summary: cmd.summary ?? 'mock createCaseFromInsight',
      handoffNote: '新建 mock 案',
    })
    return id
  }

  const caseId = caseIdOf(cmd)
  if (!caseId) return undefined
  const c = cases.find((x) => x.id === caseId)
  if (!c) return undefined

  switch (cmd.type) {
    case 'submitResearch':
      c.handoffNote = cmd.note ?? '调研已提交企业审核（mock）'
      break
    case 'approveHandoff':
      c.handoffNote = cmd.note ?? '交接已批准（mock）'
      break
    case 'requestChanges':
      c.handoffNote = cmd.note ?? cmd.annotation ?? '已退回修改（mock）'
      break
    case 'advanceStage':
      c.handoffNote = cmd.note ?? '阶段已推进（mock）'
      break
    case 'submitClaims':
      c.handoffNote = cmd.note ?? '权利要求已提交（mock）'
      break
    case 'analyzeAndSubmitOA':
      c.handoffNote = cmd.note ?? 'OA 答复已提交（mock）'
      break
    case 'authorizeFile':
      c.handoffNote = cmd.note ?? '已授权递交（mock）'
      break
    case 'fileResponse':
      c.handoffNote = cmd.note ?? `已递交归档 ${cmd.receiptNo}（mock）`
      break
    case 'confirmQuote':
      c.handoffNote = cmd.note ?? '报价已确认（mock）'
      break
    case 'assignAgency':
      c.handoffNote = `已派所：${cmd.agencyName}（mock）`
      break
    case 'issueInvoice':
    case 'payInvoice':
      c.handoffNote = `${cmd.type} · ${cmd.invoiceId}（mock）`
      break
    case 'saveDraft':
    case 'submitHandoff':
    case 'startReview':
      c.handoffNote = cmd.note ?? `${cmd.type}（mock）`
      break
  }
  return caseId
}

export function dispatchCommand(
  command: DispatchInput,
  meta?: CommandMeta,
): CommandResult {
  const type = command.type
  if (!type || !KNOWN_COMMANDS.has(type)) {
    return {
      ok: false,
      message: `未知命令类型: ${String(type)}`,
      command: type as CommandName | undefined,
    }
  }

  const caseId = caseIdOf(command)

  if (type === 'docketEscalate' || type === 'docketComplete') {
    if (!caseId) {
      return { ok: false, message: '缺少 caseId', command: type as CommandName }
    }
    const c = cases.find((x) => x.id === caseId)
    if (!c) {
      return {
        ok: false,
        message: `案件不存在: ${caseId}`,
        caseId,
        command: type as CommandName,
      }
    }
    c.handoffNote = `${type}（mock）`
  } else if (type === 'createCaseFromInsight') {
    // ok without prior caseId
  } else {
    if (!caseId) {
      return { ok: false, message: '缺少 caseId', command: type as CommandName }
    }
    if (!cases.some((c) => c.id === caseId)) {
      return {
        ok: false,
        message: `案件不存在: ${caseId}`,
        caseId,
        command: type as CommandName,
      }
    }
  }

  let resolvedCaseId = caseId
  if (type !== 'docketEscalate' && type !== 'docketComplete') {
    resolvedCaseId = applyLightMutation(command as DomainCommand) ?? caseId
  }

  const actor = meta?.actor ?? 'user'
  auditSeq += 1
  auditLog.push({
    id: `aud-mock-${auditSeq}`,
    actor,
    agentId: meta?.agentId,
    command: type as CommandName,
    caseId: resolvedCaseId ?? '',
    at: new Date().toISOString(),
    detail: meta?.detail ?? `${type} via api-mock`,
    schemaVersion: AUDIT_SCHEMA_VERSION,
  })

  return {
    ok: true,
    message: `mock ok · ${type}`,
    caseId: resolvedCaseId,
    command: type as CommandName,
  }
}
