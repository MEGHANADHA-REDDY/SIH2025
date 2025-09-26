# Smart Student Hub

Unified platform for managing student activities, approvals, analytics, and shareable portfolios. This repository contains a Next.js frontend and a Node.js/Express backend powered by PostgreSQL, plus a built-in, read-only Sheets system that replaces external spreadsheets.

## ✨ Highlights

- Centralized activity tracking with faculty approval workflow
- Role-based dashboards: student, faculty, admin, recruiter
- Auto-generated, shareable student activity sheets (no Google Sheets required)
- Portfolio and analytics views
- Production-ready Express API with JWT auth and file uploads

## 🧰 Tech Stack

- Frontend: Next.js 15 (App Router), React 19, Tailwind CSS 4
- Backend: Node.js, Express 5, PostgreSQL, JWT, Multer
- Charts/Animations: Chart.js, react-chartjs-2, Framer Motion, GSAP

## 📂 Monorepo Structure

```
smart-student-hub/
├─ src/                        # Next.js app
│  └─ app/                     # Routes and pages
├─ backend/                    # Express API
│  ├─ routes/                  # API route handlers
│  ├─ services/                # Business/services layer
│  ├─ config/                  # DB and env config
│  └─ uploads/                 # Uploaded certificates
├─ public/                     # Static assets
├─ SETUP_GUIDE.md              # End-to-end setup
├─ DATABASE_SETUP.md           # DB specifics
├─ BUILTIN_SHEETS_SYSTEM.md    # Read-only sheets system
├─ RECRUITER_ACCESS.md         # Recruiter flows
└─ README.md
```

## 🚀 Quick Start

1) Backend API

```bash
cd backend
npm install
cp env.example .env   # or create .env as per DATABASE_SETUP.md / SETUP_GUIDE.md
npm run dev
# API at http://localhost:5000; health: http://localhost:5000/health
```

2) Frontend

```bash
cd smart-student-hub
npm install
npm run dev
# App at http://localhost:3000
```

See `SETUP_GUIDE.md` for step-by-step instructions, troubleshooting, and role-based testing.

## 🔐 Environment

Create `backend/.env` using `backend/env.example` or `DATABASE_SETUP.md`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_student_hub
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## 📜 NPM Scripts

Frontend (root `package.json`):
- dev: `next dev --turbopack`
- build: `next build --turbopack`
- start: `next start`
- lint: `eslint`

Backend (`backend/package.json`):
- dev: `nodemon server.js`
- start: `node server.js`
- seed: `npm run seed:users`
- test webhook: `npm run test:webhook`

## 🧱 Key Features

- Authentication & roles: student, faculty, admin, recruiter
- Student activities: submission, certificate upload, status tracking
- Faculty approvals with automatic sheet updates
- Admin management: users, categories, reports
- Recruiter access to professional, read-only activity sheets

## 🗂️ Built-in Sheets (Read-only)

The app ships with a shareable, non-editable sheet per student. No Google setup required.
- API docs and schema: see `BUILTIN_SHEETS_SYSTEM.md`
- Public viewer route: `/sheet/[shareToken]`
- Example URLs in the docs

## 📘 Documentation

- End-to-end setup: `SETUP_GUIDE.md`
- Database setup: `DATABASE_SETUP.md`
- Built-in Sheets: `BUILTIN_SHEETS_SYSTEM.md`
- Recruiter guide: `RECRUITER_ACCESS.md`
- Backend API overview: `backend/README.md`

## 🧪 Testing the Flow

1. Start backend and frontend
2. Register roles at `/register` and login at `/login`
3. Use `npm run test:webhook` in `backend` to seed example activity flow
4. Visit student profiles and shared sheet pages

## 🚢 Deployment

- Frontend: build via `npm run build`, serve with `next start`
- Backend: set `NODE_ENV=production`, use a managed Postgres, strong JWT secret, PM2 or similar
- Configure reverse proxy (nginx) and HTTPS

## 🤝 Contributing

Issues and PRs are welcome. Please keep code readable and follow TypeScript/ESLint recommendations.

---

Smart Student Hub — transforming scattered student records into verified, shareable achievements.
