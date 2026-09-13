export type LayerKind = 'sketch' | 'annotation'
export type AnnotationKind = 'bubble' | 'label' | 'callout'
export type TemplateId = 'exploded' | 'flowchart'
export type GenerateStatus = 'idle' | 'generating' | 'ready' | 'failed'
export type EditorTool = 'select' | AnnotationKind

export type FigureContext = {
  title: string
  parts: string[]
  chapterRef?: string
}

export type Layer = {
  id: string
  name: string
  kind: LayerKind
  visible: boolean
}

export type Annotation = {
  id: string
  kind: AnnotationKind
  x: number
  y: number
  text: string
  layerId: string
}

export type FigureAsset = {
  id: string
  rev: number
  title: string
  templateId: TemplateId
  layers: Layer[]
  annotations: Annotation[]
  createdAt: string
  updatedAt: string
  context: FigureContext
}

export type FigureVersion = {
  assetId: string
  rev: number
  snapshot: FigureAsset
  savedAt: string
}

export type GenerateDraft = {
  id: string
  context: FigureContext
  templateId: TemplateId
  status: GenerateStatus
  assetId?: string
  failReason?: string
}

export type AttachEvent = {
  id: string
  at: string
  assetId: string
  rev: number
  docId: string
  docTitle: string
  chapterId: string
  chapterTitle: string
  message: string
}

export type HistoryEntry = {
  annotations: Annotation[]
  layers: Layer[]
}

export type HistoryStack = {
  past: HistoryEntry[]
  future: HistoryEntry[]
}

export type FakeChapter = {
  id: string
  title: string
}

export type FakeDoc = {
  docId: string
  docTitle: string
  chapters: FakeChapter[]
}

export type FigureState = {
  drafts: Record<string, GenerateDraft>
  assets: Record<string, FigureAsset>
  versions: FigureVersion[]
  histories: Record<string, HistoryStack>
  selectedAnnotationId: string | null
  activeTool: EditorTool
  attachEvents: AttachEvent[]
  toast: string | null
  activeAssetId: string | null
  activeDraftId: string | null
}

export const HONESTY_BANNER = '样机 · 无真文生图 · 生成+编辑双闭环'

export const DOC_HARNESS_DEEPLINK = 'http://localhost:5178'

export const CANVAS = { width: 800, height: 560 }

export const HISTORY_LIMIT = 24

export const TEMPLATE_LABELS: Record<TemplateId, string> = {
  exploded: '爆炸图框',
  flowchart: '流程图框',
}

export const ANNOTATION_KIND_LABELS: Record<AnnotationKind, string> = {
  bubble: '序号气泡',
  label: '文字标签',
  callout: '引出标注',
}

export const FAKE_DOCS: FakeDoc[] = [
  {
    docId: 'doc-patent-draft-1',
    docTitle: '撰写稿 · 智能传感装置',
    chapters: [
      { id: 'ch-emb-fig1', title: '实施例 · 图1' },
      { id: 'ch-claims', title: '权利要求' },
      { id: 'ch-abstract', title: '发明摘要' },
    ],
  },
  {
    docId: 'doc-inventor-1',
    docTitle: '发明人交底 · 智能传感装置',
    chapters: [{ id: 'ch-figures', title: '附图说明' }],
  },
]

export const CHAPTER_OPTIONS = [
  { value: '', label: '（不关联章节）' },
  { value: '实施例 · 图1', label: '撰写稿 / 实施例 · 图1' },
  { value: '权利要求', label: '撰写稿 / 权利要求' },
  { value: '附图说明', label: '发明人交底 / 附图说明' },
] as const

export const STEPS = [
  { key: 'list', path: '/', label: '资产列表', short: '资产' },
  { key: 'new', path: '/new', label: '上下文', short: '上下文' },
  { key: 'generate', path: '/generate', label: 'mock 生成', short: '生成' },
  { key: 'edit', path: '/edit', label: '画布编辑', short: '画布' },
  { key: 'versions', path: '/versions', label: '版本', short: '版本' },
  { key: 'attach', path: '/attach', label: '挂文档章', short: '挂章' },
] as const
