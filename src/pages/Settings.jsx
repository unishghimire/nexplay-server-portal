import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { Copy, Check, ExternalLink, RefreshCw, AlertTriangle, CheckCircle, LogOut } from 'lucide-react'

const STATUS_STYLES = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  trial: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  expired: 'bg-red-500/20 text-red-400 border-red-500/30',
  banned: 'bg-red-600/20 text-red-500 border-red-600/30',
}

const COMMANDS_REFERENCE = [
  { name: '/create_tournament', desc: 'Initialize and start drafting a new tournament bracket in discord.' },
  { name: '/generate_groups', desc: 'Distribute registered teams/participants into automatic matches pools.' },
  { name: '/start_tournament', desc: 'Finalize drafts, locked registrations, and announce brackets.' },
  { name: '/update_score', desc: 'Record score results for active matches and progress brackets.' },
  { name: '/announcements', desc: 'Direct bot to send customized broadcasts to registration feeds.' },
]

export default function Settings() {
  const { user, guild, token, logout } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [copied, setCopied] = useState('')

  const BOT_INVITE = `https://discord.com/api/oauth2/authorize?client_id=${import.meta.env.VITE_DISCORD_CLIENT_ID || 'APP_ID'}&permissions=8&scope=bot%20applications.commands`

  const load = async () => {
    if (!guild || !token) return
    try {
      const d = await api.getServer(guild.id, token)
      setData(d)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
  }, [guild, token])

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const server = data?.server || data
  const subStatus = server?.subscription_status || 'trial'
  const botPresent = data?.bot_present ?? true

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage Discord bot linkages, view reference guides, and profile details.</p>
        </div>
        <button
          onClick={() => {
            setRefreshing(true)
            load()
          }}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Server Info & Bot */}
        <div className="lg:col-span-2 space-y-6">
          {/* Server Info */}
          <div className="bg-[#13131a] border border-white/5 rounded-xl p-5 space-y-4">
            <h3 className="text-white font-semibold">Server Information</h3>
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              {guild?.icon ? (
                <img src={guild.icon} alt={guild?.name} className="w-12 h-12 rounded-full border border-white/10" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-400 font-bold text-lg">
                  {(guild?.name || '?')[0]}
                </div>
              )}
              <div>
                <p className="text-white font-semibold text-lg">{guild?.name}</p>
                <button
                  onClick={() => copy(guild?.id, 'guild')}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors font-mono mt-0.5"
                >
                  ID: {guild?.id}{' '}
                  {copied === 'guild' ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block">Plan Tier</span>
                <span className="text-white font-medium mt-0.5 block">{server?.plan_name || 'Free Trial'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Subscription Status</span>
                <span
                  className={`inline-block text-xs px-2.5 py-0.5 rounded-full border mt-1 font-medium capitalize ${
                    STATUS_STYLES[subStatus] || STATUS_STYLES.trial
                  }`}
                >
                  {subStatus}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Member Count</span>
                <span className="text-white font-medium mt-0.5 block">{(server?.member_count || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Last Active</span>
                <span className="text-white font-medium mt-0.5 block font-mono">
                  {server?.last_active ? server.last_active.substring(0, 10) : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Bot commands reference guide */}
          <div className="bg-[#13131a] border border-white/5 rounded-xl p-5 space-y-4">
            <h3 className="text-white font-semibold">Bot Commands Reference</h3>
            <div className="space-y-3">
              {COMMANDS_REFERENCE.map((cmd) => (
                <div key={cmd.name} className="p-3 bg-white/2 rounded-lg border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <code className="text-indigo-400 font-bold font-mono text-sm">{cmd.name}</code>
                  <span className="text-gray-400 text-xs sm:text-right max-w-md">{cmd.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Profile, Bot Invite, Support */}
        <div className="space-y-6">
          {/* User Profile & Logout */}
          <div className="bg-[#13131a] border border-white/5 rounded-xl p-5 space-y-4">
            <h3 className="text-white font-semibold">My Account</h3>
            <div className="flex items-center gap-3">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full border border-white/10" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                  {(user?.username || '?')[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-white font-medium text-sm">{user?.username}</p>
                <p className="text-gray-500 font-mono text-xs">{user?.id}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="flex items-center justify-center gap-2 w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold rounded-lg transition-colors border border-red-500/10"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

          {/* Bot Link invitation */}
          <div className="bg-[#13131a] border border-white/5 rounded-xl p-5 space-y-4">
            <h3 className="text-white font-semibold">NexPlay Bot Linkage</h3>
            {botPresent ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>Bot is active in your server</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>Bot is missing from this server</span>
                </div>
                <a
                  href={BOT_INVITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Invite NexPlay Bot <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
            <div className="pt-2 border-t border-white/5">
              <label className="text-xs text-gray-500 block mb-1">Bot Invite Link</label>
              <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2.5 py-2 border border-white/5">
                <code className="text-xs text-gray-400 flex-1 truncate">{BOT_INVITE}</code>
                <button
                  onClick={() => copy(BOT_INVITE, 'invite')}
                  className="shrink-0 text-gray-400 hover:text-white transition-colors"
                >
                  {copied === 'invite' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="bg-[#13131a] border border-white/5 rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold">Support</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              If you require assistance or experience any glitches, reach out to NexPlay support squads or join the official guild.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href="https://discord.gg/nexplay"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-[#5865F2] text-xs font-semibold rounded-lg transition-colors"
              >
                Discord Server
              </a>
              <a
                href="mailto:support@nexplay.gg"
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold rounded-lg transition-colors"
              >
                Email Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
