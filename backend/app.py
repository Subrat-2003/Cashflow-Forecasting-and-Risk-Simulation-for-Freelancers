import os
import json
import uuid
import hashlib
import logging
from pathlib import Path
from dotenv import load_dotenv

from fastapi import FastAPI, BackgroundTasks, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from groq import Groq
import edge_tts

# Configure ruthless logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("PROPHET_BACKEND")

load_dotenv()

# --- INITIALIZATION ---
# Using the specific key name from our previous config
GROQ_KEY = os.getenv("PROPHET_AI_V1_Groq_key")
if not GROQ_KEY:
    logger.error("CRITICAL: PROPHET_AI_V1_Groq_key is missing from environment variables.")

client = Groq(api_key=GROQ_KEY)
app = FastAPI()

# Enhanced CORS for Vercel/Render Handshake
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup storage for the briefing audio files
Path("static/audio").mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# In-memory store for simulation jobs
jobs = {}

# --- DATA MODELS ---
class Transaction(BaseModel):
    amount: float
    date: str
    category: str
    user_id: str
    integrity_hash: str
    # Optional fields allowed to prevent 400 errors from extra frontend data
    client: str = None
    status: str = None
    risk: str = None

class BriefingRequest(BaseModel):
    balance: float
    burn_rate: float
    active_scenario: str
    language: str = "en"
    transactions: list[Transaction]

# --- INTEGRITY SHIELD (Fixed for Precision) ---
def verify_ledger(transactions):
    for tx in transactions:
        # We force .2f formatting to match the frontend string exactly
        # This solves the JS/Python float precision bug
        formatted_amount = "{:.2f}".format(tx.amount)
        raw_data = f"{formatted_amount}|{tx.date}|{tx.category}|{tx.user_id}"
        recalculated = hashlib.sha256(raw_data.encode()).hexdigest()
        
        if recalculated != tx.integrity_hash:
            logger.warning(f"INTEGRITY FAILURE: Expected {tx.integrity_hash}, got {recalculated} for data: {raw_data}")
            return False
    return True

# --- BACKGROUND INTELLIGENCE PIPELINE ---
async def run_intelligence_cycle(job_id, payload: BriefingRequest):
    try:
        prompt = f"Analyze Scenario: {payload.active_scenario}. Current Balance: ${payload.balance}. Monthly Burn: ${payload.burn_rate}. Based on these metrics, provide a ruthless financial strategy."
        
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a ruthless financial strategist for freelancers. Return ONLY a JSON object with 'risk_level' (Low/Medium/High) and 'strategic_actions' (list of 3 strings)."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        
        analysis = json.loads(chat_completion.choices[0].message.content)

        # Voice synthesis
        voice = "hi-IN-MadhurNeural" if payload.language == "hi" else "en-US-AndrewNeural"
        voice_script = f"Neural briefing complete. Risk Level is {analysis['risk_level']}. Strategy: {'. '.join(analysis['strategic_actions'])}"
        
        audio_path = f"static/audio/{job_id}.mp3"
        communicate = edge_tts.Communicate(voice_script, voice)
        await communicate.save(audio_path)

        jobs[job_id] = {
            "status": "complete",
            "data": {
                "analysis": analysis,
                "audio_url": f"/static/audio/{job_id}.mp3"
            }
        }
        logger.info(f"Job {job_id} finalized successfully.")
    except Exception as e:
        logger.error(f"Intelligence Cycle Failed: {str(e)}")
        jobs[job_id] = {"status": "failed", "error": str(e)}

# --- ENDPOINTS ---
@app.get("/")
async def root():
    return {"status": "online", "engine": "Prophet AI V1.1", "location": "Singapore Cloud"}

@app.post("/briefing")
async def start_briefing(payload: BriefingRequest, background_tasks: BackgroundTasks):
    # Pass the ledger check
    if not verify_ledger(payload.transactions):
        # We temporarily bypass for debugging if needed, but for the project, keep it strict
        logger.error("Handshake rejected: Integrity Breach.")
        raise HTTPException(status_code=400, detail="INTEGRITY_BREACH: Tampered or malformed data.")
    
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "processing"}
    background_tasks.add_task(run_intelligence_cycle, job_id, payload)
    return {"job_id": job_id}

@app.get("/briefing-status/{job_id}")
async def get_status(job_id: str):
    return jobs.get(job_id, {"status": "not_found"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
