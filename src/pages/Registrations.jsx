import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { Search, Users } from 'lucide-react'

export default function Registrations() {
  const { guild, token } = useAuth()
  const [tournaments, setTournaments] = useState([])
  const [selected, setSelected] = useState('')
  const [regs, setRegs] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const PER_PAGE = 50

  useEffect(() => {
    if (!guild || !token) return
    api.getTournaments(guild.id, token).then(d => {
      const list = d.tournaments || []
      setTournaments(list)
      if (list.length > 0) setSelected(list[0].id)
    }).catch(console.error)
  }, [guild, token])

  useEffect(() => {
    if (!selected || !guild || !token) return
    setLoading(true)
    api.getTournamentDetail(selected, guild.id, token)
      .then(d => { setRegs(d.registrations||[]); setPage(0) })
      .catch(console.error).finally(() => setLoading(false))
  }, [selected, guild, token])

  useEffect(() => {
    let list = [...regs]
    if (search) list = list.filter(r =>
      (r.player_name||'').toLowerCase().includes(search.toLowerCase()) ||
      (r.player_username||'').toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(list)
    setPage(0)
  }, [regs, search])

  const pageData = filtered.slice(page * PER_PAGE, (page+1)*PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const selectedT = tournaments.find(t => t.id === selected)

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <select value={selected} onChange={e=>setSelected(e.target.value)} className="px-4 py-2.5 bg-[#13131a] border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50">
          {tournaments.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search teams or players..." className="w-full pl-9 pr-4 py-2.5 bg-[#13131a] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"/>
        </div>
      </div>

      {selectedT && (
        <div className="flex items-center gap-4 px-4 py-2.5 bg-[#13131a] rounded-xl border border-white/5 text-sm">
          <span className="text-gray-400">{selectedT.name}</span>
          <span className="text-indigo-400">{regs.length} / {selectedT.max_players} teams</span>
          <span className="text-gray-500">{selectedT.game}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>
      ) : regs.length === 0 ? (
        <div className="text-center py-16 bg-[#13131a] rounded-xl border border-white/5">
          <Users className="w-10 h-10 text-gray-600 mx-auto mb-2"/>
          <p className="text-gray-500">No registrations for this tournament</p>
        </div>
      ) : (
        <>
          <div className="bg-[#13131a] border border-white/5 rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5">
                  {['#','Team Name','Players','Discord','Group','Registered','Status'].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pageData.map((r,i)=>(
                  <tr key={r.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{r.seed_number||(page*PER_PAGE+i+1)}</td>
                    <td className="px-4 py-2.5 text-white font-medium">{r.player_name}</td>
                    <td className="px-4 py-2.5 text-gray-400 text-xs max-w-[180px] truncate">{r.player_username||'—'}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{r.player_discord_tag||'—'}</td>
                    <td className="px-4 py-2.5"><span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">{r.group_label||'—'}</span></td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{r.registered_at?r.registered_at.substring(0,16).replace('T',' '):'—'}</td>
                    <td className="px-4 py-2.5"><span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">{r.status||'registered'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-500 text-xs">{filtered.length} registrations</p>
              <div className="flex gap-2">
                <button disabled={page===0} onClick={()=>setPage(p=>p-1)} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition-colors">← Prev</button>
                <span className="px-3 py-1.5 text-gray-500 text-xs">{page+1} / {totalPages}</span>
                <button disabled={page>=totalPages-1} onClick={()=>setPage(p=>p+1)} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition-colors">Next →</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
