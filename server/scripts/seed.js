import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import Operator from '../src/models/Operator.js';
import Bus from '../src/models/Bus.js';
import Stop from '../src/models/Stop.js';
import Route from '../src/models/Route.js';
import Trip from '../src/models/Trip.js';
import SeatInventory from '../src/models/SeatInventory.js';
import Booking from '../src/models/Booking.js';
import CancellationPolicy from '../src/models/CancellationPolicy.js';
import { USER_ROLES, BOOKING_STATUS, SEAT_STATUS, PAYMENT_STATUS } from '../src/config/constants.js';

const SEED_PASSWORD = process.env.DEMO_SEED_PASSWORD || 'Password@123';

const generateSeats = (totalSeats, layoutType = '2+2') => {
  const seats = [];
  const cols = layoutType === '2+1' ? 3 : 4;
  const rows = Math.ceil(totalSeats / cols);
  let current = 1;
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      if (current > totalSeats) break;
      const colLetter = String.fromCharCode(64 + c);
      seats.push({
        seatNumber: `${r}${colLetter}`,
        row: r,
        col: c,
        deck: 'LOWER',
        type: layoutType.includes('Sleeper') ? 'SLEEPER' : 'SEATER'
      });
      current++;
    }
  }
  return { rows, columns: cols, layoutType, seats };
};

export const runSeed = async (mongoUri = process.env.MONGODB_URI) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    console.log('[Seed] Connected to database. Preparing seed data...');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, salt);

    // 1. Cancellation Policy
    let policy = await CancellationPolicy.findOne({ active: true });
    if (!policy) {
      policy = await CancellationPolicy.create({
        policyName: 'Official State Transport Cancellation Policy',
        refundTiers: [
          { minHoursBeforeDeparture: 24, refundPercentage: 100 },
          { minHoursBeforeDeparture: 6, refundPercentage: 50 },
          { minHoursBeforeDeparture: 0, refundPercentage: 0 }
        ],
        active: true
      });
      console.log('[Seed] Cancellation policy created.');
    }

    // 2. Operators
    const operatorsData = [
      {
        name: 'Delhi State Road Transport Corporation (DSRTC)',
        operatorCode: 'DSRTC',
        contactEmail: 'dsrtc.ops@yatrasetu.gov.in',
        phone: '+91-11-23860255',
        address: 'ISBT Kashmere Gate, New Delhi',
        status: 'ACTIVE'
      },
      {
        name: 'Rajasthan State Road Transport Corporation (RSRTC)',
        operatorCode: 'RSRTC',
        contactEmail: 'rsrtc.ops@yatrasetu.gov.in',
        phone: '+91-141-2200388',
        address: 'Parivahan Marg, Chomu House, Jaipur',
        status: 'ACTIVE'
      },
      {
        name: 'Punjab State Roadways (PUNBUS)',
        operatorCode: 'PUNBUS',
        contactEmail: 'punbus.ops@yatrasetu.gov.in',
        phone: '+91-172-2704255',
        address: 'Sector 17, Chandigarh',
        status: 'ACTIVE'
      }
    ];

    const operatorDocs = [];
    for (const op of operatorsData) {
      let doc = await Operator.findOne({ operatorCode: op.operatorCode });
      if (!doc) {
        doc = await Operator.create(op);
      }
      operatorDocs.push(doc);
    }
    console.log(`[Seed] ${operatorDocs.length} Operators verified/seeded.`);

    // 3. Users (Admin, Operators, Customer)
    const usersData = [
      {
        name: 'Chief Transport Administrator',
        email: 'admin@yatrasetu.gov.in',
        passwordHash,
        role: USER_ROLES.ADMIN,
        phone: '+91-9876543210'
      },
      {
        name: 'Delhi Fleet Manager',
        email: 'operator.delhi@yatrasetu.gov.in',
        passwordHash,
        role: USER_ROLES.OPERATOR,
        operatorId: operatorDocs[0]._id,
        phone: '+91-9876543211'
      },
      {
        name: 'Jaipur Depot Officer',
        email: 'operator.jaipur@yatrasetu.gov.in',
        passwordHash,
        role: USER_ROLES.OPERATOR,
        operatorId: operatorDocs[1]._id,
        phone: '+91-9876543212'
      },
      {
        name: 'Vikram Sharma (Passenger)',
        email: 'customer@yatrasetu.gov.in',
        passwordHash,
        role: USER_ROLES.CUSTOMER,
        phone: '+91-9876543213'
      }
    ];

    const userDocs = [];
    for (const u of usersData) {
      let doc = await User.findOne({ email: u.email });
      if (!doc) {
        doc = await User.create(u);
      }
      userDocs.push(doc);
    }
    console.log(`[Seed] ${userDocs.length} Users verified/seeded.`);

    // 4. Stops
    const stopsData = [
      { name: 'Kashmere Gate ISBT', city: 'Delhi', state: 'Delhi', stopCode: 'DEL-KG' },
      { name: 'Sarai Kale Khan ISBT', city: 'Delhi', state: 'Delhi', stopCode: 'DEL-SKK' },
      { name: 'IFFCO Chowk', city: 'Gurgaon', state: 'Haryana', stopCode: 'GUR-IFF' },
      { name: 'Behror Midway', city: 'Behror', state: 'Rajasthan', stopCode: 'BEH-MID' },
      { name: 'Sindhi Camp Central Bus Stand', city: 'Jaipur', state: 'Rajasthan', stopCode: 'JAI-SC' },
      { name: 'Narayan Singh Circle', city: 'Jaipur', state: 'Rajasthan', stopCode: 'JAI-NSC' },
      { name: 'ISBT Sector 43', city: 'Chandigarh', state: 'Punjab & Haryana', stopCode: 'CHD-43' },
      { name: 'Ambala Cantt Junction', city: 'Ambala', state: 'Haryana', stopCode: 'AMB-CNT' },
      { name: 'Panipat Toll Terminal', city: 'Panipat', state: 'Haryana', stopCode: 'PAN-TL' },
      { name: 'Ludhiana Central Bus Stand', city: 'Ludhiana', state: 'Punjab', stopCode: 'LDH-CBS' },
      { name: 'Amritsar ISBT (Near Golden Temple)', city: 'Amritsar', state: 'Punjab', stopCode: 'ASR-ISBT' },
      { name: 'Jalandhar City Bus Stand', city: 'Jalandhar', state: 'Punjab', stopCode: 'JAL-CBS' },
      { name: 'Idgah Bus Stand', city: 'Agra', state: 'Uttar Pradesh', stopCode: 'AGR-IDG' }
    ];

    const stopMap = new Map();
    for (const s of stopsData) {
      let doc = await Stop.findOne({ stopCode: s.stopCode });
      if (!doc) {
        doc = await Stop.create(s);
      }
      stopMap.set(s.stopCode, doc);
    }
    console.log(`[Seed] ${stopMap.size} Stops verified/seeded.`);

    // 5. Buses
    const busesData = [
      {
        operatorId: operatorDocs[0]._id,
        registrationNumber: 'DL-01-AB-1024',
        busType: 'Volvo Multi-Axle AC (2+2)',
        totalSeats: 40,
        amenities: ['AC', 'WiFi', 'Charging Point', 'Emergency Hammer', 'Water Bottle', 'CCTV'],
        seatLayoutType: '2+2'
      },
      {
        operatorId: operatorDocs[0]._id,
        registrationNumber: 'DL-01-CD-2048',
        busType: 'Deluxe Express (2+2)',
        totalSeats: 44,
        amenities: ['Emergency Hammer', 'First Aid', 'Reading Light'],
        seatLayoutType: '2+2'
      },
      {
        operatorId: operatorDocs[1]._id,
        registrationNumber: 'RJ-14-PA-3301',
        busType: 'AC Sleeper (2+1)',
        totalSeats: 30,
        amenities: ['AC', 'Blanket', 'Pillow', 'Charging Point', 'Reading Light'],
        seatLayoutType: '2+1'
      },
      {
        operatorId: operatorDocs[1]._id,
        registrationNumber: 'RJ-14-PB-4402',
        busType: 'Volvo Multi-Axle AC (2+2)',
        totalSeats: 40,
        amenities: ['AC', 'WiFi', 'Blanket', 'Water Bottle', 'GPS Tracking'],
        seatLayoutType: '2+2'
      },
      {
        operatorId: operatorDocs[2]._id,
        registrationNumber: 'PB-65-AK-5501',
        busType: 'AC Seater (2+2)',
        totalSeats: 40,
        amenities: ['AC', 'Charging Point', 'Water Bottle'],
        seatLayoutType: '2+2'
      }
    ];

    const busDocs = [];
    for (const b of busesData) {
      let doc = await Bus.findOne({ registrationNumber: b.registrationNumber });
      if (!doc) {
        const layout = generateSeats(b.totalSeats, b.seatLayoutType);
        doc = await Bus.create({
          operatorId: b.operatorId,
          registrationNumber: b.registrationNumber,
          busType: b.busType,
          totalSeats: b.totalSeats,
          amenities: b.amenities,
          seatLayout: layout,
          status: 'ACTIVE'
        });
      }
      busDocs.push(doc);
    }
    console.log(`[Seed] ${busDocs.length} Buses verified/seeded.`);

    // 6. Routes
    const routesData = [
      {
        routeName: 'Delhi (Kashmere Gate) to Jaipur (Sindhi Camp)',
        routeCode: 'DEL-JAI-EXP',
        totalDistance: 270,
        estimatedDuration: '5h 30m',
        stops: [
          { stopId: stopMap.get('DEL-KG')._id, stopOrder: 1, distanceKm: 0, timeOffsetMinutes: 0 },
          { stopId: stopMap.get('GUR-IFF')._id, stopOrder: 2, distanceKm: 35, timeOffsetMinutes: 50 },
          { stopId: stopMap.get('BEH-MID')._id, stopOrder: 3, distanceKm: 140, timeOffsetMinutes: 180 },
          { stopId: stopMap.get('JAI-SC')._id, stopOrder: 4, distanceKm: 270, timeOffsetMinutes: 330 }
        ]
      },
      {
        routeName: 'Chandigarh (Sector 43) to Delhi (Kashmere Gate)',
        routeCode: 'CHD-DEL-EXP',
        totalDistance: 250,
        estimatedDuration: '4h 45m',
        stops: [
          { stopId: stopMap.get('CHD-43')._id, stopOrder: 1, distanceKm: 0, timeOffsetMinutes: 0 },
          { stopId: stopMap.get('AMB-CNT')._id, stopOrder: 2, distanceKm: 45, timeOffsetMinutes: 55 },
          { stopId: stopMap.get('PAN-TL')._id, stopOrder: 3, distanceKm: 165, timeOffsetMinutes: 195 },
          { stopId: stopMap.get('DEL-KG')._id, stopOrder: 4, distanceKm: 250, timeOffsetMinutes: 285 }
        ]
      },
      {
        routeName: 'Amritsar (ISBT) to Ludhiana (Central)',
        routeCode: 'ASR-LDH-EXP',
        totalDistance: 140,
        estimatedDuration: '2h 45m',
        stops: [
          { stopId: stopMap.get('ASR-ISBT')._id, stopOrder: 1, distanceKm: 0, timeOffsetMinutes: 0 },
          { stopId: stopMap.get('JAL-CBS')._id, stopOrder: 2, distanceKm: 80, timeOffsetMinutes: 90 },
          { stopId: stopMap.get('LDH-CBS')._id, stopOrder: 3, distanceKm: 140, timeOffsetMinutes: 165 }
        ]
      },
      {
        routeName: 'Delhi (Sarai Kale Khan) to Agra (Idgah)',
        routeCode: 'DEL-AGR-EXP',
        totalDistance: 210,
        estimatedDuration: '3h 30m',
        stops: [
          { stopId: stopMap.get('DEL-SKK')._id, stopOrder: 1, distanceKm: 0, timeOffsetMinutes: 0 },
          { stopId: stopMap.get('AGR-IDG')._id, stopOrder: 2, distanceKm: 210, timeOffsetMinutes: 210 }
        ]
      }
    ];

    const routeDocs = [];
    for (const r of routesData) {
      let doc = await Route.findOne({ routeCode: r.routeCode });
      if (!doc) {
        doc = await Route.create(r);
      }
      routeDocs.push(doc);
    }
    console.log(`[Seed] ${routeDocs.length} Routes verified/seeded.`);

    // 7. Trips (Dynamic future dates for today, tomorrow, and subsequent days)
    const now = new Date();
    const tripSchedules = [
      // Day 0 (Today + 4 hours)
      {
        route: routeDocs[0],
        bus: busDocs[0],
        operator: operatorDocs[0],
        depOffsetHours: 4,
        durationMinutes: 330,
        baseFare: 750
      },
      // Day 0 evening
      {
        route: routeDocs[0],
        bus: busDocs[2],
        operator: operatorDocs[1],
        depOffsetHours: 8,
        durationMinutes: 360,
        baseFare: 890
      },
      // Tomorrow Morning
      {
        route: routeDocs[0],
        bus: busDocs[3],
        operator: operatorDocs[1],
        depOffsetHours: 24,
        durationMinutes: 330,
        baseFare: 720
      },
      // Tomorrow Afternoon (Chandigarh -> Delhi)
      {
        route: routeDocs[1],
        bus: busDocs[4],
        operator: operatorDocs[2],
        depOffsetHours: 28,
        durationMinutes: 285,
        baseFare: 550
      },
      // Day 2 (Amritsar -> Ludhiana)
      {
        route: routeDocs[2],
        bus: busDocs[4],
        operator: operatorDocs[2],
        depOffsetHours: 48,
        durationMinutes: 165,
        baseFare: 320
      },
      // Day 3 (Delhi -> Agra)
      {
        route: routeDocs[3],
        bus: busDocs[1],
        operator: operatorDocs[0],
        depOffsetHours: 72,
        durationMinutes: 210,
        baseFare: 450
      }
    ];

    const tripDocs = [];
    for (let i = 0; i < tripSchedules.length; i++) {
      const s = tripSchedules[i];
      const departureAt = new Date(now.getTime() + s.depOffsetHours * 60 * 60 * 1000);
      const arrivalAt = new Date(departureAt.getTime() + s.durationMinutes * 60 * 1000);

      // Check existing trip on same route, bus, and approx departure
      let trip = await Trip.findOne({
        routeId: s.route._id,
        busId: s.bus._id,
        departureAt: {
          $gte: new Date(departureAt.getTime() - 60 * 60 * 1000),
          $lte: new Date(departureAt.getTime() + 60 * 60 * 1000)
        }
      });

      if (!trip) {
        trip = await Trip.create({
          routeId: s.route._id,
          busId: s.bus._id,
          operatorId: s.operator._id,
          departureAt,
          arrivalAt,
          baseFare: s.baseFare,
          status: 'SCHEDULED'
        });

        // Initialize SeatInventory for this trip
        const busSeats = s.bus.seatLayout?.seats || [];
        const seatDocs = busSeats.map(st => ({
          tripId: trip._id,
          seatNumber: st.seatNumber,
          status: SEAT_STATUS.AVAILABLE
        }));
        if (seatDocs.length > 0) {
          await SeatInventory.insertMany(seatDocs);
        }
      }
      tripDocs.push(trip);
    }
    console.log(`[Seed] ${tripDocs.length} Future Trips verified/seeded.`);

    // 8. Demo Booking (Seed one confirmed booking on Trip 0 for Vikram Sharma)
    const demoTrip = tripDocs[0];
    const customerUser = userDocs[3]; // Vikram Sharma
    const existingDemoBooking = await Booking.findOne({ userId: customerUser._id, tripId: demoTrip._id });

    if (!existingDemoBooking) {
      const demoSeats = ['1A', '1B'];
      const demoBooking = await Booking.create({
        pnr: 'YS7A9K2M',
        userId: customerUser._id,
        tripId: demoTrip._id,
        boardingStopId: stopMap.get('DEL-KG')._id,
        droppingStopId: stopMap.get('JAI-SC')._id,
        passengers: [
          {
            name: 'Vikram Sharma',
            age: 32,
            gender: 'MALE',
            seatNumber: '1A',
            phone: '+91-9876543213',
            email: 'customer@yatrasetu.gov.in'
          },
          {
            name: 'Ananya Sharma',
            age: 29,
            gender: 'FEMALE',
            seatNumber: '1B',
            phone: '+91-9876543213',
            email: 'ananya@example.com'
          }
        ],
        seatNumbers: demoSeats,
        fareBreakdown: {
          perPassengerFare: 750,
          baseFareTotal: 1500,
          gstAmount: 75,
          serviceFee: 20
        },
        totalAmount: 1595,
        status: BOOKING_STATUS.CONFIRMED,
        paymentStatus: PAYMENT_STATUS.SIMULATED_SUCCESS,
        bookingDate: new Date()
      });

      // Mark seats 1A and 1B as BOOKED in SeatInventory
      await SeatInventory.updateMany(
        {
          tripId: demoTrip._id,
          seatNumber: { $in: demoSeats }
        },
        {
          $set: {
            status: SEAT_STATUS.BOOKED,
            bookingId: demoBooking._id
          }
        }
      );

      console.log(`[Seed] Demo booking created with PNR ${demoBooking.pnr} for ${customerUser.name}.`);
    }

    console.log('\n========================================');
    console.log('✅ YATRASETU DATABASE SEED COMPLETE');
    console.log('========================================');
    console.log('Demo Credentials:');
    console.log('• Admin:    admin@yatrasetu.gov.in / ' + SEED_PASSWORD);
    console.log('• Operator: operator.delhi@yatrasetu.gov.in / ' + SEED_PASSWORD);
    console.log('• Operator: operator.jaipur@yatrasetu.gov.in / ' + SEED_PASSWORD);
    console.log('• Customer: customer@yatrasetu.gov.in / ' + SEED_PASSWORD);
    console.log('========================================\n');

    return { success: true };
  } catch (err) {
    console.error('[Seed Error] Failed to seed database:', err);
    throw err;
  }
};

// Execute if run directly from CLI
if (process.argv[1]?.includes('seed.js')) {
  runSeed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

