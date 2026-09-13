import { Link } from 'react-router-dom'
import { Loader2, Plus, Trash2, Wand2 } from 'lucide-react'
import { Button, Card, Chip, EmptyState, PageHeader } from '../components/ui'
import { miningActions, useMiningStore } from '../state/store'

export function CandidatesPage() {
  const { candidates, generating, hits, disclosure } = useMiningStore()

  return (
    <div>
      <PageHeader
        eyebrow="② 候选发明点"
        title="发明点列表"
        desc="「拆解生成」短延迟后产出 ≥3 条示意候选（关键词/段落切分，非真引擎）。可手增删改；空列表不能送出。"
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          className="inline-flex items-center gap-1.5"
          disabled={generating}
          onClick={() => miningActions.generateCandidates()}
        >
          {generating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <Wand2 className="h-3.5 w-3.5" aria-hidden />
          )}
          {generating ? '拆解中…' : '拆解生成'}
        </Button>
        <Button
          variant="secondary"
          className="inline-flex items-center gap-1"
          onClick={() => miningActions.addCandidate()}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          手增
        </Button>
        {candidates.length === 0 ? (
          <Chip tone="danger">空列表 · 不能送出</Chip>
        ) : (
          <Chip tone="ok">{candidates.length} 条</Chip>
        )}
        {disclosure.relatedHitIds.length > 0 ? (
          <Chip tone="accent">交底已关联 Hit</Chip>
        ) : null}
        <div className="ml-auto flex flex-wrap gap-2">
          <Link to="/disclosure">
            <Button variant="secondary">← 交底</Button>
          </Link>
          <Link to="/score">
            <Button variant="secondary">下一步：评分 →</Button>
          </Link>
        </div>
      </div>

      {candidates.length === 0 ? (
        <EmptyState
          title="尚无候选发明点"
          body="点击「拆解生成」从交底示意拆解，或手增一条。空列表禁止进入送出。"
          action={
            <Button disabled={generating} onClick={() => miningActions.generateCandidates()}>
              拆解生成
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {candidates.map((c) => (
            <li key={c.id}>
              <Card className="p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-400">{c.id}</span>
                      <Chip tone="mock">示意</Chip>
                    </div>
                    <input
                      className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm font-medium focus-ring"
                      value={c.title}
                      onChange={(e) =>
                        miningActions.updateCandidate(c.id, { title: e.target.value })
                      }
                    />
                    <textarea
                      className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm focus-ring"
                      rows={3}
                      value={c.points}
                      onChange={(e) =>
                        miningActions.updateCandidate(c.id, { points: e.target.value })
                      }
                    />
                    {(c.relatedHitIds?.length ?? 0) > 0 ? (
                      <p className="text-xs text-slate-500">
                        相关公开：{' '}
                        {(c.relatedHitIds ?? [])
                          .map((id) => hits.find((h) => h.id === id)?.publicationNumber ?? id)
                          .join('、')}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    variant="danger"
                    aria-label="删除"
                    onClick={() => miningActions.removeCandidate(c.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
