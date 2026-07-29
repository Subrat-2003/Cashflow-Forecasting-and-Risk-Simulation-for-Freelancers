# Cashflow Forecasting & Risk Simulation Platform
## User Guide

**Version:** 1.1
**Status:** Final
**Last Updated:** July 2026
**Author:** Subrat Kumar Jena

---

## 1. Introduction

The Cashflow Forecasting & Risk Simulation Platform ("Freelancer Risk Center") helps freelancers and small business owners understand their financial position, forecast future cashflow, simulate risk scenarios, and receive AI-generated financial guidance. This guide explains how to use the platform's dashboard.

## 2. Login

Access to the dashboard requires signing in with an email and password on the login screen. Authentication is handled through Supabase, and a successful login takes you directly to the main dashboard.

## 3. Dashboard Overview

The dashboard brings together your current financial position, a risk gauge, forecast charts, and controls for running scenario simulations and requesting an AI financial briefing — all on a single screen.

## 4. Transaction Management

You can add transactions through the dashboard's transaction entry form. Each transaction is recorded with an amount, date, category, and status. Every transaction is protected with a cryptographic integrity check at the moment it's created, so any later tampering with a transaction's core details would be detectable.

## 5. Forecasting

The platform generates a 30-day cashflow forecast based on your transaction history. This forecast is produced fresh each time you request it, rather than pulled from a static, pre-computed report.

## 6. Scenario Simulation

The dashboard lets you simulate different risk scenarios — for example, "Safe," "Stable," or "Critical" — to see how your projected cashflow would change under each condition. This gives you a way to stress-test your finances against different assumptions before they happen.

## 7. AI Financial Briefing

The platform includes an AI-generated financial briefing feature.

**Financial strategy generation:** When requested, the system analyzes your current balance, spending rate, and selected scenario, and generates a set of specific strategic recommendations using an AI language model.

**Voice narration:** Your generated strategy is also converted into a spoken audio briefing, so you can listen to your financial guidance rather than only reading it.

**Supported languages:** The voice briefing is available in **English and Hindi**.

**How it works (polling):** Because generating the analysis and voice narration takes a short amount of time, the request is processed in the background. The dashboard checks back periodically until your briefing is ready, then displays the analysis and plays the audio automatically.

## 8. Charts

Your cashflow forecast is displayed as a chart, showing your projected balance over the coming days so you can see at a glance whether your finances are trending up or down.

## 9. Risk Indicators

A risk score is shown as a visual gauge, giving you an at-a-glance read on your current financial confidence level, alongside your projected cash runway.

## 10. Using the Dashboard

1. Log in with your email and password
2. Review your current balance and risk score on the dashboard
3. Add any new transactions
4. Review your 30-day forecast chart
5. Run a scenario simulation to stress-test different conditions
6. Request an AI financial briefing for personalized strategic guidance
7. Listen to or read the resulting recommendations

## 11. Common Errors

| Message | What It Means |
|---|---|
| "Data Void: No transaction history found" | The system couldn't generate a forecast because no transactions exist yet for your account |
| "Neural Uplink Failure" (shown during AI Briefing) | The AI briefing request didn't complete; try requesting the briefing again |
| Forecast or chart fails to load | A temporary connectivity issue between the dashboard and the forecasting service; refresh and try again |

## 12. FAQs

**Why does my forecast change each time I request it?**
Your forecast is generated fresh from your latest transaction history each time, rather than reused from a stored report.

**What languages does the AI briefing support?**
English and Hindi.

**How long does the AI briefing take?**
The dashboard checks periodically in the background until it's ready; you don't need to keep clicking, but stay on the dashboard until it completes.

**Can I edit a transaction after adding it?**
Each transaction is protected by an integrity check at the time it's created, which is designed to make the original record tamper-evident.

## 13. Security Notes

- Your login is handled through Supabase Authentication
- Each transaction is protected by an integrity check at the time of entry
- Your data is isolated at the database level so that only your account can access your own records

## 14. Limitations

- The AI financial briefing depends on a live AI service; if that service is temporarily unavailable, the briefing may not complete
- Scenario simulation reflects projected outcomes based on available data and selected assumptions, not a guarantee of future results
- Voice briefings are currently available in English and Hindi only
