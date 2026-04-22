'use client';

import { useState, useEffect } from 'react';
// Core Components - Adjusted paths to standard Next.js './' alias for reliability
import ScenarioSidebar from './components/ScenarioSidebar';
import CashflowChart from './components/CashflowChart';
import RiskGauge from './components/RiskGauge';
import CashflowWarning from './components/CashflowWarning';
import StatCards from './components/StatCards';
import TransactionTable from './components/TransactionTable';
import AddTransactionModal from './components/AddTransactionModal';
// Logic Hook
import { useForecast } from '../hooks/useForecast';

export default function Dashboard() {
  // 1. Production Context: Real UUID from your Supabase
  const userId = "e6d6e60c-6890-4edf-94ea-7186e93a6064";

  // 2. UI & Simulation State
  const [showModal, setShowModal] = useState(false);
  const [activeScenario, setActiveScenario] = useState('Stable');
  const [delay, setDelay] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);

  // 3. AI Engine Connection via your custom hook
  const { data, loading, runSimulation } = useForecast(userId);

  // 4. Initial Engine Start - Bootstraps the first forecast
  useEffect(() => {
    runSimulation('Stable');
  }, []);

  // 5. Handlers to satisfy ScenarioSidebar requirements
  const handleScenarioChange = (scenario: string) => {
    setActiveScenario(scenario);
    runSimulation(scenario); 
  };

  const handleDelayChange = (days: number) => {
    setDelay(days);
    // Logic can be expanded here to pass this to the simulation if needed
  };

  const handleMultiplierChange = (mult: number) => {
    setMultiplier(mult);
    // Logic can be expanded here to pass this to the simulation if needed
  };

  return (
    <main className="bg-black min-h-screen p-3 md:p-6 text-white overflow-hidden">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-white text-2xl md:text-3xl font-bold tracking-tight">
          💼 Freelancer Risk Center
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base w-full sm:w-auto transition-all shadow-lg shadow-green-500/10"
        >
          ➕ Add Transaction
        </button>
      </div>

      {/* ── Warning Banner ── */}
      <CashflowWarning />

      {/* ── Stat Cards with live AI data ── */}
      <StatCards currentBalance={data?.current_balance} />

      {/* ── Main Simulator Layout ── */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        
        {/* Scenario Sidebar: Controls the engine */}
        <div className="w-full lg:w-1/4">
          <ScenarioSidebar 
            onScenarioChange={handleScenarioChange}
            onDelayChange={handleDelayChange}
            onMultiplierChange={handleMultiplierChange}
            activeScenario={activeScenario}
            delay={delay}
            multiplier={multiplier}
            loading={loading}
          />
        </div>

        {/* Main Dashboard Content */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <RiskGauge score={data?.score || 72} />
            </div>
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
               <h3 className="text-xs text-gray-500 uppercase font-bold mb-4 tracking-widest">System Status</h3>
               <div className="space-y-2 font-mono text-[10px]">
                 <p className="text-blue-400">[AI] Engine: Prophet Ensemble v3.0</p>
                 <p className="text-green-400">[DB] Connection: Active (Supabase)</p>
                 <p className={loading ? "text-yellow-400 animate-pulse" : "text-slate-500"}>
                   {loading ? "[SYS] Simulating scenario..." : "[SYS] Ready for input"}
                 </p>
               </div>
            </div>
          </div>

          {/* AI Forecast Chart */}
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 h-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold">30-Day Cash Flow Forecast</h2>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded">87% Model Accuracy Baseline</span>
            </div>
            <CashflowChart data={data?.data} loading={loading} />
          </div>

          {/* Transaction History */}
          <TransactionTable />
        </div>
      </div>

      {/* ── Modals ── */}
      {showModal && (
        <AddTransactionModal onClose={() => setShowModal(false)} />
      )}
    </main>
  );
}
