import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState('')

  useEffect(() => {
    const params     = new URLSearchParams(window.location.search)
    const code       = params.get('code')
    const errorParam = params.get('error')

    if (errorParam) { setError('Discord login was cancelled or denied.'); return }
    if (!code)      { setError('No authorization code received.'); return }

    const redirectUri = import.meta.env.VITE_REDIRECT_URI || window.location.origin + '/auth/callback'

    api.exchangeCode(code, redirectUri)
      .then(data => {
        const { token, user, guilds, bot_invite_url } = data

        localStorage.setItem('nexplay_auth_token', token)
        localStorage.setItem('nexplay_user',       JSON.stringify(user))
        localStorage.setItem('nexplay_guilds',     JSON.stringify(guilds))
        localStorage.setItem('nexplay_bot_invite', bot_invite_url || '')

        // Always pick the first guild that has the bot, or the first guild overall
        // Prefer a server the user owns with bot, else first with bot, else first overall
        const ownedWithBot  = guilds.find(g => g.bot_present && g.is_owner)
        const adminWithBot  = guilds.find(g => g.bot_present && g.permissions_admin)
        const anyWithBot    = guilds.find(g => g.bot_present)
        const chosen        = ownedWithBot || adminWithBot || anyWithBot || guilds[0]

        if (chosen) {
          localStorage.setItem('nexplay_guild',  JSON.stringify({ id: chosen.id, name: chosen.name, icon: chosen.icon }))
          localStorage.setItem('nexplay_server', JSON.stringify(chosen.server_record || null))
          login(token, user, { id: chosen.id, name: chosen.name, icon: chosen.icon }, chosen.server_record)
        }

        const hasBotServers = guilds.filter(g => g.bot_present)
        if (hasBotServers.length === 0) {
          navigate('/no-bot')
        } else {
          navigate('/dashboard')
        }
      })
      .catch(err => {
        console.error(err)
        setError(err.message || 'Login failed. Please try again.')
      })
  }, [])

  if (error) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-red-400 text-lg font-semibold mb-2">Login Failed</p>
        <p className="text-gray-400 text-sm mb-6">{error}</p>
        <button onClick={() => navigate('/')}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition-colors">
          Try Again
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-400 text-sm">Logging you in with Discord...</p>
      </div>
    </div>
  )
}
