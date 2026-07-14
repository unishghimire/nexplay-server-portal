const BASE = import.meta.env.VITE_API_BASE || ''

async function request(path, options = {}) {
  const r = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || data.message || `HTTP ${r.status}`)
  return data
}

function auth(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const api = {
  exchangeCode: (code, redirectUri) =>
    request('/api/functions/discordAuth?action=callback', {
      method: 'POST',
      body: JSON.stringify({ code, redirect_uri: redirectUri }),
    }),
  getMe: (token) =>
    request('/api/functions/discordAuth?action=me', { headers: auth(token) }),
  getServer: (guildId, token) =>
    request(`/api/functions/discordAuth?action=server&guild_id=${guildId}`, { headers: auth(token) }),
  getTournaments: (guildId, token) =>
    request(`/api/functions/discordAuth?action=tournaments&guild_id=${guildId}`, { headers: auth(token) }),
  getTournamentDetail: (tournamentId, guildId, token) =>
    request(`/api/functions/discordAuth?action=registrations&tournament_id=${tournamentId}&guild_id=${guildId}`, { headers: auth(token) }),
  getAnalytics: (guildId, token) =>
    request(`/api/functions/discordAuth?action=analytics&guild_id=${guildId}`, { headers: auth(token) }),
}
