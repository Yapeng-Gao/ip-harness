import { Navigate, useLocation } from 'react-router-dom'
import { AgentShell } from '../../components/AgentShell'
import { useAuthSession } from '../../business/AuthSessionContext'

/**
 * 未登录访问 /agent/* → /agent/login；已登录则渲染 AgentShell。
 * 登录页本身不走此闸。
 */
export function RequireAuth() {
  const { loggedIn } = useAuthSession()
  const loc = useLocation()

  if (!loggedIn) {
    return (
      <Navigate
        to="/agent/login"
        replace
        state={{ from: loc.pathname + loc.search }}
      />
    )
  }

  return <AgentShell />
}
