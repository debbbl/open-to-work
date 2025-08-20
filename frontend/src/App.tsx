import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Recruit from './pages/Recruit'
import Candidates from './pages/Candidates'
import Interviews from './pages/Interviews'
import Offers from './pages/Offers'
import Hired from './pages/Hired'
import Onboard from './pages/Onboard'
import Analytics from './pages/Analytics'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/recruit" element={<Recruit />} />
        <Route path="/candidates" element={<Candidates />} />
        <Route path="/interviews" element={<Interviews />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/hired" element={<Hired />} />
        <Route path="/onboard" element={<Onboard />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Layout>
  )
}

export default App