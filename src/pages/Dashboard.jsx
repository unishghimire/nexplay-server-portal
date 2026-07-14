import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { Trophy, Users, Zap, Calendar, AlertTriangle } from 'lucide-react'

const T_STATUS_COLORS = {
  registration_open:'bg-emerald-500/20 text-emerald-400',
  registration_closed:'bg-red-500/20 text-red-400',
  groups_generated:'bg-purple-500/20 text-purple-400',
  scheduled:'bg-blue-500/20 text-blue-400',
  completed:'bg-amber-500/20 text-amber-400',
  deleted:'bg-gray-500/20 text-gray-400',
}
const T_STATUS_LABELS = {
  registration_open:'🟢 Open', registration_closed:'🔴 Closed',
  groups_generated:'🎯 Groups', scheduled:'📅 Scheduled',
  completed:'🏆 Completed', deleted:'🗑️ Deleted',
}

export default function Dashboard() {
  const { guild, token } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!guild || !token) return
    api.getServer(guild.id, token).then(setData).catch(console.error).finally(() => setLoading(false))
  }, [guild, token])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const server = data?.server
  const tournaments = (data?.tournaments || []).sort((a,b)=>(b.created_date||'').localeCompare(a.created_date||''))
  const stats = data?.tournament_stats || {}
  const subStatus = server?.subscription_status || 'trial'
  const used = server?.tournaments_used || 0
  const limit = server?.tournament_limit || 3
  const totalRegs = tournaments.reduce((a,t)=>a+(t.registered_count||0),0)

  return (
    <div className="space-y-6">
      {subStatus === 'trial' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-amber-300 text-sm">
            <strong>Free Trial</strong> — {Math.max(0,limit-used)} tournaments remaining.{' '}
            <a href="https://nexplay.gg/pricing" target="_blank" rel="noreferrer" className="underline hover:text-amber-200">Upgrade →</a>
          </p>
        </div>
      )}
      {(subStatus === 'expired' || subStatus === 'banned') && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-red-300 text-sm">
            <strong>{subStatus === 'banned' ? 'Account Suspended' : 'Subscription Expired'}</strong>
            {server?.ban_reason ? ` — ${server.ban_reason}` : ' — Please renew to continue.'}{' '}
            <a href="https://nexplay.gg/pricing" target="_blank" rel="noreferrer" className="underline">Renew →</a>
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Active', value:stats.active||0, icon:Zap, c:'text-indigo-400', bg:'bg-indigo-500/10' },
          { label:'Registrations', value:totalRegs, icon:Users, c:'text-emerald-400', bg:'bg-emerald-500/10' },
          { label:'Completed', value:stats.completed||0, icon:Trophy, c:'text-amber-400', bg:'bg-amber-500/10' },
          { label:'Used / Limit', value:`${used}/${limit}`, icon:Calendar, c:'text-purple-400', bg:'bg-purple-500/10' },
        ].map(s=>(
          <div key={s.label} className="bg-[#13131a] border border-white/5 rounded-xl p-5">
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.c}`} />
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#13131a] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Recent Tournaments</h3>
            <button onClick={()=>navigate('/tournaments')} className="text-xs text-indigo-400 hover:text-indigo-300">View all →</button>
          </div>
          {tournaments.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No tournaments yet</p>
              <p className="text-gray-600 text-xs mt-1">Use <code className="bg-white/5 px-1 rounded">/create_tournament</code> in Discord</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tournaments.slice(0,5).map(t=>(
                <div key={t.id} onClick={()=>navigate(`/tournaments/${t.id}`)}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/3 hover:bg-white/5 cursor-pointer transition-colors border border-white/5">
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.game} · {t.tournament_date||'TBA'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{t.registered_count||0}/{t.max_players}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${T_STATUS_COLORS[t.status]||'bg-gray-500/20 text-gray-400'}`}>
                      {T_STATUS_LABELS[t.status]||t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-[#13131a] border border-white/5 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Server Info</h3>
            <div className="space-y-2 text-sm">
              {[
                ['Plan', server?.plan_name||'Free Trial'],
                ['Status', subStatus],
                ['Renews', server?.renews_at ? server.renews_at.substring(0,10) : '—'],
                ['Guild ID', guild?.id],
              ].map(([k,v])=>(
                <div key={k} className="flex justify-between">
                  <span className="text-gray-500">{k}</span>
                  <span className="text-white text-xs font-mono">{v}</span>
                </div>
              ))}
            </div>
            <button onClick={()=>navigate('/settings')} className="mt-4 w-full py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-medium transition-colors">Settings →</button>
          </div>
          <div className="bg-[#13131a] border border-white/5 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Quick Links</h3>
            <div className="space-y-2">
              {[
                ['🏆 Tournaments', '/tournaments'],
                ['👥 Registrations', '/registrations'],
                ['📊 Analytics', '/analytics'],
              ].map(([label, path])=>(
                <button key={path} onClick={()=>navigate(path)} className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/8 text-gray-300 text-xs text-left transition-colors">{label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
