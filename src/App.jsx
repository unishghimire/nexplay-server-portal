import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login        from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import NoBot        from './pages/NoBot'
import SelectServer from './pages/SelectServer'
import Layout       from './components/Layout'
import Dashboard    from './pages/Dashboard'
import Tournaments  from './pages/Tournaments'
import TournamentDetail from './pages/TournamentDetail'
import Registrations from './pages/Registrations'
import Analytics    from './pages/Analytics'
import Settings     from './pages/Settings'

function PrivateRoute({ children }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )
  return user ? children : <Navigate to="/" replace/>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"              element={<Login/>} />
      <Route path="/auth/callback" element={<AuthCallback/>} />
      <Route path="/no-bot"        element={<NoBot/>} />
      <Route path="/select-server" element={<SelectServer/>} />

      {/* Protected */}
      <Route element={<PrivateRoute><Layout/></PrivateRoute>}>
        <Route path="/dashboard"               element={<Dashboard/>} />
        <Route path="/tournaments"             element={<Tournaments/>} />
        <Route path="/tournaments/:id"         element={<TournamentDetail/>} />
        <Route path="/registrations"           element={<Registrations/>} />
        <Route path="/analytics"               element={<Analytics/>} />
        <Route path="/settings"                element={<Settings/>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace/>} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes/>
      </BrowserRouter>
    </AuthProvider>
  )
}
