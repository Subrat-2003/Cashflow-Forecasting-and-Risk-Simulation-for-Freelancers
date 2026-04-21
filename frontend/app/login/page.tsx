'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase' // Using your singleton
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Redirect to dashboard after successful login
      router.push('/')
    }
  }

  return (
    <main className="bg-black min-h-screen flex items-center justify-center p-6">
      <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h1 className="text-white text-3xl font-bold mb-2 text-center">🛡️ Risk Center</h1>
        <p className="text-gray-400 text-sm text-center mb-8">AI-Driven Stochastic Intelligence Login</p>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Email Address</label>
            <input
              type="email"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Password</label>
            <input
              type="password"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </main>
  )
}
