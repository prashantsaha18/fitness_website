# Fitness Physique Classifier (PHYSIQUE.AI)

## Overview

A full-stack fitness classification web app that uses MediaPipe pose estimation and a Python ML model to classify body type as athletic, skinny, or overweight — then generates personalized workout plans.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 (Node.js)
- **ML backend**: Python 3.11 + scikit-learn (RandomForest)
- **Pose estimation**: MediaPipe Tasks Vision (CDN, browser-side)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui + Zustand
- **Build**: esbuild (CJS bundle for API server)

## Architecture

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

## Key Artifacts

- `artifacts/fitness-classifier/` — React + Vite frontend (preview path: `/`)
- `artifacts/api-server/` — Express 5 API server (preview path: `/api`)
  - `src/routes/classify.ts` — ML classification endpoint, history, stats
  - `src/routes/workouts.ts` — Workout plan recommendation engine
  - `python/predict.py` — Python inference script (calls joblib model)
  - `python/train_model.py` — ML training script (10k synthetic samples)
  - `python/model.joblib` — Trained RandomForest classifier
  - `python/model_meta.json` — Model metadata (accuracy, features, classes)

## ML Model

- **Algorithm**: Random Forest Classifier (200 estimators)
- **Training data**: 10,000 synthetic samples across 3 classes
- **Features** (10): shoulder_hip_ratio, torso_leg_ratio, waist_shoulder_ratio, arm_torso_ratio, bmi_proxy, symmetry_score, posture_score, muscle_visibility_score, limb_proportion_score, body_volume_proxy
- **Classes**: skinny (ectomorph), athletic (mesomorph), overweight (endomorph)
- **Test accuracy**: 100% on synthetic data (classes are well-separated)
- **Feature extraction**: Derived from MediaPipe 33-point landmark array

## DB Schema

- `classifications` — stores classification history (id, physique_type, confidence, body_metrics JSONB, created_at)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes
- `python3 artifacts/api-server/python/train_model.py` — retrain ML model

## Frontend Pages

- `/` — Main analyzer: camera feed, MediaPipe pose overlay, classification trigger
- `/results` — Detailed results: body metrics, probability breakdown, recommendations
- `/workout` — Workout plan: 7-day schedule, nutrition tips, milestones
- `/history` — Classification history list
- `/stats` — Dashboard: distribution chart, total scans, activity feed
