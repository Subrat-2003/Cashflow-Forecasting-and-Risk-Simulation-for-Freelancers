import React from 'react';

interface SidebarProps {
  onScenarioChange: (scenario: string) => void;
  onDelayChange: (days: number) => void;
  onMultiplierChange: (mult: number) => void;
  activeScenario: string;
  delay: number;
  multiplier: number;
  loading: boolean;
}

const ScenarioSidebar: React.FC<SidebarProps> = ({ 
  onScenarioChange, 
  onDelayChange, 
  onMultiplierChange,
  activeScenario, 
  delay,
  multiplier,
  loading 
}) => {
  const scenarios = [
    { id: 'Safe', label: 'Best Case', color: 'bg-green-600', desc: 'All payments arrive on time' },
    { id: 'Stable', label: 'Laggard Lag', color: 'bg-yellow-600', desc: '+14 days for slow payers' },
    { id: 'Critical', label: 'Total Freeze', color: 'bg-red-600', desc: '+30 days for all pending' },
  ];

  return (
    <div className="p-4 space-y-8 bg-slate-900 text-white h-full border-r border-slate-800">
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
          🧪 Stress Test Presets
        </h3>
        <div className="space-y-3">
          {scenarios.map((s) => (
            <button
              key={s.id}
              disabled={loading}
              onClick={() => onScenarioChange(s.id)}
              className={`w-full p-3 rounded-lg text-left transition-all border ${
                activeScenario === s.id 
                ? `${s.color} border-transparent shadow-lg scale-[1.02]` 
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 opacity-80'
              } ${loading ? 'cursor-not-allowed grayscale' : ''}`}
            >
              <div className="font-bold flex items-center">
                {activeScenario === s.id && <span className="mr-2">✓</span>}
                {s.label}
              </div>
              <div className="text-[10px] opacity-70 mt-1">{s.desc}</div>
            </button>
          ))}
        </div>
      </section>

      <hr className="border-slate-800" />

      <section className="space-y-6">
        {/* LATE PAYMENT SLIDER */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 uppercase font-medium">Late Payment Delay</span>
            <span className="text-blue-400 font-bold">{delay} days</span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            value={delay}
            disabled={loading}
            onChange={(e) => onDelayChange(Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* EXPENSE MULTIPLIER SLIDER */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 uppercase font-medium">Expense Multiplier</span>
            <span className="text-purple-400 font-bold">{multiplier}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={multiplier}
            disabled={loading}
            onChange={(e) => onMultiplierChange(Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      </section>

      {/* STATUS FOOTER */}
      <div className="pt-4">
        <div className={`text-center p-2 rounded text-xs font-bold transition-all ${
          loading ? 'bg-blue-900 text-blue-200 animate-pulse' : 'bg-slate-800 text-green-400'
        }`}>
          {loading ? 'Prophet Engine Simulating...' : `Viewing: ${activeScenario}`}
        </div>
      </div>
    </div>
  );
};

export default ScenarioSidebar;
