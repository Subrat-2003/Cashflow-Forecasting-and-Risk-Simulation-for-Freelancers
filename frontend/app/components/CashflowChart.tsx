'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://wvcurewpkmvwxbkfchtk.supabase.co',
  'sb_publishable_AKiMoepODBWXI9umP9FvKQ_YeuhtvBz'
)

export default function CashflowChart() {
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('created_at, running_balance, persona')
        .order('created_at', { ascending: true })
        .limit(30)
      
      if (error) {
        console.error('Chart error:', error)
      } else {
        setChartData(data || [])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const maxBalance = Math.max(...chartData.map(t => Number(t.running_balance)))
  const minBalance = Math.min(...chartData.map(t => Number(t.running_balance)))

  return (
    <div className="bg-gray-900 p-6 rounded-xl">
      <h2 className="text-white text-xl font-bold mb-4">💰 Cashflow Over Time</h2>
      {loading ? (
        <p className="text-gray-400">Loading chart...</p>
      ) : (
        <div className="flex items-end gap-1 h-48">
          {chartData.map((t, i) => {
            const balance = Number(t.running_balance)
            const height = ((balance - minBalance) / (maxBalance - minBalance)) * 100
            const isLaggard = t.persona === 'Laggard'
            return (
              <div
                key={i}
                className="flex-1 rounded-t"
                style={{
                  height: `${height}%`,
                  backgroundColor: isLaggard ? '#EF4444' : '#34D399',
                  minHeight: '4px'
                }}
                title={`$${balance.toFixed(2)} - ${t.persona}`}
              />
            )
          })}
        </div>
      )}
      <div className="flex gap-4 mt-3">
        <span className="text-green-400 text-sm">🟢 Normal</span>
        <span className="text-red-400 text-sm">🔴 Laggard (High Risk)</span>
      </div>
    </div>
  )
}