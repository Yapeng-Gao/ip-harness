/**
 * 跨案偏好仓 · 可写可读 localStorage（演示级 KB，非真知识库引擎）
 * 与 BusinessCaseContext.preferences 同步：沉淀后也可落到本仓供「进部提示」。
 */
import type { PreferenceRecord } from './judgmentArchive'
import { nowJudgmentStamp } from './judgmentArchive'

export const PREF_STORE_KEY = 'ip-agent-preference-store-v1'

export type StoredPreference = PreferenceRecord & {
  /** 进某部时是否挂提示 */
  applyOnDept?: string | null
  notes?: string
}

type PrefStoreShape = {
  items: StoredPreference[]
  updatedAt: string
}

function emptyStore(): PrefStoreShape {
  return { items: [], updatedAt: nowJudgmentStamp() }
}

export function loadPreferenceStore(): PrefStoreShape {
  try {
    if (typeof localStorage === 'undefined') return emptyStore()
    const raw = localStorage.getItem(PREF_STORE_KEY)
    if (!raw) return emptyStore()
    const parsed = JSON.parse(raw) as PrefStoreShape
    if (!parsed || !Array.isArray(parsed.items)) return emptyStore()
    return { items: parsed.items, updatedAt: parsed.updatedAt || nowJudgmentStamp() }
  } catch {
    return emptyStore()
  }
}

export function savePreferenceStore(items: StoredPreference[]): PrefStoreShape {
  const next: PrefStoreShape = {
    items,
    updatedAt: nowJudgmentStamp(),
  }
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PREF_STORE_KEY, JSON.stringify(next))
    }
  } catch {
    /* demo: ignore quota */
  }
  return next
}

/** 把已沉淀偏好写入跨案仓（去重按 text） */
export function upsertSavedPreferences(prefs: PreferenceRecord[]): StoredPreference[] {
  const store = loadPreferenceStore()
  const byText = new Map(store.items.map((p) => [p.text, p]))
  for (const p of prefs.filter((x) => x.saved)) {
    const prev = byText.get(p.text)
    byText.set(p.text, {
      ...(prev || p),
      ...p,
      saved: true,
      precipitable: false,
      applyOnDept: prev?.applyOnDept ?? null,
      notes: prev?.notes,
    })
  }
  const items = [...byText.values()]
  savePreferenceStore(items)
  return items
}

export function addPreferenceManual(input: {
  text: string
  from?: string
  applyOnDept?: string | null
}): StoredPreference {
  const store = loadPreferenceStore()
  const item: StoredPreference = {
    id: `pref-manual-${Date.now()}`,
    caseId: null,
    text: input.text.slice(0, 160),
    from: input.from || '手动写入',
    precipitable: false,
    saved: true,
    savedAt: nowJudgmentStamp(),
    applyOnDept: input.applyOnDept ?? null,
  }
  const items = [item, ...store.items]
  savePreferenceStore(items)
  return item
}

export function removePreference(id: string): StoredPreference[] {
  const store = loadPreferenceStore()
  const items = store.items.filter((p) => p.id !== id)
  savePreferenceStore(items)
  return items
}

export function setPreferenceDeptHint(
  id: string,
  applyOnDept: string | null,
): StoredPreference[] {
  const store = loadPreferenceStore()
  const items = store.items.map((p) =>
    p.id === id ? { ...p, applyOnDept } : p,
  )
  savePreferenceStore(items)
  return items
}

/** 进部时可读：本案/跨案已沉淀偏好提示条 */
export function prefsHintForDept(deptLabel: string): StoredPreference[] {
  const store = loadPreferenceStore()
  return store.items.filter(
    (p) =>
      p.saved &&
      (!p.applyOnDept ||
        p.applyOnDept === deptLabel ||
        p.text.includes(deptLabel)),
  )
}

export function listSavedPreferences(): StoredPreference[] {
  return loadPreferenceStore().items.filter((p) => p.saved)
}
