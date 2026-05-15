# Deployment Guide - TaskFlow AI

Complete production-grade deployment guide for TaskFlow AI SaaS application.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [GitHub Setup](#github-setup)
4. [Environment Variables Setup](#environment-variables-setup)
5. [Backend Deployment on Render](#backend-deployment-on-render)
6. [Frontend Deployment on Vercel](#frontend-deployment-on-vercel)
7. [Connecting Frontend with Backend](#connecting-frontend-with-backend)
8. [CORS Configuration](#cors-configuration)
9. [Domain Setup](#domain-setup)
10. [Production Testing](#production-testing)
11. [Post-Deployment Checklist](#post-deployment-checklist)
12. [Security Best Practices](#security-best-practices)
13. [Production Optimization Tips](#production-optimization-tips)
14. [Troubleshooting](#troubleshooting)
15. [Common Deployment Errors and Fixes](#common-deployment-errors-and-fixes)

---

## Prerequisites

Before deploying, ensure you have the following:

### Required Accounts
- **GitHub Account**: For version control and CI/CD
- **Vercel Account**: For frontend deployment (free tier available)
- **Render Account**: For backend deployment (free tier available)
- **Custom Domain** (optional): For branded URLs

### Required Tools
- **Git**: Version control system
  ```bash
  # Check if git is installed
  git --version
  ```

- **Node.js**: v18.x or higher (LTS recommended)
  ```bash
  # Check Node.js version
  node --version
  npm --version
  ```

- **PostgreSQL Client** (optional, for local testing)
  ```bash
  # Check if psql is installed
  psql --version
  ```

### Required Knowledge
- Basic command line operations
- Git fundamentals (commit, push, branch)
- Environment variable management
- Basic understanding of web deployment concepts

---

## Project Overview

### Architecture
```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │    Backend      │
│   (Next.js)     │◄────────│   (Express)     │
│   Vercel        │  HTTPS  │   Render        │
└─────────────────┘         └─────────────────┘
                                      │
                                      ▼
                              ┌─────────────────┐
                              │  PostgreSQL     │
                              │  Render DB      │
                              └─────────────────┘
```

### Directory Structure
```
TA-MS/
├── FrontEnd TA-MS/          # Next.js frontend (Vercel)
│   ├── .env.example
│   ├── .env.local           # Local environment
│   ├── next.config.ts
│   ├── vercel.json
│   ├── package.json
│   └── ...
├── Backend of TA-MS/        # Express backend (Render)
│   ├── .env.example
│   ├── .env                 # Local environment
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   ├── Dockerfile
│   └── ...
├── render.yaml              # Render blueprint
├── docker-compose.yml
└── Deploy.md                # This file
```

### Technology Stack
- **Frontend**: Next.js 16, React 19, TypeScript, TailwindCSS v4
- **Backend**: Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT with HTTP-only cookies
- **Deployment**: Vercel (frontend), Render (backend)

---

## GitHub Setup

### 1. Initialize Git Repository

If not already initialized:

```bash
cd "/run/media/ritesh/Project Data/MMIPL Projects/TA-MS"
git init
```

### 2. Create .gitignore

Ensure you have a proper `.gitignore` file to exclude sensitive files:

```bash
# FrontEnd TA-MS/.gitignore
.env.local
.env*.local
.next/
node_modules/
dist/
build/

# Backend of TA-MS/.gitignore
.env
node_modules/
dist/
build/
*.log
```

### 3. Stage and Commit Files

```bash
git add .
git commit -m "Initial commit: TaskFlow AI full stack application"
```

### 4. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it appropriately (e.g., `taskflow-ai`)
3. Choose **Public** or **Private** based on your preference
4. **Do not** initialize with README, .gitignore, or license (we already have these)

### 5. Connect Local Repository to GitHub

```bash
# Add remote repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 6. Verify GitHub Repository

- Visit your repository on GitHub
- Verify all files are uploaded
- Check that `.env` files are NOT committed (they should be in .gitignore)

---

## Environment Variables Setup

### Backend Environment Variables

Create environment variables for the backend on Render:

#### Required Variables

```env
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
COOKIE_SECRET=your-super-secret-cookie-key-minimum-32-characters
ACCESS_TOKEN_TTL_MINUTES=15
REFRESH_TOKEN_TTL_DAYS=7
BCRYPT_SALT_ROUNDS=12
SEED_USER_NAME=TaskFlow Admin
SEED_USER_EMAIL=admin@yourdomain.com
SEED_USER_PASSWORD=YourSecurePassword123!
```

#### Variable Descriptions

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Backend port (Render sets this automatically) | `4000` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-app.vercel.app` |
| `DATABASE_URL` | PostgreSQL connection string | Provided by Render |
| `JWT_SECRET` | Secret for JWT token signing | Generate secure random string |
| `COOKIE_SECRET` | Secret for cookie signing | Generate secure random string |
| `ACCESS_TOKEN_TTL_MINUTES` | Access token lifetime in minutes | `15` |
| `REFRESH_TOKEN_TTL_DAYS` | Refresh token lifetime in days | `7` |
| `BCRYPT_SALT_ROUNDS` | Password hashing strength | `12` |
| `SEED_USER_NAME` | Default admin user name | `TaskFlow Admin` |
| `SEED_USER_EMAIL` | Default admin email | `admin@example.com` |
| `SEED_USER_PASSWORD` | Default admin password | Use strong password |

### Frontend Environment Variables

Create environment variables for the frontend on Vercel:

#### Required Variables

```env
NEXT_PUBLIC_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api
NEXT_PUBLIC_SITE_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
```

#### Variable Descriptions

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | `https://your-api.onrender.com/api` |
| `NEXT_PUBLIC_SITE_URL` | Frontend URL for redirects | `https://your-app.vercel.app` |

### Security Best Practices for Environment Variables

1. **Never commit `.env` files** to Git
2. **Use strong secrets** - minimum 32 characters for JWT and COOKIE secrets
3. **Rotate secrets regularly** in production
4. **Use different secrets** for development and production
5. **Limit access** to environment variables in team settings

### Generating Secure Secrets

Use these commands to generate secure secrets:

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate COOKIE_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Backend Deployment on Render

### Option 1: Using Render Blueprint (Recommended)

#### 1. Review render.yaml

The `render.yaml` file in your project root defines the Render deployment:

```yaml
services:
  - type: web
    name: taskflow-backend
    env: node
    plan: free
    buildCommand: npm ci && npm run build
    startCommand: npm run start
    preDeployCommand: npm run db:migrate && npm run db:seed
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 4000
      - key: FRONTEND_URL
        sync: false
      - key: DATABASE_URL
        fromDatabase:
          name: taskflow-db
          property: connectionString
      - key: JWT_SECRET
        sync: false
      - key: COOKIE_SECRET
        sync: false
      - key: ACCESS_TOKEN_TTL_MINUTES
        value: 15
      - key: REFRESH_TOKEN_TTL_DAYS
        value: 7
      - key: BCRYPT_SALT_ROUNDS
        value: 12
      - key: SEED_USER_NAME
        sync: false
      - key: SEED_USER_EMAIL
        sync: false
      - key: SEED_USER_PASSWORD
        sync: false

databases:
  - name: taskflow-db
    databaseName: taskflow_ai
    user: taskflow_user
    plan: free
```

#### 2. Deploy via Render Blueprint

1. Log in to [Render](https://render.com)
2. Go to **Dashboard** → **New** → **Blueprint**
3. Connect your GitHub repository
4. Render will detect `render.yaml` automatically
5. Review the configuration and click **Apply**

#### 3. Set Manual Environment Variables

After deployment, set the variables marked with `sync: false`:

1. Go to your backend service in Render Dashboard
2. Navigate to **Environment** tab
3. Add the following variables:

```env
FRONTEND_URL=https://your-frontend-domain.vercel.app
JWT_SECRET=your-generated-jwt-secret
COOKIE_SECRET=your-generated-cookie-secret
SEED_USER_NAME=TaskFlow Admin
SEED_USER_EMAIL=admin@yourdomain.com
SEED_USER_PASSWORD=YourSecurePassword123!
```

4. Click **Save Changes**
5. Render will automatically redeploy with new variables

### Option 2: Manual Deployment

#### 1. Create Web Service

1. Log in to [Render](https://render.com)
2. Go to **Dashboard** → **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:

   - **Name**: `taskflow-backend`
   - **Region**: Choose nearest to your users
   - **Branch**: `main`
   - **Root Directory**: `Backend of TA-MS`
   - **Runtime**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start`

5. Click **Advanced** → **Pre-deploy command**:
   ```
   npm run db:migrate && npm run db:seed
   ```

#### 2. Create PostgreSQL Database

1. Go to **Dashboard** → **New** → **PostgreSQL**
2. Configure:
   - **Name**: `taskflow-db`
   - **Database Name**: `taskflow_ai`
   - **User**: `taskflow_user`
   - **Region**: Same as web service
   - **Plan**: Free (or paid for production)

3. Click **Create Database**

#### 3. Connect Database to Web Service

1. Go to your web service
2. Navigate to **Environment** tab
3. Find `DATABASE_URL` variable
4. Click **Connect** → Select `taskflow-db`
5. Render will automatically set the connection string

#### 4. Set Remaining Environment Variables

Add all other required environment variables as described in the [Environment Variables Setup](#environment-variables-setup) section.

### Backend Build and Start Commands

#### package.json Scripts

Ensure your `Backend of TA-MS/package.json` has these scripts:

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate deploy",
    "db:migrate:dev": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:push": "prisma db push"
  }
}
```

### Backend Health Checks

Render uses health checks to ensure your service is running:

- **Health Route**: `GET /api/health`
- **Liveness Route**: `GET /api/live`
- **Readiness Route**: `GET /api/ready`

These routes are already implemented in your backend.

### Monitoring Backend Deployment

1. Go to your service in Render Dashboard
2. View **Logs** tab for real-time logs
3. Monitor **Events** tab for deployment history
4. Check **Metrics** tab for performance metrics

---

## Frontend Deployment on Vercel

### Option 1: Using Vercel CLI (Recommended)

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

#### 3. Deploy Frontend

```bash
cd "FrontEnd TA-MS"
vercel
```

Follow the prompts:

- **Set up and deploy?** → `Yes`
- **Which scope?** → Select your account
- **Link to existing project?** → `No`
- **What's your project's name?** → `taskflow-frontend`
- **In which directory is your code located?** → `./`
- **Want to override the settings?** → `No`

#### 4. Set Environment Variables in Vercel CLI

```bash
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-backend.onrender.com/api

vercel env add NEXT_PUBLIC_SITE_URL production
# Enter: https://your-frontend.vercel.app
```

#### 5. Deploy to Production

```bash
vercel --prod
```

### Option 2: Using Vercel Dashboard

#### 1. Import Project

1. Log in to [Vercel](https://vercel.com)
2. Go to **Dashboard** → **Add New** → **Project**
3. Import your GitHub repository
4. Select `FrontEnd TA-MS` as the **Root Directory**
5. Click **Import**

#### 2. Configure Project Settings

Vercel will auto-detect Next.js settings. Verify:

- **Framework Preset**: Next.js
- **Root Directory**: `FrontEnd TA-MS`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

#### 3. Set Environment Variables

1. Navigate to **Settings** → **Environment Variables**
2. Add the following variables:

   | Name | Value | Environments |
   |------|-------|--------------|
   | `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com/api` | Production, Preview, Development |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-frontend.vercel.app` | Production, Preview, Development |

3. Click **Save**
4. Redeploy to apply changes: **Deployments** → **Redeploy**

### Frontend Build and Start Commands

#### package.json Scripts

Ensure your `FrontEnd TA-MS/package.json` has these scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### Vercel Configuration Files

#### vercel.json

Your project includes `vercel.json` for additional configuration:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend.onrender.com/api/:path*"
    }
  ]
}
```

#### next.config.ts

Your `next.config.ts` includes rewrites for API proxying:

```typescript
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL + '/:path*',
      },
    ];
  },
};
```

### Monitoring Frontend Deployment

1. Go to your project in Vercel Dashboard
2. View **Deployments** tab for deployment history
3. Click on a deployment to view:
   - **Build Logs**
   - **Function Logs**
   - **Server Logs**

---

## Connecting Frontend with Backend

### API URL Configuration

The frontend connects to the backend through environment variables:

#### Development (Local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Production
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_SITE_URL=https://your-frontend.vercel.app
```

### API Proxy Configuration

Your Next.js app uses rewrites to proxy API requests:

1. **Browser requests** to `/api/*` are proxied to the backend
2. **Server-side requests** use `NEXT_PUBLIC_API_URL` directly
3. **App routes** use the backend URL for server-side calls

### Testing the Connection

#### 1. Test Backend Health

```bash
curl https://your-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 2. Test Frontend API Proxy

```bash
curl https://your-frontend.vercel.app/api/health
```

This should return the same response as the backend health check.

#### 3. Test Authentication Flow

1. Open your frontend in a browser
2. Navigate to the login page
3. Enter credentials (use seeded admin user)
4. Verify you can successfully log in
5. Check browser DevTools → Application → Cookies for:
   - `tf_access` (HTTP-only cookie)
   - `tf_refresh` (HTTP-only cookie)

### CORS Configuration

Your backend is configured to allow requests from the frontend:

#### Backend CORS Settings

In `Backend of TA-MS/src/app.ts`:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

Ensure `FRONTEND_URL` is set correctly in Render environment variables.

---

## CORS Configuration

### Understanding CORS

Cross-Origin Resource Sharing (CORS) is a security feature that restricts API calls from different domains.

### Common CORS Issues

#### Issue 1: CORS Policy Error

**Error**: 
```
Access to fetch at 'https://your-backend.onrender.com/api/auth/login' 
from origin 'https://your-frontend.vercel.app' has been blocked by CORS policy
```

**Solution**:
1. Verify `FRONTEND_URL` in Render backend environment variables
2. Ensure it matches your Vercel domain exactly (including `https://`)
3. Redeploy backend after updating

#### Issue 2: Credentials Not Allowed

**Error**:
```
Credentials flag is true, but the Access-Control-Allow-Credentials header is '*'
```

**Solution**:
Ensure your backend CORS configuration includes:
```typescript
credentials: true
```

And the origin is NOT a wildcard (`*`).

### Testing CORS

Use this curl command to test CORS headers:

```bash
curl -I -X OPTIONS https://your-backend.onrender.com/api/auth/login \
  -H "Origin: https://your-frontend.vercel.app" \
  -H "Access-Control-Request-Method: POST"
```

Expected headers:
```
Access-Control-Allow-Origin: https://your-frontend.vercel.app
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
```

---

## Domain Setup

### Custom Domain for Vercel (Frontend)

#### 1. Add Custom Domain

1. Go to your Vercel project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `app.yourdomain.com`)
4. Click **Add**

#### 2. Configure DNS

Vercel will provide DNS records. Add them to your domain registrar:

| Type | Name | Value |
|------|------|-------|
| CNAME | app | cname.vercel-dns.com |

#### 3. Verify Domain

1. Wait for DNS propagation (usually 5-30 minutes)
2. Vercel will automatically verify
3. Enable HTTPS (automatic)

#### 4. Update Environment Variables

Update `NEXT_PUBLIC_SITE_URL` in Vercel:
```env
NEXT_PUBLIC_SITE_URL=https://app.yourdomain.com
```

### Custom Domain for Render (Backend)

#### 1. Add Custom Domain

1. Go to your Render service → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `api.yourdomain.com`)
4. Click **Add**

#### 2. Configure DNS

Render will provide DNS records. Add them to your domain registrar:

| Type | Name | Value |
|------|------|-------|
| CNAME | api | your-service.onrender.com |

#### 3. Update Frontend Configuration

Update `NEXT_PUBLIC_API_URL` in Vercel:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

#### 4. Update Backend CORS

Update `FRONTEND_URL` in Render:
```env
FRONTEND_URL=https://app.yourdomain.com
```

### SSL/TLS Certificates

Both Vercel and Render provide automatic SSL/TLS certificates:
- **Vercel**: Automatic HTTPS for all domains
- **Render**: Automatic HTTPS for all domains

No manual configuration required.

---

## Production Testing

### Pre-Deployment Testing Checklist

#### Backend Tests

```bash
cd "Backend of TA-MS"

# Run linter
npm run lint

# Run type check
npm run build

# Run tests (if available)
npm test

# Test database connection
npm run db:migrate
```

#### Frontend Tests

```bash
cd "FrontEnd TA-MS"

# Run linter
npm run lint

# Run type check
npm run build

# Run tests (if available)
npm test
```

### Post-Deployment Testing

#### 1. Health Check Endpoints

```bash
# Backend health
curl https://your-backend.onrender.com/api/health

# Backend liveness
curl https://your-backend.onrender.com/api/live

# Backend readiness
curl https://your-backend.onrender.com/api/ready
```

#### 2. Authentication Flow

1. Navigate to frontend URL
2. Attempt to login with seeded admin credentials
3. Verify cookies are set correctly
4. Test refresh token flow
5. Test logout functionality

#### 3. API Endpoints

Test key endpoints:

```bash
# Login
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"YourPassword123!"}' \
  -c cookies.txt

# Get session
curl https://your-backend.onrender.com/api/auth/me \
  -b cookies.txt

# Logout
curl -X POST https://your-backend.onrender.com/api/auth/logout \
  -b cookies.txt
```

#### 4. Database Operations

1. Create a test task
2. Update the task
3. Delete the task
4. Verify all operations persist

#### 5. Cross-Origin Testing

1. Open browser DevTools
2. Navigate to Network tab
3. Perform API calls
4. Verify no CORS errors
5. Check response headers

#### 6. Performance Testing

Use tools like:
- **Lighthouse**: `https://pagespeed.web.dev/`
- **WebPageTest**: `https://www.webpagetest.org/`

#### 7. Mobile Testing

1. Test on mobile devices
2. Test responsive design
3. Test touch interactions
4. Test PWA functionality

---

## Post-Deployment Checklist

### Immediate Actions

- [ ] Backend health endpoint returns 200 OK
- [ ] Frontend loads without errors
- [ ] Authentication flow works correctly
- [ ] Database migrations ran successfully
- [ ] Environment variables are set correctly
- [ ] CORS is configured properly
- [ ] SSL/TLS certificates are active
- [ ] Custom domains (if used) are resolving

### Configuration Verification

- [ ] `FRONTEND_URL` in Render matches Vercel domain
- [ ] `NEXT_PUBLIC_API_URL` in Vercel matches Render domain
- [ ] `NEXT_PUBLIC_SITE_URL` in Vercel is correct
- [ ] JWT_SECRET and COOKIE_SECRET are set and secure
- [ ] Database connection string is correct
- [ ] Seed user credentials are documented

### Security Verification

- [ ] `.env` files are NOT in Git repository
- [ ] API endpoints require authentication where needed
- [ ] HTTP-only cookies are used for tokens
- [ ] CORS is restricted to frontend domain only
- [ ] Security headers are set (X-Frame-Options, etc.)
- [ ] Rate limiting is enabled (if applicable)

### Monitoring Setup

- [ ] Render logs are accessible
- [ ] Vercel logs are accessible
- [ ] Error tracking is configured (if using Sentry, etc.)
- [ ] Uptime monitoring is set up (if using Pingdom, etc.)

### Documentation

- [ ] Update README with production URLs
- [ ] Document admin credentials securely
- [ ] Document environment variables
- [ ] Create runbook for common issues

---

## Security Best Practices

### 1. Environment Variables

- **Never commit** `.env` files to version control
- **Use different secrets** for development and production
- **Rotate secrets** regularly (every 90 days recommended)
- **Use strong secrets** (minimum 32 characters)
- **Limit access** to environment variables in team settings

### 2. Authentication & Authorization

- **Use HTTP-only cookies** for JWT tokens
- **Set secure flag** on cookies (HTTPS only)
- **Set SameSite=Strict** on cookies
- **Implement token expiration** (access tokens: 15 min, refresh tokens: 7 days)
- **Use strong password policies** (minimum 12 characters, mixed case, numbers, symbols)
- **Implement rate limiting** on authentication endpoints

### 3. API Security

- **Validate all inputs** on the server side
- **Use parameterized queries** (Prisma handles this)
- **Implement CORS** restrictions
- **Set security headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Use HTTPS only** in production
- **Implement rate limiting** on API endpoints

### 4. Database Security

- **Use strong database passwords**
- **Restrict database access** to Render IP ranges only
- **Enable SSL** for database connections
- **Regular backups** (Render handles this automatically)
- **Principle of least privilege** for database users

### 5. Dependency Management

- **Keep dependencies updated**
- **Use `npm audit`** to check for vulnerabilities
- **Lock dependency versions** in `package-lock.json`
- **Review security advisories** for used packages

### 6. Logging & Monitoring

- **Never log sensitive data** (passwords, tokens, PII)
- **Implement structured logging**
- **Monitor error rates**
- **Set up alerts** for critical failures
- **Regular log review**

### 7. Code Security

- **Use TypeScript** for type safety
- **Enable strict mode** in TypeScript
- **Run linters** before deployment
- **Conduct code reviews**
- **Use security linters** (e.g., ESLint security plugins)

---

## Production Optimization Tips

### Frontend Optimization

#### 1. Image Optimization

Next.js automatically optimizes images. Ensure you use:

```typescript
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority // For above-the-fold images
/>
```

#### 2. Code Splitting

Next.js automatically splits code by routes. For additional splitting:

```typescript
// Dynamic import for heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
});
```

#### 3. Caching Strategy

Configure caching in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/static/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### 4. Bundle Size Optimization

- Analyze bundle size: `npm run build` includes bundle analysis
- Remove unused dependencies
- Use tree-shaking
- Minimize third-party libraries

#### 5. Font Optimization

Use `next/font` for automatic font optimization:

```typescript
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
```

### Backend Optimization

#### 1. Database Connection Pooling

Prisma handles connection pooling. Configure in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connection_limit = 10
}
```

#### 2. Response Compression

Express compression is typically handled by Vercel/Render. For manual control:

```typescript
import compression from 'compression';
app.use(compression());
```

#### 3. Caching Strategy

Implement Redis caching for frequently accessed data:

```typescript
// Example caching middleware
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function cacheMiddleware(req, res, next) {
  const key = req.originalUrl;
  const cached = await redis.get(key);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  next();
}
```

#### 4. Query Optimization

- Use Prisma's `select` to fetch only needed fields
- Implement pagination for large datasets
- Use database indexes for frequently queried fields
- Avoid N+1 queries with Prisma's `include`

#### 5. Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### Infrastructure Optimization

#### 1. CDN Usage

- Vercel automatically uses a global CDN
- Render uses a CDN for static assets
- Ensure static assets are properly cached

#### 2. Database Optimization

- Use Render's paid PostgreSQL tier for production
- Enable read replicas for high-traffic applications
- Regular database maintenance (VACUUM, ANALYZE)

#### 3. Monitoring

- Set up Render's metrics dashboard
- Use Vercel Analytics for frontend performance
- Implement error tracking (Sentry, Rollbar)

---

## Troubleshooting

### Backend Issues

#### Issue: Backend Won't Start

**Symptoms**: Render deployment fails, service shows "Crashed"

**Steps**:
1. Check Render logs for error messages
2. Verify build command: `npm ci && npm run build`
3. Verify start command: `npm run start`
4. Check TypeScript compilation errors
5. Verify all environment variables are set
6. Check database connection string

**Common Fixes**:
```bash
# Local build test
cd "Backend of TA-MS"
npm run build
npm run start
```

#### Issue: Database Migration Fails

**Symptoms**: Pre-deploy command fails, database errors in logs

**Steps**:
1. Check `DATABASE_URL` is correct
2. Verify database is accessible
3. Check migration files in `prisma/migrations`
4. Run migrations locally first:
```bash
cd "Backend of TA-MS"
npm run db:migrate:dev
```

#### Issue: CORS Errors

**Symptoms**: Browser shows CORS policy errors

**Steps**:
1. Verify `FRONTEND_URL` in Render environment variables
2. Check CORS configuration in backend code
3. Ensure origin matches exactly (including `https://`)
4. Redeploy backend after changes

### Frontend Issues

#### Issue: Build Fails

**Symptoms**: Vercel deployment fails during build

**Steps**:
1. Check Vercel build logs
2. Verify build command: `npm run build`
3. Check TypeScript errors
4. Verify all dependencies are in `package.json`
5. Test build locally:
```bash
cd "FrontEnd TA-MS"
npm run build
```

#### Issue: API Calls Fail

**Symptoms**: Frontend loads but API calls fail

**Steps**:
1. Check `NEXT_PUBLIC_API_URL` in Vercel
2. Verify backend is accessible
3. Test backend health endpoint
4. Check browser console for errors
5. Check Network tab for failed requests

#### Issue: Environment Variables Not Working

**Symptoms**: App behaves as if variables are missing

**Steps**:
1. Verify variables are set in Vercel dashboard
2. Ensure variable names start with `NEXT_PUBLIC_` for frontend
3. Redeploy after adding variables
4. Check build logs for variable usage

### Database Issues

#### Issue: Database Connection Refused

**Symptoms**: Backend can't connect to database

**Steps**:
1. Verify `DATABASE_URL` is correct
2. Check database is running in Render
3. Verify database credentials
4. Check Render database logs

#### Issue: Seed User Not Created

**Symptoms**: Can't login with seeded credentials

**Steps**:
1. Check seed script ran successfully
2. Verify `SEED_USER_*` environment variables
3. Check database for user record
4. Manually run seed if needed:
```bash
cd "Backend of TA-MS"
npm run db:seed
```

### SSL/TLS Issues

#### Issue: Mixed Content Errors

**Symptoms**: Browser blocks mixed HTTP/HTTPS content

**Steps**:
1. Ensure all URLs use HTTPS
2. Update `NEXT_PUBLIC_API_URL` to use HTTPS
3. Update `FRONTEND_URL` to use HTTPS
4. Clear browser cache

#### Issue: Certificate Errors

**Symptoms**: Browser shows certificate warnings

**Steps**:
1. Wait for certificate propagation (up to 24 hours)
2. Verify domain DNS configuration
3. Check SSL/TLS status in Vercel/Render
4. Contact support if issues persist

---

## Common Deployment Errors and Fixes

### Error 1: "Module not found"

**Error Message**:
```
Module not found: Can't resolve '@/components/Header'
```

**Cause**: Import path alias not configured correctly

**Fix**:
1. Check `tsconfig.json` for path aliases
2. Verify `next.config.ts` includes path configuration
3. Ensure file exists at specified path

### Error 2: "EADDRINUSE: address already in use"

**Error Message**:
```
Error: listen EADDRINUSE: address already in use :::4000
```

**Cause**: Port already in use (usually local development)

**Fix**:
```bash
# Find and kill process using port 4000
lsof -ti:4000 | xargs kill -9

# Or use different port
PORT=4001 npm run dev
```

### Error 3: "Prisma Client is not initialized"

**Error Message**:
```
Error: Prisma Client is not initialized
```

**Cause**: Prisma client not generated

**Fix**:
```bash
cd "Backend of TA-MS"
npm run db:generate
npm run build
```

### Error 4: "JWT signature verification failed"

**Error Message**:
```
JsonWebTokenError: jwt signature verification failed
```

**Cause**: JWT_SECRET mismatch between services

**Fix**:
1. Ensure `JWT_SECRET` is same across all environments
2. Regenerate tokens after changing secret
3. Clear cookies in browser

### Error 5: "Connection timeout"

**Error Message**:
```
Error: Connection timeout
```

**Cause**: Database or API unreachable

**Fix**:
1. Check network connectivity
2. Verify service is running
3. Check firewall rules
4. Verify correct URLs

### Error 6: "Out of memory"

**Error Message**:
```
JavaScript heap out of memory
```

**Cause**: Memory limit exceeded during build

**Fix**:
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Error 7: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Error Message**:
```
Access to fetch has been blocked by CORS policy
```

**Cause**: CORS not configured on backend

**Fix**:
1. Add CORS middleware to Express
2. Set `FRONTEND_URL` environment variable
3. Redeploy backend

### Error 8: "404 Not Found" on API routes

**Error Message**:
```
404 Not Found on /api/endpoint
```

**Cause**: Route not defined or incorrect path

**Fix**:
1. Verify route exists in backend
2. Check route path matches exactly
3. Ensure route is registered before server starts

### Error 9: "500 Internal Server Error"

**Error Message**:
```
500 Internal Server Error
```

**Cause**: Server-side error

**Fix**:
1. Check backend logs for error details
2. Verify database connection
3. Check for unhandled exceptions
4. Add error handling middleware

### Error 10: "Deployment failed: Build script exited with code 1"

**Error Message**:
```
Deployment failed: Build script exited with code 1
```

**Cause**: Build command failed

**Fix**:
1. Run build command locally to reproduce
2. Fix build errors
3. Verify all dependencies are installed
4. Check for TypeScript errors

---

## Quick Reference Commands

### Git Commands

```bash
# Initialize repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Your commit message"

# Add remote
git remote add origin https://github.com/USERNAME/REPO.git

# Push to GitHub
git push -u origin main

# Pull latest changes
git pull origin main

# Create new branch
git checkout -b feature/your-feature

# Merge branch
git checkout main
git merge feature/your-feature
```

### Backend Commands

```bash
cd "Backend of TA-MS"

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

### Frontend Commands

```bash
cd "FrontEnd TA-MS"

# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

### Vercel Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Set environment variable
vercel env add VARIABLE_NAME production

# List environment variables
vercel env ls

# Pull environment variables
vercel env pull .env.local
```

### Render Commands

```bash
# Render uses GitHub integration
# No CLI commands needed for basic deployment

# For advanced usage, install Render CLI
npm install -g render

# Login
render login

# Deploy
render deploy
```

---

## Support and Resources

### Documentation

- **Next.js**: https://nextjs.org/docs
- **Vercel**: https://vercel.com/docs
- **Express**: https://expressjs.com/
- **Prisma**: https://www.prisma.io/docs
- **Render**: https://render.com/docs

### Community

- **Next.js GitHub**: https://github.com/vercel/next.js
- **Vercel Discord**: https://vercel.com/discord
- **Render Community**: https://community.render.com
- **Stack Overflow**: Tag questions with `nextjs`, `vercel`, `render`

### Monitoring Tools

- **Vercel Analytics**: Built-in to Vercel
- **Render Metrics**: Built-in to Render
- **Sentry**: Error tracking (https://sentry.io)
- **LogRocket**: Session replay (https://logrocket.com)

---

## Conclusion

This deployment guide covers the complete process for deploying TaskFlow AI to production using Vercel (frontend) and Render (backend). Follow each section carefully to ensure a successful deployment.

### Key Takeaways

1. **Environment variables** are critical - set them correctly and securely
2. **CORS configuration** must match your frontend domain exactly
3. **Test thoroughly** before and after deployment
4. **Monitor logs** to catch issues early
5. **Follow security best practices** to protect your application

### Next Steps

1. Complete the deployment following this guide
2. Perform thorough testing in production
3. Set up monitoring and alerting
4. Configure custom domains (if desired)
5. Document any custom configurations for your team

### Need Help?

If you encounter issues not covered in this guide:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review service logs (Vercel/Render)
3. Consult official documentation
4. Search community forums
5. Open a support ticket with the respective platform

---

**Last Updated**: January 2025
**Version**: 1.0.0
