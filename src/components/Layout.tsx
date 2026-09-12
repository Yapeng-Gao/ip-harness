import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { PersonaRouteGate } from './PersonaRouteGate'

export function Layout() {
  return (
    <div className="app-shell-bg flex h-full min-h-screen">
      <a href="#main" className="skip-link">
        跳到主要内容
      </a>
      <Sidebar />
      <main
        id="main"
        tabIndex={-1}
        className="app-shell-bg flex min-h-0 flex-1 flex-col overflow-auto outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-accent)]"
      >
        <PersonaRouteGate>
          <Outlet />
        </PersonaRouteGate>
      </main>
    </div>
  )
}
