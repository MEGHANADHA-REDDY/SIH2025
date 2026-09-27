# Smart Student Hub

Unified platform for managing student activities, faculty approvals, analytics, and shareable portfolios. A Next.js frontend talks to a Node.js/Express API backed by PostgreSQL. Each student gets a built-in, read-only activity sheet that can be shared with recruiters without any external spreadsheet service.

## Features

- Role-based dashboards for students, faculty, admins, super admins, and recruiters
- Activity submission with certificate and image uploads, plus a faculty approval workflow
- Auto-generated, shareable student activity sheets (`/sheet/[shareToken]`)
- Public portfolios, analytics, and job postings with applications
- JWT authentication, CSV reports, and scheduled report emails over SMTP

## Tech Stack

- Frontend: Next.js 15 (App Router), React 19, Tailwind CSS 4, Chart.js, Framer Motion, GSAP
- Backend: Node.js 20+, Express 5, PostgreSQL (`pg`), JWT, Multer, Nodemailer

## Repository Layout

```
.
├─ smart-student-hub/          Next.js frontend
│  ├─ src/app/                 Routes and pages
│  ├─ src/lib/api.ts           API base URL (NEXT_PUBLIC_API_URL)
│  └─ backend/                 Express API
│     ├─ server.js             Entry point
│     ├─ config/database.js    Pool config and schema bootstrap
│     ├─ routes/               API route handlers
│     ├─ services/             Built-in sheets service
│     ├─ middleware/           Auth middleware
│     └─ uploads/              Uploaded files (created at runtime, git-ignored)
└─ README.md
```

## Local Development

Requires Node.js 20+ and PostgreSQL 14+.

1. Create a database:

   ```bash
   createdb smart_student_hub
   ```

2. Start the API:

   ```bash
   cd smart-student-hub/backend
   npm install
   cp .env.example .env    # fill in DB credentials and JWT_SECRET
   npm run dev             # http://localhost:5000, health at /health
   ```

   Tables, default activity categories, and the default super admin are created automatically on startup.

3. Start the frontend:

   ```bash
   cd smart-student-hub
   npm install
   cp .env.example .env.local
   npm run dev             # http://localhost:3000
   ```

## Environment Variables

### Backend (`smart-student-hub/backend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | prod | Set to `production` when deployed |
| `PORT` | no | Defaults to `5000` |
| `DATABASE_URL` | prod* | Postgres connection string. Takes precedence over `DB_*` |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | prod* | Used when `DATABASE_URL` is not set |
| `DB_SSL` | no | `true`/`false`. Defaults to on in production |
| `DB_POOL_MAX` | no | Pool size, defaults to `20` |
| `JWT_SECRET` | yes | 32+ random characters in production |
| `JWT_EXPIRES_IN` | no | Defaults to `7d` |
| `FRONTEND_URL` | prod | Public frontend URL. Used in share links and as the default CORS origin |
| `CORS_ORIGINS` | no | Comma-separated list of allowed browser origins, overrides `FRONTEND_URL` for CORS |
| `MAX_FILE_SIZE` | no | Upload limit in bytes, defaults to 10 MB |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | no | Needed only for scheduled report emails |
| `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD` | no | Used once by `npm run create:super-admin` |

\* Provide either `DATABASE_URL` or the full set of `DB_*` variables.

Generate a JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Frontend (`smart-student-hub/.env.local`)

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the API, no trailing slash. Baked in at build time |

## Production Deployment

### Database

Use a managed PostgreSQL instance (Neon, Supabase, Render, Railway, RDS) and copy its connection string into `DATABASE_URL`. SSL is enabled automatically when `NODE_ENV=production`.

### Backend API

Deploy `smart-student-hub/backend` to any Node host (Render, Railway, Fly.io, a VM with PM2).

- Build command: `npm ci --omit=dev`
- Start command: `npm start`
- Health check path: `/health` (returns `503` when the database is unreachable)
- Set `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET`, and `FRONTEND_URL`

With `NODE_ENV=production` the server:

- exits on startup if required variables are missing, `JWT_SECRET` is shorter than 32 characters, or the database is unreachable
- only accepts browser requests from `FRONTEND_URL` / `CORS_ORIGINS`
- sends security headers including HSTS and hides error details from responses
- shuts down gracefully on `SIGTERM`

## Default Super Admin

The API creates this account on first startup if it does not exist yet. Log in at `/login` and choose **Super Admin** as the account type.

| Field | Value |
| --- | --- |
| Email | `superadmin@smarthub.edu` |
| Password | `SuperAdmin@123` |

The credentials are defined in `smart-student-hub/backend/config/database.js`. Changing the password after first login is recommended, since it is public in this repository. A changed password is kept across restarts.

All other accounts (admins, faculty, students, recruiters) are created from the app.

Uploaded certificates are stored on local disk in `backend/uploads/`. On hosts with an ephemeral filesystem (Render, Railway, Heroku), attach a persistent disk mounted at that path or uploads will be lost on redeploy.

On a VM, run the API under PM2 behind nginx with HTTPS:

```bash
npm ci --omit=dev
NODE_ENV=production pm2 start server.js --name smart-student-hub-api
pm2 save
```

### Frontend

Deploy `smart-student-hub` to Vercel (set the project root directory to `smart-student-hub`) or any Node host.

- Build command: `npm run build`
- Start command: `npm start`
- Set `NEXT_PUBLIC_API_URL` to the deployed API URL before building

After both are live, set the API's `FRONTEND_URL` to the final frontend domain so CORS and share links match.

## Scripts

Frontend (`smart-student-hub`):

| Script | Description |
| --- | --- |
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

Backend (`smart-student-hub/backend`):

| Script | Description |
| --- | --- |
| `npm run dev` | API with nodemon |
| `npm start` | API for production |
| `npm run create:super-admin` | Create the first super admin from env variables |
| `npm run seed:users` | Demo accounts (development only) |
| `npm run seed:demo` | Demo dataset (development only, clears activity and job data first) |
