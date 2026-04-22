import React from 'react';

interface StatCardsProps {
  currentBalance?: number;
}

const StatCards: React.FC<StatCardsProps> = ({ currentBalance = 0 }) => {
  const stats = [
    { name: 'Current Balance', value: `$${currentBalance.toLocaleString()}`, change: '+2.5%', changeType: 'increase' },
    { name: 'Projected Runway', value: '4.2 Months', change: '-12 days', changeType: 'decrease' },
    { name: 'Burn Rate', value: '$3,200', change: 'Stable', changeType: 'neutral' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {stats.map((item) => (
        <div key={item.name} className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
          <p className="text-gray-400 text-sm font-medium">{item.name}</p>
          <p className="text-2xl font-bold mt-2 text-white">{item.value}</p>
          <div className={`mt-2 text-xs font-semibold ${
            item.changeType === 'increase' ? 'text-green-400' : 
            item.changeType === 'decrease' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {item.change} <span className="text-gray-500 font-normal">vs last month</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;
