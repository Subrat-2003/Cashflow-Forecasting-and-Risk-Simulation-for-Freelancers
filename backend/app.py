import os
import json
import uuid
import hashlib
from pathlib import Path
from dotenv import load_dotenv

from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from groq import Groq
import edge_tts

load_dotenv()

# --- INITIALIZATION ---
client = Groq(api_key=os.getenv("PROPHET_AI_V1_Groq_key"))
app = FastAPI()

# Allow your Next.js frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

class BriefingRequest(BaseModel):
    balance: float
    burn_rate: float
    active_scenario: str
    language: str = "en"
    transactions: list[Transaction]

# --- INTEGRITY SHIELD (SHA-256) ---
def verify_ledger(transactions):
    for tx in transactions:
        # Strict Forensic Formula: SHA256(Amount + Date + Category + UserID)
        raw_data = f"{tx.amount}|{tx.date}|{tx.category}|{tx.user_id}"
        recalculated = hashlib.sha256(raw_data.encode()).hexdigest()
        
        # If the hash doesn't match, someone tampered with the DB
        if recalculated != tx.integrity_hash:
            return False
    return True

# --- BACKGROUND INTELLIGENCE PIPELINE ---
async def run_intelligence_cycle(job_id, payload: BriefingRequest):
    try:
        # 1. Neural Analysis (Llama 3.3 via Groq)
        prompt = f"Analyze: {payload.active_scenario}. Balance: ${payload.balance}. Burn: ${payload.burn_rate}."
        
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a ruthless financial strategist. Return STRICT JSON with 'risk_level' and 'strategic_actions'."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        
        analysis = json.loads(chat_completion.choices[0].message.content)

        # 2. Multilingual Voice Briefing (edge-tts)
        # Choosing between hi-IN-MadhurNeural or en-US-AndrewNeural
        voice = "hi-IN-MadhurNeural" if payload.language == "hi" else "en-US-AndrewNeural"
        voice_script = f"Risk Level: {analysis['risk_level']}. Strategic advice: {'. '.join(analysis['strategic_actions'])}"
        
        audio_path = f"static/audio/{job_id}.mp3"
        communicate = edge_tts.Communicate(voice_script, voice)
        await communicate.save(audio_path)

        # 3. Finalize Job
        jobs[job_id] = {
            "status": "complete",
            "data": {
                "analysis": analysis,
                "audio_url": f"/static/audio/{job_id}.mp3"
            }
        }
    except Exception as e:
        jobs[job_id] = {"status": "failed", "error": str(e)}

# --- ENDPOINTS ---
@app.post("/briefing")
async def start_briefing(payload: BriefingRequest, background_tasks: BackgroundTasks):
    # Verify hashes before proceeding [cite: 527, 766]
    if not verify_ledger(payload.transactions):
        raise HTTPException(status_code=400, detail="INTEGRITY_BREACH: Compromised data rejected.")
    
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