import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { refundSchema } from '../validators/adminValidators.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// Confirm Cash on Delivery Payment (Only Provider or Admin)
router.post(
  '/confirm-cash',
  authenticate,
  authorize(ROLES.PROVIDER, ROLES.ADMIN),
  PaymentController.confirmCashPayment
);

// Get list of payments (Filtered by role)
router.get('/', authenticate, PaymentController.getPayments);

// Admin Refund Payment
router.post(
  '/:id/refund',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(refundSchema),
  PaymentController.refundPayment
);

export default router;
