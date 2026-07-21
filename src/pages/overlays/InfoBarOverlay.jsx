import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = 'https://6a5226b5047f5c59d961130e.base44.app/api/apps/6a5226b5047f5c59d961130e/functions/discordAuth';

export default function InfoBarOverlay() {
  const { tournamentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.body.style.background = 'transparent';
    document.documentElement.style.background = 'transparent';

    async function fetchData() {
      try {
        const res = await fetch(`${API_BASE}?action=public_overlay&tournament_id=${tournamentId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
        setError(null);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    }
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [tournamentId]);

  if (loading) return null;
  if (error || !data?.tournament) return (
    <div style={{ position:'fixed',bottom:20,left:20,background:'rgba(10,10,20,0.8)',padding:'6px 14px',borderRadius:6,color:'#ff6b6b',fontSize:11,fontFamily:'sans-serif' }}>⚠️ Error</div>
  );

  const t = data.tournament;
  const regCount = data.registrations?.length || t.registered_count || 0;
  const nations = t.eligible_nations ? t.eligible_nations.split(',').slice(0,6).join(' · ') : '';

  const items = [
    `🏆 ${t.name}`,
    `🎮 ${t.game || 'Esports'}`,
    t.prize_pool ? `💰 Prize: ${t.prize_pool}` : '',
    `📋 ${regCount}/${t.max_players || '?'} Teams`,
    t.format ? `⚡ ${t.format}` : '',
    t.tournament_date ? `📅 ${new Date(t.tournament_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}` : '',
    nations ? `🌍 ${nations}` : '',
  ].filter(Boolean);

  const tickerText = items.join('   ◆   ') + '   ◆   ';

  return (
    <div style={{ position:'fixed',bottom:0,left:0,right:0,fontFamily:'sans-serif',pointerEvents:'none' }}>
      <div style={{
        background:'linear-gradient(90deg,rgba(10,12,25,0.85) 0%,rgba(20,22,40,0.85) 50%,rgba(10,12,25,0.85) 100%)',
        backdropFilter:'blur(12px)',
        borderTop:'1px solid rgba(255,255,255,0.08)',
        padding:'10px 0',overflow:'hidden',position:'relative',
      }}>
        <div style={{ display:'flex',whiteSpace:'nowrap',animation:'tickerScroll 30s linear infinite' }}>
          <span style={{ color:'#c8c8e0',fontSize:15,fontWeight:600,letterSpacing:0.5,paddingLeft:'100%' }}>
            {tickerText}{tickerText}
          </span>
        </div>
      </div>
      <style>{`
        @keyframes tickerScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}
