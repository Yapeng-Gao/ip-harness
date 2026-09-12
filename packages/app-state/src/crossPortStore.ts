/**
 * Cross-port / multi-tab state sync (Phase 0 harness · prototype honesty).
 *
 * Strategy:
 * 1) persona + workspaceId → cookies (localhost ports share host-only cookies) — real cross-port.
 * 2) Large snapshot (cases / auditLog / flowProgressByCase / docketEvents) → localStorage
 *    + storage event + BroadcastChannel — same origin (same port) multi-tab.
 * 3) Cross-port large state → hidden iframe to mid:5173 `__cross_port_bridge.html` + postMessage
 *    (requires mid to be running). Last-write-wins by revisedAt.
 *
 * Keys MUST come from @ip/contracts crossPortKeys — do not invent string literals.
 */
import {
  APP_DEV_URLS,
  CROSS_PORT_BRIDGE_MESSAGE_TYPE,
  CROSS_PORT_BROADCAST_CHANNEL,
  CROSS_PORT_PERSONA_COOKIE,
  CROSS_PORT_SNAPSHOT_LS_KEY,
  CROSS_PORT_WORKSPACE_COOKIE,
  type PersonaId,
} from '@ip/contracts'
import type { PatentCase, CaseFlowNodeProgress, FlowKey } from '@ip/domain/types'
import type { AuditEntry } from '@ip/domain'
import type { DocketEvent } from '@shared/data/docketRules'

export type CrossPortSnapshotV1 = {
  v: 1
  revisedAt: string
  cases?: PatentCase[]
  auditLog?: AuditEntry[]
  flowProgressByCase?: Record<
    string,
    Partial<Record<FlowKey, CaseFlowNodeProgress>>
  >
  docketEvents?: DocketEvent[]
}

const PERSONA_SET = new Set<PersonaId>([
  'enterprise_ip',
  'agency',
  'inventor',
  'committee',
])

function canUseDom(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

export function readCookie(name: string): string | null {
  if (!canUseDom()) return null
  const parts = document.cookie.split(';')
  for (const part of parts) {
    const idx = part.indexOf('=')
    if (idx < 0) continue
    const k = part.slice(0, idx).trim()
    if (k !== name) continue
    return decodeURIComponent(part.slice(idx + 1).trim())
  }
  return null
}

export function writeCookie(name: string, value: string): void {
  if (!canUseDom()) return
  // path=/ · SameSite=Lax · no Domain → host-only; localhost ports share cookies
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`
}

export function readPersonaCookie(): PersonaId | null {
  const v = readCookie(CROSS_PORT_PERSONA_COOKIE)
  if (v && PERSONA_SET.has(v as PersonaId)) return v as PersonaId
  return null
}

export function writePersonaCookie(persona: PersonaId): void {
  writeCookie(CROSS_PORT_PERSONA_COOKIE, persona)
}

export function readWorkspaceCookie(): string | null {
  const v = readCookie(CROSS_PORT_WORKSPACE_COOKIE)
  return v && v.length > 0 ? v : null
}

export function writeWorkspaceCookie(workspaceId: string): void {
  writeCookie(CROSS_PORT_WORKSPACE_COOKIE, workspaceId)
}

export function readLocalSnapshot(): CrossPortSnapshotV1 | null {
  if (!canUseDom()) return null
  try {
    const raw = localStorage.getItem(CROSS_PORT_SNAPSHOT_LS_KEY)
    if (!raw) return null
    return parseSnapshot(raw)
  } catch {
    return null
  }
}

export function writeLocalSnapshot(snap: CrossPortSnapshotV1): void {
  if (!canUseDom()) return
  try {
    localStorage.setItem(CROSS_PORT_SNAPSHOT_LS_KEY, JSON.stringify(snap))
  } catch {
    /* quota / private mode */
  }
  tryBroadcast(snap)
  tryBridgeSet(snap)
}

function parseSnapshot(raw: string): CrossPortSnapshotV1 | null {
  try {
    const o = JSON.parse(raw) as CrossPortSnapshotV1
    if (!o || o.v !== 1 || typeof o.revisedAt !== 'string') return null
    return o
  } catch {
    return null
  }
}

export function pickNewerSnapshot(
  a: CrossPortSnapshotV1 | null,
  b: CrossPortSnapshotV1 | null,
): CrossPortSnapshotV1 | null {
  if (!a) return b
  if (!b) return a
  return a.revisedAt >= b.revisedAt ? a : b
}

type SnapshotListener = (snap: CrossPortSnapshotV1) => void

const listeners = new Set<SnapshotListener>()
let bc: BroadcastChannel | null = null
let bridgeIframe: HTMLIFrameElement | null = null
let bridgeReady = false
let bridgeQueue: CrossPortSnapshotV1[] = []
let bridgeReqId = 0
const pendingGets = new Map<
  number,
  (snap: CrossPortSnapshotV1 | null) => void
>()

function tryBroadcast(snap: CrossPortSnapshotV1): void {
  if (!canUseDom()) return
  try {
    if (!bc) bc = new BroadcastChannel(CROSS_PORT_BROADCAST_CHANNEL)
    bc.postMessage({ type: CROSS_PORT_BRIDGE_MESSAGE_TYPE, snap })
  } catch {
    /* ignore */
  }
}

function ensureBridge(): void {
  if (!canUseDom()) return
  // Mid itself is the hub — no need to iframe self
  try {
    if (window.location.port === '5173' || window.location.origin === APP_DEV_URLS.mid) {
      return
    }
  } catch {
    /* ignore */
  }
  if (bridgeIframe) return
  const iframe = document.createElement('iframe')
  iframe.src = `${APP_DEV_URLS.mid}/__cross_port_bridge.html`
  iframe.title = 'ip-harness cross-port bridge'
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.cssText =
    'position:absolute;width:0;height:0;border:0;visibility:hidden;pointer-events:none'
  iframe.addEventListener('load', () => {
    bridgeReady = true
    for (const snap of bridgeQueue) postToBridge('set', snap)
    bridgeQueue = []
    // pull hub snapshot once ready
    requestBridgeSnapshot()
  })
  document.documentElement.appendChild(iframe)
  bridgeIframe = iframe
}

function postToBridge(
  op: 'get' | 'set',
  snap?: CrossPortSnapshotV1,
): number {
  const id = ++bridgeReqId
  if (!bridgeIframe?.contentWindow) return id
  const msg: Record<string, unknown> = {
    type: CROSS_PORT_BRIDGE_MESSAGE_TYPE,
    op,
    id,
  }
  if (op === 'set' && snap) {
    msg.raw = JSON.stringify(snap)
  }
  try {
    bridgeIframe.contentWindow.postMessage(msg, APP_DEV_URLS.mid)
  } catch {
    /* mid not up */
  }
  return id
}

function tryBridgeSet(snap: CrossPortSnapshotV1): void {
  ensureBridge()
  if (!bridgeIframe) return // we are mid hub
  if (!bridgeReady) {
    bridgeQueue.push(snap)
    return
  }
  postToBridge('set', snap)
}

export function requestBridgeSnapshot(): void {
  ensureBridge()
  if (!bridgeIframe) return
  const id = postToBridge('get')
  pendingGets.set(id, (snap) => {
    if (snap) notifyListeners(snap)
  })
}

function notifyListeners(snap: CrossPortSnapshotV1): void {
  for (const fn of listeners) {
    try {
      fn(snap)
    } catch {
      /* ignore listener errors */
    }
  }
}

function onWindowMessage(ev: MessageEvent): void {
  const d = ev.data as {
    type?: string
    op?: string
    id?: number
    raw?: string | null
    snap?: CrossPortSnapshotV1
  } | null
  if (!d || d.type !== CROSS_PORT_BRIDGE_MESSAGE_TYPE) return
  if (d.op === 'ready') {
    bridgeReady = true
    for (const snap of bridgeQueue) postToBridge('set', snap)
    bridgeQueue = []
    return
  }
  if (d.op === 'get:ok' && typeof d.id === 'number') {
    const cb = pendingGets.get(d.id)
    pendingGets.delete(d.id)
    const snap = typeof d.raw === 'string' ? parseSnapshot(d.raw) : null
    cb?.(snap)
    return
  }
  if (d.op === 'set:ok') return
  // mid hub may broadcast push
  if (d.op === 'push' && typeof d.raw === 'string') {
    const snap = parseSnapshot(d.raw)
    if (snap) {
      try {
        localStorage.setItem(CROSS_PORT_SNAPSHOT_LS_KEY, d.raw)
      } catch {
        /* ignore */
      }
      notifyListeners(snap)
    }
  }
}

function onStorage(ev: StorageEvent): void {
  if (ev.key !== CROSS_PORT_SNAPSHOT_LS_KEY || !ev.newValue) return
  const snap = parseSnapshot(ev.newValue)
  if (snap) notifyListeners(snap)
}

function onBroadcast(ev: MessageEvent): void {
  const d = ev.data as {
    type?: string
    snap?: CrossPortSnapshotV1
  } | null
  if (!d || d.type !== CROSS_PORT_BRIDGE_MESSAGE_TYPE || !d.snap) return
  notifyListeners(d.snap)
}

/**
 * Subscribe to snapshot updates (storage / BroadcastChannel / mid bridge).
 * Returns unsubscribe. Safe to call once from AppProvider.
 */
export function subscribeCrossPortSnapshot(
  listener: SnapshotListener,
): () => void {
  listeners.add(listener)
  if (!canUseDom()) return () => listeners.delete(listener)

  window.addEventListener('storage', onStorage)
  window.addEventListener('message', onWindowMessage)
  try {
    if (!bc) bc = new BroadcastChannel(CROSS_PORT_BROADCAST_CHANNEL)
    bc.addEventListener('message', onBroadcast)
  } catch {
    /* ignore */
  }
  ensureBridge()
  // Mid hub: nothing else. Non-mid: bridge load pulls.

  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('message', onWindowMessage)
    try {
      bc?.removeEventListener('message', onBroadcast)
    } catch {
      /* ignore */
    }
  }
}

/** Honest one-liner for UI / README */
export const CROSS_PORT_LIMITS_ZH =
  '样机：persona/workspace 经 cookie 跨端口共享；全量案件态同端口多 tab 经 localStorage 同步；跨端口全量依赖 mid:5173 bridge（mid 须在跑）。非共享后端。'
