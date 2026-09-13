import { useSyncExternalStore } from 'react'
import { createInitialState } from './seed'
import type {
  InsightKind,
  LandscapeQuery,
  LandscapeResponse,
  LandscapeState,
  OrgProfile,
  SearchHit,
  TaxonomyNode,
} from './types'

let state: LandscapeState = createInitialState()
const listeners = new Set<() => void>()
const timers = new Set<ReturnType<typeof setTimeout>>()

function emit() {
  for (const l of listeners) l()
}

function setState(partial: Partial<LandscapeState> | ((prev: LandscapeState) => LandscapeState)) {
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

function getSnapshot() {
  return state
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useLandscapeStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function getLandscapeState() {
  return state
}

export function showToast(message: string) {
  setState({ toast: message })
  schedule(() => {
    if (state.toast === message) setState({ toast: null })
  }, 3200)
}

export function toggleExpand(nodeId: string) {
  setState((prev) => {
    const next = new Set(prev.expandedIds)
    if (next.has(nodeId)) next.delete(nodeId)
    else next.add(nodeId)
    return { ...prev, expandedIds: next }
  })
}

export function selectNode(nodeId: string | null) {
  setState({ selectedNodeId: nodeId })
}

export function addToBasketPlaceholder(hit: SearchHit) {
  showToast(`已加入工作篮（占位）· ${hit.publicationNumber} · 未跨口同步`)
}

export function childrenOf(parentId: string | null, nodes = state.nodes): TaxonomyNode[] {
  return nodes.filter((n) => n.parentId === parentId)
}

export function getNode(nodeId: string): TaxonomyNode | undefined {
  return state.nodes.find((n) => n.id === nodeId)
}

export function getOrg(orgId: string): OrgProfile | undefined {
  return state.orgs.find((o) => o.id === orgId)
}

export function orgsForNode(nodeId: string): OrgProfile[] {
  const fromEdges = state.partOrgEdges
    .filter((e) => e.partNodeId === nodeId)
    .map((e) => getOrg(e.orgId))
    .filter((o): o is OrgProfile => !!o)
  const fromProfile = state.orgs.filter((o) => o.nodeIds.includes(nodeId))
  const map = new Map<string, OrgProfile>()
  for (const o of [...fromEdges, ...fromProfile]) map.set(o.id, o)
  return [...map.values()]
}

export function insightsForNode(nodeId: string) {
  return state.insights.filter((i) => i.nodeId === nodeId)
}

export function competitorsForNode(nodeId: string): OrgProfile[] {
  const extras = state.nodeExtras[nodeId]
  if (extras?.competitorOrgIds.length) {
    return extras.competitorOrgIds
      .map((id) => getOrg(id))
      .filter((o): o is OrgProfile => !!o)
  }
  const orgs = orgsForNode(nodeId)
  const ids = new Set<string>()
  for (const o of orgs) {
    for (const e of state.orgCompetitorEdges) {
      if (e.orgId === o.id) ids.add(e.competitorOrgId)
      if (e.competitorOrgId === o.id) ids.add(e.orgId)
    }
  }
  return [...ids].map((id) => getOrg(id)).filter((o): o is OrgProfile => !!o)
}

export function hitsForNode(nodeId: string): SearchHit[] {
  const extras = state.nodeExtras[nodeId]
  if (!extras) return []
  return extras.hitIds
    .map((id) => state.hits.find((h) => h.id === id))
    .filter((h): h is SearchHit => !!h)
}

export function pathToRoot(nodeId: string): TaxonomyNode[] {
  const path: TaxonomyNode[] = []
  let cur = getNode(nodeId)
  while (cur) {
    path.unshift(cur)
    cur = cur.parentId ? getNode(cur.parentId) : undefined
  }
  return path
}

/** Agent API 同形状 mock（纯函数，非 HTTP） */
export const landscapeAgentApi = {
  getTree(domain: 'automotive'): LandscapeResponse {
    const query: LandscapeQuery = { domain }
    if (domain !== 'automotive') {
      return { query, tree: [], backend: 'mock' }
    }
    return {
      query,
      tree: state.nodes,
      backend: 'mock',
    }
  },

  getNode(nodeId: string): LandscapeResponse {
    const node = getNode(nodeId)
    const query: LandscapeQuery = { domain: 'automotive', nodeId }
    if (!node) {
      return { query, tree: [], orgs: [], insights: [], hits: [], backend: 'mock' }
    }
    return {
      query,
      tree: [node],
      orgs: orgsForNode(nodeId),
      insights: insightsForNode(nodeId),
      hits: hitsForNode(nodeId),
      backend: 'mock',
    }
  },

  listInsights(kind?: InsightKind): LandscapeResponse {
    const insights = kind ? state.insights.filter((i) => i.kind === kind) : state.insights
    return {
      query: { domain: 'automotive' },
      insights,
      backend: 'mock',
    }
  },
}
