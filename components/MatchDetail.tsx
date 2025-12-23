import React from 'react';
import { MatchRecord } from '../types';

function escapeCSV(v: any) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export default function MatchDetail({ match, onBack } : { match: MatchRecord; onBack: () => void }) {
  const exportCSV = () => {
    const lines: string[] = [];
    lines.push(['MatchID','Date','TeamA','TeamB','ScoreA','WktsA','OversA','ScoreB','WktsB','OversB','Winner'].join(','));
    lines.push([
      escapeCSV(match.id), escapeCSV(match.date), escapeCSV(match.teamA), escapeCSV(match.teamB),
      escapeCSV(match.scoreA), escapeCSV(match.wicketsA), escapeCSV(match.oversA), escapeCSV(match.scoreB), escapeCSV(match.wicketsB), escapeCSV(match.oversB), escapeCSV(match.winner)
    ].join(','));
    lines.push('');
    lines.push(['Player','Runs','Balls','4s','6s','Wickets','OversBowled','RunsConceded'].join(','));
    const stats = match.playerStats || {};
    const names = Object.keys(stats);
    if (names.length === 0) {
      lines.push('No player stats');
    } else {
      names.forEach(n => {
        const s: any = stats[n] || {};
        lines.push([
          escapeCSV(n), escapeCSV(s.runs || 0), escapeCSV(s.balls || 0), escapeCSV(s.fours || 0), escapeCSV(s.sixes || 0), escapeCSV(s.wickets || 0), escapeCSV(s.oversBowled || ''), escapeCSV(s.runsConceded || 0)
        ].join(','));
      });
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `match-${match.id}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const playerRows = Object.entries(match.playerStats || {});

  return (
    <div className="max-w-4xl mx-auto px-4 mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={onBack} className="text-sm text-gray-400 hover:text-white mr-3">← Back</button>
          <h2 className="text-2xl font-bebas text-yellow-400 inline">Match details</h2>
          <div className="text-xs text-gray-400 mt-1">{match.teamA} {match.scoreA}/{match.wicketsA} ({match.oversA}) vs {match.teamB} {match.scoreB}/{match.wicketsB} ({match.oversB})</div>
        </div>
        <div>
          <button onClick={exportCSV} className="bg-yellow-400 text-black px-3 py-1 rounded">Export CSV</button>
        </div>
      </div>

      <div className="bg-black/60 p-6 rounded-2xl border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm text-gray-400 mb-2">Batting</h3>
            {playerRows.filter(([_, s]: any) => (s.balls || s.runs)).length === 0 ? (
              <div className="text-sm text-gray-400">No batting stats</div>
            ) : (
              <div className="space-y-2">
                {playerRows.filter(([_, s]: any) => (s.balls || s.runs)).map(([n, s]: any) => (
                  <div key={n} className="flex items-center justify-between border-b border-white/5 py-2">
                    <div className="text-sm text-gray-200">{n}</div>
                    <div className="text-sm text-yellow-400">{s.runs || 0} ({s.balls || 0}) • {s.fours || 0}x4 • {s.sixes || 0}x6 • {s.dots || 0} dots</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm text-gray-400 mb-2">Bowling</h3>
            {playerRows.filter(([_, s]: any) => (s.ballsBowled || s.wickets)).length === 0 ? (
              <div className="text-sm text-gray-400">No bowling stats</div>
            ) : (
              <div className="space-y-2">
                {(() => {
                  const bowlers = playerRows.filter(([_, s]: any) => (s.ballsBowled || s.wickets));
                  // compute maidens by grouping overs using ballsBowled per bowler if present, otherwise omit
                  return bowlers.map(([n, s]: any) => {
                    const balls = s.ballsBowled || 0;
                    const overs = `${Math.floor(balls/6)}.${balls%6}`;
                    // attempt to compute maidens if detailed ball history present
                    const maidens = (() => {
                      // not a perfect method without ball-by-ball per bowler per over, so show 0 if not computable
                      return s.maidens || 0;
                    })();
                    return (
                      <div key={n} className="flex items-center justify-between border-b border-white/5 py-2">
                        <div className="text-sm text-gray-200">{n}</div>
                        <div className="text-sm text-yellow-400">{overs} • {s.wickets || 0}w • {s.runsConceded || 0}r • {maidens}m</div>
                      </div>
                    );
                  });
                })()}
                <div>
                  <div className="text-xs text-gray-400 mb-1">Innings 1</div>
                  <div className="space-y-1">
                    {match.innings1BallHistory.map((b:any, i:number) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-gray-200">
                        <div className="w-12 text-xs text-gray-400">{`${Math.floor(i/6)}.${(i%6)+1}`}</div>
                        <div className={`p-2 rounded ${b.isWicket ? 'bg-red-600' : (b.type === 'extra' ? 'bg-blue-600' : 'bg-gray-800')}`}>{b.isWicket ? 'W' : (b.type === 'extra' ? `E${b.runs}` : b.runs)}</div>
                        <div className="text-sm text-gray-300">{b.batsman} → {b.bowler}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {match.innings2BallHistory && match.innings2BallHistory.length > 0 && (
                <div>
                  <div className="text-xs text-gray-400 mb-1">Innings 2</div>
                  <div className="space-y-1">
                    {match.innings2BallHistory.map((b:any, i:number) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-gray-200">
                        <div className="w-12 text-xs text-gray-400">{`${Math.floor(i/6)}.${(i%6)+1}`}</div>
                        <div className={`p-2 rounded ${b.isWicket ? 'bg-red-600' : (b.type === 'extra' ? 'bg-blue-600' : 'bg-gray-800')}`}>{b.isWicket ? 'W' : (b.type === 'extra' ? `E${b.runs}` : b.runs)}</div>
                        <div className="text-sm text-gray-300">{b.batsman} → {b.bowler}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-400">No ball-by-ball data saved</div>
          )}
        </div>
      </div>
    </div>
  );
}
