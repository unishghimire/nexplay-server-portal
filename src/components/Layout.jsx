import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Trophy, Users, BarChart2, Settings, LogOut, Menu, X, ChevronDown } from 'lucide-react'

const NAV = [
  { to:'/dashboard',     label:'Dashboard',     icon:LayoutDashboard },
  { to:'/tournaments',   label:'Tournaments',   icon:Trophy },
  { to:'/registrations', label:'Registrations', icon:Users },
  { to:'/analytics',     label:'Analytics',     icon:BarChart2 },
  { to:'/settings',      label:'Settings',      icon:Settings },
]

export default function Layout() {
  const { user, guild, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [guildDrop, setGuildDrop] = useState(false)

  // Get all guilds for switcher
  const raw = localStorage.getItem('nexplay_guilds')
  const allGuilds = raw ? JSON.parse(raw).filter(g => g.bot_present) : []
  const multiServer = allGuilds.length > 1

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-[#0f0f16] border-r border-white/5 flex flex-col transform transition-transform duration-200 ${open?'translate-x-0':'-translate-x-full'} lg:relative lg:translate-x-0`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">N</div>
          <span className="text-white font-bold tracking-tight">NexPlay</span>
        </div>

        {/* Guild selector */}
        {guild && (
          <div className="px-3 py-3 border-b border-white/5">
            <button onClick={()=>multiServer&&setGuildDrop(v=>!v)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${multiServer?'hover:bg-white/5 cursor-pointer':'cursor-default'}`}>
              {guild.icon
                ? <img src={guild.icon} alt={guild.name} className="w-7 h-7 rounded-full shrink-0"/>
                : <div className="w-7 h-7 rounded-full bg-indigo-600/40 flex items-center justify-center text-indigo-300 text-xs font-bold shrink-0">{guild.name?.[0]}</div>
              }
              <span className="text-sm text-gray-200 font-medium flex-1 truncate text-left">{guild.name}</span>
              {multiServer && <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${guildDrop?'rotate-180':''}`}/>}
            </button>
            {guildDrop && multiServer && (
              <div className="mt-1 space-y-1">
                {allGuilds.filter(g=>g.id!==guild?.id).map(g=>(
                  <button key={g.id} onClick={()=>{
                    localStorage.setItem('nexplay_guild', JSON.stringify({id:g.id,name:g.name,icon:g.icon}))
                    localStorage.setItem('nexplay_server', JSON.stringify(g.server_record||null))
                    window.location.href='/dashboard'
                  }} className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                    {g.icon ? <img src={g.icon} alt={g.name} className="w-5 h-5 rounded-full"/> : <div className="w-5 h-5 rounded-full bg-indigo-600/30 flex items-center justify-center text-[10px] text-indigo-300">{g.name[0]}</div>}
                    <span className="text-xs text-gray-400 truncate">{g.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({to,label,icon:Icon})=>(
            <NavLink key={to} to={to} onClick={()=>setOpen(false)}
              className={({isActive})=>`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive?'bg-indigo-600/20 text-indigo-300 font-medium':'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <Icon className="w-4 h-4 shrink-0"/>{label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-3 border-t border-white/5">
          <div className="flex items-center gap-2.5 px-3 py-2">
            {user?.avatar
              ? <img src={user.avatar} alt={user.username} className="w-7 h-7 rounded-full"/>
              : <div className="w-7 h-7 rounded-full bg-indigo-600/40 flex items-center justify-center text-xs text-indigo-300 font-bold">{user?.username?.[0]?.toUpperCase()}</div>
            }
            <span className="text-sm text-gray-300 flex-1 truncate">{user?.username}</span>
            <button onClick={logout} title="Sign out" className="text-gray-500 hover:text-red-400 transition-colors"><LogOut className="w-4 h-4"/></button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {open && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={()=>setOpen(false)}/>}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-[#0a0a0f] shrink-0">
          <button onClick={()=>setOpen(v=>!v)} className="lg:hidden text-gray-400 hover:text-white transition-colors">
            {open ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
          </button>
          <div className="hidden lg:block"/>
          {user?.avatar && (
            <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full border border-white/10 cursor-pointer" onClick={()=>navigate('/settings')}/>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          <Outlet/>
        </main>
      </div>
    </div>
  )
}
