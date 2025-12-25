
import React, { useState, useEffect } from 'react';
import { Team, MatchRecord, MatchStatus, BallRecord, MatchPlayerStats } from '../types';

declare const confetti: any;

interface MatchScorerProps {
  teams: Team[];
  onSaveMatch: (record: MatchRecord) => void;
}

const MatchScorer: React.FC<MatchScorerProps> = ({ teams, onSaveMatch }) => {
  const [status, setStatus] = useState<MatchStatus>(MatchStatus.SETUP);
  const [teamAIdx, setTeamAIdx] = useState<number>(0);
  const [teamBIdx, setTeamBIdx] = useState<number>(1);
  const [matchOvers, setMatchOvers] = useState<number>(5);
  
  // Scoring State
  const [currentInnings, setCurrentInnings] = useState<1 | 2>(1);
  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [legalBallsInOver, setLegalBallsInOver] = useState(0);
  const [totalOvers, setTotalOvers] = useState(0);
  const [ballHistory, setBallHistory] = useState<BallRecord[]>([]);
  
  // Professional Tracking
  const [striker, setStriker] = useState<string>('');
  const [nonStriker, setNonStriker] = useState<string>('');
  const [currentBowler, setCurrentBowler] = useState<string>('');
  const [dismissedPlayers, setDismissedPlayers] = useState<string[]>([]);
  const [matchPlayerStats, setMatchPlayerStats] = useState<MatchPlayerStats>({});
  
  // Innings 1 Comparison
  const [innings1Score, setInnings1Score] = useState(0);
  const [innings1Wickets, setInnings1Wickets] = useState(0);
  const [innings1Overs, setInnings1Overs] = useState('0.0');
  const [winner, setWinner] = useState<string>('');
  const [showFullScorecard, setShowFullScorecard] = useState(false);
  const [lastSavedRecord, setLastSavedRecord] = useState<MatchRecord | null>(null);
  const [overCompletePulse, setOverCompletePulse] = useState(false);

  const isInvalidSetup = teamAIdx === teamBIdx;

  // Local state persistence + BroadcastChannel for real-time updates


  React.useEffect(() => {
    // Check for a setup preset (e.g., from Admin -> Start Match)
    try {
      const presetRaw = sessionStorage.getItem('tpl_setup_preset');
      if (presetRaw) {
        const p = JSON.parse(presetRaw);
        if (typeof p.teamAIdx === 'number') setTeamAIdx(p.teamAIdx);
        if (typeof p.teamBIdx === 'number') setTeamBIdx(p.teamBIdx);
        if (typeof p.matchOvers === 'number') setMatchOvers(p.matchOvers);
        sessionStorage.removeItem('tpl_setup_preset');
      }
    } catch (err) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (status !== MatchStatus.SETUP) {
      const payload = {
        status, teamAIdx, teamBIdx, matchOvers, currentInnings, runs, wickets, legalBallsInOver, totalOvers,
        ballHistory, striker, nonStriker, currentBowler, dismissedPlayers, matchPlayerStats,
        innings1Score, innings1Wickets, innings1Overs, winner
      };

      (async () => {
        try {
          const fb = await import('../src/firebaseClient');
          await fb.setActiveFirebase(payload);
        } catch (e) {
          console.warn('Failed to notify Firestore', e);
        }
      })();
    }
  }, [status, teamAIdx, teamBIdx, matchOvers, currentInnings, runs, wickets, legalBallsInOver, totalOvers, 
      ballHistory, striker, nonStriker, currentBowler, dismissedPlayers, matchPlayerStats,
      innings1Score, innings1Wickets, innings1Overs, winner]);

  const battingTeam = currentInnings === 1 ? teams[teamAIdx] : teams[teamBIdx];
  const bowlingTeam = currentInnings === 1 ? teams[teamBIdx] : teams[teamAIdx];

  const resetMatch = (e?: React.MouseEvent) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    // We clear state immediately for better responsiveness
    setStatus(MatchStatus.SETUP);
    setRuns(0);
    setWickets(0);
    setLegalBallsInOver(0);
    setTotalOvers(0);
    setBallHistory([]);
    setStriker('');
    setNonStriker('');
    setCurrentBowler('');
    setDismissedPlayers([]);
    setMatchPlayerStats({});
    setCurrentInnings(1);
    setWinner('');
    setShowFullScorecard(false);
    
    (async () => {
      try {
        const fb = await import('../src/firebaseClient');
        await fb.clearActiveFirebase();
      } catch (err) {
        console.warn('Failed to clear Firestore active match', err);
      }
    })();
  };

  const goToSetup = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setStatus(MatchStatus.SETUP);
  };

  const updatePlayerStats = (playerName: string, type: 'bat' | 'bowl', data: Partial<any>) => {
    setMatchPlayerStats(prev => {
      const current = prev[playerName] || {
        runs: 0, balls: 0, fours: 0, sixes: 0, wickets: 0, oversBowled: 0, ballsBowled: 0, runsConceded: 0
      };
      return {
        ...prev,
        [playerName]: { ...current, ...data }
      };
    });
  };

  const handleBall = (type: 'legal' | 'extra', runVal: number, isWicket: boolean = false) => {
    if (!striker || !nonStriker || !currentBowler) {
      alert("Please select striker, non-striker, and bowler first.");
      return;
    }

    const totalRunsOnBall = runVal;
    const newBall: BallRecord = {
      type,
      runs: runVal,
      isWicket,
      batsman: striker,
      nonStriker: nonStriker,
      bowler: currentBowler
    };

    setRuns(prev => prev + totalRunsOnBall);
    setBallHistory(prev => [...prev, newBall]);

    const bStats = matchPlayerStats[striker] || { runs: 0, balls: 0, fours: 0, sixes: 0, wickets: 0, oversBowled: 0, ballsBowled: 0, runsConceded: 0 };
    if (type === 'legal') {
      updatePlayerStats(striker, 'bat', {
        balls: (bStats.balls || 0) + 1,
        runs: (bStats.runs || 0) + runVal,
        fours: (bStats.fours || 0) + (runVal === 4 ? 1 : 0),
        sixes: (bStats.sixes || 0) + (runVal === 6 ? 1 : 0),
      });
    }

    const bowlStats = matchPlayerStats[currentBowler] || { runs: 0, balls: 0, fours: 0, sixes: 0, wickets: 0, oversBowled: 0, ballsBowled: 0, runsConceded: 0 };
    updatePlayerStats(currentBowler, 'bowl', {
      runsConceded: (bowlStats.runsConceded || 0) + totalRunsOnBall,
      wickets: (bowlStats.wickets || 0) + (isWicket ? 1 : 0),
      ballsBowled: (bowlStats.ballsBowled || 0) + (type === 'legal' ? 1 : 0),
    });

    if (isWicket) {
      setWickets(prev => prev + 1);
      setDismissedPlayers(prev => [...prev, striker]);
      setStriker('');
    }

    if (type === 'legal') {
      const nextBalls = legalBallsInOver + 1;
      if (nextBalls === 6) {
        setTotalOvers(o => o + 1);
        setLegalBallsInOver(0);
        rotateStrike();
        setOverCompletePulse(true);
        setTimeout(() => setOverCompletePulse(false), 1000);
      } else {
        setLegalBallsInOver(nextBalls);
      }
    }

    if (!isWicket && type === 'legal' && (runVal === 1 || runVal === 3)) {
      rotateStrike();
    }
  };

  const undoLastBall = () => {
    if (ballHistory.length === 0) return;
    const lastBall = ballHistory[ballHistory.length - 1];
    setBallHistory(prev => prev.slice(0, -1));

    const totalRunsOnBall = lastBall.runs;
    setRuns(prev => Math.max(0, prev - totalRunsOnBall));

    if (lastBall.isWicket) {
      setWickets(prev => Math.max(0, prev - 1));
      setDismissedPlayers(prev => prev.filter(p => p !== lastBall.batsman));
    }

    setStriker(lastBall.batsman);
    setNonStriker(lastBall.nonStriker);
    setCurrentBowler(lastBall.bowler);

    if (lastBall.type === 'legal') {
      if (legalBallsInOver === 0 && totalOvers > 0) {
        setTotalOvers(prev => prev - 1);
        setLegalBallsInOver(5);
      } else {
        setLegalBallsInOver(prev => Math.max(0, prev - 1));
      }
    }

    const bStats = matchPlayerStats[lastBall.batsman];
    if (bStats && lastBall.type === 'legal') {
      updatePlayerStats(lastBall.batsman, 'bat', {
        balls: Math.max(0, bStats.balls - 1),
        runs: Math.max(0, bStats.runs - lastBall.runs),
        fours: Math.max(0, bStats.fours - (lastBall.runs === 4 ? 1 : 0)),
        sixes: Math.max(0, bStats.sixes - (lastBall.runs === 6 ? 1 : 0)),
      });
    }

    const bowlStats = matchPlayerStats[lastBall.bowler];
    if (bowlStats) {
      updatePlayerStats(lastBall.bowler, 'bowl', {
        runsConceded: Math.max(0, bowlStats.runsConceded - totalRunsOnBall),
        wickets: Math.max(0, bowlStats.wickets - (lastBall.isWicket ? 1 : 0)),
        ballsBowled: Math.max(0, bowlStats.ballsBowled - (lastBall.type === 'legal' ? 1 : 0)),
      });
    }
  };

  const rotateStrike = () => {
    const oldStriker = striker;
    setStriker(nonStriker);
    setNonStriker(oldStriker);
  };

  const startMatch = () => {
    if (isInvalidSetup) return;
    setStatus(currentInnings === 1 ? MatchStatus.INNINGS_1 : MatchStatus.INNINGS_2);
  };

  const finishInnings = () => {
    if (currentInnings === 1) {
      setInnings1Score(runs);
      setInnings1Wickets(wickets);
      setInnings1Overs(`${totalOvers}.${legalBallsInOver}`);
      setCurrentInnings(2);
      setRuns(0);
      setWickets(0);
      setLegalBallsInOver(0);
      setTotalOvers(0);
      setBallHistory([]);
      setStriker('');
      setNonStriker('');
      setCurrentBowler('');
      setDismissedPlayers([]);
      setStatus(MatchStatus.INNINGS_2);
    } else {
      let winnerName = 'Draw';
      if (runs > innings1Score) winnerName = teams[teamBIdx].name;
      else if (runs < innings1Score) winnerName = teams[teamAIdx].name;
      
      setWinner(winnerName);
      if (winnerName !== 'Draw') confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

      const record: MatchRecord = {
        id: Date.now().toString(),
        teamA: teams[teamAIdx].name,
        teamB: teams[teamBIdx].name,
        scoreA: innings1Score, wicketsA: innings1Wickets, oversA: innings1Overs,
        scoreB: runs, wicketsB: wickets, oversB: `${totalOvers}.${legalBallsInOver}`,
        winner: winnerName, 
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        playerStats: { ...matchPlayerStats }
      };

      onSaveMatch(record);
      setLastSavedRecord(record);
      setStatus(MatchStatus.RESULT);
    }
  };

  const escapeCSV = (v: any) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const exportMatchCSV = (record: MatchRecord) => {
    const lines: string[] = [];
    // Top-level match info
    lines.push(['MatchID','Date','TeamA','TeamB','ScoreA','WktsA','OversA','ScoreB','WktsB','OversB','Winner'].join(','));
    lines.push([
      escapeCSV(record.id), escapeCSV(record.date), escapeCSV(record.teamA), escapeCSV(record.teamB),
      escapeCSV(record.scoreA), escapeCSV(record.wicketsA), escapeCSV(record.oversA),
      escapeCSV(record.scoreB), escapeCSV(record.wicketsB), escapeCSV(record.oversB), escapeCSV(record.winner)
    ].join(','));
    lines.push('');

    // Player batting stats header
    lines.push(['Batter','Runs','Balls','4s','6s','Wickets (bowling)','OversBowled','RunsConceded'].join(','));
    const stats = record.playerStats || {};
    const playerNames = Object.keys(stats);
    if (playerNames.length === 0) {
      lines.push('No player stats');
    } else {
      playerNames.forEach(name => {
        const s: any = stats[name] || {};
        lines.push([
          escapeCSV(name), escapeCSV(s.runs || 0), escapeCSV(s.balls || 0), escapeCSV(s.fours || 0), escapeCSV(s.sixes || 0),
          escapeCSV(s.wickets || 0), escapeCSV(s.oversBowled || 0), escapeCSV(s.runsConceded || 0)
        ].join(','));
      });
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `match-${record.id}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const getOverDisplay = (balls: number) => `${Math.floor(balls/6)}.${balls%6}`;

  // Use explicit typing for Object.entries to resolve 'unknown' type errors
  const participatedBatters = Object.entries(matchPlayerStats)
    .filter(([_, s]: [string, any]) => (s.balls || 0) > 0 || (s.runs || 0) > 0)
    .map(([name, s]: [string, any]) => ({ name, ...s }));

  // Use explicit typing for Object.entries to resolve 'unknown' type errors
  const participatedBowlers = Object.entries(matchPlayerStats)
    .filter(([_, s]: [string, any]) => (s.ballsBowled || 0) > 0)
    .map(([name, s]: [string, any]) => ({ name, ...s }));

  return (
    <div className="bg-black/70 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl animate-bounce-in max-w-4xl mx-auto mb-8 relative">
      
      {status === MatchStatus.SETUP && (
        <div className="space-y-6 max-w-xl mx-auto text-center">
          <div className="mb-4">
            <h2 className="text-3xl font-bebas text-yellow-400 tracking-wider">Tournament Match Setup</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Select teams and overs to proceed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">Batting Team</label>
              <select 
                value={teamAIdx} onChange={(e) => setTeamAIdx(parseInt(e.target.value))}
                className={`w-full bg-gray-900 text-white p-4 rounded-2xl border outline-none transition-all ${isInvalidSetup ? 'border-red-500/50' : 'border-white/10 focus:ring-2 focus:ring-yellow-400'}`}
              >
                {teams.map((t, i) => <option key={t.id} value={i}>{t.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">Bowling Team</label>
              <select 
                value={teamBIdx} onChange={(e) => setTeamBIdx(parseInt(e.target.value))}
                className={`w-full bg-gray-900 text-white p-4 rounded-2xl border outline-none transition-all ${isInvalidSetup ? 'border-red-500/50' : 'border-white/10 focus:ring-2 focus:ring-yellow-400'}`}
              >
                {teams.map((t, i) => <option key={t.id} value={i}>{t.name}</option>)}
              </select>
            </div>
          </div>
          
          {isInvalidSetup && (
            <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl animate-pulse">
              <p className="text-red-400 text-xs font-bold uppercase tracking-widest">Two teams cannot be the same!</p>
            </div>
          )}

          <div className="space-y-2 text-left max-w-xs mx-auto">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">Overs per Innings</label>
            <select 
              value={matchOvers} onChange={(e) => setMatchOvers(parseInt(e.target.value))}
              className="w-full bg-gray-900 text-white p-4 rounded-2xl border border-white/10 focus:ring-2 focus:ring-yellow-400 outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(o => <option key={o} value={o}>{o} Overs</option>)}
            </select>
          </div>

          <button 
            type="button"
            onClick={startMatch} 
            disabled={isInvalidSetup}
            className={`w-full font-bebas text-2xl py-4 rounded-2xl shadow-xl transition-all active:scale-95 mt-4 ${isInvalidSetup ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50' : 'bg-yellow-400 hover:bg-yellow-300 text-black'}`}
          >
            {ballHistory.length > 0 ? 'Resume Scoring' : 'Start Match'}
          </button>
        </div>
      )}

      {(status === MatchStatus.INNINGS_1 || status === MatchStatus.INNINGS_2) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Header Action Row */}
          <div className="lg:col-span-12 flex justify-between items-center mb-2 px-1 relative z-30">
            <button 
              type="button"
              onClick={goToSetup} 
              className="flex items-center gap-2 text-[10px] font-black text-white hover:text-yellow-400 uppercase tracking-widest transition-all bg-white/5 px-4 py-2 rounded-full border border-white/10 z-50 cursor-pointer active:scale-95"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
              Exit to Setup
            </button>
            <div className="flex gap-2">
               <span className="text-[9px] font-bold bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-2 py-1 rounded">MATCH IN PROGRESS</span>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className={`bg-gray-900/80 p-6 rounded-3xl border transition-all duration-500 ${overCompletePulse ? 'border-yellow-400 shadow-[0_0_30px_rgba(251,191,36,0.2)]' : 'border-white/5 shadow-inner'}`}>
              <div className="flex justify-between items-end mb-4">
                <div className="flex-1">
                  <h3 className="text-yellow-400 font-bebas text-3xl tracking-wide leading-none">{battingTeam.name}</h3>
                  <div className="flex gap-4 mt-1">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Innings {currentInnings}</p>
                    {status === MatchStatus.INNINGS_2 && (
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Target: {innings1Score + 1}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-gray-400 font-bebas text-3xl leading-none">Overs: {totalOvers}.{legalBallsInOver} <span className="text-gray-600 text-sm">/ {matchOvers}.0</span></p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="scoreboard-font text-8xl px-8 py-3 rounded-2xl border-2 border-white/10 shadow-2xl flex-shrink-0">
                  {runs}/{wickets}
                </div>
                {status === MatchStatus.INNINGS_2 && (
                   <div className="flex-1 text-center bg-yellow-400/10 rounded-2xl p-5 border border-yellow-400/20 w-full">
                     <p className="text-white font-bebas text-4xl leading-tight">Need {Math.max(0, innings1Score - runs + 1)} runs</p>
                     <p className="text-yellow-400/60 font-bold text-[10px] uppercase tracking-widest mt-1">
                       {(matchOvers * 6) - (totalOvers * 6 + legalBallsInOver)} balls remaining
                     </p>
                   </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-2xl border transition-all ${striker ? 'bg-yellow-400/10 border-yellow-400/30 shadow-[inset_0_0_20px_rgba(251,191,36,0.05)]' : 'bg-white/5 border-white/10'}`}>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Striker (*)</p>
                <select value={striker} onChange={(e) => setStriker(e.target.value)} className="w-full bg-transparent text-white font-bold outline-none">
                  <option value="" className="bg-gray-900 text-white">Select Batter</option>
                  {battingTeam.players.filter(p => !dismissedPlayers.includes(p.name) && p.name !== nonStriker).map(p => (
                    <option key={p.name} value={p.name} className="bg-gray-900 text-white">{p.name}</option>
                  ))}
                </select>
              </div>

              <div className={`p-4 rounded-2xl border transition-all ${nonStriker ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'}`}>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Non-Striker</p>
                <select value={nonStriker} onChange={(e) => setNonStriker(e.target.value)} className="w-full bg-transparent text-white font-bold outline-none">
                  <option value="" className="bg-gray-900 text-white">Select Batter</option>
                  {battingTeam.players.filter(p => !dismissedPlayers.includes(p.name) && p.name !== striker).map(p => (
                    <option key={p.name} value={p.name} className="bg-gray-900 text-white">{p.name}</option>
                  ))}
                </select>
              </div>

              <div className={`p-4 rounded-2xl border transition-all ${currentBowler ? 'bg-blue-600/10 border-blue-600/30 shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]' : 'bg-white/5 border-white/10'}`}>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Bowler</p>
                <select value={currentBowler} onChange={(e) => setCurrentBowler(e.target.value)} className="w-full bg-transparent text-blue-400 font-bold outline-none">
                  <option value="" className="bg-gray-900 text-white">Select Bowler</option>
                  {bowlingTeam.players.map(p => (
                    <option key={p.name} value={p.name} className="bg-gray-900 text-white">{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Legal Ball Score</label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {[0, 1, 2, 3, 4, 6].map(r => (
                    <button key={r} type="button" onClick={() => handleBall('legal', r)} className="bg-gray-800 hover:bg-gray-700 text-white font-bebas text-3xl py-4 rounded-2xl border-b-4 border-gray-950 transition-all active:translate-y-1 active:border-b-0">
                      {r}
                    </button>
                  ))}
                  <button type="button" onClick={() => handleBall('legal', 0, true)} className="bg-red-600 hover:bg-red-500 text-white font-bebas text-3xl py-4 rounded-2xl border-b-4 border-red-950 transition-all active:translate-y-1 active:border-b-0">
                    WKT
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] px-1">Extra Runs (Wide / No Ball)</label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map(extra => (
                    <button key={extra} type="button" onClick={() => handleBall('extra', extra)} className="bg-blue-600 hover:bg-blue-500 text-white font-bebas text-2xl py-3 rounded-xl border-b-4 border-blue-900 transition-all active:translate-y-1 active:border-b-0">
                      +{extra}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button type="button" onClick={undoLastBall} className="bg-red-500 hover:bg-red-400 text-white font-bebas text-xl py-3 rounded-xl border-b-4 border-red-900 active:translate-y-1 active:border-b-0 flex items-center justify-center gap-2">
                   UNDO ↩
                </button>
                <button type="button" onClick={rotateStrike} className="bg-purple-600 hover:bg-purple-500 text-white font-bebas text-xl py-3 rounded-xl border-b-4 border-purple-900 active:translate-y-1 active:border-b-0 flex items-center justify-center gap-2">
                   ROTATE 🔄
                </button>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button type="button" onClick={finishInnings} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bebas text-2xl py-4 rounded-2xl shadow-xl transition-all">
                  {currentInnings === 1 ? 'End First Innings' : 'Save Final Result'}
                </button>
                <button 
                    type="button" 
                    onClick={resetMatch} 
                    className="bg-gray-900 px-6 py-4 rounded-2xl text-[10px] font-black uppercase text-red-500 border border-red-900/30 hover:bg-red-900/10 transition-colors z-30 relative"
                >
                    Clear & Reset
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-black/50 p-6 rounded-3xl border border-white/5 h-full">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Ball Tracker</h4>
              <div className="flex flex-wrap gap-2 mb-8">
                {ballHistory.slice(-12).reverse().map((b, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${
                    b.isWicket ? 'bg-red-600 border-red-400' : (b.type === 'extra' ? 'bg-blue-600 border-blue-400' : 'bg-gray-800 border-gray-600')
                  }`}>
                    {b.isWicket ? 'W' : (b.type === 'extra' ? `E${b.runs}` : b.runs)}
                  </div>
                ))}
              </div>

              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Wickets</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {dismissedPlayers.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs bg-red-900/10 p-2 rounded-lg border border-red-900/20">
                    <span className="text-red-500 font-black shrink-0">W{idx + 1}</span>
                    <span className="text-gray-300 font-bold truncate">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {status !== MatchStatus.SETUP && (
        <div className="mt-8 pt-8 border-t border-white/10">
          <button 
            type="button"
            onClick={() => setShowFullScorecard(!showFullScorecard)}
            className="w-full text-center py-2 text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-yellow-400 transition-colors"
          >
            {showFullScorecard ? 'Hide Detailed Scorecard' : 'View Detailed Scorecard'}
          </button>
          
          {showFullScorecard && (
            <div className="mt-6 space-y-10 animate-fade-in">
              {/* Batting Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                   <div className="w-1 h-5 bg-yellow-400 rounded-full"></div>
                   <h4 className="text-xl font-bebas text-white tracking-widest uppercase">Batting Stats</h4>
                </div>
                <div className="overflow-x-auto rounded-2xl bg-white/5 border border-white/5">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="bg-white/5 text-gray-500 uppercase font-black tracking-widest">
                        <th className="px-4 py-3">Batter</th>
                        <th className="px-4 py-3 text-right">Runs</th>
                        <th className="px-4 py-3 text-right">Balls</th>
                        <th className="px-4 py-3 text-right">4s</th>
                        <th className="px-4 py-3 text-right">6s</th>
                        <th className="px-4 py-3 text-right">SR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {participatedBatters.length > 0 ? participatedBatters.map((s: any) => (
                        <tr key={s.name} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 font-bold text-gray-200">
                            {s.name} {striker === s.name || nonStriker === s.name ? '*' : ''}
                          </td>
                          <td className="px-4 py-3 text-right text-yellow-400 font-black">{s.runs || 0}</td>
                          <td className="px-4 py-3 text-right text-gray-400">{s.balls || 0}</td>
                          <td className="px-4 py-3 text-right text-gray-400">{s.fours || 0}</td>
                          <td className="px-4 py-3 text-right text-gray-400">{s.sixes || 0}</td>
                          <td className="px-4 py-3 text-right text-blue-400 font-medium">
                            {s.balls ? ((s.runs / s.balls) * 100).toFixed(1) : '0.0'}
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-600 italic">No batting stats yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bowling Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                   <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                   <h4 className="text-xl font-bebas text-white tracking-widest uppercase">Bowling Stats</h4>
                </div>
                <div className="overflow-x-auto rounded-2xl bg-white/5 border border-white/5">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="bg-white/5 text-gray-500 uppercase font-black tracking-widest">
                        <th className="px-4 py-3">Bowler</th>
                        <th className="px-4 py-3 text-right">Overs</th>
                        <th className="px-4 py-3 text-right">Runs</th>
                        <th className="px-4 py-3 text-right">Wkts</th>
                        <th className="px-4 py-3 text-right">Econ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {participatedBowlers.length > 0 ? participatedBowlers.map((s: any) => (
                        <tr key={s.name} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 font-bold text-gray-200">
                            {s.name} {currentBowler === s.name ? '*' : ''}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-400">{getOverDisplay(s.ballsBowled || 0)}</td>
                          <td className="px-4 py-3 text-right text-red-400 font-bold">{s.runsConceded || 0}</td>
                          <td className="px-4 py-3 text-right text-green-400 font-black">{s.wickets || 0}</td>
                          <td className="px-4 py-3 text-right text-blue-400 font-medium">
                            {s.ballsBowled ? ((s.runsConceded / (s.ballsBowled / 6))).toFixed(1) : '0.0'}
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-600 italic">No bowling stats yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {status === MatchStatus.RESULT && (
        <div className="text-center py-10 space-y-8 animate-bounce-in">
          <h2 className="text-6xl font-bebas text-yellow-400 tracking-tighter drop-shadow-2xl">
            {winner === 'Draw' ? "MATCH DRAWN!" : `${winner} WON!`}
          </h2>
          <div className="max-w-md mx-auto bg-white/5 p-8 rounded-3xl border border-white/10 shadow-inner">
             <div className="grid grid-cols-2 gap-8 text-center items-center">
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase mb-2 truncate">{teams[teamAIdx].name}</p>
                  <p className="text-5xl font-bebas text-white leading-none">{innings1Score}/{innings1Wickets}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">Overs: {innings1Overs}</p>
                </div>
                <div className="relative">
                  <div className="absolute left-[-1.5rem] top-1/2 -translate-y-1/2 text-yellow-500/20 font-bebas text-4xl">VS</div>
                  <p className="text-[10px] font-black text-gray-500 uppercase mb-2 truncate">{teams[teamBIdx].name}</p>
                  <p className="text-5xl font-bebas text-white leading-none">{runs}/{wickets}</p>
                   <p className="text-xs text-gray-500 font-medium mt-1">Overs: {totalOvers}.{legalBallsInOver}</p>
                </div>
             </div>
          </div>
          <div className="flex flex-col gap-4 max-w-xs mx-auto">
            <button 
              type="button"
              onClick={resetMatch} 
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-bebas text-3xl px-12 py-4 rounded-2xl transition-all shadow-xl active:scale-95"
            >
              Start New Match
            </button>
            <button
              type="button"
              onClick={() => {
                if (lastSavedRecord) exportMatchCSV(lastSavedRecord);
                else {
                  // fallback construct minimal record from current state
                  const fallback: MatchRecord = {
                    id: Date.now().toString(),
                    teamA: teams[teamAIdx].name,
                    teamB: teams[teamBIdx].name,
                    scoreA: innings1Score,
                    wicketsA: innings1Wickets,
                    oversA: innings1Overs,
                    scoreB: runs,
                    wicketsB: wickets,
                    oversB: `${totalOvers}.${legalBallsInOver}`,
                    winner: winner || 'Draw',
                    date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    playerStats: { ...matchPlayerStats }
                  };
                  exportMatchCSV(fallback);
                }
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bebas text-xl px-6 py-3 rounded-2xl transition-all border border-white/5"
            >
              Download CSV
            </button>
            <button 
              type="button"
              onClick={() => setStatus(MatchStatus.SETUP)} 
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bebas text-xl px-12 py-3 rounded-2xl transition-all border border-white/5 active:scale-95"
            >
              Back to Setup
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default MatchScorer;
