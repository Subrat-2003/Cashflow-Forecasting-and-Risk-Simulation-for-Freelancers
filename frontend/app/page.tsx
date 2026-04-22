'use client'
import { useState } from 'react'
import RiskGauge from './components/RiskGauge'
import ScenarioSidebar from './components/ScenarioSidebar'
import TransactionTable from './components/TransactionTable'
import StatCards from './components/StatCards'
import CashflowChart from './components/CashflowChart'
import CashflowWarning from './components/CashflowWarning'
import AddTransactionModal from './components'use client';

import { useState, useEffect } from 'react';
import ScenarioSidebar from '@/components/ScenarioSidebar';
import CashflowChart from '@/components/CashflowChart';
import RiskGauge from '@/components/RiskGauge';
import { useForecast } from '@/hooks/useForecast';

/**
 * MAIN DASHBOARD PAGE
 * Acts as the "Cockpit" for the Financial Flight Simulator.
 * * FIX LOG:
 * - Resolved property-missing errors by providing mandatory handlers.
 * - Synchronized with production UUID for real-time Prophet AI simulation.
 */
export default function App() {
  // 1. Production Context: Real UUID from Supabase
  const userId = "e6d6e60c-6890-4edf-94ea-7186e93a6064";

  // 2. Simulation State (The values requested by the Sidebar)
  const [activeScenario, setActiveScenario] = useState('Stable');
  const [delay, setDelay] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);

  // 3. AI Engine Connection
  const { data, loading, runSimulation } = useForecast(userId);

  // 4. Initial Engine Start
  useEffect(() => {
    runSimulation('Stable');
  }, []);

  // 5. HANDLERS: These bridge the Sidebar inputs to the AI Engine
  const handleScenarioChange = (scenario: string) => {
    setActiveScenario(scenario);
    runSimulation(scenario); 
  };

  const handleDelayChange = (days: number) => {
    setDelay(days);
    // Future expansion: These values can be passed to the runSimulation function
    // if the backend endpoint is updated to accept custom delay/multiplier parameters.
  };

  const handleMultiplierChange = (mult: number) => {
    setMultiplier(mult);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* SCENARIO SIDEBAR 
          We are now passing all required props to satisfy TypeScript requirements:
          onScenarioChange, onDelayChange, and onMultiplierChange.
      */}
      <aside className="w-full lg:w-1/4 h-full">
        <ScenarioSidebar 
          onScenarioChange={handleScenarioChange}
          onDelayChange={handleDelayChange}
          onMultiplierChange={handleMultiplierChange}
          activeScenario={activeScenario}
          delay={delay}
          multiplier={multiplier}
          loading={loading}
        />
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Freelancer Risk Center</h1>
            <p className="text-slate-400 text-sm">Real-time Prophet AI Forecasting Engine</p>
          </div>
          <button className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-green-500/20 transition-all">
            + Add Transaction
          </button>
        </header>

        {/* TOP METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Total Cash</span>
            <div className="text-3xl font-bold mt-2">₹{data?.current_balance?.toLocaleString() || "0.00"}</div>
            <div className="text-[10px] text-green-400 mt-1">Live from Supabase</div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-4 block">Confidence Score</span>
            <div className="h-20 flex items-center justify-center">
              <RiskGauge score={data?.score || 72} />
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Survival Clock</span>
            <div className="text-3xl font-bold mt-2 text-red-400">8 Days</div>
            <div className="text-[10px] text-red-300 mt-1">Critical — balance below ₹1,000 soon!</div>
          </div>
        </div>

        {/* AI FORECAST CHART */}
        <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
            <div>
              <h2 className="font-bold text-lg flex items-center">
                <span className="mr-2">📈</span> 30-Day Cash Flow Forecast
              </h2>
              <p className="text-[10px] text-slate-500">XGBoost + Facebook Prophet Ensemble · ±10% stochastic corridor</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${loading ? 'bg-blue-500/10 text-blue-400 animate-pulse' : 'bg-green-500/10 text-green-400'}`}>
              {loading ? 'AI RE-CALCULATING...' : 'MODEL SYNCED'}
            </div>
          </div>
          
          <div className="h-80 w-full">
            <CashflowChart data={data?.data} loading={loading} />
          </div>
        </section>

        {/* RECENT TRANSACTIONS (Optional placeholder to match your video) */}
        <div className="mt-8 bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50">
          <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase text-center md:text-left">System Logs</h3>
          <div className="text-xs font-mono text-slate-500 text-center md:text-left">
            [SYS] AI Engine connected to user_{userId.substring(0, 8)}...<br/>
            [SYS] Waiting for scenario trigger...
          </div>
        </div>
      </main>
    </div>
  );
}/AddTransactionModal'

export default function Home() {
  const [showModal, setShowModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAdded = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <main className="bg-black min-h-screen p-3 md:p-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-white text-2xl md:text-3xl font-bold">
          💼 Freelancer Risk Center
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base w-full sm:w-auto"
        >
          ➕ Add Transaction
        </button>
      </div>

      {/* ── Warning Banner ── */}
      <CashflowWarning />

      {/* ── Stat Cards ── */}
      <StatCards />

      {/* ── Main Layout ── */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6">

        {/* Scenario Sidebar — full width on mobile, 1/4 on desktop */}
        <div className="w-full lg:w-1/4">
          <ScenarioSidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col gap-6">
          <RiskGauge score={72} />
          <CashflowChart key={refreshKey} />
          <TransactionTable key={refreshKey} />
        </div>

      </div>

      {/* ── Modal ── */}
      {showModal && (
        <AddTransactionModal
          onClose={() => setShowModal(false)}
          onAdded={handleAdded}
        />
      )}
    </main>
  )
}
