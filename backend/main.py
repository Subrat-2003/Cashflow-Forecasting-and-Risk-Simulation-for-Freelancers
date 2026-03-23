import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# 1. Imports FIRST
from advisor import get_survival_plan
from generator import upload_to_supabase
from prophet_engine import fetch_and_prepare_data, generate_forecast_and_risk

# 2. Initialize App SECOND (This fixes your error)
load_dotenv()
app = FastAPI()

# 3. CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InitRequest(BaseModel):
    user_id: str

# --- ROUTES ---

@app.get("/")
def read_root():
    return {"status": "online", "project": "GigNavigator 2.0"}

@app.post("/generate-data")
async def seed_data(request: InitRequest):
    try:
        result = upload_to_supabase(request.user_id)
        return {"status": "success", "rows": result['rows']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/forecast/{user_id}")
async def get_forecast(user_id: str):
    try:
        df = fetch_and_prepare_data(user_id)
        forecast_results = generate_forecast_and_risk(df)
        return {"status": "success", "data": forecast_results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Engine Error: {str(e)}")

@app.get("/advisor/{user_id}")
async def get_ai_advice(user_id: str):
    try:
        # We need the forecast data to give to the advisor
        df = fetch_and_prepare_data(user_id)
        forecast_results = generate_forecast_and_risk(df)
        
        # Now we call the advisor brain
        advice = get_survival_plan(user_id, forecast_results)
        return {"status": "success", "advice": advice}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Advisor Error: {str(e)}")