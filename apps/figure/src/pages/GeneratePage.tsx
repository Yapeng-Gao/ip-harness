import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoaderCircle, PenTool, RotateCcw, TriangleAlert } from 'lucide-react'
import { FigureThumb } from '../components/Canvas'
import { Button, Card, Chip, EmptyState, PageHeader } from '../components/ui'
import { figureActions, useFigureStore } from '../state/store'
import { TEMPLATE_LABELS } from '../state/types'

export function GeneratePage() {
  const { draftId } = useParams()
  const { drafts, assets } = useFigureStore()
  const draft = draftId ? drafts[draftId] : undefined

  useEffect(() => {
    if (draftId && draft?.status === 'idle') {
      figureActions.startGenerate(draftId)
    }
  }, [draftId, draft?.status])

  if (!draftId || !draft) {
    return (
      <EmptyState
        title="草稿不存在"
        body="请从上下文页重新生成。"
        action={
          <Link to="/new">
            <Button>回上下文</Button>
          </Link>
        }
      />
    )
  }

  const asset = draft.assetId ? assets[draft.assetId] : undefined

  return (
    <div>
      <PageHeader
        eyebrow="② mock 生成"
        title="套用模板草图"
        desc="状态 idle → generating → ready | failed。成功后主按钮必须进入画布，禁止只停在「已生成」。"
      />
      <Card className="p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Chip tone="mock">{TEMPLATE_LABELS[draft.templateId]}</Chip>
          <Chip
            tone={
              draft.status === 'ready'
                ? 'ok'
                : draft.status === 'failed'
                  ? 'danger'
                  : draft.status === 'generating'
                    ? 'warn'
                    : 'neutral'
            }
          >
            {draft.status}
          </Chip>
          <span className="text-sm text-slate-600">{draft.context.title}</span>
        </div>
        {draft.context.parts.length > 0 ? (
          <p className="mb-3 text-xs text-slate-500">部件：{draft.context.parts.join('、')}</p>
        ) : null}

        {draft.status === 'generating' || draft.status === 'idle' ? (
          <div className="flex flex-col items-center gap-3 py-10 text-slate-600">
            <LoaderCircle className="h-8 w-8 animate-spin text-[var(--color-accent)]" aria-hidden />
            <p className="text-sm">正在套用模板草图…（无真文生图 · 1～2s）</p>
          </div>
        ) : null}

        {draft.status === 'failed' ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-6 text-center">
            <TriangleAlert className="mx-auto h-6 w-6 text-rose-600" aria-hidden />
            <p className="mt-2 text-sm font-medium text-rose-800">{draft.failReason ?? '生成失败'}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button
                onClick={() => figureActions.retryGenerate(draftId)}
                className="inline-flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                重试
              </Button>
            </div>
          </div>
        ) : null}

        {draft.status === 'ready' && asset ? (
          <div>
            <FigureThumb asset={asset} />
            <p className="mt-2 text-xs text-slate-500">
              已自动放置 {asset.annotations.length} 个标注占位 · 图层 {asset.layers.length}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to={`/edit/${asset.id}`}>
                <Button className="inline-flex items-center gap-1.5">
                  <PenTool className="h-3.5 w-3.5" aria-hidden />
                  打开画布编辑
                </Button>
              </Link>
              <Link to={`/versions/${asset.id}`}>
                <Button variant="secondary">查看版本</Button>
              </Link>
            </div>
          </div>
        ) : null}

        {draft.status !== 'ready' ? (
          <div className="mt-4">
            <Button
              variant="secondary"
              onClick={() => figureActions.startGenerate(draftId, { fail: true })}
              disabled={draft.status === 'generating'}
            >
              演示失败路径
            </Button>
          </div>
        ) : null}
      </Card>
    </div>
  )
}
