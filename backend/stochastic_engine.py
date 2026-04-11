import pandas as pd
import numpy as np
import joblib
import os
from supabase import create_client, Client
from xgboost import XGBRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from dotenv import load_dotenv

# 1. Setup Environment
load_dotenv()

# --- PRE-FLIGHT CHECK ---
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    print(" ERROR: Credentials missing!")
    print(f"URL found: {'Yes' if url else 'NO'}")
    print(f"Key found: {'Yes' if key else 'NO'}")
    print("Check your .env file in the /backend folder and ensure the names match.")
    exit()

supabase: Client = create_client(url, key)

def fetch_transaction_data():
    print(" Fetching data from Supabase...")
    response = supabase.table("v_client_risk_status").select("*").execute()
    df = pd.DataFrame(response.data)
    
    if df.empty:
        print(" ERROR: No data found in the view.")
        exit()

    # Pre-processing with forced ISO parsing
    df['expected_date'] = pd.to_datetime(df['expected_date'], format='ISO8601', utc=True)
    df['amount'] = df['amount'].astype(float)
    
    # Remove timezone awareness for easier ML processing
    df['expected_date'] = df['expected_date'].dt.tz_localize(None)
    
    df = df.sort_values('expected_date')
    return df

def prepare_features(df):
    print(" Engineering features...")
    le = LabelEncoder()
    # We use 'category' and 'automated_status' (from our view) as features
    df['category_encoded'] = le.fit_transform(df['category'])
    
    # Time-based features
    df['day_of_week'] = df['expected_date'].dt.dayofweek
    df['day_of_month'] = df['expected_date'].dt.day
    df['month'] = df['expected_date'].dt.month
    
    features = ['category_encoded', 'day_of_week', 'day_of_month', 'month']
    X = df[features]
    y = df['amount']
    
    return X, y, le

if __name__ == "__main__":
    # Step 1: Get data
    data = fetch_transaction_data()
    
    # Step 2: Prepare features
    X, y, encoder = prepare_features(data)
    
    # Step 3: Train Level 0 Models (The Specialists)
    print(" Training Specialists (XGBoost & Random Forest)...")
    xgb_model = XGBRegressor(n_estimators=100, learning_rate=0.05, max_depth=5)
    rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
    
    xgb_model.fit(X, y)
    rf_model.fit(X, y)
    
    # Step 4: Save the "Brains"
    print(" Saving models to disk...")
    joblib.dump(xgb_model, 'xgb_specialist.pkl')
    joblib.dump(rf_model, 'rf_specialist.pkl')
    joblib.dump(encoder, 'category_encoder.pkl')
    
    print(f"\n SUCCESS: Level 0 Specialists trained on {len(data)} records.")