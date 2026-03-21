import os
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client
import numpy as np

# 1. Setup & Environment
load_dotenv()
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in .env file")

supabase: Client = create_client(url, key)

def generate_and_upload_history(user_id: str):
    """
    Generates 12 months of synthetic transaction data with 'fingerprints' 
    of different freelancer archetypes (Retainers, Milestones, Laggards).
    """
    transactions = []
    start_date = datetime.now() - timedelta(days=365)
    
    # Freelancer Personas for Stochastic Variance
    # We define probabilities and amounts for each type
    personas = [
        {"name": "Retainer", "weight": 0.4, "min": 2000, "max": 5000, "cat": "Subscription"},
        {"name": "Milestone", "weight": 0.3, "min": 5000, "max": 15000, "cat": "Project Work"},
        {"name": "Laggard", "weight": 0.3, "min": 500, "max": 2000, "cat": "Ad-hoc"}
    ]

    print(f"🚀 Generating history for User: {user_id}")

    # Generate roughly 30 transactions across the year
    for _ in range(30):
        persona = random.choices(personas, weights=[p['weight'] for p in personas])[0]
        
        # Stochastic math: Gaussian distribution for more realistic 'random' amounts
        amount = round(float(np.random.uniform(persona['min'], persona['max'])), 2)
        
        # Random date within the last year
        random_days = random.randint(0, 365)
        tx_date = (start_date + timedelta(days=random_days)).isoformat()

        # THE FIX: Every field required by your Supabase schema is explicitly defined here.
        # No 'null' values allowed for 'category'.
        tx_entry = {
            "user_id": user_id,
            "amount": amount,
            "category": persona['cat'],
            "client_name": f"{random.choice(['Acme Corp', 'Global Tech', 'Solo Startup'])}",
            "expected_date": tx_date,  # Matches your screenshot
            "actual_date": tx_date,    # Matches your screenshot
            "status": "cleared",
            "persona": persona['name'], # Matches your screenshot
            "created_at": datetime.now().isoformat()
        }
        transactions.append(tx_entry)

    # 2. Bulk Upload to Supabase
    try:
        response = supabase.table("transactions").insert(transactions).execute()
        return {"status": "success", "rows_inserted": len(transactions)}
    except Exception as e:
        print(f"❌ Database Crash: {str(e)}")
        # Raise the error so FastAPI catches it and shows the Traceback
        raise e