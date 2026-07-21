import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api.js';
import { 
  Monitor, 
  Copy, 
  Trophy, 
  Users, 
  BarChart3, 
  Calendar, 
  Crown, 
  CheckCircle2, 
  ExternalLink, 
  Check, 
  HelpCircle,
  Play
} from 'lucide-react';

export default function OverlayHub() {
  const { guild, token } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    async function fetchTournaments() {
      try {
        setLoading(true);
        const data = await api.getTournaments(guild?.id, token);
        setTournaments(data);
        if (data && data.length > 0) {
          setSelectedTournamentId(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching tournaments:', err);
        setError('Failed to load tournaments. Using offline mock data.');
      } finally {
        setLoading(false);
      }
    }
    fetchTournaments();
  }, [guild?.id, token]);

  const overlayTypes = [
    {
      id: 'scoreboard',
      name: 'Scoreboard Overlay',
      description: 'A bottom-bar style live standings scoreboard. Shows the current tournament name, top 5 standings (rank, team, W-L), and prize pool. Designed for continuous display during commentary.',
      icon: BarChart3,
      color: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'match',
      name: 'Match Overlay',
      description: 'Displays the current active match with a professional head-to-head UI. Features team logo placeholders, names, live scores, and round labels with a glowing glassmorphism aesthetic.',
      icon: Users,
      color: 'from-purple-600 to-pink-600',
    },
    {
      id: 'bracket',
      name: 'Bracket Overlay',
      description: 'Displays the interactive single or double elimination bracket tree. Organized by rounds, displaying completed and active matchups connected with clean SVG path lines.',
      icon: Trophy,
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 'groups',
      name: 'Groups Overlay',
      description: 'Displays clean group standings tables in a beautiful grid layout. Perfect for group stage tournaments to show live rankings, played matches, and point summaries.',
      icon: Users,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'infobar',
      name: 'Info Bar Ticker',
      description: 'A sleek, continuous marquee ticker at the bottom of the stream. Loops tournament details: name, game, prize pool, date, and registration stats with high-performance CSS hardware acceleration.',
      icon: Calendar,
      color: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'champion',
      name: 'Champion Victory Screen',
      description: 'A gorgeous full-screen victory announcement for the tournament winner. Spawns premium confetti animations with a golden crown and large, bold champion team name.',
      icon: Crown,
      color: 'from-yellow-500 to-amber-600',
    },
    {
      id: 'registration',
      name: 'Registration Progress',
      description: 'A pre-tournament countdown/lobby screen. Displays registration status (Open/Closed), a live animated slots filled progress bar (e.g., 12/16 teams), and a list of registered team cards.',
      icon: CheckCircle2,
      color: 'from-rose-500 to-red-600',
    }
  ];

  const getOverlayUrl = (type) => {
    const tId = selectedTournamentId || 'YOUR_TOURNAMENT_ID';
    return `https://nexplay-server-portal.vercel.app/overlay/${type}/${tId}`;
  };

  const getLocalOverlayUrl = (type) => {
    const tId = selectedTournamentId || 'YOUR_TOURNAMENT_ID';
    return `${window.location.origin}/overlay/${type}/${tId}`;
  };

  const copyToClipboard = (text, typeId) => {
    navigator.clipboard.writeText(text);
    setCopiedId(typeId);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 p-6 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-indigo-950/40 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
              <Monitor className="w-5 h-5 animate-pulse" />
              <span>OBS STREAM SYSTEM</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">
              Overlay Hub
            </h1>
            <p className="text-slate-400 mt-2 text-sm md:text-base max-w-2xl">
              Configure, preview, and generate high-fidelity browser overlays for OBS, vMix, or Streamlabs. All overlays are fully animated, responsive, and update live.
            </p>
          </div>

          {/* Tournament Selector */}
          <div className="bg-[#12121a]/80 border border-indigo-950/60 p-4 rounded-xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-3 min-w-[280px]">
            <div className="w-full">
              <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1.5">
                Select Tournament
              </label>
              {loading ? (
                <div className="h-10 w-full bg-slate-800/40 rounded animate-pulse"></div>
              ) : (
                <select
                  value={selectedTournamentId}
                  onChange={(e) => setSelectedTournamentId(e.target.value)}
                  className="w-full bg-[#161622] border border-indigo-900/40 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.game || 'Tournament'})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 p-3 bg-indigo-950/40 border border-indigo-900/40 text-indigo-300 text-xs rounded-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            {error}
          </div>
        )}

        {/* Overlay Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {overlayTypes.map((type) => {
            const prodUrl = getOverlayUrl(type.id);
            const localUrl = getLocalOverlayUrl(type.id);
            const IconComponent = type.icon;

            return (
              <div 
                key={type.id} 
                className="group relative bg-gradient-to-b from-[#111119] to-[#0d0d14] border border-indigo-950/50 hover:border-indigo-500/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 overflow-hidden flex flex-col justify-between"
              >
                {/* Subtle glass accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all"></div>

                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${type.color} text-white shadow-lg`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-wide group-hover:text-indigo-300 transition-all">
                        {type.name}
                      </h3>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                        Overlay type: {type.id}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {type.description}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-indigo-950/40">
                  {/* Production URL Field */}
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-500 uppercase mb-1.5 tracking-wider">
                      Vercel Production URL
                    </span>
                    <div className="flex items-center gap-1.5 bg-[#08080c] border border-indigo-950/60 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 group-hover:border-indigo-900/40 transition-all">
                      <span className="truncate flex-1 select-all font-mono font-medium text-[11px]">
                        {prodUrl}
                      </span>
                      <button
                        onClick={() => copyToClipboard(prodUrl, `${type.id}-prod`)}
                        className="p-1 hover:text-white text-slate-500 transition-colors"
                        title="Copy Vercel URL"
                      >
                        {copiedId === `${type.id}-prod` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Local URL (extremely helpful for local development testing) */}
                  <div>
                    <span className="block text-[10px] font-semibold text-indigo-400 uppercase mb-1.5 tracking-wider">
                      Local Preview / Development URL
                    </span>
                    <div className="flex items-center gap-1.5 bg-[#0f0f18] border border-indigo-950/80 rounded-lg px-2.5 py-1.5 text-xs text-indigo-300/90 hover:bg-[#121220] transition-all">
                      <span className="truncate flex-1 select-all font-mono text-[11px]">
                        {localUrl}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => copyToClipboard(localUrl, `${type.id}-local`)}
                          className="p-1 hover:text-white text-indigo-400 transition-colors"
                          title="Copy Local URL"
                        >
                          {copiedId === `${type.id}-local` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={localUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:text-white text-indigo-400 transition-colors"
                          title="Open in New Tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* OBS Setup Guide */}
        <div className="bg-[#111119] border border-indigo-950/60 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-wide">
                OBS Studio Setup Guide
              </h2>
              <p className="text-slate-400 text-xs md:text-sm">
                Get your overlays up and running in OBS Studio in less than a minute.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[
                { step: '1', text: 'Open OBS Studio on your streaming machine.' },
                { step: '2', text: 'In the "Sources" panel, click the "+" icon and choose "Browser".' },
                { step: '3', text: 'Give it a name (e.g., "NexPlay Live Standings") and click OK.' },
                { step: '4', text: 'In the source properties, paste the copied overlay URL into the "URL" field.' },
                { step: '5', text: 'Set Width to 1920 and Height to 1080 (crucial for responsive sizing).' },
                { step: '6', text: 'Check the option "Refresh browser when scene becomes active" and click OK.' }
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                    {item.step}
                  </div>
                  <p className="text-slate-300 text-sm mt-0.5 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-[#08080c] border border-indigo-950/80 rounded-xl p-5 flex flex-col justify-center">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Pro Tips for Streams
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span><strong>Transparent Backgrounds:</strong> All overlays are built with pure transparent backgrounds. No chroma key filters (like Color Key or Green Screen) are needed!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span><strong>Live Updates:</strong> Overlays automatically poll the server every 10-15 seconds. Changes in tournament standings, scores, or brackets will render automatically on your stream without OBS restarts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span><strong>Chroma Key Safe:</strong> If you ever need physical positioning, simply click and drag the browser source boundary within OBS to crop or scale.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
