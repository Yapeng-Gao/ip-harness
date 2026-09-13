import { useSyncExternalStore } from 'react'
import { buildFamilies, createInitialHits, SEED_HITS } from './seed'
import type {
  AdvancedRow,
  EventLogEntry,
  SearchFilters,
  SearchHit,
  SearchMode,
  SearchResponse,
  SearchState,
} from './types'
import { emptyFilters } from './types'
import {
  applyFilters,
  buildQuery,
  runScoring,
  validateQuery,
} from '../lib/searchEngine'

let state: SearchState = {
  mode: 'keyword',
  text: '',
  advancedRows: [
    { id: 'row-1', field: 'title', value: '' },
    { id: 'row-2', field: 'applicant', value: '' },
  ],
  filters: emptyFilters(true),
  status: 'idle',
  error: null,
  forceNextFail: false,
  hits: [],
  families: [],
  lastQuery: null,
  lastResponse: null,
  selectedHitId: null,
  basketIds: [],
  savedIds: [],
  events: [],
  toast: null,
  limit: 50,
}

const listeners = new Set<() => void>()
const timers = new Set<ReturnType<typeof setTimeout>>()
const corpus: SearchHit[] = createInitialHits()

function emit() {
  for (const l of listeners) l()
}

function setState(partial: Partial<SearchState> | ((prev: SearchState) => SearchState)) {
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
  }, 2800)
}

function pushEvent(entry: Omit<EventLogEntry, 'id' | 'at'> & { at?: string }) {
  const full: EventLogEntry = {
    id: uid('evt'),
    at: entry.at ?? nowIso(),
    action: entry.action,
    tool: entry.tool,
    note: entry.note,
    hitIds: entry.hitIds,
    hits: entry.hits,
    payload: entry.payload,
  }
  setState((s) => ({ ...s, events: [full, ...s.events].slice(0, 40) }))
}

function getSnapshot() {
  return state
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useSearchStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export const searchActions = {
  setMode(mode: SearchMode) {
    setState({ mode, error: null })
  },
  setText(text: string) {
    setState({ text, error: null })
  },
  setAdvancedRows(rows: AdvancedRow[]) {
    setState({ advancedRows: rows, error: null })
  },
  addAdvancedRow() {
    setState((s) => ({
      ...s,
      advancedRows: [
        ...s.advancedRows,
        { id: uid('row'), field: 'abstract', value: '' },
      ],
    }))
  },
  removeAdvancedRow(id: string) {
    setState((s) => ({
      ...s,
      advancedRows: s.advancedRows.length <= 1 ? s.advancedRows : s.advancedRows.filter((r) => r.id !== id),
    }))
  },
  updateAdvancedRow(id: string, patch: Partial<AdvancedRow>) {
    setState((s) => ({
      ...s,
      advancedRows: s.advancedRows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      error: null,
    }))
  },
  setFilters(filters: SearchFilters) {
    setState({ filters })
  },
  patchFilters(patch: Partial<SearchFilters>) {
    setState((s) => ({ ...s, filters: { ...s.filters, ...patch } }))
  },
  clearFilters() {
    setState((s) => ({
      ...s,
      filters: emptyFilters(s.filters.collapseFamily ?? true),
    }))
  },
  toggleCollapseFamily() {
    setState((s) => ({
      ...s,
      filters: {
        ...s.filters,
        collapseFamily: !(s.filters.collapseFamily ?? true),
      },
    }))
  },
  setForceNextFail(v: boolean) {
    setState({ forceNextFail: v })
  },
  clearError() {
    setState({ error: null, status: state.status === 'error' ? 'idle' : state.status })
  },
  dismissError() {
    setState({ error: null, status: 'idle' })
  },
  openHit(id: string) {
    setState({ selectedHitId: id })
    const h = [...corpus, ...state.hits].find((x) => x.id === id)
    pushEvent({
      action: 'openDetail',
      tool: 'search.get',
      hitIds: [id],
      hits: h
        ? [{ id: h.id, publicationNumber: h.publicationNumber, title: h.title }]
        : undefined,
      note: '打开详情抽屉',
      payload: { id },
    })
  },
  closeHit() {
    setState({ selectedHitId: null })
  },
  addToBasket(id: string) {
    if (state.basketIds.includes(id)) {
      toast('已在工作篮')
      return
    }
    const h = findHit(id)
    setState((s) => ({ ...s, basketIds: [...s.basketIds, id] }))
    pushEvent({
      action: 'basket.add',
      tool: 'search.basket.add',
      hitIds: [id],
      hits: h
        ? [{ id: h.id, publicationNumber: h.publicationNumber, title: h.title }]
        : undefined,
      note: '加入工作篮',
      payload: { ids: [id] },
    })
    toast('已加入工作篮')
  },
  removeFromBasket(id: string) {
    setState((s) => ({ ...s, basketIds: s.basketIds.filter((x) => x !== id) }))
    pushEvent({
      action: 'basket.remove',
      tool: 'search.basket.remove',
      hitIds: [id],
      note: '移出工作篮',
      payload: { ids: [id] },
    })
  },
  toggleSaved(id: string) {
    setState((s) => {
      const has = s.savedIds.includes(id)
      return {
        ...s,
        savedIds: has ? s.savedIds.filter((x) => x !== id) : [...s.savedIds, id],
      }
    })
    pushEvent({
      action: 'save',
      tool: 'search.saved.toggle',
      hitIds: [id],
      note: '收藏夹（仅内存，不写案）',
      payload: { id },
    })
  },
  sendToAgent() {
    if (state.basketIds.length === 0) return
    const hits = state.basketIds
      .map((id) => findHit(id))
      .filter((h): h is SearchHit => !!h)
      .map((h) => ({
        id: h.id,
        publicationNumber: h.publicationNumber,
        title: h.title,
      }))
    pushEvent({
      action: 'sendToAgent',
      tool: 'search.sendToAgent',
      hitIds: [...state.basketIds],
      hits,
      note: '样机事件·未真派发',
      payload: { hitIds: [...state.basketIds] },
    })
    toast('已记录送 Agent（样机·未真派发）')
  },
  getFamily(familyId: string) {
    const members = corpus.filter((h) => h.familyId === familyId)
    pushEvent({
      action: 'getFamily',
      tool: 'cluster_hits',
      hitIds: members.map((m) => m.id),
      hits: members.map((m) => ({
        id: m.id,
        publicationNumber: m.publicationNumber,
        title: m.title,
      })),
      note: 'getFamily ≡ cluster_hits / get_family',
      payload: { familyId },
    })
    return { familyId, members }
  },
  /** Apply filters to last response hits without full re-score, or re-run if we have a query. */
  applyFiltersNow() {
    if (state.lastQuery) {
      searchActions.runSearch({ fromFilters: true })
    }
  },
  runSearch(opts?: { fromFilters?: boolean }) {
    const err = validateQuery(state.mode, state.text, state.advancedRows)
    if (err) {
      setState({ error: err, status: 'error' })
      return
    }
    const query = buildQuery({
      mode: state.mode,
      text: state.text,
      advancedRows: state.advancedRows,
      filters: state.filters,
      limit: state.limit,
    })
    setState({ status: 'running', error: null, lastQuery: query })
    const delay = 280 + Math.floor(Math.random() * 170)
    schedule(() => {
      if (state.forceNextFail) {
        const failResp: SearchResponse = {
          query,
          hits: [],
          families: [],
          tookMs: delay,
          backend: 'mock',
        }
        setState({
          status: 'error',
          error: '注入故障：下次强制失败（样机）',
          forceNextFail: false,
          hits: [],
          families: [],
          lastResponse: failResp,
        })
        pushEvent({
          action: 'search',
          tool: 'commercial_patent_search',
          note: 'search failed (injected)',
          payload: { query, backend: 'mock' },
        })
        return
      }
      const scored = runScoring(
        corpus,
        query.mode,
        query.text ?? '',
        query.advanced,
      )
      const filtered = applyFilters(scored, query.filters ?? {}).slice(0, query.limit ?? 50)
      const families = buildFamilies(filtered)
      const response: SearchResponse = {
        query,
        hits: filtered,
        families,
        tookMs: delay,
        backend: 'mock',
      }
      setState({
        status: filtered.length > 0 ? 'done' : 'empty',
        hits: filtered,
        families,
        lastResponse: response,
        error: null,
        // default collapse on after first search if undefined
        filters: {
          ...state.filters,
          collapseFamily: state.filters.collapseFamily ?? true,
        },
      })
      pushEvent({
        action: 'search',
        tool: 'commercial_patent_search',
        note: opts?.fromFilters ? '过滤后重跑' : 'runSearch',
        hitIds: filtered.map((h) => h.id),
        payload: { query, backend: 'mock', hitCount: filtered.length },
      })
    }, delay)
  },
}

function findHit(id: string): SearchHit | undefined {
  return state.hits.find((h) => h.id === id) || corpus.find((h) => h.id === id)
}

export function getCorpus(): SearchHit[] {
  return corpus
}

export function getSeedStats() {
  const fam = new Set(SEED_HITS.map((h) => h.familyId).filter(Boolean))
  const multi = [...fam].filter(
    (f) => SEED_HITS.filter((h) => h.familyId === f).length >= 2,
  )
  return { hitCount: SEED_HITS.length, familyCount: fam.size, multiFamilyCount: multi.length }
}
