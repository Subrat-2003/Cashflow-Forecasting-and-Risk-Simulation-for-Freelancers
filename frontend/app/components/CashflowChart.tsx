import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface CashflowChartProps {
  data?: any[];
  loading?: boolean;
}

const CashflowChart: React.FC<CashflowChartProps> = ({ data = [], loading = false }) => {
  if (loading) return <div className="h-full w-full flex items-center justify-center text-gray-500">Calculating Projection...</div>;
  
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
            itemStyle={{ color: '#10b981' }}
          />
          <Area type="monotone" dataKey="balance" stroke="#10b981" fillOpacity={0.3} fill="#10b981" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CashflowChart;
