import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/dashboard', AdminController.getDashboard);
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', AdminController.toggleUserStatus);
router.patch('/providers/:id/verify', AdminController.verifyProvider);
router.get('/activity-logs', AdminController.getActivityLogs);
router.get('/reports', AdminController.getReports);

export default router;
