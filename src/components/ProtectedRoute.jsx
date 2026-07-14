import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from './ui/Spinner'

export const ProtectedRoute = ({ children }) => {
  const { user, serverRecord, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If we have user/guild but no bot setup in their guild, redirect to NoBot
  if (user && !serverRecord) {
    return <Navigate to="/no-bot" replace />
  }

  return children
}
