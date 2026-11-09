# REST API Documentation — YatraSetu

Version: `1.0.0`  
Base URL Prefix: `/api/v1`  
Interactive Swagger UI: `http://localhost:5000/api/docs`  
OpenAPI 3.0 Specification: `/api/docs.json`

---

## Standard Response Envelopes

### Success Envelope (HTTP 200 / 201)
```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {}
}
```

### Error Envelope (HTTP 400 / 401 / 403 / 404 / 409 / 500)
```json
{
  "success": false,
  "error": {
    "code": "SEAT_UNAVAILABLE",
    "message": "One or more selected seats have already been claimed by another passenger.",
    "details": []
  }
}
```

---

## 1. Authentication & Session Endpoints

### 1.1 Register Passenger Account
- **Endpoint:** `POST /api/v1/auth/register`
- **Auth:** Public
- **Rate Limit:** 50 requests / 15 minutes
- **Body:**
  ```json
  {
    "name": "Vikram Sharma",
    "email": "vikram@example.com",
    "password": "Password@123",
    "phone": "+91-9876543210"
  }
  ```
- **Responses:**
  - `201 Created`: Sets HttpOnly cookie `token` and returns user object.
  - `409 Conflict`: `EMAIL_EXISTS`

### 1.2 User Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Auth:** Public
- **Body:**
  ```json
  {
    "email": "customer@yatrasetu.gov.in",
    "password": "Password@123"
  }
  ```
- **Responses:**
  - `200 OK`: Sets HttpOnly cookie `token` and returns user profile.
  - `401 Unauthorized`: `INVALID_CREDENTIALS`

### 1.3 User Logout
- **Endpoint:** `POST /api/v1/auth/logout`
- **Auth:** Public
- **Responses:**
  - `200 OK`: Clears authentication cookie.

### 1.4 Current User Profile
- **Endpoint:** `GET /api/v1/auth/me`
- **Auth:** Authenticated (`Bearer <token>` or HttpOnly cookie)
- **Responses:**
  - `200 OK`: Returns authenticated user with assigned role and operator ID.

---

## 2. Public Search Endpoints

### 2.1 Get Active Bus Stops
- **Endpoint:** `GET /api/v1/stops`
- **Auth:** Public
- **Query Parameters:** `search` (optional)
- **Responses:**
  - `200 OK`: List of active stops with cities and stop codes.

### 2.2 Search Available Trips
- **Endpoint:** `GET /api/v1/trips`
- **Auth:** Public
- **Query Parameters:**
  - `originStopId`: ObjectId of departure stop (optional)
  - `destinationStopId`: ObjectId of destination stop (optional)
  - `travelDate`: Date string (`YYYY-MM-DD`, required)
  - `busType`: Filter by category (optional)
  - `sortBy`: `departureAt | fare | availableSeats` (default: `departureAt`)
- **Responses:**
  - `200 OK`: Matching trips with bus details, operator, calculated fare, and seat availability count.

### 2.3 Get Trip Details
- **Endpoint:** `GET /api/v1/trips/:tripId`
- **Auth:** Public
- **Responses:**
  - `200 OK`: Full trip timeline, stops, operator, and amenities.

### 2.4 Get Trip Seat Layout & Availability
- **Endpoint:** `GET /api/v1/trips/:tripId/seats`
- **Auth:** Public
- **Responses:**
  - `200 OK`: Returns seat grid layout with real-time `status: AVAILABLE | BOOKED` for every seat.

---

## 3. Passenger Booking Endpoints

### 3.1 Create Ticket Booking (Transactional)
- **Endpoint:** `POST /api/v1/bookings`
- **Auth:** Authenticated (Role: `CUSTOMER | ADMIN`)
- **Body:**
  ```json
  {
    "tripId": "654f1...",
    "boardingStopId": "654f2...",
    "droppingStopId": "654f3...",
    "passengers": [
      {
        "name": "Vikram Sharma",
        "age": 32,
        "gender": "MALE",
        "seatNumber": "1A",
        "phone": "+91-9876543210",
        "email": "vikram@example.com"
      }
    ],
    "seatNumbers": ["1A"]
  }
  ```
- **Responses:**
  - `201 Created`: Returns confirmed booking record with unique PNR.
  - `400 Bad Request`: Validation failure (e.g. invalid stop order or passenger count mismatch).
  - `409 Conflict`: `SEAT_UNAVAILABLE` (Seat was claimed by a concurrent booking).

### 3.2 Get Current User's Bookings
- **Endpoint:** `GET /api/v1/bookings/my`
- **Auth:** Authenticated
- **Query Parameters:** `status: ALL | CONFIRMED | CANCELLED`
- **Responses:**
  - `200 OK`: Array of bookings owned by the authenticated user.

### 3.3 Get Booking by PNR
- **Endpoint:** `GET /api/v1/bookings/:pnr`
- **Auth:** Authenticated (Owner, Operator of that bus, or Admin)
- **Responses:**
  - `200 OK`: Detailed ticket object.
  - `403 Forbidden`: Attempting to access another user's private ticket.
  - `404 Not Found`: PNR does not exist.

### 3.4 Cancel Confirmed Booking
- **Endpoint:** `POST /api/v1/bookings/:pnr/cancel`
- **Auth:** Authenticated (Owner or Admin)
- **Body:**
  ```json
  {
    "cancellationReason": "Change of travel schedule"
  }
  ```
- **Responses:**
  - `200 OK`: Booking status set to `CANCELLED`, seats released back to `AVAILABLE`, and simulated refund computed.
  - `400 Bad Request`: Trip has already departed.

---

## 4. Operator Endpoints (Role: OPERATOR, ADMIN)

### 4.1 Operator Dashboard
- **Endpoint:** `GET /api/v1/operator/dashboard`
- **Responses:**
  - `200 OK`: Assigned trips count, today's departures, confirmed passengers, occupancy rate.

### 4.2 Assigned Bus Schedules
- **Endpoint:** `GET /api/v1/operator/trips`
- **Responses:**
  - `200 OK`: List of trips assigned specifically to the logged-in operator's fleet.

### 4.3 Trip Passenger Manifest
- **Endpoint:** `GET /api/v1/operator/trips/:tripId/manifest`
- **Responses:**
  - `200 OK`: Passenger manifest list (Passenger name, seat number, PNR, boarding stop, dropping stop, contact phone). Excludes cancelled tickets.
  - `403 Forbidden`: Trip does not belong to the requesting operator.

### 4.4 Occupancy Capacity Report
- **Endpoint:** `GET /api/v1/operator/reports/occupancy`
- **Responses:**
  - `200 OK`: Seat inventory reconciliation report across all assigned trips.

---

## 5. Administrator Endpoints (Role: ADMIN)

### 5.1 Executive Dashboard
- **Endpoint:** `GET /api/v1/admin/dashboard`
- **Responses:**
  - `200 OK`: Aggregate KPI counts, booking trends, route-wise bookings, and status ratios.

### 5.2 Operator Management
- `GET /api/v1/admin/operators`
- `POST /api/v1/admin/operators`
- `PUT /api/v1/admin/operators/:id`

### 5.3 Bus Fleet Management
- `GET /api/v1/admin/buses`
- `POST /api/v1/admin/buses`
- `PUT /api/v1/admin/buses/:id`

### 5.4 Bus Stops Management
- `GET /api/v1/admin/stops`
- `POST /api/v1/admin/stops`
- `PUT /api/v1/admin/stops/:id`

### 5.5 Route Corridors Management
- `GET /api/v1/admin/routes`
- `POST /api/v1/admin/routes`
- `PUT /api/v1/admin/routes/:id`

### 5.6 Trip Schedules Management
- `GET /api/v1/admin/trips`
- `POST /api/v1/admin/trips`
- `PUT /api/v1/admin/trips/:id/cancel`

### 5.7 All Bookings
- `GET /api/v1/admin/bookings` (with pagination, search, and status filters)

### 5.8 Cancellation Policy Configuration
- `GET /api/v1/admin/cancellation-policy`
- `PUT /api/v1/admin/cancellation-policy`

### 5.9 System Audit Logs
- `GET /api/v1/admin/audit-logs` (with action/entity filters and pagination)

