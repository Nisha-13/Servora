import { Router } from 'express';
import { ProviderController } from '../controllers/providerController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// Provider authenticated endpoints (MUST be before /:id)
router.put(
  '/availability',
  authenticate,
  authorize(ROLES.PROVIDER),
  ProviderController.updateAvailability
);

router.get(
  '/dashboard/stats',
  authenticate,
  authorize(ROLES.PROVIDER),
  ProviderController.getDashboardStats
);

router.get(
  '/dashboard/earnings',
  authenticate,
  authorize(ROLES.PROVIDER),
  ProviderController.getEarnings
);

// Public provider listings & profile (after specific routes)
router.get('/', ProviderController.getProviders);
router.get('/:id', ProviderController.getProviderById);

export default router;

