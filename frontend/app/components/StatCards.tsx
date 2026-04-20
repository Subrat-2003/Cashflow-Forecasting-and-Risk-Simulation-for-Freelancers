'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const USER_ID = 'e6d6e60c-6890-4edf-94ea-7186e93a6064'

export default function StatCards() {
  const [runway, setRunway]           = useState<number | null>(null)
  const [totalCash, setTotalCash]     = useState(0)
  const [outstanding, setOutstanding] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('v_client_risk_status')
        .select('amount, status, is_paid, running_balance, expected_date, created_at')
        .eq('user_id', USER_ID)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('[StatCards] error:', error.message, error.code)
        return
      }
      if (!data || data.length === 0) return

      const latest = data[data.length - 1]
      setTotalCash(Number(latest.running_balance))

      const unpaid = data
        .filter((t: any) => t.is_paid === false && Number(t.amount) > 0)
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0)
      setOutstanding(unpaid)

      const today = new Date()
      const danger = data.find(
        (t: any) =>
          Number(t.running_balance) < 1000 &&
          new Date(t.expected_date) > today
      )
      if (danger) {
        const diff = Math.floor(
          (new Date(danger.expected_date).getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24)
        )
        setRunway(Math.max(0, diff))
      } else {
        setRunway(90)
      }
    }

    fetchData()
  }, [])

  const runwayColor =
    runway === null ? 'text-gray-400' :
    runway < 30     ? 'text-red-400 animate-pulse' :
    runway < 90     ? 'text-yellow-400' : 'text-green-400'

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <p className="text-gray-400 text-sm">💰 Total Cash</p>
        <h3 className="text-white text-2xl font-bold mt-1">
          ${totalCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h3>
        <p className="text-gray-600 text-xs mt-1">Current running balance</p>
      </div>

      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <p className="text-gray-400 text-sm">📄 Outstanding Receivables</p>
        <h3 className="text-yellow-400 text-2xl font-bold mt-1">
          ${outstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h3>
        <p className="text-gray-600 text-xs mt-1">Unpaid positive transactions</p>
      </div>

      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <p className="text-gray-400 text-sm">⏰ Survival Clock</p>
        <h3 className={`text-2xl font-bold mt-1 ${runwayColor}`}>
          {runway === null ? 'Calculating…' : `${runway} days`}
        </h3>
        <p className="text-gray-500 text-xs mt-1">
          {runway !== null && runway < 30 ? '⚠️ Critical — balance below $1,000 soon!' :
           runway !== null && runway < 90 ? '⚡ Watch your spending!' :
           '✅ Cash position is safe'}
        </p>
      </div>
    </div>
  )
}
