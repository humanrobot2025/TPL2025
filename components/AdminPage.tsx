import React, { useState } from 'react';
import { MatchRecord, Team } from '../types';

interface AdminPageProps {
  teams: Team[];
  matchHistory: MatchRecord[];
  onUpdateMatch: (updated: MatchRecord) => void;
  onDeleteMatch: (id: string) => void;
  onSetActiveMatch?: (match: MatchRecord) => void; // publish a saved match to Live view
  onClearActiveMatch?: () => void; // clear live match
  onStartTournament?: () => void; // start/clear tournament
  onLoadMatchPreset?: (m: MatchRecord) => void; // load a saved match into scorer setup
}

const AdminPage: React.FC<AdminPageProps> = ({ teams, matchHistory, onUpdateMatch, onDeleteMatch, onSetActiveMatch, onClearActiveMatch, onStartTournament, onLoadMatchPreset }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<MatchRecord>>({});

  const startEdit = (m: MatchRecord) => {
    setEditingId(m.id);
    setDraft({ ...m });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  const saveEdit = () => {
    if (!editingId) return;
    const required = ['teamA', 'teamB', 'scoreA', 'scoreB', 'oversA', 'oversB', 'winner'];
    for (const key of required) {
      if ((draft as any)[key] === undefined || (draft as any)[key] === null) {
        alert('Please fill all required fields');
        return;
      }
    }
    onUpdateMatch(draft as MatchRecord);
    cancelEdit();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 mt-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bebas text-yellow-400">Admin — Edit Match Results</h2>
        <div className="text-sm text-gray-400">Editable list of saved matches</div>
      </div>

      <div className="flex justify-end mt-3 gap-2">
        {onStartTournament && (
          <button onClick={() => {
            if (confirm('Start a new tournament? This will clear saved matches and reset points.')) onStartTournament();
          }} className="bg-indigo-600 text-white px-3 py-1 rounded">Start Tournament</button>
        )}
        {onClearActiveMatch && (
          <button onClick={() => {
            if (confirm('Clear the currently published Live match?')) onClearActiveMatch();
          }} className="bg-red-600 text-white px-3 py-1 rounded">Clear Live</button>
        )}
      </div>

      {matchHistory.length === 0 ? (
        <div className="bg-white/5 p-6 rounded-2xl text-center text-gray-400">No matches saved yet</div>
      ) : (
        <div className="grid gap-4">
          {matchHistory.map(m => (
            <div key={m.id} className="bg-black/40 p-4 rounded-2xl border border-white/10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="font-bebas text-lg text-yellow-400">{m.teamA}</div>
                    <div className="text-white text-2xl font-bebas">{m.scoreA}/{m.wicketsA}</div>
                    <div className="text-gray-500">({m.oversA})</div>
                    <div className="mx-2 text-gray-400 uppercase text-xs">vs</div>
                    <div className="font-bebas text-lg text-yellow-400">{m.teamB}</div>
                    <div className="text-white text-2xl font-bebas">{m.scoreB}/{m.wicketsB}</div>
                    <div className="text-gray-500">({m.oversB})</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">Winner: <span className="text-yellow-400 font-bold">{m.winner}</span> • {m.date}</div>
                </div>

                <div className="flex gap-2 mt-3 md:mt-0">
                  <button onClick={() => startEdit(m)} className="bg-yellow-400 text-black px-3 py-1 rounded">Edit</button>
                  <button onClick={() => {
                    if (confirm('Delete this match?')) onDeleteMatch(m.id);
                  }} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
                  {onSetActiveMatch && (
                    <button onClick={() => {
                      if (confirm('Publish this match to Live view?')) onSetActiveMatch(m);
                    }} className="bg-green-600 text-white px-3 py-1 rounded">Make Live</button>
                  )}
                  {onLoadMatchPreset && (
                    <button onClick={() => {
                      if (confirm('Load this match into the scorer setup?')) onLoadMatchPreset(m);
                    }} className="bg-blue-600 text-white px-3 py-1 rounded">Start Match</button>
                  )}
                </div>
              </div>

              {editingId === m.id && (
                <div className="mt-4 bg-white/5 p-4 rounded">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <select value={(draft.teamA as string) || m.teamA} onChange={(e) => setDraft(d => ({ ...d, teamA: e.target.value }))} className="p-2 bg-gray-900 rounded">
                      {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                    </select>
                    <input type="number" value={(draft.scoreA as any) ?? m.scoreA} onChange={(e) => setDraft(d => ({ ...d, scoreA: parseInt(e.target.value || '0', 10) }))} className="p-2 bg-gray-900 rounded" />
                    <input type="number" value={(draft.wicketsA as any) ?? m.wicketsA} onChange={(e) => setDraft(d => ({ ...d, wicketsA: parseInt(e.target.value || '0', 10) }))} className="p-2 bg-gray-900 rounded" />
                    <input type="text" value={(draft.oversA as any) ?? m.oversA} onChange={(e) => setDraft(d => ({ ...d, oversA: e.target.value }))} className="p-2 bg-gray-900 rounded" />

                    <select value={(draft.teamB as string) || m.teamB} onChange={(e) => setDraft(d => ({ ...d, teamB: e.target.value }))} className="p-2 bg-gray-900 rounded">
                      {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                    </select>
                    <input type="number" value={(draft.scoreB as any) ?? m.scoreB} onChange={(e) => setDraft(d => ({ ...d, scoreB: parseInt(e.target.value || '0', 10) }))} className="p-2 bg-gray-900 rounded" />
                    <input type="number" value={(draft.wicketsB as any) ?? m.wicketsB} onChange={(e) => setDraft(d => ({ ...d, wicketsB: parseInt(e.target.value || '0', 10) }))} className="p-2 bg-gray-900 rounded" />
                    <input type="text" value={(draft.oversB as any) ?? m.oversB} onChange={(e) => setDraft(d => ({ ...d, oversB: e.target.value }))} className="p-2 bg-gray-900 rounded" />

                    <select value={(draft.winner as string) ?? m.winner} onChange={(e) => setDraft(d => ({ ...d, winner: e.target.value }))} className="p-2 bg-gray-900 rounded">
                      <option value="Draw">Draw</option>
                      <option value={m.teamA}>{m.teamA}</option>
                      <option value={m.teamB}>{m.teamB}</option>
                    </select>
                    <input type="text" value={(draft.date as any) ?? m.date} onChange={(e) => setDraft(d => ({ ...d, date: e.target.value }))} className="p-2 bg-gray-900 rounded col-span-2" />
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button onClick={saveEdit} className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
                    <button onClick={cancelEdit} className="bg-gray-700 text-white px-3 py-1 rounded">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;