# Entity-Relationship (ER) Diagram — YatraSetu

## Architecture & Relational Topology in MongoDB Atlas

Below is the normalized relational schema implemented using **Mongoose ODM**. It enforces strict foreign-key referencing, compound uniqueness constraints, and transactional consistency.

```mermaid
erDiagram
    OPERATOR ||--o{ BUS : owns
    OPERATOR ||--o{ USER : employs_staff
    OPERATOR ||--o{ TRIP : operates

    BUS ||--o{ TRIP : assigned_to

    ROUTE ||--o{ TRIP : defines_path
    STOP ||--o{ ROUTE : "stops (ordered array)"

    TRIP ||--o{ SEAT_INVENTORY : has_seats
    TRIP ||--o{ BOOKING : reserved_on

    USER ||--o{ BOOKING : books
    BOOKING ||--o{ SEAT_INVENTORY : claims

    USER ||--o{ AUDIT_LOG : triggers
    USER ||--o{ CANCELLATION_POLICY : updates

    USER {
        ObjectId _id PK
        string name
        string email UK "Indexed"
        string passwordHash
        string role "ADMIN | OPERATOR | CUSTOMER"
        ObjectId operatorId FK "Nullable"
        string phone
        boolean isActive
        Date createdAt
        Date updatedAt
    }

    OPERATOR {
        ObjectId _id PK
        string name
        string operatorCode UK "Indexed"
        string contactEmail
        string phone
        string address
        string status "ACTIVE | INACTIVE"
        Date createdAt
        Date updatedAt
    }

    BUS {
        ObjectId _id PK
        ObjectId operatorId FK
        string registrationNumber UK "Indexed"
        string busType
        number totalSeats
        object seatLayout "rows, columns, layoutType, seats[]"
        string[] amenities
        string status "ACTIVE | MAINTENANCE | INACTIVE"
        Date createdAt
        Date updatedAt
    }

    STOP {
        ObjectId _id PK
        string name
        string city "Indexed"
        string state
        string stopCode UK "Indexed"
        string status "ACTIVE | INACTIVE"
        Date createdAt
        Date updatedAt
    }

    ROUTE {
        ObjectId _id PK
        string routeName
        string routeCode UK "Indexed"
        number totalDistance
        string estimatedDuration
        object[] stops "stopId FK, stopOrder, distanceKm, timeOffsetMinutes"
        string status "ACTIVE | INACTIVE"
        Date createdAt
        Date updatedAt
    }

    TRIP {
        ObjectId _id PK
        ObjectId routeId FK "Indexed"
        ObjectId busId FK "Indexed"
        ObjectId operatorId FK "Indexed"
        Date departureAt "Indexed (UTC)"
        Date arrivalAt
        number baseFare
        string currency "INR"
        string status "SCHEDULED | ON_ROUTE | COMPLETED | CANCELLED"
        Date createdAt
        Date updatedAt
    }

    SEAT_INVENTORY {
        ObjectId _id PK
        ObjectId tripId FK "Indexed"
        string seatNumber "Indexed"
        string status "AVAILABLE | BOOKED"
        ObjectId bookingId FK "Nullable, Indexed"
        Date createdAt
        Date updatedAt
    }

    BOOKING {
        ObjectId _id PK
        string pnr UK "Indexed"
        ObjectId userId FK "Indexed"
        ObjectId tripId FK "Indexed"
        ObjectId boardingStopId FK
        ObjectId droppingStopId FK
        object[] passengers "name, age, gender, seatNumber, phone, email"
        string[] seatNumbers
        object fareBreakdown "perPassengerFare, baseFareTotal, gstAmount, serviceFee"
        number totalAmount
        string status "CONFIRMED | CANCELLED"
        string paymentStatus "SIMULATED_SUCCESS"
        object cancellationDetails "cancelledAt, reason, refundPercentage, hoursBeforeDeparture"
        number refundAmount
        string refundStatus "NOT_APPLICABLE | SIMULATED_PROCESSED | NOT_ELIGIBLE"
        Date bookingDate "Indexed"
        Date createdAt
        Date updatedAt
    }

    CANCELLATION_POLICY {
        ObjectId _id PK
        string policyName
        object[] refundTiers "minHoursBeforeDeparture, refundPercentage"
        boolean active
        ObjectId updatedBy FK
        Date createdAt
        Date updatedAt
    }

    AUDIT_LOG {
        ObjectId _id PK
        ObjectId actorId FK "Nullable, Indexed"
        string actorRole
        string action "Indexed"
        string entityType "Indexed"
        string entityId
        string summary
        object details
        Date timestamp "Indexed"
    }
```

---

## Critical Database Indexes & Integrity Rules

1. **Seat Inventory Compound Unique Index**:
   ```javascript
   seatInventorySchema.index({ tripId: 1, seatNumber: 1 }, { unique: true });
   ```
   *Guarantees at database-engine level that no trip can ever have duplicate seat allocation records.*

2. **PNR Unique Index**:
   ```javascript
   bookingSchema.index({ pnr: 1 }, { unique: true });
   ```
   *Enforces official PNR uniqueness.*

3. **User Email Unique Index**:
   ```javascript
   userSchema.index({ email: 1 }, { unique: true });
   ```

4. **Trip Composite Index**:
   ```javascript
   tripSchema.index({ routeId: 1, departureAt: 1, status: 1 });
   ```
   *Optimizes high-throughput travel date range queries and route segment lookups.*

