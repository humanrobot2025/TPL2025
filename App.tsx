
import React, { useState, useEffect, useMemo } from 'react';
import { TEAMS, TOURNAMENT_RULES } from './constants';
import { MatchRecord, MatchStatus, PointsTableRow } from './types';

// Components
import MatchScorer from './components/MatchScorer';
import TeamCards from './components/TeamCards';
import RulesBoard from './components/RulesBoard';
import PointsTable from './components/PointsTable';
import AdminPage from './components/AdminPage';
import LiveView from './components/LiveView';
import AdminUnlockForm from './components/AdminUnlockForm';
import PlayerPage from './components/PlayerPage';
import MatchDetail from './components/MatchDetail';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scorer' | 'teams' | 'rules'>('scorer');
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([]);

  // Load state from local storage
  useEffect(() => {
    const savedHistory = localStorage.getItem('tpl_match_history');
    if (savedHistory) {
      try {
        setMatchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse match history", e);
      }
    }
  }, []);

  const handleMatchSave = (record: MatchRecord) => {
    const updatedHistory = [record, ...matchHistory];
    setMatchHistory(updatedHistory);
    localStorage.setItem('tpl_match_history', JSON.stringify(updatedHistory));

  };

  const pointsTable = useMemo(() => {
    const table: Record<string, PointsTableRow> = {};
    TEAMS.forEach(team => {
      table[team.name] = {
        teamName: team.name,
        played: 0,
        won: 0,
        points: 0,
        runsFor: 0,
        ballsFaced: 0,
        runsAgainst: 0,
        ballsBowled: 0
      };
    });

    const oversToBalls = (overs: string | undefined) => {
      if (!overs) return 0;
      // Overs format like '4.2' meaning 4 overs and 2 balls
      const parts = overs.split('.');
      const whole = parseInt(parts[0] || '0', 10) || 0;
      const frac = parts[1] ? parseInt(parts[1], 10) || 0 : 0;
      return whole * 6 + frac;
    };

    matchHistory.forEach(match => {
      if (table[match.teamA]) {
        table[match.teamA].played += 1;
        table[match.teamA].runsFor = (table[match.teamA].runsFor || 0) + (match.scoreA || 0);
        table[match.teamA].ballsFaced = (table[match.teamA].ballsFaced || 0) + oversToBalls(match.oversA);
        table[match.teamA].runsAgainst = (table[match.teamA].runsAgainst || 0) + (match.scoreB || 0);
        table[match.teamA].ballsBowled = (table[match.teamA].ballsBowled || 0) + oversToBalls(match.oversB);
      }
      if (table[match.teamB]) {
        table[match.teamB].played += 1;
        table[match.teamB].runsFor = (table[match.teamB].runsFor || 0) + (match.scoreB || 0);
        table[match.teamB].ballsFaced = (table[match.teamB].ballsFaced || 0) + oversToBalls(match.oversB);
        table[match.teamB].runsAgainst = (table[match.teamB].runsAgainst || 0) + (match.scoreA || 0);
        table[match.teamB].ballsBowled = (table[match.teamB].ballsBowled || 0) + oversToBalls(match.oversA);
      }
      
      if (match.winner !== 'Draw' && table[match.winner]) {
        table[match.winner].won += 1;
        table[match.winner].points += 2;
      } else if (match.winner === 'Draw') {
        if (table[match.teamA]) table[match.teamA].points += 1;
        if (table[match.teamB]) table[match.teamB].points += 1;
      }
    });

    // Convert to array and sort by points, then wins, then NRR
    const rows = Object.values(table).map(r => {
      // compute NRR value for sorting
      const oversFaced = (r.ballsFaced || 0) / 6 || 0;
      const oversBowled = (r.ballsBowled || 0) / 6 || 0;
      const runRateFor = oversFaced > 0 ? (r.runsFor || 0) / oversFaced : 0;
      const runRateAgainst = oversBowled > 0 ? (r.runsAgainst || 0) / oversBowled : 0;
      const nrr = runRateFor - runRateAgainst;
      return { ...r, nrr } as PointsTableRow & { nrr: number };
    });

    rows.sort((a: any, b: any) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.won !== a.won) return b.won - a.won;
      // tie-breaker: run-difference (runsFor - runsAgainst)
      const tieA = (a.runsFor || 0) - (a.runsAgainst || 0);
      const tieB = (b.runsFor || 0) - (b.runsAgainst || 0);
      if (tieB !== tieA) return tieB - tieA;
      return (b.nrr || 0) - (a.nrr || 0);
    });

    return rows as PointsTableRow[];
  }, [matchHistory]);

  const resetHistory = () => {
    if (confirm("Clear all tournament results and match history?")) {
      localStorage.removeItem('tpl_match_history');
      localStorage.removeItem('tpl_active_match');
      localStorage.clear();
      window.location.href = window.location.pathname; // Hard reload
    }
  };

  // Simple hash routing: '', '#/admin', '#/live', '#/player/:name', '#/match/:id'
  const [route, setRoute] = useState<'root' | 'admin' | 'live' | 'player' | 'match'>(() => {
    const h = window.location.hash || '';
    if (h.startsWith('#/admin')) return 'admin';
    if (h.startsWith('#/live')) return 'live';
    if (h.startsWith('#/player')) return 'player';
    if (h.startsWith('#/match')) return 'match';
    return 'root';
  });
  const [routeParam, setRouteParam] = useState<string | null>(null);

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash || '';
      if (h.startsWith('#/admin')) { setRoute('admin'); setRouteParam(null); }
      else if (h.startsWith('#/live')) { setRoute('live'); setRouteParam(null); }
      else if (h.startsWith('#/player')) { setRoute('player'); setRouteParam(h.split('/')[2] ? decodeURIComponent(h.split('/')[2]) : null); }
      else if (h.startsWith('#/match')) { setRoute('match'); setRouteParam(h.split('/')[2] ? decodeURIComponent(h.split('/')[2]) : null); }
      else { setRoute('root'); setRouteParam(null); }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Active match read from localStorage (keeps in sync for Live View) + BroadcastChannel
  const [activeMatch, setActiveMatch] = useState<any | null>(null);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean | null>(null);


  useEffect(() => {
    // Firestore-based cross-device sync
    let firebaseRef: { close: () => void } | null = null;
    
    const initFirebaseSync = async () => {
      try {
        const fb = await import('./src/firebaseClient');
        // Initial fetch
        const initial = await fb.getActiveFirebase();
        if (initial) {
          setActiveMatch(initial);
        }
        // Listen for changes
        firebaseRef = fb.listenActiveFirebase((payload: any) => {
          setActiveMatch(payload);
        }, (connected: boolean) => {
          setFirebaseConnected(connected);
        });
      } catch (err) {
        console.warn('Failed to initialize Firebase sync', err);
        setFirebaseConnected(false);
      }
    };

    initFirebaseSync();

    return () => {
      firebaseRef?.close();
    };
  }, []);

  // ADMIN token gating (client-side). Set `VITE_ADMIN_TOKEN` at build time to require a token.
  // Note: this is client-side only and not cryptographically secure. For real security use a backend.
  const ADMIN_TOKEN = ((import.meta as any).env?.VITE_ADMIN_TOKEN as string) || '';
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (!ADMIN_TOKEN) return true; // no token set → open by default for dev
    try {
      const hashQuery = (window.location.hash || '').split('?')[1] || '';
      const params = new URLSearchParams(hashQuery);
      const key = params.get('key') || params.get('token') || sessionStorage.getItem('tpl_admin_key');
      return key === ADMIN_TOKEN;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    const onHash = () => {
      // Recompute admin auth when hash changes (so URL token works)
      if (!ADMIN_TOKEN) { setIsAdminAuthenticated(true); return; }
      try {
        const hashQuery = (window.location.hash || '').split('?')[1] || '';
        const params = new URLSearchParams(hashQuery);
        const key = params.get('key') || params.get('token') || sessionStorage.getItem('tpl_admin_key');
        setIsAdminAuthenticated(key === ADMIN_TOKEN);
      } catch (e) {
        setIsAdminAuthenticated(false);
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const handleAdminUnlock = (key: string) => {
    if (!ADMIN_TOKEN) { setIsAdminAuthenticated(true); return; }
    if (key === ADMIN_TOKEN) {
      try { sessionStorage.setItem('tpl_admin_key', key); } catch (e) {}
      setIsAdminAuthenticated(true);
      // Add the token to the URL for easy sharing (optional)
      if (!window.location.hash.includes('key=')) {
        const base = window.location.hash.split('?')[0] || '#/admin';
        window.location.hash = base + '?key=' + encodeURIComponent(key);
      }
    } else {
      alert('Invalid admin key');
    }
  };

  const editMatch = (updated: MatchRecord) => {
    const updatedHistory = matchHistory.map(m => m.id === updated.id ? updated : m);
    setMatchHistory(updatedHistory);
    localStorage.setItem('tpl_match_history', JSON.stringify(updatedHistory));

  };

  const deleteMatch = (id: string) => {
    const updatedHistory = matchHistory.filter(m => m.id !== id);
    setMatchHistory(updatedHistory);
    localStorage.setItem('tpl_match_history', JSON.stringify(updatedHistory));

  };

  // Publish a saved match as the active (live) snapshot
    const publishSavedMatch = (m: MatchRecord) => {
      const parseOvers = (overs: string | undefined) => {
        if (!overs) return { totalOvers: 0, legalBallsInOver: 0 };
        const parts = overs.split('.');
        const whole = parseInt(parts[0] || '0', 10) || 0;
        const frac = parts[1] ? parseInt(parts[1], 10) || 0 : 0;
        return { totalOvers: whole, legalBallsInOver: frac };
      };
  
      const a = parseOvers(m.oversA);
      const b = parseOvers(m.oversB);
  
      const payload = {
        status: MatchStatus.RESULT,
        teamA: m.teamA,
        teamB: m.teamB,
        runs: m.scoreA || 0,
        wickets: m.wicketsA || 0,
        runsB: m.scoreB || 0,
        wicketsB: m.wicketsB || 0,
        totalOvers: a.totalOvers,
        legalBallsInOver: a.legalBallsInOver,
        ballHistory: [],
        currentInnings: 1,
        innings1Score: m.scoreA || 0
      } as any;
  
      // send to Firestore
      (async () => {
        try {
          const fb = await import('./src/firebaseClient');
          await fb.setActiveFirebase(payload);
        } catch (e) {
          console.warn('Failed to send active to Firestore', e);
        }
      })();
    };

    const clearActiveMatch = () => {

      (async () => {

        try {

          const fb = await import('./src/firebaseClient');

          await fb.clearActiveFirebase();

        } catch (e) {

          console.warn('Failed to clear active on Firestore', e);

        }

      })();

    };

  // Start a fresh tournament: clear history and active match, set a flag
    const startTournament = () => {
      if (!confirm('Start a new tournament? This will clear all saved match history and reset points.')) return;
      const updatedHistory: MatchRecord[] = [];
      setMatchHistory(updatedHistory);
      localStorage.setItem('tpl_match_history', JSON.stringify(updatedHistory));
      localStorage.setItem('tpl_tournament_started', new Date().toISOString());
      
      // Clear active match in Firebase
      (async () => {
        try {
          const fb = await import('./src/firebaseClient');
          await fb.clearActiveFirebase();
        } catch (e) {
          console.warn('Failed to clear active on Firestore', e);
        }
      })();
  
      // navigate to root scorer
      window.location.hash = '';
    };

  // Load a saved match into scorer setup (prefill teams/overs) and navigate to scorer
  const loadMatchPreset = (m: MatchRecord) => {
    const teamAIdx = TEAMS.findIndex(t => t.name === m.teamA);
    const teamBIdx = TEAMS.findIndex(t => t.name === m.teamB);
    const parts = (m.oversB || m.oversA || '5').split('.');
    const whole = parseInt(parts[0] || '5', 10) || 5;
    const preset = { teamAIdx: (teamAIdx >= 0 ? teamAIdx : 0), teamBIdx: (teamBIdx >= 0 ? teamBIdx : 1), matchOvers: whole };
    try { sessionStorage.setItem('tpl_setup_preset', JSON.stringify(preset)); } catch (e) {}
    // navigate to root where scorer is available for admins
    window.location.hash = '';
  };

  return (
    <div className="min-h-screen stadium-bg text-white pb-20 overflow-x-hidden">
      {/* Header */}
      <header className="py-6 px-4 bg-black/60 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 p-2 rounded-full shadow-lg">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bebas tracking-wider text-yellow-400 drop-shadow-lg leading-none">
                Treasury Premier League
              </h1>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Season 2 Scorer Portal</span>
            </div>
          </div>
          
          {route === 'live' ? (
            <div className="text-[10px] bg-yellow-400/10 text-yellow-400 px-3 py-1 rounded-md border border-yellow-400/20 transition-all font-bold">Public Live Display</div>
          ) : (
            <div className="flex items-center gap-2">
              <a href="#/live" className="text-[10px] bg-white/5 hover:bg-white/10 text-white px-3 py-1 rounded-md border border-white/10 transition-all font-bold">Live View</a>
              {/* Show Admin link only when no ADMIN_TOKEN is set (open by default) or when user is authenticated */}
              {( !ADMIN_TOKEN || isAdminAuthenticated ) && (
                <a href="#/admin" className="text-[10px] bg-yellow-400 hover:bg-yellow-300 text-black px-3 py-1 rounded-md border border-yellow-400 transition-all font-bold">Admin</a>
              )}

              {/* Clear data / lock controls are admin-only when token set */}
              {isAdminAuthenticated ? (
                <>
                  <button 
                    type="button"
                    onClick={resetHistory}
                    className="text-[10px] bg-red-600/20 hover:bg-red-600/40 text-red-300 px-3 py-1 rounded-md border border-red-900 transition-all font-bold cursor-pointer relative z-50"
                  >
                    Clear Data
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // lock admin (clear session key)
                      try { sessionStorage.removeItem('tpl_admin_key'); } catch (e) {}
                      setIsAdminAuthenticated(false);
                      // remove token from hash if present
                      if (window.location.hash.includes('key=')) {
                        const base = window.location.hash.split('?')[0] || '#/admin';
                        window.location.hash = base;
                      }
                      alert('Admin locked — you are now in view-only mode.');
                    }}
                    className="text-[10px] bg-gray-700/20 hover:bg-gray-700/40 text-gray-200 px-3 py-1 rounded-md border border-gray-700 transition-all font-bold"
                  >
                    Lock Admin
                  </button>
                </>
              ) : (
                // when not authenticated and token set, hide clear data and admin link to avoid accidental privilege exposure
                null
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 mt-8">
        {route === 'admin' && (
          isAdminAuthenticated ? (
            <AdminPage teams={TEAMS} matchHistory={matchHistory} onUpdateMatch={editMatch} onDeleteMatch={deleteMatch} onSetActiveMatch={publishSavedMatch} onClearActiveMatch={clearActiveMatch} onStartTournament={startTournament} onLoadMatchPreset={loadMatchPreset} />
          ) : (
            <div className="max-w-2xl mx-auto px-4 mt-12 space-y-6 text-center">
              <h2 className="text-2xl font-bebas text-yellow-400">Admin Access Required</h2>
              <p className="text-gray-300">This page is protected. Append <code className="bg-white/5 px-2 py-1 rounded">?key=YOUR_TOKEN</code> to the URL, or enter your admin token below.</p>
              <AdminUnlockForm onUnlock={handleAdminUnlock} showExampleLink={!!(import.meta as any).env?.VITE_ADMIN_TOKEN} />
            </div>
          )
        )}

        {route === 'player' && routeParam && (
          <PlayerPage playerName={routeParam} matchHistory={matchHistory} onBack={() => window.location.hash = ''} />
        )}

        {route === 'match' && routeParam && (
          (() => {
            const m = matchHistory.find(mm => mm.id === routeParam);
            if (m) return <MatchDetail match={m} onBack={() => window.location.hash = ''} />;
            return <div className="max-w-2xl mx-auto px-4 mt-12 text-center text-gray-400">Match not found</div>;
          })()
        )}

        {route === 'live' && (
          <LiveView teams={TEAMS} activeMatch={activeMatch} matchHistory={matchHistory} pointsTable={pointsTable} />
        )}

        {route === 'root' && (
          <>
            {activeTab === 'scorer' && (
              // If an ADMIN_TOKEN is set and user is not authenticated, show a read-only view
              (ADMIN_TOKEN && !isAdminAuthenticated) ? (
                <div className="space-y-8 animate-fade-in">
                  <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl font-bebas text-yellow-400">Public Scoreboard (Read-only)</h2>
                    <p className="text-gray-300">This area is for administrators to run live scoring. If you are an admin, please <a href="#/admin" className="text-yellow-400 underline">unlock the Admin page</a> to control scoring.</p>
                    <AdminUnlockForm onUnlock={handleAdminUnlock} />
                  </div>

                  <LiveView teams={TEAMS} activeMatch={activeMatch} matchHistory={matchHistory} pointsTable={pointsTable} />
                  <PointsTable rows={pointsTable} />
                </div>
              ) : (
                <div className="space-y-8 animate-fade-in">
                  <MatchScorer teams={TEAMS} onSaveMatch={handleMatchSave} />
                  <PointsTable rows={pointsTable} />

                  {/* Match History Section */}
                  {matchHistory.length > 0 && (
                    <div className="mt-12 space-y-6">
                      <h3 className="text-2xl font-bebas text-white tracking-widest border-b border-white/10 pb-2">Match History</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {matchHistory.map((match) => (
                          <div key={match.id} className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-5 hover:bg-black/60 transition-all group">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                              <div className="flex-1 text-center md:text-left">
                                <p className={`text-lg font-bebas tracking-wide ${match.winner === match.teamA ? 'text-yellow-400' : 'text-gray-400'}`}>
                                  {match.teamA}
                                </p>
                                <p className="text-3xl font-bebas text-white">{match.scoreA}/{match.wicketsA} <span className="text-xs text-gray-500 font-sans">({match.oversA} ov)</span></p>
                              </div>
                              
                              <div className="flex flex-col items-center px-4">
                                <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">VS</span>
                                <span className="bg-white/5 text-[10px] text-gray-400 px-2 py-1 rounded-md mt-1">{match.date}</span>
                              </div>

                              <div className="flex-1 text-center md:text-right">
                                <p className={`text-lg font-bebas tracking-wide ${match.winner === match.teamB ? 'text-yellow-400' : 'text-gray-400'}`}>
                                  {match.teamB}
                                </p>
                                <p className="text-3xl font-bebas text-white">{match.scoreB}/{match.wicketsB} <span className="text-xs text-gray-500 font-sans">({match.oversB} ov)</span></p>
                              </div>

                              <div className="absolute top-3 right-3">
                                <a href={`#/match/${encodeURIComponent(match.id)}`} className="text-xs bg-white/5 px-3 py-1 rounded hover:bg-white/10">Details</a>
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5 text-center">
                               <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">
                                 Winner: {match.winner === 'Draw' ? "Match Drawn" : match.winner}
                               </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}

            {activeTab === 'teams' && (
              <TeamCards teams={TEAMS} />
            )}

            {activeTab === 'rules' && (
              <RulesBoard rules={TOURNAMENT_RULES} />
            )}
          </>
        )}
      </main>

      {/* Bottom Tabs Navigation - always visible */}
        <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 z-50">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <TabButton 
              active={route === 'live' || (route === 'root' && activeTab === 'scorer')} 
              onClick={() => {
                // Live: navigate to public live view
                window.location.hash = '#/live';
                setActiveTab('scorer');
              }}
              icon={<TrophyIcon />} 
              label="Live" 
            />
            <TabButton 
              active={route !== 'live' && activeTab === 'teams'} 
              onClick={() => {
                setActiveTab('teams');
                // ensure route shows root content
                window.location.hash = '';
              }} 
              icon={<UsersIcon />} 
              label="Teams" 
            />
            <TabButton 
              active={route !== 'live' && activeTab === 'rules'} 
              onClick={() => {
                setActiveTab('rules');
                window.location.hash = '';
              }}
              icon={<DocumentTextIcon />} 
              label="Rules" 
            />
          </div>
        </nav>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    type="button"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`flex flex-col items-center gap-1 flex-1 py-2 transition-all ${active ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}
  >
    <div className={`p-1 rounded-lg ${active ? 'bg-yellow-400/20' : ''}`}>
      {icon}
    </div>
    <span className="text-[10px] uppercase font-bold tracking-widest">{label}</span>
  </button>
);

const TrophyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const DocumentTextIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export default App;
