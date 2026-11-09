import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';
import {
  operatorSchema,
  busSchema,
  stopSchema,
  routeSchema,
  tripSchema,
  cancellationPolicySchema
} from '../validators/adminValidator.js';
import { USER_ROLES } from '../config/constants.js';

const router = Router();

// Admin-only routes
router.use(authenticate, authorize(USER_ROLES.ADMIN));

router.get('/dashboard', adminController.getDashboardStats);

// Operators
router.get('/operators', adminController.getOperators);
router.post('/operators', validateRequest(operatorSchema), adminController.createOperator);
router.put('/operators/:id', validateRequest(operatorSchema.partial()), adminController.updateOperator);

// Buses
router.get('/buses', adminController.getBuses);
router.post('/buses', validateRequest(busSchema), adminController.createBus);
router.put('/buses/:id', validateRequest(busSchema.partial()), adminController.updateBus);

// Stops
router.get('/stops', adminController.getAdminStops);
router.post('/stops', validateRequest(stopSchema), adminController.createStop);
router.put('/stops/:id', validateRequest(stopSchema.partial()), adminController.updateStop);

// Routes
router.get('/routes', adminController.getRoutes);
router.post('/routes', validateRequest(routeSchema), adminController.createRoute);
router.put('/routes/:id', validateRequest(routeSchema.partial()), adminController.updateRoute);

// Trips
router.get('/trips', adminController.getTrips);
router.post('/trips', validateRequest(tripSchema), adminController.createTrip);
router.put('/trips/:id/cancel', adminController.cancelTrip);

// Bookings
router.get('/bookings', adminController.getAllBookings);

// Cancellation Policy
router.get('/cancellation-policy', adminController.getCancellationPolicy);
router.put('/cancellation-policy', validateRequest(cancellationPolicySchema), adminController.updateCancellationPolicy);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

export default router;

