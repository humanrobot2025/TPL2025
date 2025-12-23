
import React from 'react';
import { PointsTableRow } from '../types';

interface PointsTableProps {
  rows: PointsTableRow[];
}

const PointsTable: React.FC<PointsTableProps> = ({ rows }) => {
  return (
    <div className="bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-xl">
      <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
        <h3 className="text-xl font-bebas text-white tracking-widest flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
          </svg>
          League Standings
        </h3>
        <span className="text-[10px] bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded font-bold uppercase tracking-widest">Season 2</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-black/20 text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500">
              <th className="px-6 py-4">Team</th>
              <th className="px-4 py-4 text-center">Played</th>
              <th className="px-4 py-4 text-center">Wins</th>
              <th className="px-6 py-4 text-center text-yellow-400">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row, idx) => (
              <tr 
                key={row.teamName} 
                className={`hover:bg-white/5 transition-colors ${idx === 0 ? 'bg-yellow-400/5' : ''}`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-gray-400'}`}>
                      {idx + 1}
                    </div>
                    <span className={`font-semibold text-sm ${idx === 0 ? 'text-yellow-400' : 'text-gray-200'}`}>
                      {row.teamName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center font-bebas text-xl text-gray-400">{row.played}</td>
                <td className="px-4 py-4 text-center font-bebas text-xl text-gray-400">{row.won}</td>
                <td className="px-6 py-4 text-center font-bebas text-2xl text-yellow-400">{row.points}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm italic uppercase tracking-widest">Awaiting match results</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PointsTable;
