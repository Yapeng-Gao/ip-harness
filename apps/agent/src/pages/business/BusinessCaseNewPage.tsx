import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useBusinessCases } from '../../business/BusinessCaseContext'
import type { BusinessHomeStartState } from './BusinessCasesPage'

/**
 * /agent/cases/new · 开案子（§4.1）
 * 首屏：外挂 IP 部一句 + 案名（必填）+ 技术一句话（短）
 * 主 CTA：创建并进入公司首页；禁止长表单 / 七部地图 / 直进交底
 */
export function BusinessCaseNewPage() {
  const { createCaseFromWizard } = useBusinessCases()
  const navigate = useNavigate()
  const loc = useLocation()
  const start = (loc.state ?? null) as BusinessHomeStartState | null

  const [title, setTitle] = useState(() => start?.title?.trim() ?? '')
  const [summary, setSummary] = useState(() => start?.summary?.trim() ?? '')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const name = title.trim()
    if (!name) {
      setError('请先填写案名')
      return
    }
    setError(null)
    const p = createCaseFromWizard({
      title: name,
      summary: summary.trim() || undefined,
    })
    navigate(`/agent/cases/${p.id}`)
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
      data-testid="business-case-new-page"
    >
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-4 text-[11px] text-slate-400">
          <Link to="/agent" className="hover:underline">
            产品首页
          </Link>
          <span className="mx-1">/</span>
          开案子
        </div>

        <p
          className="text-[11px] font-medium uppercase tracking-wider text-slate-500"
          data-testid="business-new-eyebrow"
        >
          外挂 IP 部
        </p>
        <h1
          className="mt-1 text-[20px] font-semibold tracking-tight text-slate-900"
          data-testid="business-new-heading"
        >
          开案子
        </h1>
        <p className="mt-1 text-sm text-slate-500" data-testid="business-new-tagline">
          极少字段立一条业务线，然后进公司首页看懂部门与专家。
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
            技术一句话（可选）
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              placeholder="要保护什么、一句话即可"
              className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              data-testid="business-new-summary"
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
            创建并进入公司首页
          </button>

          <p className="text-center text-[11px] text-slate-400">
            建完先进公司首页，不在此页进交底或七部作业
          </p>
        </form>
      </div>
    </div>
  )
}
