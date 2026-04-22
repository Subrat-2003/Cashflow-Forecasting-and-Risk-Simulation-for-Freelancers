'use client';

import { useState, useEffect } from 'react';
import ScenarioSidebar from './components/ScenarioSidebar';
import CashflowChart from './components/CashflowChart';
import RiskGauge from './components/RiskGauge';
import StatCards from './components/StatCards';
import TransactionTable from './components/TransactionTable';
import AddTransactionModal from './components/AddTransactionModal';
import { useForecast } from '../hooks/useForecast';

export default function Dashboard() {
  const userId = "e6d6e60c-6890-4edf-94ea-7186e93a6064";
  const [showModal, setShowModal] = useState(false);
  const [activeScenario, setActiveScenario] = useState('Stable');
  
  // State for parameters required by your ScenarioSidebar component
  const [delay, setDelay] = useState(0);
  const [multiplier, setMultiplier] = useState(1);

  const { data, loading, runSimulation } = useForecast(userId);

  useEffect(() => {
    runSimulation('Stable');
  }, []);

  const handleScenarioChange = (scenario: string) => {
    setActiveScenario(scenario);
    runSimulation(scenario); 
  };

  const handleTransactionAdded = () => {
    setShowModal(false);
    runSimulation(activeScenario); 
  };

  return (
    <main className="bg-black min-h-screen p-3 md:p-6 text-white overflow-hidden font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">💼 Risk Center</h1>
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-green-500 hover:bg-green-600 text-white font-bold p-2 px-6 rounded-lg transition-all"
        >
          ➕ Add Transaction
        </button>
      </div>

      <StatCards currentBalance={data?.current_balance ?? 0} />

      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        <div className="w-full lg:w-1/4">
          <ScenarioSidebar 
            onScenarioChange={handleScenarioChange}
            activeScenario={activeScenario}
            loading={loading}
            delay={delay}
            multiplier={multiplier}
            onDelayChange={setDelay}
            onMultiplierChange={setMultiplier}
          />
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <RiskGauge score={data?.score ?? 0} />
          </div>
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 h-96">
            <CashflowChart data={data?.data ?? []} loading={loading} />
          </div>
          <TransactionTable />
        </div>
      </div>

      {showModal && (
        <AddTransactionModal 
          onClose={() => setShowModal(false)} 
          onAdded={handleTransactionAdded} 
        />
      )}
    </main>
  );
}
