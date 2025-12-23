
import React from 'react';
import { Team } from '../types';

interface TeamCardsProps {
  teams: Team[];
}

const TeamCards: React.FC<TeamCardsProps> = ({ teams }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in pb-12">
      {teams.map((team) => (
        <div 
          key={team.id} 
          className="group relative bg-black/50 backdrop-blur-md rounded-3xl p-6 border border-white/10 hover:border-yellow-400/50 hover:bg-black/60 transition-all duration-500 overflow-hidden"
        >
          {/* Accent decoration */}
          <div className={`absolute -top-10 -right-10 w-40 h-40 ${team.color} opacity-10 blur-3xl group-hover:opacity-30 transition-opacity duration-500`}></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bebas text-yellow-400 tracking-wider mb-4 border-b border-white/10 pb-3 flex justify-between items-center">
              {team.name}
              <div className={`w-3 h-3 rounded-full ${team.color} shadow-lg`}></div>
            </h3>
            
            <div className="grid grid-cols-1 gap-2">
              {team.players.map((player, idx) => (
                <div 
                  key={idx} 
                  className={`flex justify-between items-center px-4 py-2 rounded-xl transition-all duration-300 ${
                    player.isCaptain 
                      ? 'bg-yellow-400/20 border border-yellow-400/40 shadow-[0_0_15px_rgba(251,191,36,0.1)]' 
                      : 'bg-white/5 hover:bg-white/10 hover:translate-x-1'
                  }`}
                >
                  <span className={`font-medium ${player.isCaptain ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}>
                    {player.name}
                  </span>
                  {player.isCaptain && (
                    <span className="text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded font-black uppercase tracking-tighter">
                      Captain
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamCards;
