'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://wvcurewpkmvwxbkfchtk.supabase.co',
  'sb_publishable_AKiMoepODBWXI9umP9FvKQ_YeuhtvBz'
)

export default function StatCards() {
  const [runway, setRunway] = useState<number | null>(null)
  const [totalCash, setTotalCash] = useState(0)
  const [pendingInvoices, setPendingInvoices] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('amount, status, running_balance, created_at')
        .order('created_at', { ascending: true })

      if (data && data.length > 0) {
        const latest = data[data.length - 1]
        setTotalCash(Number(latest.running_balance))

        const pending = data
          .filter((t: any) => t.status === 'pending')
          .reduce((sum: number, t: any) => sum + Number(t.amount), 0)
        setPendingInvoices(pending)

        const negativeEntry = data.find((t: any) => Number(t.running_balance) < 1000)
        if (negativeEntry) {
          const today = new Date()
          const doomsday = new Date(negativeEntry.created_at)
          const diff = Math.floor((doomsday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          setRunway(diff)
        } else {
          setRunway(90)
        }
      }
    }
    fetchData()
  }, [])

  const runwayColor = runway === null ? 'text-gray-400' :
    runway < 30 ? 'text-red-400 animate-pulse' :
    runway < 90 ? 'text-yellow-400' : 'text-green-400'

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-gray-900 p-6 rounded-xl">
        <p className="text-gray-400 text-sm">Total Cash</p>
        <h3 className="text-white text-2xl font-bold mt-1">
          ${totalCash.toLocaleString()}
        </h3>
      </div>
      <div className="bg-gray-900 p-6 rounded-xl">
        <p className="text-gray-400 text-sm">Pending Invoices</p>
        <h3 className="text-yellow-400 text-2xl font-bold mt-1">
          ${Math.abs(pendingInvoices).toLocaleString()}
        </h3>
      </div>
      <div className="bg-gray-900 p-6 rounded-xl">
        <p className="text-gray-400 text-sm">⏰ Survival Clock</p>
        <h3 className={`text-2xl font-bold mt-1 ${runwayColor}`}>
          {runway === null ? 'Calculating...' : `${runway} days`}
        </h3>
        <p className="text-gray-500 text-xs mt-1">
          {runway !== null && runway < 30 ? '⚠️ Critical! Balance below $1,000 soon!' :
           runway !== null && runway < 90 ? '⚡ Watch your spending!' :
           '✅ You are safe!'}
        </p>
      </div>
    </div>
  )
}