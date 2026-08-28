import { Router } from 'express';
import { BookingController } from '../controllers/bookingController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { createBookingSchema, updateBookingStatusSchema } from '../validators/bookingValidators.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize(ROLES.CUSTOMER), validate(createBookingSchema), BookingController.createBooking);
router.get('/', BookingController.getBookings);
router.get('/:id', BookingController.getBookingById);
router.patch('/:id/status', validate(updateBookingStatusSchema), BookingController.updateStatus);

export default router;
