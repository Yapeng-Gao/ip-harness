import { useSyncExternalStore } from 'react'
import { createInitialState, emptyMatrix, emptyRisk, SEED_HITS } from './seed'
import type {
  CellVerdict,
  ClaimMatrix,
  FeatureRisk,
  FtoReportDraft,
  FtoState,
  HitRisk,
  MatrixCell,
  ProductFeature,
  RiskAssessment,
  RiskLevel,
  SearchHit,
} from './types'

let state: FtoState = createInitialState()
const listeners = new Set<() => void>()
const timers = new Set<ReturnType<typeof setTimeout>>()

function emit() {
  for (const l of listeners) l()
}

function setState(partial: Partial<FtoState> | ((prev: FtoState) => FtoState)) {
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

export function useFtoStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[\s,;|/·，、；]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2),
  )
}

function overlapScore(feature: ProductFeature, hit: SearchHit): number {
  const kw = feature.keywords?.length
    ? feature.keywords
    : [feature.name, feature.description]
  const a = tokenize(kw.join(' '))
  const b = tokenize(
    [hit.title, hit.snippet ?? '', hit.mockClaims?.map((c) => c.text).join(' ') ?? ''].join(
      ' ',
    ),
  )
  let n = 0
  for (const t of a) if (b.has(t)) n += 1
  return n
}

function verdictFromOverlap(score: number): CellVerdict {
  if (score >= 2) return '可能覆盖'
  if (score === 1) return '需人工'
  return '未涉及'
}

function riskFromVerdict(v: CellVerdict): RiskLevel {
  if (v === '可能覆盖') return 'high'
  if (v === '需人工') return 'medium'
  return 'low'
}

function maxRisk(levels: RiskLevel[]): RiskLevel {
  const rank: Record<RiskLevel, number> = {
    low: 1,
    medium: 2,
    unclear: 2.5,
    high: 3,
  }
  let best: RiskLevel = 'low'
  let bestRank = 0
  for (const l of levels) {
    if (rank[l] > bestRank) {
      bestRank = rank[l]
      best = l
    }
  }
  return levels.length === 0 ? 'unclear' : best
}

function rebuildRiskFromMatrix(matrix: ClaimMatrix, features: ProductFeature[], hits: SearchHit[]): RiskAssessment {
  const byFeature: FeatureRisk[] = features.map((f) => {
    const cells = matrix.cells.filter((c) => c.featureId === f.id)
    const levels = cells.map((c) => riskFromVerdict(c.verdict))
    return { featureId: f.id, level: maxRisk(levels), overridden: false }
  })
  const byHit: HitRisk[] = hits.map((h) => {
    const cells = matrix.cells.filter((c) => c.hitId === h.id)
    const levels = cells.map((c) => riskFromVerdict(c.verdict))
    return { hitId: h.id, level: maxRisk(levels), overridden: false }
  })
  const overall = maxRisk([
    ...byFeature.map((r) => r.level),
    ...byHit.map((r) => r.level),
  ])
  return { byFeature, byHit, overall, overallOverridden: false }
}

function matrixSummary(matrix: ClaimMatrix): string {
  if (matrix.cells.length === 0) return '矩阵为空'
  const counts: Record<CellVerdict, number> = {
    可能覆盖: 0,
    未涉及: 0,
    需人工: 0,
  }
  for (const c of matrix.cells) counts[c.verdict] += 1
  return `单元格 ${matrix.cells.length}：可能覆盖 ${counts['可能覆盖']} / 需人工 ${counts['需人工']} / 未涉及 ${counts['未涉及']}（假比对）`
}

function assertEditable(): boolean {
  if (state.report.status === 'confirmed') {
    toast('报告已 Confirm，请先「重新打开编辑」')
    return false
  }
  return true
}

export const ftoActions = {
  toast,

  addFeature() {
    if (!assertEditable()) return
    const f: ProductFeature = {
      id: uid('feat'),
      name: '新特征',
      description: '',
      keywords: [],
    }
    setState((s) => ({ ...s, features: [...s.features, f] }))
  },

  updateFeature(id: string, patch: Partial<ProductFeature>) {
    if (!assertEditable()) return
    setState((s) => ({
      ...s,
      features: s.features.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }))
  },

  removeFeature(id: string) {
    if (!assertEditable()) return
    setState((s) => ({
      ...s,
      features: s.features.filter((f) => f.id !== id),
      matrix: {
        cells: s.matrix.cells.filter((c) => c.featureId !== id),
      },
      risk: {
        ...s.risk,
        byFeature: s.risk.byFeature.filter((r) => r.featureId !== id),
      },
    }))
  },

  moveFeature(id: string, dir: -1 | 1) {
    if (!assertEditable()) return
    setState((s) => {
      const idx = s.features.findIndex((f) => f.id === id)
      if (idx < 0) return s
      const j = idx + dir
      if (j < 0 || j >= s.features.length) return s
      const next = [...s.features]
      const tmp = next[idx]!
      next[idx] = next[j]!
      next[j] = tmp
      return { ...s, features: next }
    })
  },

  removeHit(id: string) {
    if (!assertEditable()) return
    setState((s) => ({
      ...s,
      hits: s.hits.filter((h) => h.id !== id),
      matrix: { cells: s.matrix.cells.filter((c) => c.hitId !== id) },
      risk: {
        ...s.risk,
        byHit: s.risk.byHit.filter((r) => r.hitId !== id),
      },
    }))
    toast('已移除命中')
  },

  /** 策略 A：不读跨口 LS；加载/合并本壳共享种子 + 诚实 toast */
  importFromSearchBasket() {
    if (!assertEditable()) return
    setState((s) => {
      const byPub = new Map(s.hits.map((h) => [h.publicationNumber, h]))
      for (const seed of SEED_HITS) {
        if (!byPub.has(seed.publicationNumber)) {
          byPub.set(seed.publicationNumber, {
            ...seed,
            mockClaims: seed.mockClaims?.map((c) => ({ ...c })),
          })
        }
      }
      // 稳定顺序：共享种子在前，其余用户保留项在后
      const seedPubs = SEED_HITS.map((h) => h.publicationNumber)
      const ordered: typeof s.hits = []
      for (const pub of seedPubs) {
        const hit = byPub.get(pub)
        if (hit) ordered.push(hit)
      }
      for (const h of s.hits) {
        if (!seedPubs.includes(h.publicationNumber)) ordered.push(h)
      }
      return { ...s, hits: ordered }
    })
    toast('样机·跨口未共享 LS，已用共享种子')
  },

  resetSeedHits() {
    if (!assertEditable()) return
    setState((s) => ({
      ...s,
      hits: SEED_HITS.map((h) => ({
        ...h,
        mockClaims: h.mockClaims?.map((c) => ({ ...c })),
      })),
      matrix: emptyMatrix(),
      risk: emptyRisk(),
    }))
    toast('已恢复种子篮')
  },

  setCell(featureId: string, hitId: string, verdict: CellVerdict, claimSnippet?: string) {
    if (!assertEditable()) return
    setState((s) => {
      const rest = s.matrix.cells.filter(
        (c) => !(c.featureId === featureId && c.hitId === hitId),
      )
      const cell: MatrixCell = { featureId, hitId, verdict, claimSnippet }
      const matrix = { cells: [...rest, cell] }
      const risk = rebuildRiskFromMatrix(matrix, s.features, s.hits)
      // preserve overrides
      risk.byFeature = risk.byFeature.map((r) => {
        const prev = s.risk.byFeature.find((x) => x.featureId === r.featureId)
        return prev?.overridden ? { ...prev } : r
      })
      risk.byHit = risk.byHit.map((r) => {
        const prev = s.risk.byHit.find((x) => x.hitId === r.hitId)
        return prev?.overridden ? { ...prev } : r
      })
      if (s.risk.overallOverridden) {
        risk.overall = s.risk.overall
        risk.overallOverridden = true
      }
      return { ...s, matrix, risk }
    })
  },

  runMockMatrix() {
    if (!assertEditable()) return
    if (state.hits.length === 0) {
      toast('命中为空，无法自动比对')
      return
    }
    if (state.features.length === 0) {
      toast('特征为空，无法自动比对')
      return
    }
    setState({ matrixRunning: true })
    const delay = 320 + Math.floor(Math.random() * 180)
    schedule(() => {
      const cells: MatrixCell[] = []
      for (const f of state.features) {
        for (const h of state.hits) {
          const score = overlapScore(f, h)
          const verdict = verdictFromOverlap(score)
          const claim =
            h.mockClaims?.[0]?.text ??
            `【假 claim】与「${f.name}」关键词重叠 ${score}`
          cells.push({
            featureId: f.id,
            hitId: h.id,
            verdict,
            claimSnippet: claim,
          })
        }
      }
      const matrix = { cells }
      const risk = rebuildRiskFromMatrix(matrix, state.features, state.hits)
      setState({
        matrix,
        risk,
        matrixRunning: false,
        report: { status: 'draft' },
      })
      toast('已填假比对（非真 FTO 引擎）')
    }, delay)
  },

  clearMatrix() {
    if (!assertEditable()) return
    setState({ matrix: emptyMatrix(), risk: emptyRisk() })
    toast('已清空矩阵')
  },

  overrideFeatureRisk(featureId: string, level: RiskLevel) {
    if (!assertEditable()) return
    setState((s) => {
      const byFeature = s.risk.byFeature.some((r) => r.featureId === featureId)
        ? s.risk.byFeature.map((r) =>
            r.featureId === featureId ? { featureId, level, overridden: true } : r,
          )
        : [...s.risk.byFeature, { featureId, level, overridden: true }]
      const overall = s.risk.overallOverridden
        ? s.risk.overall
        : maxRisk([
            ...byFeature.map((r) => r.level),
            ...s.risk.byHit.map((r) => r.level),
          ])
      return {
        ...s,
        risk: { ...s.risk, byFeature, overall },
      }
    })
  },

  overrideHitRisk(hitId: string, level: RiskLevel) {
    if (!assertEditable()) return
    setState((s) => {
      const byHit = s.risk.byHit.some((r) => r.hitId === hitId)
        ? s.risk.byHit.map((r) =>
            r.hitId === hitId ? { hitId, level, overridden: true } : r,
          )
        : [...s.risk.byHit, { hitId, level, overridden: true }]
      const overall = s.risk.overallOverridden
        ? s.risk.overall
        : maxRisk([
            ...s.risk.byFeature.map((r) => r.level),
            ...byHit.map((r) => r.level),
          ])
      return {
        ...s,
        risk: { ...s.risk, byHit, overall },
      }
    })
  },

  overrideOverallRisk(level: RiskLevel) {
    if (!assertEditable()) return
    setState((s) => ({
      ...s,
      risk: { ...s.risk, overall: level, overallOverridden: true },
    }))
  },

  canConfirm(): { ok: boolean; reason?: string } {
    if (state.features.length === 0) return { ok: false, reason: '特征表为空' }
    if (state.hits.length === 0) return { ok: false, reason: '命中为空' }
    if (state.matrix.cells.length === 0) return { ok: false, reason: '矩阵为空' }
    return { ok: true }
  },

  confirmReport() {
    const gate = ftoActions.canConfirm()
    if (!gate.ok) {
      toast(`无法 Confirm：${gate.reason}`)
      return false
    }
    setState({
      report: { status: 'confirmed', confirmedAt: nowIso() },
    })
    toast('已 Confirm 报告草稿（内存·不写 case-core）')
    return true
  },

  reopenEdit() {
    setState({
      report: { status: 'draft' },
    })
    toast('已重新打开编辑')
  },

  getReportDraft(): FtoReportDraft {
    return {
      projectId: state.projectId,
      status: state.report.status,
      features: state.features.map((f) => ({ id: f.id, name: f.name })),
      hits: state.hits.map((h) => ({
        id: h.id,
        publicationNumber: h.publicationNumber,
        title: h.title,
      })),
      overallRisk: state.risk.overall,
      matrixSummary: matrixSummary(state.matrix),
      disclaimer: '样机·非法律意见',
      backend: 'mock',
    }
  },

  buildMarkdown(): string {
    const d = ftoActions.getReportDraft()
    const lines = [
      `# FTO 报告草稿 · ${state.projectName}`,
      '',
      `> **${d.disclaimer}** · backend=\`${d.backend}\` · status=\`${d.status}\``,
      '',
      `项目 ID：\`${d.projectId}\``,
      state.report.confirmedAt ? `Confirm 时间：${state.report.confirmedAt}` : '',
      '',
      '## 产品特征',
      ...state.features.map(
        (f, i) =>
          `${i + 1}. **${f.name}** — ${f.description}${
            f.keywords?.length ? `（关键词：${f.keywords.join('、')}）` : ''
          }`,
      ),
      '',
      '## 检索命中',
      ...state.hits.map(
        (h) =>
          `- \`${h.publicationNumber}\` ${h.title}${h.applicant ? ` · ${h.applicant}` : ''}`,
      ),
      '',
      '## 矩阵摘要',
      d.matrixSummary,
      '',
      '## 风险结论',
      `全局风险：**${d.overallRisk}**${state.risk.overallOverridden ? '（人工覆盖）' : ''}`,
      '',
      '## 免责声明',
      '本报告为样机演示草稿，**无真 FTO 引擎**，**非法律意见**，不写入 case-core / PatentCase。',
    ]
    return lines.filter((l) => l !== undefined).join('\n')
  },

  copyMarkdown() {
    const md = ftoActions.buildMarkdown()
    void navigator.clipboard.writeText(md).then(
      () => toast('已复制 Markdown'),
      () => toast('复制失败（浏览器权限）'),
    )
  },
}

/** Agent 同形状只读/草稿（纯函数调 store，非 HTTP） */
export const ftoAgentApi = {
  getProject() {
    return {
      projectId: state.projectId,
      projectName: state.projectName,
      features: state.features.map((f) => ({
        id: f.id,
        name: f.name,
        description: f.description,
        keywords: f.keywords,
      })),
      hits: state.hits.map((h) => ({
        id: h.id,
        publicationNumber: h.publicationNumber,
        title: h.title,
      })),
      overallRisk: state.risk.overall,
      matrixCellCount: state.matrix.cells.length,
      reportStatus: state.report.status,
      backend: 'mock' as const,
    }
  },
  runMockMatrix() {
    ftoActions.runMockMatrix()
  },
  getReportDraft() {
    return ftoActions.getReportDraft()
  },
  confirmReport() {
    return ftoActions.confirmReport()
  },
}

export function getFtoState() {
  return state
}
