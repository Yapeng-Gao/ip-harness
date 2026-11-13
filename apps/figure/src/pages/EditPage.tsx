import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  Layers,
  MousePointer2,
  Redo2,
  Save,
  Trash2,
  Undo2,
} from 'lucide-react'
import { FigureCanvas } from '../components/Canvas'
import { Button, Card, Chip, EmptyState, PageHeader } from '../components/ui'
import { figureActions, useFigureStore } from '../state/store'
import {
  ANNOTATION_KIND_LABELS,
  TEMPLATE_LABELS,
  type AnnotationKind,
  type EditorTool,
} from '../state/types'

const ADD_TOOLS: { id: AnnotationKind; label: string }[] = [
  { id: 'bubble', label: '气泡' },
  { id: 'label', label: '标签' },
  { id: 'callout', label: '引出' },
]

export function EditPage() {
  const { assetId } = useParams()
  const store = useFigureStore()
  const asset = assetId ? store.assets[assetId] : undefined
  const hist = assetId ? store.histories[assetId] : undefined
  const canUndo = (hist?.past.length ?? 0) > 0
  const canRedo = (hist?.future.length ?? 0) > 0
  const selected = asset?.annotations.find((a) => a.id === store.selectedAnnotationId)
  const [draftText, setDraftText] = useState('')

  useEffect(() => {
    if (assetId) figureActions.setActiveAsset(assetId)
  }, [assetId])

  useEffect(() => {
    setDraftText(selected?.text ?? '')
  }, [selected?.id, selected?.text])

  useEffect(() => {
    if (!assetId) return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) figureActions.redo(assetId)
        else figureActions.undo(assetId)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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

  function setTool(tool: EditorTool) {
    figureActions.setActiveTool(tool)
  }

  return (
    <div>
      <PageHeader
        eyebrow="③ 画布编辑"
        title={asset.title}
        desc="选中/拖动标注、点工具后落点添加、图层显隐、撤销/重做（≥10 步）、保存版本。SVG + 本地状态，无 CAD。"
      />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Chip tone="mock">{TEMPLATE_LABELS[asset.templateId]}</Chip>
        <Chip tone="neutral">rev {asset.rev}</Chip>
        <Chip tone="accent">undo {hist?.past.length ?? 0} / redo {hist?.future.length ?? 0}</Chip>
        <div className="ml-auto flex flex-wrap gap-2">
          <Link to={`/versions/${asset.id}`}>
            <Button variant="secondary">版本时间线</Button>
          </Link>
          <Link to={`/attach/${asset.id}`}>
            <Button variant="secondary">挂文档章</Button>
          </Link>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
        <Button
          variant={store.activeTool === 'select' ? 'primary' : 'secondary'}
          onClick={() => setTool('select')}
          className="inline-flex items-center gap-1"
        >
          <MousePointer2 className="h-3.5 w-3.5" aria-hidden />
          选择
        </Button>
        {ADD_TOOLS.map((t) => (
          <Button
            key={t.id}
            variant={store.activeTool === t.id ? 'primary' : 'secondary'}
            onClick={() => setTool(t.id)}
          >
            添加{t.label}
          </Button>
        ))}
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <Button
          variant="secondary"
          disabled={!canUndo}
          onClick={() => figureActions.undo(asset.id)}
          className="inline-flex items-center gap-1"
        >
          <Undo2 className="h-3.5 w-3.5" aria-hidden />
          撤销
        </Button>
        <Button
          variant="secondary"
          disabled={!canRedo}
          onClick={() => figureActions.redo(asset.id)}
          className="inline-flex items-center gap-1"
        >
          <Redo2 className="h-3.5 w-3.5" aria-hidden />
          重做
        </Button>
        <Button
          variant="success"
          onClick={() => figureActions.saveVersion(asset.id)}
          className="inline-flex items-center gap-1"
        >
          <Save className="h-3.5 w-3.5" aria-hidden />
          保存版本
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <Card className="p-3">
          <FigureCanvas
            asset={asset}
            tool={store.activeTool}
            selectedId={store.selectedAnnotationId}
            onSelect={(id) => {
              if (id) figureActions.selectAnnotation(id)
              else figureActions.selectAnnotation(null)
            }}
            onPlace={(x, y) => {
              if (store.activeTool === 'select') return
              figureActions.addAnnotation(asset.id, store.activeTool, x, y)
            }}
            onMove={(id, x, y) => figureActions.moveAnnotation(asset.id, id, x, y)}
            onMoveStart={() => figureActions.beginHistory(asset.id)}
          />
          <p className="mt-2 text-[11px] text-slate-400">
            {store.activeTool === 'select'
              ? '拖动标注可改坐标（入 history）。Ctrl/⌘+Z 撤销，Shift+Z 重做。'
              : `已选「添加${ANNOTATION_KIND_LABELS[store.activeTool]}」· 在画布空白处单击落点。`}
          </p>
        </Card>

        <div className="space-y-3">
          <Card className="p-3">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <Layers className="h-4 w-4" aria-hidden />
              图层
            </h2>
            <ul className="space-y-1.5">
              {asset.layers.map((layer) => (
                <li key={layer.id}>
                  <button
                    type="button"
                    onClick={() => figureActions.toggleLayer(asset.id, layer.id)}
                    className="focus-ring flex w-full items-center justify-between rounded-lg border border-slate-200 px-2.5 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    <span>
                      <span className="font-medium text-slate-800">{layer.name}</span>
                      <span className="ml-1 text-[11px] text-slate-400">{layer.kind}</span>
                    </span>
                    {layer.visible ? (
                      <Eye className="h-4 w-4 text-slate-600" aria-hidden />
                    ) : (
                      <EyeOff className="h-4 w-4 text-slate-300" aria-hidden />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-3">
            <h2 className="mb-2 text-sm font-semibold text-slate-900">选中标注</h2>
            {selected ? (
              <div className="space-y-2">
                <Chip tone="accent">{ANNOTATION_KIND_LABELS[selected.kind]}</Chip>
                <p className="text-[11px] text-slate-400">
                  ({Math.round(selected.x)}, {Math.round(selected.y)})
                </p>
                <label className="block">
                  <span className="text-xs text-slate-500">文字</span>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus-ring"
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    onBlur={() => {
                      if (draftText !== selected.text) {
                        figureActions.updateAnnotation(asset.id, selected.id, { text: draftText })
                      }
                    }}
                  />
                </label>
                <Button
                  variant="danger"
                  className="inline-flex items-center gap-1"
                  onClick={() => figureActions.deleteAnnotation(asset.id, selected.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  删除
                </Button>
              </div>
            ) : (
              <p className="text-xs text-slate-500">点画布上的标注以选中，或用添加工具落点。</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
