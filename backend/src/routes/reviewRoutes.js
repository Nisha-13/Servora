import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { createReviewSchema, replyReviewSchema } from '../validators/reviewValidators.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// Public
router.get('/', ReviewController.getReviews);

// Customer Review
router.post(
  '/',
  authenticate,
  authorize(ROLES.CUSTOMER),
  validate(createReviewSchema),
  ReviewController.createReview
);

// Provider Reply
router.post(
  '/:id/reply',
  authenticate,
  authorize(ROLES.PROVIDER, ROLES.ADMIN),
  validate(replyReviewSchema),
  ReviewController.replyToReview
);

// Admin Moderation
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  ReviewController.deleteReview
);

export default router;
