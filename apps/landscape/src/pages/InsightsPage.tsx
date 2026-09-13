import { Link, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { Button, Card, Chip, PageHeader } from '../components/ui'
import { getNode, useLandscapeStore } from '../state/store'
import { KIND_LABELS, type InsightKind } from '../state/types'

const KINDS: Array<InsightKind | 'all'> = ['all', 'chokepoint', 'surround', 'frontier']

export function InsightsPage() {
  const { insights } = useLandscapeStore()
  const [params, setParams] = useSearchParams()
  const kindParam = params.get('kind')
  const kind: InsightKind | 'all' =
    kindParam === 'chokepoint' || kindParam === 'surround' || kindParam === 'frontier'
      ? kindParam
      : 'all'

  const filtered =
    kind === 'all' ? insights : insights.filter((i) => i.kind === kind)

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '')
    if (!hash) return
    const el = document.getElementById(hash)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [filtered])

  return (
    <div>
      <PageHeader
        eyebrow="洞察"
        title="卡脖子 / 围剿 / 前沿"
        desc="种子文案可点；可按 kind 筛选。非实时情报，刷新可失。"
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {KINDS.map((k) => {
          const active = kind === k
          const label = k === 'all' ? '全部' : KIND_LABELS[k]
          return (
            <Button
              key={k}
              variant={active ? 'primary' : 'secondary'}
              onClick={() => {
                if (k === 'all') setParams({})
                else setParams({ kind: k })
              }}
            >
              {label}
            </Button>
          )
        })}
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {filtered.map((ins) => {
          const node = getNode(ins.nodeId)
          return (
            <li key={ins.id} id={ins.id}>
              <Card className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip
                    tone={
                      ins.kind === 'chokepoint'
                        ? 'danger'
                        : ins.kind === 'surround'
                          ? 'warn'
                          : 'accent'
                    }
                  >
                    {KIND_LABELS[ins.kind]}
                  </Chip>
                  {node ? (
                    <Link
                      to={`/nodes/${node.id}`}
                      className="text-xs text-slate-500 underline-offset-2 hover:underline"
                    >
                      @{node.name}
                    </Link>
                  ) : null}
                </div>
                <h2 className="mt-2 text-sm font-semibold text-slate-900">{ins.title}</h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{ins.body}</p>
              </Card>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
