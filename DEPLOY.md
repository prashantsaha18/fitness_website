# Deploying to Vercel via GitHub

## One-time Setup

### 1. Push this repository to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/fitness-physique-classifier.git
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New → Project**
3. Import your GitHub repository
4. Vercel auto-detects `vercel.json` — no framework preset needed
5. Click **Deploy**

### 3. Add Environment Variables in Vercel

In your Vercel project → **Settings → Environment Variables**, add:

| Variable       | Value                                              | Notes                       |
|----------------|----------------------------------------------------|-----------------------------|
| `DATABASE_URL` | `postgres://user:pass@host:5432/db?sslmode=require`| Neon or Vercel Postgres URL |

**Recommended: Use Vercel Postgres (Neon)**
- In Vercel dashboard → **Storage → Create Database → Postgres**
- Click **Connect** on your project — `DATABASE_URL` is set automatically

### 4. Initialize the Database

The API auto-creates the `classifications` table on first request.
Or run manually:

```sql
CREATE TABLE IF NOT EXISTS classifications (
  id SERIAL PRIMARY KEY,
  physique_type TEXT NOT NULL,
  confidence REAL NOT NULL,
  body_metrics JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

---

## How It Works on Vercel

| Layer         | Technology                  | Location              |
|---------------|-----------------------------|-----------------------|
| Frontend      | React + Vite (static)       | `artifacts/fitness-classifier/` |
| API Functions | TypeScript serverless       | `api/`                |
| ML Classifier | Pure TypeScript (Gaussian NB)| `api/_lib/classifier.ts` |
| Database      | PostgreSQL (Neon/Vercel)    | Via `DATABASE_URL`    |

### API Routes

| Method | Path                           | Description                     |
|--------|--------------------------------|---------------------------------|
| `GET`  | `/api/healthz`                 | Health check                    |
| `POST` | `/api/classify`                | Classify physique from landmarks|
| `GET`  | `/api/workouts/:physiqueType`  | Get personalized workout plan   |
| `GET`  | `/api/history`                 | Classification history          |
| `POST` | `/api/history`                 | Save classification result      |
| `GET`  | `/api/stats`                   | Aggregate statistics            |

### Classify Request Body

```json
{
  "landmarks": [
    { "x": 0.5, "y": 0.2, "z": 0.0, "visibility": 0.99 }
    // ... 33 MediaPipe pose landmarks
  ],
  "height": 175,
  "weight": 70,
  "age": 25,
  "gender": "male"
}
```

---

## Auto-deploy on Push

Once connected to GitHub, every push to `main` triggers a new Vercel deployment automatically.

## Local Development

```bash
pnpm install
# Start API server (Express, with Python ML backend)
pnpm --filter @workspace/api-server run dev
# Start frontend
pnpm --filter @workspace/fitness-classifier run dev
```

The Vercel `api/` functions are for production only. Locally, the Express server handles all `/api` routes.
