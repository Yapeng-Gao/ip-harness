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
import { PackLoopsPanel } from '../../components/patent/PackLoopsPanel'
import {
  PACK_DEMO_PROJECT_ID,
  packHitlSeatProgress,
} from '../../projects/pack/patentHitlWalk'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import { businessSeatLabel } from '../../business/businessSeats'

const GROUP_LABEL: Record<string, string> = {
  orch: '案子助手（静默）',
  pre: '立项前簇（可选）',
  core: '主链路',
  assist: '辅席（建议勾 · FTO≠维权）',
  phase: '后置业务（即将推出 / 可演示）',
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
 * 专家工作台 · /agent/catalog（原 Catalog；非业务冷启动）
 */
export function PatentCatalogPage() {
  const navigate = useNavigate()
  const { createProject, getThread } = useProjectFolder()
  const { cases: bizCases, getPendingConfirms } = useBusinessCases()
  const [bizCaseId, setBizCaseId] = useState(bizCases[0]?.id ?? '')
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
      summary: `专家工作台组队 · ${teamIds.length} 席 · 演示16=${pack16Count}`,
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
        '请先组成专班：递交与审查答复须从建项目起，由案子助手在递交完成后派发。',
      )
      return
    }
    navigate(`/agent/seats/${id}`)
  }

  /** Catalog 进同一业务案席位（同 projectId · 不丢待确认） */
  const openBizSeat = (seatId: ProjectExpertId) => {
    const id = bizCaseId || bizCases[0]?.id
    if (!id) {
      window.alert('暂无业务案 · 请先在「我的案子」新建')
      return
    }
    if (COLD_START_BLOCKED.includes(seatId)) {
      window.alert('递交/审查答复须案子进度解锁，请从案子工作台推进。')
      navigate(`/agent/cases/${id}?seat=${seatId}`)
      return
    }
    navigate(`/agent/projects/${id}/bots/${seatId}`)
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
              专家工作台
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              16 个专家席 · 样机校验 · 待确认×8 · 成果 + 办理过程
            </p>
            <p
              className="mt-1 text-[11px] font-medium text-violet-700"
              data-testid="pack16-count"
            >
              演示席 {pack16Count}/16 · 业务默认请回「我的案子」
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
              通用沙盒（旁路）
            </Link>
            <Link
              to="/agent/team"
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-500"
              data-testid="patent-to-team"
            >
              团队旁路
            </Link>
            <Link
              to="/agent"
              className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-900"
              data-testid="catalog-back-cases"
            >
              我的案子
            </Link>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <PackHitlOverview
            projectId={PACK_DEMO_PROJECT_ID}
            {...packHitlSeatProgress(getThread, PACK_DEMO_PROJECT_ID)}
          />
          <PackHitlWalkBar />
          <PackLoopsPanel />
        </div>

        <div
          className="mt-4 flex flex-wrap items-end gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 shadow-sm"
          data-testid="catalog-biz-case-weld"
        >
          <label className="min-w-[12rem] flex-1 text-xs text-emerald-950">
            进同一业务案（禁平行宇宙）
            <select
              value={bizCaseId}
              onChange={(e) => setBizCaseId(e.target.value)}
              className="focus-ring mt-1 w-full rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm"
              data-testid="catalog-biz-case-select"
            >
              {bizCases.length === 0 && (
                <option value="">暂无业务案</option>
              )}
              {bizCases.map((c) => {
                const n = getPendingConfirms(c.id).length
                return (
                  <option key={c.id} value={c.id}>
                    {c.title}
                    {n > 0 ? ` · ${n} 待确认` : ''}
                  </option>
                )
              })}
            </select>
          </label>
          <button
            type="button"
            disabled={!bizCaseId && bizCases.length === 0}
            onClick={() => {
              const id = bizCaseId || bizCases[0]?.id
              if (id) navigate(`/agent/cases/${id}`)
            }}
            className="btn-press focus-ring rounded-md border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-900 disabled:opacity-40"
            data-testid="catalog-open-biz-case"
          >
            打开案子工作台
          </button>
          <p className="w-full text-[10px] text-emerald-800/80">
            点席「进本案」→ 同 projectId 席位；待确认不丢。下方「组成专班」仍会新建演示项目。
          </p>
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
          已选 {teamIds.length} 席（案子助手必选）· 后置席可勾选入队 ·
          禁冷启动截入递交/审查答复
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
                            <button
                              type="button"
                              onClick={() => openBizSeat(id)}
                              disabled={bizCases.length === 0 || isOrchestratorExpert(id)}
                              className="btn-press focus-ring rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-900 disabled:cursor-not-allowed disabled:opacity-40"
                              data-testid={`patent-seat-biz-${id}`}
                              title={
                                bizCaseId
                                  ? `进 ${bizCaseId} · ${businessSeatLabel(id)}`
                                  : '选业务案后进本案席'
                              }
                            >
                              进本案
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
