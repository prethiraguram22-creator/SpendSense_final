import { Router } from 'express';
import { list, dismiss, restore } from '../controllers/insight.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', list);
router.post('/:id/dismiss', dismiss);
router.post('/restore', restore);

export default router;

