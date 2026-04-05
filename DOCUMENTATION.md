# Secure Note-Taking Application — Codebase Documentation

> **Interview-ready reference.** This document covers architecture, API design, database strategy, auth flow, and the two mandatory aggregation scenarios.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [Database Design & Indexing](#5-database-design--indexing)
6. [REST API Endpoints](#6-rest-api-endpoints)
7. [Aggregation Pipelines](#7-aggregation-pipelines)
8. [Backend Architecture Patterns](#8-backend-architecture-patterns)
9. [Frontend Architecture](#9-frontend-architecture)
10. [Key Design Decisions](#10-key-design-decisions)
11. [Requirements Compliance](#11-requirements-compliance)

---

## 1. Project Overview

A secure, role-based note-taking platform.

| Feature | Details |
|---|---|
| Auth | JWT (access token in Authorization header, stored in cookie on client) |
| Roles | `user` (own notes/posts), `admin` (inherits user + manages all users & notes) |
| Database | MongoDB via Mongoose |
| API | RESTful, Express 5 |
| Frontend | Nuxt 4 + Vue 3 + PrimeVue + TailwindCSS |

---

## 2. Technology Stack

### Backend (`task_backend/`)
| Layer | Library | Purpose |
|---|---|---|
| Framework | Express 5 | HTTP server & routing |
| ODM | Mongoose 8 | MongoDB schema + queries |
| Auth | `jsonwebtoken` | JWT signing/verification |
| Security | `bcryptjs` | Password hashing (salt rounds = 10) |
| Validation | `express-validator` | Request body validation |
| Config | `dotenv` | Environment variables |
| Runtime | Node.js 18+ | JavaScript runtime |

### Frontend (`task_client/`)
| Layer | Library | Purpose |
|---|---|---|
| Framework | Nuxt 4 (Vue 3) | SSR/SPA hybrid with file-based routing |
| UI Library | PrimeVue 4 | Dialog, DataTable, Toast, Button, etc. |
| Styling | TailwindCSS | Utility-first CSS |
| State | `useState` composable | Auth state (no Pinia) |
| HTTP | `ofetch` (wrapped) | API calls with auto Bearer token |
| Icons | `@nuxt/icon` + Lucide | Icon system |

---

## 3. Project Structure

### Backend
```
task_backend/src/
├── app.js                  # Express app setup (middleware, routes, error handler)
├── server.js               # Server startup + MongoDB connection
├── config/
│   └── database.js         # Mongoose connect()
├── middleware/
│   ├── authenticate.js     # Verifies JWT → req.user
│   ├── authorize.js        # requireAdmin / requireUser guards
│   └── validate.js         # express-validator error handler
├── modules/
│   ├── auth/               # register, login, admin-login, profile, logout
│   ├── user/               # admin CRUD + user profile + aggregations
│   ├── note/               # user CRUD notes + admin view all
│   └── post/               # public feed + user own posts + $lookup aggregation
├── repositories/
│   └── BaseRepository.js   # Generic CRUD (findAll, findById, create, update, delete)
└── services/
    └── BaseService.js      # Business logic wrapping BaseRepository
```

Each module follows the pattern:
```
module/
├── module.model.js         # Mongoose Schema + schema.index()
├── module.repository.js    # DB queries (extends BaseRepository)
├── module.service.js       # Business logic (extends BaseService)
├── module.controller.js    # HTTP layer (request → service → response)
└── module.routes.js        # Express Router + validation middleware
```

### Frontend
```
task_client/app/
├── app.vue                 # Root component (PrimeVue config, Toast provider)
├── layouts/
│   ├── admin.vue           # Dark sidebar layout for /admin-panel/*
│   ├── user.vue            # Light sidebar layout for /user-panel/*
│   ├── auth.vue            # Centered layout for login/register
│   └── default.vue         # Fallback
├── pages/
│   ├── login.vue / register.vue / login-admin.vue
│   ├── admin-panel/
│   │   ├── index.vue       # Admin dashboard (stats)
│   │   ├── users/          # User CRUD (list, create, edit, delete)
│   │   ├── notes/          # View all users' notes
│   │   ├── posts/          # View all posts
│   │   └── interests/      # Group-by-interests aggregation view
│   └── user-panel/
│       ├── index.vue       # User dashboard
│       ├── notes/          # Own notes CRUD
│       ├── posts/          # Create/view posts
│       └── profile.vue     # Edit profile + interests
├── composables/
│   ├── useAuth.ts          # Auth state + login/logout/register
│   ├── useAuthApi.ts       # Raw auth API calls
│   ├── useNotesApi.ts      # Notes CRUD API calls
│   ├── usePostsApi.ts      # Posts API calls
│   └── useUsersApi.ts      # Users API calls (admin + user profile)
├── middleware/
│   ├── auth-admin.ts       # Redirect non-admins
│   ├── auth-user.ts        # Redirect unauthenticated users
│   └── guest.ts            # Redirect already-logged-in users
├── plugins/
│   ├── auth.ts             # Restore auth state on page load/refresh
│   └── globalFunction.ts   # $truncateText, $viewFormatDate, $viewFormatDateTime
├── components/
│   ├── ResponseModal.vue   # Animated success/error modal (auto-closes in 3s)
│   └── ConfirmModal.vue    # Delete confirmation modal with warning animation
└── utils/
    ├── $fetch.ts           # ofetch wrapper: injects Bearer token, handles 401
    └── helpers.ts          # timeAgo(), formatDate()
```

---

## 4. Authentication & Authorization

### JWT Flow

```
Client                         Server
  |                               |
  |-- POST /api/auth/login ------->|
  |                               |--> verify email/password (bcrypt.compare)
  |                               |--> jwt.sign({ id, role }, SECRET, { expiresIn: '7d' })
  |<-- { token, user } -----------|
  |                               |
  |  (store token in cookie)      |
  |                               |
  |-- GET /api/... Authorization: Bearer <token> -->|
  |                               |--> authenticate middleware: jwt.verify()
  |                               |--> req.user = { id, role }
  |                               |--> requireAdmin / requireUser checks role
  |<-- 200 response --------------|
```

### Middleware Chain

```js
// authenticate.js — verifies token
const token = req.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded; // { id: '...', role: 'admin' }

// authorize.js
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  next();
};
const requireUser = (req, res, next) => {
  if (!['user', 'admin'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  next();
};
```

> **Admin inherits User**: `requireUser` allows both `user` and `admin` roles. So admin can access all user routes (own notes, posts, profile) in addition to admin-only routes.

### Password Security
- Hashed with `bcryptjs` at 10 salt rounds on register/create/password-update
- `password` field has `select: false` in the Mongoose schema — never returned in queries by default

### Frontend Auth State
```ts
// composables/useAuth.ts
const authUser = () => useState<User | null>('authUser', () => undefined);

// plugins/auth.ts — runs on every page load
const current_user = authUser();
if (current_user.value === undefined) {
  current_user.value = await fetchCurrentUser(); // calls GET /api/auth/profile
}
```

Token is stored in an HTTP cookie (`app_token`). The `$fetch` util reads it and injects `Authorization: Bearer <token>` on every API call.

---

## 5. Database Design & Indexing

### Schema Overview

#### User Collection
```js
{
  name: String,           // required
  email: String,          // required, unique, lowercase
  password: String,       // required, select: false
  role: 'user' | 'admin', // default: 'user'
  status: 'active' | 'inactive' | 'suspended',
  phone: String,
  bio: String,
  avatar: String,
  interests: [String],    // used in Group-by-Interests aggregation
  createdAt, updatedAt    // auto via timestamps
}

// Indexes (schema.index)
userSchema.index({ email: 1 }, { unique: true }); // login + profile lookup
userSchema.index({ role: 1 });                     // admin user list filtering
```

#### Note Collection
```js
{
  title: String,     // required
  content: String,   // required
  userId: ObjectId,  // ref: 'User', required
  tags: [String],
  is_pinned: Boolean,
  createdAt, updatedAt
}

// Indexes (schema.index)
noteSchema.index({ userId: 1 });         // user listing their own notes
noteSchema.index({ userId: 1, _id: 1 }); // user fetching a specific note
```

#### Post Collection
```js
{
  title: String,       // required
  content: String,     // required
  userId: ObjectId,    // ref: 'User'
  is_published: Boolean,
  tags: [String],
  createdAt, updatedAt
}

// Indexes (schema.index)
postSchema.index({ userId: 1 }); // user's own posts + $lookup pipeline
```

### Indexing Strategy & Trade-offs
| Index | Supports | Reason |
|---|---|---|
| `email: 1` (unique) | Login, GET /profile | Equality lookup — most common auth query |
| `role: 1` | Admin: list users by role | Range/filter on role field |
| `noteSchema: { userId: 1 }` | GET /user/notes (paginated) | Filter all notes by owner |
| `noteSchema: { userId, _id }` | GET /user/notes/:id | Covered index for single-note ownership check |
| `postSchema: { userId: 1 }` | GET /user/posts, $lookup | Foreign key in aggregation + user post list |

> **No unnecessary indexes**: Indexes on `is_pinned`, `tags`, `title`, `createdAt` were deliberately omitted — no query filters on those fields.

---

## 6. REST API Endpoints

**Base URL:** `http://127.0.0.1:3001`

### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | User login → JWT |
| POST | `/api/auth/admin/login` | Public | Admin-only login |
| GET | `/api/auth/profile` | Bearer | Get current user |
| POST | `/api/auth/logout` | Bearer | Logout (client clears token) |

### Admin: User Management (`/api/admin/users`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/users` | Admin | List all users (paginated, searchable) |
| GET | `/api/admin/users/:id` | Admin | Get user by ID |
| POST | `/api/admin/users` | Admin | Create user |
| PUT | `/api/admin/users/:id` | Admin | Update user |
| DELETE | `/api/admin/users/:id` | Admin | Delete user |
| GET | `/api/admin/users/interests` | Admin | Group users by interests (aggregation) |
| GET | `/api/admin/users/:id/posts` | Admin | Get user's posts via `$lookup` |

### User: Notes (`/api/user/notes`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/user/notes` | User/Admin | List own notes (paginated, searchable) |
| GET | `/api/user/notes/:id` | User/Admin | Get single note |
| POST | `/api/user/notes` | User/Admin | Create note |
| PUT | `/api/user/notes/:id` | User/Admin | Update note |
| DELETE | `/api/user/notes/:id` | User/Admin | Delete note |

### Admin: Notes (`/api/admin/notes`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/notes` | Admin | View all users' notes (paginated) |

### Posts (`/api/posts`, `/api/user/posts`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/posts` | Public | All published posts (paginated) |
| GET | `/api/user/posts` | User/Admin | Own posts (paginated) |
| POST | `/api/user/posts` | User/Admin | Create post |
| PUT | `/api/user/posts/:id` | User/Admin | Update own post |
| DELETE | `/api/user/posts/:id` | User/Admin | Delete own post |

### User: Profile (`/api/user/profile`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/user/profile` | User/Admin | Get own profile |
| PUT | `/api/user/profile` | User/Admin | Update profile (name, bio, phone, interests) |

### Pagination Query Params
All list endpoints accept: `?page=1&per_page=10&search=keyword`

Response meta:
```json
{
  "data": {
    "data": [...],
    "meta": {
      "total": 42,
      "current_page": 1,
      "last_page": 5,
      "per_page": 10
    }
  }
}
```

---

## 7. Aggregation Pipelines

### Scenario 1 — Group Users by Interests

**Endpoint:** `GET /api/admin/users/interests`  
**Constraint:** Exactly one `collection.aggregate()` call.

```js
// user.repository.js
User.aggregate([
  { $unwind: '$interests' },        // flatten the interests array
  {
    $group: {
      _id: '$interests',            // group key = interest name
      count: { $sum: 1 },           // how many users share this interest
      users: {
        $push: { id: '$_id', name: '$name', email: '$email' }
      },
    },
  },
  { $sort: { count: -1 } },         // most popular first
  { $project: { interest: '$_id', count: 1, users: 1, _id: 0 } },
])
```

**Why no extra index?** We scan the entire users collection (no filter before `$unwind`). A multi-key index on `interests` doesn't help a full-collection `$unwind` + `$group`.

**Sample Result:**
```json
[
  { "interest": "coding", "count": 5, "users": [...] },
  { "interest": "chess",  "count": 3, "users": [...] }
]
```

---

### Scenario 2 — User Posts via $lookup

**Endpoint:** `GET /api/admin/users/:id/posts`  
**Constraint:** Single pipeline with `$lookup` stage.

```js
// post.repository.js
User.aggregate([
  { $match: { _id: new mongoose.Types.ObjectId(userId) } }, // find the user
  {
    $lookup: {
      from: 'posts',           // join posts collection
      localField: '_id',       // User._id
      foreignField: 'userId',  // Post.userId
      as: 'posts',
    },
  },
  {
    $project: {
      _id: 1, name: 1, email: 1,
      posts: {
        $filter: {
          input: '$posts',
          as: 'post',
          cond: { $eq: ['$$post.is_published', true] }, // only published posts
        },
      },
    },
  },
])
```

**Supported by:** `postSchema.index({ userId: 1 })` — MongoDB uses this index for the `$lookup` foreign key join.

**Posts are in a separate collection** by design — this makes the `$lookup` meaningful and tests cross-collection aggregation ability.

**Sample Result:**
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "posts": [
    { "_id": "...", "title": "My First Post", "content": "...", "tags": ["tech"] }
  ]
}
```

---

## 8. Backend Architecture Patterns

### Repository + Service Pattern

```
Controller  →  Service  →  Repository  →  Mongoose Model
```

- **Repository**: Only database logic (`find`, `create`, `update`, `delete`, aggregations)
- **Service**: Business rules (ownership check, password hashing, pagination logic)
- **Controller**: HTTP layer (parse request → call service → format response)

```js
// BaseRepository.js — generic operations
class BaseRepository {
  constructor(model) { this.model = model; }
  findAll(filter = {}) { return this.model.find(filter); }
  findById(id) { return this.model.findById(id); }
  create(data) { return this.model.create(data); }
  update(id, data) { return this.model.findByIdAndUpdate(id, data, { new: true }); }
  delete(id) { return this.model.findByIdAndDelete(id); }
  async getAllPaginated(filters, _searchFields, page, limit) { ... }
}
```

### Request Validation
Every route that accepts body/params uses `express-validator`:
```js
router.post('/admin/users',
  authenticate, requireAdmin,
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    validate,         // sends 422 if errors exist
  ],
  (req, res) => userController.store(req, res)
);
```

### API Response Format
```js
// Success
res.status(200).json({ status: 'success', message: '...', data: { ... } });

// Error
res.status(400).json({ status: 'error', message: '...', errors: { field: ['message'] } });
```

---

## 9. Frontend Architecture

### Auth State Management (no Pinia)
```ts
// composables/useAuth.ts
// Global state using Nuxt's useState
const authUser = () => useState<User | null>('authUser', () => undefined);

export function useAuth() {
  const user = authUser();
  const isLoggedIn = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  async function login(email, password) {
    const res = await useAuthApi().login({ email, password });
    const token = res?.data?.token;
    useCookie('app_token').value = token;
    user.value = res?.data?.user;
  }

  async function logout() {
    useCookie('app_token').value = null;
    user.value = null;
    navigateTo('/login');
  }

  return { user, isLoggedIn, isAdmin, login, logout, ... };
}
```

### HTTP Utility
```ts
// utils/$fetch.ts
export const useCustomFetch = (url, options = {}) => {
  const token = useCookie('app_token').value;
  return $fetch(url, {
    baseURL: API_BASE_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    onResponseError({ response }) {
      if (response.status === 401) navigateTo('/login');
    },
    ...options,
  });
};
```

### Page Guard Middleware
```ts
// middleware/auth-admin.ts
export default defineNuxtRouteMiddleware(() => {
  const { isAdmin, isLoggedIn } = useAuth();
  if (!isLoggedIn.value) return navigateTo('/login');
  if (!isAdmin.value) return navigateTo('/unauthorized');
});
```

### Modal Components
| Component | Props | Usage |
|---|---|---|
| `<ResponseModal>` | `:response_modal="{ status: true, message }"` | After create/update — animated SVG checkmark, auto-closes in 3s |
| `<ConfirmModal>` | `v-model:isOpenConModal` + `@confirm` | Before delete — animated warning icon |

### Navigation Active State Fix
```ts
// In both admin.vue and user.vue layouts
function isActiveRoute(to: string) {
  // exact match OR sub-path (e.g. /admin-panel/users matches /admin-panel/users/123)
  return $route.path === to || $route.path.startsWith(to + '/');
}
// This prevents /admin-panel (Dashboard) from matching /admin-panel/users
```

---

## 10. Key Design Decisions

### Why separate Posts collection?
The requirement explicitly tests `$lookup` between two collections. If posts were embedded in users, `$lookup` would be pointless. Separate collection = proper relational-join scenario.

### Why `select: false` on password?
Prevents accidentally exposing password hashes in any `find()` query. Must explicitly request it: `User.findOne().select('+password')`.

### Why both `{ userId }` and `{ userId, _id }` indexes on notes?
- `{ userId }` — covers paginated list queries: `Note.find({ userId }).skip().limit()`
- `{ userId, _id }` — covers single-document fetch with ownership check: `Note.findOne({ _id, userId })` (compound index includes both fields, no separate _id scan needed)

### Why no index on `interests`?
The aggregation `$unwind`s then `$group`s the **entire collection** — there is no `$match` on interests before the unwind. A multi-key index on `interests` cannot help a full-collection scan. Adding it would be a wasted write overhead.

### Why `useState` instead of Pinia for auth?
Nuxt 4 provides built-in `useState` that is SSR-safe and shared across components/composables without an external store library. For simple auth state (one user object), it is the idiomatic Nuxt choice.

### Why are admin routes allowed through `requireUser`?
`requireUser` checks `['user', 'admin'].includes(req.user.role)` — admin inherits all user permissions as stated in the requirements. A separate `requireUser` that only allows `user` would break the inheritance requirement.

---

## 11. Requirements Compliance

| Requirement | Status | Implementation |
|---|---|---|
| User: CRUD own notes | ✅ | `GET/POST/PUT/DELETE /api/user/notes` |
| Admin: inherits user capabilities | ✅ | `requireUser` allows both roles; admin can access all `/user/*` routes |
| Admin: manage users (CRUD) | ✅ | `GET/POST/PUT/DELETE /api/admin/users` |
| Admin: view everyone's notes | ✅ | `GET /api/admin/notes` |
| MongoDB + Mongoose | ✅ | All models use Mongoose schemas |
| JWT authentication | ✅ | `jsonwebtoken` sign/verify, Bearer token pattern |
| Secure password hashing | ✅ | `bcryptjs`, 10 salt rounds, `select: false` |
| `schema.index()` visible | ✅ | Each model file has explicit `schema.index()` calls |
| Pagination on all list APIs | ✅ | `BaseService.getAllPaginated` used everywhere |
| Indexes for list operations | ✅ | `userId`, `email`, `role` indexes cover all list queries |
| Indexes for read operations | ✅ | `{ userId, _id }` compound covers single-note fetch |
| Scenario 1: Group by Interests | ✅ | `User.aggregate([$unwind, $group, $sort, $project])` — 1 call |
| Scenario 2: User Posts via $lookup | ✅ | `User.aggregate([$match, $lookup, $project])` — 1 pipeline |
| Posts visible to everyone | ✅ | `GET /api/posts` is unauthenticated (public) |
| No unnecessary indexes | ✅ | Only 5 indexes total across 3 collections |

---

## Quick Start

### Backend
```bash
cd task_backend
cp .env.example .env   # set MONGODB_URI, JWT_SECRET, PORT=3001
npm install
npm run seed           # optional: seed demo data
npm run dev
```

### Frontend
```bash
cd task_client
cp .env.example .env   # set NUXT_PUBLIC_API_BASE=http://127.0.0.1:3001
npm install
npm run dev            # runs on http://localhost:3002
```

### Default Seeded Accounts
| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | password |
| User | user@example.com | password |
