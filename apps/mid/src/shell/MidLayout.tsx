import { Outlet } from 'react-router-dom'
import { PersonaRouteGate } from '@shared/components/PersonaRouteGate'
import { MidSidebar } from './MidSidebar'

export function MidLayout() {
  return (
    <div className="flex h-full min-h-screen bg-slate-50">
      <a href="#main" className="skip-link">
        跳到主要内容
      </a>
      <MidSidebar />
      <main
        id="main"
        tabIndex={-1}
        className="flex min-h-0 flex-1 flex-col overflow-auto bg-slate-50 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400"
      >
        <PersonaRouteGate>
          <Outlet />
        </PersonaRouteGate>
      </main>
    </div>
  )
}
