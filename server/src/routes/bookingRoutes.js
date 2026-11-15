import { Router } from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createBookingSchema,
  cancelBookingSchema,
  createPaymentOrderSchema,
  verifyPaymentAndBookSchema
} from '../validators/bookingValidator.js';

const router = Router();

// Payment configuration
router.get('/payment/config', bookingController.getPaymentConfig);

// All transactional booking routes require authentication
router.use(authenticate);

router.post('/payment/create-order', validateRequest(createPaymentOrderSchema), bookingController.handleCreatePaymentOrder);
router.post('/payment/verify-and-book', validateRequest(verifyPaymentAndBookSchema), bookingController.handleVerifyPaymentAndBook);

router.post('/', validateRequest(createBookingSchema), bookingController.handleCreateBooking);
router.get('/my', bookingController.getMyBookings);
router.get('/:pnr', bookingController.getBookingByPNR);
router.post('/:pnr/cancel', validateRequest(cancelBookingSchema), bookingController.handleCancelBooking);

export default router;

