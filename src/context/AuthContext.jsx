import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../lib/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [session,  setSession]  = useState(null)
  const [guilds,   setGuilds]   = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const activeSession = auth.loadSession()
    if (activeSession) {
      if (auth.isExpired(activeSession.token)) {
        auth.clearSession()
        setSession(null)
      } else {
        setSession(activeSession)
      }
    }
    // Load all guilds from storage
    try {
      const stored = JSON.parse(localStorage.getItem('nexplay_guilds') || '[]')
      setGuilds(stored)
    } catch { setGuilds([]) }
    setIsLoading(false)
  }, [])

  const login = (token, user, guild, serverRecord) => {
    auth.saveSession(token, user, guild, serverRecord)
    setSession({ token, user, guild, serverRecord })
  }

  const logout = () => {
    auth.clearSession()
    setSession(null)
    setGuilds([])
  }

  const updateServerRecord = (newRecord) => {
    if (session) {
      const updatedSession = { ...session, serverRecord: newRecord }
      auth.saveSession(session.token, session.user, session.guild, newRecord)
      setSession(updatedSession)
    }
  }

  // Switch to a different guild (admin/owner of multiple servers)
  const switchServer = (guildId) => {
    const stored = JSON.parse(localStorage.getItem('nexplay_guilds') || '[]')
    const target = stored.find(g => g.id === guildId)
    if (!target || !session) return
    const newGuild = { id: target.id, name: target.name, icon: target.icon }
    const newServerRecord = target.server_record || null
    localStorage.setItem('nexplay_guild',  JSON.stringify(newGuild))
    localStorage.setItem('nexplay_server', JSON.stringify(newServerRecord))
    setSession(prev => ({ ...prev, guild: newGuild, serverRecord: newServerRecord }))
  }

  // Servers user has admin/owner access to AND bot is present
  const adminServers = guilds.filter(g =>
    g.bot_present && (g.is_owner || g.permissions_admin)
  )

  return (
    <AuthContext.Provider value={{
      user:         session?.user         || null,
      guild:        session?.guild        || null,
      serverRecord: session?.serverRecord || null,
      token:        session?.token        || null,
      guilds,
      adminServers,
      isLoading,
      login,
      logout,
      updateServerRecord,
      switchServer,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
