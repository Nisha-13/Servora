import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { uploadSingleImage } from '../middlewares/uploadMiddleware.js';
import { createCategorySchema, updateCategorySchema } from '../validators/adminValidators.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// Public
router.get('/', CategoryController.getCategories);
router.get('/:id', CategoryController.getCategoryById);

// Admin only
router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  uploadSingleImage('image'),
  validate(createCategorySchema),
  CategoryController.createCategory
);

router.put(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  uploadSingleImage('image'),
  validate(updateCategorySchema),
  CategoryController.updateCategory
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  CategoryController.deleteCategory
);

export default router;
