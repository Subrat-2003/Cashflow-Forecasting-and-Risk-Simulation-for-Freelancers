import React from 'react';

interface SidebarProps {
  onScenarioChange: (scenario: string) => void;
  activeScenario: string;
  loading: boolean;
  delay: number;
  multiplier: number;
  onDelayChange: (val: number) => void;
  onMultiplierChange: (val: number) => void;
}

const ScenarioSidebar: React.FC<SidebarProps> = ({ 
  onScenarioChange, 
  activeScenario, 
  loading,
  delay,
  multiplier,
  onDelayChange,
  onMultiplierChange
}) => {
  const scenarios = ['Stable', 'Late Payments', 'High Burn', 'Recession'];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">Risk Scenarios</h3>
      <div className="flex flex-col gap-2">
        {scenarios.map((s) => (
          <button
            key={s}
            onClick={() => onScenarioChange(s)}
            disabled={loading}
            className={`text-left p-3 rounded-lg transition-all ${
              activeScenario === s 
                ? 'bg-blue-600 text-white border-blue-500' 
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
            } border font-medium`}
          >
            {s}
          </button>
        ))}
      </div>
      
      {/* Simulation Controls */}
      <div className="mt-8 pt-6 border-t border-gray-800">
        <label className="text-xs text-gray-500 uppercase font-bold">Payment Delay (Days)</label>
        <input 
          type="range" min="0" max="60" value={delay} 
          onChange={(e) => onDelayChange(parseInt(e.target.value))}
          className="w-full mt-2" 
        />
        <div className="text-right text-sm text-blue-400 font-mono mt-1">{delay}d</div>
      </div>
    </div>
  );
};

export default ScenarioSidebar;
