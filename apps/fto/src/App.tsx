import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toast } from './components/ui'
import { FtoShell } from './layout/FtoShell'
import { HomePage } from './pages/HomePage'
import { FeaturesPage } from './pages/FeaturesPage'
import { HitsPage } from './pages/HitsPage'
import { MatrixPage } from './pages/MatrixPage'
import { RiskPage } from './pages/RiskPage'
import { ReportPage } from './pages/ReportPage'
import { useFtoStore } from './state/store'

function AppRoutes() {
  const { toast } = useFtoStore()
  return (
    <>
      <Routes>
        <Route element={<FtoShell />}>
          <Route index element={<HomePage />} />
          <Route path="features" element={<FeaturesPage />} />
          <Route path="hits" element={<HitsPage />} />
          <Route path="matrix" element={<MatrixPage />} />
          <Route path="risk" element={<RiskPage />} />
          <Route path="report" element={<ReportPage />} />
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
