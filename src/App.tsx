import { Navigate, Route, Routes } from 'react-router-dom'

import { CompanyDashboardPage } from './pages/company-dashboard-page'
import { CompanySelectionPage } from './pages/company-selection-page'

function App() {
  return (
    <Routes>
      <Route element={<CompanySelectionPage />} path="/" />
      <Route element={<CompanyDashboardPage />} path="/companies/:companyId" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}

export default App
