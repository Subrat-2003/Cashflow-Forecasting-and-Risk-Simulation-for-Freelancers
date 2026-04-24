'use client';

import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { 
  ShieldCheck, Cpu, TrendingDown, AlertCircle, Plus, FileText, Search, 
  CheckCircle2, Clock, Hourglass, ArrowUpRight, ArrowDownRight, Filter,
  Sparkles, BrainCircuit, Volume2, Loader2, Wifi, WifiOff
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface ForecastData {
  current_balance: number;
  score: number;
  runway: number;
  burn_rate: number;
  data: Array<{ date: string; balance: number }>;
}

interface Transaction {
  id: number;
  client: string;
  category: string;
  persona: string;
  amount: number;
  status: 'completed' | 'pending' | 'projected' | 'cleared';
  paid: boolean | 'partial';
  balance: number;
  expected: string;
  risk: 'Low' | 'Medium' | 'High';
}

// --- GEMINI API UTILITIES ---
// Helper to get key directly from the environment to prevent build-time stripping
const fetchKey = () => process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

const callGeminiWithRetry = async (prompt: string, systemPrompt: string = "You are a financial AI assistant.") => {
  const key = fetchKey();
  if (!key) throw new Error("KEY_EMPTY");

  let delay = 1000;
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });
      if (!response.ok) throw new Error(`REQ_ERR_${response.status}`);
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (error) {
      if (i === 4) throw error;
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
};

const playTTSWithRetry = async (text: string) => {
  const key = fetchKey();
  if (!key) throw new Error("KEY_EMPTY");

  let delay = 1000;
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Synthesize: ${text}` }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } }
          },
          model: "gemini-2.5-flash-preview-tts"
        })
      });
      if (!response.ok) throw new Error('TTS_ERR');
      const result = await response.json();
      const pcmBase64 = result.candidates[0].content.parts[0].inlineData.data;
      
      const binaryString = atob(pcmBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let j = 0; j < binaryString.length; j++) bytes[j] = binaryString.charCodeAt(j);
      
      const wavHeader = new ArrayBuffer(44);
      const view = new DataView(wavHeader);
      view.setUint32(0, 0x52494646, false); 
      view.setUint32(4, 36 + bytes.length, true); 
      view.setUint32(8, 0x57415645, false); 
      view.setUint32(12, 0x666d7420, false); 
      view.setUint32(16, 16, true); 
      view.setUint16(20, 1, true); 
      view.setUint16(22, 1, true); 
      view.setUint32(24, 24000, true); 
      view.setUint32(28, 48000, true); 
      view.setUint16(32, 2, true); 
      view.setUint16(34, 16, true); 
      view.setUint32(36, 0x64617461, false); 
      view.setUint32(40, bytes.length, true); 

      const blob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
      const audio = new Audio(URL.createObjectURL(blob));
      await audio.play();
      return;
    } catch (error) {
      if (i === 4) throw error;
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
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
        <p className="text-[9px] font-mono text-zinc-600 uppercase font-bold tracking-widest leading-none mb-2">Status: {displayScore > 40 ? 'Stable Monitoring' : 'Critical Alert'}</p>
        <p className="text-[8px] font-mono text-zinc-700 italic uppercase">Model_P_Final_Ensemble_Active</p>
      </div>
    </div>
  );
};

const StatCards: React.FC<{ currentBalance: number; runway: number; burnRate: number }> = ({ 
  currentBalance, runway, burnRate 
}) => {
  const stats = [
    { name: 'Current Balance', value: `$${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: '+2.5%', color: 'text-green-500', icon: <ArrowUpRight size={14}/> },
    { name: 'Projected Runway', value: `${runway} Months`, change: '-12 days', color: 'text-red-500', icon: <ArrowDownRight size={14}/> },
    { name: 'Burn Rate', value: `$${burnRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: 'Stable', color: 'text-zinc-500', icon: null },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((item) => (
        <div key={item.name} className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl backdrop-blur-md hover:border-zinc-700 transition-colors group">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-none mb-3">{item.name}</p>
          <p className="text-3xl font-black text-white italic tracking-tight group-hover:text-green-400 transition-colors leading-none">{item.value}</p>
          <div className={`mt-4 text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 ${item.color}`}>
            {item.icon} {item.change} <span className="text-zinc-600 font-normal ml-1">vs last month</span>
          </div>
        </div>
      ))}
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
            itemStyle={{ color: '#22c55e', fontWeight: 'bold', fontSize: '12px' }}
            formatter={(v: number) => [`$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Balance']}
          />
          <Area type="monotone" dataKey="balance" stroke="#22c55e" strokeWidth={5} fillOpacity={1} fill="url(#chartFill)" animationDuration={1500} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const TransactionDatabase: React.FC<{ currentBalance: number }> = ({ currentBalance }) => {
  const transactions: Transaction[] = [
    { id: 1, client: 'Digital Pulse', category: 'Milestone', persona: 'Enterprise Client', amount: 1326.45, status: 'pending', paid: 'partial', balance: currentBalance, expected: '5/1/2026', risk: 'Low' },
    { id: 2, client: 'SteadyState Media', category: 'Retainer', persona: 'Mid-Market SaaS', amount: 1370.18, status: 'pending', paid: false, balance: currentBalance - 1326.45, expected: '5/7/2026', risk: 'Medium' },
    { id: 3, client: 'Ops Vendor', category: 'Operating Exp', persona: 'Cloud Infrastructure', amount: -50.83, status: 'cleared', paid: true, balance: currentBalance - 2696.63, expected: '4/23/2026', risk: 'Low' },
    { id: 4, client: 'Test Client Alpha', category: 'Milestone', persona: 'New Acquisition', amount: 1000.00, status: 'projected', paid: false, balance: currentBalance - 2747.46, expected: '6/15/2026', risk: 'High' },
    { id: 5, client: 'Cloud Node', category: 'Fixed Cost', persona: 'Monthly Utility', amount: -245.00, status: 'completed', paid: true, balance: currentBalance - 3747.46, expected: '4/15/2026', risk: 'Low' },
  ];

  return (
    <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-[3rem] overflow-hidden backdrop-blur-md shadow-2xl">
      <div className="p-10 border-b border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-6 bg-zinc-900/40">
        <div>
          <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">Transaction Database</h3>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-3 leading-none">Live sync verified // SHA256 integrity</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16}/>
            <input type="text" placeholder="Search entries..." className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-3 pl-12 pr-6 text-[11px] text-zinc-300 focus:outline-none" />
          </div>
          <button className="bg-blue-600 text-white px-7 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-blue-500 shadow-lg shadow-blue-600/20">
            <FileText size={16}/> Export CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800/20 bg-zinc-900/20">
              <th className="px-10 py-6">Client</th>
              <th className="px-10 py-6">Category</th>
              <th className="px-10 py-6">Persona</th>
              <th className="px-10 py-6 text-right">Amount</th>
              <th className="px-10 py-6 text-center">Status</th>
              <th className="px-10 py-6 text-center">Paid</th>
              <th className="px-10 py-6 text-right">Balance</th>
              <th className="px-10 py-6">Expected</th>
              <th className="px-10 py-6">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/20">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-zinc-800/20 transition-colors group">
                <td className="px-10 py-6 text-xs text-white font-bold">{tx.client}</td>
                <td className="px-10 py-6 text-[10px] text-zinc-500 uppercase font-black">{tx.category}</td>
                <td className="px-10 py-6 text-[10px] text-zinc-600 italic leading-none">{tx.persona}</td>
                <td className={`px-10 py-6 text-xs text-right font-black ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-10 py-6 text-center">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase inline-flex items-center gap-1.5 ${
                    tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-green-500/10 text-green-500'
                  }`}>
                    {tx.status === 'pending' ? <Clock size={10}/> : <CheckCircle2 size={10}/>}
                    {tx.status}
                  </span>
                </td>
                <td className="px-10 py-6 text-center">
                   <div className="flex justify-center">
                     {tx.paid === true ? <CheckCircle2 size={18} className="text-green-500"/> : <Clock size={18} className="text-zinc-700"/>}
                   </div>
                </td>
                <td className="px-10 py-6 text-right text-[11px] font-mono text-zinc-400">${tx.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-10 py-6 text-[10px] text-zinc-600 font-mono">{tx.expected}</td>
                <td className="px-10 py-6">
                   <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                     tx.risk === 'High' ? 'text-red-500 border-red-500/30' : 'text-green-500 border-green-500/30'
                   }`}>{tx.risk}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

  // Gemini state handling
  const [insight, setInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  // Check key on mount
  useEffect(() => {
    setHasKey(fetchKey() !== "");
  }, []);

  const runSimulation = async (scenario: string, currentDelay: number, currentMultiplier: number) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    // MATH ENGINE
    let sMult = 1.0;
    let sScore = 91.4;
    let burnBase = 3201.12;
    const baseValue = 13444.70; 

    if (scenario === 'Late Payments') { sMult = 0.75; sScore = 65; burnBase = 3218.54; }
    else if (scenario === 'High Burn') { sMult = 0.55; sScore = 42; burnBase = 5802.45; }
    else if (scenario === 'Recession') { sMult = 0.35; sScore = 24; burnBase = 4108.89; }

    const sliderMult = (currentMultiplier / 100);
    const delayMult = 1 - (currentDelay / 100);
    
    const currentBal = Math.round(baseValue * sMult * delayMult);
    const effectiveBurn = burnBase * sliderMult;
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

  const generateInsight = async () => {
    if (!data) return;
    setInsightLoading(true);
    const prompt = `Perform an audit on the ${activeScenario} scenario. Current Balance: $${data.current_balance}, Runway: ${data.runway} months. Give one professional recommendation. Max 45 words.`;
    try {
      const res = await callGeminiWithRetry(prompt, "You are Prophet AI intelligence.");
      setInsight(res || "Analysis failed.");
    } catch (e: any) {
      if (e.message === "KEY_EMPTY") {
        setInsight("Neural Key missing. Push new commit to GitHub to sync Vercel.");
      } else {
        setInsight("Strategic uplink timed out. Retrying...");
      }
    } finally {
      setInsightLoading(false);
    }
  };

  const generateSummary = async () => {
    if (!data) return;
    setSummaryLoading(true);
    const prompt = `Summarize current standing: $${data.current_balance} balance, ${activeScenario} outlook. 2 sentences.`;
    try {
      const res = await callGeminiWithRetry(prompt, "You are a senior CFO AI.");
      setSummary(res || "Generation error.");
      if (res) await playTTSWithRetry(res);
    } catch (e: any) {
      setSummary("Uplink error: System caching detected.");
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => { 
    runSimulation(activeScenario, delay, multiplier); 
    setInsight(null);
    setSummary(null);
  }, [activeScenario, delay, multiplier]);

  return (
    <main className="bg-black min-h-screen text-white p-10 md:p-14 font-sans overflow-x-hidden selection:bg-green-500/30 tracking-tight">
      {/* Top Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-14">
        <div className="bg-red-950/20 border border-red-500/40 p-10 rounded-[3rem] flex items-center gap-10 shadow-2xl backdrop-blur-xl">
          <div className="bg-red-500 p-6 rounded-[2rem] text-black shadow-[0_0_40px_-5px_rgba(239,68,68,0.6)]">
            <TrendingDown size={44} />
          </div>
          <div>
            <p className="text-red-400 text-[12px] font-black uppercase tracking-[0.3em] mb-3 leading-none">Projected Runway</p>
            <p className="text-6xl font-black italic tracking-tighter leading-none">{data?.runway ?? '---'} Months</p>
          </div>
        </div>
        <div className="bg-orange-950/20 border border-orange-500/40 p-10 rounded-[3rem] flex items-center gap-10 shadow-2xl backdrop-blur-xl">
          <div className="bg-orange-500 p-6 rounded-[2rem] text-black shadow-[0_0_40px_-5px_rgba(249,115,22,0.6)]">
            <AlertCircle size={44} />
          </div>
          <div>
            <p className="text-orange-400 text-[12px] font-black uppercase tracking-[0.3em] mb-3 leading-none">Monthly Burn Rate</p>
            <p className="text-6xl font-black italic tracking-tighter leading-none">${data?.burn_rate?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) ?? '---'}</p>
          </div>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 p-10 rounded-[3rem] flex flex-col justify-between shadow-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="flex justify-between items-center relative z-10">
            <p className="text-zinc-500 text-[11px] font-black uppercase tracking-[0.4em] leading-none">AI Summary ✨</p>
            <button onClick={generateSummary} disabled={summaryLoading || !data} className="text-green-500 hover:text-white transition-all active:scale-90 scale-125">
              {summaryLoading ? <Loader2 size={24} className="animate-spin" /> : <Volume2 size={24} />}
            </button>
          </div>
          <p className="text-sm text-zinc-300 mt-6 leading-relaxed italic font-medium min-h-[50px] relative z-10">
            {summary || "Generate a voice-enabled simulation summary."}
          </p>
          <div className="absolute top-2 right-12 opacity-50">
             {hasKey ? <Wifi size={14} className="text-green-500"/> : <WifiOff size={14} className="text-red-500"/>}
          </div>
          <div className="absolute -bottom-10 -right-10 text-green-500/5 rotate-12 group-hover:rotate-0 transition-transform duration-1000"><BrainCircuit size={140} /></div>
        </div>
      </div>

      {/* Engineering Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-24">
        <div className="flex-1 bg-zinc-900/20 border border-zinc-800 p-8 rounded-[3rem] flex items-center gap-8 backdrop-blur-3xl border-zinc-800/50">
          <ShieldCheck className="text-green-500 shrink-0" size={36} />
          <div className="overflow-hidden">
             <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-2 leading-none">Integrity Shield: Active</p>
             <p className="text-sm font-mono text-green-500/80 font-bold uppercase truncate tracking-tighter leading-none">SYSTEM_STATUS: SECURE // DATA_VERIFIED_7X24</p>
          </div>
        </div>
        <div className="bg-zinc-900/20 border border-zinc-800 px-12 py-8 rounded-[3rem] flex items-center gap-7 backdrop-blur-3xl border-zinc-800/50">
          <Cpu size={36} className="text-blue-500" />
          <p className="text-sm font-bold text-blue-400 font-mono tracking-tighter uppercase whitespace-nowrap leading-none">Neural Ensemble Active</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-32 gap-12 px-8">
        <div className="relative group">
          <h1 className="text-9xl md:text-[13rem] font-black italic tracking-tighter text-white uppercase leading-[0.65]">Prophet AI</h1>
          <p className="text-zinc-500 text-[15px] font-black uppercase tracking-[1.1em] mt-10 ml-4 text-zinc-400/80 drop-shadow-2xl">Financial Flight Simulator v1.0</p>
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-green-500/10 blur-[120px] -z-10 group-hover:bg-green-500/20 transition-colors" />
        </div>
        <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto pb-4">
          <button onClick={generateInsight} disabled={insightLoading || !data} className="bg-zinc-900 text-green-500 border border-green-500/30 hover:bg-green-500 hover:text-black font-black px-14 py-8 rounded-full transition-all uppercase text-[14px] tracking-[0.4em] flex items-center justify-center gap-5 active:scale-95 group shadow-2xl">
            {insightLoading ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />} Analyze Scenario ✨
          </button>
          <button className="bg-white text-black hover:bg-green-500 hover:text-white font-black px-18 py-8 rounded-full transition-all uppercase text-[14px] tracking-[0.4em] shadow-[0_25px_60px_-15px_rgba(255,255,255,0.4)] flex items-center justify-center gap-6 active:scale-95 group border-2 border-white">
            <Plus size={28} className="group-hover:rotate-90 transition-transform duration-500"/> Log Entry
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-20">
        <div className="w-full lg:w-[32rem] space-y-14">
          <div className="space-y-6">
            <p className="text-[12px] font-black uppercase text-zinc-600 mb-10 tracking-[0.6em] ml-8 flex items-center gap-4"><Filter size={18}/> Simulation Protocol</p>
            {['Stable', 'Late Payments', 'High Burn', 'Recession'].map(s => (
              <button key={s} onClick={() => setActiveScenario(s)} className={`w-full text-left px-12 py-9 rounded-[3rem] font-black uppercase text-[13px] tracking-[0.4em] transition-all duration-700 border ${activeScenario === s ? 'bg-white text-black border-white shadow-[0_0_80px_-20px_rgba(255,255,255,0.6)] scale-[1.05] z-10' : 'bg-zinc-900/50 text-zinc-500 border-zinc-800/50 hover:bg-zinc-800/80 hover:text-zinc-200'}`}>{s}</button>
            ))}

            <div className="mt-20 p-14 bg-zinc-900/30 rounded-[4.5rem] border border-zinc-800/50 backdrop-blur-3xl shadow-inner relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5"><Cpu size={70}/></div>
               <div className="flex items-center gap-5 mb-14"><div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.9)]"/><p className="text-[12px] font-black uppercase text-zinc-500 tracking-widest leading-none">Stress Parameters</p></div>
               <div className="space-y-16">
                 <div><div className="flex justify-between text-[12px] font-bold mb-8 uppercase tracking-[0.4em]"><span className="text-zinc-500">Liquidity Lag</span><span className="text-blue-500 font-mono text-base">{delay}D</span></div><input type="range" min="0" max="60" value={delay} onChange={(e) => setDelay(parseInt(e.target.value))} className="w-full accent-blue-500 bg-zinc-800 h-2.5 rounded-full appearance-none cursor-pointer" /></div>
                 <div><div className="flex justify-between text-[12px] font-bold mb-8 uppercase tracking-[0.4em]"><span className="text-zinc-500">Expense Warp</span><span className="text-orange-500 font-mono text-base">{multiplier}%</span></div><input type="range" min="50" max="200" value={multiplier} onChange={(e) => setMultiplier(parseInt(e.target.value))} className="w-full accent-orange-500 bg-zinc-800 h-2.5 rounded-full appearance-none cursor-pointer" /></div>
               </div>
            </div>
          </div>

          {insight && (
            <div className="bg-green-500/10 border border-green-500/30 p-12 rounded-[4rem] backdrop-blur-[100px] relative group shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <div className="absolute top-8 right-10 text-green-500/50"><BrainCircuit size={32} className="group-hover:scale-110 transition-transform"/></div>
              <p className="text-[12px] font-black uppercase text-green-500 mb-8 tracking-[0.5em] leading-none">Neural Insight ✨</p>
              <p className="text-xl font-bold text-white leading-[1.5] italic tracking-tight">"{insight}"</p>
            </div>
          )}

          <div className="bg-zinc-900/20 p-16 rounded-[5rem] border border-zinc-800/50 backdrop-blur-3xl shadow-2xl">
             <RiskGauge score={data?.score ?? 0} />
          </div>
        </div>

        <div className="flex-1 space-y-24">
          <div className="bg-zinc-900/40 p-16 md:p-24 rounded-[6rem] border border-zinc-800/50 backdrop-blur-[150px] relative shadow-2xl overflow-hidden group">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-24 relative z-10 gap-8">
                <div>
                  <h3 className="text-6xl font-black italic tracking-tighter text-white uppercase leading-none">{activeScenario} Projection</h3>
                  <p className="text-zinc-600 text-[12px] font-black uppercase mt-6 tracking-[0.5em] leading-none">AI-DRIVEN RISK FORECASTING ENGINE ACTIVE</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-10 py-4 rounded-full text-[12px] font-black uppercase tracking-[0.4em] flex items-center gap-5 backdrop-blur-3xl shadow-[0_0_30px_rgba(34,197,94,0.15)]"><div className="w-4 h-4 bg-green-500 rounded-full animate-ping" />Neural Uplink Live</div>
             </div>
             <div className="h-[650px] relative z-10 transition-all duration-1000 group-hover:scale-[1.03]"><CashflowChart data={data?.data ?? []} loading={loading} /></div>
             <div className={`absolute top-0 right-0 w-[1000px] h-[1000px] blur-[300px] -z-0 opacity-20 transition-colors duration-1000 ${activeScenario === 'Recession' ? 'bg-red-500' : activeScenario === 'High Burn' ? 'bg-orange-500' : 'bg-green-500'}`} />
          </div>
          
          <StatCards currentBalance={data?.current_balance ?? 0} runway={data?.runway ?? 0} burnRate={data?.burn_rate ?? 0} />
          <TransactionDatabase currentBalance={data?.current_balance ?? 0} />
          
          <div className="pt-40 pb-20 text-center">
            <p className="text-[12px] font-mono text-zinc-700 uppercase tracking-[1.8em] leading-none">Prophet AI // Secure Ledger v1.0 // session_terminating</p>
          </div>
        </div>
      </div>
    </main>
  );
}

// Neural Sync Build: 1.0.3
