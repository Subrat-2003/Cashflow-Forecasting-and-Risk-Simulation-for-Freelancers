'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://wvcurewpkmvwxbkfchtk.supabase.co',
  'sb_publishable_AKiMoepODBWXI9umP9FvKQ_YeuhtvBz'
)

export default function AddTransactionModal({ onClose, onAdded }: { onClose: () => void, onAdded: () => void }) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Ad-hoc')
  const [expectedDate, setExpectedDate] = useState('')
  const [persona, setPersona] = useState('Milestone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const { error } = await supabase
      .from('transactions')
      .insert([{
        amount: Number(amount),
        category,
        expected_date: expectedDate,
        persona,
        user_id: '475bb716-38fb-446f-93d1-e5de7f19d3b9',
        status: 'pending'
      }])

    if (error) {
      setError(error.message)
    } else {
      onAdded()
      onClose()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md">
        <h2 className="text-white text-xl font-bold mb-6">➕ New Transaction</h2>

        {error && <div className="bg-red-500 text-white p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <div className="mb-4">
          <label className="text-gray-400 text-sm">Amount ($)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full mt-1 p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
            placeholder="e.g. 1500"
          />
        </div>

        <div className="mb-4">
          <label className="text-gray-400 text-sm">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full mt-1 p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
          >
            <option>Ad-hoc</option>
            <option>Daily Expense</option>
            <option>Project Work</option>
            <option>Shock</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="text-gray-400 text-sm">Expected Date</label>
          <input
            type="date"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
            className="w-full mt-1 p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
          />
        </div>

        <div className="mb-6">
          <label className="text-gray-400 text-sm">Persona</label>
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            className="w-full mt-1 p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
          >
            <option>Milestone</option>
            <option>Laggard</option>
            <option>Expense</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg"
          >
            {loading ? 'Adding...' : 'Add Transaction'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}