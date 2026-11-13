import { useEffect, useState } from 'react'
import { isStreamComplete, lineDelayMs, nextStreamShown, visibleDraft } from './demoPace'
import { useDemoPace } from './DemoPaceContext'
import { prefersReducedMotion } from '../lib/motionPref'

/** 按当前速度逐行露出文稿。中止冻结；减少动效时一次铺完。 */
export function useLineStream(lines: string[] | null) {
  const { speed, aborted } = useDemoPace()
  const linesKey = lines?.join('\u0000') ?? ''
  const [epoch, setEpoch] = useState(linesKey)
  const [shown, setShown] = useState(0)
  if (linesKey !== epoch) {
    setEpoch(linesKey)
    setShown(lines && prefersReducedMotion() ? lines.length : 0)
  }

  useEffect(() => {
    if (!lines || lines.length === 0) return
    if (shown >= lines.length) return
    if (aborted) return
    const delay = lineDelayMs(speed, prefersReducedMotion())
    if (delay === 0) return
    const timer = window.setTimeout(() => {
      setShown((n) => nextStreamShown(n, lines.length, false))
    }, delay)
    return () => window.clearTimeout(timer)
  }, [lines, shown, aborted, speed])

  const total = lines?.length ?? 0
  return {
    shown,
    complete: !!lines && isStreamComplete(shown, total),
    text: visibleDraft(lines ?? [], shown),
  }
}
