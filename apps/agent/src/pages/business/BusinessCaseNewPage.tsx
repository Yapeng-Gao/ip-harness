import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import type { BusinessHomeStartState } from './BusinessCasesPage'

/**
 * /agent/cases/new · 开案子 · product-pages §4.1
 * 机制：极少字段立案 → 进公司首页（本案壳）。
 * 禁：业务线上屏；外挂作大标题；长表单 / 八部地图 / 建完直进交底；
 * 禁：「产品首页 / 薄入口」黑话；禁双回链抢主。
 * 首屏：尽快申下来一句 → 案名* → 技术一句话/创建人（短）→ 主 CTA。
 */
export function BusinessCaseNewPage() {
  const { createCaseFromWizard } = useBusinessCases()
  const navigate = useNavigate()
  const loc = useLocation()
  const start = (loc.state ?? null) as BusinessHomeStartState | null

  const [title, setTitle] = useState(() => start?.title?.trim() ?? '')
  const [summary, setSummary] = useState(() => start?.summary?.trim() ?? '')
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
    })
    navigate(`/agent/cases/${p.id}`)
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
          尽快申下来 · 虚拟知产公司
        </p>
        <p
          className="mt-0.5 text-[11px] text-slate-400"
          data-testid="business-new-eyebrow"
        >
          外挂知产能力旁注 · 不作本页大标题
        </p>
        <h1
          className="mt-2 text-[20px] font-semibold tracking-tight text-slate-900"
          data-testid="business-new-heading"
        >
          开案子
        </h1>
        <p className="mt-1 text-sm text-slate-500" data-testid="business-new-tagline">
          极少字段立一条要办的专利案，然后进本案进度。不在此填交底长表。
        </p>

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
            技术一句话
            <span className="ml-1 font-normal text-slate-400">（短）</span>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              placeholder="用一句话说明要保护什么"
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
            创建并进本案
          </button>

          <p
            className="text-center text-[11px] text-slate-400"
            data-testid="business-new-footnote"
          >
            建完先进公司首页 · 不在此填交底长表
          </p>
        </form>
      </div>
    </div>
  )
}
