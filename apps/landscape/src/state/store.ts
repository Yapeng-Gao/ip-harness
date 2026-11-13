import { useSyncExternalStore } from 'react'
import {
  createInitialState,
  INGEST_APPEND_EDGES,
  INGEST_APPEND_HITS,
} from './seed'
import type {
  Edge,
  InsightKind,
  LandscapeQuery,
  LandscapeResponse,
  LandscapeState,
  OrgProfile,
  SearchHit,
  StandardDoc,
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

/** 只读切换版本标签（不换底层 seed 数据） */
export function setVersionLabel(versionId: string) {
  const v = state.availableVersions.find((x) => x.id === versionId)
  if (!v) return
  setState({ versionId: v.id, version: v })
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

export function getHit(hitId: string): SearchHit | undefined {
  return state.hits.find((h) => h.id === hitId)
}

export function getStandard(standardId: string): StandardDoc | undefined {
  return state.standards.find((s) => s.id === standardId)
}

export function edgesOfType<T extends Edge['type']>(type: T): Extract<Edge, { type: T }>[] {
  return state.edges.filter((e): e is Extract<Edge, { type: T }> => e.type === type)
}

export function graphCounts() {
  const byType = {
    'part-org': 0,
    'org-competitor': 0,
    'part-hit': 0,
    'node-insight': 0,
    'org-standard': 0,
  } as Record<Edge['type'], number>
  for (const e of state.edges) byType[e.type] += 1
  return {
    nodes: state.nodes.length,
    orgs: state.orgs.length,
    edges: state.edges.length,
    hits: state.hits.length,
    insights: state.insights.length,
    maxDepth: Math.max(0, ...state.nodes.map((n) => n.depth)),
    byType,
  }
}

export function orgsForNode(nodeId: string): OrgProfile[] {
  const fromEdges = edgesOfType('part-org')
    .filter((e) => e.partId === nodeId)
    .map((e) => getOrg(e.orgId))
    .filter((o): o is OrgProfile => !!o)
  const fromProfile = state.orgs.filter((o) => o.nodeIds.includes(nodeId))
  const map = new Map<string, OrgProfile>()
  for (const o of [...fromEdges, ...fromProfile]) map.set(o.id, o)
  return [...map.values()]
}

export function insightsForNode(nodeId: string) {
  const fromEdges = new Set(
    edgesOfType('node-insight')
      .filter((e) => e.nodeId === nodeId)
      .map((e) => e.insightId),
  )
  return state.insights.filter((i) => i.nodeId === nodeId || fromEdges.has(i.id))
}

export function competitorsForOrg(orgId: string): OrgProfile[] {
  const ids = new Set<string>()
  for (const e of edgesOfType('org-competitor')) {
    if (e.a === orgId) ids.add(e.b)
    if (e.b === orgId) ids.add(e.a)
  }
  return [...ids].map((id) => getOrg(id)).filter((o): o is OrgProfile => !!o)
}

export function competitorsForNode(nodeId: string): OrgProfile[] {
  const extras = state.nodeExtras[nodeId]
  if (extras?.competitorOrgIds.length) {
    return extras.competitorOrgIds
      .map((id) => getOrg(id))
      .filter((o): o is OrgProfile => !!o)
  }
  const orgs = orgsForNode(nodeId)
  const map = new Map<string, OrgProfile>()
  for (const o of orgs) {
    for (const c of competitorsForOrg(o.id)) map.set(c.id, c)
  }
  return [...map.values()]
}

export function hitsForNode(nodeId: string): SearchHit[] {
  const fromEdges = edgesOfType('part-hit')
    .filter((e) => e.partId === nodeId)
    .map((e) => getHit(e.hitId))
    .filter((h): h is SearchHit => !!h)
  const extras = state.nodeExtras[nodeId]
  const fromExtras =
    extras?.hitIds
      .map((id) => getHit(id))
      .filter((h): h is SearchHit => !!h) ?? []
  const map = new Map<string, SearchHit>()
  for (const h of [...fromEdges, ...fromExtras]) map.set(h.id, h)
  return [...map.values()]
}

export type NeighborRow = {
  edgeType: Edge['type']
  label: string
  href?: string
  meta?: string
}

/** 节点一度邻居（≥3 类边可列出） */
export function neighborsForNode(nodeId: string): NeighborRow[] {
  const rows: NeighborRow[] = []
  for (const e of edgesOfType('part-org')) {
    if (e.partId !== nodeId) continue
    const org = getOrg(e.orgId)
    if (!org) continue
    rows.push({
      edgeType: 'part-org',
      label: org.name,
      href: `/orgs/${org.id}`,
      meta: e.role ?? '供应/自研',
    })
  }
  for (const e of edgesOfType('part-hit')) {
    if (e.partId !== nodeId) continue
    const hit = getHit(e.hitId)
    if (!hit) continue
    rows.push({
      edgeType: 'part-hit',
      label: hit.publicationNumber,
      meta: hit.title,
    })
  }
  for (const e of edgesOfType('node-insight')) {
    if (e.nodeId !== nodeId) continue
    const ins = state.insights.find((i) => i.id === e.insightId)
    if (!ins) continue
    rows.push({
      edgeType: 'node-insight',
      label: ins.title,
      href: `/insights?kind=${ins.kind}#${ins.id}`,
      meta: ins.kind,
    })
  }
  // 一度：节点上企业的竞品
  for (const org of orgsForNode(nodeId)) {
    for (const c of competitorsForOrg(org.id)) {
      rows.push({
        edgeType: 'org-competitor',
        label: `${org.name} ↔ ${c.name}`,
        href: `/orgs/${c.id}`,
        meta: '竞品',
      })
    }
  }
  return rows
}

/** 企业一度邻居 */
export function neighborsForOrg(orgId: string): NeighborRow[] {
  const rows: NeighborRow[] = []
  for (const e of edgesOfType('part-org')) {
    if (e.orgId !== orgId) continue
    const node = getNode(e.partId)
    if (!node) continue
    rows.push({
      edgeType: 'part-org',
      label: node.name,
      href: `/nodes/${node.id}`,
      meta: e.role ?? `L${node.depth}`,
    })
  }
  for (const c of competitorsForOrg(orgId)) {
    rows.push({
      edgeType: 'org-competitor',
      label: c.name,
      href: `/orgs/${c.id}`,
      meta: '竞品',
    })
  }
  for (const e of edgesOfType('org-standard')) {
    if (e.orgId !== orgId) continue
    const std = getStandard(e.standardId)
    rows.push({
      edgeType: 'org-standard',
      label: std ? `${std.code} · ${std.title}` : e.standardId,
      meta: e.relation ?? '标准',
    })
  }
  const org = getOrg(orgId)
  if (org?.holdingOf) {
    const parent = getOrg(org.holdingOf)
    if (parent) {
      rows.push({
        edgeType: 'part-org',
        label: `持股示意 → ${parent.name}`,
        href: `/orgs/${parent.id}`,
        meta: '持股/集团',
      })
    }
  }
  if (org?.groupId) {
    const peers = state.orgs.filter((o) => o.groupId === org.groupId && o.id !== org.id)
    for (const p of peers) {
      rows.push({
        edgeType: 'part-org',
        label: `同集团 · ${p.name}`,
        href: `/orgs/${p.id}`,
        meta: org.groupId,
      })
    }
  }
  return rows
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

/**
 * 假 ingest：推进进度 → done，并追加预置 Hit/边（仅一次）。
 * 可见计数：hits / edges 增加。
 */
export function runIngestTask(taskId: string) {
  const task = state.ingestTasks.find((t) => t.id === taskId)
  if (!task || task.status === 'running') return
  if (task.status === 'done' && state.ingestAppended) {
    showToast('该假任务已完成 · 预置包已追加过（刷新可重置）')
    return
  }

  setState((prev) => ({
    ...prev,
    ingestTasks: prev.ingestTasks.map((t) =>
      t.id === taskId
        ? { ...t, status: 'running', progress: 8, note: '假推进中 · 未接真爬虫' }
        : t,
    ),
  }))

  const steps = [28, 52, 78, 100]
  steps.forEach((p, i) => {
    schedule(() => {
      setState((prev) => {
        const done = p >= 100
        let hits = prev.hits
        let edges = prev.edges
        let nodeExtras = prev.nodeExtras
        let ingestAppended = prev.ingestAppended
        if (done && !prev.ingestAppended) {
          const hitIds = new Set(prev.hits.map((h) => h.id))
          const newHits = INGEST_APPEND_HITS.filter((h) => !hitIds.has(h.id))
          hits = [...prev.hits, ...newHits]
          edges = [...prev.edges, ...INGEST_APPEND_EDGES]
          ingestAppended = true
          // 同步 nodeExtras hitIds，便于摘要计数
          nodeExtras = { ...prev.nodeExtras }
          for (const e of INGEST_APPEND_EDGES) {
            if (e.type !== 'part-hit') continue
            const cur = nodeExtras[e.partId] ?? {
              hitIds: [],
              competitorOrgIds: [],
              patentByYear: [],
              patentByIpc: [],
            }
            if (!cur.hitIds.includes(e.hitId)) {
              nodeExtras[e.partId] = { ...cur, hitIds: [...cur.hitIds, e.hitId] }
            }
          }
          showToast(
            `假入库完成 · Hit +${newHits.length} · 边 +${INGEST_APPEND_EDGES.length}（内存）`,
          )
        }
        return {
          ...prev,
          hits,
          edges,
          nodeExtras,
          ingestAppended,
          ingestTasks: prev.ingestTasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  progress: p,
                  status: done ? 'done' : 'running',
                  note: done
                    ? '已追加预置 Hit/边到内存图 · 刷新即失 · 非真爬取'
                    : '假推进中 · 未接真爬虫',
                }
              : t,
          ),
        }
      })
    }, 400 * (i + 1))
  })
}

/** Agent API 同形状 mock（纯函数，非 HTTP）；backend 恒 seed-graph */
export const landscapeAgentApi = {
  getTree(domain: 'automotive'): LandscapeResponse {
    const query: LandscapeQuery = { domain }
    if (domain !== 'automotive') {
      return { query, tree: [], backend: 'seed-graph', version: state.version }
    }
    return {
      query,
      tree: state.nodes,
      version: state.version,
      backend: 'seed-graph',
    }
  },

  getNode(nodeId: string): LandscapeResponse {
    const node = getNode(nodeId)
    const query: LandscapeQuery = { domain: 'automotive', nodeId }
    if (!node) {
      return {
        query,
        tree: [],
        orgs: [],
        insights: [],
        hits: [],
        edges: [],
        version: state.version,
        backend: 'seed-graph',
      }
    }
    return {
      query,
      tree: [node],
      orgs: orgsForNode(nodeId),
      insights: insightsForNode(nodeId),
      hits: hitsForNode(nodeId),
      edges: state.edges.filter(
        (e) =>
          (e.type === 'part-org' && e.partId === nodeId) ||
          (e.type === 'part-hit' && e.partId === nodeId) ||
          (e.type === 'node-insight' && e.nodeId === nodeId),
      ),
      version: state.version,
      backend: 'seed-graph',
    }
  },

  listInsights(kind?: InsightKind): LandscapeResponse {
    const insights = kind ? state.insights.filter((i) => i.kind === kind) : state.insights
    return {
      query: { domain: 'automotive' },
      insights,
      version: state.version,
      backend: 'seed-graph',
    }
  },
}
