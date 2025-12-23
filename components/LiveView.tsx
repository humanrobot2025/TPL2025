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
              <div className="text-6xl md:text-7xl font-bebas text-yellow-400 mt-2">{activeMatch.runs || 0}</div>
              <div className="text-sm text-gray-400 mt-1">Wickets: {activeMatch.wickets || 0}</div>
            </div>

            <div className="text-center md:px-6">
              <div className="text-xl text-gray-300 font-bold">VS</div>
              <div className="text-sm text-gray-400 mt-1">Overs: {activeMatch.totalOvers || 0}.{activeMatch.legalBallsInOver || 0}</div>
              {activeMatch.currentInnings === 2 && activeMatch.innings1Score != null && (
                <div className="text-xs text-gray-400 mt-2">Target: {activeMatch.innings1Score + 1}</div>
              )}
            </div>

            <div className="flex-1 text-center">
              <div className="text-xs text-gray-400">{'' /* placeholder for symmetry */}</div>
              <div className="text-4xl md:text-5xl font-bebas text-white mt-1">{teamName('B')}</div>
              <div className="text-6xl md:text-7xl font-bebas text-yellow-400 mt-2">{activeMatch.runsB != null ? activeMatch.runsB : activeMatch.runs || 0}</div>
              <div className="text-sm text-gray-400 mt-1">Wickets: {activeMatch.wicketsB != null ? activeMatch.wicketsB : activeMatch.wickets || 0}</div>
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
              <div className="text-sm text-gray-200">{m.teamA} {m.scoreA}/{m.wicketsA} ({m.oversA}) vs {m.teamB} {m.scoreB}/{m.wicketsB} ({m.oversB})</div>
              <div className="text-xs text-gray-400">{m.winner}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveView;