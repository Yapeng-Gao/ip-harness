/**
 * 样机节拍：1×/2×/4×、中止、逐行撰写、阶段点、已进行计时。
 * 纯函数，便于单测；不接真实模型。
 */

export type DemoSpeed = 1 | 2 | 4

export const LINE_BASE_MS = 320
export const HANDOFF_BASE_MS = 1600
export const DRAFT_LINE_CAP = 18

export const PIPELINE_STAGES = ['受理', '办理', '撰写', '挑刺', '待确认'] as const

export type DraftStep = {
  label: string
  script: string
  structuredBody?: string
  tool?: { preview: string }
  triggersHitl?: boolean
}

const PACE_LS = 'ip-agent-demo-pace-v1'

export function isDemoSpeed(n: number): n is DemoSpeed {
  return n === 1 || n === 2 || n === 4
}

export function speedFactor(speed: DemoSpeed): number {
  return speed === 2 || speed === 4 ? speed : 1
}

export function loadDemoSpeed(): DemoSpeed {
  try {
    if (typeof localStorage === 'undefined') return 1
    const n = Number(localStorage.getItem(PACE_LS))
    return isDemoSpeed(n) ? n : 1
  } catch {
    return 1
  }
}

export function saveDemoSpeed(speed: DemoSpeed): void {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(PACE_LS, String(speed))
  } catch {
    /* quota */
  }
}

/** 逐行间隔。reduced-motion 为 0，调用方应一次铺完。 */
export function lineDelayMs(speed: DemoSpeed, reducedMotion: boolean): number {
  if (reducedMotion) return 0
  return Math.round(LINE_BASE_MS / speedFactor(speed))
}

/** 楼层上案件牌移动时长。 */
export function handoffDurationMs(speed: DemoSpeed, reducedMotion: boolean): number {
  if (reducedMotion) return 0
  return Math.round(HANDOFF_BASE_MS / speedFactor(speed))
}

export function stepDraftLines(step: DraftStep, index: number): string[] {
  const lines: string[] = []
  const label = step.label.trim()
  if (label) lines.push(`${index + 1}. ${label}`)
  const script = step.script.replace(/\s+/g, ' ').trim()
  if (script) lines.push(script)
  if (step.structuredBody) {
    for (const raw of step.structuredBody.split('\n')) {
      const line = raw.trim()
      if (line) lines.push(line)
    }
  }
  if (step.tool?.preview?.trim()) {
    lines.push(`产出片段：${step.tool.preview.trim()}`)
  }
  if (lines.length > DRAFT_LINE_CAP) {
    return [...lines.slice(0, DRAFT_LINE_CAP - 1), '其余段落写进交付物。']
  }
  return lines
}

export function visibleDraft(lines: string[], shown: number): string {
  const n = Math.max(0, Math.min(Math.floor(shown), lines.length))
  return lines.slice(0, n).join('\n')
}

export function isStreamComplete(shown: number, total: number): boolean {
  return total <= 0 || shown >= total
}

/** 中止时停在当前行；否则露出下一行。 */
export function nextStreamShown(
  shown: number,
  total: number,
  aborted: boolean,
): number {
  if (aborted) return Math.max(0, shown)
  if (total <= 0) return 0
  return Math.min(Math.max(0, shown) + 1, total)
}

export function formatElapsed(ms: number): string {
  const safe = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** 已进行计时按速度累加；中止时冻结。 */
export function advanceDisplayClock(
  prevMs: number,
  deltaRealMs: number,
  speed: DemoSpeed,
  aborted: boolean,
): number {
  const base = Math.max(0, prevMs)
  if (aborted || !(deltaRealMs > 0)) return base
  return base + deltaRealMs * speedFactor(speed)
}

export function pipelineIndex(input: {
  stepIndex: number
  stepCount: number
  pending: boolean
  done: boolean
  streaming: boolean
}): number {
  if (input.pending) return 4
  if (input.done) return 4
  if (input.streaming) return 2
  const count = Math.max(input.stepCount, 1)
  if (input.stepIndex <= 0) return 0
  const ratio = input.stepIndex / count
  if (ratio < 0.34) return 1
  if (ratio < 0.67) return 2
  return 3
}

export function pipelineIndexFromStage(stageId: string, pending: boolean): number {
  if (pending) return 4
  if (stageId === 'oa') return 3
  if (stageId === 'filing' || stageId === 'drafting') return 2
  if (stageId === 'intake') return 1
  return 0
}

export type LobbyFocusInput = {
  id: string
  title: string
  updatedAt: string
  seed: boolean
  pending: boolean
  stageId: string
}

/** 大厅当前任务：优先真人案子，否则有待确认的演示案。 */
export function pickLobbyFocus(rows: LobbyFocusInput[]): LobbyFocusInput | null {
  const byTime = (a: LobbyFocusInput, b: LobbyFocusInput) =>
    a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0
  const real = rows.filter((r) => !r.seed).sort(byTime)
  if (real[0]) return real[0]
  const pending = rows.filter((r) => r.pending).sort(byTime)
  if (pending[0]) return pending[0]
  const rest = [...rows].sort(byTime)
  return rest[0] ?? null
}

const LOBBY_DRAFT_FALLBACK = [
  '前台记下了来意。',
  '房间里的专家还在看材料。',
  '写完会送到你手里确认。',
]

/** 大厅右栏「正在写」用已有文稿拆行，不调用模型。 */
export function scriptedDraftLines(source: string | undefined | null): string[] {
  const lines = (source ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  if (lines.length === 0) return [...LOBBY_DRAFT_FALLBACK]
  return lines.slice(0, 12)
}
