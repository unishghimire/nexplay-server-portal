import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { Copy, Check, ExternalLink, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'

const BOT_INVITE = 'https://discord.com/api/oauth2/authorize?client_id=' + (import.meta.env.VITE_DISCORD_CLIENT_ID||'APP_ID') + '&permissions=8&scope=bot%20applications.commands'

const STATUS_STYLES = {
  active:  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  trial:   'bg-amber-500/20  text-amber-400  border-amber-500/30',
  expired: 'bg-red-500/20    text-red-400    border-red-500/30',
  banned:  'bg-red-600/20    text-red-500    border-red-600/30',
}

export default function Settings() {
  const { user, guild, token, logout } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [copied, setCopied] = useState('')

  const load = async () => {
    if (!guild || !token) return
    try {
      const d = await api.getServer(guild.id, token)
      setData(d)
    } catch (e) { console.error(e) }
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { load() }, [guild, token])

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>

  const server = data?.server
  const sub = data?.subscription
  const botPresent = data?.bot_present ?? true
  const subStatus = server?.subscription_status || 'trial'

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile */}
      <div className="bg-[#13131a] border border-white/5 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Your Profile</h3>
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.username} className="w-14 h-14 rounded-full border-2 border-indigo-500/30"/>
          ) : (
            <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              {(user?.username||'?')[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-white font-semibold">{user?.username}</p>
            <p className="text-gray-500 text-sm font-mono">{user?.id}</p>
          </div>
        </div>
        <button onClick={() => { logout() }} className="mt-4 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm transition-colors">
          Sign Out
        </button>
      </div>

      {/* Server info */}
      <div className="bg-[#13131a] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Server</h3>
          <button onClick={()=>{setRefreshing(true);load()}} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing?'animate-spin':''}`}/> Refresh
          </button>
        </div>
        <div className="flex items-center gap-3 mb-4">
          {guild?.icon ? (
            <img src={guild.icon} alt={guild?.name} className="w-10 h-10 rounded-full"/>
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-400 font-bold">{(guild?.name||'?')[0]}</div>
          )}
          <div>
            <p className="text-white font-medium">{guild?.name}</p>
            <button onClick={()=>copy(guild?.id,'guild')} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors font-mono">
              {guild?.id} {copied==='guild' ? <Check className="w-3 h-3 text-emerald-400"/> : <Copy className="w-3 h-3"/>}
            </button>
          </div>
        </div>
        <div className="space-y-2.5 text-sm">
          {[
            ['Plan', server?.plan_name||'Free Trial'],
            ['Tournaments Used', `${server?.tournaments_used||0} / ${server?.tournament_limit||3}`],
            ['Member Count', server?.member_count||'—'],
            ['Last Active', server?.last_active?.substring(0,10)||'—'],
          ].map(([k,v])=>(
            <div key={k} className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-gray-500">{k}</span>
              <span className="text-white">{v}</span>
            </div>
          ))}
          <div className="flex justify-between py-1.5">
            <span className="text-gray-500">Status</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[subStatus]||STATUS_STYLES.trial}`}>{subStatus}</span>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-[#13131a] border border-white/5 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Subscription</h3>
        {subStatus === 'active' ? (
          <div className="flex items-center gap-2 mb-4 text-emerald-400 text-sm"><CheckCircle className="w-4 h-4"/>Active subscription</div>
        ) : subStatus === 'trial' ? (
          <div className="flex items-center gap-2 mb-4 text-amber-400 text-sm"><AlertTriangle className="w-4 h-4"/>Free Trial — limited to {server?.tournament_limit||3} tournaments</div>
        ) : (
          <div className="flex items-center gap-2 mb-4 text-red-400 text-sm"><AlertTriangle className="w-4 h-4"/>{subStatus === 'banned' ? 'Account suspended' : 'Subscription expired'}</div>
        )}
        {sub && (
          <div className="space-y-2 text-sm mb-4">
            {[
              ['Plan', sub.plan_name],
              ['Started', sub.started_at?.substring(0,10)],
              ['Renews', sub.renews_at?.substring(0,10)],
            ].filter(([,v])=>v).map(([k,v])=>(
              <div key={k} className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-gray-500">{k}</span><span className="text-white">{v}</span>
              </div>
            ))}
          </div>
        )}
        <a href="https://nexplay.gg/pricing" target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
          {subStatus === 'active' ? 'Manage Plan' : 'Upgrade Plan'} <ExternalLink className="w-3.5 h-3.5"/>
        </a>
      </div>

      {/* Bot presence */}
      <div className="bg-[#13131a] border border-white/5 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">NexPlay Bot</h3>
        {botPresent ? (
          <div className="flex items-center gap-2 text-emerald-400 text-sm mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/> Bot is active in your server
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-red-400 text-sm mb-3">
              <div className="w-2 h-2 rounded-full bg-red-400"/> Bot is NOT in your server
            </div>
            <a href={`${BOT_INVITE}&guild_id=${guild?.id}`} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
              Invite NexPlay Bot <ExternalLink className="w-3.5 h-3.5"/>
            </a>
          </div>
        )}
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-1.5">Bot Invite Link</p>
          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2.5 border border-white/5">
            <code className="text-xs text-gray-400 flex-1 truncate">{BOT_INVITE}</code>
            <button onClick={()=>copy(BOT_INVITE,'invite')} className="shrink-0 text-gray-400 hover:text-white transition-colors">
              {copied==='invite' ? <Check className="w-4 h-4 text-emerald-400"/> : <Copy className="w-4 h-4"/>}
            </button>
          </div>
        </div>
      </div>

      {/* Support */}
      <div className="bg-[#13131a] border border-white/5 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-2">Support</h3>
        <p className="text-gray-400 text-sm mb-3">Need help? Contact NexPlay support or join the Discord.</p>
        <div className="flex gap-3">
          <a href="https://discord.gg/nexplay" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-[#5865F2] text-sm transition-colors">
            Discord Server
          </a>
          <a href="mailto:support@nexplay.gg"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm transition-colors">
            Email Support
          </a>
        </div>
      </div>
    </div>
  )
}
