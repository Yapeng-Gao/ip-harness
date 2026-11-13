import { useState, type FormEvent } from 'react'
import { HALL_DEPT_DOORS } from '../../business/hallDepts'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import {
  clearReceptionPending,
  buildReceptionHandoff,
  readReceptionPending,
} from '../../business/receptionHandoff'
import type { BusinessHomeStartState } from './BusinessCasesPage'

/**
 * /agent/cases/new · 开案子 · product-pages §4.1
 * 机制：极少字段立案 → 进公司首页（本案壳）。
 * 禁：业务线上屏；外挂作大标题；长表单 / 八部地图 / 建完直进交底；
 * 禁：「产品首页 / 薄入口」黑话；禁双回链抢主。
 * 首屏：尽快申下来一句 → 案名* → 技术一句话/创建人（短）→ 主 CTA。
 * 01c：?after=reception 时建案后写入前台意图并领进选定部。
 */
export function BusinessCaseNewPage() {
  const { createCaseFromWizard, setReceptionHandoff } = useBusinessCases()
  const navigate = useNavigate()
  const loc = useLocation()
  const [params] = useSearchParams()
  const afterReception = params.get('after') === 'reception'
  const directDept = HALL_DEPT_DOORS.find((door) => door.slug === params.get('dept'))
  const start = (loc.state ?? null) as BusinessHomeStartState | null
  const receptionDraft = afterReception ? readReceptionPending() : null

  const [title, setTitle] = useState(
    () =>
      start?.title?.trim() ||
      receptionDraft?.goalText.slice(0, 32) ||
      receptionDraft?.intents[0]?.slice(0, 32) ||
      '',
  )
  const [summary, setSummary] = useState(
    () => start?.summary?.trim() || receptionDraft?.goalText || '',
  )
  const [creator, setCreator] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const name = title.trim()
    if (!name) {
      setError('请先填写案名，才能创建并进本案。')
      return
    }
    setError(null)
    const blurb = summary.trim()
    const who = creator.trim()
    const summaryParts = [blurb, who ? `创建人：${who}` : ''].filter(Boolean)
    const p = createCaseFromWizard({
      title: name,
      summary: summaryParts.join(' · ') || undefined,
      casePlan: start?.casePlan,
    })
    if (afterReception) {
      const pending = readReceptionPending()
      if (pending) {
        setReceptionHandoff(p.id, pending)
        clearReceptionPending()
        navigate(
          `/agent/cases/${p.id}/depts/${pending.selectedSlug}?reception=1`,
        )
        return
      }
    }
    if (directDept) setReceptionHandoff(p.id, buildReceptionHandoff({ selectedSlug: directDept.slug, primarySlug: directDept.slug, goalText: blurb || name, reason: '用户直接选择部门办理' }))
    navigate(directDept ? `/agent/cases/${p.id}/depts/${directDept.slug}` : `/agent/cases/${p.id}`)
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="business-case-new-page"
      data-case-new="v1"
    >
      <div className="mx-auto w-full max-w-xl">
        <nav
          className="mb-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500"
          aria-label="开案子次要入口"
          data-testid="business-new-secondary"
        >
          <Link
            to="/agent"
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="business-new-back-hall"
          >
            回大厅
          </Link>
          <span aria-hidden className="text-slate-300">
            ·
          </span>
          <Link
            to="/agent/cases"
            className="focus-ring rounded-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            data-testid="business-new-to-cases"
          >
            案盘
          </Link>
        </nav>

        <p
          className="text-[12px] font-medium text-slate-700"
          data-testid="business-new-goal"
        >
          新办事项 · 独立案卷
        </p>
        <p
          className="mt-0.5 text-[11px] text-slate-400"
          data-testid="business-new-eyebrow"
        >
          将这次来意存为独立案件，后续材料与决策在本案内继续。
        </p>
        <h1
          className="mt-2 text-[20px] font-semibold tracking-tight text-slate-900"
          data-testid="business-new-heading"
        >
          {directDept ? `开案子 · 继续到${directDept.label}` : '开案子'}
        </h1>
        <p className="mt-1 text-sm text-slate-500" data-testid="business-new-tagline">
          {afterReception
            ? '确认案名和技术描述，就能带着这次来意继续办理。'
            : directDept ? '先为本次事项建独立案卷，创建后由该部门负责人接待，确认目标和材料。' : '填写案名和本次来意，创建后选择部门继续办理。材料可以随后补充。'}
        </p>
        {afterReception ? (
          <p
            className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12px] text-slate-600"
            data-testid="business-new-reception-pending"
          >
            案名和技术描述已按前台来意预填；确认开案后会直接领进对应部门。
          </p>
        ) : null}

        <form
          onSubmit={onSubmit}
          className="mt-5 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          data-testid="business-new-form"
        >
          <label className="block text-xs text-slate-600">
            案名
            <span className="ml-1 text-red-500" aria-hidden>
              *
            </span>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (error) setError(null)
              }}
              placeholder="例如：边缘调度模组"
              required
              className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              data-testid="business-new-title"
              autoFocus
            />
          </label>

          <label className="block text-xs text-slate-600">
            本次来意
            <span className="ml-1 font-normal text-slate-400">（短）</span>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              placeholder={directDept?.slug === 'monetize' ? '例如：复盘今年的项目与专利，先整理总结' : '用一句话说明这次希望办成什么事'}
              className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              data-testid="business-new-summary"
            />
          </label>

          <label className="block text-xs text-slate-600">
            创建人
            <span className="ml-1 font-normal text-slate-400">（短 · 可选）</span>
            <input
              value={creator}
              onChange={(e) => setCreator(e.target.value)}
              placeholder="姓名或邮箱"
              autoComplete="name"
              className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              data-testid="business-new-contact"
            />
          </label>

          {error && (
            <p className="text-xs text-red-600" role="alert" data-testid="business-new-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-press focus-ring w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            data-testid="business-new-submit"
          >
            {directDept ? `创建并进入${directDept.label}` : '创建并进本案'}
          </button>

          <p
            className="text-center text-[11px] text-slate-400"
            data-testid="business-new-footnote"
          >
            {afterReception ? '创建后直接进入前台建议的部门' : directDept ? `创建后继续到${directDept.label}` : '创建后查看本案进度'}
          </p>
        </form>
      </div>
    </div>
  )
}
