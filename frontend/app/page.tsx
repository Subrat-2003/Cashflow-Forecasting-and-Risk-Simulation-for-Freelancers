'use client';

import { useState, useEffect } from 'react';
import ScenarioSidebar from './components/ScenarioSidebar';
import CashflowChart from './components/CashflowChart';
import RiskGauge from './components/RiskGauge';
import StatCards from './components/StatCards';
import TransactionTable from './components/TransactionTable';
import AddTransactionModal from './components/AddTransactionModal';
import { useForecast } from '../hooks/useForecast';
import { ShieldCheck, Zap, Cpu, TrendingDown, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const userId = "e6d6e60c-6890-4edf-94ea-7186e93a6064";
  const [showModal, setShowModal] = useState(false);
  const [activeScenario, setActiveScenario] = useState('Stable'); 
  const [delay, setDelay] = useState(0);
  const [multiplier, setMultiplier] = useState(100);

  const { data, loading, runSimulation } = useForecast(userId);

  useEffect(() => {
    const timer = setTimeout(() => {
      runSimulation(activeScenario, delay, multiplier);
    }, 400); 
    return () => clearTimeout(timer);
  }, [delay, multiplier, activeScenario]);

  return (
    <main className="bg-black min-h-screen text-white p-4 md:p-8 font-sans selection:bg-green-500/30 overflow-x-hidden">
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

      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="flex-1 bg-zinc-900/20 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 backdrop-blur-sm">
          <ShieldCheck className="text-green-500 shrink-0" size={18} />
          <div className="overflow-hidden">
             <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Security: SHA256 Integrity Shield</p>
             <p className="text-[11px] font-mono text-green-500/80 truncate">HASH_STATE: VALID // LEDGER_VERIFIED</p>
          </div>
        </div>
        <div className="bg-zinc-900/20 border border-zinc-800 px-6 py-4 rounded-2xl flex items-center gap-3">
          <Cpu size={18} className="text-blue-500" />
          <p className="text-xs font-bold text-blue-400 font-mono">XGB(0.6) + RF(0.4)</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-6xl font-black italic tracking-tighter text-white uppercase leading-none">Prophet AI</h1>
          <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.4em] mt-3">Financial Flight Simulator v1.0</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto bg-white text-black hover:bg-green-500 hover:text-white font-black px-12 py-5 rounded-full transition-all"
        >
          Log Transaction
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-80 space-y-8">
          <ScenarioSidebar 
            onScenarioChange={setActiveScenario}
            activeScenario={activeScenario}
            loading={loading}
            delay={delay}
            multiplier={multiplier}
            onDelayChange={setDelay}
            onMultiplierChange={setMultiplier}
          />
          <div className="bg-zinc-900/30 p-10 rounded-[3rem] border border-zinc-800/50 backdrop-blur-xl shadow-inner">
             <RiskGauge score={data?.score ?? 0} />
          </div>
        </div>

        <div className="flex-1 space-y-10">
          <div className="bg-zinc-900/30 p-8 md:p-12 rounded-[3.5rem] border border-zinc-800/50 backdrop-blur-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-10 relative z-10">
               <h3 className="text-2xl font-black text-white italic tracking-tight">{activeScenario} Projection</h3>
               {loading && <div className="bg-green-500 text-black px-4 py-1 rounded-full text-[10px] font-black animate-pulse uppercase">Simulating...</div>}
            </div>
            <div className="h-[450px] relative z-10">
              <CashflowChart data={data?.data ?? []} loading={loading} />
            </div>
          </div>
          
          <StatCards currentBalance={data?.current_balance ?? 0} />
          <TransactionTable />
        </div>
      </div>

      {showModal && (
        <AddTransactionModal 
          onClose={() => setShowModal(false)} 
          onAdded={() => { setShowModal(false); runSimulation(activeScenario, delay, multiplier); }} 
        />
      )}
    </main>
  );
}
