import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { createMeasurement, listMeasurements, getMeasurement, updateMeasurement, deleteMeasurement } from '../controllers/measurementController.js';
const router = Router(); router.use(protect); router.post('/', createMeasurement); router.get('/', listMeasurements); router.get('/:id', getMeasurement); router.put('/:id', updateMeasurement); router.delete('/:id', deleteMeasurement); export default router;
