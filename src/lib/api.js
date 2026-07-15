// Direct Base44 backend function endpoint
const FUNCTION_BASE = 'https://6a5226b5047f5c59d961130e.base44.app/api/apps/6a5226b5047f5c59d961130e/functions/discordAuth'

async function request(path, options = {}) {
  const r = await fetch(`${FUNCTION_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || data.message || data.detail || `HTTP ${r.status}`)
  return data
}

function auth(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const api = {
  exchangeCode: (code, redirectUri) =>
    request('?action=callback', {
      method: 'POST',
      body: JSON.stringify({ code, redirect_uri: redirectUri }),
    }),

  getMe: (token) =>
    request('?action=me', { headers: auth(token) }),

  getServer: (guildId, token) =>
    request(`?action=server&guild_id=${guildId}`, { headers: auth(token) }),

  getTournaments: (guildId, token) =>
    request(`?action=tournaments&guild_id=${guildId}`, { headers: auth(token) }),

  getTournamentDetail: (tournamentId, guildId, token) =>
    request(`?action=tournament_detail&tournament_id=${tournamentId}&guild_id=${guildId}`, { headers: auth(token) }),

  getAnalytics: (guildId, token) =>
    request(`?action=analytics&guild_id=${guildId}`, { headers: auth(token) }),

  getPaymentMethods: () => request('?action=payment_methods'),
  submitPayment: (data, token) => request('?action=submit_payment', { method: 'POST', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
  getMyTransactions: (guildId, token) => request(`?action=my_transactions&guild_id=${guildId}`, { headers: { Authorization: `Bearer ${token}` } }),
  updateTournament: (tournamentId, guildId, data, token) => request('?action=update_tournament', {
    method: 'POST',
    body: JSON.stringify({ tournament_id: tournamentId, guild_id: guildId, data }),
    headers: { Authorization: `Bearer ${token}` },
  }),
}
