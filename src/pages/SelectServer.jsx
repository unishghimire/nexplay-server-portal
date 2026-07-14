import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ExternalLink, CheckCircle, XCircle } from 'lucide-react'

export default function SelectServer() {
  const { user, token, login, logout } = useAuth()
  const navigate = useNavigate()

  // guilds come from JWT payload stored in auth context
  // We read from localStorage directly since AuthContext may not expose guilds
  const raw = localStorage.getItem('nexplay_guilds')
  const guilds = raw ? JSON.parse(raw) : []

  const select = (g) => {
    if (!g.bot_present) {
      window.open(g.invite_url, '_blank')
      return
    }
    // Save chosen guild and server record
    localStorage.setItem('nexplay_guild', JSON.stringify({ id: g.id, name: g.name, icon: g.icon }))
    localStorage.setItem('nexplay_server', JSON.stringify(g.server_record))
    // Force a full page reload so AuthContext reloads from localStorage
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          {user?.avatar && <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full mx-auto mb-3 border-2 border-indigo-500/30"/>}
          <h1 className="text-2xl font-bold text-white">Select a Server</h1>
          <p className="text-gray-400 text-sm mt-1">Choose a server you manage to continue</p>
        </div>

        <div className="space-y-3">
          {guilds.length === 0 && (
            <p className="text-center text-gray-500 py-8">No manageable servers found.</p>
          )}
          {guilds.map(g => (
            <button key={g.id} onClick={() => select(g)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                g.bot_present
                  ? 'bg-[#13131a] border-white/10 hover:border-indigo-500/40 hover:bg-[#16162a]'
                  : 'bg-[#0f0f14] border-white/5 opacity-70 hover:opacity-90'
              }`}>
              {g.icon
                ? <img src={g.icon} alt={g.name} className="w-10 h-10 rounded-full shrink-0"/>
                : <div className="w-10 h-10 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-400 font-bold shrink-0">{g.name[0]}</div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{g.name}</p>
                <p className="text-xs text-gray-500 font-mono">{g.id}</p>
              </div>
              <div className="shrink-0">
                {g.bot_present
                  ? <CheckCircle className="w-5 h-5 text-emerald-400"/>
                  : <div className="flex items-center gap-1.5 text-xs text-indigo-400"><ExternalLink className="w-4 h-4"/> Invite Bot</div>
                }
              </div>
            </button>
          ))}
        </div>

        <button onClick={logout} className="mt-6 w-full py-2 text-gray-500 hover:text-gray-300 text-sm transition-colors">
          Sign out
        </button>
      </div>
    </div>
  )
}
