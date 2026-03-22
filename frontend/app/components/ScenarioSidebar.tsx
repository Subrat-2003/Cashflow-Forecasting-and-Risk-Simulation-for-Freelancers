'use client'
import { useState } from 'react'

export default function ScenarioSidebar() {
  const [latePayment, setLatePayment] = useState(0)
  const [churn, setChurn] = useState(false)
  const [expense, setExpense] = useState(1)

  return (
    <div className="bg-gray-900 p-6 rounded-xl h-full">
      <h2 className="text-white text-xl font-bold mb-6">Scenario Controls</h2>
      
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
    </div>
  )
}