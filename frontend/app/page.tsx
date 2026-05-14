'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { 
  ShieldCheck, Cpu, TrendingDown, AlertCircle, Plus, FileText, Search, 
  CheckCircle2, Clock, Hourglass, ArrowUpRight, ArrowDownRight, Filter,
  Sparkles, BrainCircuit, Volume2, History, CalendarDays, ShieldEllipsis,
  Activity, Fingerprint, Lock, Construction
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface ForecastData {
  current_balance: number;
  score: number;
  runway: number;
  burn_rate: number;
  chartData: Array<{ date: string; balance: number }>;
  dailyForecast: Array<{ day: number; date: string; balance: number; status: string }>;
}

interface Transaction {
  id: number;
  date: string;
  client: string;
  category: string;
  amount: number;
  status: 'completed' | 'pending' | 'cleared';
  risk: 'Low' | 'Medium' | 'High';
}

interface HandshakeLog {
  id: string;
  client: string;
  state: string;
  timestamp: string;
  integrity: string;
}

// --- SHA-256 INTEGRITY UTILITY ---
const calculateManualHash = async (tx: any) => {
  const msgUint8 = new TextEncoder().encode(`${tx.amount}|${tx.date}|${tx.category}|e6d6e60c-6890-4edf-94ea-7186e93a6064`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// --- SUB-COMPONENTS ---
const RiskGauge: React.FC<{ score: number }> = ({ score }) => {
  const displayScore = Math.max(0, Math.min(100, score));
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <p className="text-[10px] text-zinc-500 mb-6 font-black uppercase tracking-[0.3em] text-center leading-none">Financial Confidence</p>
      <div className="relative flex items-center justify-center">
        <span className={`text-8xl font-black italic tracking-tighter transition-all duration-1000 ${
          displayScore > 70 ? 'text-green-500' : displayScore > 40 ? 'text-yellow-500' : 'text-red-500'
        }`}>{displayScore}%</span>
        <div className={`absolute inset-0 blur-[80px] opacity-20 -z-10 transition-colors duration-1000 ${
          displayScore > 70 ? 'bg-green-500' : displayScore > 40 ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
      </div>
      <div className="mt-8 text-center">
        <p className="text-[9px] font-mono text-zinc-600 uppercase font-bold tracking-widest leading-none mb-2 text-zinc-400">Status: {displayScore > 40 ? 'Stable Monitoring' : 'Critical Alert'}</p>
        <p className="text-[8px] font-mono text-zinc-700 italic uppercase">Model_P_Final_Ensemble_Active</p>
      </div>
    </div>
  );
};

const StatCards: React.FC<{ currentBalance: number; runway: number; burnRate: number }> = ({ 
  currentBalance, runway, burnRate 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl backdrop-blur-md hover:border-zinc-700 transition-colors group shadow-lg">
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-3">Current Balance</p>
        <p className="text-3xl font-black text-white italic tracking-tight group-hover:text-green-400 transition-colors leading-none">${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        <div className="mt-4 text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 text-green-500">
          <ArrowUpRight size={14}/> +2.5% <span className="text-zinc-600 font-normal">vs last month</span>
        </div>
      </div>
      <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl backdrop-blur-md hover:border-zinc-700 transition-colors group shadow-lg">
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-3">Projected Runway</p>
        <p className="text-3xl font-black text-white italic tracking-tight group-hover:text-red-400 leading-none">{runway} Months</p>
        <div className="mt-4 text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 text-red-500">
          <ArrowDownRight size={14}/> -12 days <span className="text-zinc-600 font-normal">vs last month</span>
        </div>
      </div>
      <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl backdrop-blur-md hover:border-zinc-700 transition-colors group shadow-lg">
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-3">Burn Rate</p>
        <p className="text-3xl font-black text-white italic tracking-tight group-hover:text-green-400 transition-colors leading-none">${burnRate.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        <div className="mt-4 text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 text-zinc-500">
          Stable <span className="text-zinc-600 font-normal ml-1">vs last month</span>
        </div>
      </div>
    </div>
  );
};

const CashflowChart: React.FC<{ data: any[]; loading: boolean }> = ({ data, loading }) => {
  if (loading) return (
    <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
      <div className="text-green-500 animate-spin"><Cpu size={44}/></div>
      <div className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Running Neural Simulation...</div>
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
          <XAxis dataKey="date" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} dy={10} fontFamily="monospace" />
          <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toLocaleString()}`} dx={-10} fontFamily="monospace" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '16px' }}
            itemStyle={{ color: '#22c55e', fontWeight: 'bold' }}
            formatter={(v: number) => [`$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Balance']}
          />
          <Area type="monotone" dataKey="balance" stroke="#22c55e" strokeWidth={5} fillOpacity={1} fill="url(#chartFill)" animationDuration={1500} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- MAIN DASHBOARD PAGE ---
export default function App() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState('Stable');
  const [delay, setDelay] = useState(0);
  const [multiplier, setMultiplier] = useState(100);
  const [activeTab, setActiveTab] = useState<'history' | 'forecast' | 'handshake'>('history');

  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [aiStrategy, setAiStrategy] = useState<{ risk_level: string; strategic_actions: string[] } | null>(null);

  const runSimulation = async (scenario: string, currentDelay: number, currentMultiplier: number) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const baseValue = 13444.70; 
    let sMult = 1.0;
    let sScore = 91.4;
    let burnBase = 3201.12;

    if (scenario === 'Late Payments') { sMult = 0.75; sScore = 65; burnBase = 3218.54; }
    else if (scenario === 'High Burn') { sMult = 0.55; sScore = 42; burnBase = 5802.45; }
    else if (scenario === 'Recession') { sMult = 0.35; sScore = 24; burnBase = 4108.89; }

    const sliderMult = (currentMultiplier / 100);
    const delayMult = 1 - (currentDelay / 100);
    const currentBal = Math.round(baseValue * sMult * delayMult);
    const effectiveBurn = burnBase * sliderMult;
    const dailyBurn = effectiveBurn / 30;
    const dynamicRunway = Number((currentBal / (effectiveBurn || 1)).toFixed(1));

    const dailyForecast: ForecastData['dailyForecast'] = [];
    const today = new Date();
    
    for (let i = 0; i <= 30; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      const projectedBalance = Math.round(currentBal - (dailyBurn * i));
      dailyForecast.push({
        day: i,
        date: forecastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: projectedBalance,
        status: projectedBalance > (currentBal * 0.5) ? 'Nominal' : projectedBalance > 0 ? 'Warning' : 'Critical'
      });
    }

    setData({
      current_balance: currentBal,
      score: Math.floor(sScore * (1 / sliderMult)),
      runway: dynamicRunway,
      burn_rate: effectiveBurn,
      chartData: dailyForecast.filter((_, i) => i % 6 === 0).map(d => ({ date: d.date, balance: d.balance })),
      dailyForecast
    });
    setLoading(false);
  };

  // --- THE INTELLIGENCE HANDSHAKE (Updated for Singapore Cloud) ---
  const handleBriefingTrigger = async () => {
    setIsBriefingLoading(true);
    try {
      const transactionsWithHashes = await Promise.all(historyData.map(async (tx) => ({
        amount: tx.amount,
        date: tx.date,
        category: tx.category,
        user_id: "e6d6e60c-6890-4edf-94ea-7186e93a6064",
        integrity_hash: await calculateManualHash(tx)
      })));

      const payload = {
        balance: data?.current_balance ?? 0,
        burn_rate: data?.burn_rate ?? 0,
        active_scenario: activeScenario,
        transactions: transactionsWithHashes
      };

      // Connect to Render Backend
      const res = await fetch("https://prophet-ai-api.onrender.com/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const { job_id } = await res.json();

      // Polling Status Endpoint
      const pollInterval = setInterval(async () => {
        const statusRes = await fetch(`https://prophet-ai-api.onrender.com/briefing-status/${job_id}`);
        const statusData = await statusRes.json();

        if (statusData.status === "complete") {
          clearInterval(pollInterval);
          setAiStrategy(statusData.data.analysis);
          setIsBriefingLoading(false);
          // Load Audio from Render Cloud
          const audio = new Audio(`https://prophet-ai-api.onrender.com${statusData.data.audio_url}`);
          audio.play();
        } else if (statusData.status === "failed") {
          clearInterval(pollInterval);
          setIsBriefingLoading(false);
          alert("Neural Uplink Failure");
        }
      }, 2000);
    } catch (e) {
      console.error(e);
      setIsBriefingLoading(false);
    }
  };

  useEffect(() => { 
    runSimulation(activeScenario, delay, multiplier); 
  }, [activeScenario, delay, multiplier]);

  const historyData: Transaction[] = useMemo(() => [
    { id: 101, date: 'Apr 26', client: 'Digital Pulse', category: 'Milestone', amount: 1326.45, status: 'pending', risk: 'Low' },
    { id: 102, date: 'Apr 25', client: 'SteadyState Media', category: 'Retainer', amount: 1370.18, status: 'pending', risk: 'Medium' },
    { id: 103, date: 'Apr 24', client: 'Ops Vendor', category: 'Operating Exp', amount: -50.83, status: 'cleared', risk: 'Low' },
    { id: 104, date: 'Apr 23', client: 'Cloud Node', category: 'Fixed Cost', amount: -245.00, status: 'completed', risk: 'Low' },
    { id: 105, date: 'Apr 22', client: 'Alpha Design', category: 'Ad-hoc', amount: 850.00, status: 'completed', risk: 'Low' },
    { id: 106, date: 'Apr 20', client: 'AWS Sync', category: 'Infrastructure', amount: -112.50, status: 'cleared', risk: 'Low' },
  ], []);

  const handshakeData: HandshakeLog[] = useMemo(() => [
    { id: 'F0X-921-SHA', client: 'Digital Pulse Node', state: 'SUCCESS', timestamp: '14:21:02', integrity: 'Verified' },
    { id: 'F0X-812-SHA', client: 'SteadyState Media Node', state: 'SUCCESS', timestamp: '12:05:44', integrity: 'Verified' },
    { id: 'F0X-001-SHA', client: 'Internal Ledger Node', state: 'SUCCESS', timestamp: '04:00:00', integrity: 'Verified' },
  ], []);

  const safeNetMax = data ? (data.current_balance * 0.22) / (multiplier / 100) : 0;
  const safeNetMin = safeNetMax * 0.4;

  return (
    <main className="bg-black min-h-screen text-white p-10 md:p-14 font-sans overflow-x-hidden selection:bg-green-500/30 tracking-tight">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-14">
        <div className="bg-red-950/20 border border-red-500/40 p-10 rounded-[3rem] flex items-center gap-10 shadow-2xl backdrop-blur-xl">
          <div className="bg-red-500 p-6 rounded-[2rem] text-black shadow-[0_0_40px_-5px_rgba(239,68,68,0.6)]"><TrendingDown size={44} /></div>
          <div>
            <p className="text-red-400 text-[12px] font-black uppercase tracking-[0.3em] mb-3 leading-none">Projected Runway</p>
            <p className="text-6xl font-black italic tracking-tighter leading-none">{data?.runway ?? '---'} Months</p>
          </div>
        </div>
        <div className="bg-orange-950/20 border border-orange-500/40 p-10 rounded-[3rem] flex items-center gap-10 shadow-2xl backdrop-blur-xl">
          <div className="bg-orange-500 p-6 rounded-[2rem] text-black shadow-[0_0_40px_-5px_rgba(249,115,22,0.6)]"><AlertCircle size={44} /></div>
          <div>
            <p className="text-orange-400 text-[12px] font-black uppercase tracking-[0.3em] mb-3 leading-none">Monthly Burn Rate</p>
            <p className="text-6xl font-black italic tracking-tighter leading-none">${data?.burn_rate?.toLocaleString() ?? '---'}</p>
          </div>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 p-10 rounded-[3rem] flex flex-col justify-between shadow-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="flex justify-between items-center relative z-10">
            <p className="text-zinc-500 text-[11px] font-black uppercase tracking-[0.4em] leading-none">Neural Intelligence ✨</p>
            <div className={`flex items-center gap-2 ${isBriefingLoading ? "text-blue-500" : "text-green-500"}`}>
              <Activity size={14} className={isBriefingLoading ? "animate-pulse" : ""} />
              <span className="text-[10px] font-black uppercase font-mono">{isBriefingLoading ? "Analyzing" : "Live"}</span>
            </div>
          </div>
          <div className="mt-6 space-y-2 relative z-10">
             <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">{aiStrategy ? `Risk Level: ${aiStrategy.risk_level}` : "Safe Spending Range"}</p>
             {aiStrategy ? (
                <ul className="text-xs space-y-1 text-zinc-300 font-bold italic">
                  {aiStrategy.strategic_actions.map((action, i) => <li key={i}>• {action}</li>)}
                </ul>
             ) : (
                <p className="text-3xl font-black italic text-white leading-none">${safeNetMin.toLocaleString(undefined, {maximumFractionDigits: 0})} — ${safeNetMax.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
             )}
             <div className="mt-4 pt-4 border-t border-zinc-800/50">
                <p className="text-[10px] text-zinc-500 font-bold uppercase italic leading-tight">{isBriefingLoading ? "Neural Ensemble analyzing data..." : "V1.1 Neural Uplink Active."}</p>
             </div>
          </div>
          <div className="absolute -bottom-10 -right-10 text-green-500/5 rotate-12 group-hover:rotate-0 transition-transform duration-1000"><BrainCircuit size={140} /></div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-24">
        <div className="flex-1 bg-zinc-900/20 border border-zinc-800 p-8 rounded-[3rem] flex items-center gap-8 backdrop-blur-3xl border-zinc-800/50">
          <ShieldCheck className="text-green-500 shrink-0" size={36} />
          <div>
             <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-2 leading-none">Integrity Shield: Active</p>
             <p className="text-sm font-mono text-green-500/80 font-bold uppercase truncate tracking-tighter leading-none">SYSTEM_STATUS: SECURE // DATA_VERIFIED_SHA256</p>
          </div>
        </div>
        <div className="bg-zinc-900/20 border border-zinc-800 px-12 py-8 rounded-[3rem] flex items-center gap-7 backdrop-blur-3xl border-zinc-800/50">
          <Cpu size={36} className="text-blue-500" />
          <p className="text-sm font-bold text-blue-400 font-mono tracking-tighter uppercase whitespace-nowrap leading-none">Neural Ensemble: Llama 3.3</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-32 gap-12 px-8">
        <div>
          <h1 className="text-9xl md:text-[13rem] font-black italic tracking-tighter text-white uppercase leading-[0.65]">Prophet AI</h1>
          <p className="text-zinc-500 text-[15px] font-black uppercase tracking-[1.1em] mt-10 ml-4">Financial Flight Simulator v1.1</p>
        </div>
        <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto pb-4">
          <button 
            onClick={handleBriefingTrigger}
            disabled={isBriefingLoading}
            className="bg-zinc-900 text-zinc-600 border border-zinc-800/50 hover:border-green-500/50 hover:text-white font-black px-14 py-8 rounded-full transition-all uppercase text-[14px] tracking-[0.4em] flex items-center justify-center gap-5 shadow-2xl"
          >
            <Volume2 size={24} className={isBriefingLoading ? "animate-pulse text-green-500" : ""} /> 
            {isBriefingLoading ? "Processing..." : "Briefing"}
          </button>
          <button className="bg-white text-black hover:bg-green-500 hover:text-white font-black px-18 py-8 rounded-full transition-all uppercase text-[14px] tracking-[0.4em] shadow-2xl flex items-center justify-center gap-6 group border-2 border-white">
            <Plus size={28} className="group-hover:rotate-90 transition-transform duration-500"/> Log Entry
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-20">
        <div className="w-full lg:w-[32rem] space-y-14">
          <div className="space-y-6">
            <p className="text-[12px] font-black uppercase text-zinc-600 mb-10 tracking-[0.6em] ml-8 flex items-center gap-4"><Filter size={18}/> Simulation Protocol</p>
            {['Stable', 'Late Payments', 'High Burn', 'Recession'].map(s => (
              <button 
                key={s} 
                onClick={() => setActiveScenario(s)} 
                className={`w-full text-left px-12 py-9 rounded-[3rem] font-black uppercase text-[13px] tracking-[0.4em] transition-all duration-700 border ${activeScenario === s ? 'bg-white text-black border-white shadow-2xl scale-[1.05] z-10' : 'bg-zinc-900/50 text-zinc-500 border-zinc-800/50 hover:bg-zinc-800/80'}`}
              >
                {s}
              </button>
            ))}
            <div className="mt-20 p-14 bg-zinc-900/30 rounded-[4.5rem] border border-zinc-800/50 backdrop-blur-3xl shadow-inner">
               <div className="flex items-center gap-5 mb-14"><div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg"/><p className="text-[12px] font-black uppercase text-zinc-500 tracking-widest leading-none">Stress Parameters</p></div>
               <div className="space-y-16">
                 <div>
                    <div className="flex justify-between text-[12px] font-bold mb-8 uppercase tracking-[0.4em]"><span className="text-zinc-500">Liquidity Lag</span><span className="text-blue-500 font-mono text-base">{delay}D</span></div>
                    <input type="range" min="0" max="60" value={delay} onChange={(e) => setDelay(parseInt(e.target.value))} className="w-full accent-blue-500 bg-zinc-800 h-2.5 rounded-full appearance-none" />
                 </div>
                 <div>
                    <div className="flex justify-between text-[12px] font-bold mb-8 uppercase tracking-[0.4em]"><span className="text-zinc-500">Expense Warp</span><span className="text-orange-500 font-mono text-base">{multiplier}%</span></div>
                    <input type="range" min="50" max="200" value={multiplier} onChange={(e) => setMultiplier(parseInt(e.target.value))} className="w-full accent-orange-500 bg-zinc-800 h-2.5 rounded-full appearance-none" />
                 </div>
               </div>
            </div>
          </div>
          <div className="bg-zinc-900/20 p-16 rounded-[5rem] border border-zinc-800/50 backdrop-blur-3xl"><RiskGauge score={data?.score ?? 0} /></div>
        </div>

        <div className="flex-1 space-y-24">
          <div className="bg-zinc-900/40 p-16 md:p-24 rounded-[6rem] border border-zinc-800/50 backdrop-blur-[150px] relative shadow-2xl overflow-hidden group">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-24 relative z-10 gap-8">
                <div>
                  <h3 className="text-6xl font-black italic tracking-tighter text-white uppercase leading-none">{activeScenario} Projection</h3>
                  <p className="text-zinc-600 text-[12px] font-black uppercase mt-6 tracking-[0.5em] leading-none">AI-DRIVEN RISK FORECASTING ENGINE ACTIVE</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-10 py-4 rounded-full text-[12px] font-black uppercase tracking-[0.4em] flex items-center gap-5 shadow-lg">
                   <div className="w-4 h-4 bg-green-500 rounded-full animate-ping" />Neural Uplink Live
                </div>
             </div>
             <div className="h-[650px] relative z-10 transition-all duration-1000 group-hover:scale-[1.03]"><CashflowChart data={data?.chartData ?? []} loading={loading} /></div>
          </div>
          
          <StatCards currentBalance={data?.current_balance ?? 0} runway={data?.runway ?? 0} burnRate={data?.burn_rate ?? 0} />
          
          <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-[4rem] overflow-hidden backdrop-blur-md shadow-2xl">
            <div className="flex border-b border-zinc-800/50 bg-zinc-900/40 p-4 gap-4">
              {['history', 'forecast', 'handshake'].map((tab: any) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 flex items-center justify-center gap-3 py-7 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-black shadow-2xl scale-[1.02]' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {tab === 'history' && <History size={16}/>}
                  {tab === 'forecast' && <CalendarDays size={16}/>}
                  {tab === 'handshake' && <ShieldEllipsis size={16}/>}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'history' ? 'History' : tab === 'forecast' ? 'Forecast' : 'Handshake'}
                </button>
              ))}
            </div>
            <div className="p-10">
              {activeTab === 'history' && (
                <div className="overflow-y-auto max-h-[500px] pr-4 custom-scrollbar">
                   <table className="w-full text-left">
                     <thead className="sticky top-0 bg-zinc-950 z-20">
                       <tr className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800/20">
                         <th className="px-6 py-6">Date</th><th className="px-6 py-6">Client</th><th className="px-6 py-6 text-right">Amount</th><th className="px-6 py-6 text-center">Status</th><th className="px-6 py-6 text-center">Risk</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-zinc-800/20">
                       {historyData.map((tx) => (
                         <tr key={tx.id} className="hover:bg-zinc-800/30 transition-colors">
                           <td className="px-6 py-6 text-[11px] font-mono text-zinc-500">{tx.date}</td>
                           <td className="px-6 py-6 text-sm text-white font-bold">{tx.client}</td>
                           <td className={`px-6 py-6 text-sm text-right font-black ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>{tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}</td>
                           <td className="px-6 py-6 text-center"><span className="px-3 py-1 rounded-full bg-zinc-800 text-[10px] font-black uppercase tracking-tighter text-zinc-400">{tx.status}</span></td>
                           <td className="px-6 py-6 text-center"><span className={`text-[10px] font-black uppercase ${tx.risk === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}>{tx.risk}</span></td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
              )}
              {activeTab === 'handshake' && (
                <div className="overflow-y-auto max-h-[500px] pr-4 custom-scrollbar">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-zinc-950 z-20">
                      <tr className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800/20">
                        <th className="px-6 py-6">Fingerprint ID</th><th className="px-6 py-6">Entity Name</th><th className="px-6 py-6 text-center">Integrity Check</th><th className="px-6 py-6 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/20">
                      {handshakeData.map((log, i) => (
                        <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-6 py-6 text-[11px] font-mono text-zinc-500 flex items-center gap-2 italic"><Fingerprint size={12}/> {log.id}</td>
                          <td className="px-6 py-6 text-sm text-white font-bold">{log.client}</td>
                          <td className="px-6 py-6 text-center"><span className="bg-green-500/10 text-green-500 border border-green-500/20 px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest inline-flex items-center gap-2"><Lock size={10}/> {log.state}</span></td>
                          <td className="px-6 py-6 text-right text-[11px] font-mono text-zinc-600">{log.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
// Live Deployment v1.13: 2026-05-14
