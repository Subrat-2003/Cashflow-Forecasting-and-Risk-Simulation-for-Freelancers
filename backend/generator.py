import os
import numpy as np
from datetime import datetime, timedelta
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

def generate_and_upload_history(user_id):
    # This is the "Stochastic Engine" logic we discussed
    history = []
    base_date = datetime.now() - timedelta(days=365)
    
    for day in range(365):
        current_date = base_date + timedelta(days=day)
        
        # 1. RETAINER LOGIC (Steady Income)
        if current_date.day == 1:
            delay = int(np.random.normal(0, 1)) # Normal Dist
            history.append({
                "user_id": user_id,
                "amount": 50000,
                "expected_date": current_date.isoformat(),
                "actual_date": (current_date + timedelta(days=delay)).isoformat(),
                "persona": "retainer",
                "status": "cleared"
            })

        # 2. LAGGARD LOGIC (The "Twist")
        if current_date.day == 15:
            # Gamma Distribution k=2, theta=5 (Mean 10 day delay)
            delay = int(np.random.gamma(2, 5)) 
            history.append({
                "user_id": user_id,
                "amount": 30000,
                "expected_date": current_date.isoformat(),
                "actual_date": (current_date + timedelta(days=delay)).isoformat(),
                "persona": "laggard",
                "status": "cleared"
            })

    # Upload to Supabase
    data, count = supabase.table("transactions").insert(history).execute()
    print(f"Successfully uploaded {len(history)} records!")

# To run this, you'd call: generate_and_upload_history("your-user-uuid")