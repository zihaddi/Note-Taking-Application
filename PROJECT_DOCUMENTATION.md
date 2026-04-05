# Project Documentation
## NoteApp — Full-Stack (Node.js + Nuxt 4 + MongoDB)

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [How MongoDB is Connected](#2-how-mongodb-is-connected)
3. [Architecture & Module Breakdown](#3-architecture--module-breakdown)
4. [Authentication & RBAC Flow](#4-authentication--rbac-flow)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Interview Q&A — Logic & Codebase](#6-interview-qa--logic--codebase)
7. [Free Deployment Guide](#7-free-deployment-guide)

---

## 1. Project Overview

This is a **full-stack RBAC (Role-Based Access Control) Task/Note app** with two separate projects:

| Layer | Tech | Folder |
|---|---|---|
| Backend API | Node.js + Express 5 + Mongoose | `task_backend/` |
| Frontend | Nuxt 4 + Vue 3 + TypeScript + PrimeVue | `task_client/` |
| Database | MongoDB (local) | `task_notes_db` |

**Features:**
- User registration/login with JWT (7-day token, stored in HTTP cookie)
- Admin and User roles with separate panel layouts
- Dynamic sidebar menus fetched from DB per role
- Full Permission & Role management (CRUD) via admin panel
- Notes and Posts management per user
- CORS-aware API with centralized error handling

---

## 2. How MongoDB is Connected

### Step-by-step connection flow

**Step 1 — Configure the URI**

File: `task_backend/.env` (copy from `.env.example`)
```
MONGODB_URI=mongodb://localhost:27017/task_notes_db
```
The database name is `task_notes_db`. MongoDB creates it automatically on first write.

**Step 2 — Connection function**

File: `task_backend/src/config/database.js`
```js
const mongoose = require("mongoose")

async function connectDB() {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/task_notes_db"
    await mongoose.connect(uri)                    // opens a connection pool
    // + error / disconnected event listeners
}
```
Mongoose does NOT create multiple connections. It opens a **single connection pool** shared across all models.

**Step 3 — Entry point calls connectDB first**

File: `task_backend/src/server.js`
```js
require("dotenv").config()           // loads .env into process.env
const { connectDB } = require("./config/database")

;(async () => {
    await connectDB()                // must succeed before accepting requests
    app.listen(PORT, ...)
})()
```
`connectDB()` is `await`-ed — if MongoDB is unreachable, the process exits (`process.exit(1)`) so the server never starts broken.

**Step 4 — Models define collections**

Each module has a Mongoose model. Mongoose uses the **model name** to derive the **collection name** (pluralised, lowercased):

| Model name | MongoDB collection |
|---|---|
| `User` | `users` |
| `Note` | `notes` |
| `Post` | `posts` |
| `Permission` | `permissions` |
| `Role` | `roles` |
| `MenuItem` | `menuitems` |

**Step 5 — Check your database**

To inspect the data directly:
```bash
# MongoDB Shell
mongosh
use task_notes_db
show collections
db.users.find().pretty()
db.menuitems.find().pretty()
```

Or use **MongoDB Compass** (GUI) → connect to `mongodb://localhost:27017` → open `task_notes_db`.

**Step 6 — Seed initial data**

```bash
cd task_backend
npm run seed
# or: node src/database/seeder.js
```
This creates: 4 users, 15 permissions, 2 roles, 11 menu items, sample notes/posts.

Credentials after seeding:
```
Admin:  admin@example.com  /  Admin@123
Users:  alice@example.com  /  User@123
```

---

## 3. Architecture & Module Breakdown

### Backend structure (Repository pattern)
```
task_backend/src/
├── server.js          ← Entry: loadEnv → connectDB → app.listen
├── app.js             ← Express setup: cors, json, routes, error handler
├── config/
│   ├── database.js    ← mongoose.connect() with env URI
│   └── jwt.js         ← generateToken() / verifyToken()
├── middleware/
│   ├── authenticate.js  ← Reads Authorization header, verifies JWT, sets req.user
│   ├── authorize.js     ← requireAdmin / requireUser / requirePermission()
│   └── validate.js      ← express-validator error formatter
├── modules/
│   ├── auth/            ← register, login, logout, me
│   ├── user/            ← CRUD users (admin), profile (user)
│   ├── note/            ← CRUD notes (scoped to userId)
│   ├── post/            ← CRUD posts (scoped to userId)
│   ├── permission/      ← CRUD permissions (admin only)
│   ├── role/            ← CRUD roles + assign permissions (admin only)
│   └── menu/            ← CRUD menus (admin) + GET /my-menus (authenticated)
├── repositories/        ← BaseRepository: findAll, findById, create, update, delete
├── services/            ← BaseService: wraps repository, business logic
├── traits/
│   └── ApiResponse.js   ← Unified JSON response helpers: success, error, paginate
└── database/
    └── seeder.js        ← Drops and re-creates all test data
```

### Each module follows this exact 4-file pattern:
```
module.model.js      → Mongoose schema + indexes
module.repository.js → DB queries (extends BaseRepository)
module.service.js    → Business logic (extends BaseService)
module.controller.js → Request/Response handling
module.routes.js     → Express Router with validation + middleware
```

### API response structure (all endpoints)
```json
// Success
{ "status": "success", "message": "...", "data": { ... } }

// Error
{ "status": "error", "message": "...", "errors": [...] }

// Paginated list
{ "status": "success", "data": { "data": [...], "meta": { "total": 100, "page": 1, "limit": 10 } } }
```

---

## 4. Authentication & RBAC Flow

### Login flow (step by step)

```
POST /api/auth/login
  → express-validator validates email + password
  → AuthService.login() → finds user by email (with password selected back on)
  → bcryptjs.compare(inputPassword, hashedPassword)
  → jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' })
  → returns { token, user }
```

Client stores token in an **HTTP cookie** (`app_token`, 7-day, `sameSite: lax`).

### Every protected request

```
Any protected route
  → authenticate middleware:
      reads Authorization: Bearer <token>
      jwt.verify(token, JWT_SECRET) → decodes { id, role }
      sets req.user = { id, role }
  → authorize middleware (if needed):
      checks roles.includes(req.user.role)
  → controller runs
```

### Permission check (granular RBAC)

```
requirePermission('users.delete')
  → loads Role from DB by req.user.role slug
  → populates role.permissions (array of Permission docs)
  → checks if any permission.slug === 'users.delete'
  → 403 if not found
```

### Role → Permission data model

```
Role document:
  { slug: "admin", permissions: [ObjectId, ObjectId, ...] }
                                        ↓  (populated)
Permission documents:
  { slug: "users.delete", module: "users", action: "delete" }
  { slug: "notes.view",   module: "notes", action: "view"   }
```

### Dynamic sidebar menus

```
GET /api/menus/my-menus   (requires authenticate)
  → MenuRepository.getForRole(req.user.role)
  → MongoDB query: { isActive: true, $or: [{ roles: {$size:0} }, { roles: roleSlug }] }
  → empty roles array = visible to all roles
  → returns items filtered by role, sorted by order

Client (admin.vue / user.vue):
  → receives array, filters by section === 'admin' (or 'user')
  → sorts by item.order
  → renders in sidebar as NuxtLink items
  → falls back to hardcoded list if API fails
```

---

## 5. Frontend Architecture

### Nuxt 4 structure
```
task_client/app/
├── app.vue              ← Root: NuxtLayout + NuxtPage
├── layouts/
│   ├── admin.vue        ← Sidebar + topbar for /admin-panel/* routes
│   └── user.vue         ← Sidebar + topbar for /dashboard/* routes
├── pages/
│   ├── index.vue        ← Landing page
│   ├── login.vue        ├── User login
│   ├── admin-login.vue  ├── Admin login
│   ├── admin-panel/     ← Admin pages (dashboard, users, notes, permissions, roles, menus)
│   └── dashboard/       ← User pages (home, notes, posts, profile)
├── composables/
│   ├── useAuth.ts       ← login/logout/register, JWT cookie, auth state
│   ├── useAuthApi.ts    ← raw API calls for auth endpoints
│   ├── useNotesApi.ts   ← CRUD for notes
│   ├── usePermissionsApi.ts ← CRUD for permissions (admin)
│   ├── useRolesApi.ts   ← CRUD for roles (admin)
│   └── useMenusApi.ts   ← CRUD for menus (admin) + getMyMenus
├── middleware/
│   ├── auth-admin.ts    ← redirects to /admin-login if not admin
│   ├── auth-user.ts     ← redirects to /login if not logged in
│   └── guest.ts         ← redirects logged-in users away from login page
├── stores/
│   └── auth.ts          ← Pinia store wrapping useAuth (SSR-safe)
├── utils/
│   └── $fetch.ts        ← $fetchApi: ofetch wrapper that auto-attaches Bearer token
└── types/
    └── index.ts         ← TypeScript interfaces: User, Note, Post, Permission, Role, MenuItem
```

### $fetchApi — how it attaches the JWT
```ts
// utils/$fetch.ts
const token = useCookie(TOKEN_KEY).value   // reads app_token cookie
headers["Authorization"] = `Bearer ${token}`
// then calls ofetch(API_BASE_URL + path, { headers, ...options })
```
Every composable calls `$fetchApi(...)` — no need to manually pass tokens anywhere.

### Route protection via Nuxt middleware
```ts
// pages/admin-panel/dashboard/index.vue
definePageMeta({ middleware: ['auth-admin'] })

// middleware/auth-admin.ts
if (!user || user.role !== 'admin') return navigateTo('/admin-login')
```

---

## 6. Interview Q&A — Logic & Codebase

### Q1: "Walk me through how a user logs in."
> User submits email + password → `POST /api/auth/login` → `express-validator` checks input → `AuthService.login()` finds user by email, uses `bcryptjs.compare()` for password check → `generateToken({ id, role })` signs JWT with `JWT_SECRET` → token returned → client stores it in a 7-day cookie (`app_token`) via `useCookie()` in `useAuth.ts` → all future requests attach it as `Authorization: Bearer <token>` via `$fetchApi`.

### Q2: "How does role-based access control work?"
> Two levels: (1) **Role-level** — the `authorize` middleware in `authorize.js` checks `roles.includes(req.user.role)`. Fast, no DB call. (2) **Permission-level** — `requirePermission('slug')` loads the `Role` doc from MongoDB, populates its `permissions` array, then checks if any `permission.slug` matches. This allows granular control like `users.delete` without hardcoding roles in every route.

### Q3: "Why MongoDB and Mongoose?"
> MongoDB's document model fits this app's flexible schema needs (e.g., `interests: [String]` on User, `roles: [String]` on MenuItem). Mongoose adds schema validation, type casting, middleware hooks (`pre('save')` for slug generation), and indexes. The connection is a single pooled connection managed by Mongoose, started once in `server.js` before the HTTP server opens.

### Q4: "Explain the Repository pattern you used."
> `BaseRepository` in `repositories/BaseRepository.js` provides generic `findAll`, `findById`, `create`, `update`, `delete` methods. Each module's repository (e.g., `NoteRepository`) extends it and only adds domain-specific queries like `findByUser(userId)`. The service layer calls repository methods and applies business logic. Controllers handle only HTTP request/response. This separates concerns and makes the code testable.

### Q5: "How do the dynamic sidebars work?"
> On layout mount (`onMounted`), the layout calls `getMyMenus()` → `GET /api/menus/my-menus` with the user's JWT → backend queries `MenuItem` collection filtering `isActive: true` and `roles` array containing the user's role slug → returns sorted items → client further filters by `section === 'admin'` or `section === 'user'` → renders `NuxtLink` items. If the API fails, a hardcoded fallback list is shown.

### Q6: "How is the frontend connected to the backend?"
> Nuxt's `runtimeConfig.public.API_BASE_URL` (set via env var) is read by `$fetchApi`. The wrapper uses `ofetch` library, attaches the JWT from the `app_token` cookie, and handles errors. All composables (`useNotesApi`, `useRolesApi`, etc.) call `$fetchApi` internally. On the server-side (SSR), request cookies are forwarded via `useRequestHeaders(['cookie'])`.

### Q7: "What happens if a JWT is expired?"
> The `authenticate` middleware catches `TokenExpiredError` from `jwt.verify()` and returns a `401 Unauthorized` with message "Token expired". On the client side, the `$fetchApi` wrapper throws a `FetchError` which pages handle in `try/catch`, typically redirecting to login via `clearAuth()` in `useAuth`.

### Q8: "How is the password stored securely?"
> Passwords are hashed using `bcryptjs` with a cost factor of 12 (meaning 2^12 = 4096 hash rounds). The `password` field in the User schema has `select: false` — it is **never returned in any query** unless explicitly requested with `.select('+password')`. Raw passwords never touch the DB.

---

## 7. Free Deployment Guide

### Architecture for free deployment

```
MongoDB Atlas (free)
       ↑  MONGODB_URI (connection string)
       |
task_backend  →  Render.com (free Web Service)
                        ↑  API_BASE_URL env var
                        |
task_client   →  Vercel (free)
```

---

### Step 1 — Deploy MongoDB (Atlas Free Tier)

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a **Free Cluster** (M0 Sandbox — 512 MB, always free)
4. Choose region closest to your backend server
5. Go to **Database Access** → Add a user → set username & password
6. Go to **Network Access** → Add IP Address → `0.0.0.0/0` (allow all, for deployment)
7. Go to **Clusters** → Connect → Connect your application → Copy the URI:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/task_notes_db?retryWrites=true&w=majority
   ```
8. Save this URI — you'll set it as an environment variable on Render.

---

### Step 2 — Deploy Backend (Render.com — Free)

1. Push your code to GitHub (if not already done)
2. Go to [https://render.com](https://render.com) → Sign up with GitHub
3. Click **New → Web Service**
4. Connect your GitHub repo
5. Configure:
   - **Root Directory**: `task_backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`  (runs `node src/server.js`)
   - **Environment**: `Node`
6. Add **Environment Variables**:
   ```
   APP_ENV=production
   APP_PORT=10000
   MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/task_notes_db
   JWT_SECRET=your-very-long-random-secret-key-here
   JWT_EXPIRES_IN=7d
   CLIENT_URL=https://your-app.vercel.app
   ```
7. Click **Create Web Service** → wait ~3 min for first deploy
8. Copy your Render URL: `https://your-app-name.onrender.com`

> **Note:** Free Render instances sleep after 15 min of inactivity and take ~30 sec to wake up. To keep it awake, use a free cron service like [cron-job.org](https://cron-job.org) to ping `https://your-app.onrender.com/up` every 10 minutes.

---

### Step 3 — Seed the Production Database

After deployment:
1. In Render dashboard → your service → **Shell** tab
2. Run:
   ```bash
   node src/database/seeder.js
   ```
Or run locally pointing to Atlas:
```bash
cd task_backend
MONGODB_URI="mongodb+srv://..." node src/database/seeder.js
```

---

### Step 4 — Deploy Frontend (Vercel — Free)

1. Go to [https://vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **Add New → Project**
3. Import your GitHub repo
4. Configure:
   - **Root Directory**: `task_client`
   - **Framework Preset**: Nuxt.js (auto-detected)
   - **Build Command**: `npx nuxt build`
   - **Output Directory**: `.output` (auto-detected)
5. Add **Environment Variables**:
   ```
   API_BASE_URL=https://your-app-name.onrender.com
   SITE_NAME=NoteApp
   ```
6. Click **Deploy** → wait ~2 min
7. Your app is live at `https://your-project.vercel.app`

---

### Step 5 — Update CORS on Backend

Once you have the Vercel URL, update the `CLIENT_URL` environment variable on Render:
```
CLIENT_URL=https://your-project.vercel.app
```
The `app.js` already uses this:
```js
app.use(cors({ origin: process.env.CLIENT_URL || "*" }))
```
Redeploy the backend after changing env vars.

---

### Free tier limits summary

| Service | Free Tier Limit | Notes |
|---|---|---|
| MongoDB Atlas M0 | 512 MB storage | Enough for development & demo |
| Render Web Service | 750 hrs/month, sleeps after 15 min | Add cron ping to keep awake |
| Vercel Hobby | 100 GB bandwidth, unlimited projects | No sleep, instant |

### Local development setup (for reference)

```bash
# 1. Start MongoDB locally (must be installed)
mongod

# 2. Backend
cd task_backend
cp .env.example .env   # edit MONGODB_URI if needed
npm install
npm run seed           # populate test data
npm run dev            # starts on port 3001

# 3. Frontend (new terminal)
cd task_client
npm install
# create .env file:
echo "API_BASE_URL=http://localhost:3001" > .env
npx nuxt dev           # starts on port 3000
```

---

## Quick Reference: All API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | User login → JWT |
| POST | `/api/auth/admin/login` | Public | Admin login → JWT |
| GET | `/api/auth/me` | JWT | Get current user |
| POST | `/api/auth/logout` | JWT | Logout |
| GET | `/api/admin/users` | Admin | List all users |
| GET | `/api/notes` | User | List my notes |
| POST | `/api/notes` | User | Create note |
| PUT | `/api/notes/:id` | User | Update note |
| DELETE | `/api/notes/:id` | User | Delete note |
| GET | `/api/posts` | User | List my posts |
| GET | `/api/permissions` | Admin | List permissions |
| POST | `/api/permissions` | Admin | Create permission |
| GET | `/api/roles` | Admin | List roles |
| POST | `/api/roles` | Admin | Create role |
| PUT | `/api/roles/:id/permissions` | Admin | Assign permissions to role |
| GET | `/api/menus` | Admin | List all menu items |
| POST | `/api/menus` | Admin | Create menu item |
| GET | `/api/menus/my-menus` | JWT | Get menus for my role |
| GET | `/up` | Public | Health check |
