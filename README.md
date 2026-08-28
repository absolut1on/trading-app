# Trading App

Stock trading web app with real-time price data, portfolio management, and auto-sell triggers.

## Stack

- **Frontend:** React (Vite) + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Database:** Supabase (Postgres + Auth + RLS)
- **Market Data:** Alpha Vantage API (daily time series)
- **Charts:** Lightweight Charts (TradingView)
- **Real-time:** Socket.IO + Node EventEmitter

## Features

- Email/password auth via Supabase
- Browse 50 stocks with cached price data
- Stock detail with price chart and stats
- KYC verification (required before trading)
- Buy/sell stocks with balance management
- Portfolio view with holdings and deposit
- Transaction history
- Auto-sell price triggers with real-time notifications

## Setup

### 1. Supabase

Create a Supabase project and run both SQL files in the SQL Editor:

- `server/src/db/schema.sql` — profiles, holdings, transactions, kyc tables
- `server/src/db/triggers.sql` — price_triggers, notifications tables

### 2. Environment Variables

Copy `.env.example` to create `.env` files:

**server/.env**
```
PORT=3001
CLIENT_URL=http://localhost:5173
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
ALPHA_VANTAGE_API_KEY=<your-api-key>
```

**client/.env**
```
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### 3. Install & Run

```bash
# Server
cd server
npm install
npm run dev

# Client (separate terminal)
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`, API at `http://localhost:3001`.

## Rate Limits

Alpha Vantage free tier allows ~5 calls/min. The app uses progressive caching — the dashboard shows cached prices (or "--" if uncached), and detail pages trigger API calls. Prices are cached in-memory for 5 minutes.

## Auto-Sell Triggers

Set a target price on any stock you own. A background monitor checks cached prices every 30 seconds. When the price meets the target, the system auto-sells and sends a real-time notification via Socket.IO.
