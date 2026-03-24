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

  return (
    <div className="bg-gray-900 p-6 rounded-xl">
      <h2 className="text-white text-xl font-bold mb-4">Recent Transactions</h2>
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : transactions.length === 0 ? (
        <p className="text-gray-400">No transactions found.</p>
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