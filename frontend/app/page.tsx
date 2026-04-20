'use client'
import { useState } from 'react'
import RiskGauge from './components/RiskGauge'
import ScenarioSidebar from './components/ScenarioSidebar'
import TransactionTable from './components/TransactionTable'
import StatCards from './components/StatCards'
import CashflowChart from './components/CashflowChart'
import CashflowWarning from './components/CashflowWarning'
import AddTransactionModal from './components/AddTransactionModal'

export default function Home() {
  const [showModal, setShowModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAdded = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <main className="bg-black min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-white text-3xl font-bold">
          💼 Freelancer Risk Center
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-lg"
        >
          ➕ Add Transaction
        </button>
      </div>

      <CashflowWarning />
      <StatCards />

      <div className="flex gap-6 mt-6">
        <div className="w-1/4">
          <ScenarioSidebar />
        </div>
        <div className="flex-1 flex flex-col gap-6">
          <RiskGauge score={72} />
          <CashflowChart key={refreshKey} />
          <TransactionTable key={refreshKey} />
        </div>
      </div>

      {showModal && (
        <AddTransactionModal
          onClose={() => setShowModal(false)}
          onAdded={handleAdded}
        />
      )}
    </main>
  )
}
