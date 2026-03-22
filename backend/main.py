import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# 🎯 Import the final refined function from your generator
from generator import upload_to_supabase

# 1. Load environment variables
load_dotenv()

app = FastAPI()

# 2. CORS Configuration: Essential for Gayatri's Frontend (3000) to talk to your Backend (8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Request Model (Expects a JSON body with user_id)
class InitRequest(BaseModel):
    user_id: str

@app.get("/")
def read_root():
    return {
        "status": "online",
        "project": "GigNavigator 2.0",
        "engine": "Behavioral Financial Simulator"
    }

@app.post("/generate-data")
async def seed_data(request: InitRequest):
    """
    Triggers the high-fidelity behavioral simulation. 
    Runs 10 iterations to find the best risk-calibrated dataset (600-700 records).
    """
    try:
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
