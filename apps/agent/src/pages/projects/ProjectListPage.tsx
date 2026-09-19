import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FolderPlus, FolderKanban } from 'lucide-react'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import { isOrchestratorExpert, projectKindBadge } from '../../projects/experts'
import { useApp } from '@shared/context/AppContext'
import type { DomainPackId, ProjectKind } from '../../projects/types'

export function ProjectListPage() {
  const { projects, createProject } = useProjectFolder()
  const { visibleCases } = useApp()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [kind, setKind] = useState<ProjectKind>('general')
  const [domainPackId, setDomainPackId] = useState<DomainPackId>('patent')
  const [caseId, setCaseId] = useState('')

  const onCreate = () => {
    const p = createProject({
      title: title.trim() || '新项目文件夹',
      summary: summary.trim(),
      kind,
      domainPackId: kind === 'domain' ? domainPackId : undefined,
      caseId: caseId || undefined,
    })
    setTitle('')
    setSummary('')
    setCaseId('')
    navigate(`/agent/projects/${p.id}`)
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-950">
        <strong>样机 · 无真 LLM · 专家分剧本</strong>
        （项目次级入口 · general 无专利步骤 · domain/patent 挂 DomainPack）
      </div>

      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <h1 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <FolderKanban className="h-5 w-5" aria-hidden />
          项目模式
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          可选模式：通用多 bot 协作，或挂 patent DomainPack。默认入口仍是{' '}
          <Link to="/agent" className="underline">
            /agent 通用单聊
          </Link>
          。
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-800">
            <FolderPlus className="h-4 w-4" aria-hidden />
            新建项目
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="项目标题"
            className="focus-ring mb-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            aria-label="项目标题"
          />
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="一句话目标（可选）"
            rows={2}
            className="focus-ring mb-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            aria-label="项目摘要"
          />
          <fieldset className="mb-3">
            <legend className="mb-1 text-xs font-medium text-slate-600">项目类型</legend>
            <div className="flex flex-wrap gap-3 text-xs text-slate-700">
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="radio"
                  name="kind"
                  checked={kind === 'general'}
                  onChange={() => setKind('general')}
                />
                通用（无专利步骤）
              </label>
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="radio"
                  name="kind"
                  checked={kind === 'domain'}
                  onChange={() => setKind('domain')}
                />
                领域包
              </label>
            </div>
          </fieldset>
          {kind === 'domain' ? (
            <label className="mb-2 flex items-center gap-2 text-xs text-slate-500">
              DomainPack
              <select
                value={domainPackId}
                onChange={(e) => setDomainPackId(e.target.value as DomainPackId)}
                className="focus-ring rounded border border-slate-200 bg-slate-50 px-2 py-1"
              >
                <option value="patent">patent（专利）</option>
              </select>
            </label>
          ) : (
            <p className="mb-2 text-[11px] text-slate-400">
              通用项目无专利步骤条 / FTO / 权利要求 HITL。
            </p>
          )}
          <label className="mb-1 flex items-center gap-2 text-xs text-slate-500">
            关联案件（可选）
            <select
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              className="focus-ring rounded border border-slate-200 bg-slate-50 px-2 py-1"
              aria-label="关联案件（可选）"
              data-testid="project-create-case"
            >
              <option value="">可稍后创建或绑定案件</option>
              {visibleCases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <p className="mb-3 text-[11px] text-slate-400">
            不强制选案 · 进工作区后再「创建并绑定」或「绑定已有案」
          </p>
          <button
            type="button"
            onClick={onCreate}
            data-testid="project-create-submit"
            className="btn-press focus-ring rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            创建并打开总控
          </button>

        </div>

        <ul className="mt-6 space-y-2">
          {projects.map((p) => {
            const badge = projectKindBadge(p)
            return (
              <li key={p.id}>
                <Link
                  to={`/agent/projects/${p.id}`}
                  className="focus-ring block rounded-lg border border-slate-200 bg-white px-4 py-3 hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{p.title}</span>
                    <span
                      className={`rounded border px-1.5 py-px text-[10px] font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  {p.summary && (
                    <div className="mt-0.5 text-xs text-slate-500">{p.summary}</div>
                  )}
                  <div className="mt-1 text-[10px] text-slate-400">
                    bot {p.expertIds.filter((e) => !isOrchestratorExpert(e)).length} ·
                    含总控席
                    {p.domainPackId ? ` · pack=${p.domainPackId}` : ''}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
