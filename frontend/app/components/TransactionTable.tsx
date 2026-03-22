'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function TransactionTable() {
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', '475bb716-38fb-446f-93d1-e5de7f19d3b9')
      
      if (error) console.error(error)
      else setTransactions(data || [])
    }
    fetchData()
  }, [])

  return (
    <div className="bg-gray-900 p-6 rounded-xl">
      <h2 className="text-white text-xl font-bold mb-4">Recent Transactions</h2>
      <table className="w-full text-sm text-left text-gray-400">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="py-2">Client</th>
            <th className="py-2">Amount</th>
            <th className="py-2">Status</th>
            <th className="py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, i) => (
            <tr key={i} className="border-b border-gray-800">
              <td className="py-2">{t.client_name}</td>
              <td className="py-2">${t.amount}</td>
              <td className="py-2">{t.status}</td>
              <td className="py-2">{t.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}