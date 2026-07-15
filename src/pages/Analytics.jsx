import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'
import { Trophy, AlertTriangle } from 'lucide-react'

const COLORS = ['#6366f1', '#a78bfa', '#f43f5e', '#10b981', '#f59e0b', '#06b6d4']

export default function Analytics() {
  const { guild, token } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!guild || !token) return
    setLoading(true)
    setError('')
    api.getAnalytics(guild.id, token)
      .then((res) => {
        setData(res)
      })
      .catch((err) => {
        console.error(err)
        setError(err.message || 'Failed to load analytics.')
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

  // Handle empty state gracefully if no data returned
  if (!data || (!data.totals && (!data.status_breakdown || data.status_breakdown.length === 0))) {
    return (
      <div className="text-center py-16 bg-[#13131a] rounded-xl border border-white/5">
        <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400 font-medium">No analytics data available</p>
        <p className="text-gray-600 text-sm mt-1">Analytics will start showing up once you have registered tournaments and participants.</p>
      </div>
    )
  }

  const { totals, registrations_per_day, game_breakdown, status_breakdown } = data

  const totalTournaments = totals?.tournaments || 0
  const totalRegistrations = totals?.registrations || 0
  const completedCount = totals?.completed || 0
  const completionRate = totalTournaments > 0 ? Math.round((completedCount / totalTournaments) * 100) : 0

  // Formats status list for pie chart
  const pieData = (status_breakdown || []).map((item) => ({
    name: item.status.replace(/_/g, ' ').toUpperCase(),
    value: item.count,
  }))

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 text-sm mt-0.5">Overview of tournament activity and registrations trends on your server.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#13131a] border border-white/5 rounded-xl p-5">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Tournaments</p>
          <p className="text-3xl font-bold text-white mt-1">{totalTournaments}</p>
        </div>
        <div className="bg-[#13131a] border border-white/5 rounded-xl p-5">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Registrations</p>
          <p className="text-3xl font-bold text-indigo-400 mt-1">{totalRegistrations}</p>
        </div>
        <div className="bg-[#13131a] border border-white/5 rounded-xl p-5">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Completion Rate</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">{completionRate}%</p>
        </div>
      </div>

      {/* Registration trend chart */}
      {registrations_per_day && registrations_per_day.length > 0 && (
        <div className="bg-[#13131a] border border-white/5 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Registration Trend Over Time</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrations_per_day}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '11px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.05)' }} />
                <Line type="monotone" dataKey="count" name="Registrations" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Game Breakdown & Status Breakdown charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {game_breakdown && game_breakdown.length > 0 && (
          <div className="bg-[#13131a] border border-white/5 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Tournaments by Game</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={game_breakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="game" stroke="#6b7280" style={{ fontSize: '11px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="count" name="Tournaments" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {pieData.length > 0 && (
          <div className="bg-[#13131a] border border-white/5 rounded-xl p-5 flex flex-col">
            <h3 className="text-white font-semibold mb-4">Tournament Status Breakdown</h3>
            <div className="h-64 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#13131a', border: '1px solid rgba(255,255,255,0.05)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
