import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { ArrowLeft, Users, Trophy, GitBranch, Swords, Settings, Save, AlertTriangle, Image } from 'lucide-react'

const STATUS_COLORS = {
  registration_open: 'bg-emerald-500/20 text-emerald-400',
  registration_closed: 'bg-red-500/20 text-red-400',
  in_progress: 'bg-blue-500/20 text-blue-400',
  groups_generated: 'bg-purple-500/20 text-purple-400',
  completed: 'bg-amber-500/20 text-amber-400',
  cancelled: 'bg-gray-500/20 text-gray-400',
}

const STATUS_LABELS = {
  registration_open: '🟢 Open',
  registration_closed: '🔴 Closed',
  in_progress: '🔵 In Progress',
  groups_generated: '🎯 Groups Set',
  completed: '🏆 Completed',
  cancelled: '⛔ Cancelled',
}

const ALL_STATUSES = Object.keys(STATUS_LABELS)

const TABS = [
  { id: 'overview', label: 'Overview', icon: Trophy },
  { id: 'registrations', label: 'Registrations', icon: Users },
  { id: 'groups', label: 'Groups', icon: GitBranch },
  { id: 'matches', label: 'Matches', icon: Swords },
  { id: 'edit', label: 'Edit', icon: Settings },
]

function Field({ label, value, onChange, type = 'text', options, multiline }) {
  const cls = "w-full px-3 py-2 bg-[#0c0c14] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder-gray-600"
  if (options) return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block font-medium">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className={cls}>
        {options.map(o => <option key={o} value={o}>{STATUS_LABELS[o] || o}</option>)}
      </select>
    </div>
  )
  if (multiline) return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block font-medium">{label}</label>
      <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={3} className={cls} />
    </div>
  )
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block font-medium">{label}</label>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} className={cls} />
    </div>
  )
}

export default function TournamentDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { guild, token } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [tournament, setTournament] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [groups, setGroups] = useState([])
  const [matches, setMatches] = useState([])
  const [tab, setTab] = useState('overview')
  const [form, setForm] = useState({})

  const guildId = searchParams.get('guild_id') || guild?.id

  const loadData = () => {
    if (!id || !guildId || !token) return
    setLoading(true)
    setError('')
    api.getTournamentDetail(id, guildId, token)
      .then((d) => {
        const t = d.tournament
        setTournament(t || null)
        setRegistrations(d.registrations || [])
        setGroups(d.groups || [])
        setMatches(d.matches || [])

        if (t) {
          setForm({
            name: t.name || '',
            game: t.game || '',
            status: t.status || 'registration_open',
            format: t.format || '',
            prize_pool: t.prize_pool || '',
            description: t.description || '',
            rules: t.rules || '',
            stream_channel: t.stream_channel || '',
            eligible_nations: t.eligible_nations || '🇳🇵',
            max_players: t.max_players || 16,
            team_size: t.team_size || 4,
            group_size: t.group_size || 4,
            rounds: t.rounds || 3,
            tournament_date: t.tournament_date || '',
            tournament_time: t.tournament_time || '',
            reg_deadline: t.reg_deadline || '',
            short_name: t.short_name || '',
            category_name: t.category_name || '',
          })
        }
      })
      .catch((err) => {
        console.error(err)
        setError(err.message || 'Failed to load tournament details.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [id, guildId, token])

  const setFormField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveMsg('')
    try {
      await api.updateTournament(id, guildId, form, token)
      setTournament(prev => ({ ...prev, ...form }))
      setSaveMsg('✅ Saved successfully!')
    } catch (err) {
      setSaveMsg('❌ ' + (err.message || 'Save failed'))
    }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 4000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !tournament) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
        <p className="text-red-300 font-medium">{error || 'Tournament not found'}</p>
        <button
          onClick={() => navigate('/tournaments')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors"
        >
          Back to Tournaments
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/tournaments')}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Tournaments
      </button>

      {/* Header card */}
      <div className="bg-[#13131a] border border-white/5 rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{tournament.name}</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {tournament.game} · {tournament.format || 'Standard'} Format
            </p>
          </div>
          <span
            className={`text-sm px-3 py-1 rounded-full font-medium ${
              STATUS_COLORS[tournament.status] || 'bg-gray-500/20 text-gray-400'
            }`}
          >
            {STATUS_LABELS[tournament.status] || tournament.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-[#13131a] p-1 rounded-xl border border-white/5 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#13131a] border border-white/5 rounded-xl p-6 space-y-4">
              <h3 className="text-white font-semibold text-lg">Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Short Name</p>
                  <p className="text-white font-medium mt-0.5">{tournament.short_name || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Category Name</p>
                  <p className="text-white font-medium mt-0.5">{tournament.category_name || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Stream Channel</p>
                  <p className="text-white font-medium mt-0.5">{tournament.stream_channel || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Eligible Nations</p>
                  <p className="text-white font-medium mt-0.5">{tournament.eligible_nations || '—'}</p>
                </div>
                <div className="col-span-2 pt-2">
                  <p className="text-gray-500 mb-1">Description</p>
                  <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                    {tournament.description || 'No description provided.'}
                  </p>
                </div>
                <div className="col-span-2 pt-2 border-t border-white/5">
                  <p className="text-gray-500 mb-1">Rules</p>
                  <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                    {tournament.rules || 'No custom rules specified.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Poster & Secondary Stats */}
          <div className="space-y-6">
            {tournament.poster_image_url && (
              <div className="bg-[#13131a] border border-white/5 rounded-xl p-4">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Poster</p>
                <img
                  src={tournament.poster_image_url}
                  alt="Poster"
                  className="w-full h-auto rounded-lg object-contain max-h-72 border border-white/5"
                />
              </div>
            )}
            {tournament.roadmap_image_url && (
              <div className="bg-[#13131a] border border-white/5 rounded-xl p-4">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Roadmap</p>
                <img
                  src={tournament.roadmap_image_url}
                  alt="Roadmap"
                  className="w-full h-auto rounded-lg object-contain max-h-72 border border-white/5"
                />
              </div>
            )}
            <div className="bg-[#13131a] border border-white/5 rounded-xl p-5 space-y-3 text-sm">
              <h4 className="text-white font-semibold">Tournament Settings</h4>
              <div className="space-y-2">
                {[
                  ['Prize Pool', tournament.prize_pool || 'N/A'],
                  ['Max Players', tournament.max_players || '16'],
                  ['Team Size', tournament.team_size ? `${tournament.team_size}v${tournament.team_size}` : 'Solo'],
                  ['Group Size', tournament.group_size || 'N/A'],
                  ['Rounds', tournament.rounds || 'N/A'],
                  ['Date', tournament.tournament_date || 'TBA'],
                  ['Time', tournament.tournament_time || 'TBA'],
                  ['Registration Deadline', tournament.reg_deadline || '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1 border-b border-white/5 last:border-0">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-white font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'registrations' && (
        <div className="bg-[#13131a] border border-white/5 rounded-xl overflow-hidden">
          {registrations.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500">No registrations yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2">
                    {['#', 'Logo', 'Player/Team Name', 'Team Members', 'Discord ID', 'Registered At', 'Status'].map(
                      (h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {registrations.map((r, i) => (
                    <tr key={r.id || i} className="hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono">{r.seed_number || i + 1}</td>
                      <td className="px-4 py-3">
                        {r.logo_url ? (
                          <img
                            src={r.logo_url}
                            alt="logo"
                            className="w-8 h-8 rounded-full object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                            <Image className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white font-medium">{r.player_name}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {Array.isArray(r.team_members) ? r.team_members.join(', ') : r.team_members || 'Solo'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono">{r.player_discord_id || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {r.registered_at ? r.registered_at.substring(0, 16).replace('T', ' ') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/10">
                          {r.status || 'registered'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'groups' && (
        <div>
          {groups.length === 0 ? (
            <div className="text-center py-12 bg-[#13131a] rounded-xl border border-white/5">
              <GitBranch className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 font-medium">Groups not generated yet</p>
              <p className="text-gray-600 text-xs mt-1">Use group generation tools in Discord to setup pools.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((g, idx) => {
                const names = (g.player_names || '').split(',').filter(Boolean)
                return (
                  <div key={g.id || idx} className="bg-[#13131a] border border-white/5 rounded-xl p-5 space-y-3">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-white font-bold text-lg">{g.group_label || `Group ${idx + 1}`}</span>
                      <span className="text-xs text-gray-500">{names.length} Teams</span>
                    </div>
                    <ul className="space-y-1.5">
                      {names.map((n, i) => (
                        <li key={i} className="text-sm text-gray-300 bg-white/2 rounded px-2 py-1 flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-4 font-mono">{i + 1}.</span>
                          <span className="truncate">{n}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'matches' && (
        <div className="bg-[#13131a] border border-white/5 rounded-xl p-6">
          {matches.length === 0 ? (
            <div className="text-center py-12">
              <Swords className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 font-medium">No matches scheduled</p>
              <p className="text-gray-600 text-xs mt-1">Generate brackets on Discord to see lists and scores.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-white font-semibold">Match Brackets & Lists</h3>
                <span className="text-xs text-gray-500 font-mono">{matches.length} matches total</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map((m, idx) => {
                  const p1Winner = m.winner_id === m.player1_id && m.winner_id
                  const p2Winner = m.winner_id === m.player2_id && m.winner_id

                  return (
                    <div
                      key={m.id || idx}
                      className="bg-white/3 border border-white/5 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-white/10 transition-colors"
                    >
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>
                          Round {m.round_number} · Match {m.match_number}
                        </span>
                        {m.group_label && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-medium">
                            Group {m.group_label}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        {/* Player 1 */}
                        <div
                          className={`flex justify-between items-center p-2 rounded ${
                            p1Winner ? 'bg-indigo-600/20 border border-indigo-500/30' : 'bg-black/20'
                          }`}
                        >
                          <span className={`text-sm truncate ${p1Winner ? 'text-indigo-300 font-semibold' : 'text-gray-300'}`}>
                            {m.player1_username || 'TBD Player 1'}
                          </span>
                          <span className="text-sm font-semibold font-mono text-white px-1">
                            {m.player1_score !== undefined ? m.player1_score : '—'}
                          </span>
                        </div>

                        {/* Player 2 */}
                        <div
                          className={`flex justify-between items-center p-2 rounded ${
                            p2Winner ? 'bg-indigo-600/20 border border-indigo-500/30' : 'bg-black/20'
                          }`}
                        >
                          <span className={`text-sm truncate ${p2Winner ? 'text-indigo-300 font-semibold' : 'text-gray-300'}`}>
                            {m.player2_username || 'TBD Player 2'}
                          </span>
                          <span className="text-sm font-semibold font-mono text-white px-1">
                            {m.player2_score !== undefined ? m.player2_score : '—'}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs pt-1">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            m.status === 'completed'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-indigo-500/10 text-indigo-400'
                          }`}
                        >
                          {m.status || 'Scheduled'}
                        </span>
                        {m.scheduled_at && (
                          <span className="text-gray-500">
                            {m.scheduled_at.substring(0, 16).replace('T', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'edit' && (
        <form onSubmit={save} className="bg-[#13131a] border border-white/5 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h3 className="text-white font-semibold">Tournament Fields</h3>
              <p className="text-gray-500 text-xs mt-0.5">Edit tournament settings, scheduling, and format details.</p>
            </div>
            <div className="flex items-center gap-3">
              {saveMsg && <span className="text-sm text-indigo-300 font-medium">{saveMsg}</span>}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Tournament Name" value={form.name} onChange={(v) => setFormField('name', v)} />
            <Field label="Game" value={form.game} onChange={(v) => setFormField('game', v)} />
            <Field label="Status" value={form.status} onChange={(v) => setFormField('status', v)} options={ALL_STATUSES} />
            <Field label="Format" value={form.format} onChange={(v) => setFormField('format', v)} />
            <Field label="Prize Pool" value={form.prize_pool} onChange={(v) => setFormField('prize_pool', v)} />
            <Field label="Eligible Nations" value={form.eligible_nations} onChange={(v) => setFormField('eligible_nations', v)} />
            <Field label="Stream Channel" value={form.stream_channel} onChange={(v) => setFormField('stream_channel', v)} />
            <Field label="Category Name" value={form.category_name} onChange={(v) => setFormField('category_name', v)} />
            <Field label="Short Name" value={form.short_name} onChange={(v) => setFormField('short_name', v)} />

            <div className="border-t border-white/5 md:col-span-2 my-2" />

            <Field label="Max Players" type="number" value={form.max_players} onChange={(v) => setFormField('max_players', parseInt(v) || 0)} />
            <Field label="Team Size" type="number" value={form.team_size} onChange={(v) => setFormField('team_size', parseInt(v) || 1)} />
            <Field label="Group Size" type="number" value={form.group_size} onChange={(v) => setFormField('group_size', parseInt(v) || 4)} />
            <Field label="Rounds" type="number" value={form.rounds} onChange={(v) => setFormField('rounds', parseInt(v) || 3)} />

            <div className="border-t border-white/5 md:col-span-2 my-2" />

            <Field label="Tournament Date" type="date" value={form.tournament_date} onChange={(v) => setFormField('tournament_date', v)} />
            <Field label="Tournament Time" type="text" value={form.tournament_time} onChange={(v) => setFormField('tournament_time', v)} />
            <Field label="Registration Deadline" type="text" value={form.reg_deadline} onChange={(v) => setFormField('reg_deadline', v)} />

            <div className="md:col-span-2">
              <Field label="Description" value={form.description} onChange={(v) => setFormField('description', v)} multiline />
            </div>
            <div className="md:col-span-2">
              <Field label="Rules" value={form.rules} onChange={(v) => setFormField('rules', v)} multiline />
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
