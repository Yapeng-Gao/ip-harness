import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AiInfraShell } from './layout/AiInfraShell'
import { AiInfraProvider } from './state/AiInfraStore'
import { OverviewPage } from './pages/OverviewPage'
import { GpusPage } from './pages/GpusPage'
import { JobsPage } from './pages/JobsPage'
import { EndpointsPage } from './pages/EndpointsPage'
import { ModelsPage } from './pages/ModelsPage'
import { PipelinesPage } from './pages/PipelinesPage'
import { LoadtestPage } from './pages/LoadtestPage'
import { AlertsPage } from './pages/AlertsPage'

export default function App() {
  return (
    <AiInfraProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AiInfraShell />}>
            <Route index element={<OverviewPage />} />
            <Route path="gpus" element={<GpusPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="jobs/:jobId" element={<JobsPage />} />
            <Route path="endpoints" element={<EndpointsPage />} />
            <Route path="models" element={<ModelsPage />} />
            <Route path="pipelines" element={<PipelinesPage />} />
            <Route path="loadtest" element={<LoadtestPage />} />
            <Route path="alerts" element={<AlertsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AiInfraProvider>
  )
}
