import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { Trophy, Users, Zap, Calendar, AlertTriangle, ExternalLink } from 'lucide-react'

const T_STATUS_COLORS = {
  registration_open: 'bg-emerald-500/20 text-emerald-400',
  registration_closed: 'bg-red-500/20 text-red-400',
  groups_generated: 'bg-purple-500/20 text-purple-400',
  scheduled: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-amber-500/20 text-amber-400',
  deleted: 'bg-gray-500/20 text-gray-400',
}

const T_STATUS_LABELS = {
  registration_open: '🟢 Open',
  registration_closed: '🔴 Closed',
  groups_generated: '🎯 Groups',
  scheduled: '📅 Scheduled',
  completed: '🏆 Completed',
  deleted: '🗑️ Deleted',
}

export default function Dashboard() {
  const { guild, token } = useAuth()
  const navigate = useNavigate()
  const [server, setServer] = useState(null)
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!guild || !token) return
    setLoading(true)
    setError('')

    Promise.all([
      api.getServer(guild.id, token),
      api.getTournaments(guild.id, token)
    ])
      .then(([serverResponse, tournamentsResponse]) => {
        setServer(serverResponse?.server || serverResponse)
        setTournaments(tournamentsResponse?.tournaments || tournamentsResponse || [])
      })
      .catch((err) => {
        console.error(err)
        setError(err.message || 'Failed to load dashboard data.')
      })
      .finally(() => setLoading(false))
  }, [guild, token])

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

  const subStatus = server?.subscription_status || 'trial'
  const used = server?.tournaments_used || 0
  const limit = server?.tournament_limit || 3
  const memberCount = server?.member_count || 0
  const planName = server?.plan_name || 'Free Trial'

  // Sort tournaments and take the last 3
  const recentTournaments = [...tournaments]
    .sort((a, b) => (b.id || '').localeCompare(a.id || ''))
    .slice(0, 3)

  const usagePercentage = limit === Infinity ? 0 : Math.min(100, (used / limit) * 100)

  return (
    <div className="space-y-6">
      {/* Subscription Alert banner */}
      {subStatus === 'trial' && (
        <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-amber-300 text-sm">
              You are on Free Trial — upgrade to unlock more features! ({limit - used} tournaments remaining)
            </p>
          </div>
          <Link
            to="/subscription"
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-lg transition-colors"
          >
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Plan Tier Badge */}
        <div className="bg-[#13131a] border border-white/5 rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-3">
            <Zap className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-sm text-gray-500 font-semibold tracking-wider uppercase">Plan Tier</p>
          <p className="text-2xl font-bold text-white mt-1">{planName}</p>
        </div>

        {/* Subscription Status */}
        <div className="bg-[#13131a] border border-white/5 rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-sm text-gray-500 font-semibold tracking-wider uppercase">Status</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl font-bold text-white capitalize">{subStatus}</span>
          </div>
        </div>

        {/* Member Count */}
        <div className="bg-[#13131a] border border-white/5 rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-sm text-gray-500 font-semibold tracking-wider uppercase">Member Count</p>
          <p className="text-2xl font-bold text-white mt-1">{memberCount.toLocaleString()}</p>
        </div>

        {/* Tournaments Used Limit Bar */}
        <div className="bg-[#13131a] border border-white/5 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-500 font-semibold tracking-wider uppercase">Tournaments Used</span>
              <span className="text-xs font-semibold text-gray-400">
                {used} / {limit === Infinity ? '∞' : limit}
              </span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${limit === Infinity ? 0 : usagePercentage}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {limit === Infinity ? 'Unlimited tournaments' : `${limit - used} remaining in current plan`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tournaments */}
        <div className="lg:col-span-2 bg-[#13131a] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Recent Tournaments</h3>
            <button
              onClick={() => navigate('/tournaments')}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              View all →
            </button>
          </div>
          {recentTournaments.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No tournaments found</p>
              <p className="text-gray-600 text-xs mt-1">Create one using Discord or check other servers.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTournaments.map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/tournaments/${t.id}`)}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/3 hover:bg-white/5 cursor-pointer transition-colors border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    {t.poster_image_url ? (
                      <img
                        src={t.poster_image_url}
                        alt="poster"
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-indigo-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{t.name}</p>
                      <p className="text-xs text-gray-500">
                        {t.game} · {t.tournament_date || 'TBA'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 bg-white/5 text-gray-300 rounded-full">
                      {t.registered_count || 0} / {t.max_players || 16}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full ${
                        T_STATUS_COLORS[t.status] || 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {T_STATUS_LABELS[t.status] || t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Action buttons */}
        <div className="bg-[#13131a] border border-white/5 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold">Quick Actions</h3>
          <div className="flex flex-col gap-2.5">
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/10"
            >
              Create Tournament (Discord) <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() => navigate('/tournaments')}
              className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 text-sm font-semibold transition-colors"
            >
              View All Tournaments
            </button>
            <button
              onClick={() => navigate('/subscription')}
              className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 text-sm font-semibold transition-colors"
            >
              Manage Subscription
            </button>
          </div>

          <div className="pt-4 border-t border-white/5">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Server ID</span>
              <span className="font-mono">{guild?.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
