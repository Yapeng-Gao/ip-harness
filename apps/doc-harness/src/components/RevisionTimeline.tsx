import { History, RotateCcw } from 'lucide-react'
import type { DocumentRevision } from '../types'

type Props = {
  revisions: DocumentRevision[]
  chapterTitle: string
  previewRevisionId: string | null
  onPreview: (rev: DocumentRevision) => void
  onRequestRestore: (rev: DocumentRevision) => void
  onExitPreview: () => void
  collapsed?: boolean
  onToggleCollapsed?: () => void
}

export function RevisionTimeline({
  revisions,
  chapterTitle,
  previewRevisionId,
  onPreview,
  onRequestRestore,
  onExitPreview,
  collapsed = false,
  onToggleCollapsed,
}: Props) {
  const sorted = revisions.slice().sort((a, b) => b.seq - a.seq)

  return (
    <div className="border-t border-slate-200/80 bg-white">
      <button
        type="button"
        onClick={onToggleCollapsed}
        className="btn-press focus-ring flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
        aria-expanded={!collapsed}
      >
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
          <History className="h-3.5 w-3.5 text-slate-500" aria-hidden />
          Revision 时间线
          <span className="font-normal text-slate-400">· {sorted.length}</span>
        </span>
        <span className="text-[10px] text-slate-400">{collapsed ? '展开' : '收起'}</span>
      </button>
      {!collapsed ? (
        <div className="max-h-52 overflow-y-auto border-t border-slate-100 px-2 pb-2">
          <p className="px-1 py-1.5 text-[10px] leading-relaxed text-slate-500">
            当前章 · {chapterTitle} · 点条目只读预览 · 「恢复」需 Confirm
          </p>
          {previewRevisionId ? (
            <button
              type="button"
              onClick={onExitPreview}
              className="btn-press focus-ring mb-1.5 w-full rounded-md border border-slate-300 bg-slate-100 px-2 py-1.5 text-[10px] font-medium text-slate-700 hover:bg-slate-200"
            >
              返回编辑（退出预览）
            </button>
          ) : null}
          {sorted.length === 0 ? (
            <p className="px-1 py-2 text-[10px] text-slate-400">本章尚无 revision</p>
          ) : (
            <ul className="space-y-1">
              {sorted.map((rev) => {
                const active = rev.id === previewRevisionId
                return (
                  <li key={rev.id}>
                    <div
                      className={`rounded-md border px-2 py-1.5 ${
                        active
                          ? 'border-slate-400 bg-slate-100 ring-1 ring-slate-300'
                          : 'border-slate-100 bg-slate-50/80 hover:border-slate-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onPreview(rev)}
                        className="btn-press focus-ring w-full text-left"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[11px] font-medium text-slate-800">
                            seq {rev.seq}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {rev.actor === 'agent' ? 'Agent' : '用户'}
                          </span>
                        </div>
                        <div className="mt-0.5 flex flex-wrap gap-x-1.5 text-[10px] text-slate-500">
                          {rev.commandType ? (
                            <span className="font-mono">{rev.commandType}</span>
                          ) : (
                            <span>—</span>
                          )}
                          <span>·</span>
                          <time>
                            {new Date(rev.createdAt).toLocaleString('zh-CN', {
                              hour12: false,
                            })}
                          </time>
                        </div>
                        {rev.note ? (
                          <p className="mt-0.5 truncate text-[10px] text-slate-600" title={rev.note}>
                            {rev.note}
                          </p>
                        ) : null}
                      </button>
                      <button
                        type="button"
                        onClick={() => onRequestRestore(rev)}
                        className="btn-press focus-ring mt-1 inline-flex w-full items-center justify-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-1 text-[10px] font-medium text-slate-700 hover:bg-slate-50"
                        title="恢复此版写入新 revision（需确认）"
                      >
                        <RotateCcw className="h-3 w-3" aria-hidden />
                        恢复此版
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}
