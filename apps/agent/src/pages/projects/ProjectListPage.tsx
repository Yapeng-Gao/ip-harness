import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FolderPlus, FolderKanban } from 'lucide-react'
import { useProjectFolder } from '../../projects/ProjectFolderContext'
import { useApp } from '@shared/context/AppContext'

export function ProjectListPage() {
  const { projects, createProject } = useProjectFolder()
  const { visibleCases } = useApp()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [caseId, setCaseId] = useState('')

  const onCreate = () => {
    const p = createProject({
      title: title.trim() || '新项目文件夹',
      summary: summary.trim(),
      caseId: caseId || undefined,
    })
    setTitle('')
    setSummary('')
    navigate(`/agent/projects/${p.id}`)
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-950">
        <strong>样机 · 无真 LLM · 专家分剧本</strong>
        （形式像 Grok Bot：项目文件夹 + 总控 + 专家私聊；每专家自带业务逻辑）
      </div>

      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <h1 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <FolderKanban className="h-5 w-5" aria-hidden />
          项目文件夹
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          建项目 → 总控派活 → 进专家私聊见差异化工具条/步骤/HITL
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
          <label className="mb-3 flex items-center gap-2 text-xs text-slate-500">
            关联案件（可选）
            <select
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              className="focus-ring rounded border border-slate-200 bg-slate-50 px-2 py-1"
            >
              <option value="">不绑定</option>
              {visibleCases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={onCreate}
            className="btn-press focus-ring rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            创建并打开总控
          </button>
        </div>

        <ul className="mt-6 space-y-2">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                to={`/agent/projects/${p.id}`}
                className="focus-ring block rounded-lg border border-slate-200 bg-white px-4 py-3 hover:border-slate-300 hover:shadow-sm"
              >
                <div className="text-sm font-medium text-slate-900">{p.title}</div>
                {p.summary && (
                  <div className="mt-0.5 text-xs text-slate-500">{p.summary}</div>
                )}
                <div className="mt-1 text-[10px] text-slate-400">
                  专家 {p.expertIds.filter((e) => e !== 'orchestrator').length} ·
                  含总控席
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
