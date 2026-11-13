import type { ReactNode } from 'react'
import { useStageSku } from '../context/StageSkuContext'
import { StageSkuEmpty } from './StageSkuEmpty'

/**
 * Route gate: entitled → children; else honest empty (Flow not mounted → no handoff writes).
 * home is never gated — callers should not wrap the home route.
 */
export function StageSkuGate({
  moduleId,
  children,
}: {
  moduleId: string
  children: ReactNode
}) {
  const { hasModule } = useStageSku()
  if (moduleId === 'home' || hasModule(moduleId)) {
    return <>{children}</>
  }
  return <StageSkuEmpty moduleId={moduleId} />
}
