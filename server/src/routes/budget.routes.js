import { Router } from 'express';
import { list, save, remove } from '../controllers/budget.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { saveBudgetSchema } from '../schemas/budget.schema.js';

const router = Router();

router.use(requireAuth);

router.get('/', list);
router.post('/', validate(saveBudgetSchema), save);
router.delete('/:id', remove);

export default router;

