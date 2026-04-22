'use client';

import { useState, useEffect } from 'react';
import ScenarioSidebar from './components/ScenarioSidebar';
import CashflowChart from './components/CashflowChart';
import RiskGauge from './components/RiskGauge';
import StatCards from './components/StatCards';
import TransactionTable from './components/TransactionTable';
import AddTransactionModal from './components/AddTransactionModal';
import { useForecast } from '../hooks/useForecast';
import { AlertCircle, TrendingDown, ShieldAlert } from 'lucide-react';

export default function Dashboard() {
  const userId = "e6d6e60c-6890-4edf-94ea-7186e93a6064";
  const [showModal, setShowModal] = useState(false);
  const [activeScenario, setActiveScenario] = useState('Stable');
  const [delay, setDelay] = useState(0);
  const [multiplier, setMultiplier] = useState(1);

  const { data, loading, runSimulation } = useForecast(userId);

  useEffect(() => {
    runSimulation('Stable');
  }, []);

  return (
    <main className="bg-black min-h-screen text-white p-4 md:p-8 font-sans">
      {/* Top Warning Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-red-950/20 border border-red-500/40 p-5 rounded-2xl flex items-center gap-5">
          <div className="bg-red-500 p-3 rounded-xl text-black shadow-lg shadow-red-500/20">
            <TrendingDown size={28} />
          </div>
          <div>
            <p className="text-red-400 text-xs font-black uppercase tracking-widest">Projected Runway</p>
            <p className="text-3xl font-black">{data?.runway ?? '---'} Months</p>
          </div>
        </div>
        <div className="bg-orange-950/20 border border-orange-500/40 p-5 rounded-2xl flex items-center gap-5">
          <div className="bg-orange-500 p-3 rounded-xl text-black shadow-lg shadow-orange-500/20">
            <AlertCircle size={28} />
          </div>
          <div>
            <p className="text-orange-400 text-xs font-black uppercase tracking-widest">Monthly Burn Rate</p>
            <p className="text-3xl font-black">${data?.burn_rate?.toLocaleString() ?? '---'}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter text-white">PROPHET AI</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Live Risk Intelligence Engine</p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-white text-black hover:bg-green-500 hover:text-white font-black px-10 py-4 rounded-full transition-all active:scale-95 shadow-xl"
        >
          LOG TRANSACTION
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Control Column */}
        <div className="w-full lg:w-80 space-y-6">
          <ScenarioSidebar 
            onScenarioChange={(s) => { setActiveScenario(s); runSimulation(s); }}
            activeScenario={activeScenario}
            loading={loading}
            delay={delay}
            multiplier={multiplier}
            onDelayChange={setDelay}
            onMultiplierChange={setMultiplier}
          />
          <div className="bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-800 backdrop-blur-xl">
             <RiskGauge score={data?.score ?? 0} />
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 space-y-8">
          <div className="bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-800 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-bold text-zinc-300">Predictive Cashflow</h3>
               {loading && <span className="text-[10px] bg-green-500 text-black px-3 py-1 rounded-full font-black tracking-widest animate-pulse">RE-CALCULATING</span>}
            </div>
            <div className="h-[420px]">
              <CashflowChart data={data?.data ?? []} loading={loading} />
            </div>
          </div>
          
          <StatCards currentBalance={data?.current_balance ?? 0} />
          
          <div className="bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800 overflow-hidden backdrop-blur-xl">
            <TransactionTable />
          </div>
        </div>
      </div>

      {showModal && (
        <AddTransactionModal 
          onClose={() => setShowModal(false)} 
          onAdded={() => { setShowModal(false); runSimulation(activeScenario); }} 
        />
      )}
    </main>
  );
}
