import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FolderKanban } from 'lucide-react'
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
  core: '主办理相关席',
  assist: '辅席（FTO≠维权）',
  phase: '后置业务（可演示）',
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
 * 席位样机目录旁路 · /agent/seats
 * 非一期进门；禁组队入口回潮；浏览单席 / 进本案 / 回流示意
 */
export function PatentCatalogPage() {
  const navigate = useNavigate()
  const { getThread } = useProjectFolder()
  const { cases: bizCases, getPendingConfirms } = useBusinessCases()
  const [bizCaseId, setBizCaseId] = useState(bizCases[0]?.id ?? '')

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

  const openSeat = (id: ProjectExpertId) => {
    if (COLD_START_BLOCKED.includes(id)) {
      window.alert(
        '递交与审查答复须从公司案推进后派发，不可从样机目录冷启动截入。',
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
            <p
              className="text-[11px] font-medium uppercase tracking-wider text-amber-800/80"
              data-testid="patent-catalog-bypass-kicker"
            >
              旁路 · 席位样机
            </p>
            <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-slate-900">
              席位样机目录
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              样机单席与回流故事线 · 非一期主办理 · 请回大厅委托或公司案八部
            </p>
            <p
              className="mt-1 text-[11px] font-medium text-violet-700"
              data-testid="pack16-count"
            >
              演示席 {pack16Count}/16 · 主路径请回大厅 / 公司案 · 请从公司案办理
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <Link
              to="/agent/projects/proj-demo-patent"
              className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 font-medium text-violet-800"
            >
              打开演示项目夹
            </Link>
            <Link
              to="/agent/projects"
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600"
              data-testid="catalog-to-projects"
            >
              <span className="inline-flex items-center gap-1">
                <FolderKanban className="h-3 w-3" aria-hidden />
                遗留项目夹
              </span>
            </Link>
            <Link
              to="/agent"
              className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-900"
              data-testid="catalog-back-hall"
            >
              回大厅
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
            点席「进本案」→ 同案席位；待确认不丢。请从公司案八部办理。
          </p>
        </div>
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
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`rounded border px-1.5 py-px text-[11px] font-semibold ${expertAccentClass(def.accent)}`}
                          >
                            {def.name}
                          </span>
                          {phase && (
                            <span className="rounded bg-slate-200 px-1 text-[9px] font-semibold text-slate-600">
                              后置
                            </span>
                          )}
                          {PACK16.has(id) && (
                            <span className="rounded bg-violet-100 px-1 text-[9px] text-violet-800">
                              演示席
                            </span>
                          )}
                          {def.ownerLabel && (
                            <span className="text-[10px] text-slate-400">
                              {def.ownerLabel}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] leading-snug text-slate-500">
                          {def.description}
                        </p>
                        {d && (
                          <p className="mt-1 text-[10px] text-slate-400">
                            成果示意 · {d.title} + 办理摘记
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
                            {blocked ? '须从案推进' : '样机单聊'}
                          </button>
                          <button
                            type="button"
                            onClick={() => openBizSeat(id)}
                            disabled={
                              bizCases.length === 0 || isOrchestratorExpert(id)
                            }
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
