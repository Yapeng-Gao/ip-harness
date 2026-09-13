import type { AdvancedRow, SearchFilters, SearchHit, SearchMode, SearchQuery } from '../state/types'

const TOPIC_BUCKETS: Record<string, string[]> = {
  battery: [
    '电池', '固态', '电解质', '锂', '隔膜', '刀片', 'battery', 'electrolyte', 'lithium', 'anode', 'solid',
  ],
  semiconductor: [
    '半导体', '鳍', '晶体管', 'finfet', 'gate', 'wafer', '芯片', 'semiconductor', 'transistor',
  ],
  pharma: [
    '抗体', '肿瘤', '免疫', 'antibody', 'tumor', 'oncology', 'pharma', '药物', '治疗',
  ],
  comms: [
    '波束', '5g', 'nr', '通信', 'beam', 'wireless', 'uplink', 'mimo', 'sensing', 'uci',
  ],
  materials: [
    '聚合物', '复合材料', 'polymer', 'blend', '石墨烯', '材料', 'oled', 'pixel',
  ],
  ai: ['大模型', '神经网络', 'neural', 'attention', '摘要', 'llm', '模型'],
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,;|/+\-_()（）【】\[\]「」]+/u)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
}

function haystack(h: SearchHit): string {
  return [
    h.title,
    h.abstract ?? '',
    h.snippet ?? '',
    h.applicant ?? '',
    h.publicationNumber,
    ...(h.ipc ?? []),
    h.inventor ?? '',
    h.claims ?? '',
  ]
    .join(' ')
    .toLowerCase()
}

/** Keyword: AND tokens by default; support OR groups split by OR. */
export function validateKeyword(text: string): string | null {
  const q = text.trim()
  if (!q) return '请输入关键词'
  const upper = q.replace(/\s+/g, ' ')
  if (/\b(AND|OR)\s*$/i.test(upper)) return '布尔式不完整：末尾不能为 AND / OR'
  if (/^\s*(AND|OR)\b/i.test(upper)) return '布尔式不完整：不能以 AND / OR 开头'
  const opens = (q.match(/\(/g) ?? []).length
  const closes = (q.match(/\)/g) ?? []).length
  if (opens !== closes) return `括号不平衡：左 ${opens} / 右 ${closes}`
  return null
}

function matchKeyword(hit: SearchHit, text: string): number {
  const hay = haystack(hit)
  // Split by OR first (top-level simplistic)
  const orParts = text.split(/\s+OR\s+/i)
  let best = 0
  for (const part of orParts) {
    const andTokens = part
      .split(/\s+AND\s+/i)
      .flatMap((p) => tokenize(p.replace(/[()]/g, ' ')))
      .filter((t) => t !== 'and' && t !== 'or')
    if (andTokens.length === 0) continue
    let score = 0
    let all = true
    for (const t of andTokens) {
      if (hay.includes(t)) score += 1
      else {
        all = false
        break
      }
    }
    if (all) best = Math.max(best, score)
  }
  return best
}

function topicVector(tokens: string[]): Record<string, number> {
  const vec: Record<string, number> = {}
  for (const [topic, words] of Object.entries(TOPIC_BUCKETS)) {
    let c = 0
    for (const t of tokens) {
      if (words.some((w) => t.includes(w) || w.includes(t))) c += 1
    }
    if (c > 0) vec[topic] = c
  }
  return vec
}

function cosineSparse(a: Record<string, number>, b: Record<string, number>): number {
  let dot = 0
  let na = 0
  let nb = 0
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const av = a[k] ?? 0
    const bv = b[k] ?? 0
    dot += av * bv
    na += av * av
    nb += bv * bv
  }
  if (na === 0 || nb === 0) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

export function scoreSemantic(hit: SearchHit, text: string): number {
  const qTokens = tokenize(text)
  const hTokens = tokenize(haystack(hit))
  const overlap = qTokens.filter((t) => hTokens.some((h) => h.includes(t) || t.includes(h))).length
  const sim = cosineSparse(topicVector(qTokens), topicVector(hTokens))
  return overlap * 1.2 + sim * 4
}

export function validateAdvanced(rows: AdvancedRow[]): string | null {
  const filled = rows.filter((r) => r.value.trim().length > 0)
  if (filled.length === 0) return '请至少填写一行高级检索条件'
  for (const r of filled) {
    if (r.field === 'date') {
      const v = r.value.trim()
      if (!/^\d{4}(-\d{2}(-\d{2})?)?$/.test(v) && !/^\d{4}\s*[-~到至]\s*\d{4}$/.test(v)) {
        return `日期行格式无效：「${v}」（示例 2020 或 2020-01-01 或 2020-2023）`
      }
    }
  }
  return null
}

export function compileAdvanced(rows: AdvancedRow[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const r of rows) {
    const v = r.value.trim()
    if (!v) continue
    out[r.field] = v
  }
  return out
}

function matchAdvanced(hit: SearchHit, advanced: Record<string, string>): number {
  let score = 0
  for (const [field, raw] of Object.entries(advanced)) {
    const v = raw.toLowerCase()
    switch (field) {
      case 'title':
        if ((hit.title ?? '').toLowerCase().includes(v)) score += 3
        else return 0
        break
      case 'abstract':
        if ((hit.abstract ?? hit.snippet ?? '').toLowerCase().includes(v)) score += 2
        else return 0
        break
      case 'applicant':
        if ((hit.applicant ?? '').toLowerCase().includes(v)) score += 2
        else return 0
        break
      case 'ipc':
        if ((hit.ipc ?? []).some((i) => i.toLowerCase().includes(v))) score += 2
        else return 0
        break
      case 'publicationNumber':
        if (hit.publicationNumber.toLowerCase().includes(v)) score += 3
        else return 0
        break
      case 'date': {
        const d = hit.date ?? ''
        if (v.includes('-') && /^\d{4}-\d{4}$/.test(v.replace(/\s/g, ''))) {
          const [a, b] = v.replace(/\s/g, '').split('-')
          const y = Number(d.slice(0, 4))
          if (y >= Number(a) && y <= Number(b)) score += 1
          else return 0
        } else if (d.startsWith(v.slice(0, 4)) || d.includes(v)) score += 1
        else return 0
        break
      }
      default:
        break
    }
  }
  return score
}

export function applyFilters(hits: SearchHit[], filters: SearchFilters): SearchHit[] {
  return hits.filter((h) => {
    if (filters.dateFrom) {
      const from = filters.dateFrom
      if ((h.date ?? '') < from) return false
    }
    if (filters.dateTo) {
      const to = filters.dateTo
      if ((h.date ?? '') > to) return false
    }
    if (filters.ipcPrefix && filters.ipcPrefix.length > 0) {
      const ok = filters.ipcPrefix.some((p) =>
        (h.ipc ?? []).some((i) => i.toUpperCase().startsWith(p.toUpperCase())),
      )
      if (!ok) return false
    }
    if (filters.applicants && filters.applicants.length > 0) {
      const app = (h.applicant ?? '').toLowerCase()
      const ok = filters.applicants.some((a) => a.trim() && app.includes(a.trim().toLowerCase()))
      if (!ok) return false
    }
    if (filters.legalStatus && filters.legalStatus.length > 0) {
      if (!h.legalStatus || !filters.legalStatus.includes(h.legalStatus)) return false
    }
    if (filters.docTypes && filters.docTypes.length > 0) {
      const country = h.country ?? h.publicationNumber.slice(0, 2)
      if (!filters.docTypes.includes(country)) return false
    }
    return true
  })
}

export function runScoring(
  corpus: SearchHit[],
  mode: SearchMode,
  text: string,
  advanced: Record<string, string> | undefined,
): SearchHit[] {
  const scored: SearchHit[] = []
  for (const h of corpus) {
    let score = 0
    if (mode === 'keyword') score = matchKeyword(h, text)
    else if (mode === 'semantic') score = scoreSemantic(h, text)
    else score = matchAdvanced(h, advanced ?? {})
    if (score > 0) scored.push({ ...h, score: Math.round(score * 100) / 100 })
  }
  scored.sort((a, b) => b.score - a.score || (a.date ?? '').localeCompare(b.date ?? ''))
  return scored
}

export function buildQuery(opts: {
  mode: SearchMode
  text: string
  advancedRows: AdvancedRow[]
  filters: SearchFilters
  limit: number
}): SearchQuery {
  const q: SearchQuery = {
    mode: opts.mode,
    filters: { ...opts.filters },
    limit: opts.limit,
  }
  if (opts.mode === 'advanced') {
    q.advanced = compileAdvanced(opts.advancedRows)
  } else {
    q.text = opts.text
  }
  return q
}

export function validateQuery(
  mode: SearchMode,
  text: string,
  advancedRows: AdvancedRow[],
): string | null {
  if (mode === 'keyword') return validateKeyword(text)
  if (mode === 'semantic') {
    if (!text.trim()) return '请输入语义描述'
    return null
  }
  return validateAdvanced(advancedRows)
}
