import { CalendarDays, FolderOpen, FileText } from 'lucide-react'
import { AppLink } from '../../AppLink'
import type {
  AgentArtifactDoc,
  AgentDef,
  DocketEvent,
  HandoffStatus,
  PatentCase,
} from '../../../types'
import {
  COMMAND_LABELS,
  auditSchemaVersionLabel,
  isLegacyAudit,
  type AuditEntry,
} from '../../../domain/commands'
import { HANDOFF_LABELS } from '../../../data/handoff'
import { DOCKET_STATUS_LABEL, toolCatalogLabel } from '../../../data/sessions'
import { workbenchHref } from './sessionGates'
import { driveDuplicatesArtifactTitle } from '../../../utils/productDisplay'
import {
  buildCaseContextFromSession,
} from '../../../domain/caseContextContract'
import { AGENT_CATALOG } from '../../../data/agents'
import { CaseContextContractPanel } from '../../CaseContextContractPanel'
import type { HitlGateId, PersonaId } from '../../../types'

const ACTOR_LABEL: Record<string, string> = {
  agent: '助手',
  user: '你',
  system: '系统',
  enterprise: '企业',
  agency: '代理所',
}

type Props = {
  agent?: AgentDef
  caseData?: PatentCase
  handoffStatus?: HandoffStatus
  caseDockets: DocketEvent[]
  artifacts: AgentArtifactDoc[]
  activeArt?: AgentArtifactDoc
  onSelectArtifact: (id: string) => void
  onUpdateArtifact: (artifactId: string, content: string) => void
  caseId?: string
  auditEntries: AuditEntry[]
  caseDriveItems?: import('../../../types').CaseDriveItem[]
  /** Wave3 · 会话侧契约对齐 */
  sessionId?: string
  persona?: PersonaId
  clearedHitlGates?: HitlGateId[]
}

export function SessionContextPanel({
  agent,
  caseData,
  handoffStatus,
  caseDockets,
  artifacts,
  activeArt,
  onSelectArtifact,
  onUpdateArtifact,
  caseId,
  auditEntries,
  caseDriveItems = [],
  sessionId,
  persona = 'enterprise_ip',
  clearedHitlGates,
}: Props) {
  const wb = caseData ? workbenchHref(agent?.workbenchPath, caseData.id) : null
  const caseContextSnap = buildCaseContextFromSession({
    caseData,
    sessionId: sessionId ?? 'unknown-session',
    sessionCaseId: caseId ?? null,
    persona,
    clearedHitlGates,
    agents: AGENT_CATALOG,
  })
  const artifactTitles = artifacts.map((a) => a.title)
  const driveVisible = caseDriveItems.filter(
    (d) => !driveDuplicatesArtifactTitle(d.title, artifactTitles),
  )
  const driveHidden = caseDriveItems.length - driveVisible.length

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-l border-slate-200 bg-white lg:flex xl:w-80">
      <div className="border-b border-slate-100 px-3 py-2 text-xs font-semibold text-slate-400">
        上下文
      </div>
      <div className="flex-1 overflow-y-auto">
        {agent && (
          <section className="border-b border-slate-100 px-3 py-3">
            <div className="mb-1 text-[11px] font-medium text-slate-400">当前 Agent</div>
            <div className="text-xs font-medium text-slate-900">{agent.name}</div>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
              {agent.specialty || agent.description}
            </p>
          </section>
        )}

        <section className="border-b border-slate-100 px-3 py-3">
          <div className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <FolderOpen className="h-3 w-3" aria-hidden /> 案件
          </div>
          {caseData ? (
            <div>
              <AppLink
                to={`/cases/${caseData.id}?from=agent`}
                className="block py-1 hover:bg-slate-50/80"
              >
                <div className="text-xs font-medium text-slate-900">{caseData.title}</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {caseData.caseNo} · 风险 {caseData.risk} · {caseData.progress}%
                  {handoffStatus
                    ? ` · 交接 ${HANDOFF_LABELS[handoffStatus]}`
                    : ''}
                </div>
                <div className="mt-1 text-xs text-slate-700">在作业中台打开 →</div>
              </AppLink>
              {wb && (
                <AppLink
                  to={wb}
                  className="mt-1 inline-block text-xs text-slate-600 hover:underline"
                >
                  打开对应表单工作台
                </AppLink>
              )}
            </div>
          ) : (
            <p className="border border-dashed border-slate-200 px-2.5 py-3 text-center text-xs text-slate-400">
              未关联案件
            </p>
          )}
        </section>

        <div className="border-b border-slate-100 px-2 py-2">
          <CaseContextContractPanel snap={caseContextSnap} compact />
        </div>

        {caseId && (
          <details className="border-b border-slate-100">
            <summary className="cursor-pointer px-3 py-2.5 text-[11px] font-medium text-slate-400 hover:text-slate-600">
              案级 Drive
              {caseDriveItems.length > 0
                ? ` · 示 ${driveVisible.length}/${caseDriveItems.length}`
                : ' · 空'}
              <span className="ml-1 font-normal text-slate-300">
                演示内存 · 与产物去重展示
              </span>
            </summary>
            <div className="px-3 pb-3">
              {caseDriveItems.length === 0 ? (
                <p className="text-xs text-slate-400">
                  批准 / 调研 / OA 确认后出现（非网盘）
                </p>
              ) : (
                <>
                  {driveHidden > 0 && (
                    <p className="mb-1.5 text-[10px] text-slate-400">
                      已隐藏 {driveHidden} 条与下方产物 title 重复的 Drive 摘要（存储未改）
                    </p>
                  )}
                  {driveVisible.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      全部与会话产物去重 · 见下方「产物」
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-100 border-y border-slate-100">
                      {driveVisible.slice(0, 8).map((d) => (
                        <li key={d.id} className="py-1.5 text-xs">
                          <div className="font-medium text-slate-800">{d.title}</div>
                          <div className="text-[11px] text-slate-500">
                            {d.kind} · {d.at}
                            {d.source ? ` · ${d.source}` : ''}
                          </div>
                          <div className="mt-0.5 line-clamp-2 text-[11px] text-slate-600">
                            {d.summary}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </details>
        )}

        <section className="border-b border-slate-100 px-3 py-3">
          <div className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <CalendarDays className="h-3 w-3" aria-hidden /> 期限
          </div>
          {caseDockets.length === 0 ? (
            <p className="text-xs text-slate-400">无关联期限</p>
          ) : (
            <ul className="divide-y divide-slate-100 border-y border-slate-100">
              {caseDockets.map((d) => (
                <li key={d.id} className="py-2 text-xs">
                  <div className="font-medium text-slate-800">{d.title}</div>
                  <div className="text-xs text-slate-500">
                    截止 {d.dueDate} · {DOCKET_STATUS_LABEL[d.status] ?? d.status}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border-b border-slate-100 px-3 py-3">
          <div className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <FileText className="h-3 w-3" aria-hidden /> 产物
          </div>
          {artifacts.length === 0 ? (
            <p className="text-xs text-slate-400">办理后出现草稿</p>
          ) : (
            <>
              <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1">
                {artifacts.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => onSelectArtifact(a.id)}
                    className={`btn-press focus-ring border-b-2 px-0.5 py-0.5 text-xs ${
                      activeArt?.id === a.id
                        ? 'border-slate-900 font-medium text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {a.title}
                  </button>
                ))}
              </div>
              {activeArt && (
                <details className="rounded border border-slate-100">
                  <summary className="cursor-pointer px-2 py-1.5 text-[11px] text-slate-400 hover:text-slate-600">
                    {activeArt.editable ? '编辑产物' : '查看产物'}
                    {' · '}
                    {activeArt.title}
                  </summary>
                  <textarea
                    value={activeArt.content}
                    onChange={(e) =>
                      onUpdateArtifact(activeArt.id, e.target.value)
                    }
                    rows={10}
                    className="focus-ring w-full resize-none border-t border-slate-100 bg-white p-2.5 font-mono text-xs leading-relaxed text-slate-800 outline-none focus:border-slate-400"
                    readOnly={!activeArt.editable}
                  />
                </details>
              )}
            </>
          )}
        </section>

        {caseId && (
          <details className="border-b border-slate-100">
            <summary className="cursor-pointer px-3 py-2.5 text-[11px] font-medium text-slate-400 hover:text-slate-600">
              办理记录
            </summary>
            <ul className="divide-y divide-slate-100 border-t border-slate-100 px-3 pb-2">
              {auditEntries.map((a) => (
                <li key={a.id} className="py-1.5 text-xs">
                  <span
                    className={
                      a.actor === 'agent' ? 'text-emerald-700' : 'text-slate-600'
                    }
                  >
                    {ACTOR_LABEL[a.actor] ?? a.actor}
                  </span>
                  {' · '}
                  <span className="text-slate-700">
                    {COMMAND_LABELS[a.command]}
                  </span>
                  {' · '}
                  <span
                    className={
                      isLegacyAudit(a) ? 'font-mono text-amber-700' : 'font-mono text-slate-400'
                    }
                  >
                    {auditSchemaVersionLabel(a.schemaVersion)}
                  </span>
                </li>
              ))}
              {auditEntries.length === 0 && (
                <li className="py-1.5 text-xs text-slate-400">正式执行并确认后出现</li>
              )}
            </ul>
          </details>
        )}

        {agent && (
          <details>
            <summary className="cursor-pointer px-3 py-2.5 text-[11px] font-medium text-slate-400 hover:text-slate-600">
              高级 · 能力与架构
            </summary>
            <div className="flex flex-wrap gap-x-2 gap-y-1 border-t border-slate-100 px-3 pb-3 pt-2">
              {agent.tools.map((t) => (
                <span
                  key={t}
                  className="text-xs text-slate-600"
                  title={t}
                >
                  {toolCatalogLabel(t)}
                </span>
              ))}
            </div>
          </details>
        )}
      </div>
    </aside>
  )
}
