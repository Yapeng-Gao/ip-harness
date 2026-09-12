import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@shared/context/AppContext'
import { AgentProvider } from '@shared/context/AgentContext'
import { ProductProvider } from '@shared/context/ProductContext'
import { IamHome } from './pages/IamHome'
import { IamLoginPage } from './pages/IamLoginPage'

export default function App() {
  return (
    <AppProvider>
      <AgentProvider>
        <ProductProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<IamHome />} />
              <Route path="/login" element={<IamLoginPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ProductProvider>
      </AgentProvider>
    </AppProvider>
  )
}
