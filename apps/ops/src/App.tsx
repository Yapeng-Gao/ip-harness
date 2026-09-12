import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { OpsShell } from './layout/OpsShell'
import { OverviewPage } from './pages/OverviewPage'
import { LogsPage } from './pages/LogsPage'
import { MonitorPage } from './pages/MonitorPage'
import { ModelsPage } from './pages/ModelsPage'
import { InfraPage } from './pages/InfraPage'
import { ConfigPage } from './pages/ConfigPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<OpsShell />}>
          <Route index element={<OverviewPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="monitor" element={<MonitorPage />} />
          <Route path="models" element={<ModelsPage />} />
          <Route path="infra" element={<InfraPage />} />
          <Route path="config" element={<ConfigPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
