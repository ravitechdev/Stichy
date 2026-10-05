import { Router } from 'express';
import { protect, allowRoles } from '../middleware/auth.js';
import { listTailors, getTailor, updateTailorProfile } from '../controllers/catalogController.js';
const router = Router(); router.get('/', listTailors); router.get('/:id', getTailor); router.put('/profile', protect, allowRoles('tailor'), updateTailorProfile); export default router;
