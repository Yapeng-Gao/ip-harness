import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  seedCompanyActivityIfEmpty,
  subscribeCompanyActivity,
  clearCompanyActivity,
  type CompanyActivityEvent,
} from './companyActivity'

type CompanyActivityValue = {
  events: CompanyActivityEvent[]
  clear: () => void
}

const CompanyActivityContext = createContext<CompanyActivityValue | null>(null)

export function CompanyActivityProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CompanyActivityEvent[]>(() => seedCompanyActivityIfEmpty())

  useEffect(() => subscribeCompanyActivity(setEvents), [])

  const value = useMemo<CompanyActivityValue>(
    () => ({
      events,
      clear: () => clearCompanyActivity(),
    }),
    [events],
  )

  return (
    <CompanyActivityContext.Provider value={value}>
      {children}
    </CompanyActivityContext.Provider>
  )
}

export function useCompanyActivity(): CompanyActivityValue {
  const ctx = useContext(CompanyActivityContext)
  if (!ctx) {
    return { events: [], clear: () => {} }
  }
  return ctx
}
