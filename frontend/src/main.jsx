import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Dashboard from './pages/Dashboard'
import ClientList from './pages/ClientList'
import ClientDetail from './pages/ClientDetail'
import WsDemo from './pages/WsDemo'
import TemplateManager from './pages/TemplateManager'
import NavigatorPerformance from './pages/NavigatorPerformance'
import LandlordPerformance from './pages/LandlordPerformance'
import Login from './pages/Login'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<ClientList />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          <Route path="ws-demo" element={<WsDemo />} />
          <Route path="templates" element={<TemplateManager />} />
          <Route path="login" element={<Login />} />
          <Route path="navigator-performance" element={<NavigatorPerformance />} />
          <Route path="landlord-performance" element={<LandlordPerformance />} />
        </Route>
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
