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
  
  // State for sidebar parameters required by your ScenarioSidebar component
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

  // This is the function TypeScript is screaming for
  const handleTransactionAdded = () => {
    setShowModal(false);
    runSimulation(activeScenario); 
  };

  return (
    <main className="bg-black min-h
