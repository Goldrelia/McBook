// Authors: 
// Aurelia Bouliane - 261118164
// Houman Azari - 261055604

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import OwnerDashboard from './pages/OwnerDashboard'
import VotePage from './pages/VotePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/vote/:token" element={<VotePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App