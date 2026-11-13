import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { Button, Card, Chip, PageHeader } from '../components/ui'
import { ftoActions, useFtoStore } from '../state/store'

export function FeaturesPage() {
  const { features, report } = useFtoStore()
  const locked = report.status === 'confirmed'

  return (
    <div>
      <PageHeader
        eyebrow="① 产品特征拆解"
        title="产品特征表"
        desc="编辑特征 id / 名称 / 描述 / 可选技术关键词。空表禁止报告 Confirm。"
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          disabled={locked}
          onClick={() => ftoActions.addFeature()}
          className="inline-flex items-center gap-1"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          增行
        </Button>
        {features.length === 0 ? <Chip tone="danger">特征为空</Chip> : null}
        {locked ? <Chip tone="warn">只读（已 Confirm）</Chip> : null}
        <Link to="/hits" className="ml-auto">
          <Button variant="secondary">下一步：命中 →</Button>
        </Link>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">id</th>
              <th className="px-3 py-2 font-medium">名称</th>
              <th className="px-3 py-2 font-medium">描述</th>
              <th className="px-3 py-2 font-medium">关键词</th>
              <th className="px-3 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f, i) => (
              <tr key={f.id} className="border-b border-slate-100 align-top">
                <td className="px-3 py-2 font-mono text-xs text-slate-500">{f.id}</td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border border-slate-200 px-2 py-1 text-sm focus-ring"
                    value={f.name}
                    disabled={locked}
                    onChange={(e) => ftoActions.updateFeature(f.id, { name: e.target.value })}
                  />
                </td>
                <td className="px-3 py-2">
                  <textarea
                    className="w-full rounded border border-slate-200 px-2 py-1 text-sm focus-ring"
                    rows={2}
                    value={f.description}
                    disabled={locked}
                    onChange={(e) =>
                      ftoActions.updateFeature(f.id, { description: e.target.value })
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded border border-slate-200 px-2 py-1 text-sm focus-ring"
                    placeholder="逗号分隔"
                    value={(f.keywords ?? []).join(', ')}
                    disabled={locked}
                    onChange={(e) =>
                      ftoActions.updateFeature(f.id, {
                        keywords: e.target.value
                          .split(/[,，]/)
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    <Button
                      variant="secondary"
                      disabled={locked || i === 0}
                      aria-label="上移"
                      onClick={() => ftoActions.moveFeature(f.id, -1)}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={locked || i === features.length - 1}
                      aria-label="下移"
                      onClick={() => ftoActions.moveFeature(f.id, 1)}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="danger"
                      disabled={locked}
                      aria-label="删除"
                      onClick={() => ftoActions.removeFeature(f.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {features.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-500">暂无特征，请增行。</p>
        ) : null}
      </Card>
    </div>
  )
}
