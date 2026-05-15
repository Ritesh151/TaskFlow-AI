# TaskFlow AI

Production-ready monorepo for a secure productivity SaaS:

- Frontend: Next.js 16, React 19, TypeScript, TailwindCSS v4, Vercel-ready
- Backend: Express, TypeScript, Prisma, PostgreSQL, Render-ready
- Features: tasks, attendance, second-brain notes, local intelligence, JWT auth, PWA support

## Project Structure

```text
FrontEnd TA-MS/   Next.js app for Vercel
Backend of TA-MS/ Express + Prisma API for Render
render.yaml       Render blueprint
docker-compose.yml
.github/workflows/
```

## Local Setup

1. Copy environment files.

```bash
cp "FrontEnd TA-MS/.env.example" "FrontEnd TA-MS/.env.local"
cp "Backend of TA-MS/.env.example" "Backend of TA-MS/.env"
```

2. Set the backend database and secrets in `Backend of TA-MS/.env`.

Required backend variables:

```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskflow_ai
JWT_SECRET=change-this-jwt-secret-to-at-least-32-characters
COOKIE_SECRET=change-this-cookie-secret
ACCESS_TOKEN_TTL_MINUTES=15
REFRESH_TOKEN_TTL_DAYS=7
BCRYPT_SALT_ROUNDS=12
SEED_USER_NAME=TaskFlow Admin
SEED_USER_EMAIL=admin@example.com
SEED_USER_PASSWORD=ChangeMe123!
```

Required frontend variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Install dependencies.

```bash
cd "Backend of TA-MS" && npm install
cd "../FrontEnd TA-MS" && npm install
```

4. Start PostgreSQL, run migrations, seed the default user, then boot both apps.

```bash
cd "Backend of TA-MS"
npm run db:migrate:dev
npm run db:seed
npm run dev
```

```bash
cd "FrontEnd TA-MS"
npm run dev
```

Frontend runs on `http://localhost:3000`.
Backend runs on `http://localhost:4000`.

## Prisma Commands

```bash
cd "Backend of TA-MS"
npm run db:generate
npm run db:migrate:dev
npm run db:migrate
npm run db:push
npm run db:seed
```

Schema: `Backend of TA-MS/prisma/schema.prisma`

## Production Build Commands

Frontend:

```bash
cd "FrontEnd TA-MS"
npm run build
npm run start
```

Backend:

```bash
cd "Backend of TA-MS"
npm run build
npm run start
```

## Vercel Deployment

1. Import `FrontEnd TA-MS` as the Vercel project root.
2. Set these environment variables in Vercel:

```env
NEXT_PUBLIC_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api
NEXT_PUBLIC_SITE_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
```

3. Deploy.

Notes:

- Browser API calls stay same-origin at `/api`.
- `next.config.ts` rewrites `/api/:path*` to the Render backend using `NEXT_PUBLIC_API_URL`.
- `vercel.json` adds security and cache headers.
- `proxy.ts` protects app routes by checking the refresh cookie.

Key frontend deployment files:

- `FrontEnd TA-MS/next.config.ts`
- `FrontEnd TA-MS/vercel.json`
- `FrontEnd TA-MS/app/manifest.ts`
- `FrontEnd TA-MS/public/sw.js`

## Render Deployment

1. Create a Render Blueprint from `render.yaml`.
2. Render provisions:
   - one Node web service
   - one PostgreSQL database
3. Set these manual values in Render where `sync: false` is used:

```env
FRONTEND_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
SEED_USER_EMAIL=admin@example.com
SEED_USER_PASSWORD=ChangeMe123!
```

Render runtime behavior:

- Build command: `npm ci && npm run build`
- Pre-deploy command: `npm run db:migrate && npm run db:seed`
- Start command: `npm run start`
- Health route: `/api/ready`
- Port binding: `process.env.PORT`

Key backend deployment files:

- `render.yaml`
- `Backend of TA-MS/src/index.ts`
- `Backend of TA-MS/src/app.ts`

## PostgreSQL Setup

Any PostgreSQL provider works locally. Example local database:

```bash
createdb taskflow_ai
```

Example connection string:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskflow_ai
```

The backend uses Prisma migrations and seeds the default admin user from environment variables.

## Docker

Build and run the full stack with PostgreSQL:

```bash
docker compose up --build
```

Files:

- `docker-compose.yml`
- `FrontEnd TA-MS/Dockerfile`
- `Backend of TA-MS/Dockerfile`

## CI/CD

Workflows:

- `.github/workflows/ci.yml`: lint, build, and test both apps
- `.github/workflows/deploy.yml`: deploy frontend to Vercel and trigger backend deploy on Render

Required GitHub secrets:

```env
VERCEL_TOKEN=
VERCEL_ORG_ID=
VERCEL_PROJECT_ID=
RENDER_DEPLOY_HOOK_URL=
```

## Default Auth Flow

- Login endpoint: `POST /api/auth/login`
- Refresh endpoint: `POST /api/auth/refresh`
- Logout endpoint: `POST /api/auth/logout`
- Session endpoint: `GET /api/auth/me`

Cookies:

- `tf_access`: HTTP-only, signed, SameSite=Strict
- `tf_refresh`: HTTP-only, signed, SameSite=Strict

The frontend stores only non-sensitive session metadata in local storage for UX countdowns. Tokens remain in secure cookies.

## Health Routes

```text
GET /api/health
GET /api/live
GET /api/ready
```

## Notes

- Old JSON files remain in `Backend of TA-MS/data/` for seed import and backward migration.
- The frontend PWA shell, manifest, offline page, and service worker are already included.
- The backend is strict-mode TypeScript with centralized validation, logging, auth, and error handling.
