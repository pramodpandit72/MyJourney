# Demo Walkthrough Recording Script & Interview Checklist

**Project:** YatraSetu — Bus Booking & Operations Portal  
**Target Duration:** 3–5 Minutes  
**Purpose:** Placement Demonstration Video Script & Live Interview Guide for ALGIONS AI LABS Reviewers

> [!NOTE]
> This document provides the structured spoken script, camera actions, and presentation checklist for the candidate. No video is pre-recorded.

---

## Technical Demonstration Checklist (Before Recording)
- [ ] Backend server running on `http://localhost:5000`
- [ ] Frontend client running on `http://localhost:5173`
- [ ] Database seeded with demo records (`npm run seed` in `server`)
- [ ] Browser window open with DevTools (Network tab ready to inspect `/api/v1` calls)
- [ ] Both Light Mode and Dark Mode functioning via navbar toggle

---

## Video Script (3–5 Minutes)

### Scene 1: Landing Page & Architectural Identity (0:00 – 0:45)
**Screen Action:** Open `http://localhost:5173`. Show the hero banner, navbar with logo, search form, and footer disclaimer. Click the Sun/Moon icon to toggle Light and Dark modes.  
**Spoken Dialogue:**
> "Hello, I am presenting **YatraSetu**, a full-stack intercity bus booking and fleet operations management portal developed for the ALGIONS AI LABS placement evaluation.
>
> As you can see, the application adopts an institutional, government-transport-inspired design language with deep navy blue, accessible contrast, and full Dark Mode support powered by Tailwind CSS v4.3.5 and CSS custom properties.
>
> We notice the compliance ribbon at the top and the mandatory academic disclaimer in the footer. Every form, table, and button here connects to a real Express REST API backed by MongoDB Atlas."

---

### Scene 2: Customer Authentication & Fast-Login Demo (0:45 – 1:15)
**Screen Action:** Click "Sign In" in the navbar. Point to the reviewer demo credential cards. Click "👤 Passenger (`customer@yatrasetu.gov.in`)". Submit login.  
**Spoken Dialogue:**
> "Let's authenticate. To make reviewing effortless, I have built quick-fill credential buttons for all three roles: Customer, Administrator, and Regional Fleet Operators.
>
> Clicking the Passenger button fills `customer@yatrasetu.gov.in`. On sign in, the server hashes the password with bcrypt, generates a signed JWT, and attaches it in a secure HttpOnly cookie."

---

### Scene 3: Search Buses & Dynamic Segment Fares (1:15 – 2:00)
**Screen Action:** Navigate to "Search Buses". Select "Delhi (Kashmere Gate)" to "Jaipur (Sindhi Camp)", set travel date, and click "Search Buses". Show the filter sidebar and trip cards.  
**Spoken Dialogue:**
> "Now let's search for an intercity bus. I select Delhi to Jaipur for tomorrow. Notice how the query retrieves scheduled trips from MongoDB.
>
> The backend verifies that the boarding stop occurs strictly before the dropping stop in the route sequence, and computes the segment fare proportionally based on distance. We can filter by bus category, departure times, and price ranges."

---

### Scene 4: Interactive Seat Selection & ACID Booking Guarantee (2:00 – 2:50)
**Screen Action:** Click "Select Seats" on a Volvo AC bus. Show the visual 2+2 seat layout. Click Seat `1A` and `1B`. Fill in passenger details. Click "Confirm & Book Ticket". Show the issued e-ticket.  
**Spoken Dialogue:**
> "Clicking 'Select Seats' opens our interactive bus layout. Green indicates available seats, blue shows selected seats, and gray indicates already booked seats.
>
> This is where the core engineering highlight occurs: **Seat Booking Integrity**. When I click Confirm, the backend initiates a MongoDB ACID transaction. It performs a conditional atomic update on `SeatInventory` requiring `status: AVAILABLE`.
>
> If two passengers attempt to book seat `1A` at the exact same millisecond, MongoDB's atomic transaction allows exactly one to succeed while throwing a 409 Conflict for the other. Here, our booking succeeds, generating an authentic PNR `YS...` and issuing this printable government-style e-ticket."

---

### Scene 5: Ticket Cancellation & Simulated Refund Service (2:50 – 3:30)
**Screen Action:** Go to "My Bookings". Click "Cancel Ticket". Show the policy breakdown (100% refund for >24h). Confirm cancellation. Notice the status turns to `CANCELLED` and seats return to available.  
**Spoken Dialogue:**
> "Under 'My Bookings', the passenger can review upcoming and historical journeys. Let's test the cancellation engine.
>
> Clicking 'Cancel Ticket' displays the active refund policy. Because departure is more than 24 hours away, the backend service computes a 100% simulated refund.
>
> In a single atomic transaction, the booking is marked `CANCELLED`, the refund amount is recorded, and seats `1A` and `1B` are immediately released back to `AVAILABLE` for other passengers to book."

---

### Scene 6: Operator Fleet Manifest & Tenant Isolation (3:30 – 4:15)
**Screen Action:** Sign out. Click "🚌 Delhi Ops" to log in as Operator. Navigate to `/operator/manifests`. Show the confirmed passenger manifest table.  
**Spoken Dialogue:**
> "Now let's switch to the Bus Operator perspective. Notice the Operator portal is strictly isolated.
>
> Under 'Passenger Manifests', the fleet staff can see confirmed passengers, seat allocations, boarding points, and contact numbers. Notice that cancelled passengers are automatically excluded from the active boarding manifest.
>
> Crucially, row-level tenant security in Express middleware prevents this Delhi operator from accessing trips or manifests belonging to Rajasthan Roadways."

---

### Scene 7: Administrator Analytics & Test Suite Walkthrough (4:15 – 5:00)
**Screen Action:** Switch to Administrator account. Show the Admin Dashboard with Recharts booking volume trends, route bar charts, and status pie charts. Open terminal briefly to show `npm test` passing 31/31 tests.  
**Spoken Dialogue:**
> "Finally, let's explore the Administrator console. Here we see live system analytics rendered with Recharts: booking volume trends, route-wise passenger distribution, and overall fleet occupancy.
>
> The administrator has complete CRUD control over transit operators, buses, stops, routes, and editable cancellation policy refund tiers.
>
> In terminal, our automated test suite runs 31 comprehensive unit and integration tests using Vitest and mongodb-memory-server with replica-set transactions, verifying everything from concurrency race conditions to RBAC boundaries.
>
> Thank you. I welcome your questions regarding the architecture."

