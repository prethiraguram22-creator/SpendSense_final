import { Router } from 'express';
import { register, login, logout, getMe, resetPassword } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { registerSchema, loginSchema, resetPasswordSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);
router.post('/forgot-password', authLimiter, validate(resetPasswordSchema), resetPassword);

export default router;

