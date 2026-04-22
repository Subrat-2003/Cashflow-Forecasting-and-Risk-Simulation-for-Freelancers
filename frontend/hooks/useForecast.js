import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useForecast = (userId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // This function is the "Bridge" between the button and the AI
  const runSimulation = async (riskLevel) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/simulate`, {
        user_id: userId,
        risk_level: riskLevel,
        window: 30
      });
      setData(response.data);
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, runSimulation };
};
