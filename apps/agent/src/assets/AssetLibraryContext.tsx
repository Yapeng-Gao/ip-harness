import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { PATENT_DELIVERABLES } from '../projects/patentDeliverables'

/**
 * 资产库 · 全局资料（样机）
 * - 以用户上传资料为主，Agent 产出与种子文件按同一模型登记
 * - 不落盘：upload 只进内存 + localStorage 元数据，无真文件
 * - 分类为人工 + 建议，不是自动 NLP
 */

export type AssetCategory =
  | 'case'
  | 'disclosure'
  | 'research'
  | 'draft'
  | 'official'
  | 'other'

export type AssetKind = 'pdf' | 'docx' | 'md' | 'xlsx' | 'img'

export type AssetDoc = {
  id: string
  name: string
  kind: AssetKind
  /** bytes */
  size: number
  uploadedAt: string
  category: AssetCategory
  projectId?: string
  caseId?: string
  source: 'upload' | 'agent' | 'seed'
  /** 用户可补充的一句说明 */
  note?: string
}

export type AssetCategoryDef = {
  id: AssetCategory
  label: string
  /** 分类下的二级目录（文件树第二层） */
  folders: string[]
}

export const ASSET_CATEGORIES: AssetCategoryDef[] = [
  { id: 'case', label: '案件资料', folders: ['委托与授权', '费用与账单'] },
  { id: 'disclosure', label: '技术交底', folders: ['交底书', '附图草图'] },
  { id: 'research', label: '检索报告', folders: ['查新结论', '新颖性意见'] },
  { id: 'draft', label: '撰写稿', folders: ['权利要求', '说明书'] },
  { id: 'official', label: '官方文书', folders: ['受理通知', '审查意见'] },
  { id: 'other', label: '其他', folders: ['待归类'] },
]

export const ASSET_KIND_LABEL: Record<AssetKind, string> = {
  pdf: 'PDF',
  docx: 'Word',
  md: 'Markdown',
  xlsx: 'Excel',
  img: '图片',
}

const ASSET_LS_KEY = 'ip-harness-agent-assets-v1'

function nowIso(): string {
  return new Date().toISOString()
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function kindFromName(name: string): AssetKind {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return 'pdf'
  if (ext === 'doc' || ext === 'docx') return 'docx'
  if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return 'xlsx'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'img'
  return 'md'
}

/** 文件名 → 分类建议（mock 关键字规则） */
export function suggestCategory(name: string): AssetCategory {
  const n = name.toLowerCase()
  if (/交底|disclosure/.test(n)) return 'disclosure'
  if (/检索|查新|research|novelty/.test(n)) return 'research'
  if (/权要|权利要求|说明书|claims|draft|spec/.test(n)) return 'draft'
  if (/受理|审查|oa|notice|office/.test(n)) return 'official'
  if (/合同|委托|授权书|账单|发票|case|contract/.test(n)) return 'case'
  return 'other'
}

/** 席 → 资产分类（种子按席归类，不按文件名猜） */
const SEAT_CATEGORY: Record<string, AssetCategory> = {
  'expert-landscape': 'research',
  'expert-competitor': 'research',
  'expert-inspire': 'research',
  'expert-mining': 'research',
  'expert-research': 'research',
  'expert-layout': 'case',
  'expert-intake': 'case',
  'expert-disclosure': 'disclosure',
  'expert-draft': 'draft',
  'expert-draft-spec': 'draft',
  'expert-figure': 'disclosure',
  'expert-filing': 'official',
  'expert-oa': 'official',
  'expert-annuity': 'case',
  'expert-valuation': 'case',
  'expert-monetize': 'case',
  'expert-enforcement': 'official',
}

/** 种子：复用既有 18 席交付物文件名，避免另造假数据 */
function seedAssets(): AssetDoc[] {
  const out: AssetDoc[] = []
  const at = new Date()
  let i = 0
  for (const [seatId, d] of Object.entries(PATENT_DELIVERABLES)) {
    if (seatId === 'orchestrator') continue
    const t = new Date(at.getTime() - i * 36e5).toISOString()
    const category = SEAT_CATEGORY[seatId] ?? 'other'
    for (const file of [d.artifactFile, d.worklogFile]) {
      out.push({
        id: `asset-seed-${d.nn}-${file.includes('worklog') ? 'w' : 'a'}`,
        name: file,
        kind: 'md',
        size: 4096 + i * 512,
        uploadedAt: t,
        category,
        source: 'seed',
      })
      i += 1
    }
  }
  // 用户上传风格的代表性资料
  const uploads: Array<[string, AssetCategory, number]> = [
    ['一种边缘调度模组的技术交底书.pdf', 'disclosure', 1_240_000],
    ['2026Q3 固态电解质查新报告.pdf', 'research', 3_980_000],
    ['权利要求书_v3.docx', 'draft', 86_000],
    ['说明书_完整稿.docx', 'draft', 240_000],
    ['受理通知书_2026-0815.pdf', 'official', 180_000],
    ['第一次审查意见通知书.pdf', 'official', 620_000],
    ['专利代理委托合同_签署版.pdf', 'case', 410_000],
    ['附图_结构示意图.dwg', 'disclosure', 1_900_000],
    ['竞品专利族清单.xlsx', 'research', 120_000],
    ['年费缴纳计划_2026.xlsx', 'case', 44_000],
  ]
  uploads.forEach(([name, category, size], idx) => {
    out.unshift({
      id: `asset-upload-${idx}`,
      name,
      kind: kindFromName(name),
      size,
      uploadedAt: new Date(at.getTime() - idx * 864e5).toISOString(),
      category,
      source: 'upload',
    })
  })
  return out
}

type PersistedAssets = { v: 1; docs: AssetDoc[] }

function loadPersisted(): AssetDoc[] | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(ASSET_LS_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as PersistedAssets
    if (parsed?.v !== 1 || !Array.isArray(parsed.docs)) return null
    return parsed.docs
  } catch {
    return null
  }
}

function persist(docs: AssetDoc[]) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(ASSET_LS_KEY, JSON.stringify({ v: 1, docs }))
  } catch {
    /* quota / private mode：样机可静默 */
  }
}

type UploadInput = { name: string; size: number; kind?: AssetKind }

export type AssetLibraryContextValue = {
  docs: AssetDoc[]
  getDoc: (id: string) => AssetDoc | undefined
  docsByCategory: (category: AssetCategory | 'all') => AssetDoc[]
  countByCategory: (category: AssetCategory) => number
  /** 未归类（other）数量 */
  unclassifiedCount: number
  upload: (input: UploadInput) => AssetDoc
  assignCategory: (id: string, category: AssetCategory) => void
  linkToProject: (id: string, projectId: string | undefined) => void
  setNote: (id: string, note: string) => void
  remove: (id: string) => void
}

const AssetLibraryContext = createContext<AssetLibraryContextValue | null>(null)

export function AssetLibraryProvider({ children }: { children: ReactNode }) {
  const [docs, setDocs] = useState<AssetDoc[]>(() => loadPersisted() ?? seedAssets())

  useEffect(() => {
    persist(docs)
  }, [docs])

  const getDoc = useCallback(
    (id: string) => docs.find((d) => d.id === id),
    [docs],
  )

  const docsByCategory = useCallback(
    (category: AssetCategory | 'all') =>
      category === 'all' ? docs : docs.filter((d) => d.category === category),
    [docs],
  )

  const countByCategory = useCallback(
    (category: AssetCategory) => docs.filter((d) => d.category === category).length,
    [docs],
  )

  const unclassifiedCount = useMemo(
    () => docs.filter((d) => d.category === 'other').length,
    [docs],
  )

  const upload = useCallback((input: UploadInput) => {
    const doc: AssetDoc = {
      id: uid('asset'),
      name: input.name,
      kind: input.kind ?? kindFromName(input.name),
      size: input.size,
      uploadedAt: nowIso(),
      category: suggestCategory(input.name),
      source: 'upload',
    }
    setDocs((prev) => [doc, ...prev])
    return doc
  }, [])

  const assignCategory = useCallback((id: string, category: AssetCategory) => {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, category } : d)))
  }, [])

  const linkToProject = useCallback((id: string, projectId: string | undefined) => {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, projectId } : d)))
  }, [])

  const setNote = useCallback((id: string, note: string) => {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, note } : d)))
  }, [])

  const remove = useCallback((id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const value = useMemo<AssetLibraryContextValue>(
    () => ({
      docs,
      getDoc,
      docsByCategory,
      countByCategory,
      unclassifiedCount,
      upload,
      assignCategory,
      linkToProject,
      setNote,
      remove,
    }),
    [
      docs,
      getDoc,
      docsByCategory,
      countByCategory,
      unclassifiedCount,
      upload,
      assignCategory,
      linkToProject,
      setNote,
      remove,
    ],
  )

  return (
    <AssetLibraryContext.Provider value={value}>
      {children}
    </AssetLibraryContext.Provider>
  )
}

export function useAssetLibrary(): AssetLibraryContextValue {
  const ctx = useContext(AssetLibraryContext)
  if (!ctx) throw new Error('useAssetLibrary must be used within AssetLibraryProvider')
  return ctx
}

/** 16777216 → "16.0 MB" */
export function formatAssetSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** ISO → "10-20 14:03" */
export function formatAssetTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}
