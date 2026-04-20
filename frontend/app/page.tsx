// 'use client'
// import { useState } from 'react'
// import RiskGauge from './components/RiskGauge'
// import ScenarioSidebar from './components/ScenarioSidebar'
// import TransactionTable from './components/TransactionTable'
// import StatCards from './components/StatCards'
// import CashflowChart from './components/CashflowChart'
// import CashflowWarning from './components/CashflowWarning'
// import AddTransactionModal from './components/AddTransactionModal'

// export default function Home() {
//   const [showModal, setShowModal] = useState(false)
//   const [refreshKey, setRefreshKey] = useState(0)

//   const handleAdded = () => {
//     setRefreshKey(prev => prev + 1)
//   }

//   // ✅ Dummy data for chart (for now)
//   const dummyData = [
//     {
//       prediction_date: "2026-04-01",
//       predicted_amount: 5000,
//       confidence_interval_low: 4000,
//       confidence_interval_high: 6000,
//     },
//     {
//       prediction_date: "2026-04-02",
//       predicted_amount: 7000,
//       confidence_interval_low: 6000,
//       confidence_interval_high: 8000,
//     },
//     {
//       prediction_date: "2026-04-03",
//       predicted_amount: 6500,
//       confidence_interval_low: 5500,
//       confidence_interval_high: 7500,
//     },
//   ]

//   return (
//     <main className="bg-black min-h-screen p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-white text-3xl font-bold">
//           💼 Freelancer Risk Center
//         </h1>
//         <button
//           onClick={() => setShowModal(true)}
//           className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-lg"
//         >
//           ➕ Add Transaction
//         </button>
//       </div>

//       <CashflowWarning />
//       <StatCards />

//       <div className="flex gap-6 mt-6">
//         <div className="w-1/4">
//           <ScenarioSidebar />
//         </div>

//         <div className="flex-1 flex flex-col gap-6">
//           <RiskGauge score={72} />

//           {/* ✅ FIXED: Passing data */}
//           <CashflowChart data={dummyData} key={refreshKey} />

//           <TransactionTable key={refreshKey} />
//         </div>
//       </div>

//       {showModal && (
//         <AddTransactionModal
//           onClose={() => setShowModal(false)}
//           onAdded={handleAdded}
//         />
//       )}
//     </main>
//   )
// }

'use client'
import { useState, useEffect } from 'react'
 import { supabase } from '@/lib/supabase'
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
  // FIX — explicit type matches the Supabase query shape
interface ForecastPoint {
  prediction_date: string
  predicted_amount: number
  confidence_interval_low: number
  confidence_interval_high: number
}

const [forecastData, setForecastData] = useState<ForecastPoint[]>([])
  const handleAdded = () => {
    setRefreshKey(prev => prev + 1)
  }

  // 🔥 FETCH DATA FROM SUPABASE
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
  .from('cashflow_predictions')
  .select('prediction_date, predicted_amount, confidence_interval_low, confidence_interval_high')
  .eq('user_id', 'e6d6e60c-6890-4edf-94ea-7186e93a6064')
  .eq('scenario_type', 'baseline')
  .order('prediction_date', { ascending: true })

if (error) {
  console.warn('[page.tsx] Forecast fetch failed:', error)
  // Don't block render — chart will show empty state
} else {
  setForecastData(data ?? [])
}
    }

    fetchData()
  }, [refreshKey])

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

          {/* ✅ REAL DATA */}
          {forecastData.length > 0 ? (
            <CashflowChart data={forecastData} />
          ) : (
            <div className="text-white">Loading or No Data...</div>
          )}

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