import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FileText, FolderInput, MessageSquare, Trash2 } from 'lucide-react'
import {
  ASSET_CATEGORIES,
  ASSET_KIND_LABEL,
  formatAssetSize,
  formatAssetTime,
  useAssetLibrary,
  type AssetCategory,
} from '../../assets/AssetLibraryContext'
import { useProjectFolder } from '../../projects/ProjectFolderContext'

type Props = {
  selectedId: string | null
}

/**
 * 资产右栏 · 详情 + 分类 + 挂载
 * 「作为对话附件」跳到首页并把资料放进新案向导（样机：走 query 传递）。
 */
export function AssetDetail({ selectedId }: Props) {
  const { getDoc, assignCategory, linkToProject, remove, setNote } = useAssetLibrary()
  const { folderProjects } = useProjectFolder()
  const doc = selectedId ? getDoc(selectedId) : undefined

  const project = useMemo(
    () => (doc?.projectId ? folderProjects.find((p) => p.id === doc.projectId) : undefined),
    [doc, folderProjects],
  )

  if (!doc) {
    return (
      <aside
        className="hidden w-[min(19rem,32vw)] shrink-0 flex-col border-l border-slate-200/90 bg-[#f5f5f7] px-4 py-6 xl:flex"
        aria-label="资料详情"
        data-testid="asset-detail-empty"
      >
        <FileText className="h-5 w-5 text-slate-400" strokeWidth={1.75} aria-hidden />
        <p className="mt-2 text-[12px] font-medium text-slate-700">选一份资料</p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
          看元数据、改分类，或挂到项目 / 带到对话里。
        </p>
      </aside>
    )
  }

  return (
    <aside
      className="flex w-[min(19rem,38vw)] min-w-[15rem] max-w-[21rem] shrink-0 flex-col overflow-y-auto border-l border-slate-200/90 bg-[#f5f5f7]"
      aria-label="资料详情"
      data-testid="asset-detail"
    >
      <div className="px-4 pt-3">
        <div className="flex items-start gap-2">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" strokeWidth={1.75} aria-hidden />
          <h2 className="min-w-0 flex-1 break-words text-[13px] font-semibold leading-snug text-slate-900">
            {doc.name}
          </h2>
        </div>
        <p className="mt-1 text-[11px] text-slate-600">
          {ASSET_KIND_LABEL[doc.kind]} · {formatAssetSize(doc.size)} · {formatAssetTime(doc.uploadedAt)}
        </p>
      </div>

      <div className="mt-3 space-y-3 px-4">
        <div>
          <label
            htmlFor="asset-category"
            className="block text-[10px] font-semibold uppercase tracking-wide text-slate-600"
          >
            分类
          </label>
          <select
            id="asset-category"
            value={doc.category}
            onChange={(e) => assignCategory(doc.id, e.target.value as AssetCategory)}
            className="ui-input ui-input-sm focus-ring mt-1"
            data-testid="asset-category-select"
          >
            {ASSET_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="asset-project"
            className="block text-[10px] font-semibold uppercase tracking-wide text-slate-600"
          >
            所属项目
          </label>
          <select
            id="asset-project"
            value={doc.projectId ?? ''}
            onChange={(e) => linkToProject(doc.id, e.target.value || undefined)}
            className="ui-input ui-input-sm focus-ring mt-1"
            data-testid="asset-project-select"
          >
            <option value="">未挂项目</option>
            {folderProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          {project && (
            <Link
              to={`/agent/projects/${project.id}`}
              className="focus-ring mt-1 inline-flex items-center gap-1 rounded text-[11px] font-medium text-sky-700 hover:underline"
            >
              <FolderInput className="h-3 w-3" strokeWidth={1.75} aria-hidden />
              打开项目
            </Link>
          )}
        </div>

        <div>
          <label
            htmlFor="asset-note"
            className="block text-[10px] font-semibold uppercase tracking-wide text-slate-600"
          >
            备注
          </label>
          <textarea
            id="asset-note"
            defaultValue={doc.note ?? ''}
            onBlur={(e) => setNote(doc.id, e.target.value)}
            rows={2}
            placeholder="一句话说明这份资料的用途"
            className="focus-ring mt-1 w-full resize-y rounded-[var(--radius-md)] border border-slate-200 px-2 py-1.5 text-[12px] placeholder:text-slate-500"
          />
        </div>

        <div className="rounded-[var(--radius-md)] border border-slate-200 bg-white p-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
            预览 · 样机
          </p>
          <div className="mt-1.5 flex h-24 items-center justify-center rounded-[var(--radius-sm)] border border-dashed border-slate-200 bg-slate-50 text-[11px] text-slate-500">
            不解析文件内容
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Link
            to={`/agent?attach=${encodeURIComponent(doc.id)}`}
            className="focus-ring inline-flex min-h-9 items-center gap-1 rounded-[var(--radius-sm)] bg-slate-900 px-2.5 text-[12px] font-medium text-white hover:bg-slate-800"
            data-testid="asset-attach-to-chat"
          >
            <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            作为对话附件
          </Link>
          <button
            type="button"
            onClick={() => remove(doc.id)}
            className="focus-ring inline-flex min-h-9 items-center gap-1 rounded-[var(--radius-sm)] border border-slate-200 bg-white px-2.5 text-[12px] text-slate-700 hover:bg-rose-50 hover:text-rose-800"
            data-testid="asset-remove"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            移除
          </button>
        </div>

        <p className="pb-3 text-[11px] leading-relaxed text-slate-500">
          样机 · 只登记元数据，不解析、不落盘 · 移除仅从本机列表删除
        </p>
      </div>
    </aside>
  )
}
