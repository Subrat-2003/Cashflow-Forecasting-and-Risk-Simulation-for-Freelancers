import RiskGauge from './components/RiskGauge'
import ScenarioSidebar from './components/ScenarioSidebar'
import TransactionTable from './components/TransactionTable'
import StatCards from './components/StatCards'

export default function Home() {
  return (
    <main className="bg-black min-h-screen p-6">
      <h1 className="text-white text-3xl font-bold mb-6">
        💼 Freelancer Risk Center
      </h1>

      {/* Stat Cards at top */}
      <StatCards />

      <div className="flex gap-6 mt-6">
        {/* Sidebar on left */}
        <div className="w-1/4">
          <ScenarioSidebar />
        </div>

        {/* Main content on right */}
        <div className="flex-1 flex flex-col gap-6">
          <RiskGauge score={72} />
          <TransactionTable />
        </div>
      </div>
    </main>
  )
}