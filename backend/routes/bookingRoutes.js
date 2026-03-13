import express from 'express';
import { getAll, getStats, create, updateStatus, deleteBooking } from '../controllers/bookingController.js';

const router = express.Router();

// Stats must come before /:id to avoid route conflict
router.get('/stats', getStats);
router.get('/', getAll);
router.post('/', create);
router.put('/:id/status', updateStatus);
router.delete('/:id', deleteBooking);

export default router;
