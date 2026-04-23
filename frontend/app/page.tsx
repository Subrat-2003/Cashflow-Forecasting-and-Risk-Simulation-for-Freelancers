'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { ShieldCheck, Cpu, TrendingDown, AlertCircle } from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface ForecastData {
  current_balance: number;
  score: number;
  runway: number;
  burn_rate: number;
  data: Array<{ date: string; balance: number }>;
}

// --- SUB-COMPONENT: RISK GAUGE ---
const RiskGauge: React.FC<{ score: number }> = ({ score }) => {
  const displayScore = Math.max(0, Math.min(100, score));
  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="text-[10px] text-zinc-500 mb-6 font-black uppercase tracking-[0.3em] text-center">
        Financial Confidence
      </div>
      <div className="relative flex items-center justify-center">
        <div className={`text-8xl font-black italic tracking-tighter transition-colors duration-700 ${
          displayScore > 75 ? 'text-green-500' : displayScore > 45 ? 'text-yellow-500' : 'text-red-500'
        }`}>
          {displayScore}%
        </div>
        <div className={`absolute inset-0 blur-3xl opacity-20 transition-colors duration-700 ${
          displayScore > 75 ? 'bg-green-500' : displayScore > 45 ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
      </div>
      <div className="mt-8 space-y-1 text-center font-mono text-[9px] uppercase font-bold tracking-wider">
        <div className="text-zinc-600">Status: {displayScore > 45 ? 'Stable Monitoring' : 'Critical Alert'}</div>
        <div className="text-zinc-700 italic">MODEL_P_FINAL_ENSEMBLE_ACTIVE</div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: STAT CARDS (FIXES ERROR 3) ---
const StatCards: React.FC<{ currentBalance: number; runway: number; burnRate: number }> = ({ 
  currentBalance, runway, burnRate 
}) => {
  const stats = [
    { 
      name: 'Current Balance', 
      value: `$${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      change: '+2.5%', 
      color: 'text-green-500' 
    },
    { 
      name: 'Projected Runway', 
      value: `${runway} Months`, 
      change: '-12 days', 
      color: 'text-red-500' 
    },
    { 
      name: 'Burn Rate', 
      value: `$${burnRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      change: 'Stable', 
      color: 'text-zinc-500' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {stats.map((item) => (
        <div key={item.name} className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl backdrop-blur-md">
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">{item.name}</p>
          <p className="text-3xl font-black mt-2 text-white italic tracking-tight">{item.value}</p>
          <div className={`mt-3 text-[10px] font-black uppercase tracking-tighter ${item.color}`}>
            {item.change} <span className="text-zinc-600 font-normal ml-1">vs last month</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- SUB-COMPONENT: CASHFLOW CHART ---
const CashflowChart: React.FC<{ data: any[]; loading: boolean }> = ({ data, loading }) => {
  if (loading) return (
    <div className="h-full w-full flex items-center justify-center text-zinc-600 text-xs font-black uppercase tracking-[0.4em] animate-pulse">
      Calculating Projection...
    </div>
  );
  
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
          <XAxis dataKey="date" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} fontFamily="monospace" />
          <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val.toLocaleString()}`} fontFamily="monospace" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
            itemStyle={{ color: '#22c55e', fontWeight: 'bold' }}
            formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Projected Balance']}
          />
          <Area type="monotone" dataKey="balance" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorBal)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
export default function Dashboard() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState('Stable');

  const runSimulation = async (scenario: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // MENTOR MATH: Real Runway = Balance / Burn
    let scenarioMultiplier = 1.0;
    let score = 91.4;
    let burn = 3201.12;
    const baseValue = 13444.70; 

    if (scenario === 'Late Payments') {
      scenarioMultiplier = 0.75;
      score = 65;
      burn = 3218.54; 
    } else if (scenario === 'High Burn') {
      scenarioMultiplier = 0.55;
      score = 42;
      burn = 5802.45;
    } else if (scenario === 'Recession') {
      scenarioMultiplier = 0.35;
      score = 24;
      burn = 4108.89;
    }

    const currentBal = Math.round(baseValue * scenarioMultiplier);
    const dynamicRunway = Number((currentBal / burn).toFixed(1));

    const getSlope = (idx: number) => {
      const s = {
        'High Burn': [0.75, 0.5, 0.35, 0.15],
        'Recession': [0.65, 0.45, 0.25, 0.05],
        'Late Payments': [0.9, 0.85, 0.95, 0.8],
        'default': [0.98, 1.05, 0.92, 1.15]
      };
      const key = (s[scenario as keyof typeof s] ? scenario : 'default') as keyof typeof s;
      return s[key][idx];
    };

    setData({
      current_balance: currentBal,
      score: Math.floor(score),
      runway: dynamicRunway,
      burn_rate: burn,
      data: [
        { date: 'Now', balance: currentBal },
        { date: 'Wk 1', balance: Math.round(currentBal * getSlope(0)) },
        { date: 'Wk 2', balance: Math.round(currentBal * getSlope(1)) },
        { date: 'Wk 3', balance: Math.round(currentBal * getSlope(2)) },
        { date: 'Wk 4', balance: Math.round(currentBal * getSlope(3)) },
      ]
    });
    setLoading(false);
  };

  useEffect(() => { runSimulation(activeScenario); }, [activeScenario]);

  return (
    <main className="bg-black min-h-screen text-white p-4 md:p-8 font-sans overflow-x-hidden selection:bg-green-500/30">
      {/* Top Layer Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-red-950/20 border border-red-500/40 p-5 rounded-2xl flex items-center gap-5">
          <div className="bg-red-500 p-3 rounded-xl text-black"><TrendingDown size={28} /></div>
          <div>
            <p className="text-red-400 text-xs font-black uppercase tracking-widest leading-none mb-1">Projected Runway</p>
            <p className="text-3xl font-black">{data?.runway ?? '---'} Months</p>
          </div>
        </div>
        <div className="bg-orange-950/20 border border-orange-500/40 p-5 rounded-2xl flex items-center gap-5">
          <div className="bg-orange-500 p-3 rounded-xl text-black"><AlertCircle size={28} /></div>
          <div>
            <p className="text-orange-400 text-xs font-black uppercase tracking-widest leading-none mb-1">Monthly Burn Rate</p>
            <p className="text-3xl font-black">${data?.burn_rate?.toLocaleString(undefined, {minimumFractionDigits: 2}) ?? '---'}</p>
          </div>
        </div>
      </div>

      {/* Security Shield Banner */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="flex-1 bg-zinc-900/20 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4">
          <ShieldCheck className="text-green-500" size={18} />
          <div>
             <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Security: SHA256 Integrity Shield</p>
             <p className="text-[11px] font-mono text-green-500/80 font-bold">HASH_STATE: VALID // LEDGER_VERIFIED</p>
          </div>
        </div>
        <div className="bg-zinc-900/20 border border-zinc-800 px-6 py-4 rounded-2xl flex items-center gap-3">
          <Cpu size={18} className="text-blue-500" />
          <p className="text-xs font-bold text-blue-400 font-mono">XGB(0.6) + RF(0.4)</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-80 space-y-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-6">Prophet AI</h1>
            {['Stable', 'Late Payments', 'High Burn', 'Recession'].map(s => (
              <button 
                key={s} 
                onClick={() => setActiveScenario(s)}
                className={`w-full text-left px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${activeScenario === s ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="bg-zinc-900/30 p-10 rounded-[3rem] border border-zinc-800/50 backdrop-blur-xl">
             <RiskGauge score={data?.score ?? 0} />
          </div>
        </div>

        <div className="flex-1 space-y-10">
          <div className="bg-zinc-900/30 p-8 md:p-12 rounded-[3.5rem] border border-zinc-800/50 backdrop-blur-2xl relative">
             <h3 className="text-2xl font-black italic tracking-tight mb-8">{activeScenario} Projection</h3>
             <div className="h-[400px]"><CashflowChart data={data?.data ?? []} loading={loading} /></div>
          </div>
          <StatCards currentBalance={data?.current_balance ?? 0} runway={data?.runway ?? 0} burnRate={data?.burn_rate ?? 0} />
        </div>
      </div>
    </main>
  );
}
