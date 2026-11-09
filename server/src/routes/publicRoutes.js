import { Router } from 'express';
import * as publicController from '../controllers/publicController.js';

const router = Router();

router.get('/stops', publicController.getStops);
router.get('/trips', publicController.searchTrips);
router.get('/trips/:tripId', publicController.getTripDetails);
router.get('/trips/:tripId/seats', publicController.getTripSeats);

export default router;

