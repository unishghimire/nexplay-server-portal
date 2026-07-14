import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { Trophy, Search } from 'lucide-react'

const STATUS_OPTIONS = ['all','registration_open','registration_closed','groups_generated','scheduled','completed','deleted']
const STATUS_LABELS  = { all:'All', registration_open:'🟢 Open', registration_closed:'🔴 Closed', groups_generated:'🎯 Groups', scheduled:'📅 Scheduled', completed:'🏆 Completed', deleted:'🗑️ Deleted' }
const STATUS_COLORS  = { registration_open:'bg-emerald-500/20 text-emerald-400', registration_closed:'bg-red-500/20 text-red-400', groups_generated:'bg-purple-500/20 text-purple-400', scheduled:'bg-blue-500/20 text-blue-400', completed:'bg-amber-500/20 text-amber-400', deleted:'bg-gray-500/20 text-gray-400' }

export default function Tournaments() {
  const { guild, token } = useAuth()
  const navigate = useNavigate()
  const [all, setAll] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (!guild || !token) return
    api.getTournaments(guild.id, token)
      .then(d => { setAll(d.tournaments||[]); setFiltered(d.tournaments||[]) })
      .catch(console.error).finally(() => setLoading(false))
  }, [guild, token])

  useEffect(() => {
    let list = [...all]
    if (statusFilter !== 'all') list = list.filter(t => t.status === statusFilter)
    if (search) list = list.filter(t => (t.name||'').toLowerCase().includes(search.toLowerCase()) || (t.game||'').toLowerCase().includes(search.toLowerCase()))
    list.sort((a,b) => (b.created_date||'').localeCompare(a.created_date||''))
    setFiltered(list)
  }, [all, search, statusFilter])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tournaments..." className="w-full pl-9 pr-4 py-2.5 bg-[#13131a] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"/>
        </div>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-[#13131a] border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50">
          {STATUS_OPTIONS.map(s=><option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#13131a] rounded-xl border border-white/5">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3"/>
          <p className="text-gray-400 font-medium">No tournaments found</p>
          <p className="text-gray-600 text-sm mt-1">Use <code className="bg-white/5 px-1 rounded">/create_tournament</code> in Discord</p>
        </div>
      ) : (
        <div className="bg-[#13131a] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Name','Game','Status','Teams','Date',''].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(t=>(
                <tr key={t.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{t.name}</p>
                    <p className="text-xs text-gray-600 font-mono">{(t.id||'').substring(0,8)}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{t.game||'—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[t.status]||'bg-gray-500/20 text-gray-400'}`}>
                      {STATUS_LABELS[t.status]||t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{t.registered_count||0}/{t.max_players||'?'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{t.tournament_date||'TBA'}</td>
                  <td className="px-4 py-3">
                    <button onClick={()=>navigate(`/tournaments/${t.id}?guild_id=${guild?.id}`)} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-gray-600 text-right">{filtered.length} of {all.length} tournaments</p>
    </div>
  )
}
