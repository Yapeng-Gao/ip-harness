import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  advanceDisplayClock,
  isDemoSpeed,
  loadDemoSpeed,
  saveDemoSpeed,
  type DemoSpeed,
} from './demoPace'

type DemoPaceValue = {
  speed: DemoSpeed
  aborted: boolean
  displayMs: number
  setSpeed: (speed: DemoSpeed) => void
  abort: () => void
  resume: () => void
  beginStream: (key: string, lockHitl: boolean) => void
  finishStream: (key: string) => void
  hitlReady: (key: string) => boolean
  isStreaming: (key: string) => boolean
}

const DemoPaceContext = createContext<DemoPaceValue | null>(null)

export function DemoPaceProvider({ children }: { children: ReactNode }) {
  const [speed, setSpeedState] = useState<DemoSpeed>(() => loadDemoSpeed())
  const [aborted, setAborted] = useState(false)
  const [displayMs, setDisplayMs] = useState(0)
  const [streamingKey, setStreamingKey] = useState<string | null>(null)
  const [hitlLocks, setHitlLocks] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (aborted) return
    let last = performance.now()
    const timer = window.setInterval(() => {
      const now = performance.now()
      const delta = now - last
      last = now
      setDisplayMs((ms) => advanceDisplayClock(ms, delta, speed, false))
    }, 250)
    return () => window.clearInterval(timer)
  }, [aborted, speed])

  const setSpeed = useCallback((next: DemoSpeed) => {
    if (!isDemoSpeed(next)) return
    setSpeedState(next)
    saveDemoSpeed(next)
    setAborted(false)
  }, [])

  const abort = useCallback(() => setAborted(true), [])
  const resume = useCallback(() => setAborted(false), [])

  const beginStream = useCallback((key: string, lockHitl: boolean) => {
    setStreamingKey(key)
    if (lockHitl) {
      setHitlLocks((prev) => ({ ...prev, [key]: false }))
    }
  }, [])

  const finishStream = useCallback((key: string) => {
    setStreamingKey((cur) => (cur === key ? null : cur))
    setHitlLocks((prev) => ({ ...prev, [key]: true }))
  }, [])

  const hitlReady = useCallback(
    (key: string) => hitlLocks[key] !== false,
    [hitlLocks],
  )

  const isStreaming = useCallback(
    (key: string) => streamingKey === key,
    [streamingKey],
  )

  const value = useMemo<DemoPaceValue>(
    () => ({
      speed,
      aborted,
      displayMs,
      setSpeed,
      abort,
      resume,
      beginStream,
      finishStream,
      hitlReady,
      isStreaming,
    }),
    [
      speed,
      aborted,
      displayMs,
      setSpeed,
      abort,
      resume,
      beginStream,
      finishStream,
      hitlReady,
      isStreaming,
    ],
  )

  return <DemoPaceContext.Provider value={value}>{children}</DemoPaceContext.Provider>
}

const fallback: DemoPaceValue = {
  speed: 1,
  aborted: false,
  displayMs: 0,
  setSpeed: () => {},
  abort: () => {},
  resume: () => {},
  beginStream: () => {},
  finishStream: () => {},
  hitlReady: () => true,
  isStreaming: () => false,
}

export function useDemoPace(): DemoPaceValue {
  return useContext(DemoPaceContext) ?? fallback
}
