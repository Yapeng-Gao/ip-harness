import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckSquare, Square, Users, MessageSquare, FolderKanban } from 'lucide-react'
import {
  COLD_START_BLOCKED,
  PATENT_CATALOG_IDS,
  expertAccentClass,
  getProjectExpert,
  isOrchestratorExpert,
} from '../../projects/experts'
import { deliverableForExpert } from '../../projects/patentDeliverables'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import type { ProjectExpertId } from '../../projects/types'
import { PackHitlOverview } from '../../components/patent/PackHitlOverview'
import { PackHitlWalkBar } from '../../components/patent/PackHitlWalkBar'

const GROUP_LABEL: Record<string, string> = {
  orch: '总控',
  pre: '立项前簇（可选）',
  core: '主链路',
  assist: '辅席（建议勾 · FTO≠维权）',
  phase: 'F7–F9 后置业务（可跑 · Phase 标签）',
}

/** Pack 16 业务席（不含总控 / 不含 FTO 辅席） */
const PACK16 = new Set<ProjectExpertId>([
  'expert-landscape',
  'expert-competitor',
  'expert-inspire',
  'expert-mining',
  'expert-layout',
  'expert-intake',
  'expert-disclosure',
  'expert-research',
  'expert-draft',
  'expert-figure',
  'expert-filing',
  'expert-oa',
  'expert-annuity',
  'expert-valuation',
  'expert-monetize',
  'expert-enforcement',
])

/**
 * Default /agent cold start — patent Catalog with Pack 16 + HITL×8.
 */
export function PatentCatalogPage() {
  const navigate = useNavigate()
  const { createProject } = useProjectFolder()
  const [title, setTitle] = useState('边缘调度模组 · 专利专班')
  const [selected, setSelected] = useState<Set<ProjectExpertId>>(() => {
    const init = new Set<ProjectExpertId>()
    for (const id of PATENT_CATALOG_IDS) {
      if (getProjectExpert(id).defaultTeam) init.add(id)
    }
    return init
  })

  const pack16Count = useMemo(
    () => PATENT_CATALOG_IDS.filter((id) => PACK16.has(id)).length,
    [],
  )

  const grouped = useMemo(() => {
    const order = ['orch', 'pre', 'core', 'assist', 'phase'] as const
    return order.map((g) => ({
      group: g,
      seats: PATENT_CATALOG_IDS.filter(
        (id) => (getProjectExpert(id).catalogGroup ?? 'core') === g,
      ),
    }))
  }, [])

  const toggle = (id: ProjectExpertId) => {
    if (isOrchestratorExpert(id)) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      next.add('orchestrator')
      return next
    })
  }

  const teamIds = useMemo(() => {
    const ids = PATENT_CATALOG_IDS.filter((id) => selected.has(id))
    if (!ids.includes('orchestrator')) ids.unshift('orchestrator')
    return ids
  }, [selected])

  const onCreateTeam = (openRoom?: boolean) => {
    const p = createProject({
      title: title.trim() || '专利专班',
      summary: `Catalog 组队 · ${teamIds.length} 席 · Pack16=${pack16Count}`,
      kind: 'domain',
      domainPackId: 'patent',
      expertIds: teamIds,
    })
    navigate(
      openRoom
        ? `/agent/projects/${p.id}/room`
        : `/agent/projects/${p.id}`,
    )
  }

  const openSeat = (id: ProjectExpertId) => {
    if (COLD_START_BLOCKED.includes(id)) {
      window.alert(
        '禁止专家截入：递交/OA 须从建项目起，并由总控在 file 后派发。请先组成专班。',
      )
      return
    }
    navigate(`/agent/seats/${id}`)
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="patent-catalog-page"
    >
      <header className="mx-auto mb-6 max-w-4xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
              专利专家 Catalog
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Pack 16 席对齐 · mock validator · HITL×8 · 过程可见（成果 +
              worklog）
            </p>
            <p
              className="mt-1 text-[11px] font-medium text-violet-700"
              data-testid="pack16-count"
            >
              业务席名单 {pack16Count}/16（含 Phase）· mining≠intake ·
              FTO≠无效维权
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <Link
              to="/agent/projects/proj-demo-patent"
              className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 font-medium text-violet-800"
            >
              打开演示项目
            </Link>
            <Link
              to="/agent/sandbox"
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-500"
              data-testid="patent-to-sandbox"
            >
              通用沙盒 Solo（旁路）
            </Link>
            <Link
              to="/agent/team"
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-500"
              data-testid="patent-to-team"
            >
              Team（旁路）
            </Link>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <PackHitlOverview />
          <PackHitlWalkBar />
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <label className="min-w-[12rem] flex-1 text-xs text-slate-600">
            项目标题
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              data-testid="patent-team-title"
            />
          </label>
          <button
            type="button"
            onClick={() => onCreateTeam(false)}
            className="btn-press focus-ring inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
            data-testid="patent-team-create"
          >
            <Users className="h-3.5 w-3.5" aria-hidden />
            组成专班并建项目
          </button>
          <button
            type="button"
            onClick={() => onCreateTeam(true)}
            className="btn-press focus-ring inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900"
            data-testid="patent-team-create-room"
          >
            <MessageSquare className="h-3.5 w-3.5" aria-hidden />
            组队并开群聊
          </button>
          <Link
            to="/agent/projects"
            className="btn-press focus-ring inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-600"
          >
            <FolderKanban className="h-3.5 w-3.5" aria-hidden />
            项目列表
          </Link>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          已选 {teamIds.length} 席（总控必选）· 后置席可勾选入队 ·
          禁冷启动截入递交/OA · 端用户禁 mid 深链
        </p>
      </header>

      <div className="mx-auto max-w-4xl space-y-6">
        {grouped.map(({ group, seats }) =>
          seats.length === 0 ? null : (
            <section key={group}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {GROUP_LABEL[group] ?? group}
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {seats.map((id) => {
                  const def = getProjectExpert(id)
                  const d = deliverableForExpert(id)
                  const checked = selected.has(id)
                  const blocked = COLD_START_BLOCKED.includes(id)
                  const phase = !!def.phase
                  return (
                    <li
                      key={id}
                      className={`rounded-xl border p-3 shadow-sm ${
                        phase
                          ? 'border-dashed border-slate-300 bg-slate-50/90'
                          : 'border-slate-200 bg-white'
                      }`}
                      data-testid={`patent-catalog-seat-${id}`}
                      data-phase={phase ? 'true' : 'false'}
                      data-pack16={PACK16.has(id) ? 'true' : 'false'}
                    >
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          onClick={() => toggle(id)}
                          className="focus-ring mt-0.5 shrink-0 text-slate-700"
                          aria-pressed={checked}
                          aria-label={checked ? '取消勾选' : '勾选'}
                          disabled={isOrchestratorExpert(id)}
                        >
                          {checked ? (
                            <CheckSquare className="h-4 w-4 text-slate-900" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`rounded border px-1.5 py-px text-[11px] font-semibold ${expertAccentClass(def.accent)}`}
                            >
                              {def.name}
                            </span>
                            {phase && (
                              <span className="rounded bg-slate-200 px-1 text-[9px] font-semibold text-slate-600">
                                Phase
                              </span>
                            )}
                            {PACK16.has(id) && (
                              <span className="rounded bg-violet-100 px-1 text-[9px] text-violet-800">
                                Pack
                              </span>
                            )}
                            {def.ownerLabel && (
                              <span className="text-[10px] text-slate-400">
                                Owner · {def.ownerLabel}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[11px] leading-snug text-slate-500">
                            {def.description}
                          </p>
                          {d && (
                            <p className="mt-1 font-mono text-[10px] text-slate-400">
                              {d.artifactFile} + {d.worklogFile}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => openSeat(id)}
                              disabled={blocked}
                              className="btn-press focus-ring rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                              data-testid={`patent-seat-dm-${id}`}
                            >
                              {blocked ? '须建项目' : '单聊'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          ),
        )}
      </div>
    </div>
  )
}
