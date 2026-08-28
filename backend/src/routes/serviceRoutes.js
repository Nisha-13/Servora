import { Router } from 'express';
import { ServiceController } from '../controllers/serviceController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { uploadMultipleImages } from '../middlewares/uploadMiddleware.js';
import { createServiceSchema, updateServiceSchema } from '../validators/serviceValidators.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// Public
router.get('/', ServiceController.getServices);
router.get('/:id', ServiceController.getServiceById);

// Provider / Admin
router.post(
  '/',
  authenticate,
  authorize(ROLES.PROVIDER, ROLES.ADMIN),
  uploadMultipleImages('images', 5),
  validate(createServiceSchema),
  ServiceController.createService
);

router.put(
  '/:id',
  authenticate,
  authorize(ROLES.PROVIDER, ROLES.ADMIN),
  uploadMultipleImages('images', 5),
  validate(updateServiceSchema),
  ServiceController.updateService
);

router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.PROVIDER, ROLES.ADMIN),
  ServiceController.updateService
);


router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.PROVIDER, ROLES.ADMIN),
  ServiceController.deleteService
);

export default router;
