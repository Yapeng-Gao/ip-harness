import { useSyncExternalStore } from 'react'
import { createInitialState, emptyDisclosure, SEED_DISCLOSURE, SEED_HITS } from './seed'
import type {
  Disclosure,
  HandoffKind,
  InventionCandidate,
  MiningState,
  ScoreCard,
} from './types'
import { scoreTotal } from './types'

let state: MiningState = createInitialState()
const listeners = new Set<() => void>()
const timers = new Set<ReturnType<typeof setTimeout>>()

function emit() {
  for (const l of listeners) l()
}

function setState(partial: Partial<MiningState> | ((prev: MiningState) => MiningState)) {
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

export function useMiningStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function getMiningState() {
  return state
}

function defaultScore(candidateId: string): ScoreCard {
  const novelty = 3
  const value = 3
  const writability = 3
  return {
    candidateId,
    novelty,
    value,
    writability,
    total: scoreTotal(novelty, value, writability),
  }
}

function ensureScores(candidates: InventionCandidate[], scores: ScoreCard[]): ScoreCard[] {
  const map = new Map(scores.map((s) => [s.candidateId, s]))
  return candidates.map((c) => map.get(c.id) ?? defaultScore(c.id))
}

/** 示意拆解：按技术点编号行 / 段落切分，关键词拼标题 */
function mockDissect(disclosure: Disclosure): InventionCandidate[] {
  const lines = disclosure.techPoints
    .split(/\n+/)
    .map((l) => l.replace(/^\d+[\.、．)\s]+/, '').trim())
    .filter((l) => l.length >= 4)

  const fallbacks = [
    {
      title: '【示意】柔性界面缓冲涂层',
      points: '在硫化物电解质与正极之间增设柔性缓冲层，改善接触阻抗。',
    },
    {
      title: '【示意】分段式液冷热管理',
      points: '针对刀片电芯高热区采用分段液冷板强化局部散热。',
    },
    {
      title: '【示意】微量掺杂提升电导率',
      points: '电解质配方引入微量掺杂剂，示意提升室温离子电导率。',
    },
    {
      title: '【示意】交底背景衍生点',
      points: disclosure.background.slice(0, 80) || '由交底背景衍生的示意发明点。',
    },
  ]

  const related = disclosure.relatedHitIds.length
    ? [...disclosure.relatedHitIds]
    : SEED_HITS.slice(0, 1).map((h) => h.id)

  const base = lines.length >= 3 ? lines.slice(0, Math.max(3, lines.length)) : null
  const items: InventionCandidate[] = []

  if (base) {
    for (let i = 0; i < base.length; i++) {
      const text = base[i]!
      const short = text.length > 28 ? `${text.slice(0, 28)}…` : text
      items.push({
        id: uid('cand'),
        title: `【示意】发明点 ${i + 1}：${short}`,
        points: `${text}${disclosure.effects ? `\n效果关联：${disclosure.effects.slice(0, 60)}` : ''}`,
        relatedHitIds: i === 0 ? related : related.slice(0, 1),
      })
    }
  } else {
    for (const f of fallbacks.slice(0, 3)) {
      items.push({
        id: uid('cand'),
        title: f.title,
        points: f.points,
        relatedHitIds: related.slice(0, 1),
      })
    }
  }

  // 保证 ≥3
  while (items.length < 3) {
    const f = fallbacks[items.length % fallbacks.length]!
    items.push({
      id: uid('cand'),
      title: f.title,
      points: f.points,
      relatedHitIds: related.slice(0, 1),
    })
  }

  return items
}

export const miningActions = {
  toast,

  loadSeedDisclosure() {
    setState({
      disclosure: {
        ...SEED_DISCLOSURE,
        relatedHitIds: [...SEED_DISCLOSURE.relatedHitIds],
      },
    })
    toast('已从种子加载交底')
  },

  clearDisclosure() {
    setState({ disclosure: emptyDisclosure() })
    toast('已清空交底')
  },

  updateDisclosure(patch: Partial<Disclosure>) {
    setState((s) => ({
      ...s,
      disclosure: { ...s.disclosure, ...patch },
    }))
  },

  toggleRelatedHit(hitId: string) {
    setState((s) => {
      const set = new Set(s.disclosure.relatedHitIds)
      if (set.has(hitId)) set.delete(hitId)
      else set.add(hitId)
      return {
        ...s,
        disclosure: { ...s.disclosure, relatedHitIds: [...set] },
      }
    })
  },

  generateCandidates() {
    if (state.generating) return
    const hasText =
      state.disclosure.background.trim() ||
      state.disclosure.techPoints.trim() ||
      state.disclosure.effects.trim()
    if (!hasText) {
      toast('交底为空，请先加载种子或填写技术点')
      return
    }
    setState({ generating: true })
    schedule(() => {
      const candidates = mockDissect(state.disclosure)
      const scores = ensureScores(candidates, [])
      setState({
        candidates,
        scores,
        generating: false,
      })
      toast(`已示意拆解生成 ${candidates.length} 条候选（非真引擎）`)
    }, 600)
  },

  addCandidate() {
    const c: InventionCandidate = {
      id: uid('cand'),
      title: '【示意】新发明点',
      points: '',
      relatedHitIds: state.disclosure.relatedHitIds.slice(0, 1),
    }
    setState((s) => ({
      ...s,
      candidates: [...s.candidates, c],
      scores: [...s.scores, defaultScore(c.id)],
    }))
  },

  updateCandidate(id: string, patch: Partial<InventionCandidate>) {
    setState((s) => ({
      ...s,
      candidates: s.candidates.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }))
  },

  removeCandidate(id: string) {
    setState((s) => ({
      ...s,
      candidates: s.candidates.filter((c) => c.id !== id),
      scores: s.scores.filter((sc) => sc.candidateId !== id),
    }))
    toast('已删除候选')
  },

  setScore(
    candidateId: string,
    dim: 'novelty' | 'value' | 'writability',
    value: number,
  ) {
    const v = Math.max(0, Math.min(5, Math.round(value)))
    setState((s) => ({
      ...s,
      scores: s.scores.map((sc) => {
        if (sc.candidateId !== candidateId) return sc
        const next = { ...sc, [dim]: v }
        next.total = scoreTotal(next.novelty, next.value, next.writability)
        return next
      }),
    }))
  },

  toggleScoreSort() {
    setState((s) => ({ ...s, scoreSortDesc: !s.scoreSortDesc }))
  },

  canSend(): { ok: boolean; reason?: string } {
    if (state.candidates.length === 0) return { ok: false, reason: '候选列表为空' }
    return { ok: true }
  },

  sendHandoff(kind: HandoffKind, candidateIds: string[], note: string) {
    const gate = miningActions.canSend()
    if (!gate.ok) {
      toast(`无法送出：${gate.reason}`)
      return false
    }
    const ids = candidateIds.filter((id) => state.candidates.some((c) => c.id === id))
    if (ids.length === 0) {
      toast('请至少勾选一条候选')
      return false
    }
    const intent = {
      id: uid('intent'),
      kind,
      candidateIds: ids,
      at: nowIso(),
      note: note.trim() || `占位送出 · ${kind} · 不写立案库`,
    }
    setState((s) => ({
      ...s,
      intents: [intent, ...s.intents],
    }))
    toast(`已记录「送${kind}」占位事件（${ids.length} 条）· 不写立案库`)
    return true
  },
}
