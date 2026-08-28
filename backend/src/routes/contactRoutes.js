import { Router } from 'express';
import { ContactController } from '../controllers/contactController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// Public submission
router.post('/', ContactController.submitContact);

// Admin review
router.get('/', authenticate, authorize(ROLES.ADMIN), ContactController.getInquiries);

export default router;
