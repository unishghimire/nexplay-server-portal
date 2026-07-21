import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = 'https://6a5226b5047f5c59d961130e.base44.app/api/apps/6a5226b5047f5c59d961130e/functions/discordAuth';

export default function ChampionOverlay() {
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
    <div style={{ position:'fixed',top:20,right:20,background:'rgba(10,10,20,0.8)',padding:'8px 16px',borderRadius:8,color:'#ff6b6b',fontSize:12,fontFamily:'sans-serif' }}>⚠️ Overlay Error</div>
  );

  const t = data.tournament;
  const standings = data.standings || [];
  const champion = standings[0];

  if (!champion || champion.wins === 0) return (
    <div style={{ position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:'rgba(10,12,25,0.75)',backdropFilter:'blur(12px)',borderRadius:12,border:'1px solid rgba(255,255,255,0.08)',padding:'24px 40px',textAlign:'center',fontFamily:'sans-serif' }}>
      <div style={{ color:'#a0a0b0',fontSize:14 }}>Tournament in progress...</div>
      <div style={{ color:'#e0e0f0',fontSize:18,fontWeight:700,marginTop:4 }}>{t.name}</div>
    </div>
  );

  return (
    <div style={{ position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif',pointerEvents:'none' }}>
      {/* Confetti */}
      {[...Array(30)].map((_,i) => (
        <div key={i} style={{
          position:'fixed',width:8,height:8,
          background: ['#ffd700','#c0c0c0','#ff6b6b','#4ecdc4','#95e1d3'][i%5],
          left: `${5 + (i*3)}%`,top:'-10px',
          animation: `confettiFall ${3 + (i%4)}s linear ${i*0.1}s infinite`,
          borderRadius: i%2 ? '50%' : '2px',
        }} />
      ))}

      <div style={{
        textAlign:'center',opacity:0,animation:'champIn 1s ease-out 0.5s forwards',
        background:'rgba(10,12,25,0.7)',backdropFilter:'blur(20px)',
        borderRadius:24,border:'2px solid rgba(255,215,0,0.3)',
        padding:'48px 80px',
      }}>
        <div style={{ fontSize:60,marginBottom:8 }}>👑</div>
        <div style={{
          color:'#ffd700',fontSize:18,fontWeight:700,letterSpacing:4,textTransform:'uppercase',
          marginBottom:12,
        }}>Champion</div>
        <div style={{
          color:'#ffffff',fontSize:36,fontWeight:900,textShadow:'0 4px 20px rgba(255,215,0,0.3)',
          marginBottom:16,
        }}>{champion.name}</div>
        <div style={{ color:'#c0c0d0',fontSize:16,fontWeight:500,marginBottom:4 }}>
          {t.name}
        </div>
        {t.prize_pool && (
          <div style={{ color:'#ffd700',fontSize:18,fontWeight:700,marginTop:8 }}>
            🏆 {t.prize_pool}
          </div>
        )}
      </div>
      <style>{`
        @keyframes champIn { from { opacity:0; transform: scale(0.8) translateY(20px); } to { opacity:1; transform: scale(1) translateY(0); } }
        @keyframes confettiFall { from { transform: translateY(0) rotate(0deg); } to { transform: translateY(100vh) rotate(360deg); } }
      `}</style>
    </div>
  );
}
