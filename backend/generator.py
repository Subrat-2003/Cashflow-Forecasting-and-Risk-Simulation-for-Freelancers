import os
import random
import math
import hashlib
import numpy as np
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from supabase import create_client, Client

# Note: random seeds are set per-user inside generate_behavioral_history()
# Global seeding removed — it caused all users to share the same sequence pattern,
# making multi-user datasets statistically coupled (not independent)
load_dotenv()
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

# FIX 4: Validate Supabase credentials before attempting connection
# Prevents an ugly runtime crash with a clear, actionable error message
if not url or not key:
    raise ValueError("Missing Supabase credentials. Check your .env file for SUPABASE_URL and SUPABASE_KEY.")

supabase: Client = create_client(url, key)

# --- FEATURE EXTRACTION CONSTANTS ---
# Named here so they're easy to tune without hunting through the function body
LIQUIDITY_FEEDBACK_THRESHOLD = 15000.0   # sim_balance above this → full spending probability
DIP_THRESHOLD                = 5000.0    # running_balance below this → counts as a liquidity dip
RISK_ZONE_TARGET             = -5000.0   # calibration target: controlled stress without insolvency
MAX_DELAY_DAYS               = 30        # delay beyond this → maximum risk score contribution
MAX_DIP_EVENTS               = 10        # dip count beyond this → maximum risk score contribution
EARLY_PAYMENT_CAP            = 10        # early payments beyond this → capped bonus

# --- HELPER FUNCTIONS ---

def add_months(sourcedate, months):
    # Safely adds N months to a date, capping day at 28 to avoid month-end overflow
    month = sourcedate.month - 1 + months
    year = sourcedate.year + month // 12
    month = month % 12 + 1
    day = min(sourcedate.day, 28)
    return datetime(year, month, day, tzinfo=sourcedate.tzinfo)  # preserve UTC from sourcedate

def adjust_to_weekday(date_obj):
    # Pushes Saturday (+2) and Sunday (+1) to the next Monday
    # Enforces the system rule: no payments land on weekends
    if date_obj.weekday() == 5: return date_obj + timedelta(days=2)
    if date_obj.weekday() == 6: return date_obj + timedelta(days=1)
    return date_obj


def generate_behavioral_history(user_id: str):
    # Stable per-user seed via SHA-256 — hash() is NOT stable across Python processes
    # sha256 guarantees: same user_id → same seed across all runs, environments, and machines
    user_seed = int(hashlib.sha256(user_id.encode()).hexdigest(), 16) % (2**32)

    # Local RNG instances — avoids polluting global RNG state
    # Global seeding with random.seed() / np.random.seed() causes cross-user correlation
    # when generating multiple users sequentially or in parallel
    rng    = random.Random(user_seed)          # local stdlib RNG
    np_rng = np.random.default_rng(user_seed)  # local numpy RNG

    best_attempt = []
    best_score = float('inf')
    initial_liquidity = 2000.0

    # FIX 2: Timezone-aware UTC datetime — prevents silent misalignment with Supabase/Postgres
    # datetime.now() is timezone-naive → joins, aggregations, and dashboards can silently drift
    # datetime.now(timezone.utc) ensures all timestamps are UTC-aligned from the start
    now = datetime.now(timezone.utc)
    start_date = now - timedelta(days=365)

    for attempt in range(10):
        transactions = []
        sim_balance = initial_liquidity

        # FIX 4: Per-attempt stress window shift — prevents identical macro pattern across all runs
        # Previously every user/attempt had stress on exact same days → unrealistically deterministic
        # Shift of ±10 days adds natural variance while preserving the stress structure
        shift = rng.randint(-10, 10)
        stress_windows = [(140 + shift, 180 + shift), (290 + shift, 320 + shift)]

        def get_market_conditions(date_obj):
            # Returns (probability_multiplier, stress_multiplier)
            # During stress windows: lower probability of income, higher payment delays
            t = (date_obj - start_date).days
            is_stressed = any(s <= t <= e for s, e in stress_windows)
            return (0.3, 2.5) if is_stressed else (1.0, 1.0)

        def get_seasonality(date_obj):
            # Sine wave over 365 days: income peaks mid-year, dips at year-end
            t = (date_obj - start_date).days
            return 1 + 0.3 * math.sin(2 * math.pi * t / 365)

        # Initial Balance Transaction — anchors the simulation at ₹60,000
        # FIX 1a: Added "is_system": True flag — future-proof alternative to string matching
        # If "category" is ever renamed, this flag still reliably identifies the seed record
        transactions.append({
            "user_id": user_id, "amount": initial_liquidity, "category": "Initial Balance",
            "client_name": "System Seed", "expected_date": start_date.isoformat(),
            "actual_date": start_date.isoformat(), "status": "cleared", "persona": "System",
            "is_system": True
        })

        # --- PART A: INCOME GENERATION ---
        income_tx = []

        # Retainer clients: predictable monthly income with occasional skips
        for client in ["SteadyState Media", "Digital Pulse"]:
            for m in range(12):
                tx_date = add_months(start_date, m).replace(day=rng.randint(1, 7))
                prob, stress = get_market_conditions(tx_date)

                # Missed payments: preserve a trace for default modeling and behavioral analytics
                # actual_date == expected_date (unadjusted) — a missed payment has no real settlement date
                # Applying weekday adjustment would imply the payment was processed, which contradicts "missed"
                if rng.random() < 0.04:
                    income_tx.append({
                        "user_id": user_id, "amount": 0, "category": "Subscription",
                        "client_name": client, "expected_date": tx_date.isoformat(),
                        "actual_date": tx_date.isoformat(), "status": "missed", "persona": "Retainer"
                    })
                    continue

                if rng.random() < prob:
                    amt = 1500 * get_seasonality(tx_date)
                    delay = min(int(np_rng.gamma(2, 2 * stress)), 60)
                    actual_date = adjust_to_weekday(tx_date + timedelta(days=delay))
                    income_tx.append({
                        "user_id": user_id, "amount": round(amt, 2), "category": "Subscription",
                        "client_name": client, "expected_date": tx_date.isoformat(),
                        "actual_date": actual_date.isoformat(), "status": "cleared", "persona": "Retainer"
                    })

        # Milestone projects: 8 projects, each with 3 phased payments
        for _ in range(8):
            start = start_date + timedelta(days=rng.randint(10, 330))
            prob, stress = get_market_conditions(start)
            if rng.random() < prob:
                for i in range(3):
                    if rng.random() < 0.05: continue  # 5% milestone skip
                    tx_date = start + timedelta(days=i * 14)
                    delay = min(int(np_rng.gamma(2, 5 * stress)), 60)
                    actual_date = adjust_to_weekday(tx_date + timedelta(days=delay))
                    income_tx.append({
                        "user_id": user_id, "amount": round(rng.uniform(1000, 3000), 2),
                        "category": "Project Work", "client_name": "Enterprise Hub",
                        "expected_date": tx_date.isoformat(), "actual_date": actual_date.isoformat(),
                        "status": "cleared", "persona": "Milestone"
                    })

        # Laggard clients: 120 ad-hoc attempts, high delay, frequent skips
        # Increased from 60 → 120 to push natural output into the 600–900 record target range
        for _ in range(120):
            tx_date = start_date + timedelta(days=rng.randint(0, 365))
            prob, stress = get_market_conditions(tx_date)
            if rng.random() < (prob * 0.8):
                if rng.random() < 0.08: continue  # 8% no-show rate
                delay = min(int(np_rng.gamma(2, 8 * stress)), 60)
                actual_date = adjust_to_weekday(tx_date + timedelta(days=delay))
                income_tx.append({
                    "user_id": user_id, "amount": round(rng.uniform(800, 3000), 2),
                    "category": "Ad-hoc", "client_name": "Chaos Startup",
                    "expected_date": tx_date.isoformat(), "actual_date": actual_date.isoformat(),
                    "status": "cleared", "persona": "Laggard"
                })

        # Add all income records to the master transactions list
        transactions.extend(income_tx)

        # --- PART B: CHRONOLOGICAL EXPENSE FEEDBACK LOOP ---

        # Pre-group income by actual arrival date — O(n) build, O(1) daily lookup
        # Precomputes .date() once per record — avoids repeated fromisoformat() parsing at scale
        # Note: "missed" records have amount=0 so they contribute nothing to daily_income totals
        income_by_date = {}
        for t in income_tx:
            d = datetime.fromisoformat(t['actual_date']).date()  # parsed once, stored as key
            income_by_date[d] = income_by_date.get(d, 0) + t['amount']

        for day in range(365):
            tx_date = start_date + timedelta(days=day)
            daily_income = income_by_date.get(tx_date.date(), 0)

            # FIX 3: Randomized intra-day ordering — income doesn't always arrive before expenses
            # 50% of days: income lands first (agent spends knowing money arrived)
            # 50% of days: expenses hit first (agent spends before income clears — more stressed)
            income_first = rng.random() < 0.5

            if income_first:
                sim_balance += daily_income

            # Behavioral feedback: agent spends less aggressively under liquidity pressure
            # Note: this is a controlled stochastic simulation — behavior reacts to realized
            # cashflows only, not anticipated inflows (intentional conservative modeling)
            expense_prob = 0.8 if sim_balance > LIQUIDITY_FEEDBACK_THRESHOLD else 0.4

            # Daily variable expenses (1–2 per day, e.g. coffee, transport, tools)
            for _ in range(rng.randint(1, 2)):
                if rng.random() < expense_prob:
                    actual_date = adjust_to_weekday(tx_date)
                    amt = -round(rng.uniform(15, 80), 2)
                    transactions.append({
                        "user_id": user_id, "amount": amt, "category": "Daily Expense",
                        "client_name": "Ops Vendor", "expected_date": tx_date.isoformat(),
                        "actual_date": actual_date.isoformat(), "status": "cleared", "persona": "Expense"
                    })
                    sim_balance += amt

            if not income_first:
                sim_balance += daily_income  # Income clears after expenses on this day

            # Fixed monthly liability: rent always hits on the 1st
            if tx_date.day == 1:
                rent_amt = -round(rng.uniform(1800, 2500), 2)
                transactions.append({
                    "user_id": user_id, "amount": rent_amt, "category": "Rent",
                    "client_name": "Landlord", "expected_date": tx_date.isoformat(),
                    "actual_date": adjust_to_weekday(tx_date).isoformat(), "status": "cleared", "persona": "Expense"
                })
                sim_balance += rent_amt

        # FIX 2: Black Swan shocks are modeled as POST-behavior events (explicitly documented)
        # Shocks do NOT feed back into sim_balance during the expense loop above.
        # Design choice: shocks represent sudden external events the agent couldn't anticipate
        # or adjust behavior for in real-time (e.g. medical emergency, equipment failure).
        # They affect the final running balance and risk calibration, but not daily spending decisions.
        for _ in range(5):
            shock_date = start_date + timedelta(days=rng.randint(30, 330))
            transactions.append({
                "user_id": user_id, "amount": -round(rng.uniform(40000, 60000), 2),
                "category": "Shock", "client_name": "Emergency",
                "expected_date": shock_date.isoformat(),
                "actual_date": adjust_to_weekday(shock_date).isoformat(),
                "status": "cleared", "persona": "Expense"
            })

        # Dataset size guard: 600–800 window
        # Lower bound (600): prevents sparse ML feature distributions
        # Upper bound (900): prevents density drift across users at scale
        if not (400 <= len(transactions) <= 1000):
            continue  # Discard and retry

        # FIX 3: Precompute _actual_dt on every record once — avoids repeated fromisoformat() during sort
        # sorted() calls the key function once per record, but fromisoformat is still O(n) × sort overhead
        # Storing the parsed datetime directly eliminates redundant parsing at scale
        for tx in transactions:
            tx["_actual_dt"] = datetime.fromisoformat(tx["actual_date"])

        final_sorted = sorted(transactions, key=lambda x: x["_actual_dt"])

        # FIX 1b: Use is_system flag — no longer depends on category string being unchanged
        # curr_bal starts at initial_liquidity; system seed record is skipped to avoid double-counting
        curr_bal = initial_liquidity
        min_bal = initial_liquidity

        for tx in final_sorted:
            if tx.get("is_system"):
                # Anchor the display record to the opening balance without adding it again
                tx['running_balance'] = curr_bal
                continue
            curr_bal += tx['amount']
            tx['running_balance'] = round(curr_bal, 2)
            min_bal = min(min_bal, curr_bal)

        # Score this attempt: closest minimum balance to the ₹-5,000 risk zone wins
        score = abs(min_bal - RISK_ZONE_TARGET)
        if score < best_score:
            best_score = score
            best_attempt = final_sorted

    # FIX 1: Explicit failure — never return an empty dataset silently
    # Without this, a failed run returns [] → Supabase inserts nothing → ML pipeline crashes later
    # Fail loudly here so the bug is caught at the source, not downstream
    if not best_attempt:
        raise RuntimeError(
            "Failed to generate a valid behavioral dataset after 10 attempts. "
            "All 10 attempts fell outside the 600–800 record window. "
            "Consider increasing laggard attempt count or daily expense frequency."
        )

    # Strip internal helper field before returning
    # _actual_dt was added for efficient sorting — it is not a DB column
    # Leaving it in would cause Supabase insert failures or silent schema pollution
    for tx in best_attempt:
        tx.pop("_actual_dt", None)

    return best_attempt


# =============================================================================
# FEATURE EXTRACTION LAYER
# Operates on the output of generate_behavioral_history()
# Transforms raw transactions into ML-ready risk signals per user
# =============================================================================

def extract_features(transactions: list, user_id: str) -> dict:
    """
    Extracts four credit risk signals from a simulated transaction history:
      1. avg_payment_delay   — average days between expected and actual payment
      2. missed_payment_rate — fraction of income records with status="missed"
      3. liquidity_dip_count — number of times running_balance fell below ₹5,000
      4. credit_risk_score   — weighted composite score (0–100, higher = riskier)

    Designed to be called directly on the list returned by generate_behavioral_history().
    Does not modify the input list.
    """

    # --- SIGNAL 1: Payment Delay ---
    # Only cleared income transactions have a meaningful delay
    # Expenses and system records are excluded
    delays = []
    early_payment_count = 0
    for tx in transactions:
        if tx.get("is_system") or tx.get("status") != "cleared":
            continue
        if tx.get("persona") not in ("Retainer", "Milestone", "Laggard"):
            continue
        expected = datetime.fromisoformat(tx["expected_date"]).astimezone(timezone.utc)
        actual   = datetime.fromisoformat(tx["actual_date"]).astimezone(timezone.utc)
        # Use total_seconds() / 86400 for safer day calculation
        # Avoids silent truncation surprises and handles timezone offset edge cases
        delay_days = round((actual - expected).total_seconds() / 86400)
        if delay_days < 0:
            early_payment_count += 1   # early payment = positive reliability signal
        else:
            delays.append(delay_days)  # late or on-time payment

    avg_delay = round(sum(delays) / len(delays), 2) if delays else 0.0

    # --- SIGNAL 2: Missed Payment Rate ---
    # Count income-type records (Retainer persona only — these are expected recurring payments)
    # Rate = missed / total expected retainer payments
    retainer_records = [tx for tx in transactions if tx.get("persona") == "Retainer"]
    missed_count     = sum(1 for tx in retainer_records if tx.get("status") == "missed")
    total_retainer   = len(retainer_records)
    missed_rate      = round(missed_count / total_retainer, 4) if total_retainer > 0 else 0.0

    # --- SIGNAL 3: Liquidity Dip Count ---
    # Count distinct dip events — consecutive days below threshold count as ONE event
    # This avoids inflating the count for prolonged low-balance periods
    # Transactions are sorted by actual_date here as a safety guard —
    # extract_features() may be called with unsorted input in future use cases
    LIQUIDITY_THRESHOLD = DIP_THRESHOLD
    dip_count   = 0
    in_dip      = False
    sorted_txs  = sorted(transactions, key=lambda x: datetime.fromisoformat(x["actual_date"]).astimezone(timezone.utc))
    for tx in sorted_txs:
        if tx.get("is_system"):
            continue
        balance = tx.get("running_balance", float('inf'))
        if balance < LIQUIDITY_THRESHOLD and not in_dip:
            dip_count += 1   # entering a new dip event
            in_dip = True
        elif balance >= LIQUIDITY_THRESHOLD:
            in_dip = False   # recovered — reset flag

    # --- SIGNAL 4: Credit Risk Score (0–100, higher = riskier) ---
    # Weighted formula — weights chosen to reflect relative financial impact:
    #   Delay      (40%): late payments → cash flow unreliability
    #   Missed rate(40%): non-payment → direct default risk signal
    #   Dips       (20%): low-balance events → short-term insolvency risk
    #
    # Each signal is normalized to a 0–100 scale before weighting:
    #   delay       → capped at 30 days (beyond 30 = max risk)
    #   missed rate → already 0–1, multiply by 100
    #   dip count   → capped at 10 events (beyond 10 = max risk)

    delay_score  = min(avg_delay / MAX_DELAY_DAYS, 1.0) * 100  # MAX_DELAY_DAYS → full risk
    missed_score = missed_rate * 100                            # already a rate
    dip_score    = min(dip_count / MAX_DIP_EVENTS, 1.0) * 100  # MAX_DIP_EVENTS → full risk
    # Early bonus: rewards reliability — subtracted from score (lower score = safer borrower)
    # Capped at 10 early payments to prevent over-rewarding a single outlier user
    early_bonus  = min(early_payment_count / EARLY_PAYMENT_CAP, 1.0) * 100

    credit_risk_score = round(
        (0.40 * delay_score)  +   # penalise lateness
        (0.40 * missed_score) +   # penalise non-payment
        (0.20 * dip_score)    -   # penalise liquidity stress
        (0.10 * early_bonus),     # reward early payment reliability
        2
    )
    # Note: score can go slightly below 0 for highly reliable users — clamp if needed downstream
    credit_risk_score = max(0.0, min(credit_risk_score, 100.0))  # clamp to valid 0–100 range

    return {
        "user_id"             : user_id,
        "avg_payment_delay"   : avg_delay,           # days (float)
        "missed_payment_rate" : missed_rate,          # 0.0–1.0 (float)
        "liquidity_dip_count" : dip_count,            # integer count of dip events
        "early_payment_count" : early_payment_count,  # positive reliability signal
        "credit_risk_score"   : credit_risk_score     # 0–100 composite (float)
    }

def upload_to_supabase(user_id: str):
    """
    This is the core execution function. 
    It runs the simulation and batch-inserts 600+ records into your DB.
    """
    # 1. Generate the raw behavioral history (The Simulation)
    data = generate_behavioral_history(user_id)

    try:
    # 2. Batch insert into Supabase (100 rows at a time for stability)
            print(f" Attempting to upload {len(data)} records for user {user_id}...")
    
            for i in range(0, len(data), 100):
                batch = data[i : i + 100]
                supabase.table("transactions").insert(batch).execute()
    
            return {"status": "success", "rows": len(data)}
    
    except Exception as e:
        print(f" Database Upload Failed: {str(e)}")
    # We re-raise the error so FastAPI's error handler can catch it
        raise e