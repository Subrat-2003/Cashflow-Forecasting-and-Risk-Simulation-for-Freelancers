import os
import random
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# 1. Logic Imports
from advisor import get_survival_plan
from generator import upload_to_supabase
from prophet_engine import fetch_and_prepare_data, generate_forecast_and_risk

# 2. Initialize App
load_dotenv()
app = FastAPI()

# 3. CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Request Models
class InitRequest(BaseModel):
    user_id: str

class SimRequest(BaseModel):
    user_id: str
    risk_level: str  # 'Critical', 'Stable', 'Safe'
    window: int      # 30, 60, 90

# --- ROUTES ---

@app.get("/")
def read_root():
    return {"status": "online", "project": "Cashflow Forecasting & Risk Simulation for Freelancers"}

@app.post("/simulate")
async def simulate_risk(request: SimRequest):
    try:
        # 1. Fetch Data
        df = fetch_and_prepare_data(request.user_id)
        
        # --- DEBUG OUTPUT ---
        print(f"DEBUG: Processing simulation for {request.user_id}")
        if df is not None and not df.empty:
            print(f"DEBUG: Found {len(df)} rows. Columns: {df.columns.tolist()}")
        
        # 2. Bulletproof Check
        if df is None or df.empty:
            raise HTTPException(
                status_code=404, 
                detail=f"Data Void: No transaction history found for ID {request.user_id}."
            )
        
        # 3. Predict & Simulate
        baseline_results = generate_forecast_and_risk(df)
        baseline = baseline_results['forecast']
        
        multipliers = {"Safe": 1.12, "Stable": 1.00, "Critical": 0.78}
        factor = multipliers.get(request.risk_level, 1.0)
        
        simulated_data = []
        for point in baseline:
            noise = random.uniform(0.97, 1.03)
            # Warp the running balance (yhat)
            point['yhat'] = round(point['yhat'] * factor * noise, 2)
            point['yhat_upper'] = round(point['yhat'] * 1.1, 2)
            point['yhat_lower'] = round(point['yhat'] * 0.9, 2)
            simulated_data.append(point)
            
        return {
            "status": "success", 
            "data": simulated_data, 
            "score": max(min(int(72 * factor), 100), 10)
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Engine Failure: {str(e)}")

@app.get("/forecast/{user_id}")
async def get_forecast(user_id: str):
    try:
        df = fetch_and_prepare_data(user_id)
        if df.empty:
            raise HTTPException(status_code=404, detail="User data not found.")
        return {"status": "success", "data": generate_forecast_and_risk(df)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
