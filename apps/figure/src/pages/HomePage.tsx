import { Link } from 'react-router-dom'
import { ArrowRight, PenTool, Plus } from 'lucide-react'
import { FigureThumb } from '../components/Canvas'
import { Button, Card, Chip, PageHeader, formatShanghai } from '../components/ui'
import { figureActions, useFigureStore } from '../state/store'
import { TEMPLATE_LABELS } from '../state/types'

export function HomePage() {
  const { assets, versions } = useFigureStore()
  const list = Object.values(assets).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  return (
    <div>
      <PageHeader
        eyebrow="入口"
        title="附图资产"
        desc="种子 1～2 个资产可直接进画布。新附图走上下文 → mock 生成 → 画布编辑。无真文生图，草图为 SVG 模板占位。"
      />
      <div className="mb-4">
        <Link to="/new">
          <Button className="inline-flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" aria-hidden />
            新建附图
          </Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((asset) => {
          const revs = versions.filter((v) => v.assetId === asset.id).length
          return (
            <Card key={asset.id} className="p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900">{asset.title}</h2>
                <Chip tone="mock">{TEMPLATE_LABELS[asset.templateId]}</Chip>
                <Chip tone="neutral">rev {asset.rev}</Chip>
                <Chip tone="accent">{revs} 个版本</Chip>
              </div>
              <Link
                to={`/edit/${asset.id}`}
                className="block"
                onClick={() => figureActions.setActiveAsset(asset.id)}
              >
                <FigureThumb asset={asset} />
              </Link>
              <p className="mt-2 text-[11px] text-slate-400">
                更新 {formatShanghai(asset.updatedAt)}（上海）
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to={`/edit/${asset.id}`} onClick={() => figureActions.setActiveAsset(asset.id)}>
                  <Button className="inline-flex items-center gap-1.5">
                    <PenTool className="h-3.5 w-3.5" aria-hidden />
                    打开画布编辑
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Button>
                </Link>
                <Link to={`/versions/${asset.id}`}>
                  <Button variant="secondary">版本</Button>
                </Link>
                <Link to={`/attach/${asset.id}`}>
                  <Button variant="secondary">挂章</Button>
                </Link>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
