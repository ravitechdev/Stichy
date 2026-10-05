import { Router } from 'express';
import { protect, allowRoles } from '../middleware/auth.js';
import { getStudentProfile, updateStudentProfile } from '../controllers/catalogController.js';
const router = Router(); router.use(protect, allowRoles('student')); router.get('/profile', getStudentProfile); router.put('/profile', updateStudentProfile); export default router;
