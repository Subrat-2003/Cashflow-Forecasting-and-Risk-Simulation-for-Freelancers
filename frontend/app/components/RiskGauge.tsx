'use client'

export default function RiskGauge({ score = 72 }: { score?: number }) {
  const angle = (score / 100) * 180 - 90

  return (
    <div className="bg-gray-900 p-6 rounded-xl flex flex-col items-center">
      <h2 className="text-white text-xl font-bold mb-4">Confidence Score</h2>
      
      <div className="relative w-48 h-24 overflow-hidden">
        <div className="absolute w-48 h-48 rounded-full border-8 border-gray-700 top-0"></div>
        <div
          className="absolute w-48 h-48 rounded-full border-8 border-green-400 top-0"
          style={{
            clipPath: 'polygon(50% 50%, 0% 0%, 100% 0%)',
            transform: `rotate(${angle}deg)`,
            transformOrigin: 'center center',
          }}
        ></div>
      </div>

      <p className="text-green-400 text-5xl font-bold mt-2">{score}%</p>
      <p className="text-gray-400 text-sm mt-1">Financial Confidence</p>
    </div>
  )
}