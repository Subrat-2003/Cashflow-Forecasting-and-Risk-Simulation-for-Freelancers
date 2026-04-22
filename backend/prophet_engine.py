import pandas as pd
from prophet import Prophet
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

# Setup Supabase connection
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def fetch_and_prepare_data(user_id: str):
    # 1. Pull data using your REAL schema names
    response = supabase.table("transactions") \
        .select("expected_date, amount") \
        .eq("user_id", user_id) \
        .order("expected_date") \
        .execute()
    
    if not response.data:
        return pd.DataFrame()

    # 2. Create DataFrame and map to Prophet names
    df = pd.DataFrame(response.data)
    df = df.rename(columns={'expected_date': 'ds', 'amount': 'y'})
    
    # 3. CRITICAL FIX: Explicitly handle high-precision ISO8601 timestamps
    # This handles the '.694362+00:00' part that caused the 500 error.
    df['ds'] = pd.to_datetime(df['ds'], format='ISO8601').dt.tz_localize(None)
    
    # 4. Convert to Running Balance (Essential for AI trend forecasting)
    df = df.sort_values('ds')
    df['y'] = pd.to_numeric(df['y']).cumsum() 

    return df

def generate_forecast_and_risk(df: pd.DataFrame):
    # 1. Fit Model
    # daily_seasonality=True is key for freelancer spending patterns
    model = Prophet(interval_width=0.95, daily_seasonality=True)
    model.fit(df)

    # 2. Predict 30 Days
    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)

    # 3. Format Output
    predictions = forecast.tail(30)[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
    
    return {
        "forecast": predictions.to_dict(orient='records'),
        "current_balance": round(df['y'].iloc[-1], 2)
    }
