'use client'
import { useState } from 'react'

export default function ScenarioSidebar({ onScenarioChange }: { onScenarioChange?: (scenario: string) => void }) {
  const [latePayment, setLatePayment] = useState(0)
  const [churn, setChurn] = useState(false)
  const [expense, setExpense] = useState(1)
  const [activeScenario, setActiveScenario] = useState('base')

  const handleScenario = (scenario: string) => {
    setActiveScenario(scenario)
    if (onScenarioChange) onScenarioChange(scenario)
  }

  return (
    <div className="bg-gray-900 p-6 rounded-xl h-full">
      <h2 className="text-white text-xl font-bold mb-6">Scenario Controls</h2>

      {/* Stress Test Presets */}
      <div className="mb-6">
        <p className="text-gray-400 text-sm mb-3">🧪 Stress Test Presets</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleScenario('base')}
            className={`p-3 rounded-lg text-sm font-bold text-left ${activeScenario === 'base' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300'}`}
          >
            ✅ Best Case
            <p className="text-xs font-normal mt-1 opacity-70">All payments arrive on time</p>
          </button>
          <button
            onClick={() => handleScenario('laggard')}
            className={`p-3 rounded-lg text-sm font-bold text-left ${activeScenario === 'laggard' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-300'}`}
          >
            ⚠️ Laggard Lag
            <p className="text-xs font-normal mt-1 opacity-70">+14 days for slow payers</p>
          </button>
          <button
            onClick={() => handleScenario('freeze')}
            className={`p-3 rounded-lg text-sm font-bold text-left ${activeScenario === 'freeze' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300'}`}
          >
            ❄️ Total Freeze
            <p className="text-xs font-normal mt-1 opacity-70">+30 days for all pending</p>
          </button>
        </div>
      </div>

      {/* Late Payment Slider */}
      <div className="mb-6">
        <label className="text-gray-400 text-sm">Late Payment Delay</label>
        <p className="text-white font-bold">{latePayment} days</p>
        <input
          type="range" min="0" max="90"
          value={latePayment}
          onChange={(e) => setLatePayment(Number(e.target.value))}
          className="w-full mt-2"
        />
      </div>

      {/* Client Churn Toggle */}
      <div className="mb-6">
        <label className="text-gray-400 text-sm">Biggest Client Leaves?</label>
        <div className="mt-2">
          <button
            onClick={() => setChurn(!churn)}
            className={`px-4 py-2 rounded-lg font-bold ${churn ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            {churn ? 'YES - Client Lost' : 'NO - Client Safe'}
          </button>
        </div>
      </div>

      {/* Expense Multiplier Slider */}
      <div className="mb-6">
        <label className="text-gray-400 text-sm">Expense Multiplier</label>
        <p className="text-white font-bold">{expense}x</p>
        <input
          type="range" min="1" max="2" step="0.1"
          value={expense}
          onChange={(e) => setExpense(Number(e.target.value))}
          className="w-full mt-2"
        />
      </div>

      {/* Active Scenario Badge */}
      <div className={`p-3 rounded-lg text-center text-sm font-bold ${
        activeScenario === 'base' ? 'bg-green-900 text-green-300' :
        activeScenario === 'laggard' ? 'bg-yellow-900 text-yellow-300' :
        'bg-red-900 text-red-300'
      }`}>
        {activeScenario === 'base' ? '✅ Viewing: Best Case' :
         activeScenario === 'laggard' ? '⚠️ Viewing: Laggard Lag' :
         '❄️ Viewing: Total Freeze'}
      </div>
    </div>
  )
}