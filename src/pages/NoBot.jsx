import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function NoBot() {
  const navigate = useNavigate()
  const botInvite = 'https://discord.com/api/oauth2/authorize?client_id=' + (import.meta.env.VITE_DISCORD_CLIENT_ID||'APP_ID') + '&permissions=8&scope=bot%20applications.commands'

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl mx-auto mb-6">🤖</div>
        <h1 className="text-2xl font-bold text-white mb-2">Bot Not Found</h1>
        <p className="text-gray-400 text-sm mb-8">NexPlay Bot isn't in any of your servers yet. Invite it to get started with tournaments.</p>

        <a href={botInvite} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20 hover:scale-[1.02]">
          Invite NexPlay Bot →
        </a>

        <div className="mt-8 text-left bg-[#13131a] border border-white/5 rounded-xl p-4 space-y-3">
          {['Click Invite Bot above', 'Select your Discord server', 'Authorise the permissions', 'Come back and refresh'].map((step,i)=>(
            <div key={i} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 text-xs flex items-center justify-center font-bold shrink-0">{i+1}</span>
              <span className="text-gray-300 text-sm">{step}</span>
            </div>
          ))}
        </div>

        <button onClick={()=>window.location.reload()} className="mt-6 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">↻ Refresh</button>
        <button onClick={()=>navigate('/')} className="block mx-auto mt-3 text-xs text-gray-600 hover:text-gray-400 transition-colors">← Back to login</button>
      </div>
    </div>
  )
}
