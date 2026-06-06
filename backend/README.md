# SmartFish Decision AI — Backend

Express + Prisma + PostgreSQL REST API for the SmartFish frontend.

## Setup

```bash
cd backend
cp .env.example .env       # set DATABASE_URL + JWT secrets
npm install
npm run prisma:migrate -- --name init
npm run seed               # creates demo admin: admin@smartfish.io / admin123
npm run dev                # http://localhost:5000/api
```

## Endpoints

- `POST   /api/auth/login` `/register` `/refresh-token` `/logout` · `GET /api/auth/me`
- `GET|POST|PUT|DELETE /api/fishermen[/:id]`
- `GET|POST|PUT|DELETE /api/boats[/:id]`
- `GET|POST|PUT|DELETE /api/catches[/:id]`
- `GET|POST|PUT|DELETE /api/stock[/:id]` · `GET /api/stock/alerts`
- `GET|POST|PUT|DELETE /api/sales[/:id]` · `GET /api/sales/summary`
- `GET /api/analytics/kpis` · `GET /api/analytics/revenue-trend` · `GET /api/analytics/catches-by-species`
- `GET /api/ai/forecast` · `GET /api/ai/recommendations` · `POST /api/ai/chat`

All endpoints (except `/auth/login`, `/auth/register`, `/auth/refresh-token`) require `Authorization: Bearer <token>`.
