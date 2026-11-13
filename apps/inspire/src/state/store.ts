import { useSyncExternalStore } from 'react'
import { createInitialState, expandSparks } from './seed'
import type { InspireState, SendKind } from './types'

let state: InspireState = createInitialState()
const listeners = new Set<() => void>()
const timers = new Set<ReturnType<typeof setTimeout>>()

function emit() {
  for (const l of listeners) l()
}

function setState(partial: Partial<InspireState> | ((prev: InspireState) => InspireState)) {
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

export function useInspireStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function getInspireState() {
  return state
}

export const inspireActions = {
  toast,

  setPrompt(prompt: string) {
    setState({ prompt })
  },

  /** 激发：短 delay → ≥6 卡；空输入 → empty */
  inspire() {
    if (state.phase === 'expanding') return
    const trimmed = state.prompt.trim()
    if (!trimmed) {
      setState({ phase: 'empty', cards: [] })
      toast('请先输入问题或技术点')
      return
    }
    setState({ phase: 'expanding' })
    const nextBatch = state.batchIndex
    schedule(() => {
      const cards = expandSparks(trimmed, nextBatch)
      setState((s) => {
        const cardCatalog = { ...s.cardCatalog }
        for (const c of cards) cardCatalog[c.id] = c
        return {
          ...s,
          phase: cards.length >= 6 ? 'ready' : 'empty',
          cards,
          cardCatalog,
          batchIndex: nextBatch,
        }
      })
      toast(
        cards.length >= 6
          ? `已扩召 ${cards.length} 张灵感卡（种子拼装 · 非 LLM）`
          : '扩召结果为空',
      )
    }, 480)
  },

  /** 再来一批：新 batchIndex → 新 id / 不同组合，禁止原地改字 */
  nextBatch() {
    if (state.phase === 'expanding') return
    const trimmed = state.prompt.trim()
    if (!trimmed) {
      setState({ phase: 'empty', cards: [] })
      toast('请先输入问题或技术点')
      return
    }
    setState({ phase: 'expanding' })
    const nextBatch = state.batchIndex + 1
    schedule(() => {
      const cards = expandSparks(trimmed, nextBatch)
      setState((s) => {
        const cardCatalog = { ...s.cardCatalog }
        for (const c of cards) cardCatalog[c.id] = c
        return {
          ...s,
          phase: cards.length >= 6 ? 'ready' : 'empty',
          cards,
          cardCatalog,
          batchIndex: nextBatch,
        }
      })
      toast(`已换一批（batch ${nextBatch}）· ${cards.length} 张新卡`)
    }, 420)
  },

  toggleFavorite(cardId: string) {
    setState((s) => {
      const set = new Set(s.favorites)
      if (set.has(cardId)) set.delete(cardId)
      else set.add(cardId)
      return { ...s, favorites: [...set] }
    })
  },

  isFavorite(cardId: string): boolean {
    return state.favorites.includes(cardId)
  },

  sendIntent(kind: SendKind, cardIds: string[], note: string) {
    const ids = cardIds.filter((id) => state.favorites.includes(id))
    if (ids.length === 0) {
      toast('请至少选择一张已收藏的卡片')
      return false
    }
    const intent = {
      id: uid('intent'),
      kind,
      cardIds: ids,
      at: nowIso(),
      note:
        note.trim() ||
        `占位${kind} · ${ids.length} 张卡 · 不写交底案 / 不建挖掘案`,
    }
    setState((s) => ({
      ...s,
      intents: [intent, ...s.intents],
    }))
    toast(`已记录「${kind}」占位事件（${ids.length} 张）· 深链仅打开邻居`)
    return true
  },
}
