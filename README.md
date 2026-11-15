# MyJourney — Bus Booking & Fleet Operations Portal

> **Tagline:** *"Your Journey. Your Comfort. Your Destination."*

[![Vitest Automated Tests](https://img.shields.io/badge/Vitest-31%2F31%20Passed-10b981?style=for-the-badge)]()
[![Full API Audit](https://img.shields.io/badge/API%20Audit-36%2F36%20Passed-16a34a?style=for-the-badge)]()
[![Razorpay Payment Gateway](https://img.shields.io/badge/Razorpay-Test%20Gateway%20Integrated-0284c7?style=for-the-badge)]()
[![MongoDB Transactions](https://img.shields.io/badge/MongoDB-ACID%20WiredTiger-16a34a?style=for-the-badge)]()
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8?style=for-the-badge)]()

An enterprise-grade, full-stack Indian public bus transportation booking and state fleet operations portal. 

The portal adopts an institutional, modern public-service aesthetic with complete Light and Dark theme support, MongoDB ACID transactions, Razorpay checkout integration, multi-level state transport governance, conductor manifests, and fleet occupancy analytics.

> ⚠️ **Disclaimer:** MyJourney is an independent academic project and is not an official government website.

---

## 📚 Core System Documentation

- **[System Architecture (architecture.md)](architecture.md)** — Detailed diagrams and technical architecture (Client, Backend, Database, ACID Concurrency, and Payment Gateway).
- **[User Workflows (workflow.md)](workflow.md)** — Simple step-by-step walkthroughs of passenger bookings, cancellations, state administrator onboarding, and conductor manifests.
- **[Interactive OpenAPI Docs](http://localhost:5000/api/docs)** — Swagger documentation accessible at `/api/docs`.

---

## 🌟 Key Features & Capabilities

1. **ACID Seat Booking Concurrency**:
   - Enforces MongoDB sessions and atomic conditional updates on `{ tripId: 1, seatNumber: 1 }`.
   - Simultaneous booking attempts for the same seat guarantee that exactly one succeeds (`201 Created`) while the other receives `409 Conflict`.

2. **Razorpay Payment Gateway (Test Mode)**:
   - Integrated with Razorpay's Indian banking checkout (`razorpay` Node.js SDK + Checkout JS).
   - Generates orders in paise, launches the checkout popup, and cryptographically verifies payments via HMAC SHA-256 signatures before confirming tickets.
   - Dual-checkout support: **Pay with Razorpay** (UPI/Card test credentials) or instant **Direct Booking**.

3. **Multi-Level State Administration Hierarchy**:
   - **State Exclusivity**: Dynamic claiming mechanism (`GET /auth/available-states`). Only one self-registered administrator can claim an Indian state (e.g. *Jharkhand*, *Punjab*, *Delhi*); duplicate attempts are rejected with `409 Conflict`.
   - **National Super Admin Oversight**: Newly registered state admins start as `PENDING` with timetable modifications locked until approved by the Super Admin (`admin@myjourney.in`) at `/admin/state-admins`.
   - **Multi-Admin Provisioning**: Super Admins have permission to provision multiple administrators per state directly.

4. **Institutional Design System (Light & Dark Theme)**:
   - Primary palette: Government Green (`#166534`), Light Green (`#DCFCE7`), and Aqua (`#0F766E`).
   - Defaults to **Light Mode**; features a high-contrast **Dark Mode** toggle with persistent `localStorage` preference.

5. **State Roadways Operator Portal**:
   - Operator-scoped dashboards (e.g. *Delhi State RTC*, *Rajasthan State RTC*, *PUNBUS*).
   - Real-time passenger manifests for bus conductors and fleet occupancy reports.

6. **Automated Testing Suite**:
   - **31/31 Vitest** unit & integration tests passing.
   - **36/36 API tests** passing across public, customer, operator, and admin endpoints.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS v4, React Router 6, TanStack Query, Axios, Recharts, Lucide Icons |
| **Backend** | Node.js (ES Modules), Express.js, Mongoose 8, Zod Validation, Helmet, CORS, Morgan |
| **Payment Gateway** | Razorpay Node.js SDK, Razorpay Checkout SDK, Crypto HMAC SHA-256 |
| **Database** | MongoDB Atlas with Replica Set ACID Multi-Document Transactions |
| **Authentication** | JSON Web Tokens (JWT) in HTTP-Only cookies + Bearer auth headers, bcryptjs |
| **Testing** | Vitest, Supertest, MongoDB Memory Server |
| **Deployment** | Vercel (Frontend SPA), Render (Backend API), MongoDB Atlas (Database Cluster) |

---

## 📁 Monorepo Structure

```text
MyJourney/
├── architecture.md                       # Comprehensive architecture guide & diagrams
├── workflow.md                           # Beginner-friendly user workflow walkthroughs
├── README.md                             # Project overview and setup guide
│
├── client/                               # Frontend React + Vite Application
│   ├── public/
│   │   ├── bus.png                       # Fleet brand asset
│   │   └── bus-icon.svg                  # Favicon
│   ├── src/
│   │   ├── components/                   # UI components, forms, interactive 2D SeatMap
│   │   ├── context/                      # AuthContext, ThemeContext, ToastContext
│   │   ├── layouts/                      # AppLayout, AdminLayout, OperatorLayout
│   │   ├── pages/                        # Public, Customer, Operator, Admin pages
│   │   ├── routes/                       # AppRoutes, ProtectedRoute guards
│   │   └── services/                     # Axios API client & Razorpay script loader
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json                       # Vercel SPA rewrites
│
└── server/                               # Backend Node.js / Express Application
    ├── scripts/                          # Seed script & test verification runners
    ├── src/
    │   ├── config/                       # DB connection, Indian states & constants
    │   ├── controllers/                  # Auth, Booking, Public, Operator, Admin
    │   ├── middleware/                   # Authentication, RBAC, Validation, ErrorHandler
    │   ├── models/                       # Mongoose schemas (Booking, Trip, Bus, User, etc.)
    │   ├── routes/                       # Versioned routes (/api/v1)
    │   ├── services/                     # Booking transaction, Fare, Refund & Razorpay services
    │   └── tests/                        # Vitest unit & integration test suites
    ├── package.json
    └── .env                              # Active server environment configuration
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **National Super Admin** | `admin@myjourney.in` | `Password@123` | National governance, State admin approvals & all timetables |
| **Punjab State Admin** | `admin.punjab@myjourney.in` | `Password@123` | Punjab routes & PUNBUS timetables |
| **Delhi State Admin** | `admin.delhi@myjourney.in` | `Password@123` | Delhi routes & DSRTC timetables |
| **Rajasthan State Admin** | `admin.rajasthan@myjourney.in` | `Password@123` | Rajasthan routes & RSRTC timetables |
| **Fleet Operator (Delhi)** | `operator.delhi@myjourney.in` | `Password@123` | DSRTC trips, manifests & occupancy |
| **Passenger (Customer)** | `customer@myjourney.in` | `Password@123` | Ticket booking, history & cancellations |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0+ (Tested on v24.13.0)
- **npm**: v9.0.0+
- **MongoDB Atlas** connection string

### 2. Configure Server Environment
Create `server/.env` with your credentials:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/myjourney?retryWrites=true&w=majority
JWT_SECRET=your-32-character-jwt-secret-key-here
CLIENT_ORIGIN=http://localhost:5173
COOKIE_SECURE=false
DEMO_SEED_PASSWORD=Password@123

# Razorpay Test Mode Credentials
RAZORPAY_KEY_ID=rzp_test_U0LVtkVMwaZDzo
RAZORPAY_KEY_SECRET=luaXnCFDlvvtb8aYlAwaDRQ6
```

### 3. Install & Seed
```bash
# Install backend dependencies
cd server
npm install

# Seed initial operators, fleet, routes, stops, and scheduled trips
npm run seed

# Install frontend dependencies
cd ../client
npm install
```

### 4. Run Locally
In Terminal 1 (Backend):
```bash
cd server
npm run dev
# API running on http://localhost:5000
# OpenAPI Docs on http://localhost:5000/api/docs
```

In Terminal 2 (Frontend):
```bash
cd client
npm run dev
# Frontend running on http://localhost:5173
```

---

## 🧪 Testing & Verification

```bash
cd server

# Run Vitest test suite (Unit + Integration + ACID Concurrency)
npm test

# Run End-to-End API Audit (36 endpoints)
node scripts/test-all-apis.js

# Run Live Razorpay Test Verification
node --env-file=.env scripts/test-razorpay.js

# Run State Admin Governance & Exclusivity Verification
node scripts/test-state-admin-flow.js
```

---

## 🌐 Cloud Deployment (Vercel + Render)

### Backend — Render
1. Create a new **Web Service** on Render and connect your repository.
2. Root Directory: `server`.
3. Build Command: `npm install`.
4. Start Command: `npm start`.
5. Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Atlas connection URI>`
   - `JWT_SECRET`: `<32+ char secret>`
   - `CLIENT_ORIGIN`: `https://your-vercel-app.vercel.app`
   - `COOKIE_SECURE`: `true`
   - `RAZORPAY_KEY_ID`: `rzp_test_U0LVtkVMwaZDzo`
   - `RAZORPAY_KEY_SECRET`: `luaXnCFDlvvtb8aYlAwaDRQ6`
6. Health Check Path: `/api/health`.

### Frontend — Vercel
1. Import your repository into Vercel.
2. Root Directory: `client`.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-render-service.onrender.com`
   - `VITE_RAZORPAY_KEY_ID`: `rzp_test_U0LVtkVMwaZDzo`
6. Deploy.
