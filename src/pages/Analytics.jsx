import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const PURPLE = '#6366f1'
const PIE_COLORS = ['#6366f1','#22d3ee','#f59e0b','#34d399','#f87171','#a78bfa','#fb923c']

const STATUS_LABELS = { registration_open:'Open', registration_closed:'Closed', groups_generated:'Groups', scheduled:'Scheduled', completed:'Completed', deleted:'Deleted' }

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-[#13131a] border border-white/5 rounded-xl p-5">
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function Analytics() {
  const { guild, token } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!guild || !token) return
    api.getAnalytics(guild.id, token).then(setData).catch(console.error).finally(()=>setLoading(false))
  }, [guild, token])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>
  if (!data) return <p className="text-gray-500 text-center py-16">Failed to load analytics.</p>

  const { totals, registrations_per_day, game_breakdown, status_breakdown } = data

  const pieData = (status_breakdown||[]).map(s => ({
    name: STATUS_LABELS[s.status] || s.status,
    value: s.count,
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tournaments" value={totals?.tournaments||0} />
        <StatCard label="Total Registrations" value={totals?.registrations||0} />
        <StatCard label="Matches Played" value={totals?.matches||0} />
        <StatCard label="Completed" value={totals?.completed||0} sub={`${totals?.tournaments ? Math.round((totals.completed/totals.tournaments)*100) : 0}% completion rate`} />
      </div>

      {/* Registrations over time */}
      <div className="bg-[#13131a] border border-white/5 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-5">Registrations Over Time (Last 30 days)</h3>
        {(registrations_per_day||[]).length === 0 ? (
          <p className="text-gray-500 text-center py-8 text-sm">No registration data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={registrations_per_day}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill:'#6b7280', fontSize:11 }} tickFormatter={d=>d.substring(5)} />
              <YAxis tick={{ fill:'#6b7280', fontSize:11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor:'#1a1a24', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'#fff' }} />
              <Line type="monotone" dataKey="count" stroke={PURPLE} strokeWidth={2} dot={{ fill:PURPLE, r:3 }} activeDot={{ r:5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Game breakdown */}
        <div className="bg-[#13131a] border border-white/5 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-5">Tournaments by Game</h3>
          {(game_breakdown||[]).length === 0 ? (
            <p className="text-gray-500 text-center py-8 text-sm">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={game_breakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fill:'#6b7280', fontSize:11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="game" tick={{ fill:'#9ca3af', fontSize:11 }} width={80} />
                <Tooltip contentStyle={{ backgroundColor:'#1a1a24', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'#fff' }} />
                <Bar dataKey="count" fill={PURPLE} radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status breakdown */}
        <div className="bg-[#13131a] border border-white/5 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-5">Tournament Status Breakdown</h3>
          {pieData.length === 0 ? (
            <p className="text-gray-500 text-center py-8 text-sm">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor:'#1a1a24', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'#fff' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize:'12px', color:'#9ca3af' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
