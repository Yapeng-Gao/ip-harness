/**
 * Enterprise Wave1 · 本案审计证据包（纯函数组装 · 原型内存快照 · 非司法鉴定级）
 * 不接真对象存储 / PDF / 电子签。
 */
import type { AuditEntry, CommandName } from '../domain/commands'
import {
  AUDIT_SCHEMA_VERSION,
  COMMAND_LABELS,
  auditSchemaVersionLabel,
} from '../domain/commands'
import {
  buildCaseContext,
  CASE_CONTEXT_SCHEMA_VERSION,
  type CaseContextSnapshot,
} from '../domain/caseContextContract'
import { AGENT_CATALOG } from '../data/agents'
import {
  DISCLOSURE_PACK_CHECK_ITEMS,
  DRAFT_FILING_CHECK_ITEMS,
  HANDOFF_ARTIFACT_LABELS,
  HANDOFF_LABELS,
  REQUIRED_BEFORE_SUBMIT,
} from '../data/handoff'
import { PERSONA_LABELS } from '../data/persona'
import { getStageMeta } from '../data/stages'
import { FULL_CHECK_LITE_ITEMS } from './fullFilingCheck'
import { mergeDriveAndArtifacts, type MergedProductRow } from './productDisplay'
import type {
  CaseDriveItem,
  DisclosurePackCheck,
  DraftFilingCheck,
  FullCheckLite,
  HandoffArtifactKey,
  HandoffState,
  LegalReviewStatus,
  PatentCase,
  PersonaId,
  TimelineEvent,
  UserRole,
} from '../types'

export const EVIDENCE_PACK_DISCLAIMER =
  '原型导出·内存快照·非司法鉴定级（未接真对象存储 / 未做哈希固证 / 不可作司法鉴定用途）'

const LEGAL_REVIEW_LABELS: Record<LegalReviewStatus, string> = {
  pending: '待法务审阅',
  reviewed: '已审阅',
  changes_requested: '要求修改',
}

const ALL_HANDOFF_KEYS = Object.keys(HANDOFF_ARTIFACT_LABELS) as HandoffArtifactKey[]

export type EvidencePackWorkspaceSnap = {
  id: string
  name: string
  kind: string
  chipLabel: string
  role: UserRole
}

export type EvidencePackInput = {
  caseData: PatentCase
  workspace: EvidencePackWorkspaceSnap
  persona: PersonaId
  role: UserRole
  /** Persona/角色快照时间；缺省用 exportedAt */
  personaSnapshotAt?: string
  auditLog: AuditEntry[]
  driveItems: CaseDriveItem[]
  disclosurePackCheck: DisclosurePackCheck
  draftFilingCheck: DraftFilingCheck
  fullCheckLite: FullCheckLite
  /** Full-check 操作者元数据；原型当前 store 无此字段时留空 */
  fullCheckMeta?: { checkedBy?: string; checkedAt?: string }
  exportedAt?: string
  /** Wave3 · 可选会话清闸 / 绑定，写入契约快照 */
  clearedHitlGates?: import('../types').HitlGateId[]
  sessionId?: string
  sessionCaseId?: string | null
  /**
   * Wave · 证据包 v2 薄：会话 HITL 决策摘要（若 store 有）
   * 无则导出诚实句「无会话链」
   */
  sessionHitlSummary?: {
    sessionId: string
    title?: string
    agentId?: string
    clearedGates: import('../types').HitlGateId[]
    status?: string
  } | null
  /** 本案相关未归档会话摘要（薄 · 可多条） */
  sessionHitlSummaries?: Array<{
    sessionId: string
    title?: string
    agentId?: string
    clearedGates: import('../types').HitlGateId[]
    status?: string
  }>
}

export type EvidencePackJson = {
  disclaimer: string
  exportedAt: string
  /** Wave3 · 案级上下文契约 schema 版本（与 snapshot.schemaVersion 同值） */
  schemaVersion: string
  /** Wave3 · 完整契约快照一节 */
  caseContext: CaseContextSnapshot
  header: {
    caseId: string
    caseNo: string
    title: string
    stageId: string
    stageName: string
    workspace: EvidencePackWorkspaceSnap
    persona: PersonaId
    personaLabel: string
    role: UserRole
    personaSnapshotAt: string
  }
  handoffs: Array<{
    key: HandoffArtifactKey
    label: string
    status: string | null
    statusLabel: string | null
    version: string | null
    versionCount: number
    updatedAt: string | null
    updatedBy: string | null
    note: string | null
    requiredSummary: Array<{ id: string; label: string; checked: boolean | null; note?: string }>
  }>
  auditCommands: Array<{
    id: string
    actor: 'user' | 'agent'
    agentId?: string
    command: CommandName
    commandLabel: string
    at: string
    detail: string
    /** Wave3 · audit schema；缺省导出为 legacy */
    schemaVersion: string
  }>
  hitlFullCheck: {
    oaStatementConfirmed: boolean | null
    legalReview: LegalReviewStatus | null
    legalReviewLabel: string | null
    disclosurePack: {
      status: string | null
      complete: boolean
      checked: number
      total: number
      items: Array<{ id: string; label: string; done: boolean }>
    }
    filingChecklist: {
      complete: boolean
      checked: number
      total: number
      items: Array<{ id: string; label: string; done: boolean }>
    }
    fullCheckLite: {
      items: Array<{ id: string; label: string; done: boolean }>
      operatorNote: string
      checkedBy: string | null
      checkedAt: string | null
    }
  }
  receipts: Array<{
    key: HandoffArtifactKey
    label: string
    receiptNo: string
    filedAt: string
  }>
  products: Array<{ title: string; sources: string[]; detail: string }>
  timeline: Array<{
    id: string
    time: string
    title: string
    desc: string
    type: string
    badge?: string
  }>
  /** v2 薄：会话 HITL 决策；present=false = 无会话链 */
  sessionHitl: {
    present: boolean
    honestNote: string
    sessionId?: string
    title?: string
    agentId?: string
    status?: string
    clearedGates: string[]
    /** 本案相关未归档会话（最近优先） */
    sessions: Array<{
      sessionId: string
      title?: string
      agentId?: string
      status?: string
      clearedGates: string[]
    }>
  }
}

function isoNow(): string {
  return new Date().toISOString()
}

function fmtAt(iso: string): string {
  if (!iso) return '—'
  return iso.length >= 19 ? iso.slice(0, 19).replace('T', ' ') : iso
}

function handoffVersionLabel(h?: HandoffState): string | null {
  if (!h?.versions?.length) return null
  const latest = h.versions[h.versions.length - 1]
  return latest?.version ?? null
}

function requiredSummaryForKey(
  key: HandoffArtifactKey,
  disclosure: DisclosurePackCheck,
  filing: DraftFilingCheck,
): Array<{ id: string; label: string; checked: boolean | null; note?: string }> {
  const req = REQUIRED_BEFORE_SUBMIT[key] ?? []
  if (key === 'disclosure_pack') {
    return req.map((r) => ({
      id: r.id,
      label: r.label,
      checked: Boolean(
        disclosure[r.id as keyof DisclosurePackCheck],
      ),
    }))
  }
  if (key === 'draft_claims') {
    return req.map((r) => {
      if (r.id === 'filing') {
        const n = Object.values(filing).filter(Boolean).length
        const total = Object.keys(filing).length
        return {
          id: r.id,
          label: r.label,
          checked: n === total,
          note: `filing 五清单 ${n}/${total}`,
        }
      }
      return {
        id: r.id,
        label: r.label,
        checked: null,
        note: '勾选态未持久化至 store',
      }
    })
  }
  return req.map((r) => ({
    id: r.id,
    label: r.label,
    checked: null,
    note: '勾选态未持久化至 store（仅 REQUIRED 清单示意）',
  }))
}

function buildOperatorNote(meta?: { checkedBy?: string; checkedAt?: string }): {
  operatorNote: string
  checkedBy: string | null
  checkedAt: string | null
} {
  const by = meta?.checkedBy?.trim() || null
  const at = meta?.checkedAt?.trim() || null
  if (!by && !at) {
    return {
      operatorNote: '未记录操作者',
      checkedBy: null,
      checkedAt: null,
    }
  }
  if (!by) {
    return {
      operatorNote: `未记录操作者 · 时间 ${fmtAt(at!)}`,
      checkedBy: null,
      checkedAt: at,
    }
  }
  return {
    operatorNote: at ? `${by} · ${fmtAt(at)}` : by,
    checkedBy: by,
    checkedAt: at,
  }
}

/** 组装结构化证据包（纯函数） */
export function buildEvidencePackJson(input: EvidencePackInput): EvidencePackJson {
  const exportedAt = input.exportedAt ?? isoNow()
  const personaSnapshotAt = input.personaSnapshotAt ?? exportedAt
  const c = input.caseData
  const stageMeta = getStageMeta(c.stage)
  const audit = input.auditLog
    .filter((a) => a.caseId === c.id)
    .slice()
    .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))

  const handoffs = ALL_HANDOFF_KEYS.filter((k) => c.handoffs[k]).map((key) => {
    const h = c.handoffs[key]!
    return {
      key,
      label: HANDOFF_ARTIFACT_LABELS[key],
      status: h.status,
      statusLabel: HANDOFF_LABELS[h.status],
      version: handoffVersionLabel(h),
      versionCount: h.versions?.length ?? 0,
      updatedAt: h.updatedAt ?? null,
      updatedBy: h.updatedBy ?? null,
      note: h.note ?? null,
      requiredSummary: requiredSummaryForKey(
        key,
        input.disclosurePackCheck,
        input.draftFilingCheck,
      ),
    }
  })

  const discItems = DISCLOSURE_PACK_CHECK_ITEMS.map((i) => ({
    id: i.id,
    label: i.label,
    done: Boolean(input.disclosurePackCheck[i.id]),
  }))
  const discChecked = discItems.filter((i) => i.done).length
  const filingItems = DRAFT_FILING_CHECK_ITEMS.map((i) => ({
    id: i.id,
    label: i.label,
    done: Boolean(input.draftFilingCheck[i.id]),
  }))
  const filingChecked = filingItems.filter((i) => i.done).length
  const liteItems = FULL_CHECK_LITE_ITEMS.map((i) => ({
    id: i.id,
    label: i.label,
    done: Boolean(input.fullCheckLite[i.id]),
  }))
  const op = buildOperatorNote(input.fullCheckMeta)

  const receipts: EvidencePackJson['receipts'] = []
  for (const key of ALL_HANDOFF_KEYS) {
    const h = c.handoffs[key]
    if (h?.status === 'filed' && (h.receiptNo || h.filedAt)) {
      receipts.push({
        key,
        label: HANDOFF_ARTIFACT_LABELS[key],
        receiptNo: h.receiptNo ?? '（无回执号）',
        filedAt: h.filedAt ?? '（无递交日）',
      })
    }
  }

  const products = mergeDriveAndArtifacts(input.driveItems, c.artifacts).map(
    (r: MergedProductRow) => ({
      title: r.title,
      sources: r.sources,
      detail: r.detail,
    }),
  )

  const timeline = (c.timeline ?? []).map((ev: TimelineEvent) => ({
    id: ev.id,
    time: ev.time,
    title: ev.title,
    desc: ev.desc,
    type: ev.type,
    badge: ev.badge,
  }))

  const legal = c.legalReview ?? null

  const caseContext = buildCaseContext(c, c.handoffs, {
    persona: input.persona,
    clearedHitlGates: input.clearedHitlGates,
    sessionId: input.sessionId,
    sessionCaseId: input.sessionCaseId,
    builtAt: exportedAt,
    agents: AGENT_CATALOG,
  })

  return {
    disclaimer: EVIDENCE_PACK_DISCLAIMER,
    exportedAt,
    schemaVersion: CASE_CONTEXT_SCHEMA_VERSION,
    caseContext,
    header: {
      caseId: c.id,
      caseNo: c.caseNo,
      title: c.title,
      stageId: c.stage,
      stageName: stageMeta.name,
      workspace: input.workspace,
      persona: input.persona,
      personaLabel: PERSONA_LABELS[input.persona],
      role: input.role,
      personaSnapshotAt,
    },
    handoffs,
    auditCommands: audit.map((a) => ({
      id: a.id,
      actor: a.actor,
      agentId: a.agentId,
      command: a.command,
      commandLabel: COMMAND_LABELS[a.command],
      at: a.at,
      detail: a.detail,
      schemaVersion: auditSchemaVersionLabel(a.schemaVersion),
    })),
    hitlFullCheck: {
      oaStatementConfirmed:
        typeof c.oaStatementConfirmed === 'boolean'
          ? c.oaStatementConfirmed
          : null,
      legalReview: legal,
      legalReviewLabel: legal ? LEGAL_REVIEW_LABELS[legal] : null,
      disclosurePack: {
        status: c.handoffs.disclosure_pack?.status ?? null,
        complete: discChecked === discItems.length && discItems.length > 0,
        checked: discChecked,
        total: discItems.length,
        items: discItems,
      },
      filingChecklist: {
        complete: filingChecked === filingItems.length && filingItems.length > 0,
        checked: filingChecked,
        total: filingItems.length,
        items: filingItems,
      },
      fullCheckLite: {
        items: liteItems,
        operatorNote: op.operatorNote,
        checkedBy: op.checkedBy,
        checkedAt: op.checkedAt,
      },
    },
    receipts,
    products,
    timeline,
    sessionHitl: (() => {
      const list =
        input.sessionHitlSummaries && input.sessionHitlSummaries.length > 0
          ? input.sessionHitlSummaries
          : input.sessionHitlSummary
            ? [input.sessionHitlSummary]
            : []
      if (list.length === 0) {
        return {
          present: false,
          honestNote: '无会话链（本案导出未绑定 IP 办理会话 HITL 决策）',
          clearedGates: input.clearedHitlGates ?? [],
          sessions: [],
        }
      }
      const s = list[0]
      return {
        present: true,
        honestNote:
          list.length === 1
            ? `会话 ${s.sessionId} HITL 清闸 ${s.clearedGates.length} 项`
            : `本案未归档会话 ${list.length} 条 · 最近 ${s.sessionId} HITL 清闸 ${s.clearedGates.length} 项`,
        sessionId: s.sessionId,
        title: s.title,
        agentId: s.agentId,
        status: s.status,
        clearedGates: s.clearedGates,
        sessions: list.map((x) => ({
          sessionId: x.sessionId,
          title: x.title,
          agentId: x.agentId,
          status: x.status,
          clearedGates: x.clearedGates,
        })),
      }
    })(),
  }
}

function checkMark(v: boolean | null): string {
  if (v === true) return '[x]'
  if (v === false) return '[ ]'
  return '[?]'
}


function caseContextVersionLabelMd(v: string): string {
  return `上下文契约 v${v}`
}

/** Markdown 主导出 */
export function buildEvidencePackMarkdown(input: EvidencePackInput): string {
  const pack = buildEvidencePackJson(input)
  const lines: string[] = []

  lines.push('# 本案审计证据包')
  lines.push('')
  lines.push(`> ${pack.disclaimer}`)
  lines.push('')
  lines.push(`导出时间：${fmtAt(pack.exportedAt)}`)
  lines.push(`契约 schemaVersion：${pack.schemaVersion}`)
  lines.push('')

  lines.push('## 0. 案级上下文契约')
  lines.push('')
  lines.push(`> ${caseContextVersionLabelMd(pack.caseContext.schemaVersion)} · Agent/工作台/中台同读`)
  lines.push('')
  lines.push(`- schemaVersion：\`${pack.caseContext.schemaVersion}\``)
  lines.push(`- 案件：${pack.caseContext.caseNo}（${pack.caseContext.caseId}）`)
  lines.push(
    `- 阶段：${pack.caseContext.stageName}（${pack.caseContext.stage}）` +
      (pack.caseContext.stageHandoffKey
        ? ` · 交接键 \`${pack.caseContext.stageHandoffKey}\``
        : ''),
  )
  lines.push(
    `- 清单：必做 ${pack.caseContext.checklist.requiredDone}/${pack.caseContext.checklist.requiredTotal} · 全部 ${pack.caseContext.checklist.done}/${pack.caseContext.checklist.total}` +
      (pack.caseContext.checklist.complete ? ' · 齐套' : ''),
  )
  if (pack.caseContext.artifacts.length === 0) {
    lines.push('- 交接产物：_无_')
  } else {
    lines.push('- 交接产物：')
    for (const a of pack.caseContext.artifacts) {
      lines.push(
        `  - \`${a.key}\` ${a.label}：${a.statusLabel ?? '—'}（${a.status ?? '—'}）`,
      )
    }
  }
  if (pack.caseContext.gates.items.length === 0) {
    lines.push('- 闸门：_本阶段无目录声明闸_')
  } else {
    lines.push('- 闸门：')
    for (const g of pack.caseContext.gates.items) {
      lines.push(`  - \`${g.id}\` ${g.label}：${g.state}`)
    }
  }
  const pv = pack.caseContext.personaVisibility
  lines.push(
    `- Persona 可见性：${pv.personaLabel}（${pv.persona}）· workbench=${pv.canAccessWorkbench} · go=${pv.canGo} · vote=${pv.canVote} · inbox=${pv.inboxMode}`,
  )
  if (pv.blockedHitlGates.length > 0) {
    lines.push(`  - 硬禁闸：${pv.blockedHitlGates.join(', ')}`)
  }
  if (pack.caseContext.agentHints.length > 0) {
    lines.push('- Agent hints（阶段 × tier）：')
    for (const h of pack.caseContext.agentHints) {
      const note = h.tierNote ? ` · ${h.tierNote}` : ''
      lines.push(
        `  - ${h.name}（\`${h.agentId}\`）· ${h.tier}/${h.tierLabel}${note}`,
      )
    }
  }
  if (pack.caseContext.sessionBind) {
    const sb = pack.caseContext.sessionBind
    lines.push(
      `- 会话绑定：${sb.aligned ? '对齐' : '未对齐'}${sb.note ? ` · ${sb.note}` : ''}`,
    )
  }
  lines.push(`- 快照时间：${fmtAt(pack.caseContext.builtAt)}`)
  lines.push('')

  lines.push('## 1. 案头')
  lines.push('')
  lines.push(`- 案号：${pack.header.caseNo}`)
  lines.push(`- 标题：${pack.header.title}`)
  lines.push(`- 案件 ID：${pack.header.caseId}`)
  lines.push(`- 阶段：${pack.header.stageName}（${pack.header.stageId}）`)
  lines.push(
    `- 工作区：${pack.header.workspace.name} · ${pack.header.workspace.chipLabel}（${pack.header.workspace.kind} / ${pack.header.workspace.id}）`,
  )
  lines.push(
    `- 当前 Persona：${pack.header.personaLabel}（${pack.header.persona}）`,
  )
  lines.push(`- 当前角色（UserRole）：${pack.header.role}`)
  lines.push(`- Persona/角色快照时间：${fmtAt(pack.header.personaSnapshotAt)}`)
  lines.push('')

  lines.push('## 2. 交接状态')
  lines.push('')
  if (pack.handoffs.length === 0) {
    lines.push('_本案尚无交接 artifact 记录。_')
    lines.push('')
  } else {
    for (const h of pack.handoffs) {
      lines.push(
        `### ${h.label}（\`${h.key}\`）`,
      )
      lines.push('')
      lines.push(
        `- 状态：${h.statusLabel ?? '—'}（${h.status ?? '—'}）`,
      )
      lines.push(
        `- 版本：${h.version ?? '（无版本条）'}${h.versionCount ? ` · 共 ${h.versionCount} 条` : ''}`,
      )
      lines.push(
        `- 更新：${h.updatedAt ?? '—'} · by ${h.updatedBy ?? '—'}`,
      )
      if (h.note) lines.push(`- 备注：${h.note}`)
      lines.push('- REQUIRED 勾选摘要：')
      for (const r of h.requiredSummary) {
        const extra = r.note ? ` · ${r.note}` : ''
        lines.push(`  - ${checkMark(r.checked)} ${r.label}（${r.id}）${extra}`)
      }
      lines.push('')
    }
  }

  lines.push('## 3. 审计命令序')
  lines.push('')
  lines.push(
    `> schema 约定：新写入 = \`${AUDIT_SCHEMA_VERSION}\`；缺版本条目导出为 \`legacy\``,
  )
  lines.push('')
  if (pack.auditCommands.length === 0) {
    lines.push('_本案尚无领域命令写入（表单或知产 Agent 正式执行后出现）。_')
    lines.push('')
  } else {
    lines.push('| # | 时间 | Actor | 命令 | schemaVersion | 详情 |')
    lines.push('|---|------|-------|------|---------------|------|')
    pack.auditCommands.forEach((a, i) => {
      const actor =
        a.actor === 'agent'
          ? `agent${a.agentId ? `:${a.agentId}` : ''}`
          : 'user'
      const detail = (a.detail || '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
      lines.push(
        `| ${i + 1} | ${fmtAt(a.at)} | ${actor} | \`${a.commandLabel}\` | \`${a.schemaVersion}\` | ${detail} |`,
      )
    })
    lines.push('')
  }

  lines.push('## 4. HITL / Full-check')
  lines.push('')
  const hitl = pack.hitlFullCheck
  lines.push(
    `- oaStatementConfirmed：${
      hitl.oaStatementConfirmed === null
        ? '（未设置）'
        : hitl.oaStatementConfirmed
          ? '已确认'
          : '未确认'
    }`,
  )
  lines.push(
    `- legalReview：${hitl.legalReviewLabel ?? '（未设置）'}${
      hitl.legalReview ? `（${hitl.legalReview}）` : ''
    }`,
  )
  lines.push(
    `- disclosure_pack 齐套：${hitl.disclosurePack.checked}/${hitl.disclosurePack.total}${
      hitl.disclosurePack.status ? ` · 交接态 ${hitl.disclosurePack.status}` : ''
    }${hitl.disclosurePack.complete ? ' · 齐套' : ' · 未齐'}`,
  )
  for (const it of hitl.disclosurePack.items) {
    lines.push(`  - ${checkMark(it.done)} ${it.label}`)
  }
  lines.push(
    `- filing checklist：${hitl.filingChecklist.checked}/${hitl.filingChecklist.total}${
      hitl.filingChecklist.complete ? ' · 齐套' : ' · 未齐'
    }`,
  )
  for (const it of hitl.filingChecklist.items) {
    lines.push(`  - ${checkMark(it.done)} ${it.label}`)
  }
  lines.push('- Full-check lite：')
  for (const it of hitl.fullCheckLite.items) {
    lines.push(`  - ${checkMark(it.done)} ${it.label}`)
  }
  lines.push(`- Full-check 操作者：${hitl.fullCheckLite.operatorNote}`)
  lines.push('')

  lines.push('## 5. 回执')
  lines.push('')
  if (pack.receipts.length === 0) {
    lines.push('_无 filed 回执记录。_')
    lines.push('')
  } else {
    for (const r of pack.receipts) {
      lines.push(
        `- ${r.label}（\`${r.key}\`）：回执 ${r.receiptNo} · 递交日 ${r.filedAt}`,
      )
    }
    lines.push('')
  }

  lines.push('## 6. Drive / 工件摘要（去重）')
  lines.push('')
  if (pack.products.length === 0) {
    lines.push('_无 Drive / 工件条目。_')
    lines.push('')
  } else {
    for (const p of pack.products) {
      lines.push(`- **${p.title}** · 来源 ${p.sources.join('+')}`)
      if (p.detail) lines.push(`  - ${p.detail}`)
    }
    lines.push('')
  }

  lines.push('## 7. 时间线关键事件')
  lines.push('')
  if (pack.timeline.length === 0) {
    lines.push('_无时间线事件。_')
    lines.push('')
  } else {
    for (const ev of pack.timeline) {
      const badge = ev.badge ? ` 〔${ev.badge}〕` : ''
      lines.push(`- ${ev.time} · **${ev.title}**${badge}`)
      if (ev.desc) lines.push(`  - ${ev.desc}`)
    }
    lines.push('')
  }

  lines.push('## 8. 会话 HITL 决策摘要（证据包 v2 薄）')
  lines.push('')
  const sh = pack.sessionHitl
  if (!sh.present) {
    lines.push(`> ${sh.honestNote}`)
    lines.push('')
  } else {
    lines.push(`- ${sh.honestNote}`)
    const sessList = sh.sessions.length > 0 ? sh.sessions : [{
      sessionId: sh.sessionId ?? '',
      title: sh.title,
      agentId: sh.agentId,
      status: sh.status,
      clearedGates: sh.clearedGates,
    }]
    for (const s of sessList) {
      lines.push('')
      lines.push(`### 会话 \`${s.sessionId}\``)
      if (s.title) lines.push(`- 标题：${s.title}`)
      if (s.agentId) lines.push(`- Agent：\`${s.agentId}\``)
      if (s.status) lines.push(`- 状态：${s.status}`)
      if (s.clearedGates.length === 0) {
        lines.push('- 已清闸：_无_')
      } else {
        lines.push(
          `- 已清闸：${s.clearedGates.map((g) => '`' + g + '`').join(', ')}`,
        )
      }
    }
    lines.push('')
  }

  lines.push('---')
  lines.push(`_生成于 ${fmtAt(pack.exportedAt)} · ${EVIDENCE_PACK_DISCLAIMER}_`)
  lines.push('')

  return lines.join('\n')
}

/** JSON 字符串（pretty） */
export function buildEvidencePackJsonString(input: EvidencePackInput): string {
  return `${JSON.stringify(buildEvidencePackJson(input), null, 2)}\n`
}

/** 浏览器 blob 下载（非持久化） */
export function downloadTextFile(
  filename: string,
  content: string,
  mime = 'text/plain;charset=utf-8',
): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function evidencePackFilename(
  caseNo: string,
  ext: 'md' | 'json',
  at = isoNow(),
): string {
  const safe = (caseNo || 'case').replace(/[^\w\u4e00-\u9fff.-]+/g, '_')
  const stamp = at.slice(0, 19).replace(/[T:]/g, '-')
  return `evidence-pack_${safe}_${stamp}.${ext}`
}

/** 一键导出：主 MD；可选 JSON */
export function exportCaseEvidencePack(
  input: EvidencePackInput,
  opts?: { includeJson?: boolean },
): { md: string; json?: string; exportedAt: string } {
  const exportedAt = input.exportedAt ?? isoNow()
  const payload = { ...input, exportedAt }
  const md = buildEvidencePackMarkdown(payload)
  downloadTextFile(
    evidencePackFilename(input.caseData.caseNo, 'md', exportedAt),
    md,
    'text/markdown;charset=utf-8',
  )
  let json: string | undefined
  if (opts?.includeJson) {
    json = buildEvidencePackJsonString(payload)
    downloadTextFile(
      evidencePackFilename(input.caseData.caseNo, 'json', exportedAt),
      json,
      'application/json;charset=utf-8',
    )
  }
  return { md, json, exportedAt }
}

