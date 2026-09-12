import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AiDataShell } from './layout/AiDataShell'
import { OverviewPage } from './pages/OverviewPage'
import { SourcesPage } from './pages/SourcesPage'
import { PipelinesPage } from './pages/PipelinesPage'
import { DatasetsPage } from './pages/DatasetsPage'
import { RecipesPage } from './pages/RecipesPage'
import { QualityPage } from './pages/QualityPage'
import { LineagePage } from './pages/LineagePage'
import { ExportsPage } from './pages/ExportsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AiDataShell />}>
          <Route index element={<OverviewPage />} />
          <Route path="sources" element={<SourcesPage />} />
          <Route path="pipelines" element={<PipelinesPage />} />
          <Route path="datasets" element={<DatasetsPage />} />
          <Route path="recipes" element={<RecipesPage />} />
          <Route path="quality" element={<QualityPage />} />
          <Route path="lineage" element={<LineagePage />} />
          <Route path="exports" element={<ExportsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
