import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { Trophy, Search, AlertTriangle } from 'lucide-react'

const STATUS_TABS = ['all', 'registration_open', 'registration_closed', 'groups_generated', 'scheduled', 'completed', 'deleted']
const STATUS_LABELS = {
  all: 'All',
  registration_open: '🟢 Open',
  registration_closed: '🔴 Closed',
  groups_generated: '🎯 Groups Set',
  scheduled: '📅 Scheduled',
  completed: '🏆 Completed',
  deleted: '🗑️ Deleted',
}
const STATUS_COLORS = {
  registration_open: 'bg-emerald-500/20 text-emerald-400',
  registration_closed: 'bg-red-500/20 text-red-400',
  groups_generated: 'bg-purple-500/20 text-purple-400',
  scheduled: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-amber-500/20 text-amber-400',
  deleted: 'bg-gray-500/20 text-gray-400',
}

export default function Tournaments() {
  const { guild, token } = useAuth()
  const navigate = useNavigate()
  const [allTournaments, setAllTournaments] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (!guild || !token) return
    setLoading(true)
    setError('')
    api.getTournaments(guild.id, token)
      .then((d) => {
        const list = d.tournaments || d || []
        setAllTournaments(list)
        setFiltered(list)
      })
      .catch((err) => {
        console.error(err)
        setError(err.message || 'Failed to load tournaments.')
      })
      .finally(() => setLoading(false))
  }, [guild, token])

  useEffect(() => {
    let list = [...allTournaments]

    if (activeTab !== 'all') {
      list = list.filter((t) => t.status === activeTab)
    }

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (t) =>
          (t.name || '').toLowerCase().includes(q) ||
          (t.game || '').toLowerCase().includes(q)
      )
    }

    list.sort((a, b) => (b.id || '').localeCompare(a.id || ''))
    setFiltered(list)
  }, [allTournaments, search, activeTab])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
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
      {/* Title & Search bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tournaments</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage and view all tournaments configured on your server.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or game..."
            className="w-full pl-9 pr-4 py-2 bg-[#13131a] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-[#13131a] p-1 rounded-xl border border-white/5 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {STATUS_LABELS[tab] || tab}
          </button>
        ))}
      </div>

      {/* Tournaments Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#13131a] rounded-xl border border-white/5">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No tournaments found</p>
          <p className="text-gray-600 text-sm mt-1">Use /create_tournament in Discord or try changing your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t) => (
            <div
              key={t.id}
              onClick={() => navigate(`/tournaments/${t.id}`)}
              className="bg-[#13131a] border border-white/5 hover:border-indigo-500/30 rounded-xl overflow-hidden cursor-pointer transition-all hover:translate-y-[-2px] flex flex-col h-full"
            >
              {/* Poster Thumbnail */}
              <div className="relative h-40 w-full bg-[#1e1e2d] flex items-center justify-center overflow-hidden">
                {t.poster_image_url ? (
                  <img
                    src={t.poster_image_url}
                    alt={t.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <Trophy className="w-12 h-12 text-gray-700" />
                )}
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      STATUS_COLORS[t.status] || 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {STATUS_LABELS[t.status] || t.status}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col justify-between flex-1 space-y-4">
                <div>
                  <h3 className="text-white font-semibold text-lg line-clamp-1">{t.name}</h3>
                  <p className="text-gray-500 text-xs mt-0.5 font-medium">{t.game}</p>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <div className="flex flex-col">
                    <span className="text-gray-500">Date</span>
                    <span className="text-gray-300 font-medium mt-0.5">{t.tournament_date || 'TBA'}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-gray-500">Prize Pool</span>
                    <span className="text-indigo-400 font-semibold mt-0.5">{t.prize_pool || 'N/A'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                  <span className="text-xs px-2 py-1 bg-white/5 text-gray-300 rounded-full font-medium">
                    {t.registered_count || 0} / {t.max_players || 16} Players
                  </span>
                  <span className="text-xs text-indigo-400 font-medium hover:underline">Manage & Details →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-600 text-right">{filtered.length} of {allTournaments.length} tournaments</p>
    </div>
  )
}
