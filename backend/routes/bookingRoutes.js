import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getAll, getStats, create, updateStatus, verifyDeposit, deleteBooking } from '../controllers/bookingController.js';

const router = express.Router();

// Multer config for deposit slips
const slipDir = path.join(process.cwd(), 'uploads', 'slips');
if (!fs.existsSync(slipDir)) {
    fs.mkdirSync(slipDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, slipDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'slip-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) return cb(null, true);
        cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพเท่านั้น'));
    }
});

// Routes — stats must come before /:id
router.get('/stats', getStats);
router.get('/', getAll);
router.post('/', upload.single('depositSlip'), create);
router.put('/:id/status', updateStatus);
router.put('/:id/verify-deposit', verifyDeposit);
router.delete('/:id', deleteBooking);

export default router;
