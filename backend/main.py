import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Import the engines you built
from generator import upload_to_supabase
from prophet_engine import fetch_and_prepare_data, generate_forecast_and_risk

load_dotenv()
app = FastAPI()

# Allows the frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InitRequest(BaseModel):
    user_id: str

@app.get("/")
def read_root():
    return {"status": "online", "engine": "GigNavigator AI Forecasting System"}

# --- PHASE 1: DATA SEEDING ---
@app.post("/generate-data")
async def seed_data(request: InitRequest):
    try:
        result = upload_to_supabase(request.user_id)
        return {"status": "success", "rows": result['rows']}
    except Exception as e:
        print(f" Generation Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --- PHASE 2/3: AI FORECASTING ---
@app.get("/forecast/{user_id}")
async def get_forecast(user_id: str):
    """
    The 'Brain' Endpoint:
    1. Fetches your 842 records from Supabase
    2. Trains the Prophet model
    3. Calculates the 30-day insolvency risk
    """
    try:
        # Step 1: Prepare the data frames
        df = fetch_and_prepare_data(user_id)
        
        # Step 2: Run the Meta Prophet engine
        forecast_results = generate_forecast_and_risk(df)
        
        return {
            "status": "success",
            "data": forecast_results
        }
    except Exception as e:
        print(f" AI Engine Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI Engine Error: {str(e)}")