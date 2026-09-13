import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, FilePen, FolderPlus } from 'lucide-react'
import { Button, Card, Chip, EmptyState, PageHeader } from '../components/ui'
import { miningActions, useMiningStore } from '../state/store'
import { DOC_HARNESS_DEEPLINK, WORKBENCH_DEEPLINK } from '../state/types'

export function SendPage() {
  const { candidates, intents, scores } = useMiningStore()
  const [selected, setSelected] = useState<string[]>([])
  const [note, setNote] = useState('')

  const canSend = candidates.length > 0 && selected.length > 0

  const sorted = useMemo(() => {
    return [...candidates].sort((a, b) => {
      const sa = scores.find((s) => s.candidateId === a.id)?.total ?? 0
      const sb = scores.find((s) => s.candidateId === b.id)?.total ?? 0
      return sb - sa
    })
  }, [candidates, scores])

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function selectAll() {
    setSelected(candidates.map((c) => c.id))
  }

  function clearSel() {
    setSelected([])
  }

  return (
    <div>
      <PageHeader
        eyebrow="④ 送立项 / 送撰写"
        title="送出占位"
        desc="多选候选后记录 HandoffIntent 事件（内存）。深链仅只读打开 workbench / doc-harness。禁用「已创建案件」文案；无 DomainCommand / 不写立案库。"
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="secondary" disabled={candidates.length === 0} onClick={selectAll}>
          全选
        </Button>
        <Button variant="secondary" disabled={selected.length === 0} onClick={clearSel}>
          清空勾选
        </Button>
        {candidates.length === 0 ? (
          <Chip tone="danger">无候选 · 送出已禁用</Chip>
        ) : selected.length === 0 ? (
          <Chip tone="warn">请勾选候选</Chip>
        ) : (
          <Chip tone="ok">已选 {selected.length}</Chip>
        )}
        <Link to="/score" className="ml-auto">
          <Button variant="secondary">← 评分</Button>
        </Link>
      </div>

      {candidates.length === 0 ? (
        <EmptyState
          title="不能送出"
          body="候选列表为空。请先拆解生成或手增发明点。"
          action={
            <Link to="/candidates">
              <Button>去候选页</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-slate-900">选择候选</h2>
            <ul className="mt-3 space-y-2">
              {sorted.map((c) => {
                const sc = scores.find((s) => s.candidateId === c.id)
                const checked = selected.includes(c.id)
                return (
                  <li key={c.id}>
                    <label
                      className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-2 text-sm ${
                        checked
                          ? 'border-violet-200 bg-violet-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={checked}
                        onChange={() => toggle(c.id)}
                      />
                      <span className="min-w-0">
                        <span className="font-medium text-slate-800">{c.title}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          总分 {sc?.total ?? '—'} · {c.id}
                        </span>
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
            <label className="mt-4 block">
              <span className="text-xs font-medium text-slate-500">备注（可选）</span>
              <textarea
                className="mt-1 w-full rounded border border-slate-200 px-2 py-1.5 text-sm focus-ring"
                rows={2}
                value={note}
                placeholder="占位说明，不写立案库"
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                className="inline-flex items-center gap-1.5"
                disabled={!canSend}
                onClick={() => {
                  if (miningActions.sendHandoff('立项', selected, note)) {
                    setSelected([])
                    setNote('')
                  }
                }}
              >
                <FolderPlus className="h-3.5 w-3.5" aria-hidden />
                送立项
              </Button>
              <Button
                variant="secondary"
                className="inline-flex items-center gap-1.5"
                disabled={!canSend}
                onClick={() => {
                  if (miningActions.sendHandoff('撰写', selected, note)) {
                    setSelected([])
                    setNote('')
                  }
                }}
              >
                <FilePen className="h-3.5 w-3.5" aria-hidden />
                送撰写
              </Button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              送出 = toast + intents[] 事件日志。
              <strong className="font-medium text-slate-700">不会创建案件</strong>
              ，无 DomainCommand。
            </p>
          </Card>

          <div className="space-y-4">
            <Card className="p-4">
              <h2 className="text-sm font-semibold text-slate-900">深链占位（只读打开）</h2>
              <p className="mt-1 text-xs text-slate-500">不改邻居代码；仅打开 URL。</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={WORKBENCH_DEEPLINK} target="_blank" rel="noreferrer">
                  <Button variant="secondary" className="inline-flex items-center gap-1.5">
                    workbench:5174
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </Button>
                </a>
                <a href={DOC_HARNESS_DEEPLINK} target="_blank" rel="noreferrer">
                  <Button variant="secondary" className="inline-flex items-center gap-1.5">
                    doc-harness:5178
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </Button>
                </a>
              </div>
            </Card>

            <Card className="p-4">
              <h2 className="text-sm font-semibold text-slate-900">
                事件日志 intents[]
                <Chip tone="mock">内存</Chip>
              </h2>
              {intents.length === 0 ? (
                <p className="mt-2 text-xs text-slate-500">尚无送出事件。</p>
              ) : (
                <ul className="mt-3 max-h-72 space-y-2 overflow-auto">
                  {intents.map((it) => (
                    <li
                      key={it.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Chip tone={it.kind === '立项' ? 'accent' : 'ok'}>送{it.kind}</Chip>
                        <span className="font-mono text-slate-400">{it.id}</span>
                      </div>
                      <p className="mt-1 text-slate-600">
                        候选 {it.candidateIds.length} 条 · {new Date(it.at).toLocaleString('zh-CN')}
                      </p>
                      <p className="mt-0.5 text-slate-500">{it.note}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
