import Booking from '../models/Booking.js';
import Operator from '../models/Operator.js';
import Bus from '../models/Bus.js';
import Stop from '../models/Stop.js';
import Route from '../models/Route.js';
import Trip from '../models/Trip.js';
import SeatInventory from '../models/SeatInventory.js';
import CancellationPolicy from '../models/CancellationPolicy.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { BOOKING_STATUS, SEAT_STATUS, USER_ROLES, VERIFICATION_STATUS } from '../config/constants.js';

// Helper to generate seat layout seats array
const generateSeatLayoutSeats = (totalSeats, layoutType = '2+2') => {
  const seats = [];
  const cols = layoutType === '2+1' ? 3 : 4;
  const rows = Math.ceil(totalSeats / cols);

  let currentSeatNumber = 1;
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      if (currentSeatNumber > totalSeats) break;
      const colLetter = String.fromCharCode(64 + c); // A, B, C, D
      seats.push({
        seatNumber: `${r}${colLetter}`,
        row: r,
        col: c,
        deck: 'LOWER',
        type: 'SEATER'
      });
      currentSeatNumber++;
    }
  }
  return { rows, columns: cols, layoutType, seats };
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: BOOKING_STATUS.CONFIRMED });
    const cancelledBookings = await Booking.countDocuments({ status: BOOKING_STATUS.CANCELLED });

    const totalOperators = await Operator.countDocuments();
    const totalBuses = await Bus.countDocuments();
    const totalStops = await Stop.countDocuments();
    const totalRoutes = await Route.countDocuments();
    const upcomingTrips = await Trip.countDocuments({
      status: 'SCHEDULED',
      departureAt: { $gte: new Date() }
    });

    // Total confirmed revenue
    const revenueAgg = await Booking.aggregate([
      { $match: { status: BOOKING_STATUS.CONFIRMED } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // Overall occupancy
    const totalSeatsInventory = await SeatInventory.countDocuments();
    const bookedSeatsInventory = await SeatInventory.countDocuments({ status: SEAT_STATUS.BOOKED });
    const occupancyPercentage = totalSeatsInventory > 0
      ? Math.round((bookedSeatsInventory / totalSeatsInventory) * 100)
      : 0;

    // Route-wise booking chart
    const routeBookingsAgg = await Booking.aggregate([
      { $match: { status: BOOKING_STATUS.CONFIRMED } },
      {
        $lookup: {
          from: 'trips',
          localField: 'tripId',
          foreignField: '_id',
          as: 'trip'
        }
      },
      { $unwind: '$trip' },
      {
        $lookup: {
          from: 'routes',
          localField: 'trip.routeId',
          foreignField: '_id',
          as: 'route'
        }
      },
      { $unwind: '$route' },
      {
        $group: {
          _id: '$route.routeName',
          bookingCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 6 }
    ]);

    const routeStats = routeBookingsAgg.map(item => ({
      route: item._id,
      bookings: item.bookingCount,
      revenue: item.totalRevenue
    }));

    // Status distribution
    const statusStats = [
      { name: 'Confirmed', count: confirmedBookings },
      { name: 'Cancelled', count: cancelledBookings }
    ];

    // Daily booking trends for past 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const trendAgg = await Booking.aggregate([
      { $match: { bookingDate: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$bookingDate' } },
          confirmed: {
            $sum: { $cond: [{ $eq: ['$status', BOOKING_STATUS.CONFIRMED] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', BOOKING_STATUS.CANCELLED] }, 1, 0] }
          },
          revenue: {
            $sum: { $cond: [{ $eq: ['$status', BOOKING_STATUS.CONFIRMED] }, '$totalAmount', 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const bookingTrends = trendAgg.map(t => ({
      date: t._id,
      confirmed: t.confirmed,
      cancelled: t.cancelled,
      revenue: t.revenue
    }));

    return sendSuccess(res, {
      summary: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
        totalOperators,
        totalBuses,
        totalStops,
        totalRoutes,
        upcomingTrips,
        totalSeatsInventory,
        bookedSeatsInventory,
        occupancyPercentage
      },
      routeStats,
      statusStats,
      bookingTrends
    });
  } catch (err) {
    next(err);
  }
};

// Operator management
export const getOperators = async (req, res, next) => {
  try {
    const operators = await Operator.find().sort({ createdAt: -1 });
    return sendSuccess(res, { operators });
  } catch (err) {
    next(err);
  }
};

export const createOperator = async (req, res, next) => {
  try {
    const operator = await Operator.create(req.body);
    await logAuditEvent({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'OPERATOR_CREATED',
      entityType: 'Operator',
      entityId: operator._id,
      summary: `Created operator: ${operator.name} (${operator.operatorCode})`
    });
    return sendSuccess(res, { operator }, 'Operator created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateOperator = async (req, res, next) => {
  try {
    const operator = await Operator.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!operator) return sendError(res, 'Operator not found', 404);
    await logAuditEvent({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'OPERATOR_UPDATED',
      entityType: 'Operator',
      entityId: operator._id,
      summary: `Updated operator: ${operator.name}`
    });
    return sendSuccess(res, { operator }, 'Operator updated successfully');
  } catch (err) {
    next(err);
  }
};

// Bus management
export const getBuses = async (req, res, next) => {
  try {
    const buses = await Bus.find().populate('operatorId', 'name operatorCode').sort({ createdAt: -1 });
    return sendSuccess(res, { buses });
  } catch (err) {
    next(err);
  }
};

export const createBus = async (req, res, next) => {
  try {
    const totalSeats = req.body.totalSeats || 40;
    const layout = generateSeatLayoutSeats(totalSeats, req.body.seatLayoutType || '2+2');

    const bus = await Bus.create({
      ...req.body,
      seatLayout: layout
    });

    await logAuditEvent({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'BUS_CREATED',
      entityType: 'Bus',
      entityId: bus._id,
      summary: `Created bus ${bus.registrationNumber} (${bus.busType}) with ${bus.totalSeats} seats.`
    });

    return sendSuccess(res, { bus }, 'Bus registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateBus = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return sendError(res, 'Bus not found', 404);

    // Prevent unsafe seat layout changes if future trips exist with confirmed bookings
    if (req.body.totalSeats && req.body.totalSeats !== bus.totalSeats) {
      const activeTrips = await Trip.find({ busId: bus._id, status: 'SCHEDULED', departureAt: { $gte: new Date() } });
      const tripIds = activeTrips.map(t => t._id);
      const bookedCount = await SeatInventory.countDocuments({ tripId: { $in: tripIds }, status: SEAT_STATUS.BOOKED });
      if (bookedCount > 0) {
        return sendError(res, 'Cannot change total seats: active booked trips are currently scheduled for this bus.', 400);
      }
      req.body.seatLayout = generateSeatLayoutSeats(req.body.totalSeats, req.body.seatLayoutType || '2+2');
    }

    const updatedBus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    return sendSuccess(res, { bus: updatedBus }, 'Bus updated successfully');
  } catch (err) {
    next(err);
  }
};

// Stops CRUD
export const getAdminStops = async (req, res, next) => {
  try {
    const stops = await Stop.find().sort({ city: 1, name: 1 });
    return sendSuccess(res, { stops });
  } catch (err) {
    next(err);
  }
};

export const createStop = async (req, res, next) => {
  try {
    const stop = await Stop.create(req.body);
    await logAuditEvent({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'STOP_CREATED',
      entityType: 'Stop',
      entityId: stop._id,
      summary: `Created stop: ${stop.name}, ${stop.city} (${stop.stopCode})`
    });
    return sendSuccess(res, { stop }, 'Stop created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateStop = async (req, res, next) => {
  try {
    const stop = await Stop.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!stop) return sendError(res, 'Stop not found', 404);
    return sendSuccess(res, { stop }, 'Stop updated successfully');
  } catch (err) {
    next(err);
  }
};

// Routes CRUD
export const getRoutes = async (req, res, next) => {
  try {
    const routes = await Route.find().populate('stops.stopId').sort({ createdAt: -1 });
    return sendSuccess(res, { routes });
  } catch (err) {
    next(err);
  }
};

export const createRoute = async (req, res, next) => {
  try {
    const route = await Route.create(req.body);
    await logAuditEvent({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'ROUTE_CREATED',
      entityType: 'Route',
      entityId: route._id,
      summary: `Created route: ${route.routeName} (${route.routeCode})`
    });
    return sendSuccess(res, { route }, 'Route created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!route) return sendError(res, 'Route not found', 404);
    return sendSuccess(res, { route }, 'Route updated successfully');
  } catch (err) {
    next(err);
  }
};

// Helper to extract states touched by a route
const getRouteStates = (route) => {
  if (!route || !Array.isArray(route.stops)) return [];
  const stateSet = new Set();
  for (const s of route.stops) {
    const st = s.stopId?.state || s.state;
    if (st) {
      st.split('&').forEach(p => stateSet.add(p.trim()));
      stateSet.add(st.trim());
    }
  }
  return Array.from(stateSet);
};

// Check if admin user has permission to manage a route/trip based on state jurisdiction
const canAdminManageState = (user, statesArray = []) => {
  if (!user || user.role !== USER_ROLES.ADMIN) return false;
  // If state admin is unverified or rejected, they have NO management permission!
  if (user.assignedState !== 'ALL' && user.verificationStatus !== VERIFICATION_STATUS.VERIFIED) return false;
  const adminState = user.assignedState || 'ALL';
  if (adminState === 'ALL') return true;
  if (!statesArray || statesArray.length === 0) return true;
  return statesArray.some(s => s.toLowerCase().includes(adminState.toLowerCase()));
};

// Trips & Timetables Management
export const getTrips = async (req, res, next) => {
  try {
    const { state } = req.query;
    const adminState = req.user?.assignedState || 'ALL';

    const trips = await Trip.find()
      .populate({
        path: 'routeId',
        populate: { path: 'stops.stopId' }
      })
      .populate('busId')
      .populate('operatorId')
      .sort({ departureAt: -1 });

    const enrichedTrips = trips.map(t => {
      const tripObj = t.toObject();
      const routeStates = getRouteStates(t.routeId);
      const primaryState = t.state || routeStates[0] || 'Interstate';
      tripObj.state = primaryState;
      tripObj.routeStates = routeStates;
      tripObj.canEdit = canAdminManageState(req.user, routeStates.length > 0 ? routeStates : [primaryState]);
      return tripObj;
    });

    let filteredTrips = enrichedTrips;
    if (state && state !== 'ALL') {
      filteredTrips = filteredTrips.filter(t =>
        t.state?.toLowerCase() === state.toLowerCase() ||
        t.routeStates?.some(s => s.toLowerCase().includes(state.toLowerCase()))
      );
    }

    return sendSuccess(res, {
      trips: filteredTrips,
      adminScope: {
        assignedState: adminState,
        isSuperAdmin: adminState === 'ALL'
      }
    });
  } catch (err) {
    next(err);
  }
};

export const createTrip = async (req, res, next) => {
  try {
    const { routeId, busId, operatorId, departureAt, arrivalAt, baseFare, state } = req.body;

    const route = await Route.findById(routeId).populate('stops.stopId');
    if (!route) return sendError(res, 'Route not found', 404);

    const bus = await Bus.findById(busId);
    if (!bus) return sendError(res, 'Bus not found', 404);

    // State permission check
    const routeStates = getRouteStates(route);
    const assignedState = req.user?.assignedState || 'ALL';
    if (!canAdminManageState(req.user, routeStates)) {
      return sendError(
        res,
        `Permission Denied: As a ${assignedState} State Administrator, you can only schedule timetables for routes serving ${assignedState}.`,
        403,
        'STATE_PERMISSION_DENIED'
      );
    }

    const tripState = state || routeStates[0] || assignedState;

    const trip = await Trip.create({
      routeId,
      busId,
      operatorId,
      departureAt: new Date(departureAt),
      arrivalAt: new Date(arrivalAt),
      baseFare,
      state: tripState,
      status: 'SCHEDULED'
    });

    // Automatically seed initial SeatInventory for this trip based on the bus layout
    const busSeats = bus.seatLayout?.seats || [];
    const seatDocs = busSeats.map(s => ({
      tripId: trip._id,
      seatNumber: s.seatNumber,
      status: SEAT_STATUS.AVAILABLE
    }));

    if (seatDocs.length > 0) {
      await SeatInventory.insertMany(seatDocs);
    }

    await logAuditEvent({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'TRIP_CREATED',
      entityType: 'Trip',
      entityId: trip._id,
      summary: `[${tripState}] Scheduled new timetable on route ${route.routeName} (${route.routeCode}) with bus ${bus.registrationNumber}.`
    });

    return sendSuccess(res, { trip }, 'Trip timetable scheduled and seat inventory initialized', 201);
  } catch (err) {
    next(err);
  }
};

export const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id).populate({
      path: 'routeId',
      populate: { path: 'stops.stopId' }
    });
    if (!trip) return sendError(res, 'Trip timetable not found', 404);

    // State permission check
    const routeStates = getRouteStates(trip.routeId);
    const assignedState = req.user?.assignedState || 'ALL';
    if (!canAdminManageState(req.user, routeStates.length > 0 ? routeStates : [trip.state])) {
      return sendError(
        res,
        `Permission Denied: As a ${assignedState} State Administrator, you do not have permission to modify bus timetables outside ${assignedState}.`,
        403,
        'STATE_PERMISSION_DENIED'
      );
    }

    const { departureAt, arrivalAt, baseFare, status, busId, operatorId, state } = req.body;

    if (departureAt) trip.departureAt = new Date(departureAt);
    if (arrivalAt) trip.arrivalAt = new Date(arrivalAt);
    if (baseFare !== undefined) trip.baseFare = Number(baseFare);
    if (status) trip.status = status;
    if (busId) trip.busId = busId;
    if (operatorId) trip.operatorId = operatorId;
    if (state) trip.state = state;

    await trip.save();

    await logAuditEvent({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'TRIP_UPDATED',
      entityType: 'Trip',
      entityId: trip._id,
      summary: `[${assignedState}] Updated timetable for trip ${trip._id}: departure=${trip.departureAt.toISOString()}, status=${trip.status}, fare=₹${trip.baseFare}.`
    });

    return sendSuccess(res, { trip }, 'Bus timetable updated successfully');
  } catch (err) {
    next(err);
  }
};

export const cancelTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id).populate({
      path: 'routeId',
      populate: { path: 'stops.stopId' }
    });
    if (!trip) return sendError(res, 'Trip not found', 404);

    // State permission check
    const routeStates = getRouteStates(trip.routeId);
    const assignedState = req.user?.assignedState || 'ALL';
    if (!canAdminManageState(req.user, routeStates.length > 0 ? routeStates : [trip.state])) {
      return sendError(
        res,
        `Permission Denied: As a ${assignedState} State Administrator, you do not have permission to cancel bus departures outside ${assignedState}.`,
        403,
        'STATE_PERMISSION_DENIED'
      );
    }

    trip.status = 'CANCELLED';
    await trip.save();

    await logAuditEvent({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'TRIP_CANCELLED',
      entityType: 'Trip',
      entityId: trip._id,
      summary: `[${assignedState}] Trip ${trip._id} cancelled by ${assignedState} administrator.`
    });

    return sendSuccess(res, { trip }, 'Trip status set to CANCELLED');
  } catch (err) {
    next(err);
  }
};

// Bookings management
export const getAllBookings = async (req, res, next) => {
  try {
    const { pnr, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (pnr) filter.pnr = { $regex: pnr.trim(), $options: 'i' };
    if (status && status !== 'ALL') filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(filter);

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email phone')
      .populate('boardingStopId', 'name city')
      .populate('droppingStopId', 'name city')
      .populate({
        path: 'tripId',
        populate: [
          { path: 'routeId', select: 'routeName routeCode' },
          { path: 'busId', select: 'registrationNumber busType' },
          { path: 'operatorId', select: 'name operatorCode' }
        ]
      })
      .sort({ bookingDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    return sendSuccess(res, {
      bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

// Cancellation policy
export const getCancellationPolicy = async (req, res, next) => {
  try {
    let policy = await CancellationPolicy.findOne({ active: true });
    if (!policy) {
      policy = await CancellationPolicy.create({
        policyName: 'Standard MyJourney Cancellation Policy',
        refundTiers: [
          { minHoursBeforeDeparture: 24, refundPercentage: 100 },
          { minHoursBeforeDeparture: 6, refundPercentage: 50 },
          { minHoursBeforeDeparture: 0, refundPercentage: 0 }
        ],
        active: true
      });
    }
    return sendSuccess(res, { policy });
  } catch (err) {
    next(err);
  }
};

export const updateCancellationPolicy = async (req, res, next) => {
  try {
    const { policyName, refundTiers } = req.body;
    let policy = await CancellationPolicy.findOne({ active: true });

    if (!policy) {
      policy = new CancellationPolicy();
    }

    if (policyName) policy.policyName = policyName;
    if (refundTiers) policy.refundTiers = refundTiers;
    policy.updatedBy = req.user._id;

    await policy.save();

    await logAuditEvent({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'CANCELLATION_POLICY_UPDATED',
      entityType: 'CancellationPolicy',
      entityId: policy._id,
      summary: `Updated cancellation policy refund tiers by ${req.user.name}`
    });

    return sendSuccess(res, { policy }, 'Cancellation policy updated successfully');
  } catch (err) {
    next(err);
  }
};

// Audit logs
export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, entityType, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await AuditLog.countDocuments(filter);

    const logs = await AuditLog.find(filter)
      .populate('actorId', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit));

    return sendSuccess(res, {
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// STATE ADMINISTRATOR GOVERNANCE & APPROVALS
// ==========================================

export const getStateAdmins = async (req, res, next) => {
  try {
    const { status, state } = req.query;
    const filter = {
      role: USER_ROLES.ADMIN,
      assignedState: { $exists: true, $ne: 'ALL' }
    };

    if (status && status !== 'ALL') filter.verificationStatus = status;
    if (state && state !== 'ALL') filter.assignedState = state;

    const admins = await User.find(filter)
      .select('-passwordHash')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, {
      admins,
      isSuperAdmin: (req.user.assignedState || 'ALL') === 'ALL',
      totalCount: admins.length
    });
  } catch (err) {
    next(err);
  }
};

export const createStateAdmin = async (req, res, next) => {
  try {
    // Only Super Admin can directly provision state administrators
    const adminState = req.user.assignedState || 'ALL';
    if (adminState !== 'ALL') {
      return sendError(
        res,
        'Permission Denied: Only the National Super Administrator can provision State Administrator accounts.',
        403,
        'SUPER_ADMIN_REQUIRED'
      );
    }

    const { name, email, password, phone, assignedState, verificationStatus } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'An account with this email address already exists.', 409, 'EMAIL_EXISTS');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const status = verificationStatus || VERIFICATION_STATUS.VERIFIED;
    const newAdmin = await User.create({
      name,
      email,
      passwordHash,
      phone: phone || '',
      role: USER_ROLES.ADMIN,
      assignedState,
      verificationStatus: status,
      verifiedBy: status === VERIFICATION_STATUS.VERIFIED ? req.user._id : null,
      verifiedAt: status === VERIFICATION_STATUS.VERIFIED ? new Date() : null,
      isActive: true
    });

    await logAuditEvent({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'STATE_ADMIN_CREATED_BY_SUPER',
      entityType: 'User',
      entityId: newAdmin._id,
      summary: `Super Admin created state admin for ${assignedState}: ${newAdmin.name} (${newAdmin.email}) - Status: ${status}`
    });

    const sanitized = newAdmin.toObject();
    delete sanitized.passwordHash;

    return sendSuccess(
      res,
      { admin: sanitized },
      `State Administrator account for ${assignedState} provisioned successfully`,
      201
    );
  } catch (err) {
    next(err);
  }
};

export const verifyStateAdmin = async (req, res, next) => {
  try {
    const adminState = req.user.assignedState || 'ALL';
    if (adminState !== 'ALL') {
      return sendError(
        res,
        'Permission Denied: Only the National Super Administrator can verify and approve State Administrators.',
        403,
        'SUPER_ADMIN_REQUIRED'
      );
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser || targetUser.role !== USER_ROLES.ADMIN) {
      return sendError(res, 'State administrator account not found', 404);
    }

    targetUser.verificationStatus = VERIFICATION_STATUS.VERIFIED;
    targetUser.verifiedBy = req.user._id;
    targetUser.verifiedAt = new Date();
    targetUser.isActive = true;
    await targetUser.save();

    await logAuditEvent({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'STATE_ADMIN_VERIFIED',
      entityType: 'User',
      entityId: targetUser._id,
      summary: `Super Admin approved and verified State Admin for ${targetUser.assignedState}: ${targetUser.name} (${targetUser.email})`
    });

    const sanitized = targetUser.toObject();
    delete sanitized.passwordHash;

    return sendSuccess(
      res,
      { admin: sanitized },
      `State Administrator account for ${targetUser.assignedState} has been verified and approved.`
    );
  } catch (err) {
    next(err);
  }
};

export const rejectStateAdmin = async (req, res, next) => {
  try {
    const adminState = req.user.assignedState || 'ALL';
    if (adminState !== 'ALL') {
      return sendError(
        res,
        'Permission Denied: Only the National Super Administrator can reject State Administrators.',
        403,
        'SUPER_ADMIN_REQUIRED'
      );
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser || targetUser.role !== USER_ROLES.ADMIN) {
      return sendError(res, 'State administrator account not found', 404);
    }

    targetUser.verificationStatus = VERIFICATION_STATUS.REJECTED;
    targetUser.isActive = false;
    await targetUser.save();

    await logAuditEvent({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'STATE_ADMIN_REJECTED',
      entityType: 'User',
      entityId: targetUser._id,
      summary: `Super Admin rejected State Admin application for ${targetUser.assignedState}: ${targetUser.name} (${targetUser.email})`
    });

    const sanitized = targetUser.toObject();
    delete sanitized.passwordHash;

    return sendSuccess(
      res,
      { admin: sanitized },
      `State Administrator application for ${targetUser.assignedState} has been rejected.`
    );
  } catch (err) {
    next(err);
  }
};

