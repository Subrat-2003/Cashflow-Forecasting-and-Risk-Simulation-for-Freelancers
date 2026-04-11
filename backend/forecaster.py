import logging
# This hides the 'Importing plotly failed' noise
logging.getLogger('prophet').setLevel(logging.ERROR)

import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime, timedelta
from supabase import create_client, Client
from prophet import Prophet
from dotenv import load_dotenv

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# 1. Load the Specialists (Level 0)
xgb_model = joblib.load('xgb_specialist.pkl')
rf_model = joblib.load('rf_specialist.pkl')
encoder = joblib.load('category_encoder.pkl')

def generate_future_forecast(days=30):
    print(f" Generating forecast for the next {days} days...")
    
    # Create future dates
    last_date = datetime.now()
    future_dates = [last_date + timedelta(days=i) for i in range(1, days + 1)]
    
    # Build a future dataframe
    future_df = pd.DataFrame({'expected_date': future_dates})
    future_df['day_of_week'] = future_df['expected_date'].dt.dayofweek
    future_df['day_of_month'] = future_df['expected_date'].dt.day
    future_df['month'] = future_df['expected_date'].dt.month
    
    # We assume 'Milestone' (encoded) for basic future forecasting
    # You can get more complex here by simulating different categories
    future_df['category_encoded'] = encoder.transform(['Milestone'])[0]
    
    features = ['category_encoded', 'day_of_week', 'day_of_month', 'month']
    X_future = future_df[features]

    # --- LEVEL 0 PREDICTIONS ---
    xgb_preds = xgb_model.predict(X_future)
    rf_preds = rf_model.predict(X_future)
    
    # --- STACKING BLEND (Level 1 Meta-Logic) ---
    # We weight XGBoost higher for spikes and RF for stability
    final_preds = (xgb_preds * 0.6) + (rf_preds * 0.4)
    
    future_df['predicted_amount'] = final_preds
    return future_df

def push_to_supabase(forecast_df):
    print(" Pushing predictions to the Vault...")
    
    # Format data for Supabase
    records = []
    user_id = "e6d6e60c-6890-4edf-94ea-7186e93a6064" # Your test UUID
    
    for _, row in forecast_df.iterrows():
        records.append({
            "user_id": user_id,
            "prediction_date": row['expected_date'].strftime('%Y-%m-%d'),
            "predicted_amount": float(row['predicted_amount']),
            "scenario_type": "baseline",
            "confidence_interval_low": float(row['predicted_amount'] * 0.9),
            "confidence_interval_high": float(row['predicted_amount'] * 1.1)
        })
    
    # Clear old predictions first to keep it fresh
    supabase.table("cashflow_predictions").delete().eq("user_id", user_id).execute()
    
    # Insert new ones
    supabase.table("cashflow_predictions").insert(records).execute()
    print(" Forecast successfully deployed to Supabase.")

if __name__ == "__main__":
    forecast = generate_future_forecast(30)
    push_to_supabase(forecast)