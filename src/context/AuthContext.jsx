import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../lib/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
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
    setIsLoading(false)
  }, [])

  const login = (token, user, guild, serverRecord) => {
    auth.saveSession(token, user, guild, serverRecord)
    setSession({ token, user, guild, serverRecord })
  }

  const logout = () => {
    auth.clearSession()
    setSession(null)
  }

  const updateServerRecord = (newRecord) => {
    if (session) {
      const updatedSession = { ...session, serverRecord: newRecord }
      auth.saveSession(session.token, session.user, session.guild, newRecord)
      setSession(updatedSession)
    }
  }

  return (
    <AuthContext.Provider value={{
      user: session?.user || null,
      guild: session?.guild || null,
      serverRecord: session?.serverRecord || null,
      token: session?.token || null,
      isLoading,
      login,
      logout,
      updateServerRecord
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
