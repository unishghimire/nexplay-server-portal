import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = 'https://6a5226b5047f5c59d961130e.base44.app/api/apps/6a5226b5047f5c59d961130e/functions/discordAuth';

export default function ScoreboardOverlay() {
  const { tournamentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    // Set transparent body background
    document.body.style.backgroundColor = 'transparent';
    document.documentElement.style.backgroundColor = 'transparent';
    
    async function fetchData() {
      try {
        const res = await fetch(`${API_BASE}?action=public_overlay&tournament_id=${tournamentId}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const json = await res.json();
        setData(json);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10 seconds

    return () => {
      clearInterval(interval);
    };
  }, [tournamentId]);

  // Fallback / Mock Data if database has no matches yet
  const tournament = data?.tournament || {
    name: 'NexPlay Elite Championship 2026',
    prize_pool: '$10,000 USD',
    game: 'Valorant'
  };

  const rawStandings = data?.standings || [];
  const standings = rawStandings.length >= 2 ? rawStandings.slice(0, 5) : [
    { name: 'Sentinels', wins: 5, losses: 0 },
    { name: 'Fnatic', wins: 4, losses: 1 },
    { name: 'Paper Rex', wins: 3, losses: 2 },
    { name: 'G2 Esports', wins: 3, losses: 2 },
    { name: 'T1', wins: 2, losses: 3 },
  ];

  return (
    <div className="w-full h-screen relative font-sans select-none overflow-hidden text-white flex flex-col justify-end p-12">
      {/* Bulletproof OBS transparency style injector */}
      <style>{`
        body, html, #root {
          background-color: transparent !important;
          background: transparent !important;
        }
      `}</style>

      {/* Scoreboard Bottom Bar */}
      <div className="relative w-full max-w-[1720px] mx-auto bg-[#0a0a0f]/85 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.9)] p-5 flex items-center justify-between transition-all duration-500 hover:border-indigo-500/20">
        
        {/* Subtle Crystal Shard Border Decor (IC S1 style) */}
        <div className="absolute top-0 left-0 w-24 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/70 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-24 h-[2px] bg-gradient-to-r from-transparent via-purple-500/70 to-transparent"></div>

        {/* Left Section: Tournament Info & Live Pulse */}
        <div className="flex items-center gap-4 border-r border-white/5 pr-6 max-w-[320px]">
          <div className="relative flex items-center justify-center">
            <span className="absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/40">
                LIVE
              </span>
              <span className="text-[10px] font-medium text-slate-400 font-mono">
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <h1 className="text-lg font-black tracking-wide truncate max-w-[260px] bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
              {tournament.name}
            </h1>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
              {tournament.game} • STANDINGS
            </p>
          </div>
        </div>

        {/* Center Section: Top 5 Standings Horizontal Flow */}
        <div className="flex-1 px-8 flex items-center justify-center gap-6 overflow-hidden">
          {standings.map((team, idx) => {
            const medalColors = [
              'text-yellow-400 border-yellow-500/20 bg-yellow-950/20',
              'text-slate-300 border-slate-400/20 bg-slate-800/20',
              'text-amber-600 border-amber-700/20 bg-amber-950/20',
            ];
            const defaultColor = 'text-slate-400 border-slate-700/20 bg-slate-900/20';
            const badgeClass = idx < 3 ? medalColors[idx] : defaultColor;

            return (
              <div 
                key={idx} 
                className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-2 hover:bg-white/[0.04] hover:border-indigo-500/10 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                {/* Rank Circle */}
                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-black font-mono ${badgeClass}`}>
                  {idx + 1}
                </div>

                {/* Team & Score */}
                <div className="flex flex-col">
                  <span className="text-xs font-bold tracking-wide text-slate-200 uppercase max-w-[100px] truncate">
                    {team.name}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">
                    {team.wins}W - {team.losses}L
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Section: Prize Pool & Tournament Format */}
        <div className="flex items-center gap-4 border-l border-white/5 pl-6 min-w-[240px] justify-end">
          <div className="text-right">
            <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase block">
              PRIZE POOL
            </span>
            <span className="text-xl font-black text-white font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-500">
              {tournament.prize_pool || '$0.00'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-400/10 to-amber-500/10 border border-yellow-500/20 text-yellow-500 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
              <path d="M12 2a5 5 0 0 0-5 5v5a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z" />
            </svg>
          </div>
        </div>
      </div>

      {error && (
        <div className="absolute top-4 right-4 bg-red-950/80 border border-red-900/50 text-red-200 text-[10px] font-mono rounded px-2.5 py-1 backdrop-blur">
          Error: {error}
        </div>
      )}
    </div>
  );
}
