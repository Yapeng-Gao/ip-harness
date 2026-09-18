import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import { Button, Card, Chip, PageHeader } from '../components/ui'
import { getNode, useLandscapeStore } from '../state/store'
import { KIND_LABELS, type InsightKind } from '../state/types'

const KINDS: Array<InsightKind | 'all'> = ['all', 'chokepoint', 'surround', 'frontier']

export function InsightsPage() {
  const { insights, nodes } = useLandscapeStore()
  const [params, setParams] = useSearchParams()
  const kindParam = params.get('kind')
  const nodeParam = params.get('node')
  const kind: InsightKind | 'all' =
    kindParam === 'chokepoint' || kindParam === 'surround' || kindParam === 'frontier'
      ? kindParam
      : 'all'

  const filtered = useMemo(() => {
    let list = kind === 'all' ? insights : insights.filter((i) => i.kind === kind)
    if (nodeParam) list = list.filter((i) => i.nodeId === nodeParam)
    return list
  }, [insights, kind, nodeParam])

  const countsByNode = useMemo(() => {
    const m = new Map<string, number>()
    for (const i of insights) m.set(i.nodeId, (m.get(i.nodeId) ?? 0) + 1)
    return [...m.entries()]
      .map(([id, n]) => ({ id, n, name: getNode(id)?.name ?? id }))
      .sort((a, b) => b.n - a.n)
  }, [insights])

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '')
    if (!hash) return
    const el = document.getElementById(hash)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [filtered])

  function setFilters(next: { kind?: InsightKind | 'all'; node?: string | null }) {
    const p = new URLSearchParams(params)
    const k = next.kind === undefined ? kind : next.kind
    if (k === 'all') p.delete('kind')
    else p.set('kind', k)
    const node = next.node === undefined ? nodeParam : next.node
    if (!node) p.delete('node')
    else p.set('node', node)
    setParams(p)
  }

  return (
    <div>
      <PageHeader
        eyebrow="洞察"
        title="卡脖子 / 围剿 / 前沿"
        desc="种子文案可点；可按 kind / 节点过滤并看计数。规则增强 · 非实时舆情。"
      />
      <div className="mb-3 flex flex-wrap gap-2">
        {KINDS.map((k) => {
          const active = kind === k
          const label = k === 'all' ? '全部' : KIND_LABELS[k]
          const n =
            k === 'all' ? insights.length : insights.filter((i) => i.kind === k).length
          return (
            <Button
              key={k}
              variant={active ? 'primary' : 'secondary'}
              onClick={() => setFilters({ kind: k })}
            >
              {label} ({n})
            </Button>
          )
        })}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant={!nodeParam ? 'primary' : 'secondary'}
          onClick={() => setFilters({ node: null })}
        >
          全部节点 ({insights.length})
        </Button>
        {countsByNode.slice(0, 8).map((c) => (
          <Button
            key={c.id}
            variant={nodeParam === c.id ? 'primary' : 'secondary'}
            onClick={() => setFilters({ node: c.id })}
          >
            {c.name} ({c.n})
          </Button>
        ))}
      </div>
      <p className="mb-3 text-xs text-slate-500">
        当前 {filtered.length} 条 · Taxonomy 节点共 {nodes.length} · 非实时情报，刷新可失
      </p>
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
