import { Link } from 'react-router-dom'
import { Download, RotateCcw, Trash2 } from 'lucide-react'
import { Button, Card, Chip, EmptyState, PageHeader } from '../components/ui'
import { ftoActions, useFtoStore } from '../state/store'

export function HitsPage() {
  const { hits, report } = useFtoStore()
  const locked = report.status === 'confirmed'
  const canMatrix = hits.length >= 1

  return (
    <div>
      <PageHeader
        eyebrow="② 检索命中"
        title="检索命中 / 工作篮"
        desc="默认种子篮（与 search 公开号有交集）。「从 Search 工作篮导入」为示意：无跨口数据时 toast + 仍用/补种子。"
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          disabled={locked}
          onClick={() => ftoActions.importFromSearchBasket()}
          className="inline-flex items-center gap-1"
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          从 Search 工作篮导入
        </Button>
        <Button
          variant="secondary"
          disabled={locked}
          onClick={() => ftoActions.resetSeedHits()}
          className="inline-flex items-center gap-1"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          恢复种子篮
        </Button>
        {hits.length === 0 ? <Chip tone="danger">命中为空 · 无法进矩阵比对</Chip> : null}
        <div className="ml-auto flex flex-wrap gap-2">
          <Link to="/features">
            <Button variant="secondary">← 特征</Button>
          </Link>
          {canMatrix ? (
            <Link to="/matrix">
              <Button>下一步：矩阵 →</Button>
            </Link>
          ) : (
            <Button disabled title="至少 1 条命中">
              下一步：矩阵 →
            </Button>
          )}
        </div>
      </div>

      {hits.length === 0 ? (
        <EmptyState
          title="工作篮为空"
          body="请恢复种子篮，或示意导入（仍会补种子）。至少 1 条才能进入矩阵。"
          action={
            <Button onClick={() => ftoActions.resetSeedHits()}>恢复种子篮</Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {hits.map((h) => (
            <li key={h.id}>
              <Card className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="text-xs font-semibold text-slate-800">
                        {h.publicationNumber}
                      </code>
                      {h.familyId ? <Chip tone="neutral">{h.familyId}</Chip> : null}
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-900">{h.title}</p>
                    {h.applicant ? (
                      <p className="mt-0.5 text-xs text-slate-500">{h.applicant}</p>
                    ) : null}
                    {h.snippet ? (
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">{h.snippet}</p>
                    ) : null}
                    {h.mockClaims && h.mockClaims.length > 0 ? (
                      <p className="mt-2 text-[11px] text-amber-800">
                        假 claim ×{h.mockClaims.length}（样机）
                      </p>
                    ) : null}
                  </div>
                  <Button
                    variant="danger"
                    disabled={locked}
                    aria-label="移除"
                    onClick={() => ftoActions.removeHit(h.id)}
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
