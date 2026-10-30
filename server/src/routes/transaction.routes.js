import { Router } from 'express';
import { list, create, getById, update, remove } from '../controllers/transaction.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTransactionSchema, updateTransactionSchema, queryTransactionSchema } from '../schemas/transaction.schema.js';

const router = Router();

router.use(requireAuth);

router.get('/', validate(queryTransactionSchema, 'query'), list);
router.post('/', validate(createTransactionSchema), create);
router.get('/:id', getById);
router.put('/:id', validate(updateTransactionSchema), update);
router.delete('/:id', remove);

export default router;

