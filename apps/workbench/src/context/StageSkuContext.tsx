import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  DEFAULT_STAGE_SKUS,
  isModuleEntitled,
  pathToStageModuleId,
  readStoredStageSkus,
  skuForModuleId,
  writeStoredStageSkus,
  type StageSkuId,
  type TenantEntitlements,
} from '../lib/stageSku'

type StageSkuApi = {
  entitlements: TenantEntitlements
  setStageSkus: (skus: StageSkuId[]) => void
  toggleSku: (sku: StageSkuId, enabled: boolean) => void
  hasSku: (sku: StageSkuId) => boolean
  hasModule: (moduleId: string) => boolean
  isPathAllowed: (pathname: string) => boolean
}

const StageSkuContext = createContext<StageSkuApi | null>(null)

function initialEntitlements(): TenantEntitlements {
  const stored = readStoredStageSkus()
  return {
    tenantId: 'demo-tenant',
    stageSkus: stored ?? [...DEFAULT_STAGE_SKUS],
  }
}

export function StageSkuProvider({ children }: { children: ReactNode }) {
  const [entitlements, setEntitlements] = useState<TenantEntitlements>(initialEntitlements)

  const setStageSkus = useCallback((skus: StageSkuId[]) => {
    setEntitlements((prev) => {
      const next = { ...prev, stageSkus: skus }
      writeStoredStageSkus(skus)
      return next
    })
  }, [])

  const toggleSku = useCallback((sku: StageSkuId, enabled: boolean) => {
    setEntitlements((prev) => {
      const set = new Set(prev.stageSkus)
      if (enabled) set.add(sku)
      else set.delete(sku)
      const stageSkus = [...set]
      writeStoredStageSkus(stageSkus)
      return { ...prev, stageSkus }
    })
  }, [])

  const value = useMemo<StageSkuApi>(() => {
    const hasSku = (sku: StageSkuId) => entitlements.stageSkus.includes(sku)
    const hasModule = (moduleId: string) => isModuleEntitled(moduleId, entitlements)
    const isPathAllowed = (pathname: string) => {
      const id = pathToStageModuleId(pathname)
      if (id == null) return true
      return hasModule(id)
    }
    return {
      entitlements,
      setStageSkus,
      toggleSku,
      hasSku,
      hasModule,
      isPathAllowed,
    }
  }, [entitlements, setStageSkus, toggleSku])

  return <StageSkuContext.Provider value={value}>{children}</StageSkuContext.Provider>
}

export function useStageSku(): StageSkuApi {
  const ctx = useContext(StageSkuContext)
  if (!ctx) {
    throw new Error('useStageSku must be used within StageSkuProvider')
  }
  return ctx
}

/** Optional hook that returns null outside provider (for shared bars). */
export function useStageSkuOptional(): StageSkuApi | null {
  return useContext(StageSkuContext)
}

export { skuForModuleId }
