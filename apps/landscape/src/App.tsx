import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toast } from './components/ui'
import { LandscapeShell } from './layout/LandscapeShell'
import { DomainPage } from './pages/DomainPage'
import { TreePage } from './pages/TreePage'
import { NodePage } from './pages/NodePage'
import { OrgPage } from './pages/OrgPage'
import { InsightsPage } from './pages/InsightsPage'
import { IngestPage } from './pages/IngestPage'
import { useLandscapeStore } from './state/store'

function AppRoutes() {
  const { toast } = useLandscapeStore()
  return (
    <>
      <Routes>
        <Route element={<LandscapeShell />}>
          <Route index element={<DomainPage />} />
          <Route path="tree" element={<TreePage />} />
          <Route path="nodes/:nodeId" element={<NodePage />} />
          <Route path="orgs/:orgId" element={<OrgPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="ingest" element={<IngestPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {toast ? <Toast message={toast} /> : null}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
