import React from 'react';
import { MatchRecord, PointsTableRow, Team } from '../types';
import PointsTable from './PointsTable';

interface LiveViewProps {
  teams: Team[];
  activeMatch: any | null; // structure from tpl_active_match
  matchHistory: MatchRecord[];
  pointsTable: PointsTableRow[];
}

const LiveView: React.FC<LiveViewProps> = ({ teams, activeMatch, matchHistory, pointsTable }) => {
  const teamName = (side: 'A' | 'B') => {
    if (!activeMatch) return '';
    if (side === 'A') {
      if (typeof activeMatch.teamA === 'string' && activeMatch.teamA) return activeMatch.teamA;
      if (typeof activeMatch.teamAIdx === 'number' && teams[activeMatch.teamAIdx]) return teams[activeMatch.teamAIdx].name;
      return activeMatch.teamAName || '';
    }
    if (typeof activeMatch.teamB === 'string' && activeMatch.teamB) return activeMatch.teamB;
    if (typeof activeMatch.teamBIdx === 'number' && teams[activeMatch.teamBIdx]) return teams[activeMatch.teamBIdx].name;
    return activeMatch.teamBName || '';
  };

  // helpers to get current players and current ball
  const striker = activeMatch?.striker || '';
  const nonStriker = activeMatch?.nonStriker || '';
  const bowler = activeMatch?.currentBowler || '';
  const lastBall = activeMatch?.ballHistory && activeMatch.ballHistory.length > 0 ? activeMatch.ballHistory[activeMatch.ballHistory.length - 1] : null;

  const scorecardSource = activeMatch?.playerStats ? activeMatch.playerStats : (matchHistory && matchHistory[0] && matchHistory[0].playerStats) ? matchHistory[0].playerStats : {};

  const renderPlayerRow = (name: string, stats: any) => (
    <div key={name} className="flex items-center justify-between border-b border-white/5 py-2">
      <div className="text-sm text-gray-200">{name}</div>
      <div className="text-xs text-gray-400">{stats ? `${stats.runs} (${stats.balls})` : '–'}</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 mt-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bebas text-yellow-400">Live Scores</h2>
        <div className="text-sm text-gray-400">Read-only public scoreboard (no controls)</div>
      </div>

      {activeMatch ? (
        <div className="bg-black/60 p-8 rounded-3xl border border-white/10 shadow-lg">
          <div className="flex flex-col md:flex-row items-center md:items-stretch gap-6 md:gap-12">
            <div className="flex-1 text-center">
              <div className="text-xs text-gray-400">Innings {activeMatch.currentInnings || 1}</div>
              <div className="text-4xl md:text-5xl font-bebas text-white mt-1">{teamName('A')}</div>
              <div className="text-6xl md:text-7xl font-bebas text-yellow-400 mt-2">
                {/* Show only batting team's score or final scores when both innings present */}
                {(function(){
                  const ci = activeMatch.currentInnings || 1;
                  const bothPresent = (activeMatch.runsB != null) || (activeMatch.status === 'RESULT');
                  if (bothPresent) {
                    return activeMatch.runs ?? 0;
                  }
                  if (ci === 1) {
                    return activeMatch.runs ?? 0;
                  }
                  // innings 2 in progress — show only innings1 summary for team A
                  if (activeMatch.innings1Score != null) return activeMatch.innings1Score;
                  return '—';
                })()
              }</div>
              <div className="text-sm text-gray-400 mt-1">Wickets: {(function(){
                const ci = activeMatch.currentInnings || 1;
                const bothPresent = (activeMatch.runsB != null) || (activeMatch.status === 'RESULT');
                if (bothPresent) return activeMatch.wickets ?? 0;
                if (ci === 1) return activeMatch.wickets ?? 0;
                if (activeMatch.innings1Wickets != null) return activeMatch.innings1Wickets;
                return '—';
              })()}</div>
            </div>

            <div className="text-center md:px-6">
              <div className="text-xl text-gray-300 font-bold">VS</div>
              <div className="text-sm text-gray-400 mt-1">Overs: {activeMatch.totalOvers || 0}.{activeMatch.legalBallsInOver || 0}</div>
              {activeMatch.currentInnings === 2 && activeMatch.innings1Score != null && (
                <div className="text-xs text-gray-400 mt-2">Target: {activeMatch.innings1Score + 1}</div>
              )}

              {/* Current players */}
              <div className="mt-4 bg-white/3 p-3 rounded-md">
                <div className="text-xs text-gray-400 mb-2">Current players</div>
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="text-sm text-gray-200">Striker</div>
                  <div className="text-sm text-yellow-400 font-bold">{striker || '—'}</div>
                  <div className="text-sm text-gray-200">Non-striker</div>
                  <div className="text-sm text-yellow-400 font-bold">{nonStriker || '—'}</div>
                  <div className="text-sm text-gray-200">Bowler</div>
                  <div className="text-sm text-yellow-400 font-bold">{bowler || '—'}</div>
                  <div className="text-sm text-gray-200">Last ball</div>
                  <div className="text-sm text-gray-200">{lastBall ? (lastBall.isWicket ? 'W' : (lastBall.type === 'extra' ? `E${lastBall.runs}` : lastBall.runs)) : '—'}</div>
                </div>
              </div>
            </div>

            <div className="flex-1 text-center">
              <div className="text-xs text-gray-400">{'' /* placeholder for symmetry */}</div>
              <div className="text-4xl md:text-5xl font-bebas text-white mt-1">{teamName('B')}</div>
              <div className="text-6xl md:text-7xl font-bebas text-yellow-400 mt-2">{(function(){
                const ci = activeMatch.currentInnings || 1;
                const bothPresent = (activeMatch.runsB != null) || (activeMatch.status === 'RESULT');
                if (bothPresent) {
                  return activeMatch.runsB ?? 0;
                }
                if (ci === 2) {
                  return activeMatch.runs ?? 0;
                }
                // innings 1 in progress — show placeholder for team B
                return '—';
              })()}</div>
              <div className="text-sm text-gray-400 mt-1">Wickets: {(function(){
                const ci = activeMatch.currentInnings || 1;
                const bothPresent = (activeMatch.runsB != null) || (activeMatch.status === 'RESULT');
                if (bothPresent) return activeMatch.wicketsB ?? 0;
                if (ci === 2) return activeMatch.wickets ?? 0;
                return '—';
              })()}</div>
            </div>
          </div>

          {/* Ball history */}
          {activeMatch.ballHistory && activeMatch.ballHistory.length > 0 && (
            <div className="mt-6">
              <div className="text-sm text-gray-400 mb-2">Recent balls</div>
              <div className="flex gap-2 flex-wrap">
                {activeMatch.ballHistory.slice(-12).reverse().map((b: any, i: number) => (
                  <div key={i} className={`p-2 rounded ${b.isWicket ? 'bg-red-600' : (b.type === 'extra' ? 'bg-blue-600' : 'bg-gray-800')}`}>{b.isWicket ? 'W' : (b.type === 'extra' ? `E${b.runs}` : b.runs)}</div>
                ))}
              </div>
            </div>
          )}

          {/* Full scorecard & players */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-black/50 p-4 rounded-2xl border border-white/10">
              <div className="text-sm text-gray-400 mb-2">Full scorecard</div>
              {Object.keys(scorecardSource).length === 0 ? (
                <div className="text-sm text-gray-500">No player stats available</div>
              ) : (
                <div className="space-y-2">
                  {/* Batters */}
                  <div className="text-xs text-gray-400 mb-1">Batting</div>
                  {Object.entries(scorecardSource).filter(([_, s]: any) => (s.balls || s.runs) ? true : false).map(([name, s]: any) => (
                    <div key={name} className="flex items-center justify-between border-b border-white/5 py-2">
                      <div className="text-sm text-gray-200"><a className="hover:underline text-gray-200" href={`#/player/${encodeURIComponent(name)}`}>{name}</a></div>
                      <div className="text-xs text-gray-400">{s.runs} ({s.balls})</div>
                    </div>
                  ))}

                  {/* Bowlers */}
                  <div className="mt-3 text-xs text-gray-400 mb-1">Bowling</div>
                  {Object.entries(scorecardSource).filter(([_, s]: any) => (s.ballsBowled || s.wickets) ? true : false).map(([name, s]: any) => (
                    <div key={name} className="flex items-center justify-between border-b border-white/5 py-2">
                      <div className="text-sm text-gray-200">{name}</div>
                      <div className="text-xs text-gray-400">{(s.oversBowled || s.ballsBowled) ? `${s.oversBowled || Math.floor((s.ballsBowled||0)/6)}.${(s.ballsBowled||0)%6}` : '0.0'} • {s.wickets || 0}w • {s.runsConceded || 0}r</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-black/50 p-4 rounded-2xl border border-white/10">
              <div className="text-sm text-gray-400 mb-2">Team players</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-gray-400 mb-1">{teamName('A')}</div>
                  {teams.find(t => t.name === teamName('A'))?.players?.map(p => <div key={p.name} className="text-sm text-gray-200">{p.name}{p.isCaptain ? ' • (C)' : ''}</div>)}
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">{teamName('B')}</div>
                  {teams.find(t => t.name === teamName('B'))?.players?.map(p => <div key={p.name} className="text-sm text-gray-200">{p.name}{p.isCaptain ? ' • (C)' : ''}</div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 p-6 rounded-2xl text-center text-gray-400">No active live match. Showing latest results below.</div>
      )}

      <PointsTable rows={pointsTable} />

      <div className="mt-6 bg-black/40 p-4 rounded-2xl border border-white/10">
        <h3 className="text-lg font-bebas text-yellow-400 mb-2">Recent Results</h3>
        <div className="space-y-2">
          {matchHistory.slice(0,6).map(m => (
            <div key={m.id} className="flex items-center justify-between">
              <div className="text-sm text-gray-200"><a className="hover:underline" href={`#/match/${encodeURIComponent(m.id)}`}>{m.teamA} {m.scoreA}/{m.wicketsA} ({m.oversA}) vs {m.teamB} {m.scoreB}/{m.wicketsB} ({m.oversB})</a></div>
              <div className="text-xs text-gray-400">{m.winner}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveView;