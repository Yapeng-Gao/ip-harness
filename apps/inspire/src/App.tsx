import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toast } from './components/ui'
import { InspireShell } from './layout/InspireShell'
import { PromptPage } from './pages/PromptPage'
import { SparksPage } from './pages/SparksPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { SendPage } from './pages/SendPage'
import { useInspireStore } from './state/store'

function AppRoutes() {
  const { toast } = useInspireStore()
  return (
    <>
      <Routes>
        <Route element={<InspireShell />}>
          <Route index element={<PromptPage />} />
          <Route path="sparks" element={<SparksPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
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
