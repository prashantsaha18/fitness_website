# Fitness Physique Classifier (PHYSIQUE.AI)

## Overview

A full-stack fitness classification web app that uses MediaPipe pose estimation and a Python ML model to classify body type as athletic, skinny, or overweight — then generates personalized workout plans.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework (dev)**: Express 5 (Node.js) + Python subprocess
- **API framework (Vercel)**: TypeScript serverless functions in `api/`
- **ML classifier (dev)**: Python 3.11 + scikit-learn (RandomForest) via subprocess
- **ML classifier (Vercel)**: Pure TypeScript Gaussian Naive Bayes (`api/_lib/classifier.ts`)
- **Pose estimation**: MediaPipe Tasks Vision (CDN, browser-side)
- **Database**: PostgreSQL + Drizzle ORM (dev) / raw `pg` (Vercel functions)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui + Zustand
- **Build**: esbuild (CJS bundle for API server)

## Architecture

### Local Development
```
Browser
  └─ MediaPipe PoseLandmarker (CDN, real-time pose detection)
  └─ React + Vite frontend (/)
       ├─ POST /api/classify → Express → Python predict.py → joblib model
       ├─ GET  /api/workouts/:type → Express route handler
       ├─ GET  /api/history → Drizzle + PostgreSQL
       ├─ POST /api/history → Drizzle + PostgreSQL
       └─ GET  /api/stats → Drizzle + PostgreSQL
```

### Production (Vercel)
```
Browser
  └─ MediaPipe PoseLandmarker (CDN)
  └─ React SPA (static, Vercel CDN)
       ├─ POST /api/classify → Vercel Function (TS classifier)
       ├─ GET  /api/workouts/[physiqueType] → Vercel Function
       ├─ GET|POST /api/history → Vercel Function + PostgreSQL
       └─ GET  /api/stats → Vercel Function + PostgreSQL
```

## Key Artifacts & Files

- `artifacts/fitness-classifier/` — React + Vite frontend (preview path: `/`)
  - `vite.config.ts` — Dev config (requires PORT + BASE_PATH env vars)
  - `vite.config.vercel.ts` — Vercel build config (no env vars needed)
- `artifacts/api-server/` — Express 5 API server (preview path: `/api`, dev only)
  - `src/routes/classify.ts` — ML classification endpoint (calls Python)
  - `src/routes/workouts.ts` — Workout plan recommendation engine
  - `python/predict.py` — Python inference script (calls joblib model)
  - `python/train_model.py` — ML training script (10k synthetic samples)
  - `python/model.joblib` — Trained RandomForest classifier (git-ignored)
- `api/` — Vercel serverless functions (production only)
  - `api/classify.ts` — ML classification (pure TypeScript)
  - `api/workouts/[physiqueType].ts` — Workout plans
  - `api/history.ts` — GET/POST classification history
  - `api/stats.ts` — Aggregate statistics
  - `api/_lib/classifier.ts` — TypeScript Gaussian NB classifier
  - `api/_lib/workouts-data.ts` — Complete workout plan data (all 3 types × 3 levels)
  - `api/_lib/db.ts` — Raw pg connection for Vercel functions
- `vercel.json` — Vercel deployment configuration
- `DEPLOY.md` — Step-by-step deployment guide
- `.env.example` — Required environment variables
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for codegen)

## ML Model

### Python (dev)
- **Algorithm**: Random Forest Classifier (200 estimators)
- **Training data**: 10,000 synthetic samples across 3 classes
- **Test accuracy**: 100% on synthetic data (well-separated class distributions)

### TypeScript (production/Vercel)
- **Algorithm**: Gaussian Naive Bayes (parameters derived from training distributions)
- **Same 10 features**: shoulder_hip_ratio, torso_leg_ratio, waist_shoulder_ratio,
  arm_torso_ratio, bmi_proxy, symmetry_score, posture_score, muscle_visibility_score,
  limb_proportion_score, body_volume_proxy
- **Classes**: skinny (ectomorph), athletic (mesomorph), overweight (endomorph)

## DB Schema

- `classifications` — stores classification history (id, physique_type, confidence, body_metrics JSONB, created_at)
- Auto-created by `api/_lib/db.ts ensureTable()` in Vercel functions
- Managed by Drizzle in dev (`pnpm --filter @workspace/db run push`)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev)
- `pnpm --filter @workspace/fitness-classifier run build:vercel` — test Vercel frontend build
- `python3 artifacts/api-server/python/train_model.py` — retrain ML model (dev)

## Frontend Pages

- `/` — Main analyzer: camera feed, MediaPipe pose overlay, classification trigger
- `/results` — Detailed results: body metrics, probability breakdown, recommendations
- `/workout` — Workout plan: 7-day schedule (3 physique types × 3 fitness levels), nutrition, milestones
- `/history` — Classification history list
- `/stats` — Dashboard: distribution chart, total scans, activity feed

## Deploying to Vercel via GitHub

See `DEPLOY.md` for full instructions. Quick steps:
1. Push repo to GitHub
2. Import project on vercel.com
3. Add `DATABASE_URL` environment variable (use Vercel Postgres / Neon)
4. Deploy — Vercel auto-runs `build:vercel` and deploys `api/` as serverless functions
