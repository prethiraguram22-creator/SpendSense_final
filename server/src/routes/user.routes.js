import { Router } from 'express';
import { getProfile, updateProfile, clearData, loadDemoData } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../schemas/profile.schema.js';

const router = Router();

router.use(requireAuth);
router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);
router.post('/demo-data', loadDemoData);
router.delete('/data', clearData);

export default router;

