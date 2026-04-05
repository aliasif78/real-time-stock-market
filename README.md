# 📈 Signalist

> **AI-powered, real-time market intelligence platform for retail and emerging pro investors.** It solves the fragmentation problem of market signals, watchlists, and news workflows by unifying them into one reliable product loop. The architecture is optimized for repeatable engagement at scale through event-driven automation, low-latency data ingestion, and resilient delivery pipelines.

## 🏗️ Architecture & Key Capabilities

- ⚡ **Event-Driven Lifecycle Automation (Inngest):** User onboarding and daily digest flows are orchestrated as durable functions with scheduled and event-based triggers, improving reliability of critical user communications.
- 🔐 **Session-Gated Product Surface (better-auth):** Authentication is enforced at middleware boundaries with cookie-based session checks, reducing unauthorized access risk across protected routes.
- 🧠 **Signal Aggregation with Noise Control (Finnhub API):** A round-robin symbol fetch strategy plus deduplication and server-side validation produces cleaner, more relevant news payloads and lowers alert fatigue.
- 🗃️ **Data Integrity Under Concurrent Writes (MongoDB + Mongoose):** A composite unique index on watchlist records enforces one-symbol-per-user constraints, preventing duplicate inserts and preserving trust in portfolio state.

## 🛠️ Tech Stack

- **💻 Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Radix UI, TradingView Embeds
- **⚙️ Backend:** Next.js Route Handlers, Server Actions, better-auth, Inngest, Finnhub API, Nodemailer
- **🗄️ Infrastructure & Ops:** MongoDB, Mongoose, Gmail SMTP, Vercel-ready runtime, ESLint + Prettier

## 🚀 Quick Start

```bash
git clone https://github.com/aliasif78/real-time-stock-market.git
cd real-time-stock-market
npm install

cat > .env <<'EOF'
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_auth_secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key
GEMINI_API_KEY=your_gemini_api_key
NODEMAILER_EMAIL=your_gmail_address
NODEMAILER_PASSWORD=your_gmail_app_password
EOF

npm run dev
```
