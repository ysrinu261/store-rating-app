# Store Rating Platform

Full-stack coding challenge submission — a web app where users rate stores (1–5 stars), with three roles: **System Administrator**, **Normal User**, and **Store Owner**.

## Tech Stack
- **Backend:** Node.js, Express.js, Prisma ORM, PostgreSQL, JWT auth, bcryptjs, express-validator
- **Frontend:** React (Vite), React Router DOM v6, Axios, Tailwind CSS, lucide-react

## Project Structure
```
store-rating-app/
├── backend/     # Express API
└── frontend/    # React SPA
```

## Quick Start

### 1. Database
Create a PostgreSQL database (locally or a free instance on Neon/Render/Supabase):
```sql
CREATE DATABASE store_rating_db;
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# edit .env: set DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run seed          # creates a default admin account
npm run dev            # starts on http://localhost:5000
```

Default admin login (created by the seed script):
- Email: `admin@platform.com`
- Password: `Admin@1234`

### 3. Frontend
```bash
cd frontend
npm install
npm run dev             # starts on http://localhost:5173
```

The frontend is preconfigured (`src/api/axiosInstance.js`) to call the backend at `http://localhost:5000/api`. Change `VITE_API_URL` in `frontend/.env` if your backend runs elsewhere.

## Roles & Flow
| Role | How they're created | Landing page |
|---|---|---|
| System Administrator | Seed script, or another admin via `/api/admin/users` | `/admin/dashboard` |
| Normal User | Self-registers at `/signup` | `/stores` |
| Store Owner | Created by an admin via `/api/admin/stores` (owner account + store together) | `/owner/dashboard` |

## Validation Rules (enforced both client- and server-side)
- **Name:** 20–60 characters
- **Address:** ≤ 400 characters
- **Password:** 8–16 characters, ≥1 uppercase letter, ≥1 special character
- **Email:** standard email format
- **Rating:** integer 1–5

## Notable Design Decisions
- Single `/api/auth/login` endpoint for all three roles; the JWT payload carries `role`, and the frontend redirects based on it.
- `Rating` has a `@@unique([userId, storeId])` constraint, so re-rating a store **updates** the existing row (upsert) instead of creating duplicates — this satisfies "modify their submitted rating".
- Store Owner accounts are created together with their store in one admin transaction, matching the 1-to-1 `Store.ownerId` relation.
- All list endpoints (`/admin/users`, `/admin/stores`, `/stores`) support `search`, `sortBy`, and `order` query params, and the frontend tables have clickable sortable headers.
- Passwords are hashed with bcrypt (10 salt rounds); JWTs expire in 7 days.
