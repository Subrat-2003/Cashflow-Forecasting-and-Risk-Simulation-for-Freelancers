import React from 'react';

interface RiskGaugeProps {
  score?: number;
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ score = 0 }) => {
  const displayScore = Math.max(0, Math.min(100, score));

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="text-[10px] text-zinc-500 mb-6 font-black uppercase tracking-[0.3em] text-center">
        Financial Confidence
      </div>
      
      <div className="relative flex items-center justify-center">
        {/* Terminology sync with Architecture PDF Slide 2 */}
        <div className={`text-8xl font-black italic tracking-tighter transition-colors duration-700 ${
          displayScore > 75 ? 'text-green-500' : displayScore > 45 ? 'text-yellow-500' : 'text-red-500'
        }`}>
          {displayScore}%
        </div>
        
        {/* Glow effect */}
        <div className={`absolute inset-0 blur-3xl opacity-20 transition-colors duration-700 ${
          displayScore > 75 ? 'bg-green-500' : displayScore > 45 ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
      </div>

      <div className="mt-8 space-y-1 text-center">
        <div className="text-[9px] text-zinc-600 font-mono uppercase font-bold tracking-wider">
          Status: {displayScore > 45 ? 'Stable Monitoring' : 'Critical Alert'}
        </div>
        <div className="text-[9px] text-zinc-700 font-mono italic">
          MODEL_P_FINAL_ENSEMBLE_ACTIVE
        </div>
      </div>
    </div>
  );
};

export default RiskGauge;
