import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { ArrowLeft, Users, Trophy, GitBranch, Swords, Settings, Save, RefreshCw, Image } from 'lucide-react'

const STATUS_COLORS = {
  registration_open:    'bg-emerald-500/20 text-emerald-400',
  registration_closed:  'bg-red-500/20 text-red-400',
  in_progress:          'bg-blue-500/20 text-blue-400',
  groups_generated:     'bg-purple-500/20 text-purple-400',
  completed:            'bg-amber-500/20 text-amber-400',
  cancelled:            'bg-gray-500/20 text-gray-400',
}
const STATUS_LABELS = {
  registration_open:    '🟢 Open',
  registration_closed:  '🔴 Closed',
  in_progress:          '🔵 In Progress',
  groups_generated:     '🎯 Groups Set',
  completed:            '🏆 Completed',
  cancelled:            '⛔ Cancelled',
}
const ALL_STATUSES = Object.keys(STATUS_LABELS)

const TABS = [
  { id: 'teams',   label: 'Teams',   icon: Users },
  { id: 'groups',  label: 'Groups',  icon: GitBranch },
  { id: 'matches', label: 'Matches', icon: Swords },
  { id: 'info',    label: 'Edit',    icon: Settings },
]

function Field({ label, value, onChange, type='text', options, multiline }) {
  const cls = "w-full px-3 py-2 bg-[#0c0c14] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder-gray-600"
  if (options) return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} className={cls}>
        {options.map(o=><option key={o} value={o}>{STATUS_LABELS[o]||o}</option>)}
      </select>
    </div>
  )
  if (multiline) return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <textarea value={value||''} onChange={e=>onChange(e.target.value)} rows={3} className={cls}/>
    </div>
  )
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} className={cls}/>
    </div>
  )
}

export default function TournamentDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { guild, token } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [saveMsg, setSaveMsg]       = useState('')
  const [tournament, setTournament] = useState(null)
  const [registrations, setReg]     = useState([])
  const [groups, setGroups]         = useState([])
  const [matches, setMatches]       = useState([])
  const [tab, setTab]               = useState('teams')
  const [form, setForm]             = useState({})

  const guildId = searchParams.get('guild_id') || guild?.id

  useEffect(() => {
    if (!id || !guildId || !token) return
    api.getTournaments(guildId, token).then(d => {
      const t = (d.tournaments||[]).find(t=>t.id===id)
      setTournament(t||null)
      if (t) setForm({
        name:            t.name||'',
        game:            t.game||'',
        prize_pool:      t.prize_pool||'',
        tournament_date: t.tournament_date||'',
        tournament_time: t.tournament_time||'',
        reg_deadline:    t.reg_deadline||'',
        max_players:     t.max_players||16,
        team_size:       t.team_size||4,
        group_size:      t.group_size||4,
        rounds:          t.rounds||3,
        eligible_nations:t.eligible_nations||'🇳🇵',
        stream_channel:  t.stream_channel||'',
        rules:           t.rules||'',
        description:     t.description||'',
        status:          t.status||'registration_open',
        format:          t.format||'battle_royale',
      })
    })
    api.getTournamentDetail(id, guildId, token).then(d => {
      setReg(d.registrations||[])
      setGroups(d.groups||[])
      setMatches(d.matches||[])
    }).catch(console.error).finally(()=>setLoading(false))
  }, [id, guildId, token])

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const save = async () => {
    setSaving(true)
    setSaveMsg('')
    try {
      await api.updateTournament(id, guildId, form, token)
      setTournament(prev=>({...prev,...form}))
      setSaveMsg('✅ Saved!')
    } catch(e) {
      setSaveMsg('❌ ' + (e.message||'Save failed'))
    }
    setSaving(false)
    setTimeout(()=>setSaveMsg(''),3000)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

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
              <p className="text-gray-400 text-sm mt-0.5">{tournament.game} · {tournament.format||'—'} · Prize: {tournament.prize_pool||'—'}</p>
            </div>
            <span className={`text-sm px-3 py-1 rounded-full ${STATUS_COLORS[tournament.status]||'bg-gray-500/20 text-gray-400'}`}>
              {STATUS_LABELS[tournament.status]||tournament.status}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
            {[
              ['Teams', `${tournament.registered_count||registrations.length}/${tournament.max_players||'?'}`],
              ['Date',  tournament.tournament_date||'TBA'],
              ['Time',  tournament.tournament_time||'TBA'],
              ['Size',  `${tournament.team_size||1}v${tournament.team_size||1}`],
              ['Rounds',tournament.rounds||'—'],
            ].map(([k,v])=>(
              <div key={k} className="bg-white/3 rounded-lg p-3">
                <p className="text-xs text-gray-500">{k}</p>
                <p className="text-white font-semibold mt-0.5 text-sm">{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#13131a] p-1 rounded-xl border border-white/5 w-fit">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors ${tab===t.id?'bg-indigo-600 text-white':'text-gray-400 hover:text-white'}`}>
            <t.icon className="w-3.5 h-3.5"/>{t.label}
          </button>
        ))}
      </div>

      {/* Teams tab */}
      {tab==='teams' && (
        <div className="bg-[#13131a] border border-white/5 rounded-xl overflow-hidden">
          {registrations.length===0 ? (
            <div className="text-center py-12"><Users className="w-10 h-10 text-gray-600 mx-auto mb-2"/><p className="text-gray-500">No registrations yet</p></div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/5">{['#','Logo','Team','Players','Discord','Group','Status'].map(h=><th key={h} className="px-3 py-3 text-left text-xs text-gray-500 uppercase">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-white/5">
                {registrations.map((r,i)=>(
                  <tr key={r.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-3 py-2.5 text-gray-500 text-xs">{r.seed_number||i+1}</td>
                    <td className="px-3 py-2.5">
                      {r.logo_url ? (
                        <img src={r.logo_url} alt="logo" className="w-8 h-8 rounded-full object-cover border border-white/10"/>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                          <Image className="w-4 h-4 text-gray-600"/>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-white font-medium">{r.player_name}</td>
                    <td className="px-3 py-2.5 text-gray-400 text-xs">{(r.team_members||[]).length} players</td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs font-mono">{r.player_discord_id||'—'}</td>
                    <td className="px-3 py-2.5"><span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">{r.group_label||'—'}</span></td>
                    <td className="px-3 py-2.5"><span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">{r.status||'registered'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Groups tab */}
      {tab==='groups' && (
        <div>
          {groups.length===0 ? (
            <div className="text-center py-12 bg-[#13131a] rounded-xl border border-white/5">
              <GitBranch className="w-10 h-10 text-gray-600 mx-auto mb-2"/>
              <p className="text-gray-500">Groups not generated yet</p>
              <p className="text-gray-600 text-xs mt-1">Use <code className="bg-white/5 px-1 rounded">/generate_groups</code> in Discord</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map(g => {
                const names = (g.player_names||'').split(',').filter(Boolean)
                // Match logos from registrations
                const logos = names.map(name => {
                  const reg = registrations.find(r=>r.player_name?.trim()===name.trim())
                  return { name: name.trim(), logo: reg?.logo_url||null }
                })
                return (
                  <div key={g.id} className="bg-[#13131a] border border-white/5 rounded-xl p-4">
                    <h4 className="text-white font-bold text-lg mb-3">Group {g.group_label}</h4>
                    <div className="space-y-1.5">
                      {logos.map((item,i)=>(
                        <div key={i} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg bg-white/3">
                          <span className="text-gray-500 text-xs w-4">{i+1}</span>
                          {item.logo ? (
                            <img src={item.logo} alt="logo" className="w-6 h-6 rounded-full object-cover"/>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                              <span className="text-gray-600 text-xs">{item.name[0]}</span>
                            </div>
                          )}
                          <span className="text-gray-300 text-sm">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Matches tab */}
      {tab==='matches' && (
        <div className="bg-[#13131a] border border-white/5 rounded-xl overflow-hidden">
          {matches.length===0 ? (
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

      {/* Edit / Info tab */}
      {tab==='info' && (
        <div className="space-y-4">
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-indigo-300">
            ✏️ Changes here update the database. The bot's <code className="bg-white/5 px-1 rounded">#info</code> channel will reflect updates on next announce.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#13131a] border border-white/5 rounded-xl p-5">
            <Field label="Tournament Name"       value={form.name}            onChange={v=>set('name',v)}/>
            <Field label="Game"                  value={form.game}            onChange={v=>set('game',v)}/>
            <Field label="Prize Pool"            value={form.prize_pool}      onChange={v=>set('prize_pool',v)}/>
            <Field label="Tournament Date"       value={form.tournament_date} onChange={v=>set('tournament_date',v)}/>
            <Field label="Match Time"            value={form.tournament_time} onChange={v=>set('tournament_time',v)}/>
            <Field label="Registration Deadline" value={form.reg_deadline}    onChange={v=>set('reg_deadline',v)}/>
            <Field label="Max Teams"             value={form.max_players}     onChange={v=>set('max_players',parseInt(v)||16)} type="number"/>
            <Field label="Team Size"             value={form.team_size}       onChange={v=>set('team_size',parseInt(v)||4)}   type="number"/>
            <Field label="Teams Per Group"       value={form.group_size}      onChange={v=>set('group_size',parseInt(v)||4)}  type="number"/>
            <Field label="Number of Rounds"      value={form.rounds}          onChange={v=>set('rounds',parseInt(v)||3)}      type="number"/>
            <Field label="Eligible Nations"      value={form.eligible_nations} onChange={v=>set('eligible_nations',v)}/>
            <Field label="Stream Channel"        value={form.stream_channel}  onChange={v=>set('stream_channel',v)}/>
            <Field label="Status" value={form.status} onChange={v=>set('status',v)} options={ALL_STATUSES}/>
            <div className="sm:col-span-2">
              <Field label="Rules / Notes" value={form.rules} onChange={v=>set('rules',v)} multiline/>
            </div>
            <div className="sm:col-span-2">
              <Field label="Description" value={form.description} onChange={v=>set('description',v)} multiline/>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {saveMsg && <p className="text-sm">{saveMsg}</p>}
            <div className="flex-1"/>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
