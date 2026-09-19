import { useState } from 'react'
import { Link2, Plus } from 'lucide-react'
import { useApp } from '@shared/context/AppContext'
import {
  caseBindStateFromId,
  isMockCaseId,
  mockCaseLabel,
  newMockCaseId,
  type CaseBindState,
} from '../../lib/mockCase'

type Props = {
  /** Current bound case id (project or session) */
  caseId?: string
  /** Visual weight: domain/patent prominent; general softer */
  prominence?: 'strong' | 'soft'
  /**
   * When unbound + true (default for prominence=strong / patent·domain):
   * label warns writeback requires bind. General keeps soft copy.
   */
  writebackRequiresBind?: boolean
  onBind: (caseId: string, meta?: { title: string; created: boolean }) => void
  onUnbind?: () => void
  /** Fires when create-and-bind enters pending_create (project can mirror state) */
  onCreateStart?: () => void
}

/**
 * Workspace toolbar: 「创建并绑定新案」 / 「绑定已有案」
 * Spec: docs/architecture/product-apps/agent-case-binding.md
 */
export function CaseBindControls({
  caseId,
  prominence = 'strong',
  writebackRequiresBind,
  onBind,
  onUnbind,
  onCreateStart,
}: Props) {
  const { visibleCases, getCase, addCase } = useApp()
  const [mode, setMode] = useState<'idle' | 'create' | 'bind'>('idle')
  const [title, setTitle] = useState('')
  const [pick, setPick] = useState('')
  /** Short-lived UI state while mock create runs — keeps CaseBindState honest */
  const [pendingCreate, setPendingCreate] = useState(false)
  const bindState: CaseBindState = pendingCreate
    ? 'pending_create'
    : caseBindStateFromId(caseId)

  const boundTitle = (() => {
    if (!caseId) return null
    const c = getCase(caseId)
    if (c) return c.title
    if (isMockCaseId(caseId)) return mockCaseLabel('样机案', caseId)
    return caseId
  })()

  const soft = prominence === 'soft'
  const mustBind =
    writebackRequiresBind ?? prominence === 'strong'
  const boxCls = soft
    ? 'rounded-md border border-dashed border-slate-200 bg-slate-50/60 px-2.5 py-2'
    : mustBind && bindState !== 'bound'
      ? 'rounded-md border border-dashed border-slate-200 bg-transparent px-2 py-1.5'
      : 'rounded-md border border-sky-200 bg-sky-50/70 px-3 py-2.5'

  const createAndBind = () => {
    if (pendingCreate) return
    const t = title.trim() || '样机新案'
    // Spec: pending_create briefly (button loading) → then bound
    setPendingCreate(true)
    onCreateStart?.()
    window.setTimeout(() => {
      const id = newMockCaseId()
      // Seed into local AppContext cases (not case-core); keep mock-case-* id
      try {
        addCase({
          id,
          title: t,
          stage: 'pre_research',
          summary: 'Agent 样机·创建并绑定（未进中台库 / 非真 case-core）',
          fromInsight: true,
        })
      } catch {
        // hang id only if seed fails
      }
      onBind(id, { title: t, created: true })
      setTitle('')
      setMode('idle')
      setPendingCreate(false)
    }, 280)
  }

  const bindExisting = () => {
    if (!pick) return
    onBind(pick, {
      title: getCase(pick)?.title ?? pick,
      created: false,
    })
    setPick('')
    setMode('idle')
  }

  return (
    <div className={`case-bind-controls ${boxCls}`} data-testid="case-bind-controls">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-slate-700">
          {bindState === 'bound'
            ? '已绑案件'
            : bindState === 'pending_create'
              ? '正在创建案件…'
              : mustBind
                ? '请先绑定案件'
                : '案件（可选）'}
        </span>
        {boundTitle ? (
          <span
            className="max-w-[220px] truncate text-[11px] text-slate-600"
            title={boundTitle}
            data-testid="case-bind-current"
          >
            {boundTitle}
            {isMockCaseId(caseId) ? (
              <span className="ml-1 text-amber-700">· 样机</span>
            ) : null}
          </span>
        ) : (
          <span
            className={`text-[11px] ${mustBind ? 'font-medium text-slate-600' : 'text-slate-400'}`}
            data-testid="case-bind-hint"
          >
            {mustBind
              ? '写入前请先绑定案件'
              : '可稍后创建或绑定案件'}
          </span>
        )}
        <div className="ml-auto flex flex-wrap gap-1.5">
          {bindState === 'bound' && onUnbind ? (
            <button
              type="button"
              onClick={onUnbind}
              disabled={pendingCreate}
              className="btn-press focus-ring case-bind-btn hit-40 rounded border border-slate-200 bg-white px-2.5 text-xs text-slate-600 disabled:opacity-40"
              data-testid="case-unbind"
            >
              解除绑定
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setMode(mode === 'create' ? 'idle' : 'create')}
            disabled={pendingCreate}
            className={`btn-press focus-ring case-bind-btn hit-40 inline-flex items-center gap-1 rounded px-2.5 text-xs font-medium disabled:opacity-40 ${
              soft
                ? 'border border-slate-200 bg-white text-slate-700'
                : 'border border-sky-300 bg-white text-sky-900'
            }`}
            data-testid="case-create-bind"
            aria-expanded={mode === 'create'}
            aria-busy={pendingCreate || undefined}
          >
            <Plus className="h-3 w-3" aria-hidden />
            {pendingCreate ? '创建中…' : '创建并绑定新案'}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === 'bind' ? 'idle' : 'bind')}
            disabled={pendingCreate}
            className={`btn-press focus-ring case-bind-btn hit-40 inline-flex items-center gap-1 rounded px-2.5 text-xs font-medium disabled:opacity-40 ${
              soft
                ? 'border border-slate-200 bg-white text-slate-700'
                : 'border border-sky-300 bg-white text-sky-900'
            }`}
            data-testid="case-bind-existing"
            aria-expanded={mode === 'bind'}
          >
            <Link2 className="h-3 w-3" aria-hidden />
            绑定已有案
          </button>
        </div>
      </div>

      {mode === 'create' && (
        <div className="mt-2 flex flex-wrap items-end gap-2 border-t border-sky-100/80 pt-2">
          <label className="flex min-w-[12rem] flex-1 flex-col gap-0.5 text-[10px] text-slate-500">
            案标题
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：边缘调度模组"
              disabled={pendingCreate}
              className="focus-ring rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 disabled:opacity-40"
              aria-label="新案标题"
              data-testid="case-create-title"
            />
          </label>
          <button
            type="button"
            onClick={createAndBind}
            disabled={pendingCreate}
            className="btn-press focus-ring case-bind-btn hit-40 rounded bg-slate-900 px-3 text-xs font-medium text-white disabled:opacity-40"
            data-testid="case-create-confirm"
            aria-busy={pendingCreate || undefined}
          >
            {pendingCreate ? '创建中…' : '生成 mock 案并绑定'}
          </button>
          <p className="w-full text-[10px] text-amber-800">
            样机：写入本地种子（mock-case-*），不进真 case-core / 中台库
          </p>
        </div>
      )}

      {mode === 'bind' && (
        <div className="mt-2 flex flex-wrap items-end gap-2 border-t border-sky-100/80 pt-2">
          <label className="flex min-w-[12rem] flex-1 flex-col gap-0.5 text-[10px] text-slate-500">
            已有案
            <select
              value={pick}
              onChange={(e) => setPick(e.target.value)}
              className="focus-ring max-w-full truncate rounded border border-slate-200 bg-white px-2 py-1 text-xs"
              aria-label="绑定已有案"
              data-testid="case-bind-select"
            >
              <option value="">选择案件…</option>
              {visibleCases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={!pick}
            onClick={bindExisting}
            className="btn-press focus-ring case-bind-btn hit-40 rounded bg-slate-900 px-3 text-xs font-medium text-white disabled:opacity-40"
            data-testid="case-bind-confirm"
          >
            绑定
          </button>
        </div>
      )}
    </div>
  )
}
