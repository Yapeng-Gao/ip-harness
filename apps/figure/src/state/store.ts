import { useSyncExternalStore } from 'react'
import { ANNO_LAYER_ID, cloneAnnotations, cloneAsset, cloneLayers, createInitialState, defaultLayers } from './seed'
import type {
  Annotation,
  AnnotationKind,
  AttachEvent,
  EditorTool,
  FigureAsset,
  FigureContext,
  FigureState,
  GenerateDraft,
  HistoryEntry,
  TemplateId,
} from './types'
import { HISTORY_LIMIT } from './types'

let state: FigureState = createInitialState()
const listeners = new Set<() => void>()
const timers = new Set<ReturnType<typeof setTimeout>>()

function emit() {
  for (const l of listeners) l()
}

function setState(partial: Partial<FigureState> | ((prev: FigureState) => FigureState)) {
  state = typeof partial === 'function' ? partial(state) : { ...state, ...partial }
  emit()
}

function schedule(fn: () => void, ms: number) {
  const id = setTimeout(() => {
    timers.delete(id)
    fn()
  }, ms)
  timers.add(id)
}

function nowIso() {
  return new Date().toISOString()
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function toast(message: string) {
  setState({ toast: message })
  schedule(() => {
    if (state.toast === message) setState({ toast: null })
  }, 3200)
}

function getSnapshot() {
  return state
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useFigureStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function getFigureState() {
  return state
}

function snapshotEntry(asset: FigureAsset): HistoryEntry {
  return {
    annotations: cloneAnnotations(asset.annotations),
    layers: cloneLayers(asset.layers),
  }
}

function ensureHistory(assetId: string) {
  if (!state.histories[assetId]) {
    setState((s) => ({
      ...s,
      histories: { ...s.histories, [assetId]: { past: [], future: [] } },
    }))
  }
}

function pushHistory(assetId: string) {
  const asset = state.assets[assetId]
  if (!asset) return
  ensureHistory(assetId)
  const entry = snapshotEntry(asset)
  setState((s) => {
    const hist = s.histories[assetId] ?? { past: [], future: [] }
    return {
      ...s,
      histories: {
        ...s.histories,
        [assetId]: {
          past: [...hist.past, entry].slice(-HISTORY_LIMIT),
          future: [],
        },
      },
    }
  })
}

function applyEntry(assetId: string, entry: HistoryEntry) {
  setState((s) => {
    const asset = s.assets[assetId]
    if (!asset) return s
    return {
      ...s,
      assets: {
        ...s.assets,
        [assetId]: {
          ...asset,
          annotations: cloneAnnotations(entry.annotations),
          layers: cloneLayers(entry.layers),
          updatedAt: nowIso(),
        },
      },
    }
  })
}

const TEMPLATE_PLACES: Record<TemplateId, { x: number; y: number }[]> = {
  exploded: [
    { x: 150, y: 120 },
    { x: 650, y: 120 },
    { x: 400, y: 280 },
  ],
  flowchart: [
    { x: 150, y: 168 },
    { x: 490, y: 240 },
    { x: 320, y: 400 },
  ],
}

function buildGeneratedAsset(draft: GenerateDraft): FigureAsset {
  const now = nowIso()
  const layers = defaultLayers()
  const places = TEMPLATE_PLACES[draft.templateId]
  const parts = draft.context.parts.filter((p) => p.trim().length > 0)
  const kinds: AnnotationKind[] = ['bubble', 'bubble', 'callout']
  const annotations: Annotation[] = places.map((pt, i) => {
    const kind = kinds[i] ?? 'label'
    const text =
      kind === 'bubble'
        ? String(i + 1)
        : (parts[i] ?? parts[0] ?? draft.context.title ?? '标注')
    return {
      id: uid('ann'),
      kind,
      x: pt.x,
      y: pt.y,
      text,
      layerId: ANNO_LAYER_ID,
    }
  })
  return {
    id: uid('fig'),
    rev: 1,
    title: draft.context.title.trim() || '未命名附图',
    templateId: draft.templateId,
    layers,
    annotations,
    createdAt: now,
    updatedAt: now,
    context: {
      title: draft.context.title,
      parts: [...draft.context.parts],
      chapterRef: draft.context.chapterRef,
    },
  }
}

function nextBubbleText(asset: FigureAsset): string {
  const nums = asset.annotations
    .filter((a) => a.kind === 'bubble')
    .map((a) => Number.parseInt(a.text, 10))
    .filter((n) => Number.isFinite(n))
  const max = nums.length ? Math.max(...nums) : 0
  return String(max + 1)
}

export const figureActions = {
  toast,

  setActiveAsset(id: string | null) {
    setState({ activeAssetId: id })
  },

  setActiveTool(tool: EditorTool) {
    setState({ activeTool: tool, selectedAnnotationId: tool === 'select' ? state.selectedAnnotationId : null })
  },

  selectAnnotation(id: string | null) {
    setState({ selectedAnnotationId: id, activeTool: 'select' })
  },

  createDraft(context: FigureContext, templateId: TemplateId): string {
    const id = uid('draft')
    const draft: GenerateDraft = {
      id,
      context: {
        title: context.title,
        parts: context.parts.map((p) => p.trim()).filter(Boolean),
        chapterRef: context.chapterRef,
      },
      templateId,
      status: 'idle',
    }
    setState((s) => ({
      ...s,
      drafts: { ...s.drafts, [id]: draft },
      activeDraftId: id,
    }))
    return id
  },

  startGenerate(draftId: string, opts?: { fail?: boolean }) {
    const draft = state.drafts[draftId]
    if (!draft) {
      toast('草稿不存在')
      return
    }
    if (draft.status === 'generating') return
    setState((s) => ({
      ...s,
      drafts: {
        ...s.drafts,
        [draftId]: { ...draft, status: 'generating', failReason: undefined },
      },
      activeDraftId: draftId,
    }))
    const delay = 1000 + Math.floor(Math.random() * 1000)
    schedule(() => {
      const current = state.drafts[draftId]
      if (!current || current.status !== 'generating') return
      if (opts?.fail) {
        setState((s) => ({
          ...s,
          drafts: {
            ...s.drafts,
            [draftId]: {
              ...current,
              status: 'failed',
              failReason: '样机故障注入（无真文生图）',
            },
          },
        }))
        toast('生成失败（样机）· 可重试')
        return
      }
      const asset = buildGeneratedAsset(current)
      setState((s) => ({
        ...s,
        drafts: {
          ...s.drafts,
          [draftId]: { ...current, status: 'ready', assetId: asset.id },
        },
        assets: { ...s.assets, [asset.id]: asset },
        versions: [
          ...s.versions,
          {
            assetId: asset.id,
            rev: asset.rev,
            snapshot: cloneAsset(asset),
            savedAt: asset.createdAt,
          },
        ],
        histories: { ...s.histories, [asset.id]: { past: [], future: [] } },
        activeAssetId: asset.id,
      }))
      toast('草图已就绪（模板占位）· 请打开画布编辑')
    }, delay)
  },

  retryGenerate(draftId: string) {
    figureActions.startGenerate(draftId)
  },

  moveAnnotation(assetId: string, annotationId: string, x: number, y: number) {
    setState((s) => {
      const asset = s.assets[assetId]
      if (!asset) return s
      return {
        ...s,
        assets: {
          ...s.assets,
          [assetId]: {
            ...asset,
            annotations: asset.annotations.map((a) =>
              a.id === annotationId ? { ...a, x, y } : a,
            ),
            updatedAt: nowIso(),
          },
        },
      }
    })
  },

  beginHistory(assetId: string) {
    pushHistory(assetId)
  },

  addAnnotation(assetId: string, kind: AnnotationKind, x: number, y: number) {
    const asset = state.assets[assetId]
    if (!asset) return
    pushHistory(assetId)
    const text =
      kind === 'bubble' ? nextBubbleText(asset) : kind === 'label' ? '标签' : '引出'
    const ann: Annotation = {
      id: uid('ann'),
      kind,
      x,
      y,
      text,
      layerId: ANNO_LAYER_ID,
    }
    setState((s) => {
      const live = s.assets[assetId]
      if (!live) return s
      return {
        ...s,
        selectedAnnotationId: ann.id,
        assets: {
          ...s.assets,
          [assetId]: {
            ...live,
            annotations: [...live.annotations, ann],
            updatedAt: nowIso(),
          },
        },
      }
    })
  },

  updateAnnotation(assetId: string, annotationId: string, patch: Partial<Annotation>, recordHistory = true) {
    const asset = state.assets[assetId]
    if (!asset) return
    if (recordHistory) pushHistory(assetId)
    setState((s) => {
      const live = s.assets[assetId]
      if (!live) return s
      return {
        ...s,
        assets: {
          ...s.assets,
          [assetId]: {
            ...live,
            annotations: live.annotations.map((a) =>
              a.id === annotationId ? { ...a, ...patch } : a,
            ),
            updatedAt: nowIso(),
          },
        },
      }
    })
  },

  deleteAnnotation(assetId: string, annotationId: string) {
    const asset = state.assets[assetId]
    if (!asset) return
    pushHistory(assetId)
    setState((s) => {
      const live = s.assets[assetId]
      if (!live) return s
      return {
        ...s,
        selectedAnnotationId: s.selectedAnnotationId === annotationId ? null : s.selectedAnnotationId,
        assets: {
          ...s.assets,
          [assetId]: {
            ...live,
            annotations: live.annotations.filter((a) => a.id !== annotationId),
            updatedAt: nowIso(),
          },
        },
      }
    })
  },

  toggleLayer(assetId: string, layerId: string) {
    const asset = state.assets[assetId]
    if (!asset) return
    pushHistory(assetId)
    setState((s) => {
      const live = s.assets[assetId]
      if (!live) return s
      return {
        ...s,
        assets: {
          ...s.assets,
          [assetId]: {
            ...live,
            layers: live.layers.map((l) =>
              l.id === layerId ? { ...l, visible: !l.visible } : l,
            ),
            updatedAt: nowIso(),
          },
        },
      }
    })
  },

  undo(assetId: string) {
    const hist = state.histories[assetId]
    const asset = state.assets[assetId]
    if (!hist || !asset || hist.past.length === 0) {
      toast('没有可撤销的步骤')
      return
    }
    const prev = hist.past[hist.past.length - 1]!
    const current = snapshotEntry(asset)
    setState((s) => ({
      ...s,
      histories: {
        ...s.histories,
        [assetId]: {
          past: hist.past.slice(0, -1),
          future: [...hist.future, current],
        },
      },
    }))
    applyEntry(assetId, prev)
  },

  redo(assetId: string) {
    const hist = state.histories[assetId]
    const asset = state.assets[assetId]
    if (!hist || !asset || hist.future.length === 0) {
      toast('没有可重做的步骤')
      return
    }
    const next = hist.future[hist.future.length - 1]!
    const current = snapshotEntry(asset)
    setState((s) => ({
      ...s,
      histories: {
        ...s.histories,
        [assetId]: {
          past: [...hist.past, current],
          future: hist.future.slice(0, -1),
        },
      },
    }))
    applyEntry(assetId, next)
  },

  saveVersion(assetId: string) {
    const asset = state.assets[assetId]
    if (!asset) return
    const now = nowIso()
    const nextRev = asset.rev + 1
    const updated: FigureAsset = { ...cloneAsset(asset), rev: nextRev, updatedAt: now }
    setState((s) => ({
      ...s,
      assets: { ...s.assets, [assetId]: updated },
      versions: [
        ...s.versions,
        { assetId, rev: nextRev, snapshot: cloneAsset(updated), savedAt: now },
      ],
    }))
    toast(`已保存版本 rev ${nextRev}`)
  },

  restoreVersion(assetId: string, rev: number) {
    const ver = state.versions.find((v) => v.assetId === assetId && v.rev === rev)
    const live = state.assets[assetId]
    if (!ver || !live) {
      toast('版本不存在')
      return
    }
    const restored: FigureAsset = {
      ...cloneAsset(ver.snapshot),
      id: assetId,
      rev: live.rev,
      updatedAt: nowIso(),
    }
    setState((s) => ({
      ...s,
      assets: { ...s.assets, [assetId]: restored },
      histories: { ...s.histories, [assetId]: { past: [], future: [] } },
      selectedAnnotationId: null,
    }))
    toast(`已恢复 rev ${rev} 的内容（样机 · 未另存）`)
  },

  attachChapter(
    assetId: string,
    target: { docId: string; docTitle: string; chapterId: string; chapterTitle: string },
  ) {
    const asset = state.assets[assetId]
    if (!asset) {
      toast('资产不存在')
      return
    }
    const ev: AttachEvent = {
      id: uid('evt'),
      at: nowIso(),
      assetId,
      rev: asset.rev,
      docId: target.docId,
      docTitle: target.docTitle,
      chapterId: target.chapterId,
      chapterTitle: target.chapterTitle,
      message: `已挂章（样机）· ${asset.title} rev${asset.rev} → ${target.docTitle} / ${target.chapterTitle}`,
    }
    setState((s) => ({ ...s, attachEvents: [ev, ...s.attachEvents] }))
    toast(ev.message)
  },
}
