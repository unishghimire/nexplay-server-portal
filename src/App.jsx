import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login          from './pages/Login'
import AuthCallback   from './pages/AuthCallback'
import NoBot          from './pages/NoBot'
import Layout         from './components/Layout'
import Dashboard      from './pages/Dashboard'
import Tournaments    from './pages/Tournaments'
import TournamentDetail from './pages/TournamentDetail'
import Registrations  from './pages/Registrations'
import Analytics      from './pages/Analytics'
import Subscription   from './pages/Subscription'
import Settings       from './pages/Settings'
import GFX            from './pages/GFX'
import OverlayHub     from './pages/overlays/OverlayHub'
import ScoreboardOverlay  from './pages/overlays/ScoreboardOverlay'
import MatchOverlay       from './pages/overlays/MatchOverlay'
import BracketOverlay     from './pages/overlays/BracketOverlay'
import GroupsOverlay      from './pages/overlays/GroupsOverlay'
import InfoBarOverlay     from './pages/overlays/InfoBarOverlay'
import ChampionOverlay    from './pages/overlays/ChampionOverlay'
import RegistrationOverlay from './pages/overlays/RegistrationOverlay'

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

      {/* Public overlay routes (no auth — for OBS browser sources) */}
      <Route path="/overlay/scoreboard/:tournamentId"    element={<ScoreboardOverlay/>} />
      <Route path="/overlay/match/:tournamentId"         element={<MatchOverlay/>} />
      <Route path="/overlay/bracket/:tournamentId"        element={<BracketOverlay/>} />
      <Route path="/overlay/groups/:tournamentId"         element={<GroupsOverlay/>} />
      <Route path="/overlay/infobar/:tournamentId"        element={<InfoBarOverlay/>} />
      <Route path="/overlay/champion/:tournamentId"       element={<ChampionOverlay/>} />
      <Route path="/overlay/registration/:tournamentId"   element={<RegistrationOverlay/>} />

      {/* Protected */}
      <Route element={<PrivateRoute><Layout/></PrivateRoute>}>
        <Route path="/dashboard"         element={<Dashboard/>} />
        <Route path="/tournaments"       element={<Tournaments/>} />
        <Route path="/tournaments/:id"   element={<TournamentDetail/>} />
        <Route path="/registrations"     element={<Registrations/>} />
        <Route path="/analytics"         element={<Analytics/>} />
        <Route path="/subscription"      element={<Subscription/>} />
        <Route path="/settings"          element={<Settings/>} />
        <Route path="/gfx"              element={<GFX/>} />
        <Route path="/overlays"          element={<OverlayHub/>} />
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
