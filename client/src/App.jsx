// Authors: 
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604
// Derek Long - 261161918

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import OwnerDashboard from './pages/OwnerDashboard'
import VotePage from './pages/VotePage'
import BrowseSlotsPage from './pages/BrowseSlotsPage'
import LoginPage from './pages/LoginPage'
import AboutPage from './pages/AboutPage'
import { AuthProvider } from './context/AuthContext';



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/vote/:token" element={<VotePage />} />
          <Route path="/slots" element={<BrowseSlotsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App