import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button, Card, Chip, EmptyState, PageHeader } from '../components/ui'
import { getNode, getOrg, neighborsForOrg, useLandscapeStore } from '../state/store'
import { EDGE_TYPE_LABELS, STANCE_LABELS, type OrgStance } from '../state/types'

function stanceTone(s: OrgStance): 'ok' | 'accent' | 'warn' | 'neutral' {
  if (s === 'leader') return 'ok'
  if (s === 'challenger') return 'accent'
  if (s === 'niche') return 'warn'
  return 'neutral'
}

export function OrgPage() {
  const { orgId = '' } = useParams()
  useLandscapeStore()
  const org = getOrg(orgId)

  if (!org) {
    return (
      <EmptyState
        title="企业不存在"
        body={`未找到 id=${orgId} 的种子企业。`}
        action={
          <Link to="/tree">
            <Button variant="secondary">返回技术树</Button>
          </Link>
        }
      />
    )
  }

  const nodes = org.nodeIds.map((id) => getNode(id)).filter(Boolean)
  const neighbors = neighborsForOrg(org.id)

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
        eyebrow="企业档案"
        title={org.name}
        desc="业务线 / 地位 / 关联节点 / 一度邻居（含竞品与标准边）· 全内存种子"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone={stanceTone(org.stance)}>{STANCE_LABELS[org.stance]}</Chip>
            <Chip tone="mock">{org.stance}</Chip>
            {org.groupId ? <Chip tone="accent">集团 {org.groupId}</Chip> : null}
            {org.holdingOf ? <Chip tone="warn">持股示意</Chip> : null}
          </div>
          <h2 className="mt-4 text-sm font-semibold text-slate-900">业务线</h2>
          <ul className="mt-2 list-inside list-disc text-sm text-slate-700">
            {org.lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-slate-900">关联节点</h2>
          <ul className="mt-2 space-y-1">
            {nodes.map((n) =>
              n ? (
                <li key={n.id}>
                  <Link
                    to={`/nodes/${n.id}`}
                    className="focus-ring text-sm text-slate-800 underline-offset-2 hover:underline"
                  >
                    {n.name}
                    <span className="ml-1 text-xs text-slate-400">L{n.depth}</span>
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-slate-900">一度邻居表</h2>
        <p className="mt-1 text-xs text-slate-500">
          part-org / org-competitor / org-standard（及集团·持股示意）
        </p>
        {neighbors.length === 0 ? (
          <p className="mt-3 text-xs text-slate-400">无邻居。</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[22rem] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-1.5 pr-2 font-medium">边</th>
                  <th className="py-1.5 pr-2 font-medium">邻居</th>
                  <th className="py-1.5 font-medium">备注</th>
                </tr>
              </thead>
              <tbody>
                {neighbors.map((row, i) => (
                  <tr key={`${row.edgeType}-${row.label}-${i}`} className="border-b border-slate-100">
                    <td className="py-2 pr-2">
                      <Chip tone="mock">{EDGE_TYPE_LABELS[row.edgeType]}</Chip>
                    </td>
                    <td className="py-2 pr-2">
                      {row.href ? (
                        <Link
                          to={row.href}
                          className="font-medium text-slate-800 underline-offset-2 hover:underline"
                        >
                          {row.label}
                        </Link>
                      ) : (
                        <span className="font-medium text-slate-800">{row.label}</span>
                      )}
                    </td>
                    <td className="py-2 text-slate-600">{row.meta ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
