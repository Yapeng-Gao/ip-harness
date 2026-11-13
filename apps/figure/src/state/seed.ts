import type {
  Annotation,
  FigureAsset,
  FigureState,
  Layer,
} from './types'

export const SKETCH_LAYER_ID = 'layer-sketch'
export const ANNO_LAYER_ID = 'layer-anno'

export function defaultLayers(): Layer[] {
  return [
    { id: SKETCH_LAYER_ID, name: '背景草图', kind: 'sketch', visible: true },
    { id: ANNO_LAYER_ID, name: '标注层', kind: 'annotation', visible: true },
  ]
}

export function cloneLayers(layers: Layer[]): Layer[] {
  return layers.map((l) => ({ ...l }))
}

export function cloneAnnotations(annotations: Annotation[]): Annotation[] {
  return annotations.map((a) => ({ ...a }))
}

export function cloneAsset(asset: FigureAsset): FigureAsset {
  return {
    ...asset,
    context: { ...asset.context, parts: [...asset.context.parts] },
    layers: cloneLayers(asset.layers),
    annotations: cloneAnnotations(asset.annotations),
  }
}

function seedExploded(): FigureAsset {
  return {
    id: 'fig-seed-exploded',
    rev: 1,
    title: '智能传感装置爆炸图',
    templateId: 'exploded',
    layers: defaultLayers(),
    annotations: [
      {
        id: 'ann-s1',
        kind: 'bubble',
        x: 150,
        y: 88,
        text: '1',
        layerId: ANNO_LAYER_ID,
      },
      {
        id: 'ann-s2',
        kind: 'bubble',
        x: 650,
        y: 88,
        text: '2',
        layerId: ANNO_LAYER_ID,
      },
      {
        id: 'ann-s3',
        kind: 'callout',
        x: 400,
        y: 280,
        text: '外壳',
        layerId: ANNO_LAYER_ID,
      },
    ],
    createdAt: '2026-09-12T10:00:00.000Z',
    updatedAt: '2026-09-12T10:00:00.000Z',
    context: {
      title: '智能传感装置爆炸图',
      parts: ['传感模块', '处理单元', '通信接口', '外壳'],
      chapterRef: '实施例 · 图1',
    },
  }
}

function seedFlow(): FigureAsset {
  return {
    id: 'fig-seed-flow',
    rev: 1,
    title: '边缘处理流程图',
    templateId: 'flowchart',
    layers: defaultLayers(),
    annotations: [
      {
        id: 'ann-f1',
        kind: 'label',
        x: 150,
        y: 168,
        text: '采集',
        layerId: ANNO_LAYER_ID,
      },
      {
        id: 'ann-f2',
        kind: 'bubble',
        x: 490,
        y: 240,
        text: '3',
        layerId: ANNO_LAYER_ID,
      },
      {
        id: 'ann-f3',
        kind: 'callout',
        x: 320,
        y: 400,
        text: '异常检测',
        layerId: ANNO_LAYER_ID,
      },
    ],
    createdAt: '2026-09-12T11:00:00.000Z',
    updatedAt: '2026-09-12T11:00:00.000Z',
    context: {
      title: '边缘处理流程图',
      parts: ['采集', '滤波', '特征提取', '上报', '异常检测'],
    },
  }
}

export function createInitialState(): FigureState {
  const exploded = seedExploded()
  const flow = seedFlow()
  return {
    drafts: {},
    assets: {
      [exploded.id]: exploded,
      [flow.id]: flow,
    },
    versions: [
      {
        assetId: exploded.id,
        rev: 1,
        snapshot: cloneAsset(exploded),
        savedAt: exploded.createdAt,
      },
      {
        assetId: flow.id,
        rev: 1,
        snapshot: cloneAsset(flow),
        savedAt: flow.createdAt,
      },
    ],
    histories: {
      [exploded.id]: { past: [], future: [] },
      [flow.id]: { past: [], future: [] },
    },
    selectedAnnotationId: null,
    activeTool: 'select',
    attachEvents: [],
    toast: null,
    activeAssetId: exploded.id,
    activeDraftId: null,
  }
}
