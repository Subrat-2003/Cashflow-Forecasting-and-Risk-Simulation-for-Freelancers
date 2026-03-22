import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

<<<<<<< HEAD
# Import the engines you built
from generator import upload_to_supabase
from prophet_engine import fetch_and_prepare_data, generate_forecast_and_risk
=======
# 🎯 Import the final refined function from your generator
from generator import upload_to_supabase

# 1. Load environment variables
load_dotenv()
>>>>>>> dde1fd33f9b35d78289a504d31e7ae536ffac82b

load_dotenv()
app = FastAPI()

<<<<<<< HEAD
# Allows the frontend to talk to this backend
=======
# 2. CORS Configuration: Essential for Gayatri's Frontend (3000) to talk to your Backend (8000)
>>>>>>> dde1fd33f9b35d78289a504d31e7ae536ffac82b
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

<<<<<<< HEAD
=======
# 3. Request Model (Expects a JSON body with user_id)
>>>>>>> dde1fd33f9b35d78289a504d31e7ae536ffac82b
class InitRequest(BaseModel):
    user_id: str

@app.get("/")
def read_root():
<<<<<<< HEAD
    return {"status": "online", "engine": "GigNavigator AI Forecasting System"}
=======
    return {
        "status": "online",
        "project": "GigNavigator 2.0",
        "engine": "Behavioral Financial Simulator"
    }
>>>>>>> dde1fd33f9b35d78289a504d31e7ae536ffac82b

# --- PHASE 1: DATA SEEDING ---
@app.post("/generate-data")
async def seed_data(request: InitRequest):
    """
    Triggers the high-fidelity behavioral simulation. 
    Runs 10 iterations to find the best risk-calibrated dataset (600-700 records).
    """
    try:
<<<<<<< HEAD
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
=======
        # 🎯 Calls the 'Elite' version of the logic
        result = upload_to_supabase(request.user_id)
        
        return {
            "status": "success", 
            "message": f"Successfully simulated and uploaded {result['rows']} behavioral records.",
            "user_id": request.user_id,
            "audit_log": "Risk Calibration Loop Complete (Target: 600-700 rows)"
        }
    except Exception as e:
        # Logs the error to your terminal so you can debug
        print(f"❌ Backend Crash: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Simulation failed: {str(e)}"
        )

# Run with: uvicorn main:app --reload
>>>>>>> dde1fd33f9b35d78289a504d31e7ae536ffac82b
