import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = 'https://6a5226b5047f5c59d961130e.base44.app/api/apps/6a5226b5047f5c59d961130e/functions/discordAuth';

export default function MatchOverlay() {
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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [tournamentId]);

  if (loading) return null;
  if (error || !data?.tournament) return (
    <div style={{ position:'fixed',bottom:20,right:20,background:'rgba(10,10,20,0.8)',padding:'8px 16px',borderRadius:8,color:'#ff6b6b',fontSize:12,fontFamily:'sans-serif' }}>⚠️ Overlay Error</div>
  );

  const t = data.tournament;
  const matches = data.matches || [];
  const currentMatch = matches.find(m => m.status === 'in_progress') || matches.find(m => m.status === 'pending' || m.status === 'scheduled');

  if (!currentMatch) return (
    <div style={{ position:'fixed',bottom:80,left:'50%',transform:'translateX(-50%)',fontFamily:'sans-serif' }}>
      <div style={{ background:'rgba(10,12,25,0.75)',backdropFilter:'blur(12px)',borderRadius:12,border:'1px solid rgba(255,255,255,0.08)',padding:'16px 32px',textAlign:'center' }}>
        <div style={{ color:'#a0a0b0',fontSize:14,letterSpacing:2,textTransform:'uppercase' }}>No Active Match</div>
        <div style={{ color:'#e0e0f0',fontSize:18,fontWeight:700,marginTop:4 }}>{t.name}</div>
      </div>
    </div>
  );

  const p1 = currentMatch.player1 || {};
  const p2 = currentMatch.player2 || {};
  const isLive = currentMatch.status === 'in_progress';

  return (
    <div style={{ position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif',pointerEvents:'none' }}>
      <div style={{ display:'flex',alignItems:'center',gap:0,opacity:0,animation:'matchFadeIn 0.6s ease-out forwards' }}>
        <div style={{ background:'rgba(20,30,60,0.75)',backdropFilter:'blur(16px)',borderRadius:'16px 0 0 16px',border:'1px solid rgba(80,120,255,0.3)',padding:'28px 40px',minWidth:280,textAlign:'center' }}>
          <div style={{ color:'#7a9aff',fontSize:13,fontWeight:600,letterSpacing:1,textTransform:'uppercase',marginBottom:8 }}>Team 1</div>
          <div style={{ color:'#ffffff',fontSize:26,fontWeight:800,textShadow:'0 2px 8px rgba(0,0,0,0.5)' }}>{p1.name || 'TBD'}</div>
          {p1.score !== undefined && p1.score !== null && <div style={{ color:'#4080ff',fontSize:48,fontWeight:900,marginTop:8 }}>{p1.score}</div>}
        </div>
        <div style={{ background:'rgba(10,12,25,0.9)',backdropFilter:'blur(16px)',padding:'28px 24px',display:'flex',flexDirection:'column',alignItems:'center',gap:6,borderTop:'1px solid rgba(255,255,255,0.1)',borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          {isLive && <div style={{ display:'flex',alignItems:'center',gap:4,background:'#ff3333',padding:'2px 8px',borderRadius:4,marginBottom:4 }}>
            <div style={{ width:6,height:6,borderRadius:'50%',background:'#fff',animation:'pulse 1.5s infinite' }} />
            <span style={{ color:'#fff',fontSize:10,fontWeight:700,letterSpacing:1 }}>LIVE</span>
          </div>}
          <div style={{ color:'#888',fontSize:20,fontWeight:800 }}>VS</div>
          <div style={{ color:'#666',fontSize:11,fontWeight:500 }}>{'Group ' + (currentMatch.group || '') || ('Round ' + (currentMatch.round || 1))}</div>
          <div style={{ color:'#555',fontSize:10 }}>Match #{currentMatch.match_number || ''}</div>
        </div>
        <div style={{ background:'rgba(60,20,30,0.75)',backdropFilter:'blur(16px)',borderRadius:'0 16px 16px 0',border:'1px solid rgba(255,80,80,0.3)',padding:'28px 40px',minWidth:280,textAlign:'center' }}>
          <div style={{ color:'#ff7a7a',fontSize:13,fontWeight:600,letterSpacing:1,textTransform:'uppercase',marginBottom:8 }}>Team 2</div>
          <div style={{ color:'#ffffff',fontSize:26,fontWeight:800,textShadow:'0 2px 8px rgba(0,0,0,0.5)' }}>{p2.name || 'TBD'}</div>
          {p2.score !== undefined && p2.score !== null && <div style={{ color:'#ff4040',fontSize:48,fontWeight:900,marginTop:8 }}>{p2.score}</div>}
        </div>
      </div>
      <div style={{ position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'rgba(10,12,25,0.7)',backdropFilter:'blur(8px)',padding:'6px 20px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ color:'#c0c0d0',fontSize:13,fontWeight:600 }}>{t.name}</span>
        {t.prize_pool && <span style={{ color:'#888',fontSize:12,marginLeft:12 }}>💰 {t.prize_pool}</span>}
      </div>
      <style>{'@keyframes matchFadeIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}'}</style>
    </div>
  );
}
