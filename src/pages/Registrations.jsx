import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { Search, Users, AlertTriangle, Download, Image } from 'lucide-react'

export default function Registrations() {
  const { guild, token } = useAuth()
  const [tournaments, setTournaments] = useState([])
  const [selectedTournamentId, setSelectedTournamentId] = useState('')
  const [regs, setRegs] = useState([])
  const [filteredRegs, setFilteredRegs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  // Load tournaments on mount
  useEffect(() => {
    if (!guild || !token) return
    setLoading(true)
    setError('')
    api.getTournaments(guild.id, token)
      .then((d) => {
        const list = d.tournaments || d || []
        setTournaments(list)
        if (list.length > 0) {
          setSelectedTournamentId(list[0].id)
        } else {
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error(err)
        setError(err.message || 'Failed to load tournaments.')
        setLoading(false)
      })
  }, [guild, token])

  // Load registrations when tournament selection changes
  useEffect(() => {
    if (!selectedTournamentId || !guild || !token) return
    setLoading(true)
    setError('')
    api.getTournamentDetail(selectedTournamentId, guild.id, token)
      .then((d) => {
        setRegs(d.registrations || [])
      })
      .catch((err) => {
        console.error(err)
        setError(err.message || 'Failed to load registrations.')
      })
      .finally(() => setLoading(false))
  }, [selectedTournamentId, guild, token])

  // Filter registrations based on search query
  useEffect(() => {
    let list = [...regs]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((r) =>
        (r.player_name || '').toLowerCase().includes(q) ||
        (r.player_discord_id || '').toLowerCase().includes(q)
      )
    }
    setFilteredRegs(list)
  }, [regs, search])

  // Calculate Registration stats
  const totalRegistered = regs.length
  const confirmedRegs = regs.filter((r) => (r.status || '').toLowerCase() === 'confirmed' || (r.status || '').toLowerCase() === 'registered').length
  const pendingRegs = regs.filter((r) => (r.status || '').toLowerCase() === 'pending').length

  const selectedT = tournaments.find((t) => t.id === selectedTournamentId)

  // Export registrations data to CSV
  const exportToCSV = () => {
    if (filteredRegs.length === 0) return

    const headers = ['Seed Number', 'Player/Team Name', 'Discord ID', 'Team Members', 'Group Label', 'Status', 'Registered At']
    const rows = filteredRegs.map((r, idx) => [
      r.seed_number || idx + 1,
      `"${(r.player_name || '').replace(/"/g, '""')}"`,
      `"${r.player_discord_id || ''}"`,
      `"${Array.isArray(r.team_members) ? r.team_members.join(', ').replace(/"/g, '""') : (r.team_members || '').replace(/"/g, '""')}"`,
      `"${r.group_label || ''}"`,
      `"${r.status || 'registered'}"`,
      `"${r.registered_at || ''}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${selectedT?.name || 'registrations'}_export.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-2" />
        <p className="text-red-300 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selector & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">
          <select
            value={selectedTournamentId}
            onChange={(e) => setSelectedTournamentId(e.target.value)}
            className="px-4 py-2.5 bg-[#13131a] border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50"
          >
            {tournaments.length === 0 ? (
              <option>No tournaments found</option>
            ) : (
              tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))
            )}
          </select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team or Discord ID..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#13131a] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>
        <button
          onClick={exportToCSV}
          disabled={filteredRegs.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#13131a] border border-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Registered</p>
          <p className="text-2xl font-bold text-white mt-1">{totalRegistered}</p>
        </div>
        <div className="bg-[#13131a] border border-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Confirmed</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{confirmedRegs}</p>
        </div>
        <div className="bg-[#13131a] border border-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{pendingRegs}</p>
        </div>
      </div>

      {/* Tournament Info Capsule */}
      {selectedT && (
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 bg-[#13131a] rounded-xl border border-white/5 text-sm">
          <div className="flex items-center gap-4 text-gray-400">
            <span>Tournament: <strong className="text-white">{selectedT.name}</strong></span>
            <span>Game: <strong className="text-white">{selectedT.game}</strong></span>
          </div>
          <span className="text-indigo-400 font-medium">
            Slots fill: {totalRegistered} / {selectedT.max_players || 16} teams
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredRegs.length === 0 ? (
        <div className="text-center py-16 bg-[#13131a] rounded-xl border border-white/5">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-500 font-medium">No registrations match filters</p>
        </div>
      ) : (
        <div className="bg-[#13131a] border border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/2 text-gray-500 font-semibold text-xs uppercase">
                  {['#', 'Logo', 'Player / Team Name', 'Discord ID', 'Team Members', 'Group', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRegs.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">{r.seed_number || i + 1}</td>
                    <td className="px-4 py-3">
                      {r.logo_url ? (
                        <img
                          src={r.logo_url}
                          alt="Logo"
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                          <Image className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{r.player_name}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{r.player_discord_id || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {Array.isArray(r.team_members) ? r.team_members.join(', ') : r.team_members || 'Solo'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-medium">
                        {r.group_label || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          (r.status || '').toLowerCase() === 'pending'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {r.status || 'registered'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
