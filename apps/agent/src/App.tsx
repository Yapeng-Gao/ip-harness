import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@shared/context/AppContext'
import { AgentProvider } from '@shared/context/AgentContext'
import { ProductProvider } from '@shared/context/ProductContext'
import { AppSurfaceLinks } from '@shared/components/AppSurfaceLinks'
import { AgentShell } from './components/AgentShell'
import { AgentHome } from './pages/AgentHome'
import { AgentSessionWorkspace } from './pages/AgentSessionWorkspace'
import { AgentSessionsList } from './pages/AgentSessionsList'
import { AgentCatalogPage } from './pages/AgentCatalogPage'
import { AgentHarnessOverview } from './pages/AgentHarnessOverview'

export default function App() {
  return (
    <AppProvider>
      <AgentProvider>
        <ProductProvider>
          <BrowserRouter>
            <AppSurfaceLinks current="agent" />
            <Routes>
              <Route path="/" element={<Navigate to="/agent" replace />} />
              <Route path="/agent" element={<AgentShell />}>
                <Route index element={<AgentHome />} />
                <Route path="sessions" element={<AgentSessionsList />} />
                <Route path="sessions/:id" element={<AgentSessionWorkspace />} />
                <Route path="agents" element={<AgentCatalogPage />} />
                <Route path="harness" element={<AgentHarnessOverview />} />
                <Route path="skills" element={<Navigate to="/agent/agents" replace />} />
                <Route path="tools" element={<Navigate to="/agent/agents" replace />} />
              </Route>
              <Route path="/ip-agent/*" element={<Navigate to="/agent" replace />} />
              <Route path="/agents" element={<Navigate to="/agent" replace />} />
              <Route path="/agents/*" element={<Navigate to="/agent" replace />} />
            </Routes>
          </BrowserRouter>
        </ProductProvider>
      </AgentProvider>
    </AppProvider>
  )
}
