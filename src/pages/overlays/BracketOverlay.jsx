import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = 'https://6a5226b5047f5c59d961130e.base44.app/api/apps/6a5226b5047f5c59d961130e/functions/discordAuth';

export default function BracketOverlay() {
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
    const interval = setInterval(fetchData, 12000);
    return () => clearInterval(interval);
  }, [tournamentId]);

  if (loading) return null;
  if (error || !data?.tournament) return (
    <div style={{ position:'fixed',top:20,right:20,background:'rgba(10,10,20,0.8)',padding:'8px 16px',borderRadius:8,color:'#ff6b6b',fontSize:12,fontFamily:'sans-serif' }}>⚠️ Overlay Error</div>
  );

  const t = data.tournament;
  const matches = data.matches || [];
  const byRound = {};
  matches.forEach(m => {
    const r = m.round || 1;
    if (!byRound[r]) byRound[r] = [];
    byRound[r].push(m);
  });
  const rounds = Object.keys(byRound).sort((a,b) => Number(a) - Number(b));

  return (
    <div style={{ position:'fixed',inset:0,padding:'40px 60px',fontFamily:'sans-serif',pointerEvents:'none',overflow:'hidden' }}>
      <div style={{ textAlign:'center',marginBottom:24 }}>
        <div style={{ color:'#e8e8f0',fontSize:22,fontWeight:800,letterSpacing:1 }}>{t.name}</div>
        <div style={{ color:'#888',fontSize:13,marginTop:2 }}>Bracket · {t.format || 'Single Elimination'}</div>
      </div>
      <div style={{ display:'flex',gap:40,justifyContent:'center',alignItems:'flex-start' }}>
        {rounds.map((r, ri) => (
          <div key={r} style={{ display:'flex',flexDirection:'column',gap:12 }}>
            <div style={{ color:'#999',fontSize:11,fontWeight:600,letterSpacing:1,textTransform:'uppercase',textAlign:'center',marginBottom:4 }}>
              {ri === rounds.length-1 ? 'Final' : ri === rounds.length-2 ? 'Semi-Final' : `Round ${r}`}
            </div>
            {byRound[r].map((m, mi) => {
              const p1 = m.player1 || {}; const p2 = m.player2 || {};
              const w1 = m.winner && m.winner.id && String(m.winner.id) === String(p1.id);
              const w2 = m.winner && m.winner.id && String(m.winner.id) === String(p2.id);
              return (
                <div key={mi} style={{
                  background:'rgba(12,14,28,0.75)',backdropFilter:'blur(10px)',borderRadius:8,
                  border:`1px solid ${m.status==='completed'?'rgba(100,200,100,0.2)':'rgba(255,255,255,0.06)'}`,
                  overflow:'hidden',minWidth:200,marginTop: ri > 0 ? `${mi * 8}px` : 0,
                }}>
                  <div style={{ padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                      <span style={{ color: w1 ? '#50ff80' : '#c0c0d0',fontSize:13,fontWeight: w1?700:500 }}>{p1.name || 'TBD'}</span>
                      <span style={{ color: w1 ? '#50ff80' : '#666',fontSize:14,fontWeight:700 }}>{p1.score ?? '-'}</span>
                    </div>
                  </div>
                  <div style={{ padding:'8px 12px' }}>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                      <span style={{ color: w2 ? '#50ff80' : '#c0c0d0',fontSize:13,fontWeight: w2?700:500 }}>{p2.name || 'TBD'}</span>
                      <span style={{ color: w2 ? '#50ff80' : '#666',fontSize:14,fontWeight:700 }}>{p2.score ?? '-'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ position:'fixed',bottom:16,left:'50%',transform:'translateX(-50%)',display:'flex',alignItems:'center',gap:6 }}>
        <div style={{ width:6,height:6,borderRadius:'50%',background:'#50ff80',animation:'pulse 2s infinite' }} />
        <span style={{ color:'#555',fontSize:10 }}>LIVE</span>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
