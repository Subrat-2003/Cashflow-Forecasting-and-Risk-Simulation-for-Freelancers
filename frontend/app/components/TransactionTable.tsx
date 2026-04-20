'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const USER_ID = 'e6d6e60c-6890-4edf-94ea-7186e93a6064'

const STATUS_COLORS: Record<string, string> = {
  cleared: 'text-green-400',
  pending: 'text-yellow-400',
  paid:    'text-cyan-400',
  overdue: 'text-red-400',
}

export default function TransactionTable() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('v_client_risk_status')
        .select(
          'id, client_name, category, persona, amount, status, is_paid, running_balance, expected_date, automated_status, created_at'
        )
        .eq('user_id', USER_ID)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('[TransactionTable] error:', error.message, error.code)
      }
      setTransactions(data ?? [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const exportCSV = () => {
    const headers = ['Client,Category,Persona,Amount,Status,IsPaid,Balance,ExpectedDate,AutomatedStatus']
    const rows = transactions.map((t) =>
      [
        t.client_name ?? '',
        t.category ?? '',
        t.persona ?? '',
        t.amount,
        t.status,
        t.is_paid,
        t.running_balance,
        new Date(t.expected_date).toLocaleDateString(),
        t.automated_status ?? '',
      ].join(',')
    )
    const csv  = [...headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    Object.assign(document.createElement('a'), { href: url, download: 'transactions.csv' }).click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-bold">Recent Transactions</h2>
        <button onClick={exportCSV}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg">
          📥 Export CSV
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-2">No transactions found.</p>
          <p className="text-gray-500 text-sm">Use ➕ to add your first transaction.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead>
              <tr className="border-b border-gray-700 text-gray-500 text-xs uppercase">
                <th className="py-2 pr-4">Client</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Persona</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Paid</th>
                <th className="py-2 pr-4">Balance</th>
                <th className="py-2 pr-4">Expected</th>
                <th className="py-2">Risk</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                  <td className="py-2 pr-4">{t.client_name ?? 'N/A'}</td>
                  <td className="py-2 pr-4">{t.category ?? 'N/A'}</td>
                  <td className="py-2 pr-4 text-gray-500">{t.persona ?? '—'}</td>
                  <td className={`py-2 pr-4 font-mono ${Number(t.amount) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    ${Number(t.amount).toFixed(2)}
                  </td>
                  <td className={`py-2 pr-4 ${STATUS_COLORS[t.status] ?? 'text-gray-400'}`}>
                    {t.status}
                  </td>
                  <td className="py-2 pr-4">
                    {t.is_paid ? '✅' : '⏳'}
                  </td>
                  <td className="py-2 pr-4 font-mono">
                    ${Number(t.running_balance).toFixed(2)}
                  </td>
                  <td className="py-2 pr-4">
                    {new Date(t.expected_date).toLocaleDateString()}
                  </td>
                  <td className={`py-2 text-xs ${
                    t.automated_status === 'Laggard' ? 'text-red-400' :
                    t.automated_status === 'OnTime'  ? 'text-green-400' :
                    'text-gray-500'
                  }`}>
                    {t.automated_status ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
