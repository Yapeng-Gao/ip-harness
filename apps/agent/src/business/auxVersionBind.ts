/**
 * 辅链挂件 ↔ 成果版本 / 席步进修订绑定（样机；非官报）
 * Office：稿件修订号、对照某版；禁 CLI / 假官报。
 */
import { formatArtifactSavedAt } from './artifactVersions'
import { SIDE_AUX_BODY_HONEST } from './sideAuxBodyLink'

export const AUX_VERSION_BIND_HONEST =
  '挂件联成果修订 · 样机示意版本 · 非真官报 / 非真递交'

export type AuxRevisionStamp = {
  /** 短码：修订·步2 · 示意v1 */
  revCode: string
  /** 徽章文案 */
  badge: string
  /** 材料树短缀 */
  treeHint: string
  stepIndex: number
  versionCount: number
  viewingVersionIndex: number | null
  seedDiff: boolean
  honest: string
}

export function buildAuxRevisionStamp(input: {
  stepIndex: number
  stepLabel?: string
  versionCount: number
  /** 正在看的另存下标；null=当前稿 */
  viewingVersionIndex?: number | null
  seedDiff?: boolean
  versionSavedAt?: string
}): AuxRevisionStamp {
  const stepIndex = Math.max(0, input.stepIndex)
  const versionCount = Math.max(0, input.versionCount)
  const viewing =
    input.viewingVersionIndex === undefined
      ? null
      : input.viewingVersionIndex
  const seedDiff = !!input.seedDiff
  const stepBit = `步${stepIndex + 1}`
  const stepLabelBit = input.stepLabel ? `·${input.stepLabel}` : ''
  const vBit =
    versionCount > 0 ? `示意v${versionCount}` : '尚无另存'
  let badge: string
  let revCode: string
  let treeHint: string
  if (seedDiff) {
    badge = `差分示意 · ${stepBit}`
    revCode = `修订·${stepBit}·seed对照`
    treeHint = `修订·${stepBit}`
  } else if (viewing !== null && viewing >= 0) {
    const n = viewing + 1
    const at = input.versionSavedAt
      ? formatArtifactSavedAt(new Date(input.versionSavedAt))
      : ''
    badge = `对照修订版 ${n}${at ? ` · ${at}` : ''} · ${stepBit}`
    revCode = `修订·${stepBit}·版${n}`
    treeHint = `对照版${n}`
  } else {
    badge = `本稿修订 · ${stepBit}${stepLabelBit} · ${vBit}`
    revCode = `修订·${stepBit}${versionCount > 0 ? `·v${versionCount}` : ''}`
    treeHint =
      stepIndex > 0 || versionCount > 0
        ? revCode
        : '示意版本'
  }
  return {
    revCode,
    badge,
    treeHint,
    stepIndex,
    versionCount,
    viewingVersionIndex: viewing,
    seedDiff,
    honest: AUX_VERSION_BIND_HONEST,
  }
}

/** 把修订戳写入挂件正文（幂等：先剥旧块再挂） */
export function bindSideAuxBodyToRevision(input: {
  body: string
  stamp: AuxRevisionStamp
  partLabel: string
}): string {
  const stripped = stripAuxRevisionBlock(input.body)
  const block = [
    '## 本稿修订（示意）',
    '',
    `- **修订号** · ${input.stamp.revCode}`,
    `- **状态** · ${input.stamp.badge}`,
    `- **挂件** · ${input.partLabel}`,
    '',
    `> ${AUX_VERSION_BIND_HONEST}`,
    `> ${SIDE_AUX_BODY_HONEST}`,
    '',
  ].join('\n')
  // 插在首个 ## 之前，若无则接在标题后
  const lines = stripped.split('\n')
  const firstH2 = lines.findIndex((l) => /^##\s/.test(l))
  if (firstH2 >= 0) {
    lines.splice(firstH2, 0, block.trimEnd(), '')
    return lines.join('\n')
  }
  return `${stripped.trimEnd()}\n\n${block}`
}

const REV_BLOCK_RE =
  /\n## 本稿修订（示意）[\s\S]*?(?=\n## |\n— |$)/

export function stripAuxRevisionBlock(body: string): string {
  return body.replace(REV_BLOCK_RE, '\n').replace(/\n{3,}/g, '\n\n')
}

export function materialLabelWithRevision(input: {
  baseLabel: string
  stamp: AuxRevisionStamp
  /** 仅当步进或有另存时缀修订 */
  force?: boolean
}): string {
  if (
    !input.force &&
    input.stamp.stepIndex <= 0 &&
    input.stamp.versionCount <= 0 &&
    input.stamp.viewingVersionIndex === null &&
    !input.stamp.seedDiff
  ) {
    return input.baseLabel
  }
  return `${input.baseLabel} · ${input.stamp.treeHint}`
}

/** 从材料 id 解析 version-N */
export function parseVersionMaterialId(
  materialId: string,
): number | null {
  if (!materialId.startsWith('version-')) return null
  const n = Number(materialId.slice('version-'.length))
  return Number.isFinite(n) ? n : null
}
