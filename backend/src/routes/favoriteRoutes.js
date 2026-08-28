import { Router } from 'express';
import { FavoriteController } from '../controllers/favoriteController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate, authorize(ROLES.CUSTOMER));

router.post('/toggle', FavoriteController.toggleFavorite);
router.get('/', FavoriteController.getFavorites);
router.get('/check/:providerId', FavoriteController.checkFavorite);
router.get('/check-service/:serviceId', (req, res, next) => {
  req.query.serviceId = req.params.serviceId;
  FavoriteController.checkFavorite(req, res, next);
});
router.delete('/:id', FavoriteController.deleteFavorite);

export default router;
