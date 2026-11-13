import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toast } from './components/ui'
import { MiningShell } from './layout/MiningShell'
import { HomePage } from './pages/HomePage'
import { DisclosurePage } from './pages/DisclosurePage'
import { CandidatesPage } from './pages/CandidatesPage'
import { ScorePage } from './pages/ScorePage'
import { SendPage } from './pages/SendPage'
import { useMiningStore } from './state/store'

function AppRoutes() {
  const { toast } = useMiningStore()
  return (
    <>
      <Routes>
        <Route element={<MiningShell />}>
          <Route index element={<HomePage />} />
          <Route path="disclosure" element={<DisclosurePage />} />
          <Route path="candidates" element={<CandidatesPage />} />
          <Route path="score" element={<ScorePage />} />
          <Route path="send" element={<SendPage />} />
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
