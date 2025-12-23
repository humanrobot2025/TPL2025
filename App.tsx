
import React, { useState, useEffect, useMemo } from 'react';
import { TEAMS, TOURNAMENT_RULES } from './constants';
import { MatchRecord, MatchStatus, PointsTableRow } from './types';

// Components
import MatchScorer from './components/MatchScorer';
import TeamCards from './components/TeamCards';
import RulesBoard from './components/RulesBoard';
import PointsTable from './components/PointsTable';

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
          
          <button 
            type="button"
            onClick={resetHistory}
            className="text-[10px] bg-red-600/20 hover:bg-red-600/40 text-red-300 px-3 py-1 rounded-md border border-red-900 transition-all font-bold cursor-pointer relative z-50"
          >
            Clear Data
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 mt-8">
        {activeTab === 'scorer' && (
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
        )}

        {activeTab === 'teams' && (
          <TeamCards teams={TEAMS} />
        )}

        {activeTab === 'rules' && (
          <RulesBoard rules={TOURNAMENT_RULES} />
        )}
      </main>

      {/* Bottom Tabs Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <TabButton 
            active={activeTab === 'scorer'} 
            onClick={() => setActiveTab('scorer')} 
            icon={<TrophyIcon />} 
            label="Live Scorer" 
          />
          <TabButton 
            active={activeTab === 'teams'} 
            onClick={() => setActiveTab('teams')} 
            icon={<UsersIcon />} 
            label="Teams" 
          />
          <TabButton 
            active={activeTab === 'rules'} 
            onClick={() => setActiveTab('rules')} 
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
