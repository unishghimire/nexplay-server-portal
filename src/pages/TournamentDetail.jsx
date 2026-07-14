import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { ArrowLeft, Users, Trophy, GitBranch, Swords, Settings } from 'lucide-react'

const STATUS_COLORS = { registration_open:'bg-emerald-500/20 text-emerald-400', registration_closed:'bg-red-500/20 text-red-400', groups_generated:'bg-purple-500/20 text-purple-400', scheduled:'bg-blue-500/20 text-blue-400', completed:'bg-amber-500/20 text-amber-400', deleted:'bg-gray-500/20 text-gray-400' }
const STATUS_LABELS = { registration_open:'🟢 Open', registration_closed:'🔴 Closed', groups_generated:'🎯 Groups', scheduled:'📅 Scheduled', completed:'🏆 Completed', deleted:'🗑️ Deleted' }

const TABS = [
  { id:'teams', label:'Teams', icon:Users },
  { id:'groups', label:'Groups', icon:GitBranch },
  { id:'matches', label:'Matches', icon:Swords },
  { id:'info', label:'Info', icon:Settings },
]

export default function TournamentDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { guild, token } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [tournament, setTournament] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [groups, setGroups] = useState([])
  const [matches, setMatches] = useState([])
  const [tab, setTab] = useState('teams')

  const guildId = searchParams.get('guild_id') || guild?.id

  useEffect(() => {
    if (!id || !guildId || !token) return
    // Get tournament from list
    api.getTournaments(guildId, token).then(d => {
      const t = (d.tournaments||[]).find(t => t.id === id)
      setTournament(t||null)
    })
    api.getTournamentDetail(id, guildId, token).then(d => {
      setRegistrations(d.registrations||[])
      setGroups(d.groups||[])
      setMatches(d.matches||[])
    }).catch(console.error).finally(()=>setLoading(false))
  }, [id, guildId, token])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>

  return (
    <div className="space-y-5">
      <button onClick={()=>navigate('/tournaments')} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
        <ArrowLeft className="w-4 h-4"/> Back to Tournaments
      </button>

      {tournament && (
        <div className="bg-[#13131a] border border-white/5 rounded-xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">{tournament.name}</h2>
              <p className="text-gray-400 text-sm mt-0.5">{tournament.game} · {tournament.format||'Solo'} · Prize: {tournament.prize_pool||'—'}</p>
            </div>
            <span className={`text-sm px-3 py-1 rounded-full ${STATUS_COLORS[tournament.status]||'bg-gray-500/20 text-gray-400'}`}>
              {STATUS_LABELS[tournament.status]||tournament.status}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
            {[
              ['Teams',`${tournament.registered_count||registrations.length}/${tournament.max_players||'?'}`],
              ['Date', tournament.tournament_date||'TBA'],
              ['Time', tournament.tournament_time||'TBA'],
              ['Team Size', tournament.team_size||1],
            ].map(([k,v])=>(
              <div key={k} className="bg-white/3 rounded-lg p-3">
                <p className="text-xs text-gray-500">{k}</p>
                <p className="text-white font-semibold mt-0.5">{v}</p>
              </div>
            ))}
          </div>
          {tournament.description && <p className="text-gray-400 text-sm mt-4 border-t border-white/5 pt-4">{tournament.description}</p>}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#13131a] p-1 rounded-xl border border-white/5 w-fit">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors ${tab===t.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            <t.icon className="w-3.5 h-3.5"/>{t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'teams' && (
        <div className="bg-[#13131a] border border-white/5 rounded-xl overflow-hidden">
          {registrations.length === 0 ? (
            <div className="text-center py-12"><Users className="w-10 h-10 text-gray-600 mx-auto mb-2"/><p className="text-gray-500">No registrations yet</p></div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/5">{['#','Team','Players','Discord','Group','Status'].map(h=><th key={h} className="px-4 py-3 text-left text-xs text-gray-500 uppercase">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-white/5">
                {registrations.map((r,i)=>(
                  <tr key={r.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{r.seed_number||i+1}</td>
                    <td className="px-4 py-2.5 text-white font-medium">{r.player_name}</td>
                    <td className="px-4 py-2.5 text-gray-400 text-xs">{r.player_username||'—'}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{r.player_discord_tag||'—'}</td>
                    <td className="px-4 py-2.5"><span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">{r.group_label||'—'}</span></td>
                    <td className="px-4 py-2.5"><span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">{r.status||'registered'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'groups' && (
        <div>
          {groups.length === 0 ? (
            <div className="text-center py-12 bg-[#13131a] rounded-xl border border-white/5"><GitBranch className="w-10 h-10 text-gray-600 mx-auto mb-2"/><p className="text-gray-500">Groups not generated yet</p><p className="text-gray-600 text-xs mt-1">Use <code className="bg-white/5 px-1 rounded">/generate_groups</code> in Discord</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map(g=>(
                <div key={g.id} className="bg-[#13131a] border border-white/5 rounded-xl p-4">
                  <h4 className="text-white font-bold text-lg mb-3">Group {g.group_label}</h4>
                  <div className="space-y-1.5">
                    {(g.player_names||'').split(',').filter(Boolean).map((name,i)=>(
                      <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-white/3">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center">{i+1}</span>
                        <span className="text-gray-300 text-sm">{name.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'matches' && (
        <div className="bg-[#13131a] border border-white/5 rounded-xl overflow-hidden">
          {matches.length === 0 ? (
            <div className="text-center py-12"><Swords className="w-10 h-10 text-gray-600 mx-auto mb-2"/><p className="text-gray-500">No matches recorded yet</p></div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/5">{['Round','Group','Player 1','Player 2','Winner','Score','Status'].map(h=><th key={h} className="px-4 py-3 text-left text-xs text-gray-500 uppercase">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-white/5">
                {matches.map(m=>(
                  <tr key={m.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-2.5 text-gray-400">R{m.round_number||'?'}</td>
                    <td className="px-4 py-2.5"><span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">{m.group_label||'—'}</span></td>
                    <td className="px-4 py-2.5 text-white">{m.player1_username||'—'}</td>
                    <td className="px-4 py-2.5 text-white">{m.player2_username||'—'}</td>
                    <td className="px-4 py-2.5 text-amber-400 font-medium">{m.winner_username||'—'}</td>
                    <td className="px-4 py-2.5 text-gray-400 text-xs font-mono">{m.player1_score!=null?`${m.player1_score}-${m.player2_score}`:'N/A'}</td>
                    <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full ${m.status==='completed'?'bg-emerald-500/20 text-emerald-400':'bg-blue-500/20 text-blue-400'}`}>{m.status||'pending'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'info' && tournament && (
        <div className="bg-[#13131a] border border-white/5 rounded-xl p-5 space-y-3 text-sm">
          <p className="text-gray-400 text-xs border border-amber-500/20 bg-amber-500/5 rounded-lg px-3 py-2">
            ⚠️ To edit tournament details, use <code className="bg-white/5 px-1 rounded">/edit_tournament</code> in Discord.
          </p>
          {[
            ['Tournament ID', tournament.id],
            ['Name', tournament.name],
            ['Game', tournament.game],
            ['Format', tournament.format],
            ['Team Size', tournament.team_size],
            ['Max Teams', tournament.max_players],
            ['Prize Pool', tournament.prize_pool],
            ['Date', tournament.tournament_date],
            ['Time', tournament.tournament_time],
            ['Short Name', tournament.short_name],
            ['Created', tournament.created_date?.substring(0,10)],
          ].map(([k,v])=>(
            <div key={k} className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-500">{k}</span>
              <span className="text-white text-xs font-mono">{v||'—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
