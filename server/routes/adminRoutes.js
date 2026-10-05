import { Router } from 'express'; import { protect, allowRoles } from '../middleware/auth.js'; import { adminUsers } from '../controllers/catalogController.js';
const router = Router(); router.use(protect, allowRoles('admin')); router.get('/users', adminUsers); export default router;
