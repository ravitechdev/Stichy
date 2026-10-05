import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, me } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
const router = Router();
router.post('/register', [body('name').trim().isLength({ min: 2 }), body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 8 }), body('role').optional().isIn(['student', 'tailor'])], validate, register);
router.post('/login', [body('email').isEmail().normalizeEmail(), body('password').isString().notEmpty()], validate, login);
router.get('/me', protect, me); export default router;
