import { useState } from 'react';
import axios from 'axios';

// Defining the Map for TypeScript
interface ForecastData {
  current_balance: number;
  score: number;
  data: Array<{
    date: string;
    balance: number;
  }>;
}

export const useForecast = (userId: string) => {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async (scenario: string) => {
    setLoading(true);
    try {
      // Connecting to your Prophet AI backend
      const response = await axios.get(`https://prophet-ai-backend.vercel.app/api/forecast/${userId}?scenario=${scenario}`);
      setData(response.data);
    } catch (error) {
      console.error("Simulation failed:", error);
      // Fallback mock data if backend is asleep
      setData({
        current_balance: 5240,
        score: 72,
        data: [
          { date: '2024-04-01', balance: 5240 },
          { date: '2024-05-01', balance: 4800 },
          { date: '2024-06-01', balance: 6100 },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, runSimulation };
};
