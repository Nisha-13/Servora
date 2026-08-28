import { Router } from 'express';
import { InvoiceController } from '../controllers/invoiceController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { createInvoiceSchema } from '../validators/invoiceValidators.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(ROLES.PROVIDER, ROLES.ADMIN),
  validate(createInvoiceSchema),
  InvoiceController.createInvoice
);
router.get('/', InvoiceController.getInvoices);
router.get('/:id', InvoiceController.getInvoiceById);

export default router;
