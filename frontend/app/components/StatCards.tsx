'use client'

export default function StatCards() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-gray-900 p-6 rounded-xl">
        <p className="text-gray-400 text-sm">Total Cash</p>
        <h3 className="text-white text-2xl font-bold mt-1">$12,400</h3>
      </div>
      <div className="bg-gray-900 p-6 rounded-xl">
        <p className="text-gray-400 text-sm">Pending Invoices</p>
        <h3 className="text-yellow-400 text-2xl font-bold mt-1">$3,200</h3>
      </div>
      <div className="bg-gray-900 p-6 rounded-xl">
        <p className="text-gray-400 text-sm">Days of Runway</p>
        <h3 className="text-green-400 text-2xl font-bold mt-1">47 days</h3>
      </div>
    </div>
  )
}