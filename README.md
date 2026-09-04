# Smart Market Watchlist

## Product Overview
The Smart Market Watchlist revolutionizes how users track stocks by answering one simple question: **What deserves my attention right now?** Rather than forcing users to memorize prices or scan generic charts, our Meaningful-Change Engine analyzes real-time market data against the user's last-seen snapshot. It instantly surfaces critical movements—like a 5% price surge or a 200% volume spike—in a dedicated "Attention" section. Built with a resilient, abstracted market-data provider and robust PostgreSQL persistence, the platform seamlessly handles live data, rate limits, and offline modes. It’s a low-noise, high-signal dashboard designed for modern investors.

## Architecture
- **Frontend**: React, TypeScript, and Vite. Implements a responsive dashboard with real-time feedback.
- **Backend**: Node.js, Express, and TypeScript. A clean modular monolith.
- **Meaningful-Change Engine**: An isolated, pure-function rules engine (`changeEngine.ts`) that determines severity and change type.
- **Market Data Strategy**: Interface-driven (`IMarketDataProvider`) with a fallback `DemoMarketProvider` and a live `FinnhubMarketProvider`.
- **Database**: PostgreSQL storing users, watchlists, and the crucial `user_snapshots` table.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (running locally or via Docker)

### Database Setup
Ensure PostgreSQL is running, then execute the schema:
```bash
psql postgres -c "CREATE DATABASE groww_watchlist;"
psql -d groww_watchlist -f backend/db/schema.sql
```

### Environment Variables
**Backend (`backend/.env`):**
```env
PORT=3000
DATABASE_URL=postgresql://localhost:5432/groww_watchlist
MARKET_DATA_PROVIDER=DEMO  # Set to 'LIVE' for real data
FINNHUB_API_KEY=your_key_here
```

**Frontend (`frontend/.env`):**
```env
VITE_BACKEND_URL=http://localhost:3000
```

### Running the Application

1. Start the Backend API:
```bash
cd backend
npm install
npm run dev
```

2. Start the Frontend UI:
```bash
cd frontend
npm install
npm run dev
```

## How Market Data Works & Resilience
The application relies on `IMarketDataProvider`. By default, it falls back to a deterministic `DemoMarketProvider` if API keys are missing or if `MARKET_DATA_PROVIDER=DEMO` is set. This ensures the app is *always* runnable and testable.
- **Provider Failure**: If a single symbol's data fails to fetch, it is marked with an `ERROR` status but does not block the entire watchlist.
- **Stale Data**: If the incoming data's timestamp is older than 24 hours, the change engine marks it with a `STALE` status and a `LOW` severity warning.

## Meaningful-Change Algorithm
Located in `changeEngine.ts`, this rules engine takes the current quote and compares it against the user's last `seen_at` snapshot:
- `HIGH` severity: Absolute price shift > 5%.
- `MEDIUM` severity: Absolute price shift > 2%, or Volume Spike > 200%.
- `LOW` severity: Stale data.
- `NONE`: Price shift < 2% and no volume spikes.

## API Overview
- `GET /api/watchlist`: Returns tracked symbols, latest quotes, and the "since last check" change analysis.
- `POST /api/watchlist/symbols`: Add a new symbol.
- `DELETE /api/watchlist/symbols/:symbol`: Remove a tracked symbol.
- `POST /api/watchlist/mark-seen`: Persists the current market prices to `user_snapshots`, resetting the change engine.

## Testing
The backend relies on Jest for unit testing.
```bash
cd backend
npm run test
```

## Key Trade-offs & Limitations
- **No Complex Authentication**: Bypassed for a hardcoded `demo_user` session to focus entirely on the persistent snapshot capability.
- **Latest Snapshot Only**: Only the *latest* seen snapshot is persisted rather than a full timeseries table.
- **Polling / Manual Refresh**: WebSockets were excluded to keep the architecture simple and focus on relational database persistence and pure-function change rules.

## Future Improvements
- Integrate proper JWT authentication.
- Add timeseries persistence for historical charts.
- Push real-time updates via Server-Sent Events (SSE) or WebSockets.
