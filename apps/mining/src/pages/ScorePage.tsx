import { Link } from 'react-router-dom'
import { ArrowDownWideNarrow } from 'lucide-react'
import { Button, Card, Chip, EmptyState, PageHeader } from '../components/ui'
import { miningActions, useMiningStore } from '../state/store'

const DIMS = [
  { key: 'novelty' as const, label: '新颖性（示意）' },
  { key: 'value' as const, label: '价值（示意）' },
  { key: 'writability' as const, label: '可写性（示意）' },
]

export function ScorePage() {
  const { candidates, scores, scoreSortDesc } = useMiningStore()

  const ranked = [...candidates].sort((a, b) => {
    const sa = scores.find((s) => s.candidateId === a.id)?.total ?? 0
    const sb = scores.find((s) => s.candidateId === b.id)?.total ?? 0
    return scoreSortDesc ? sb - sa : sa - sb
  })

  return (
    <div>
      <PageHeader
        eyebrow="③ 评分"
        title="示意评分卡"
        desc="每条候选：新颖性 / 价值 / 可写性假分（0–5 滑条）+ 总分。维度名标「示意」。可按总分排序。"
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          className="inline-flex items-center gap-1.5"
          disabled={candidates.length === 0}
          onClick={() => miningActions.toggleScoreSort()}
        >
          <ArrowDownWideNarrow className="h-3.5 w-3.5" aria-hidden />
          按总分排序（{scoreSortDesc ? '高→低' : '低→高'}）
        </Button>
        {candidates.length === 0 ? <Chip tone="danger">无候选</Chip> : null}
        <div className="ml-auto flex flex-wrap gap-2">
          <Link to="/candidates">
            <Button variant="secondary">← 候选</Button>
          </Link>
          <Link to="/send">
            <Button variant="secondary">下一步：送出 →</Button>
          </Link>
        </div>
      </div>

      {ranked.length === 0 ? (
        <EmptyState
          title="暂无评分对象"
          body="请先在「候选发明点」拆解生成或手增。"
          action={
            <Link to="/candidates">
              <Button>去候选页</Button>
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {ranked.map((c, idx) => {
            const sc = scores.find((s) => s.candidateId === c.id)
            if (!sc) return null
            return (
              <li key={c.id}>
                <Card className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-slate-400">#{idx + 1}</p>
                      <h3 className="text-sm font-semibold text-slate-900">{c.title}</h3>
                    </div>
                    <Chip tone="accent">总分 {sc.total}</Chip>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {DIMS.map((d) => (
                      <label key={d.key} className="block text-xs text-slate-600">
                        <span className="flex items-center justify-between gap-2">
                          <span>{d.label}</span>
                          <span className="tabular-nums font-medium text-slate-800">
                            {sc[d.key]}
                          </span>
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={5}
                          step={1}
                          className="mt-1 w-full"
                          value={sc[d.key]}
                          onChange={(e) =>
                            miningActions.setScore(c.id, d.key, Number(e.target.value))
                          }
                        />
                      </label>
                    ))}
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
