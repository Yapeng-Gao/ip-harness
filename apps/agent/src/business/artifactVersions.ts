/**
 * 成果「另存版本」· 时间戳副本（样机）
 */

export type ArtifactVersion = {
  savedAt: string
  markdown: string
}

export function formatArtifactSavedAt(at: Date = new Date()): string {
  const hh = String(at.getHours()).padStart(2, '0')
  const mm = String(at.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

export function appendArtifactVersion(input: {
  versions: ArtifactVersion[]
  markdown: string
  at?: Date
}): { versions: ArtifactVersion[]; hint: string } {
  const at = input.at ?? new Date()
  const entry: ArtifactVersion = {
    savedAt: at.toISOString(),
    markdown: input.markdown,
  }
  return {
    versions: [...input.versions, entry],
    hint: `已另存 · ${formatArtifactSavedAt(at)}`,
  }
}

/** 从版本列表取一版 markdown，供「恢复此版」写回 artifactMarkdown */
export function restoreArtifactVersion(input: {
  versions: ArtifactVersion[]
  index: number
}): { markdown: string; hint: string } | null {
  const v = input.versions[input.index]
  if (!v) return null
  return {
    markdown: v.markdown,
    hint: `已恢复 · ${formatArtifactSavedAt(new Date(v.savedAt))}`,
  }
}
