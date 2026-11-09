import { Router } from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { createBookingSchema, cancelBookingSchema } from '../validators/bookingValidator.js';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

router.post('/', validateRequest(createBookingSchema), bookingController.handleCreateBooking);
router.get('/my', bookingController.getMyBookings);
router.get('/:pnr', bookingController.getBookingByPNR);
router.post('/:pnr/cancel', validateRequest(cancelBookingSchema), bookingController.handleCancelBooking);

export default router;

