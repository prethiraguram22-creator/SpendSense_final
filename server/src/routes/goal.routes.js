import { Router } from 'express';
import { list, create, update, remove, contribute } from '../controllers/goal.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { saveGoalSchema, updateGoalSchema, contributeGoalSchema } from '../schemas/goal.schema.js';

const router = Router();

router.use(requireAuth);

router.get('/', list);
router.post('/', validate(saveGoalSchema), create);
router.put('/:id', validate(updateGoalSchema), update);
router.delete('/:id', remove);
router.post('/:id/contribute', validate(contributeGoalSchema), contribute);

export default router;

