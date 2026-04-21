'use client'
import { useEffect, useState } from 'react'
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { supabase } from '@/lib/supabase'

// ── Types matching cashflow_predictions table schema ──────────────────────────
interface ForecastRow {
  prediction_date: string
  predicted_amount: number
  confidence_interval_low: number   // predicted_amount * 0.9  (worst-case)
  confidence_interval_high: number  // predicted_amount * 1.1  (optimistic)
  scenario_type: string
}

interface ChartPoint {
  date: string
  baseline: number
  corridor: [number, number]  // [low, high] for Area
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const baseline = payload.find((p: any) => p.dataKey === 'baseline')
  const low      = payload.find((p: any) => p.dataKey === 'corridor[0]')
  const high     = payload.find((p: any) => p.dataKey === 'corridor[1]')

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-xs">
      <p className="text-gray-300 font-bold mb-1">{label}</p>
      {baseline && (
        <p className="text-cyan-400">Baseline: ${Number(baseline.value).toFixed(2)}</p>
      )}
      {high && (
        <p className="text-green-400">Optimistic (+10%): ${Number(high.value).toFixed(2)}</p>
      )}
      {low && (
        <p className="text-red-400">Worst-case (−10%): ${Number(low.value).toFixed(2)}</p>
      )}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CashflowChart() {
  const [data, setData] = useState<ChartPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    const fetchForecast = async () => {
      // user_id hardcoded to match backend seed value — swap for auth.user.id in production
      const USER_ID = process.env.NEXT_PUBLIC_FORECAST_USER_ID ?? 'e6d6e60c-6890-4edf-94ea-7186e93a6064'

      const { data: rows, error: err } = await supabase
        .from('cashflow_predictions')
        .select('prediction_date, predicted_amount, confidence_interval_low, confidence_interval_high')
        .eq('user_id', USER_ID)
        .eq('scenario_type', 'baseline')
        .order('prediction_date', { ascending: true })

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      // Map backend fields → Recharts shape
      // Area needs [low, high] tuple; Recharts Area with type="monotone" 
      // renders a band when dataKey returns an array [bottom, top].
      const points: ChartPoint[] = (rows as ForecastRow[]).map((r) => ({
        date: new Date(r.prediction_date).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric',
        }),
        baseline: r.predicted_amount,
        corridor: [r.confidence_interval_low, r.confidence_interval_high],
      }))

      setData(points)
      setLoading(false)
    }

    fetchForecast()
  }, [])

  if (loading) return <div className="bg-gray-900 p-6 rounded-xl text-gray-400">Loading forecast…</div>
  if (error)   return <div className="bg-gray-900 p-6 rounded-xl text-red-400">Error: {error}</div>
  if (!data.length) return <div className="bg-gray-900 p-6 rounded-xl text-gray-500">No forecast data. Run <code>forecaster.py</code> first.</div>

  return (
    <div className="bg-gray-900 p-6 rounded-xl">
      <h2 className="text-white text-xl font-bold mb-4">
        📈 30-Day Cash Flow Forecast
        <span className="text-xs text-gray-500 font-normal ml-3">
          XGB×0.6 + RF×0.4 ensemble · ±10% stochastic corridor
        </span>
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: '#9CA3AF', fontSize: 12 }}
            formatter={(value: string) => {
           // Explicitly type the map to allow dynamic string indexing
              const labelMap: Record<string, string> = {
                baseline: 'Baseline (Ensemble)',
                corridor: '±10% Risk Corridor',
    };
    return labelMap[value] ?? value; 
  
  }}
/>

          {/* ── Stochastic risk corridor (shaded band) ──────────────────── */}
          {/* Recharts Area with a tuple dataKey renders the band between
              confidence_interval_low and confidence_interval_high          */}
          <Area
            type="monotone"
            dataKey="corridor"
            stroke="none"
            fill="#22d3ee"
            fillOpacity={0.08}
            legendType="rect"
            name="corridor"
            isAnimationActive={false}
          />

          {/* ── Baseline forecast line ───────────────────────────────────── */}
          <Line
            type="monotone"
            dataKey="baseline"
            stroke="#22d3ee"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#22d3ee' }}
            name="baseline"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* ── Legend annotation ─────────────────────────────────────────────── */}
      <div className="flex gap-6 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-green-400 inline-block" /> Optimistic (+10%)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-cyan-400 inline-block" /> Baseline
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-red-400 inline-block" /> Worst-case (−10%)
        </span>
      </div>
    </div>
  )
}
