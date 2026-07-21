import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = 'https://6a5226b5047f5c59d961130e.base44.app/api/apps/6a5226b5047f5c59d961130e/functions/discordAuth';

export default function GroupsOverlay() {
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
  const groups = data.groups || [];
  const groupStandings = data.groupStandings || {};
  const standings = data.standings || [];

  if (groups.length === 0) return (
    <div style={{ position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:'rgba(10,12,25,0.75)',backdropFilter:'blur(12px)',borderRadius:12,border:'1px solid rgba(255,255,255,0.08)',padding:'24px 40px',textAlign:'center',fontFamily:'sans-serif' }}>
      <div style={{ color:'#a0a0b0',fontSize:14 }}>Groups not generated yet</div>
      <div style={{ color:'#e0e0f0',fontSize:18,fontWeight:700,marginTop:4 }}>{t.name}</div>
    </div>
  );

  return (
    <div style={{ position:'fixed',inset:0,padding:'30px 50px',fontFamily:'sans-serif',pointerEvents:'none',overflow:'hidden' }}>
      <div style={{ textAlign:'center',marginBottom:20 }}>
        <div style={{ color:'#e8e8f0',fontSize:22,fontWeight:800,letterSpacing:1 }}>{t.name}</div>
        <div style={{ color:'#888',fontSize:13,marginTop:2 }}>Group Stage</div>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:`repeat(${Math.min(groups.length,4)},1fr)`,gap:16,maxWidth:1400,margin:'0 auto' }}>
        {groups.map((g, gi) => {
          const teams = g.teams || [];
          const teamData = teams.map((name, ti) => {
            const pid = (g.player_ids || [])[ti] || '';
            const st = standings.find(s => s.id === pid);
            return { name, wins: st?.wins || 0, losses: st?.losses || 0 };
          }).sort((a,b) => b.wins - a.wins || a.losses - b.losses);
          return (
            <div key={gi} style={{
              background:'rgba(12,14,28,0.75)',backdropFilter:'blur(10px)',borderRadius:10,
              border:'1px solid rgba(255,255,255,0.06)',overflow:'hidden',
            }}>
              <div style={{ background:'rgba(255,255,255,0.04)',padding:'8px 14px',borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color:'#ccc',fontSize:14,fontWeight:700 }}>Group {g.label || String.fromCharCode(65+gi)}</span>
              </div>
              {teamData.map((team, ti) => (
                <div key={ti} style={{ display:'flex',alignItems:'center',padding:'7px 14px',borderBottom: ti < teamData.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                  <span style={{ color: ti === 0 ? '#50ff80' : '#666',fontSize:12,fontWeight:700,width:20 }}>{ti+1}</span>
                  <span style={{ color: ti < 2 ? '#d0d0e0' : '#a0a0b0',fontSize:13,fontWeight: ti < 2 ? 600 : 400,flex:1,marginLeft:8 }}>{team.name || 'TBD'}</span>
                  <span style={{ color:'#666',fontSize:11,marginRight:8 }}>{team.wins}W-{team.losses}L</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div style={{ position:'fixed',bottom:16,left:'50%',transform:'translateX(-50%)',display:'flex',alignItems:'center',gap:6 }}>
        <div style={{ width:6,height:6,borderRadius:'50%',background:'#50ff80',animation:'pulse 2s infinite' }} />
        <span style={{ color:'#555',fontSize:10 }}>LIVE</span>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
