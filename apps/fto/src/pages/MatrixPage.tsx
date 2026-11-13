import { Link } from 'react-router-dom'
import { Sparkles, Trash2 } from 'lucide-react'
import { Button, Card, Chip, EmptyState, PageHeader } from '../components/ui'
import { ftoActions, useFtoStore } from '../state/store'
import type { CellVerdict } from '../state/types'

const VERDICTS: CellVerdict[] = ['可能覆盖', '需人工', '未涉及']

function verdictTone(v: CellVerdict): 'danger' | 'warn' | 'ok' {
  if (v === '可能覆盖') return 'danger'
  if (v === '需人工') return 'warn'
  return 'ok'
}

export function MatrixPage() {
  const { features, hits, matrix, matrixRunning, report } = useFtoStore()
  const locked = report.status === 'confirmed'
  const emptyHits = hits.length === 0
  const emptyFeatures = features.length === 0

  function cell(featureId: string, hitId: string) {
    return matrix.cells.find((c) => c.featureId === featureId && c.hitId === hitId)
  }

  return (
    <div>
      <PageHeader
        eyebrow="③ 权利要求对比矩阵"
        title="特征 × 文献矩阵"
        desc="单元格：可能覆盖 / 未涉及 / 需人工 + 可选假 claim。「自动填假比对」按关键词重叠生成（明示非真引擎）。"
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          disabled={locked || emptyHits || emptyFeatures || matrixRunning}
          onClick={() => ftoActions.runMockMatrix()}
          className="inline-flex items-center gap-1"
          title={
            emptyHits
              ? '命中为空，禁用自动比对'
              : emptyFeatures
                ? '特征为空'
                : '按关键词重叠生成假单元格'
          }
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          {matrixRunning ? '比对中…' : '自动填假比对'}
        </Button>
        <Button
          variant="secondary"
          disabled={locked || matrix.cells.length === 0}
          onClick={() => ftoActions.clearMatrix()}
          className="inline-flex items-center gap-1"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          清空矩阵
        </Button>
        <Chip tone="mock">非真 FTO 引擎</Chip>
        {emptyHits ? <Chip tone="danger">命中为空</Chip> : null}
        {matrix.cells.length === 0 ? <Chip tone="warn">矩阵空</Chip> : null}
        <div className="ml-auto flex flex-wrap gap-2">
          <Link to="/hits">
            <Button variant="secondary">← 命中</Button>
          </Link>
          <Link to="/risk">
            <Button variant="secondary">下一步：风险 →</Button>
          </Link>
        </div>
      </div>

      {emptyHits ? (
        <EmptyState
          title="无法比对"
          body="命中为空：请返回命中页恢复种子篮。自动比对已禁用。"
          action={
            <Link to="/hits">
              <Button>去命中页</Button>
            </Link>
          }
        />
      ) : emptyFeatures ? (
        <EmptyState
          title="特征为空"
          body="请先在特征表增行。"
          action={
            <Link to="/features">
              <Button>去特征表</Button>
            </Link>
          }
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] border-collapse text-left text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="sticky left-0 z-10 border-b border-slate-200 bg-slate-50 px-3 py-2 font-medium">
                  特征 \ 文献
                </th>
                {hits.map((h) => (
                  <th
                    key={h.id}
                    className="border-b border-l border-slate-200 px-3 py-2 font-medium"
                  >
                    <div className="font-mono text-[11px] text-slate-800">
                      {h.publicationNumber}
                    </div>
                    <div className="mt-0.5 line-clamp-2 font-normal text-slate-500">
                      {h.title}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((f) => (
                <tr key={f.id}>
                  <th className="sticky left-0 z-10 border-b border-slate-100 bg-white px-3 py-3 text-left font-medium text-slate-800">
                    {f.name}
                  </th>
                  {hits.map((h) => {
                    const c = cell(f.id, h.id)
                    return (
                      <td
                        key={h.id}
                        className="fto-matrix-cell border-b border-l border-slate-100"
                        data-filled={c ? 'true' : 'false'}
                        data-verdict={c?.verdict ?? ''}
                      >
                        <select
                          className="fto-matrix-select focus-ring"
                          disabled={locked}
                          aria-label={`${f.name} × ${h.publicationNumber}`}
                          value={c?.verdict ?? ''}
                          onChange={(e) => {
                            const v = e.target.value as CellVerdict
                            if (!v) return
                            ftoActions.setCell(
                              f.id,
                              h.id,
                              v,
                              c?.claimSnippet ?? h.mockClaims?.[0]?.text,
                            )
                          }}
                        >
                          <option value="">— 未填 —</option>
                          {VERDICTS.map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                        {c ? (
                          <div className="mt-1.5 space-y-1">
                            <Chip tone={verdictTone(c.verdict)}>{c.verdict}</Chip>
                            {c.claimSnippet ? (
                              <p className="line-clamp-3 text-[10px] leading-relaxed text-slate-500">
                                {c.claimSnippet}
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <p className="mt-1 text-[10px] text-slate-400">点击选择比对结论</p>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
