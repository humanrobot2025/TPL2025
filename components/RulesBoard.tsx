
import React from 'react';

interface RulesBoardProps {
  rules: string[];
}

const RulesBoard: React.FC<RulesBoardProps> = ({ rules }) => {
  return (
    <div className="bg-black/50 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl animate-fade-in">
      <h2 className="text-3xl font-bebas text-yellow-400 tracking-widest mb-8 text-center border-b border-white/10 pb-4">
        Official Tournament Rules
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {rules.map((rule, idx) => (
          <div 
            key={idx} 
            className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 group"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bebas text-lg shadow-lg group-hover:scale-110 transition-transform">
              {idx + 1}
            </div>
            <p className="text-gray-200 leading-relaxed font-medium pt-0.5">
              {rule}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-8 p-6 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 text-center">
        <p className="text-yellow-400 font-bebas text-xl tracking-wider">Play Hard, Play Fair! 🏏</p>
      </div>
    </div>
  );
};

export default RulesBoard;
