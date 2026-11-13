import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { FigureThumb } from '../components/Canvas'
import { Button, Card, Chip, ConfirmDialog, EmptyState, PageHeader, formatShanghai } from '../components/ui'
import { figureActions, useFigureStore } from '../state/store'

export function VersionsPage() {
  const { assetId } = useParams()
  const { assets, versions } = useFigureStore()
  const asset = assetId ? assets[assetId] : undefined
  const list = versions
    .filter((v) => v.assetId === assetId)
    .slice()
    .sort((a, b) => b.rev - a.rev)
  const [pending, setPending] = useState<number | null>(null)

  useEffect(() => {
    if (assetId) figureActions.setActiveAsset(assetId)
  }, [assetId])

  if (!assetId || !asset) {
    return (
      <EmptyState
        title="资产不存在"
        body="请从资产列表进入。"
        action={
          <Link to="/">
            <Button>回列表</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="④ 版本时间线"
        title={asset.title}
        desc="每次「保存版本」生成新 rev。恢复旧版需 Confirm，不调用 DomainCommand。"
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link to={`/edit/${asset.id}`}>
          <Button>回画布继续编辑</Button>
        </Link>
        <Button variant="success" onClick={() => figureActions.saveVersion(asset.id)}>
          再存一版
        </Button>
        <Chip tone="neutral">当前工作副本 rev {asset.rev}</Chip>
        <Chip tone="accent">{list.length} 个已存版本</Chip>
      </div>
      <div className="space-y-3">
        {list.map((ver) => (
          <Card key={`${ver.assetId}-${ver.rev}`} className="p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">rev {ver.rev}</h2>
              {ver.rev === asset.rev ? <Chip tone="ok">当前</Chip> : <Chip tone="neutral">历史</Chip>}
              <span className="text-[11px] text-slate-400">
                {formatShanghai(ver.savedAt)}（上海）
              </span>
              <div className="ml-auto">
                <Button
                  variant="secondary"
                  className="inline-flex items-center gap-1"
                  onClick={() => setPending(ver.rev)}
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                  恢复此版
                </Button>
              </div>
            </div>
            <FigureThumb asset={ver.snapshot} />
            <p className="mt-2 text-xs text-slate-500">
              标注 {ver.snapshot.annotations.length} · 图层 {ver.snapshot.layers.length}
            </p>
          </Card>
        ))}
      </div>
      {pending !== null ? (
        <ConfirmDialog
          title={`恢复 rev ${pending}？`}
          body="将用该版本内容覆盖当前画布（样机内存）。需 Confirm；不会写入 case-core / 文档库。"
          confirmLabel="Confirm 恢复"
          onCancel={() => setPending(null)}
          onConfirm={() => {
            figureActions.restoreVersion(asset.id, pending)
            setPending(null)
          }}
        />
      ) : null}
    </div>
  )
}
