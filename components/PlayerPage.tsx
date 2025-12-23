import React, { useMemo } from 'react';
import { MatchRecord } from '../types';

function escapeCSV(v: any) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export default function PlayerPage({ playerName, matchHistory, onBack } : { playerName: string; matchHistory: MatchRecord[]; onBack: () => void }) {
  const matches = useMemo(() => matchHistory.filter(m => {
    const stats = m.playerStats || {};
    return Object.prototype.hasOwnProperty.call(stats, playerName);
  }), [matchHistory, playerName]);

  const totals = useMemo(() => {
    const t = { runs: 0, balls: 0, fours: 0, sixes: 0, wickets: 0, oversBowledBalls: 0, runsConceded: 0 };
    matches.forEach(m => {
      const s: any = (m.playerStats || {})[playerName] || {};
      t.runs += s.runs || 0;
      t.balls += s.balls || 0;
      t.fours += s.fours || 0;
      t.sixes += s.sixes || 0;
      t.wickets += s.wickets || 0;
      t.oversBowledBalls += s.ballsBowled || 0;
      t.runsConceded += s.runsConceded || 0;
    });
    return t;
  }, [matches, playerName]);

  const sr = totals.balls > 0 ? ((totals.runs / totals.balls) * 100).toFixed(2) : '0.00';
  const oversBowled = `${Math.floor(totals.oversBowledBalls / 6)}.${totals.oversBowledBalls % 6}`;
  const eco = totals.oversBowledBalls > 0 ? (totals.runsConceded / (totals.oversBowledBalls / 6)).toFixed(2) : '0.00';

  const exportPlayerCSV = () => {
    const lines: string[] = [];
    lines.push(['MatchID','Date','TeamA','TeamB','Runs','Balls','4s','6s','Wickets','OversBowled','RunsConceded'].join(','));
    matches.forEach(m => {
      const s: any = (m.playerStats || {})[playerName] || {};
      lines.push([
        escapeCSV(m.id), escapeCSV(m.date), escapeCSV(m.teamA), escapeCSV(m.teamB),
        escapeCSV(s.runs || 0), escapeCSV(s.balls || 0), escapeCSV(s.fours || 0), escapeCSV(s.sixes || 0), escapeCSV(s.wickets || 0), escapeCSV(s.oversBowled || ''), escapeCSV(s.runsConceded || 0)
      ].join(','));
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `player-${playerName.replace(/\s+/g,'_')}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={onBack} className="text-sm text-gray-400 hover:text-white mr-3">← Back</button>
          <h2 className="text-2xl font-bebas text-yellow-400 inline">{playerName}</h2>
          <div className="text-xs text-gray-400 mt-1">Player profile & match history</div>
        </div>
        <div>
          <button onClick={exportPlayerCSV} className="bg-yellow-400 text-black px-3 py-1 rounded">Export CSV</button>
        </div>
      </div>

      <div className="bg-black/60 p-6 rounded-2xl border border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-400">Matches</div>
            <div className="text-2xl font-bebas text-white">{matches.length}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Runs</div>
            <div className="text-2xl font-bebas text-white">{totals.runs}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">SR</div>
            <div className="text-2xl font-bebas text-white">{sr}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Wickets</div>
            <div className="text-2xl font-bebas text-white">{totals.wickets}</div>
          </div>
        </div>
      </div>

      <div className="bg-black/50 p-4 rounded-2xl border border-white/10">
        <h3 className="text-lg font-bebas text-yellow-400 mb-3">Recent performances</h3>
        {matches.length === 0 ? (
          <div className="text-sm text-gray-400">No recorded matches for this player.</div>
        ) : (
          <div className="space-y-2">
            {matches.slice(0, 20).map(m => {
              const s: any = (m.playerStats || {})[playerName] || {};
              return (
                <div key={m.id} className="flex items-center justify-between border-b border-white/5 py-2">
                  <div className="text-sm text-gray-200">{m.date} • {m.teamA} vs {m.teamB}</div>
                  <div className="text-sm text-yellow-400">{s.runs || 0} ({s.balls || 0}) • {s.fours || 0}x4</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
