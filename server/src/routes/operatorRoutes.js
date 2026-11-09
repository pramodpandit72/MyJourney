import { Router } from 'express';
import * as operatorController from '../controllers/operatorController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { USER_ROLES } from '../config/constants.js';

const router = Router();

// Operator-only routes (Admins can also view)
router.use(authenticate, authorize(USER_ROLES.OPERATOR, USER_ROLES.ADMIN));

router.get('/dashboard', operatorController.getOperatorDashboard);
router.get('/trips', operatorController.getOperatorTrips);
router.get('/trips/:tripId/manifest', operatorController.getPassengerManifest);
router.get('/reports/occupancy', operatorController.getOccupancyReport);

export default router;

