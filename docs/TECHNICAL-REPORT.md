# Engineering Technical Report — YatraSetu

**Assessment Organization:** ALGIONS AI LABS PRIVATE LIMITED  
**Candidate Domain:** Full-Stack Web Development Placement Assessment  
**Project:** YatraSetu — Bus Booking & Operations Portal  
**Document Target Audience:** Senior Technical Evaluators & B.Tech CSE Placement Review Panel

---

## 1. Executive Summary

Intercity bus transit in India is an operationally intensive sector characterized by multi-operator fleets, intermediate boarding/dropping points, dynamic seat capacities, and high booking concurrency. A frequent flaw in basic reservation platforms is race conditions where concurrent requests double-book the same seat, or where cancellation policies are executed client-side without data atomicity.

**YatraSetu** was engineered as an enterprise-grade full-stack solution to resolve these challenges. The system enforces strict MongoDB ACID transaction guarantees, server-authoritative seat reservation locks, role-based access control (RBAC), distance-proportional fare computation, and an interactive state-transport-inspired user experience with custom dark/light themes.

---

## 2. System Architecture & Technology Stack

```text
┌────────────────────────────────────────────────────────┐
│             Client Layer (React.js + Vite)             │
│  - Tailwind CSS v4.3.5 (CSS-first @import & variables) │
│  - React Router DOM + TanStack React Query             │
│  - Interactive Visual Seat Layout (2+2 / 2+1 Sleeper)  │
│  - Recharts for Operational Dashboards                 │
└───────────────────────────┬────────────────────────────┘
                            │ Same-Origin /api Rewrite (Proxy)
┌───────────────────────────▼────────────────────────────┐
│              API Layer (Express.js / Node.js)          │
│  - Versioned REST Architecture (/api/v1)               │
│  - Helmet Security Headers & Rate Limiting             │
│  - HttpOnly Cookie JWT Authentication + RBAC           │
│  - Zod Request Validation & Centralized Error Handler   │
└───────────────────────────┬────────────────────────────┘
                            │ ACID Transactions (WiredTiger)
┌───────────────────────────▼────────────────────────────┐
│            Persistence Layer (MongoDB Atlas)           │
│  - Compound Unique Index: { tripId: 1, seatNumber: 1 } │
│  - Normalized Schema (User, Trip, Bus, SeatInventory)  │
│  - Immutable Operational Audit Trail                   │
└────────────────────────────────────────────────────────┘
```

### Core Technology Choices & Rationale
1. **ES Modules (`"type": "module"`)**: Pure ES Module imports/exports across frontend and backend, avoiding legacy CommonJS antipatterns.
2. **Tailwind CSS v4.3.5**: Uses the official `@tailwindcss/vite` plugin with `@import "tailwindcss";` and `@custom-variant dark (&:where(.dark, .dark *));`. Semantic CSS custom properties (`--background`, `--card`, `--primary`) enable instant theme toggling without layout shift.
3. **Mongoose ODM & MongoDB Atlas**: Provides flexible schema definitions with strict type validators, compound indexing, and cross-document transactional sessions.
4. **Vitest + Supertest + mongodb-memory-server**: Unit and integration test suite executing against an in-memory replica set to validate concurrent transactions in automated CI/CD pipelines.

---

## 3. Database Design & Data Integrity

The persistence model separates operational schedules from transient seat reservations:

1. **`SeatInventory` (`tripId`, `seatNumber`, `status`, `bookingId`)**:
   - Enforces a **compound unique index**: `{ tripId: 1, seatNumber: 1 }`.
   - Isolates individual seats so inventory can be queried and locked without writing large, contention-prone array mutations on the parent `Trip` document.
2. **`Trip`**:
   - Stores departure and arrival timestamps as UTC `Date` objects.
   - Converts Indian Standard Time (IST, UTC+05:30) search queries using deterministic calendar boundaries.
3. **`Route` & Intermediate Stop Calculation**:
   - Preserves stop sequence via ordered arrays. Fares are calculated proportionally based on segment distance rather than arbitrary flat fees.

---

## 4. The Critical Seat Booking Integrity Mechanism

### The Concurrency Problem
When two passengers browse the same bus departure, both clients may receive seat `1A` as available. If both click "Confirm" within milliseconds of each other, naive application logic (`find -> if available -> update`) suffers from a Time-of-Check to Time-of-Use (**TOCTOU**) race condition.

### The Engineered Transactional Solution
YatraSetu implements a **6-step ACID protocol**:
```javascript
// 1. Start MongoDB session and transaction
const session = await mongoose.startSession();
session.startTransaction();

// 2. Conditionally claim seat ONLY IF current status is AVAILABLE
const updatedSeat = await SeatInventory.findOneAndUpdate(
  { tripId, seatNumber, status: SEAT_STATUS.AVAILABLE },
  { $set: { status: SEAT_STATUS.BOOKED } },
  { session, new: true }
);

// 3. Check predicate result
if (!updatedSeat) {
  // Concurrency conflict: another user won the lock
  await session.abortTransaction();
  throw new BookingConflictError('Seat is no longer available.', [seatNumber]);
}

// 4. Create Booking record with unique PNR
const booking = new Booking({ pnr: generatePNR(), ...payload });
await booking.save({ session });

// 5. Associate seat with booking ID & create Audit Log
await SeatInventory.updateOne({ _id: updatedSeat._id }, { bookingId: booking._id }, { session });

// 6. Commit transaction atomically
await session.commitTransaction();
```

### Verification Evidence
During automated concurrency testing, two simultaneous requests were dispatched for Seat `1A`. The test verified that:
- Request 1 succeeded with **HTTP 201 Created**.
- Request 2 received **HTTP 409 Conflict** (`SEAT_UNAVAILABLE`).
- The database contained exactly one confirmed booking.

---

## 5. Cancellation & Refund Business Logic

Cancellations are governed by an editable **`CancellationPolicy`**:
- **≥ 24 hours before departure**: 100% simulated refund.
- **6 to < 24 hours before departure**: 50% simulated refund.
- **< 6 hours before departure**: 0% refund.
- **After departure**: Cancellation is strictly prohibited by backend services.

When cancelled, a MongoDB transaction atomically:
1. Marks the booking status as `CANCELLED`.
2. Computes the refund amount based on active policy tiers and hours remaining.
3. Sets `SeatInventory` status back to `AVAILABLE` and clears `bookingId`.
4. Creates an immutable `AuditLog` entry.

---

## 6. Security Architecture & RBAC

1. **HttpOnly Cookie Authentication**: Prevents Cross-Site Scripting (XSS) token theft. Bearer token fallback is also supported.
2. **Server-Side Authorization**: Three distinct security roles:
   - `CUSTOMER`: Access to personal bookings, ticket views, and search.
   - `OPERATOR`: Scoped access strictly limited to the operator's assigned fleet. Operators cannot view or manipulate manifests belonging to other transit corporations.
   - `ADMIN`: Global management of operators, buses, stops, routes, cancellation policies, and audit logs.
3. **Helmet & Rate Limiting**: Protects against brute-force credential stuffing (50 requests/15min on `/api/v1/auth/*`) and common HTTP header vulnerabilities.

---

## 7. Known Limitations & Future Roadmap

- **Simulated Payments**: Real payment gateways (e.g. Razorpay, Stripe) were omitted in strict compliance with the placement guidelines prohibiting paid service integrations.
- **Push Notifications**: Future iterations can integrate WhatsApp or SMS gateways (e.g. Twilio) to transmit ticket PDFs upon booking confirmation.
- **Dynamic Surge Pricing**: Adding machine-learning pricing models based on occupancy velocity and holiday demand corridors.

