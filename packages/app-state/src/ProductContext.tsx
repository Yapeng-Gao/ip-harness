import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ACTIVE_PRODUCT_LS_KEY } from '@ip/contracts'
import type { ActiveProduct } from '@ip/domain/types'

interface ProductContextValue {
  activeProduct: ActiveProduct
  setActiveProduct: (p: ActiveProduct) => void
  switchToSaas: () => void
  switchToAgent: () => void
}

const ProductContext = createContext<ProductContextValue | null>(null)

function readStored(): ActiveProduct {
  try {
    const v = localStorage.getItem(ACTIVE_PRODUCT_LS_KEY)
    if (v === 'saas' || v === 'agent') return v
  } catch {
    /* ignore */
  }
  return 'saas'
}

export function ProductProvider({ children }: { children: ReactNode }) {
  const [activeProduct, setActiveProductState] = useState<ActiveProduct>(readStored)

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_PRODUCT_LS_KEY, activeProduct)
    } catch {
      /* ignore */
    }
  }, [activeProduct])

  const setActiveProduct = useCallback((p: ActiveProduct) => {
    setActiveProductState(p)
  }, [])

  const switchToSaas = useCallback(() => setActiveProductState('saas'), [])
  const switchToAgent = useCallback(() => setActiveProductState('agent'), [])

  const value = useMemo(
    () => ({ activeProduct, setActiveProduct, switchToSaas, switchToAgent }),
    [activeProduct, setActiveProduct, switchToSaas, switchToAgent],
  )

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProduct() {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error('useProduct must be used within ProductProvider')
  return ctx
}
