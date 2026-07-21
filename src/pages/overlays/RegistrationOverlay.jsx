import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = 'https://6a5226b5047f5c59d961130e.base44.app/api/apps/6a5226b5047f5c59d961130e/functions/discordAuth';

export default function RegistrationOverlay() {
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
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [tournamentId]);

  if (loading) return null;
  if (error || !data?.tournament) return (
    <div style={{ position:'fixed',top:20,right:20,background:'rgba(10,10,20,0.8)',padding:'8px 16px',borderRadius:8,color:'#ff6b6b',fontSize:12,fontFamily:'sans-serif' }}>⚠️ Overlay Error</div>
  );

  const t = data.tournament;
  const regs = data.registrations || [];
  const max = t.max_players || 0;
  const filled = t.registered_count || regs.length;
  const pct = max > 0 ? Math.min(100, Math.round((filled / max) * 100)) : 0;
  const isOpen = t.status === 'registration_open';

  return (
    <div style={{ position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif',pointerEvents:'none' }}>
      <div style={{
        background:'rgba(10,12,25,0.7)',backdropFilter:'blur(16px)',borderRadius:16,
        border:'1px solid rgba(255,255,255,0.08)',padding:'40px 60px',minWidth:480,
        textAlign:'center',opacity:0,animation:'regFadeIn 0.6s ease-out forwards',
      }}>
        <div style={{ color:'#e8e8f0',fontSize:22,fontWeight:800,marginBottom:4 }}>{t.name}</div>
        <div style={{ marginBottom:20 }}>
          <span style={{
            display:'inline-block',padding:'3px 12px',borderRadius:6,fontSize:11,fontWeight:700,letterSpacing:1,
            background: isOpen ? 'rgba(80,255,120,0.15)' : 'rgba(255,100,100,0.15)',
            color: isOpen ? '#50ff80' : '#ff6060',
          }}>
            {isOpen ? '● REGISTRATION OPEN' : '✕ REGISTRATION CLOSED'}
          </span>
        </div>

        <div style={{ marginBottom:12 }}>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
            <span style={{ color:'#c0c0d0',fontSize:14,fontWeight:600 }}>{filled} / {max} Teams</span>
            <span style={{ color:'#888',fontSize:14,fontWeight:700 }}>{pct}%</span>
          </div>
          <div style={{ width:'100%',height:10,background:'rgba(255,255,255,0.06)',borderRadius:5,overflow:'hidden' }}>
            <div style={{
              height:'100%',borderRadius:5,
              background: pct >= 100 ? 'linear-gradient(90deg,#50ff80,#40cc70)' : 'linear-gradient(90deg,#5865F2,#9b59ff)',
              width: `${pct}%`,transition:'width 1s ease',
            }} />
          </div>
        </div>

        {regs.length > 0 && (
          <div style={{ marginTop:16,maxHeight:120,overflow:'hidden',textAlign:'left' }}>
            <div style={{ animation: 'regScroll 20s linear infinite' }}>
              {regs.concat(regs).map((r, i) => (
                <div key={i} style={{ display:'inline-block',margin:'0 4px',padding:'4px 12px',background:'rgba(255,255,255,0.04)',borderRadius:6,fontSize:12,color:'#a0a0b0' }}>
                  {r.team_name || 'Unknown'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes regFadeIn { from { opacity:0; transform: scale(0.95); } to { opacity:1; transform: scale(1); } }
        @keyframes regScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}
