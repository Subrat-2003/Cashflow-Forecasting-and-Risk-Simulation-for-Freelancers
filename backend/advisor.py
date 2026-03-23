import os
from google import genai
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

# Initialize Clients
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def get_survival_plan(user_id: str, forecast_results: dict):
    # 1. Fetch the actual "Evidence" from Supabase
    # We want to see where the money went in the last 30 days
    response = supabase.table("transactions") \
        .select("category, amount") \
        .eq("user_id", user_id) \
        .execute()
    
    # Simple aggregation of expenses
    expenses = {}
    for tx in response.data:
        if tx['amount'] < 0:
            cat = tx['category']
            expenses[cat] = expenses.get(cat, 0) + abs(tx['amount'])
    
    # Get Top 3 highest expense categories
    sorted_expenses = sorted(expenses.items(), key=lambda x: x[1], reverse=True)[:3]
    expense_summary = ", ".join([f"{cat} (₹{amt:,.0f})" for cat, amt in sorted_expenses])

    # 2. Build the "Crisis Prompt"
    prompt = f"""
    ROLE: Ruthless Financial Advisor for Freelancers.
    CONTEXT: The user is in a severe liquidity crisis. 
    DATA:
    - Current Balance: ₹{forecast_results['current_balance']:,.2f}
    - Predicted End Balance: ₹{forecast_results['predicted_end_balance']:,.2f}
    - Danger Date: {forecast_results['danger_date']}
    - Risk Score: {forecast_results['risk_score']}/100
    - Top Spending Categories: {expense_summary}

    TASK:
    Provide a 3-part survival plan:
    1. VERDICT: One brutal sentence on their current path.
    2. IMMEDIATE CUTS: Identify exactly which of the 'Top Spending Categories' they must freeze.
    3. THE WHAT-IF: Suggest one specific move to push the Danger Date back (e.g., invoice a client early or cut a specific subscription).

    TONE: Professional, direct, no sugarcoating. Avoid buzzwords like 'synergy' or 'empower.'
    """

    # 3. Get the AI's advice
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    
    return response.text