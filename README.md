# YatraSetu — Bus Booking & Operations Portal

[![ALGIONS AI LABS Evaluation](https://img.shields.io/badge/Assessment-ALGIONS%20AI%20LABS-0f172a?style=for-the-badge)](https://algions.com)
[![Full-Stack Web Development](https://img.shields.io/badge/Role-Full--Stack%20Web%20Dev-2563eb?style=for-the-badge)]()
[![Vitest Automated Tests](https://img.shields.io/badge/Vitest-31%2F31%20Passed-10b981?style=for-the-badge)]()
[![MongoDB Transactions](https://img.shields.io/badge/MongoDB-ACID%20WiredTiger-16a34a?style=for-the-badge)]()
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.3.5-38bdf8?style=for-the-badge)]()

An enterprise-grade, full-stack online bus booking and fleet operations portal designed for the **ALGIONS AI LABS PRIVATE LIMITED** placement assessment.

The portal adopts an institutional, government-transport-inspired design language with complete Light and Dark theme support, real MongoDB persistence, ACID transactional seat concurrency locks, multi-tenant operator isolation, and interactive operational dashboards.

> ⚠️ **Disclaimer:** Independent academic demonstration project for ALGIONS AI LABS PRIVATE LIMITED placement evaluation. Not an official government website.

---

## Key Highlights & Architectural Strengths

- **ACID Seat Booking Concurrency**: Enforces MongoDB sessions and atomic conditional updates on a compound unique index `{ tripId: 1, seatNumber: 1 }`. Simultaneous booking attempts for the same seat guarantee that exactly one succeeds (201 Created) while the other receives HTTP 409 Conflict.
- **Pure ES Modules**: Built end-to-end with ES Modules (`import`/`export`) across both client and server (`"type": "module"`).
- **Tailwind CSS v4.3.5**: Modern CSS-first architecture with `@tailwindcss/vite`, `@import "tailwindcss";`, and `@custom-variant dark`. Persistent manual Light/Dark mode toggle across all pages.
- **Three-Tier Role-Based Access Control (RBAC)**: Distinct permissions for **Passenger (Customer)**, **Fleet Staff (Operator)**, and **Chief Transport Administrator (Admin)**.
- **Proportional Segment Fare Engine**: Dynamically calculates intermediate stop fares based on distance and route sequence order with 5% GST and platform fees.
- **Configurable Cancellation & Refund Engine**: Admin-editable refund tiers (e.g. 100% for ≥24h, 50% for 6-24h, 0% for <6h) with automatic atomic seat release.
- **Interactive Visual Seat Layout**: 2+2 and 2+1 layout grids with live seat states (Available, Selected, Booked).
- **Automated Vitest Test Suite**: 31 automated unit and integration tests executing against in-memory replica-set transactions.

---

## Technology Stack & Versions

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | React.js | `^18.3.1` | Component-driven user interface |
| **Build Tool** | Vite | `^6.1.0` | Ultra-fast HMR and production bundling |
| **Styling** | Tailwind CSS | `v4.3.5` | CSS-first utility design system & custom dark mode |
| **Vite Tailwind Plugin** | `@tailwindcss/vite` | `v4.3.5` | Official Tailwind v4 Vite compiler plugin |
| **Routing** | React Router DOM | `^6.28.2` | Client-side SPA routing with protected layout wrappers |
| **Server State** | TanStack React Query | `^5.66.0` | Server-state caching and synchronization |
| **Icons** | Lucide React | `^0.475.0` | Modern accessible iconography |
| **Visual Charts** | Recharts | `^2.15.1` | Analytics dashboards (Area, Bar, Pie charts) |
| **Backend API** | Node.js + Express.js | `v24.13.0` / `^4.21.2` | Versioned RESTful API (`/api/v1`) |
| **Database** | MongoDB Atlas / Mongoose | `^8.9.5` | Document persistence with ACID transactions |
| **Authentication** | JWT + bcryptjs | `^9.0.2` / `^2.4.3` | HttpOnly cookie auth + password hashing |
| **Validation** | Zod | `^3.24.1` | Strict server and client request schema validation |
| **API Docs** | Swagger UI Express | `^5.0.1` | OpenAPI 3.0 specification & interactive UI |
| **Testing** | Vitest + Supertest | `^3.0.4` / `^7.0.0` | Unit & API integration test runner |
| **In-Memory Replica Set** | `mongodb-memory-server` | `^10.1.3` | WiredTiger transaction replica set for tests |

---

## Monorepo Project Structure

```text
MyJourney/
│
├── client/                               # Frontend React + Vite Application
│   ├── public/
│   │   └── bus-icon.svg                  # Brand favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                   # Navbar, Footer, etc.
│   │   │   ├── forms/                    # BusSearchForm, etc.
│   │   │   └── seats/                    # Interactive visual SeatMap
│   │   ├── context/                      # AuthContext, ThemeContext
│   │   ├── layouts/                      # AppLayout, AdminLayout, OperatorLayout
│   │   ├── pages/
│   │   │   ├── auth/                     # LoginPage, RegisterPage
│   │   │   ├── public/                   # LandingPage, SearchResultsPage
│   │   │   ├── customer/                 # TicketPage, MyBookingsPage
│   │   │   ├── operator/                 # Dashboard, Schedules, Manifest, Occupancy
│   │   │   └── admin/                    # Dashboard, Operators, Buses, Stops, Routes, Trips, Policy, AuditLogs
│   │   ├── routes/                       # AppRoutes, ProtectedRoute
│   │   ├── services/                     # Axios API client with interceptors
│   │   ├── styles/                       # Tailwind v4 index.css with CSS variables
│   │   ├── App.jsx                       # Application Root Provider
│   │   └── main.jsx                      # DOM bootstrap
│   ├── vite.config.js                    # Vite configuration with Tailwind v4 & /api proxy
│   ├── package.json
│   └── vercel.json                       # Vercel SPA rewrites & API reverse proxy
│
├── server/                               # Backend Node.js / Express Application
│   ├── scripts/
│   │   └── seed.js                       # Idempotent dynamic seed script
│   ├── src/
│   │   ├── config/                       # Database connection & system constants
│   │   ├── controllers/                  # Auth, Public, Booking, Operator, Admin
│   │   ├── docs/                         # OpenAPI 3.0 Swagger specification
│   │   ├── middleware/                   # Authentication, RBAC, Validation, ErrorHandler
│   │   ├── models/                       # 10 Normalized Mongoose Schemas & Indexes
│   │   ├── routes/                       # Versioned route files (/api/v1)
│   │   ├── services/                     # Booking transaction, Fare & Refund services
│   │   ├── tests/
│   │   │   ├── setup.js                  # MongoMemoryReplSet test harness
│   │   │   ├── unit/                     # PNR, Refund, Fare, Booking Validation
│   │   │   └── integration/              # Auth, RBAC, Search, Cancellation, Concurrency
│   │   ├── utils/                        # PNR generator, Date/Time IST helpers, AuditLogger
│   │   ├── app.js                        # Express application configuration
│   │   └── server.js                     # HTTP server entrypoint
│   ├── package.json
│   ├── vitest.config.js                  # Vitest configuration
│   └── .env.example                      # Server environment template
│
├── docs/                                 # Official Assessment Documentation
│   ├── ER-DIAGRAM.md                     # Mermaid Entity-Relationship schema
│   ├── BOOKING-SEQUENCE.md               # Mermaid ACID transaction & concurrency sequence
│   ├── API-DOCUMENTATION.md              # REST API endpoint reference
│   ├── TECHNICAL-REPORT.md               # Engineering technical report for interview
│   ├── TEST-EVIDENCE.md                  # Test execution logs & acceptance test matrix
│   └── DEMO-WALKTHROUGH.md               # 3-5 minute video script & reviewer checklist
│
├── README.md                             # Comprehensive project documentation
└── .gitignore
```

---

## Demo Reviewer Credentials

Pre-configured accounts seeded via `npm run seed`:

| Role | Email | Password | Assigned Scope |
| :--- | :--- | :--- | :--- |
| **Passenger (Customer)** | `customer@yatrasetu.gov.in` | `Password@123` | Personal bookings & tickets |
| **Chief Administrator** | `admin@yatrasetu.gov.in` | `Password@123` | Global management & analytics |
| **Delhi Fleet Staff** | `operator.delhi@yatrasetu.gov.in` | `Password@123` | Delhi State Transit trips & manifests |
| **Jaipur Fleet Staff** | `operator.jaipur@yatrasetu.gov.in` | `Password@123` | Rajasthan Transit trips & manifests |

*Tip: The Login page contains one-click fast-fill credential cards for instant evaluation.*

---

## Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0+ (Tested on v24.13.0)
- **npm**: v9.0.0+ (Tested on 11.12.1)
- **MongoDB Atlas** connection URI or local MongoDB instance

### 2. Clone and Setup Environment Variables

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/MyJourney.git
cd MyJourney

# Create server environment file
cp server/.env.example server/.env
```

Ensure `server/.env` contains your MongoDB URI:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/yatrasetu?retryWrites=true&w=majority
JWT_SECRET=super-secret-jwt-key-change-in-production-min-32-chars
CLIENT_ORIGIN=http://localhost:5173
COOKIE_SECURE=false
DEMO_SEED_PASSWORD=Password@123
```

### 3. Install Dependencies

```bash
# Install Server packages
cd server
npm install

# Install Client packages
cd ../client
npm install
```

### 4. Seed the Database
Populates operators, buses, stops, routes, future trip schedules, and initial seat inventory:

```bash
cd ../server
npm run seed
```

### 5. Run the Application

In Terminal 1 (Start Backend Server):
```bash
cd server
npm run dev
# Server listens on http://localhost:5000
# Swagger API docs available at http://localhost:5000/api/docs
```

In Terminal 2 (Start Frontend Client):
```bash
cd client
npm run dev
# Vite client runs on http://localhost:5173
```

Navigate to `http://localhost:5173` in your browser.

---

## Executing Automated Tests

The test suite uses **Vitest** alongside `mongodb-memory-server` configured with an in-memory replica set to test ACID multi-document transactions.

```bash
cd server

# Run complete test suite (Unit + Integration + Concurrency)
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration
```

### Verified Test Results:
- **Test Files:** 9 passed (100%)
- **Total Tests:** 31 passed (100%)
- **Critical Concurrency Test:** Confirmed that when two users book the same seat simultaneously, exactly one succeeds (201) and one receives HTTP 409 Conflict.

---

## Production Deployment Guide

### Frontend — Vercel
1. Set the Root Directory to `client`.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. In `client/vercel.json`, replace `https://YOUR-RENDER-SERVICE.onrender.com` with your deployed Render backend service URL. All `/api/*` traffic is transparently proxied same-origin.

### Backend — Render
1. Create a new **Web Service** on Render.
2. Root Directory: `server`.
3. Environment: `Node`.
4. Build Command: `npm install`.
5. Start Command: `npm start`.
6. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (or leave default, Render sets `PORT`)
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<Secure random 32+ character string>`
   - `CLIENT_ORIGIN`: `https://your-vercel-domain.vercel.app`
   - `COOKIE_SECURE`: `true`
7. Health Check Path: `/api/health`.

### MongoDB Atlas Setup
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a Database User with read/write privileges.
3. In Network Access, allow IP Access (`0.0.0.0/0` for cloud deployment or your specific IP).
4. Copy the connection string format: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/yatrasetu?retryWrites=true&w=majority`.
5. Add it to Render environment variables.
6. Trigger the seed script once deployed using Render Shell: `npm run seed`.

---

## Acceptance Tests Verification Matrix

| # | Acceptance Test Requirement | Status | Verification Detail |
| :- | :--- | :---: | :--- |
| **AT-1** | Passenger searches valid trip and retrieves available buses from MongoDB | **VERIFIED** | Real-time query filtering route sequence & seat availability |
| **AT-2** | Passenger selects seat, enters passenger details, and confirms booking | **VERIFIED** | Interactive SeatMap + dynamic passenger form validation |
| **AT-3** | Generates unique PNR with passenger, route, date, fare, and seat details | **VERIFIED** | Tested in `pnr.test.js` & `bookingAndConcurrency.test.js` |
| **AT-4** | Two users cannot confirm the same seat on the same trip simultaneously | **VERIFIED** | Verified with simultaneous race condition; returns HTTP 409 |
| **AT-5** | Cancelling updates status, releases seats, calculates simulated refund | **VERIFIED** | Atomic release back to `AVAILABLE` verified in `cancellation.test.js` |
| **AT-6** | Operator views passenger manifest for assigned trip (excluding cancelled) | **VERIFIED** | Verified in `rbacAndManifest.test.js` |
| **AT-7** | Operator occupancy reports match confirmed seat inventory | **VERIFIED** | Reconciled against MongoDB `SeatInventory` collection |
| **AT-8** | Operator cannot view another operator's restricted data | **VERIFIED** | Row-level tenant boundary enforced with HTTP 403 Forbidden |
| **AT-9** | Customer cannot access another customer's private booking information | **VERIFIED** | Ownership check verified on `/api/v1/bookings/:pnr` |
| **AT-10**| Application builds successfully, tests execute, documentation complete | **VERIFIED** | 31/31 Vitest tests pass; Vite production build clean |

---

## Assessment Documentation Reference

- **Mermaid ER Schema:** [`docs/ER-DIAGRAM.md`](docs/ER-DIAGRAM.md)
- **ACID Booking Sequence:** [`docs/BOOKING-SEQUENCE.md`](docs/BOOKING-SEQUENCE.md)
- **REST API Documentation:** [`docs/API-DOCUMENTATION.md`](docs/API-DOCUMENTATION.md)
- **Technical Placement Report:** [`docs/TECHNICAL-REPORT.md`](docs/TECHNICAL-REPORT.md)
- **Automated Test Evidence:** [`docs/TEST-EVIDENCE.md`](docs/TEST-EVIDENCE.md)
- **Walkthrough Recording Script:** [`docs/DEMO-WALKTHROUGH.md`](docs/DEMO-WALKTHROUGH.md)

