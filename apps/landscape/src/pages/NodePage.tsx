import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ShoppingBasket } from 'lucide-react'
import {
  Button,
  Card,
  Chip,
  EmptyState,
  HeatBar,
  MiniBars,
  PageHeader,
} from '../components/ui'
import {
  addToBasketPlaceholder,
  competitorsForNode,
  getNode,
  hitsForNode,
  insightsForNode,
  orgsForNode,
  pathToRoot,
  useLandscapeStore,
} from '../state/store'
import {
  KIND_LABELS,
  STANCE_LABELS,
  type InsightKind,
  type OrgStance,
} from '../state/types'

function stanceTone(s: OrgStance): 'ok' | 'accent' | 'warn' | 'neutral' {
  if (s === 'leader') return 'ok'
  if (s === 'challenger') return 'accent'
  if (s === 'niche') return 'warn'
  return 'neutral'
}

export function NodePage() {
  const { nodeId = '' } = useParams()
  const { nodeExtras } = useLandscapeStore()
  const node = getNode(nodeId)

  if (!node) {
    return (
      <EmptyState
        title="节点不存在"
        body={`未找到 id=${nodeId} 的种子节点。`}
        action={
          <Link to="/tree">
            <Button variant="secondary">返回技术树</Button>
          </Link>
        }
      />
    )
  }

  const crumbs = pathToRoot(node.id)
  const orgs = orgsForNode(node.id)
  const comps = competitorsForNode(node.id).slice(0, 4)
  const insights = insightsForNode(node.id)
  const hits = hitsForNode(node.id)
  const extras = nodeExtras[node.id]
  const byKind = (k: InsightKind) => insights.filter((i) => i.kind === k)

  return (
    <div>
      <div className="mb-4">
        <Link
          to="/tree"
          className="focus-ring inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          返回技术树
        </Link>
      </div>
      <PageHeader
        eyebrow="节点详情"
        title={node.name}
        desc={`路径：${crumbs.map((c) => c.name).join(' → ')} · 专利密度示意 ${node.patentDensity}`}
      />

      <div className="mb-4">
        <HeatBar value={node.patentDensity} label="专利密度（假）" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-slate-900">企业列表</h2>
          <p className="mt-1 text-xs text-slate-500">地位标签：leader / challenger / niche / supplier</p>
          {orgs.length === 0 ? (
            <p className="mt-3 text-xs text-slate-400">无挂载企业种子。</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {orgs.map((o) => (
                <li key={o.id}>
                  <Link
                    to={`/orgs/${o.id}`}
                    className="focus-ring flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50"
                  >
                    <span className="text-sm font-medium text-slate-800">{o.name}</span>
                    <Chip tone={stanceTone(o.stance)}>{STANCE_LABELS[o.stance]}</Chip>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-slate-900">专利布局（示意）</h2>
          {extras ? (
            <div className="mt-3 space-y-4">
              <div>
                <p className="mb-2 text-xs text-slate-500">按年公开量</p>
                <MiniBars items={extras.patentByYear} />
              </div>
              <div>
                <p className="mb-2 text-xs text-slate-500">按 IPC 假热力</p>
                <div className="space-y-2">
                  {extras.patentByIpc.map((b) => (
                    <HeatBar key={b.label} value={b.count} max={60} label={b.label} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-400">本节点无布局柱条种子。</p>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-slate-900">竞品对照</h2>
          {comps.length < 2 ? (
            <p className="mt-3 text-xs text-slate-400">竞品不足 2 家（种子稀疏节点）。</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[20rem] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-1.5 pr-2 font-medium">企业</th>
                    <th className="py-1.5 pr-2 font-medium">地位</th>
                    <th className="py-1.5 font-medium">业务线</th>
                  </tr>
                </thead>
                <tbody>
                  {comps.map((o) => (
                    <tr key={o.id} className="border-b border-slate-100">
                      <td className="py-2 pr-2">
                        <Link to={`/orgs/${o.id}`} className="font-medium text-slate-800 underline-offset-2 hover:underline">
                          {o.name}
                        </Link>
                      </td>
                      <td className="py-2 pr-2">
                        <Chip tone={stanceTone(o.stance)}>{STANCE_LABELS[o.stance]}</Chip>
                      </td>
                      <td className="py-2 text-slate-600">{o.lines.join(' · ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-slate-900">三类洞察</h2>
          <div className="mt-3 space-y-3">
            {(['chokepoint', 'surround', 'frontier'] as InsightKind[]).map((k) => {
              const list = byKind(k)
              return (
                <div key={k}>
                  <Chip
                    tone={k === 'chokepoint' ? 'danger' : k === 'surround' ? 'warn' : 'accent'}
                  >
                    {KIND_LABELS[k]}
                  </Chip>
                  {list.length === 0 ? (
                    <p className="mt-1 text-[11px] text-slate-400">本节点无此类种子（见 /insights 全表）</p>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {list.map((ins) => (
                        <li key={ins.id}>
                          <Link
                            to={`/insights?kind=${k}#${ins.id}`}
                            className="focus-ring block rounded px-1 py-1 text-xs font-medium text-slate-800 hover:bg-slate-50"
                          >
                            {ins.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-slate-900">假 SearchHit 文献</h2>
        <p className="mt-1 text-xs text-slate-500">
          字段对齐 search · 「加入工作篮」仅 toast 占位，不跨口
        </p>
        {hits.length === 0 ? (
          <p className="mt-3 text-xs text-slate-400">本节点无挂载 Hit。</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {hits.map((h) => (
              <li
                key={h.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">{h.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    <code>{h.publicationNumber}</code>
                    {h.applicant ? ` · ${h.applicant}` : ''}
                    {h.date ? ` · ${h.date}` : ''}
                    {h.ipc?.length ? ` · ${h.ipc.join(', ')}` : ''}
                    {' · '}
                    score {h.score.toFixed(2)}
                  </p>
                  {h.snippet ? (
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{h.snippet}</p>
                  ) : null}
                </div>
                <Button
                  variant="secondary"
                  className="inline-flex shrink-0 items-center gap-1"
                  onClick={() => addToBasketPlaceholder(h)}
                >
                  <ShoppingBasket className="h-3.5 w-3.5" aria-hidden />
                  加入工作篮
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
