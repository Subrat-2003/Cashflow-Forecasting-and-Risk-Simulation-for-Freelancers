'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Props {
  onClose: () => void
  onAdded: () => void
}

// ── SHA-256 fingerprint ───────────────────────────────────────────────────────
// Stored in `approval_hash` (text null) — feeds v_legal_evidence_vault view.
// sha256_fingerprint column does NOT exist; approval_hash is the correct target.
async function generateFingerprint(
  amount: number,
  date: string,
  category: string,
  userId: string
): Promise<string> {
  const raw = `${amount}${date}${category}${userId}`
  const encoded = new TextEncoder().encode(raw)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Schema-sourced constants
const CATEGORIES = ['Milestone', 'Retainer', 'Project', 'Daily Expense', 'Ad-hoc', 'Subscription', 'Rent', 'Other']
const PERSONAS   = ['Retainer', 'Expense', 'Laggard', 'System']   // from actual table data
const STATUSES   = ['cleared', 'pending', 'paid', 'overdue']       // table default = 'cleared'

const USER_ID = 'e6d6e60c-6890-4edf-94ea-7186e93a6064'

export default function AddTransactionModal({ onClose, onAdded }: Props) {
  const [form, setForm] = useState({
    client_name:   '',
    category:      'Milestone',
    persona:       'Retainer',     // NOT NULL in schema — was missing before
    amount:        '',
    status:        'cleared',      // matches table default
    expected_date: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!form.client_name || !form.amount) {
      setError('Client name and amount are required.')
      return
    }
    const amountNum = parseFloat(form.amount)
    if (isNaN(amountNum)) { setError('Amount must be a valid number.'); return }

    setLoading(true)
    setError(null)

    try {
      // Fingerprint → approval_hash (existing col, feeds v_legal_evidence_vault)
      const approvalHash = await generateFingerprint(amountNum, form.expected_date, form.category, USER_ID)

      const { error: insertErr } = await supabase
        .from('transactions')
        .insert([{
          user_id:       USER_ID,
          client_name:   form.client_name,
          category:      form.category,
          persona:       form.persona,                               // NOT NULL — required
          amount:        amountNum,
          status:        form.status,
          expected_date: new Date(form.expected_date).toISOString(), // schema = timestamptz
          approval_hash: approvalHash,                               // was wrongly named sha256_fingerprint
          // running_balance: OMITTED — auto by trg_auto_balance trigger
        }])

      if (insertErr) throw insertErr
      onAdded()
      onClose()
    } catch (e: any) {
      setError(e.message ?? 'Insert failed.')
      console.error('[AddTransaction]', e)
    } finally {
      setLoading(false)
    }
  }

  const field = 'w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-cyan-500 outline-none'

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-8 w-full max-w-md border border-gray-700">
        <h2 className="text-white text-xl font-bold mb-6">➕ Add Transaction</h2>

        {error && (
          <div className="bg-red-900/40 border border-red-500 rounded-lg px-4 py-2 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <input className={field} placeholder="Client name"
            value={form.client_name}
            onChange={(e) => setForm({ ...form, client_name: e.target.value })} />

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Category</label>
            <select className={field} value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* PERSONA — was completely missing, causes NOT NULL violation */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">
              Persona <span className="text-red-400 text-xs">(required)</span>
            </label>
            <select className={field} value={form.persona}
              onChange={(e) => setForm({ ...form, persona: e.target.value })}>
              {PERSONAS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>

          <input type="number" step="0.01" className={field}
            placeholder="Amount (use negative for expense)"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })} />

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Status</label>
            <select className={field} value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Expected Date</label>
            <input type="date" className={field} value={form.expected_date}
              onChange={(e) => setForm({ ...form, expected_date: e.target.value })} />
          </div>
        </div>

        <p className="text-gray-600 text-xs mt-3">
          🔒 SHA-256 fingerprint auto-stored in <code className="text-gray-500">approval_hash</code> → audit vault
        </p>

        <div className="flex gap-3 mt-4">
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white font-bold py-2 rounded-lg transition-colors">
            {loading ? 'Submitting…' : '✅ Submit'}
          </button>
          <button onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-lg transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
