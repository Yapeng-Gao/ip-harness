import { useEffect } from 'react'
import { Briefcase } from 'lucide-react'
import { AppLink } from '../../AppLink'
import type { HandoffArtifactKey, StageId } from '../../../types'
import { useApp } from '../../../context/AppContext'
import { HANDOFF_ARTIFACT_LABELS } from '../../../data/handoff'

export function CasePicker({
  stage,
  selectedId,
  onChange,
  /** Only list cases that already carry this handoff key (e.g. layout_insight). */
  artifactFilter,
  /** Optional override for empty-state copy */
  emptyHint,
}: {
  stage: StageId
  selectedId?: string
  onChange: (id: string) => void
  artifactFilter?: HandoffArtifactKey
  emptyHint?: string
}) {
  const { visibleCases } = useApp()
  const stagePool = visibleCases.filter((c) => c.stage === stage)
  const options = artifactFilter
    ? stagePool.filter((c) => !!c.handoffs[artifactFilter])
    : stagePool
  const selectedInStage = !!selectedId && options.some((c) => c.id === selectedId)
  const filterLabel = artifactFilter
    ? HANDOFF_ARTIFACT_LABELS[artifactFilter] ?? artifactFilter
    : null

  // URL / 默认 caseId 跨阶段或未带目标交接键：自动清空，避免空列表仍绑错案
  useEffect(() => {
    if (selectedId && !selectedInStage) {
      onChange('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to id/filter mismatch
  }, [selectedId, stage, selectedInStage, artifactFilter])

  if (options.length === 0) {
    const stageHadCases = stagePool.length > 0
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2">
        <Briefcase className="h-4 w-4 text-slate-400" aria-hidden />
        <span className="text-sm text-slate-600">
          {emptyHint
            ? emptyHint
            : artifactFilter
              ? stageHadCases
                ? `暂无带「${filterLabel}」交接的案件`
                : '本阶段暂无案件'
              : '本阶段暂无案件'}
        </span>
        {artifactFilter ? (
          <span className="text-xs text-slate-400">
            {stageHadCases
              ? `（仅列带 ${artifactFilter} 的案 · 不降级展示本阶段全池 ${stagePool.length} 件）`
              : '（不降级列出其他阶段案件）'}
          </span>
        ) : (
          <span className="text-xs text-slate-400">（不降级列出其他阶段案件）</span>
        )}
        {selectedId && !selectedInStage && (
          <span className="text-xs text-amber-800">已清除不匹配案号</span>
        )}
        <AppLink
          to="/workbench"
          className="rounded-md text-xs font-medium text-slate-800 underline decoration-slate-300 hover:decoration-slate-600"
        >
          回工作台
        </AppLink>
        <AppLink
          to="/cases"
          className="rounded-md text-xs font-medium text-slate-800 underline decoration-slate-300 hover:decoration-slate-600"
        >
          案件列表
        </AppLink>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Briefcase className="h-4 w-4 text-slate-400" aria-hidden />
      <label className="sr-only" htmlFor="case-picker-select">选择案件</label>
      <select
        id="case-picker-select"
        name="caseId"
        autoComplete="off"
        className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-slate-400"
        value={selectedInStage ? selectedId : ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">选择案件…</option>
        {options.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}（{c.caseNo}）
          </option>
        ))}
      </select>
      {artifactFilter && (
        <span className="text-[11px] text-slate-400">
          子集 · {filterLabel}（{options.length}/{stagePool.length}）
        </span>
      )}
    </div>
  )
}
