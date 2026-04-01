'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://wvcurewpkmvwxbkfchtk.supabase.co',
  'sb_publishable_AKiMoepODBWXI9umP9FvKQ_YeuhtvBz'
)

export default function TransactionTable() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(570)

      if (error) {
        console.error('Supabase error:', error)
      } else {
        setTransactions(data || [])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const exportCSV = () => {
    const headers = ['Client,Category,Amount,Status,Balance,Date']
    const rows = transactions.map(t =>
      `${t.client_name},${t.category},${t.amount},${t.status},${t.running_balance},${new Date(t.created_at).toLocaleDateString()}`
    )
    const csv = [...headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transactions.csv'
    a.click()
  }

  return (
    <div className="bg-gray-900 p-6 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-bold">Recent Transactions</h2>
        <button
          onClick={exportCSV}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg"
        >
          📥 Export CSV
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-4">No transactions found!</p>
          <p className="text-gray-500 text-sm">Add your first transaction using the ➕ button above.</p>
        </div>
      ) : (
        <table className="w-full text-sm text-left text-gray-400">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2">Client</th>
              <th className="py-2">Category</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Status</th>
              <th className="py-2">Balance</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => (
              <tr key={i} className="border-b border-gray-800">
                <td className="py-2">{t.client_name || 'N/A'}</td>
                <td className="py-2">{t.category || 'N/A'}</td>
                <td className={`py-2 ${t.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  ${Number(t.amount).toFixed(2)}
                </td>
                <td className="py-2">{t.status}</td>
                <td className="py-2">${Number(t.running_balance).toFixed(2)}</td>
                <td className="py-2">{new Date(t.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}