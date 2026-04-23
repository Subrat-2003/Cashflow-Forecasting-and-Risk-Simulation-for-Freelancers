import React from 'react';

interface StatCardsProps {
  currentBalance?: number;
  runway?: number;
  burnRate?: number;
}

const StatCards: React.FC<StatCardsProps> = ({ 
  currentBalance = 0, 
  runway = 0, 
  burnRate = 0 
}) => {
  const stats = [
    { 
      name: 'Current Balance', 
      value: `$${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      change: '+2.5%', 
      changeType: 'increase' 
    },
    { 
      name: 'Projected Runway', 
      value: `${runway} Months`, 
      change: '-12 days', 
      changeType: 'decrease' 
    },
    { 
      name: 'Burn Rate', 
      value: `$${burnRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      change: 'Stable', 
      changeType: 'neutral' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {stats.map((item) => (
        <div key={item.name} className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl backdrop-blur-md">
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">{item.name}</p>
          <p className="text-3xl font-black mt-2 text-white italic tracking-tight">{item.value}</p>
          <div className={`mt-3 text-[10px] font-black uppercase tracking-tighter ${
            item.changeType === 'increase' ? 'text-green-500' : 
            item.changeType === 'decrease' ? 'text-red-500' : 'text-zinc-500'
          }`}>
            {item.change} <span className="text-zinc-600 font-normal ml-1">vs last month</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;
