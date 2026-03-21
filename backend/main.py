import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from generator import generate_and_upload_history
from dotenv import load_dotenv

# 1. Load your keys from the .env file
load_dotenv()

app = FastAPI()

# 2. CORS: Allows your Frontend (port 3000) to talk to this Backend (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Request model (tells FastAPI what data to expect)
class InitRequest(BaseModel):
    user_id: str

@app.get("/")
def read_root():
    return {"message": "GigNavigator API is Live!"}

@app.post("/generate-data")
async def seed_data(request: InitRequest):
    try:
        # Calls the logic from your generator.py
        generate_and_upload_history(request.user_id)
        return {"status": "success", "message": f"History generated for {request.user_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# To run: uvicorn main:app --reload