import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { Image, Download, RefreshCw, Trophy, Users, Map, BarChart2, Lock } from 'lucide-react'

// ── Plan feature gates ─────────────────────────────────────────────────────
const PLAN_GFX = {
  trial:   [],
  starter: [],
  pro:     ['poster','groups','results','schedule'],
  elite:   ['poster','groups','results','schedule','roadmap'],
}
const PLAN_ORDER = ['trial','starter','pro','elite']

function planLevel(planName) {
  const p = (planName||'trial').toLowerCase().replace(' ','_').replace('free_trial','trial')
  return PLAN_ORDER.indexOf(p) >= 0 ? p : 'trial'
}

function canUseGfx(serverRecord) {
  const plan = planLevel(serverRecord?.plan_name || serverRecord?.subscription_status)
  return PLAN_GFX[plan] || []
}

// ── Pollinations URL builder ───────────────────────────────────────────────
function pollinationsUrl(prompt) {
  return 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) + '?width=800&height=1100&nologo=true&seed=' + Math.floor(Math.random()*99999)
}

// ── Template prompt builders ───────────────────────────────────────────────
function buildPosterPrompt(t, server) {
  return `Free Fire esports tournament registration opened poster in the HellBornFire International Conflict S1 style. ` +
    `Light silver-white background with geometric crystal shard patterns and diagonal light rays. ` +
    `Two Free Fire characters on left and right in dynamic combat poses. ` +
    `Top center: bold dark logo badge "${(server?.guild_name||'NEXPLAY').toUpperCase()}" with S1 shield. ` +
    `Large bold dark gray typography center: "${t.name.toUpperCase()}" then "REGISTRATIONS OPENED". ` +
    `Bottom: ${t.eligible_nations||'🇳🇵'} flag row. "LIVE ON | ${(server?.guild_name||'NEXPLAY').toUpperCase()}" bar. ` +
    `Social icons bottom-left. "NEXPLAY | FREE FIRE" branding bottom-right. ` +
    `Portrait 9:16 format. Ultra HD professional esports poster.`
}

function buildRoadmapPrompt(t, server) {
  const stages = []
  const stageNames = ['Group Stage','Quarter Final','Semi Final','Grand Final','Championship']
  const rounds = parseInt(t.rounds)||3
  for(let i=0;i<Math.min(rounds,5);i++) stages.push(stageNames[i]||`Round ${i+1}`)
  return `Free Fire esports tournament roadmap poster in HellBornFire IC S1 style. ` +
    `Light silver-white background with geometric crystal diamond shard patterns. ` +
    `Free Fire male player portrait on right side. "${(server?.guild_name||'NEXPLAY').toUpperCase()}" logo top-left. ` +
    `Left side roadmap timeline with rounded rectangle info boxes: ` +
    stages.map((s,i)=>`"${s}"`).join(', ') + `. ` +
    `"ROADMAP" in massive bold dark gray letters at bottom. ` +
    `${t.eligible_nations||'🇳🇵'} flags row. "LIVE ON ${(server?.guild_name||'NEXPLAY').toUpperCase()}" bar. ` +
    `Portrait 9:16. Ultra HD professional esports.`
}

function buildGroupsPrompt(t, groups, server) {
  const groupLetters = groups.map(g=>g.group_label).join(', ') || 'A, B, C'
  const sampleTeams = groups.length > 0
    ? groups.slice(0,3).map(g=>`Group ${g.group_label}: ${(g.player_names||'').split(',').slice(0,4).join(', ')}`).join(' | ')
    : `${t.group_size||4} teams per group`
  return `Free Fire esports tournament group stage draw poster in HellBornFire IC S1 style. ` +
    `Light silver-white shattered crystal geometric background. "${(server?.guild_name||'NEXPLAY').toUpperCase()}" badge top-left. ` +
    `${t.max_players||16} team logo slots in grid (${t.group_size||4} per row), each with country flag above and team name below. ` +
    `Teams across groups: ${sampleTeams}. ` +
    `Bottom: "GS ${t.short_name?.toUpperCase()||'NXP'} S1" pill then "GROUP ${groupLetters.split(',')[0]||'A'}" in massive bold dark text. ` +
    `Large trophy icon right. ${t.eligible_nations||'🇳🇵'} flags. "LIVE ON ${(server?.guild_name||'NEXPLAY').toUpperCase()}" bar. ` +
    `Portrait 9:16. Ultra HD.`
}

function buildResultsPrompt(t, matches, server) {
  const completed = matches.filter(m=>m.status==='completed')
  const topMatch = completed[0]
  const p1 = topMatch?.player1_username || 'TEAM ALPHA'
  const p2 = topMatch?.player2_username || 'TEAM BETA'
  const winner = topMatch?.winner_username || p1
  const s1 = topMatch?.player1_score ?? 58
  const s2 = topMatch?.player2_score ?? 32
  return `Free Fire esports group standings result poster in HellBornFire IC S1 style. ` +
    `Light silver-white shattered crystal geometric background. Free Fire male player portrait on right. ` +
    `"${(server?.guild_name||'NEXPLAY').toUpperCase()}" badge top-left. ` +
    `Standings table center-left: columns TEAM, KILLS, TOTAL. ` +
    `${completed.slice(0,12).map((m,i)=>`Rank ${i+1}: ${m.winner_username||'—'}`).join(', ') || `12 teams with kills and total scores`}. ` +
    `Bottom: "Group A" label then "STANDINGS OVERALL" in massive bold dark gray. ` +
    `${t.eligible_nations||'🇳🇵'} flags. "LIVE ON ${(server?.guild_name||'NEXPLAY').toUpperCase()}" bar. ` +
    `Portrait 9:16. Ultra HD professional.`
}

function buildSchedulePrompt(t, matches, server) {
  const upcoming = matches.filter(m=>m.status!=='completed').slice(0,6)
  return `Free Fire esports tournament match schedule poster in HellBornFire IC S1 style. ` +
    `Light silver-white crystal background. "${(server?.guild_name||'NEXPLAY').toUpperCase()}" badge top-left. ` +
    `Title "MATCH SCHEDULE" bold dark. Subtitle "${t.name.toUpperCase()} · ${t.game||'FREE FIRE'}". ` +
    `${upcoming.length>0 ? upcoming.map(m=>`Round ${m.round_number} Group ${m.group_label||'A'}: ${m.player1_username||'TBD'} vs ${m.player2_username||'TBD'}`).join(' | ') : '6 match rows with team names, dates and times'}. ` +
    `Match date ${t.tournament_date||'TBD'} time ${t.tournament_time||'TBD'}. ` +
    `${t.eligible_nations||'🇳🇵'} flags. "LIVE ON ${(server?.guild_name||'NEXPLAY').toUpperCase()}" bar. ` +
    `Portrait 9:16. Ultra HD.`
}

// ── GFX Card ──────────────────────────────────────────────────────────────
function GfxCard({ type, label, icon: Icon, locked, lockedPlan, prompt, onGenerate }) {
  const [url, setUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (locked || !prompt) return
    setLoading(true)
    setUrl(null)
    // slight delay to avoid rate limit
    await new Promise(r=>setTimeout(r,300))
    const generated = pollinationsUrl(prompt)
    // preload
    const img = new window.Image()
    img.onload = () => { setUrl(generated); setLoading(false) }
    img.onerror = () => { setUrl(generated); setLoading(false) }
    img.src = generated
    onGenerate && onGenerate(type, generated)
  }

  const download = () => {
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = `nexplay-${type}.jpg`
    a.target = '_blank'
    a.click()
  }

  return (
    <div className={`bg-[#13131a] border rounded-xl overflow-hidden flex flex-col ${locked ? 'border-white/5 opacity-60' : 'border-white/10'}`}>
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-indigo-400"/>
          <span className="text-white font-semibold text-sm">{label}</span>
        </div>
        {locked ? (
          <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
            <Lock className="w-3 h-3"/> {lockedPlan}+
          </span>
        ) : (
          <button onClick={generate} disabled={loading}
            className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors">
            <RefreshCw className={`w-3 h-3 ${loading?'animate-spin':''}`}/>
            {loading ? 'Generating…' : url ? 'Regenerate' : 'Generate'}
          </button>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center bg-[#0c0c14] min-h-[260px] relative">
        {locked ? (
          <div className="text-center p-6">
            <Lock className="w-8 h-8 text-gray-600 mx-auto mb-2"/>
            <p className="text-gray-500 text-sm">Requires <span className="text-amber-400 font-semibold">{lockedPlan}</span> plan</p>
            <p className="text-gray-600 text-xs mt-1">Upgrade at the Subscription page</p>
          </div>
        ) : loading ? (
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"/>
            <p className="text-gray-500 text-xs">Generating with AI…</p>
          </div>
        ) : url ? (
          <img src={url} alt={label} className="w-full h-full object-contain max-h-[400px]"/>
        ) : (
          <div className="text-center p-6">
            <Image className="w-8 h-8 text-gray-700 mx-auto mb-2"/>
            <p className="text-gray-600 text-sm">Click Generate to create this graphic</p>
          </div>
        )}
      </div>

      {url && !locked && (
        <div className="p-3 border-t border-white/5 flex gap-2">
          <button onClick={download}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
            <Download className="w-3.5 h-3.5"/> Download
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main GFX Page ─────────────────────────────────────────────────────────
export default function GFX() {
  const { guild, token, serverRecord } = useAuth()
  const [tournaments, setTournaments] = useState([])
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [genLog, setGenLog] = useState({})

  const plan = planLevel(serverRecord?.plan_name || serverRecord?.subscription_status)
  const allowed = canUseGfx(serverRecord)

  useEffect(() => {
    if (!guild || !token) return
    api.getTournaments(guild.id, token)
      .then(d => {
        const list = d.tournaments || []
        setTournaments(list)
        if (list.length > 0) setSelected(list[0])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [guild, token])

  useEffect(() => {
    if (!selected || !guild || !token) return
    setDetail(null)
    api.getTournamentDetail(selected.id, guild.id, token)
      .then(d => setDetail(d))
      .catch(console.error)
  }, [selected, guild, token])

  const handleGenerate = (type, url) => {
    setGenLog(prev => ({ ...prev, [type]: url }))
  }

  const server = { guild_name: guild?.name }
  const t = selected
  const groups  = detail?.groups  || []
  const matches = detail?.matches || []

  const CARDS = t ? [
    {
      type: 'poster', label: 'Registration Poster', icon: Trophy,
      locked: !allowed.includes('poster'), lockedPlan: 'Pro',
      prompt: buildPosterPrompt(t, server),
    },
    {
      type: 'roadmap', label: 'Roadmap Poster', icon: Map,
      locked: !allowed.includes('roadmap'), lockedPlan: 'Elite',
      prompt: buildRoadmapPrompt(t, server),
    },
    {
      type: 'groups', label: 'Group Draw Poster', icon: Users,
      locked: !allowed.includes('groups'), lockedPlan: 'Pro',
      prompt: buildGroupsPrompt(t, groups, server),
    },
    {
      type: 'results', label: 'Standings / Results', icon: BarChart2,
      locked: !allowed.includes('results'), lockedPlan: 'Pro',
      prompt: buildResultsPrompt(t, matches, server),
    },
    {
      type: 'schedule', label: 'Match Schedule', icon: BarChart2,
      locked: !allowed.includes('schedule'), lockedPlan: 'Pro',
      prompt: buildSchedulePrompt(t, matches, server),
    },
  ] : []

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-white font-bold text-xl">GFX Generator</h1>
          <p className="text-gray-400 text-sm mt-0.5">Auto-generate tournament graphics from live data</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            plan==='elite' ? 'bg-amber-400/20 text-amber-300' :
            plan==='pro'   ? 'bg-purple-500/20 text-purple-300' :
            plan==='starter' ? 'bg-blue-500/20 text-blue-300' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {plan.charAt(0).toUpperCase()+plan.slice(1)} Plan
          </span>
          {plan==='trial'||plan==='starter' ? (
            <a href="/subscription" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors">
              Upgrade for GFX →
            </a>
          ) : null}
        </div>
      </div>

      {/* Tournament selector */}
      {tournaments.length === 0 ? (
        <div className="text-center py-16 bg-[#13131a] rounded-xl border border-white/5">
          <Trophy className="w-10 h-10 text-gray-600 mx-auto mb-3"/>
          <p className="text-gray-400 font-medium">No tournaments found</p>
          <p className="text-gray-600 text-sm mt-1">Create a tournament with <code className="bg-white/5 px-1 rounded">/create_tournament</code> in Discord</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <label className="text-gray-400 text-sm whitespace-nowrap">Tournament:</label>
            <select
              value={selected?.id||''}
              onChange={e => setSelected(tournaments.find(t=>t.id===e.target.value)||null)}
              className="flex-1 px-3 py-2 bg-[#13131a] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50">
              {tournaments.map(t=>(
                <option key={t.id} value={t.id}>{t.name} ({t.game}) — {t.status?.replace('_',' ')}</option>
              ))}
            </select>
          </div>

          {/* Tournament data preview */}
          {selected && (
            <div className="bg-[#13131a] border border-white/5 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              {[
                ['Game', selected.game||'—'],
                ['Teams', `${selected.registered_count||0}/${selected.max_players||'?'}`],
                ['Format', selected.format||'—'],
                ['Nations', selected.eligible_nations||'🇳🇵'],
                ['Date', selected.tournament_date||'TBA'],
                ['Prize', selected.prize_pool||'—'],
                ['Groups', `${selected.group_size||4} teams/grp`],
                ['Rounds', selected.rounds||3],
              ].map(([k,v])=>(
                <div key={k} className="bg-white/3 rounded-lg p-2.5">
                  <p className="text-xs text-gray-500">{k}</p>
                  <p className="text-white font-medium text-sm mt-0.5 truncate">{v}</p>
                </div>
              ))}
            </div>
          )}

          {/* GFX cards grid */}
          {selected && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CARDS.map(card => (
                <GfxCard key={card.type} {...card} onGenerate={handleGenerate}/>
              ))}
            </div>
          )}

          {/* Theme note */}
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 text-sm text-gray-400">
            <p className="font-medium text-indigo-300 mb-1">🎨 IC S1 Theme Active</p>
            All graphics use the light silver-white crystal shard aesthetic from your reference images —
            data is pulled live from your tournament (teams, groups, matches, nations, prize pool).
            Regenerate any graphic at any time as your tournament progresses.
          </div>
        </>
      )}
    </div>
  )
}
