# Booking Sequence Diagram & Concurrency Resolution

This document illustrates the end-to-end transactional booking workflow in **YatraSetu**, highlighting the ACID isolation guarantees that prevent race conditions and double bookings.

```mermaid
sequenceDiagram
    autonumber
    actor CustomerA as Passenger A
    actor CustomerB as Passenger B (Concurrent)
    participant ReactClient as React Frontend
    participant API as Express API Router
    participant BookingService as Booking Business Service
    participant MongoSession as MongoDB Session & Transaction
    participant SeatCollection as SeatInventory (MongoDB)
    participant BookingCollection as Booking (MongoDB)

    Note over CustomerA, CustomerB: Both users view Seat 1A as "AVAILABLE" and click Confirm simultaneously

    CustomerA->>API: POST /api/v1/bookings (Trip: T1, Seats: ["1A"])
    CustomerB->>API: POST /api/v1/bookings (Trip: T1, Seats: ["1A"])

    rect rgb(240, 248, 255)
        Note over API, BookingService: Validation & Session Initialization
        API->>BookingService: Verify JWT Token, Route Sequence & Fare
        BookingService->>MongoSession: mongoose.startSession() & session.startTransaction()
    end

    rect rgb(255, 250, 240)
        Note over BookingService, SeatCollection: Atomic Conditional Seat Lock
        BookingService->>SeatCollection: findOneAndUpdate({ tripId: T1, seatNumber: "1A", status: "AVAILABLE" }, { $set: { status: "BOOKED" } }, { session })
    end

    alt Passenger A's atomic update completes first
        SeatCollection-->>BookingService: Returns Updated Seat 1A Document
        BookingService->>BookingCollection: Save New Booking (PNR: "YS7K9X2A", Seats: ["1A"])
        BookingService->>MongoSession: session.commitTransaction()
        BookingService-->>API: 201 Created (Booking details & PNR)
        API-->>CustomerA: HTTP 201 Created — Redirect to /ticket/YS7K9X2A
    else Passenger B's atomic update finds status != AVAILABLE or hits WriteConflict
        SeatCollection-->>BookingService: Returns null (Condition status == AVAILABLE failed)
        BookingService->>MongoSession: session.abortTransaction()
        BookingService-->>API: Throw BookingConflictError (Code: "SEAT_UNAVAILABLE")
        API-->>CustomerB: HTTP 409 Conflict — "Seat 1A is no longer available"
        ReactClient-->>CustomerB: Refresh Seat Map & Display Conflict Warning
    end
```

---

## Technical Analysis of the ACID Concurrency Guarantee

1. **Conditional Predicate**:
   Updates are executed using a conditional filter:
   ```javascript
   SeatInventory.findOneAndUpdate(
     { tripId, seatNumber, status: 'AVAILABLE' },
     { $set: { status: 'BOOKED' } },
     { session, new: true }
   );
   ```
   If another transaction has committed or locked the record, the condition evaluates to `null`.

2. **Transaction Rollback on Partial Failures**:
   If a customer reserves multiple seats (e.g., `["2A", "2B", "2C"]`) and even one seat fails the availability condition, `session.abortTransaction()` is invoked immediately. No orphan or partial bookings are ever committed.

3. **Database Write Conflict Handling**:
   When simultaneous transactions attempt concurrent document modifications, MongoDB triggers a `WriteConflict` (`code: 112`, `TransientTransactionError`). The server catches this error specifically and maps it to HTTP `409 Conflict` (`SEAT_UNAVAILABLE`).

