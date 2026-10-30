# SpendSense — Personal Finance & Wealth Intelligence

SpendSense is a precision personal finance tracking platform built with a high-performance **React 18 + Vite + Tailwind CSS** frontend and a robust **Node.js + Express + Supabase PostgreSQL** backend, featuring mathematical financial telemetry, category guardrails, dynamic milestone pacing, and full Row Level Security (RLS).

---

## Architecture Overview

```
spendsense-redesigned/
├── project/                # React 18 + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/     # UI, Layout, Charts, Modals, Feedbacks
│   │   ├── context/        # AuthContext, FinanceContext, ThemeContext, ToastContext
│   │   ├── lib/            # Supabase client, API client, Mathematical formulas
│   │   └── pages/          # Dashboard, Transactions, Budgets, Goals, Insights, Settings
│   ├── .env.example        # Frontend environment template
│   └── vercel.json         # Vercel SPA routing configuration
├── server/                 # Node.js + Express REST API Backend
│   ├── src/
│   │   ├── config/         # Environment validation, Supabase client initialization
│   │   ├── middleware/     # Supabase JWT Auth, Zod validation, Rate limiter, Error handling
│   │   ├── controllers/    # Auth, Transactions, Budgets, Goals, Dashboard, Insights
│   │   ├── services/       # Database queries & deterministic financial math engines
│   │   ├── schemas/        # Zod validation schemas
│   │   └── routes/         # Express API routers
│   ├── tests/              # Automated Node.js integration test suite
│   └── .env.example        # Backend environment template
├── supabase/
│   ├── migrations/         # PostgreSQL schema & Row-Level Security policies
│   ├── seed.sql            # Sample data & default categories
│   └── config.toml         # Supabase CLI local development configuration
├── DATABASE_SETUP.md       # Complete step-by-step Supabase database guide
├── render.yaml             # Render Blueprint for backend deployment
├── vercel.json             # Vercel deployment configuration
└── README.md
```

---

## Quick Start (Local Development)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Supabase Account**: (Free tier at [supabase.com](https://supabase.com)) or local Docker

### 1. Clone & Install Dependencies

```bash
# Install frontend dependencies
cd project
npm install
cd ..

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Configure Environment Variables

**Frontend (`project/.env`):**
```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
VITE_API_URL=http://localhost:5000/api
```

**Backend (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret_key
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:4173
```

*(Note: SpendSense includes an automatic offline development fallback. If Supabase credentials are not supplied yet, the application gracefully operates in demo sandbox mode).*

### 3. Apply Database Migrations

Open your Supabase Project **SQL Editor** and execute in order:
1. `supabase/migrations/20261030000000_create_spendsense_schema.sql`
2. `supabase/migrations/20261030000001_row_level_security.sql`

*(See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for full database setup and CLI options).*

### 4. Run Both Servers

Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
npm run dev:server
# Server starts at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

**Terminal 2 (Frontend App):**
```bash
npm run dev
# Frontend starts at http://localhost:5173
```

---

## API Endpoints Reference

All `/api/*` endpoints except health and public auth endpoints require a Bearer access token:
`Authorization: Bearer <supabase_jwt_access_token>`

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status check | No |
| `POST` | `/api/auth/register` | Register new user via Supabase Auth | No |
| `POST` | `/api/auth/login` | Login user and issue access session | No |
| `POST` | `/api/auth/logout` | Revoke session | Yes |
| `GET` | `/api/auth/me` | Fetch authenticated user identity | Yes |
| `POST` | `/api/auth/forgot-password` | Send password reset email | No |
| `GET` | `/api/transactions` | List & filter user transactions | Yes |
| `POST` | `/api/transactions` | Create income or expense record | Yes |
| `GET` | `/api/transactions/:id` | Get specific transaction | Yes |
| `PUT` | `/api/transactions/:id` | Update transaction record | Yes |
| `DELETE` | `/api/transactions/:id` | Delete transaction record | Yes |
| `GET` | `/api/budgets` | List budgets with live utilization metrics | Yes |
| `POST` | `/api/budgets` | Create or update category budget | Yes |
| `DELETE` | `/api/budgets/:id` | Delete budget ceiling | Yes |
| `GET` | `/api/goals` | List goals with progress & pacing | Yes |
| `POST` | `/api/goals` | Create savings goal | Yes |
| `PUT` | `/api/goals/:id` | Update savings goal | Yes |
| `DELETE` | `/api/goals/:id` | Delete savings goal | Yes |
| `POST` | `/api/goals/:id/contribute` | Allocate capital contribution to goal | Yes |
| `GET` | `/api/dashboard` | Aggregated wealth & cash-flow telemetry | Yes |
| `GET` | `/api/analytics` | Weekday distribution & merchant forensics | Yes |
| `GET` | `/api/insights` | P0/P1/P2 deterministic mathematical signals | Yes |
| `GET` | `/api/user/profile` | Get user settings & profile | Yes |
| `PUT` | `/api/user/profile` | Update user settings & preferences | Yes |
| `POST` | `/api/user/demo-data` | Populate 6-month realistic baseline | Yes |
| `DELETE` | `/api/user/data` | Reset and wipe user financial records | Yes |

---

## Production Deployment

### 1. Deploy Frontend to Vercel
1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and import this repository.
3. Configure the Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `project` (or leave at root with build command: `npm --prefix project run build` and output: `project/dist`)
4. Add Environment Variables:
   - `VITE_SUPABASE_URL`: `https://<your-project-ref>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `<your_anon_key>`
   - `VITE_API_URL`: `https://<your-render-app>.onrender.com/api`
5. Click **Deploy**. Vercel will build and serve your SPA with full client-side route rewrites.

### 2. Deploy Backend to Render
1. In the [Render Dashboard](https://render.com), click **New +** → **Web Service** (or use the blueprint with `render.yaml`).
2. Connect your GitHub repository.
3. Configure the Web Service:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Health Check Path**: `/api/health`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `SUPABASE_URL`: `https://<your-project-ref>.supabase.co`
   - `SUPABASE_ANON_KEY`: `<your_anon_key>`
   - `SUPABASE_SERVICE_ROLE_KEY`: `<your_service_role_key>`
   - `FRONTEND_URL`: `https://<your-vercel-domain>.vercel.app`
   - `CORS_ORIGINS`: `https://<your-vercel-domain>.vercel.app`
5. Click **Create Web Service**. Render will start the Express API and expose the production URL.

---

## Testing & Quality Assurance

Run the automated backend test suite:
```bash
npm run test:server
```
*(Executes 14 integration tests covering health, auth verification, CRUD operations, mathematical insights, and multi-user data isolation).*

Run frontend type checking & build verification:
```bash
npm run typecheck
npm run build
npm run lint
```

