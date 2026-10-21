import { Navigate, Route, Routes } from 'react-router-dom'

import { CompanyDashboardPage } from './pages/company-dashboard-page'
import { CompanySelectionPage } from './pages/company-selection-page'
import { CampaignDetailPage } from './pages/campaign-detail-page'
import { SeedBankPage } from './pages/seed-bank-page'
import { SeedCollectionPage } from './pages/seed-collection-page'

function App() {
  return (
    <Routes>
      <Route element={<CompanySelectionPage />} path="/" />
      <Route element={<SeedBankPage />} path="/semillas" />
      <Route element={<SeedCollectionPage />} path="/semillas/:collectionId" />
      <Route element={<CompanyDashboardPage />} path="/organizations/:organizationId" />
      <Route element={<CampaignDetailPage />} path="/organizations/:organizationId/campaigns/:campaignId" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}

export default App
