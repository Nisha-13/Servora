import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { uploadSingleImage } from '../middlewares/uploadMiddleware.js';
import { updateProfileSchema, changePasswordSchema } from '../validators/authValidators.js';

const router = Router();

router.use(authenticate);

router.get('/profile', UserController.getProfile);
router.put('/profile', uploadSingleImage('avatar'), validate(updateProfileSchema), UserController.updateProfile);
router.post('/change-password', validate(changePasswordSchema), UserController.changePassword);
router.put('/change-password', validate(changePasswordSchema), UserController.changePassword);

export default router;
