import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import { Button, Card, Chip, HeatBar, PageHeader } from '../components/ui'
import {
  childrenOf,
  insightsForNode,
  orgsForNode,
  competitorsForNode,
  selectNode,
  toggleExpand,
  useLandscapeStore,
  getNode,
} from '../state/store'
import { KIND_LABELS, type InsightKind, type TaxonomyNode } from '../state/types'

function TreeNodeRow({ node, depth }: { node: TaxonomyNode; depth: number }) {
  const { expandedIds, selectedNodeId } = useLandscapeStore()
  const kids = childrenOf(node.id)
  const hasKids = kids.length > 0
  const open = expandedIds.has(node.id)
  const selected = selectedNodeId === node.id

  return (
    <li>
      <div
        className={`flex items-center gap-1 rounded-md px-1 py-0.5 ${
          selected ? 'bg-[var(--color-accent-soft)]' : 'hover:bg-slate-50'
        }`}
        style={{ paddingLeft: 4 + depth * 14 }}
      >
        {hasKids ? (
          <button
            type="button"
            className="focus-ring rounded p-0.5 text-slate-500"
            aria-expanded={open}
            aria-label={open ? '折叠' : '展开'}
            onClick={() => toggleExpand(node.id)}
          >
            {open ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="inline-block w-4" />
        )}
        <button
          type="button"
          className="focus-ring flex-1 truncate rounded px-1 py-1 text-left text-sm text-slate-800"
          onClick={() => selectNode(node.id)}
        >
          {node.name}
          <span className="ml-1 text-[10px] text-slate-400">L{node.depth}</span>
        </button>
      </div>
      {hasKids && open ? (
        <ul className="mt-0.5">
          {kids.map((c) => (
            <TreeNodeRow key={c.id} node={c} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function TreePage() {
  const { selectedNodeId, nodes, nodeExtras } = useLandscapeStore()
  const roots = childrenOf(null)
  const selected = selectedNodeId ? getNode(selectedNodeId) : undefined
  const orgs = selected ? orgsForNode(selected.id) : []
  const comps = selected ? competitorsForNode(selected.id) : []
  const insights = selected ? insightsForNode(selected.id) : []
  const extras = selected ? nodeExtras[selected.id] : undefined

  // ensure tree has ≥3 levels visible: roots expand auto/power/edrive already in seed

  return (
    <div>
      <PageHeader
        eyebrow="主画布"
        title="行业 / 技术分解树"
        desc="左侧展开 ≥3 层汽车种子树；中间看节点摘要；右侧进洞察。点节点标题进详情。"
      />
      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-4 p-3">
          <p className="mb-2 text-xs font-medium text-slate-500">
            Taxonomy · {nodes.length} 节点
          </p>
          <ul className="max-h-[28rem] overflow-auto">
            {roots.map((r) => (
              <TreeNodeRow key={r.id} node={r} depth={0} />
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-5 p-4">
          {selected ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">{selected.name}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    id <code>{selected.id}</code> · depth {selected.depth}
                  </p>
                </div>
                <Link to={`/nodes/${selected.id}`}>
                  <Button variant="secondary" className="inline-flex items-center gap-1">
                    节点详情
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </Button>
                </Link>
              </div>
              <HeatBar value={selected.patentDensity} label="专利密度（假热力）" />
              <div className="flex flex-wrap gap-3 text-sm text-slate-700">
                <span>
                  企业 <strong className="tabular-nums">{orgs.length}</strong>
                </span>
                <span>
                  竞品对照 <strong className="tabular-nums">{comps.length}</strong>
                </span>
                <span>
                  洞察 <strong className="tabular-nums">{insights.length}</strong>
                </span>
                <span>
                  文献 Hit{' '}
                  <strong className="tabular-nums">{extras?.hitIds.length ?? 0}</strong>
                </span>
              </div>
              {extras?.patentByYear.length ? (
                <div>
                  <p className="mb-1 text-xs text-slate-500">近年公开量（示意柱）</p>
                  <div className="flex gap-1">
                    {extras.patentByYear.map((b) => (
                      <div key={b.label} className="flex-1 text-center">
                        <div className="mx-auto h-16 w-full max-w-[2rem] rounded-t bg-slate-100 relative">
                          <div
                            className="absolute bottom-0 w-full rounded-t bg-violet-400/80"
                            style={{
                              height: `${Math.round((b.count / Math.max(...extras.patentByYear.map((x) => x.count))) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">{b.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">该节点无额外布局种子（可点深层零件节点）。</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">在左侧选择一个节点。</p>
          )}
        </Card>

        <Card className="lg:col-span-3 p-4">
          <p className="mb-2 text-xs font-medium text-slate-500">洞察入口</p>
          {selected && insights.length > 0 ? (
            <ul className="space-y-2">
              {insights.map((ins) => (
                <li key={ins.id}>
                  <Link
                    to={`/insights?kind=${ins.kind}#${ins.id}`}
                    className="focus-ring block rounded-lg border border-slate-100 px-2.5 py-2 hover:bg-slate-50"
                  >
                    <Chip
                      tone={
                        ins.kind === 'chokepoint'
                          ? 'danger'
                          : ins.kind === 'surround'
                            ? 'warn'
                            : 'accent'
                      }
                    >
                      {KIND_LABELS[ins.kind as InsightKind]}
                    </Chip>
                    <p className="mt-1 text-xs font-medium text-slate-800">{ins.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">
              {selected ? '本节点暂无洞察种子。' : '选中节点后显示。'}
            </p>
          )}
          <div className="mt-4">
            <Link to="/insights">
              <Button variant="secondary" className="w-full">
                全部洞察
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
