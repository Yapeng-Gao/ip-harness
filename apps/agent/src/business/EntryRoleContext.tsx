import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useApp } from '@shared/context/AppContext'
import {
  type EntryRole,
  readEntryRole,
  writeEntryRole,
} from './entryRole'

type EntryRoleContextValue = {
  entryRole: EntryRole
  setEntryRole: (role: EntryRole) => void
}

const EntryRoleContext = createContext<EntryRoleContextValue | null>(null)

function initialRole(workspaceKind: string): EntryRole {
  const stored = readEntryRole()
  if (stored) return stored
  // 有 workspace 跟 kind；最终缺省 enterprise（理念默认按企业）
  if (workspaceKind === 'agency') return 'agency'
  return 'enterprise'
}

/**
 * 入口角色共享态（顶栏切换器 + /agent 重定向同源）。
 * 无 localStorage 时跟 workspace.kind；最终缺省 enterprise。
 */
export function EntryRoleProvider({ children }: { children: ReactNode }) {
  const { workspace } = useApp()
  const [entryRole, setEntryRoleState] = useState<EntryRole>(() =>
    initialRole(workspace.kind),
  )

  const setEntryRole = useCallback((role: EntryRole) => {
    writeEntryRole(role)
    setEntryRoleState(role)
  }, [])

  useEffect(() => {
    if (readEntryRole() == null) writeEntryRole(entryRole)
  }, [entryRole])

  const value = useMemo(
    () => ({ entryRole, setEntryRole }),
    [entryRole, setEntryRole],
  )

  return (
    <EntryRoleContext.Provider value={value}>{children}</EntryRoleContext.Provider>
  )
}

export function useEntryRole(): EntryRoleContextValue {
  const ctx = useContext(EntryRoleContext)
  if (!ctx) {
    throw new Error('useEntryRole must be used within EntryRoleProvider')
  }
  return ctx
}
