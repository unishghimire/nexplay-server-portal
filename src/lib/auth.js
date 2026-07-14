const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID || '1525463657843261591'
const REDIRECT_URI      = import.meta.env.VITE_REDIRECT_URI      || 'https://nexplay-server-portal.vercel.app/auth/callback'

export const auth = {
  startDiscordOAuth() {
    const params = new URLSearchParams({
      client_id:     DISCORD_CLIENT_ID,
      redirect_uri:  REDIRECT_URI,
      response_type: 'code',
      scope:         'identify guilds',
    })
    window.location.href = `https://discord.com/api/oauth2/authorize?${params}`
  },

  saveSession(token, user, guild, serverRecord) {
    localStorage.setItem('nexplay_auth_token',   token)
    localStorage.setItem('nexplay_user',         JSON.stringify(user))
    localStorage.setItem('nexplay_guild',        JSON.stringify(guild))
    localStorage.setItem('nexplay_server',       JSON.stringify(serverRecord))
  },

  loadSession() {
    try {
      const token       = localStorage.getItem('nexplay_auth_token')
      const user        = JSON.parse(localStorage.getItem('nexplay_user'))
      const guild       = JSON.parse(localStorage.getItem('nexplay_guild'))
      const serverRecord= JSON.parse(localStorage.getItem('nexplay_server'))
      if (!token || !user) return null
      return { token, user, guild, serverRecord }
    } catch { return null }
  },

  clearSession() {
    ['nexplay_auth_token','nexplay_user','nexplay_guild',
     'nexplay_server','nexplay_guilds','nexplay_bot_invite'].forEach(k => localStorage.removeItem(k))
  },

  isExpired(token) {
    if (!token) return true
    try {
      const parts = token.split('.')
      if (parts.length < 3) return false
      const payload = JSON.parse(atob(parts[1]))
      return payload.exp && payload.exp < Date.now()
    } catch { return false }
  }
}
