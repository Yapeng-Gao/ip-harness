import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { isLoggedIn, loginDemo, logoutDemo } from './authSession'

type AuthSessionContextValue = {
  loggedIn: boolean
  /** 写入假会话；失败返回 false */
  login: () => boolean
  logout: () => void
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null)

/** 样机会话共享态（登录闸 + 登录页 + 可选退出） */
export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(() => isLoggedIn())

  const login = useCallback(() => {
    const ok = loginDemo()
    if (ok) setLoggedIn(true)
    return ok
  }, [])

  const logout = useCallback(() => {
    logoutDemo()
    setLoggedIn(false)
  }, [])

  const value = useMemo(
    () => ({ loggedIn, login, logout }),
    [loggedIn, login, logout],
  )

  return (
    <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
  )
}

export function useAuthSession(): AuthSessionContextValue {
  const ctx = useContext(AuthSessionContext)
  if (!ctx) {
    throw new Error('useAuthSession must be used within AuthSessionProvider')
  }
  return ctx
}
