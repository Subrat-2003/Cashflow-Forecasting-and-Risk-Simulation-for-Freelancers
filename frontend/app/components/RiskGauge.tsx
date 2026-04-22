import React from 'react';

interface RiskGaugeProps {
  score?: number;
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ score = 0 }) => {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="text-sm text-gray-400 mb-2 uppercase tracking-widest">Financial Risk Score</div>
      <div className={`text-6xl font-black ${score > 70 ? 'text-green-500' : score > 40 ? 'text-yellow-500' : 'text-red-500'}`}>
        {score}
      </div>
      <div className="text-xs text-gray-500 mt-2 italic">Updated via Prophet AI Engine</div>
    </div>
  );
};

export default RiskGauge;
