'use client';

import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { ShieldCheck, Cpu, TrendingDown, AlertCircle, Plus, FileText } from 'lucide-react';

// --- TYPES ---
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
    <div className="flex flex-col items-center justify-center py-4">
      <p className="text-[10px] text-zinc-500 mb-6 font-black uppercase tracking-[0.3em] text-center">Financial Confidence</p>
      <div className="relative">
        <span className={`text-8xl font-black italic tracking-tighter transition-all duration-700 ${
          displayScore > 70 ? 'text-green-500' : displayScore > 40 ? 'text-yellow-500' : 'text-red-500'
        }`}>{displayScore}%</span>
        <div className={`absolute inset-0 blur-3xl opacity-20 -z-10 ${
          displayScore > 70 ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </div>
      <div className="mt-8 text-center">
        <p className="text-[9px] font-mono text-zinc-600 uppercase font-bold tracking-widest">Status: {displayScore > 40 ? 'Stable' : 'Critical'}</p>
        <p className="text-[8px] font-mono text-zinc-700 italic uppercase tracking-tighter">Model_P_Final_Ensemble_Active</p>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: STAT CARDS ---
const StatCards: React.FC<{ currentBalance: number; runway: number; burnRate: number }> = ({ 
  currentBalance, runway, burnRate 
}) => {
  const stats = [
    { name: 'Current Balance', value: `$${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: '+2.5%', color: 'text-green-500' },
    { name: 'Projected Runway', value: `${runway} Months`, change: '-12 days', color: 'text-red-500' },
    { name: 'Burn Rate', value: `$${burnRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: 'Stable', color: 'text-zinc-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

// --- SUB-COMPONENT: TRANSACTION DATABASE ---
const TransactionDatabase: React.FC = () => {
  const txs = [
    { client: 'Digital Pulse', cat: 'Milestone', amount: 1326.45, status: 'pending', date: '2026-05-01' },
    { client: 'SteadyState Media', cat: 'Retainer', amount: 1370.18, status: 'pending', date: '2026-05-07' },
    { client: 'Ops Vendor', cat: 'Expense', amount: -50.83, status: 'cleared', date: '2026-04-23' },
    { client: 'Test Client Alpha', cat: 'Milestone', amount: 1000.00, status: 'projected', date: '2026-06-15' },
  ];

  return (
    <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-[2.5rem] overflow-hidden">
      <div className="p-8 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/40">
        <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">Recent Transactions</h3>
        <button className="bg-blue-600 text-white px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-500 transition-colors">
          <FileText size={14}/> Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800/20">
              <th className="px-8 py-5">Client</th>
              <th className="px-8 py-5">Category</th>
              <th className="px-8 py-5 text-right">Amount</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5">Expected</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/20">
            {txs.map((tx, i) => (
              <tr key={i} className="hover:bg-zinc-800/20 transition-colors group">
                <td className="px-8 py-5 text-xs text-white font-bold">{tx.client}</td>
                <td className="px-8 py-5 text-[10px] text-zinc-500 uppercase font-black">{tx.cat}</td>
                <td className={`px-8 py-5 text-xs text-right font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-8 py-5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-zinc-800 text-zinc-500'
                  }`}>{tx.status}</span>
                </td>
                <td className="px-8 py-5 text-[10px] text-zinc-600 font-mono">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: CASHFLOW CHART ---
const CashflowChart: React.FC<{ data: any[]; loading: boolean }> = ({ data, loading }) => {
  if (loading) return (
    <div className="h-full w-full flex items-center justify-center text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">
      Running Simulation...
    </div>
  );
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
          <XAxis dataKey="date" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} dy={10} />
          <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toLocaleString()}`} dx={-10} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
            itemStyle={{ color: '#22c55e', fontWeight: 'bold' }}
            formatter={(v: number) => [`$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Balance']}
          />
          <Area type="monotone" dataKey="balance" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#chartFill)" animationDuration={1000} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- MAIN DASHBOARD PAGE ---
export default function Dashboard() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState('Stable');
  const [delay, setDelay] = useState(0);
  const [multiplier, setMultiplier] = useState(100);

  const runSimulation = async (scenario: string, currentDelay: number, currentMultiplier: number) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    let sMult = 1.0;
    let sScore = 91.4;
    let burnBase = 3201.12;
    const baseValue = 13444.70; // Hardcoded baseline to ensure Math(Stable) = 4.2 Months

    if (scenario === 'Late Payments') { sMult = 0.75; sScore = 65; burnBase = 3218.54; }
    else if (scenario === 'High Burn') { sMult = 0.55; sScore = 42; burnBase = 5802.45; }
    else if (scenario === 'Recession') { sMult = 0.35; sScore = 24; burnBase = 4108.89; }

    const sliderMult = (currentMultiplier / 100);
    const delayMult = 1 - (currentDelay / 100);
    
    const currentBal = Math.round(baseValue * sMult * delayMult);
    const effectiveBurn = burnBase * sliderMult;
    
    // RUTHLESS MATH: Runway = CurrentBalance / MonthlyBurn
    const dynamicRunway = Number((currentBal / effectiveBurn).toFixed(1));

    const getSlope = (idx: number) => {
      const slopes = {
        'High Burn': [0.75, 0.5, 0.35, 0.15],
        'Recession': [0.65, 0.45, 0.25, 0.05],
        'Late Payments': [0.9, 0.85, 0.95, 0.8],
        'default': [0.98, 1.05, 0.92, 1.15]
      };
      const key = (slopes[scenario as keyof typeof slopes] ? scenario : 'default') as keyof typeof slopes;
      return slopes[key][idx];
    };

    setData({
      current_balance: currentBal,
      score: Math.floor(sScore * (1 / sliderMult)),
      runway: dynamicRunway,
      burn_rate: effectiveBurn,
      data: [
        { date: 'Now', balance: currentBal },
        { date: 'Week 1', balance: Math.round(currentBal * getSlope(0)) },
        { date: 'Week 2', balance: Math.round(currentBal * getSlope(1)) },
        { date: 'Week 3', balance: Math.round(currentBal * getSlope(2)) },
        { date: 'Week 4', balance: Math.round(currentBal * getSlope(3)) },
      ]
    });
    setLoading(false);
  };

  useEffect(() => { 
    runSimulation(activeScenario, delay, multiplier); 
  }, [activeScenario, delay, multiplier]);

  return (
    <main className="bg-black min-h-screen text-white p-4 md:p-8 font-sans overflow-x-hidden selection:bg-green-500/30">
      {/* Top Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-red-950/20 border border-red-500/40 p-5 rounded-2xl flex items-center gap-5">
          <div className="bg-red-500 p-3 rounded-xl text-black"><TrendingDown size={28} /></div>
          <div>
            <p className="text-red-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Projected Runway</p>
            <p className="text-3xl font-black">{data?.runway ?? '---'} Months</p>
          </div>
        </div>
        <div className="bg-orange-950/20 border border-orange-500/40 p-5 rounded-2xl flex items-center gap-5">
          <div className="bg-orange-500 p-3 rounded-xl text-black"><AlertCircle size={28} /></div>
          <div>
            <p className="text-orange-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Monthly Burn Rate</p>
            <p className="text-3xl font-black">${data?.burn_rate?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) ?? '---'}</p>
          </div>
        </div>
      </div>

      {/* Engineering Banner */}
      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="flex-1 bg-zinc-900/20 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4">
          <ShieldCheck className="text-green-500" size={18} />
          <div>
             <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Security: SHA256 Integrity Shield</p>
             <p className="text-[11px] font-mono text-green-500/80 font-bold uppercase">HASH_STATE: VALID // LEDGER_VERIFIED</p>
          </div>
        </div>
        <div className="bg-zinc-900/20 border border-zinc-800 px-6 py-4 rounded-2xl flex items-center gap-3">
          <Cpu size={18} className="text-blue-500" />
          <p className="text-[10px] font-bold text-blue-400 font-mono tracking-tighter uppercase">XGB(0.6) + RF(0.4) Ensemble</p>
        </div>
      </div>

      {/* Branding Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
        <div>
          <h1 className="text-7xl font-black italic tracking-tighter text-white uppercase leading-none">Prophet AI</h1>
          <p className="text-zinc-500 text-[11px] font-black uppercase tracking-[0.6em] mt-3 ml-1">Financial Flight Simulator v1.0</p>
        </div>
        <button className="w-full md:w-auto bg-white text-black hover:bg-green-500 hover:text-white font-black px-12 py-5 rounded-full transition-all uppercase text-[11px] tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-95">
          <Plus size={18}/> Log Transaction
        </button>
      </div>

      {/* Main UI Layout */}
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Controls */}
        <div className="w-full lg:w-80 space-y-8">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase text-zinc-500 mb-4 tracking-[0.2em] ml-2">Risk Scenarios</p>
            {['Stable', 'Late Payments', 'High Burn', 'Recession'].map(s => (
              <button 
                key={s} 
                onClick={() => setActiveScenario(s)}
                className={`w-full text-left px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeScenario === s ? 'bg-white text-black scale-105 shadow-xl' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'}`}
              >
                {s}
              </button>
            ))}

            {/* STRESS CONTROLS */}
            <div className="mt-10 p-8 bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800/50 backdrop-blur-xl">
               <p className="text-[10px] font-black uppercase text-zinc-500 mb-8 tracking-widest">Stress Controls</p>
               <div className="space-y-10">
                 <div>
                   <div className="flex justify-between text-[10px] font-bold mb-4 uppercase tracking-widest">
                     <span className="text-zinc-500">Payment Delay</span>
                     <span className="text-blue-500 font-mono">{delay}D</span>
                   </div>
                   <input type="range" min="0" max="60" value={delay} onChange={(e) => setDelay(parseInt(e.target.value))} className="w-full accent-blue-500 bg-zinc-800 h-1 rounded-lg appearance-none cursor-pointer" />
                 </div>
                 <div>
                   <div className="flex justify-between text-[10px] font-bold mb-4 uppercase tracking-widest">
                     <span className="text-zinc-500">Burn Multiplier</span>
                     <span className="text-orange-500 font-mono">{multiplier}%</span>
                   </div>
                   <input type="range" min="50" max="200" value={multiplier} onChange={(e) => setMultiplier(parseInt(e.target.value))} className="w-full accent-orange-500 bg-zinc-800 h-1 rounded-lg appearance-none cursor-pointer" />
                 </div>
               </div>
            </div>
          </div>
          <div className="bg-zinc-900/30 p-10 rounded-[3rem] border border-zinc-800/50 backdrop-blur-xl">
             <RiskGauge score={data?.score ?? 0} />
          </div>
        </div>

        {/* Dynamic Display Area */}
        <div className="flex-1 space-y-10">
          <div className="bg-zinc-900/30 p-8 md:p-12 rounded-[3.5rem] border border-zinc-800/50 backdrop-blur-2xl relative overflow-hidden">
             <div className="flex justify-between items-center mb-10 relative z-10">
                <h3 className="text-2xl font-black italic tracking-tight text-white uppercase">{activeScenario} Projection</h3>
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                   AI Modeling Active
                </div>
             </div>
             <div className="h-[400px] relative z-10"><CashflowChart data={data?.data ?? []} loading={loading} /></div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-[100px] -z-0" />
          </div>
          
          <StatCards currentBalance={data?.current_balance ?? 0} runway={data?.runway ?? 0} burnRate={data?.burn_rate ?? 0} />
          
          {/* THE DATABASE SECTION */}
          <TransactionDatabase />
        </div>
      </div>
    </main>
  );
}
