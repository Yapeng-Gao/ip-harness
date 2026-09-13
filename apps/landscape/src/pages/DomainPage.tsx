import { Link } from 'react-router-dom'
import { ArrowRight, Car, Lock } from 'lucide-react'
import { Button, Card, Chip, PageHeader } from '../components/ui'
import { DOMAINS } from '../state/types'
import { useLandscapeStore } from '../state/store'

export function DomainPage() {
  const { nodes, orgs } = useLandscapeStore()
  const depthMax = Math.max(...nodes.map((n) => n.depth))

  return (
    <div>
      <PageHeader
        eyebrow="入口"
        title="选择产业域"
        desc="样机默认锁定「汽车」种子域。其他域灰显并标注「另立项」——本仓不做真全行业库。"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {DOMAINS.map((d) => {
          const enabled = d.enabled
          return (
            <Card
              key={d.id}
              className={`p-5 ${enabled ? '' : 'opacity-60'}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {d.id === 'automotive' ? (
                      <Car className="h-5 w-5 text-violet-600" aria-hidden />
                    ) : (
                      <Lock className="h-4 w-4 text-slate-400" aria-hidden />
                    )}
                    <h2 className="text-base font-semibold text-slate-900">{d.name}</h2>
                    {enabled ? (
                      <Chip tone="ok">可用</Chip>
                    ) : (
                      <Chip tone="warn">另立项</Chip>
                    )}
                  </div>
                  {enabled ? (
                    <p className="mt-2 text-xs text-slate-500">
                      节点 {nodes.length} · 深度 0–{depthMax} · 企业 {orgs.length} · 全内存
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">
                      非样机域 · 灰显 · 真全行业持续维护另立项
                    </p>
                  )}
                </div>
                {enabled ? (
                  <Link to="/tree">
                    <Button className="inline-flex items-center gap-1.5">
                      进入技术树
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="secondary" disabled>
                    不可用
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
