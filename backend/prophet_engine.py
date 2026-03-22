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
    """
    Fetches the 800+ records you just generated and 
    formats them for the Prophet AI model.
    """
    # 1. Pull data from Supabase
    # We only need the date and the balance for forecasting
    response = supabase.table("transactions") \
        .select("actual_date, running_balance") \
        .eq("user_id", user_id) \
        .order("actual_date") \
        .execute()
    
    if not response.data:
        raise ValueError("No data found for this user. Run the generator first.")

    # 2. Convert to Pandas DataFrame
    df = pd.DataFrame(response.data)

    # 3. PROPHET REQUIREMENTS: 
    # Must have columns named 'ds' and 'y'
    # 'ds' must be datetime, 'y' must be numeric
    df = df.rename(columns={
        'actual_date': 'ds',
        'running_balance': 'y'
    })
    
    # Clean the date strings to remove timezone offsets for Prophet
    # We tell Pandas to use the smart ISO8601 parser which handles microseconds perfectly
    df['ds'] = pd.to_datetime(df['ds'], format='ISO8601').dt.tz_localize(None)
    df['y'] = pd.to_numeric(df['y'])

    return df

def generate_forecast_and_risk(df: pd.DataFrame):
    """
    Trains the AI model and predicts the next 30 days of cash flow.
    Calculates a risk score based on the probability of hitting a ₹0 balance.
    """
    # 1. Initialize and Fit the Model
    # interval_width=0.95 means we want a 95% confidence interval (Crucial for Risk)
    model = Prophet(interval_width=0.95, daily_seasonality=True)
    model.fit(df)

    # 2. Create Future Dates (30 Days)
    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)

    # 3. Extract the Forecasted Period (The last 30 days)
    # yhat = predicted balance, yhat_lower = worst case scenario
    predictions = forecast.tail(30)[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]

    # 4. CALCULATE RISK SCORE (The 'AI' Secret Sauce)
    # We look at the 'yhat_lower' (95% worst case). 
    # If the worst-case scenario is below 0, that's a liquidity risk.
    days_below_zero = predictions[predictions['yhat_lower'] < 0].shape[0]
    
    # Risk Score = (Days at risk / 30 days) * 100
    risk_score = round((days_below_zero / 30) * 100, 2)

    # 5. Get the 'Danger Date'
    danger_date = None
    if days_below_zero > 0:
        danger_date = predictions[predictions['yhat_lower'] < 0].iloc[0]['ds'].strftime('%Y-%m-%d')

    return {
        "forecast": predictions.to_dict(orient='records'),
        "risk_score": risk_score,
        "danger_date": danger_date,
        "current_balance": round(df['y'].iloc[-1], 2),
        "predicted_end_balance": round(predictions['yhat'].iloc[-1], 2)
    }