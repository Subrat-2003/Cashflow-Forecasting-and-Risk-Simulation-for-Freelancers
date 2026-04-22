'use client';

import React from 'react';

interface GaugeProps {
  score: number; // 0 to 100
}

const RiskGauge: React.FC<GaugeProps> = ({ score }) => {
  // Ensure score stays within 0-100 bounds
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  
  // Calculate the rotation of the needle (0 to 180 degrees)
  const rotation = (normalizedScore / 100) * 180 - 90;

  // Determine color based on financial health
  const getGaugeColor = (val: number) => {
    if (val > 70) return '#10b981'; // Green (Safe)
    if (val > 40) return '#f59e0b'; // Yellow (Stable)
    return '#ef4444'; // Red (Critical)
  };

  const activeColor = getGaugeColor(normalizedScore);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full">
      <svg viewBox="0 0 100 55" className="w-full">
        {/* Background Track */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="#1e293b"
          strokeWidth="8"
          strokeLinecap="round"
        />
        
        {/* Active Progress Track */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke={activeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="125.6"
          strokeDashoffset={125.6 - (normalizedScore / 100) * 125.6}
          className="transition-all duration-1000 ease-out"
        />

        {/* The Needle */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="15"
          stroke="#f8fafc"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: '50px 50px',
          }}
          className="transition-transform duration-1000 ease-out"
        />
        <circle cx="50" cy="50" r="3" fill="#f8fafc" />
      </svg>

      <div className="absolute bottom-0 text-center">
        <span className="text-2xl font-black" style={{ color: activeColor }}>
          {normalizedScore}%
        </span>
        <p className="text-[10px] text-slate-500 uppercase tracking-tighter font-bold">
          Financial Confidence
        </p>
      </div>
    </div>
  );
};

export default RiskGauge;
