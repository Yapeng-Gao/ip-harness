import type { Artifact, CaseDriveItem } from '../types'

export type ProductSource = 'Drive' | '工件'

export type MergedProductRow = {
  key: string
  title: string
  detail: string
  sources: ProductSource[]
  kindLabel: string
  /** Prefer Drive id / artifact id for React keys */
  ids: string[]
}

/** Fold title for fuzzy same-product matching (display-only; does not touch storage). */
export function foldProductTitle(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\.(md|pdf|docx|xlsx|doc|txt)$/i, '')
    .replace(/claim[_\s-]?chart/gi, '对照')
    .replace(/[_/\\·，,。:\s（）()【】\[\]「」""'']+/g, '')
    .replace(/(已)?(提交|批准|授权|确认|评审|草稿|终稿|代理稿|摘要)/g, '')
}

function kindFamily(kindOrType: string): string {
  const k = kindOrType.toLowerCase()
  if (k.includes('claim') || k.includes('对照')) return 'claim_chart'
  if (k.includes('research') || k.includes('报告') || k.includes('洞察')) return 'research'
  if (k.includes('oa') || k.includes('答复') || k.includes('陈述')) return 'oa'
  if (k.includes('approval') || k.includes('批准') || k.includes('策略') || k.includes('纪要'))
    return 'approval'
  if (k.includes('协议') || k.includes('terms') || k.includes('转化')) return 'terms'
  return k || 'other'
}

function titlesLikelySame(a: string, b: string): boolean {
  const fa = foldProductTitle(a)
  const fb = foldProductTitle(b)
  if (!fa || !fb) return false
  if (fa === fb) return true
  if (fa.length >= 4 && fb.length >= 4 && (fa.includes(fb) || fb.includes(fa))) return true
  return false
}

/**
 * Merge case Drive rows + case artifacts for display.
 * Storage stays dual-channel; UI shows one row per logical product with source tags.
 */
export function mergeDriveAndArtifacts(
  drive: CaseDriveItem[],
  artifacts: Artifact[],
): MergedProductRow[] {
  const rows: MergedProductRow[] = []

  const pushOrMerge = (incoming: {
    id: string
    title: string
    detail: string
    source: ProductSource
    kind: string
  }) => {
    const hit = rows.find(
      (r) =>
        titlesLikelySame(r.title, incoming.title) ||
        (kindFamily(r.kindLabel) === kindFamily(incoming.kind) &&
          titlesLikelySame(r.title, incoming.title)),
    )
    if (hit) {
      if (!hit.sources.includes(incoming.source)) hit.sources.push(incoming.source)
      hit.ids.push(incoming.id)
      // Prefer longer / more specific title
      if (incoming.title.length > hit.title.length) hit.title = incoming.title
      if (incoming.detail && incoming.detail.length > hit.detail.length) {
        hit.detail = incoming.detail
      }
      return
    }
    rows.push({
      key: `${incoming.source}-${incoming.id}`,
      title: incoming.title,
      detail: incoming.detail,
      sources: [incoming.source],
      kindLabel: incoming.kind,
      ids: [incoming.id],
    })
  }

  for (const d of drive) {
    pushOrMerge({
      id: d.id,
      title: d.title,
      detail: `${d.kind} · ${d.at}${d.source ? ` · ${d.source}` : ''}${
        d.summary ? ` · ${d.summary}` : ''
      }`,
      source: 'Drive',
      kind: d.kind,
    })
  }
  for (const a of artifacts) {
    pushOrMerge({
      id: a.id,
      title: a.name,
      detail: `${a.type} · 更新于 ${a.updatedAt}`,
      source: '工件',
      kind: a.type,
    })
  }

  return rows
}

/** True if a Drive title is already represented by an agent/session artifact title. */
export function driveDuplicatesArtifactTitle(
  driveTitle: string,
  artifactTitles: string[],
): boolean {
  return artifactTitles.some((t) => titlesLikelySame(driveTitle, t))
}
