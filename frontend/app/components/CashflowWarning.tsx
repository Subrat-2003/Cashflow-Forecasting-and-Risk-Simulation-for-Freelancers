'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CashflowWarning() {
  const [latePayments, setLatePayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('v_client_risk_status')
        .select('client_name, expected_date, actual_date, amount, persona')
        .order('expected_date', { ascending: true })

      if (!error && data) {
        const late = data.filter((t: any) => {
          if (!t.actual_date) return true
          const expected = new Date(t.expected_date)
          const actual = new Date(t.actual_date)
          return actual > expected
        })
        setLatePayments(late)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return null
  if (latePayments.length === 0) return null

  return (
    <div className="bg-red-900 border border-red-500 p-4 rounded-xl mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">⚠️</span>
        <h2 className="text-red-300 text-lg font-bold">
          Cashflow Warning! {latePayments.length} Late or Missing Payments Detected
        </h2>
      </div>
      <div className="flex flex-col gap-2 mt-3">
        {latePayments.slice(0, 3).map((t, i) => (
          <div key={i} className="bg-red-800 p-3 rounded-lg flex justify-between">
            <span className="text-white">{t.client_name || 'Unknown'}</span>
            <span className="text-red-300">${Number(t.amount).toFixed(2)}</span>
            <span className="text-gray-300 text-sm">
              Expected: {new Date(t.expected_date).toLocaleDateString()}
            </span>
          </div>
        ))}
        {latePayments.length > 3 && (
          <p className="text-red-300 text-sm mt-1">
            + {latePayments.length - 3} more late payments...
          </p>
        )}
      </div>
    </div>
  )
}
