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
