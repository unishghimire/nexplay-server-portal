import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Trophy, Users, BarChart2, Settings, LogOut, Menu, X, CreditCard, ChevronDown, Check, ExternalLink, Image, Monitor } from 'lucide-react'

const NAV = [
  { to: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/tournaments',   label: 'Tournaments',   icon: Trophy },
  { to: '/registrations', label: 'Registrations', icon: Users },
  { to: '/analytics',     label: 'Analytics',     icon: BarChart2 },
  { to: '/gfx',           label: 'GFX Generator', icon: Image },
  { to: '/overlays',       label: 'OBS Overlays',   icon: Monitor },
  { to: '/subscription',  label: 'Subscription',  icon: CreditCard },
  { to: '/settings',      label: 'Settings',      icon: Settings },
]

const BOT_INVITE_URL = `https://discord.com/api/oauth2/authorize?client_id=1525463657843261591&permissions=8&scope=bot%20applications.commands`
const SUBSCRIPTION_URL = 'https://nexplay-server-portal.vercel.app/subscription'

function ServerIcon({ guild, size = 'md' }) {
  const sz = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
  if (guild?.icon)
    return <img src={guild.icon} alt={guild.name} className={`${sz} rounded-full shrink-0 object-cover`}/>
  return (
    <div className={`${sz} rounded-full bg-indigo-600/40 flex items-center justify-center text-indigo-300 font-bold shrink-0`}>
      {guild?.name?.[0] || '?'}
    </div>
  )
}

function ServerSwitcher() {
  const { guild, guilds, switchServer } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  // Servers with bot OR all servers user has admin access to
  const eligible = (guilds || []).filter(g => g.bot_present && (g.is_owner || g.permissions_admin))

  if (eligible.length <= 1) {
    // Single server — just show it, no dropdown
    return (
      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2.5 px-2">
          <ServerIcon guild={guild} />
          <span className="text-sm text-gray-300 font-medium flex-1 truncate">{guild?.name}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="px-3 py-2 border-b border-white/5 relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors group"
      >
        <ServerIcon guild={guild} />
        <span className="text-sm text-gray-300 font-medium flex-1 truncate text-left">{guild?.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}/>
      </button>
      <p className="text-xs text-gray-600 px-2 mt-0.5">Click to switch server</p>

      {open && (
        <div className="absolute left-3 right-3 top-full mt-1 z-50 bg-[#1a1a28] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          <div className="px-3 py-2 border-b border-white/5">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Your Servers</p>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {eligible.map(g => (
              <button
                key={g.id}
                onClick={() => {
                  switchServer(g.id)
                  setOpen(false)
                  navigate('/dashboard')
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
              >
                <ServerIcon guild={g} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 font-medium truncate">{g.name}</p>
                  <p className="text-xs text-gray-500">
                    {g.is_owner ? 'Owner' : 'Admin'}
                    {g.server_record?.subscription_status ? ` · ${g.server_record.subscription_status}` : ''}
                  </p>
                </div>
                {guild?.id === g.id && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0"/>}
              </button>
            ))}
          </div>
          {/* Add new server */}
          <div className="border-t border-white/5 px-3 py-2">
            <a
              href={BOT_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3"/>
              Add NexPlay to another server
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Layout() {
  const { user, guild, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-[#0f0f16] border-r border-white/5 flex flex-col transform transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">N</div>
          <span className="text-white font-bold tracking-tight">NexPlay</span>
        </div>

        {/* Server switcher */}
        <ServerSwitcher />

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-indigo-600/20 text-indigo-300 font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <Icon className="w-4 h-4 shrink-0"/>{label}
            </NavLink>
          ))}
        </nav>

        {/* Quick links */}
        <div className="px-3 py-2 border-t border-white/5">
          <a
            href={BOT_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-indigo-400 hover:bg-indigo-600/10 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0"/>
            Add bot to server
          </a>
          <a
            href={SUBSCRIPTION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-emerald-400 hover:bg-emerald-600/10 transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 shrink-0"/>
            Manage Subscription
          </a>
        </div>

        {/* User */}
        <div className="px-3 py-3 border-t border-white/5">
          <div className="flex items-center gap-2.5 px-3 py-2">
            {user?.avatar
              ? <img src={user.avatar} alt={user.username} className="w-7 h-7 rounded-full"/>
              : <div className="w-7 h-7 rounded-full bg-indigo-600/40 flex items-center justify-center text-xs text-indigo-300 font-bold">{user?.username?.[0]?.toUpperCase()}</div>
            }
            <span className="text-sm text-gray-300 flex-1 truncate">{user?.username}</span>
            <button onClick={logout} title="Sign out" className="text-gray-500 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {open && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)}/>}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-[#0a0a0f] shrink-0">
          <button onClick={() => setOpen(v => !v)} className="lg:hidden text-gray-400 hover:text-white transition-colors">
            {open ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
          </button>
          <div className="flex items-center gap-3">
            {guild && (
              <div className="hidden lg:flex items-center gap-2">
                <ServerIcon guild={guild} size="sm" />
                <span className="text-sm text-gray-400">{guild.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <a
              href={BOT_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 text-xs font-medium hover:bg-indigo-600/30 transition-colors"
            >
              <ExternalLink className="w-3 h-3"/> Add Bot
            </a>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet/>
        </main>
      </div>
    </div>
  )
}
