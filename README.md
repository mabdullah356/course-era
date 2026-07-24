# CourseEra

A full-stack online course marketplace built with **Next.js 16 (App Router)**, **Clerk** authentication, **Stripe** payments, **Prisma ORM**, and **PostgreSQL**. Instructors can publish courses with structured sections and lectures, while students browse, enroll, and purchase courses through a secure checkout flow.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running Locally](#running-locally)
- [Authentication Flow](#authentication-flow)
- [Payment & Enrollment Flow](#payment--enrollment-flow)
- [API Routes](#api-routes)
- [Frontend Pages & Components](#frontend-pages--components)
- [Webhook Handlers](#webhook-handlers)
- [Deployment](#deployment)
- [Scripts](#scripts)

---

## Features

- **Course Catalog** — Responsive grid of published courses with discount badges, language tags, and pricing
- **Course Detail Page** — Dynamic route (`/course/[id]`) showing instructor info, course content (sections + lectures), enrollment count, topics, keywords, and a sticky enrollment sidebar
- **Authentication** — Clerk-powered sign-in / sign-up modals with user button in the header; session-aware enrollment checks
- **Stripe Checkout** — Secure payment processing with discount calculation; success/cancel redirect flow
- **Webhook Integration** — Stripe webhook confirms payment and creates enrollment; Clerk webhook syncs user data (create/update/delete) to the database
- **Database** — PostgreSQL with Prisma ORM; relational models for users, courses, sections, lectures, and enrollments
- **Mobile-First UI** — Fully responsive layout with Tailwind CSS, gradient accents, loading states, and empty states
- **SEO** — Server-rendered pages with Next.js App Router; dynamic metadata support

---

## Tech Stack

| Layer       | Technology                                                         |
| ----------- | ------------------------------------------------------------------ |
| Framework   | [Next.js 16](https://nextjs.org/) (App Router)                    |
| UI          | [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) |
| Database    | [PostgreSQL](https://www.postgresql.org/) via [Prisma ORM 7](https://www.prisma.io/) |
| Auth        | [Clerk](https://clerk.com/) (`@clerk/nextjs`)                     |
| Payments    | [Stripe](https://stripe.com/) (`stripe` SDK)                      |
| Webhooks    | [Svix](https://svix.com/) for Clerk webhook signature verification |
| HTTP Client | [Axios](https://axios-http.com/)                                  |
| Deployment  | [Vercel](https://vercel.com/)                                     |
| Language    | [TypeScript 5](https://www.typescriptlang.org/)                   |

---

## Project Structure

```
course-era/
├── app/
│   ├── api/
│   │   ├── checkout/
│   │   │   └── route.ts                  # POST — Create Stripe checkout session
│   │   ├── courses/
│   │   │   ├── route.ts                  # GET  — List all published courses
│   │   │   └── [id]/
│   │   │       └── route.ts              # GET  — Single course with sections, lectures, enrollment status
│   │   └── webhooks/
│   │       ├── clerk-user-webhooks/
│   │       │   └── route.ts              # POST — Clerk user sync (create/update/delete)
│   │       └── stripe-webhook/
│   │           └── route.ts              # POST — Stripe payment confirmation + enrollment creation
│   ├── course/
│   │   └── [id]/
│   │       └── page.tsx                  # Course detail page (client component)
│   ├── generated/
│   │   └── prisma/                       # Generated Prisma client (gitignored)
│   ├── globals.css                       # Tailwind CSS v4 entry + CSS variables
│   ├── layout.tsx                        # Root layout — fonts, Provider, Header
│   └── page.tsx                          # Home page — course catalog
├── components/
│   ├── Courses.tsx                       # Server component — fetches & renders course grid
│   ├── Header.tsx                        # Client component — auth-aware navigation bar
│   └── Provider.tsx                      # ClerkProvider wrapper
├── lib/
│   └── prisma.ts                         # Singleton Prisma client with connection pooling
├── prisma/
│   ├── schema.prisma                     # Database schema definition
│   ├── seed.ts                           # Seed script — 4 sample courses with sections & lectures
│   └── migrations/                       # Database migration files
├── proxy.ts                              # Clerk middleware — matcher config for auth routes
├── prisma.config.ts                      # Prisma config with datasource URL
├── next.config.ts                        # Next.js config — remote image patterns
├── tsconfig.json                         # TypeScript config
├── postcss.config.mjs                    # PostCSS config — Tailwind CSS plugin
├── eslint.config.mjs                     # ESLint config — core web vitals + typescript
├── package.json
└── .env                                  # Environment variables (gitignored)
```

---

## Database Schema

```
┌──────────┐       ┌──────────────┐       ┌──────────┐
│   User   │──1:N──│   Course     │──1:N──│  Section  │──1:N──┌──────────┐
│          │       │              │       │           │       │ Lecture  │
│ id       │       │ id           │       │ id        │       │ id       │
│ clerkId  │       │ instructorId │       │ courseId   │       │ sectionId│
│ email    │       │ title        │       │ title     │       │ title    │
│ firstName│       │ description  │       │ lectureCnt│       │ type     │
│ lastName │       │ thumbnail    │       │ duration  │       │ url      │
│ profilePh│       │ totalDuration│       │ order     │       │ duration │
│ gender   │       │ keywords[]   │       └──────────┘       │ isPreview│
│ birthday │       │ topics[]     │                           │ order    │
│ phone    │       │ level        │                           └──────────┘
│          │       │ language     │
└──────────┘       │ isPublished  │
    │              │ price        │
    │ 1:N          │ discount     │
    └──────────┬───│ createdAt    │
               │   │ updatedAt    │
               │   └──────────────┘
               │         │
               │        1:N
               │         │
          ┌────┴─────────┴──┐
          │   Enrollment    │
          │                 │
          │ id              │
          │ courseId         │
          │ userId          │
          │ createdAt       │
          │ @@unique(courseId, userId) │
          └─────────────────┘
```

### Models

| Model        | Description                                                          |
| ------------ | -------------------------------------------------------------------- |
| `User`       | Synced from Clerk via webhooks; linked by `clerkId`                  |
| `Course`     | Created by an instructor (`instructorId` → User); has sections, pricing, metadata |
| `Section`    | Ordered grouping of lectures within a course                         |
| `Lecture`    | Individual lesson (video, exercise, quiz, article, assignment) with optional preview |
| `Enrollment` | Junction record linking a user to a purchased course (unique pair)   |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), [pnpm](https://pnpm.io/), or [bun](https://bun.sh/)
- [PostgreSQL](https://www.postgresql.org/) database (local or hosted — e.g. Prisma Postgres, Neon, Supabase)
- [Clerk](https://clerk.com/) account (for authentication keys)
- [Stripe](https://stripe.com/) account (for payment keys and webhook endpoint)

### Installation

```bash
git clone https://github.com/mabdullah356/course-era.git
cd course-era
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# ── Clerk ──────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# ── Database ───────────────────────────────────────────
DATABASE_URL="postgres://user:password@host:5432/dbname?sslmode=require"

# ── Stripe ─────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ── App ────────────────────────────────────────────────
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

| Variable                         | Where to Find                                                          |
| -------------------------------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys                                        |
| `CLERK_SECRET_KEY`               | Clerk Dashboard → API Keys                                             |
| `CLERK_WEBHOOK_SECRET`           | Clerk Dashboard → Webhooks → Signing Secret                            |
| `DATABASE_URL`                   | Your PostgreSQL connection string                                       |
| `STRIPE_SECRET_KEY`              | Stripe Dashboard → Developers → API Keys → Secret key                  |
| `STRIPE_WEBHOOK_SECRET`          | Stripe Dashboard → Developers → Webhooks → Endpoint signing secret     |
| `NEXT_PUBLIC_BASE_URL`           | Your app URL (`http://localhost:3000` locally)                          |

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed sample courses (optional)
npx tsx prisma/seed.ts
```

The seed script creates 4 courses:
1. Complete Web Development Bootcamp
2. Python for Data Science & Machine Learning
3. Advanced React & Next.js Masterclass
4. UI/UX Design Fundamentals

Each course includes 2 sections with 4 lectures each (videos, exercises, quizzes, assignments).

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Authentication Flow

```
User clicks "Sign Up" / "Log In"
        │
        ▼
┌─────────────────────┐
│   Clerk Modal UI    │  ← Rendered by SignInButton / SignUpButton
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Clerk Auth Server  │  ← Handles OAuth, email/password, MFA
└─────────┬───────────┘
          │
          ▼
┌─────────────────────────────────────────────┐
│  Clerk Webhook → /api/webhooks/clerk-user-  │
│                  webhooks                    │
│  • user.created  → INSERT into User table   │
│  • user.updated  → UPDATE User table        │
│  • user.deleted  → DELETE from User table   │
└─────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────┐
│  Clerk Provider     │  ← Wraps entire app in layout.tsx
│  Header updates     │  ← Shows UserButton or SignIn/SignUp
└─────────────────────┘
```

- **Middleware**: `proxy.ts` applies Clerk middleware to all routes except static assets
- **Session Check**: Course detail page checks enrollment status per authenticated user via `auth()` from `@clerk/nextjs/server`

---

## Payment & Enrollment Flow

```
User clicks "Enroll Now" on /course/[id]
        │
        ▼
┌──────────────────────────────────┐
│  POST /api/checkout              │
│  1. Verify Clerk auth (userId)   │
│  2. Find or create User in DB    │
│  3. Check for existing enrollment │
│  4. Calculate final price        │
│     (price - discount%)          │
│  5. Create Stripe Checkout       │
│     Session with metadata:       │
│     { courseId, userId }         │
│  6. Return session.url           │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  User completes Stripe Checkout  │
│  (card payment form)             │
└──────────────┬───────────────────┘
               │
        ┌──────┴──────┐
        ▼              ▼
   SUCCESS          CANCEL
   │                │
   ▼                ▼
  Redirect        Redirect
  to /course/     to /course/
  [id]?enrolled   [id]?canceled
  =true           =true
        │
        ▼ (async)
┌──────────────────────────────────┐
│  Stripe Webhook                  │
│  POST /api/webhooks/stripe-      │
│       webhook                    │
│  1. Verify signature             │
│  2. On checkout.session.completed│
│  3. Create Enrollment record     │
│     (courseId + userId)          │
└──────────────────────────────────┘
```

- Duplicate enrollment is prevented via `@@unique([courseId, userId])` and a pre-check in the checkout route
- Price is always calculated server-side to prevent client-side tampering

---

## API Routes

### `GET /api/courses`

Returns all published courses.

**Response:**
```json
[
  {
    "id": "clx...",
    "title": "Complete Web Development Bootcamp",
    "description": "Learn HTML, CSS, JavaScript...",
    "thumbnail": "https://images.unsplash.com/...",
    "price": 89.99,
    "discount": 20,
    "language": "English",
    "createdAt": "2026-07-19T03:10:00.000Z",
    "updatedAt": "2026-07-19T03:10:00.000Z"
  }
]
```

---

### `GET /api/courses/[id]`

Returns a single course with full details including instructor, sections, lectures, enrollment count, and current user's enrollment status.

**Response:**
```json
{
  "id": "clx...",
  "title": "Advanced React & Next.js Masterclass",
  "description": "Deep dive into React hooks...",
  "thumbnail": "https://images.unsplash.com/...",
  "totalDuration": 54000,
  "keywords": ["react", "nextjs", "typescript"],
  "topics": ["React Hooks", "Context API"],
  "level": "advanced",
  "language": "English",
  "price": 79.99,
  "discount": 0,
  "instructor": {
    "firstName": "Abdullah",
    "lastName": "Khan",
    "profilePhoto": "https://img.clerk.com/...",
    "email": "abdullah@example.com"
  },
  "sections": [
    {
      "id": "...",
      "title": "React Advanced Patterns",
      "order": 1,
      "duration": 18000,
      "lectures": [
        {
          "id": "...",
          "title": "Custom Hooks Deep Dive",
          "type": "video",
          "duration": 4800,
          "isPreview": true
        }
      ]
    }
  ],
  "_count": { "enrollments": 42 },
  "isEnrolled": true
}
```

---

### `POST /api/checkout`

Creates a Stripe checkout session for course enrollment.

**Request:**
```json
{ "courseId": "clx..." }
```

**Response:**
```json
{ "url": "https://checkout.stripe.com/pay/cs_test_..." }
```

**Errors:**
| Status | Meaning             |
| ------ | ------------------- |
| 401    | Not authenticated   |
| 400    | Missing courseId    |
| 404    | Course not found    |
| 409    | Already enrolled    |

---

### `POST /api/webhooks/stripe-webhook`

Receives Stripe webhook events. Verifies signature and creates enrollment on `checkout.session.completed`.

---

### `POST /api/webhooks/clerk-user-webhooks`

Receives Clerk webhook events via Svix. Handles:
- `user.created` — Inserts new user record
- `user.updated` — Updates existing user record
- `user.deleted` — Removes user record

---

## Frontend Pages & Components

### Pages

| Route              | Component      | Rendering    | Description                               |
| ------------------ | -------------- | ------------ | ----------------------------------------- |
| `/`                | `Courses`      | Server (RSC) | Course catalog grid with API data fetching |
| `/course/[id]`     | `Course`       | Client       | Course detail with dynamic content, checkout flow |

### Components

| Component   | Type   | File                        | Description                                            |
| ----------- | ------ | --------------------------- | ------------------------------------------------------ |
| `Header`    | Client | `components/Header.tsx`     | Sticky nav with logo, search bar, Clerk auth buttons   |
| `Courses`   | Server | `components/Courses.tsx`    | Fetches courses from API, renders responsive grid      |
| `Provider`  | Server | `components/Provider.tsx`   | Wraps children in `ClerkProvider`                      |

---

## Webhook Handlers

### Stripe Webhook (`/api/webhooks/stripe-webhook`)

- **Signature Verification**: Uses `stripe.webhooks.constructEvent()` with `STRIPE_WEBHOOK_SECRET`
- **Event Handling**: Only processes `checkout.session.completed`
- **Idempotency**: Checks for existing enrollment before creating
- **Metadata**: Reads `courseId` and `userId` from session metadata

### Clerk Webhook (`/api/webhooks/clerk-user-webhooks`)

- **Signature Verification**: Uses Svix `Webhook.verify()` with `CLERK_WEBHOOK_SECRET`
- **Events Handled**:
  - `user.created` — Creates user in database with clerkId, email, name, profile photo, gender, birthday, phone
  - `user.updated` — Updates all synced fields
  - `user.deleted` — Deletes user record (cascades via FK constraints)
- **Headers Required**: `svix-id`, `svix-timestamp`, `svix-signature`

---

## Deployment

### Vercel (Recommended)

1. Push repository to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Configure environment variables
4. Deploy

**Post-deployment:**
- Update `NEXT_PUBLIC_BASE_URL` to your production domain
- Update Clerk redirect URLs in Clerk Dashboard
- Create Stripe webhook endpoint pointing to `https://your-domain.com/api/webhooks/stripe-webhook`
- Create Clerk webhook endpoint pointing to `https://your-domain.com/api/webhooks/clerk-user-webhooks`
- Run `npx prisma migrate deploy` on production database

### Production Checklist

- [ ] Set `NEXT_PUBLIC_BASE_URL` to production URL
- [ ] Configure Clerk production keys and redirect URLs
- [ ] Create Stripe webhook endpoint for production domain
- [ ] Create Clerk webhook endpoint for production domain
- [ ] Run database migrations against production database
- [ ] Verify webhook secrets match in both Stripe/Clerk dashboards and environment
- [ ] Enable Clerk's webhook for user sync in production
- [ ] Test full checkout flow end-to-end

---

## Scripts

| Command               | Description                                      |
| --------------------- | ------------------------------------------------ |
| `npm run dev`         | Start development server on `localhost:3000`     |
| `npm run build`       | Generate Prisma client and build for production  |
| `npm run start`       | Start production server                          |
| `npm run lint`        | Run ESLint                                       |
| `npx prisma generate` | Generate Prisma client from schema               |
| `npx prisma migrate dev` | Run database migrations in development        |
| `npx prisma migrate deploy` | Apply migrations in production              |
| `npx prisma db seed`  | Seed database with sample courses                |
| `npx prisma studio`   | Open Prisma Studio (visual database browser)     |

---

## License

This project is private and not publicly licensed.

---

**Built by [Abdullah](https://github.com/mabdullah356)**
