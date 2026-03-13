import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Base directory for settings images (bank logos, QR codes, etc.)
const settingsDir = path.join(process.cwd(), 'uploads', 'settings');
if (!fs.existsSync(settingsDir)) {
    fs.mkdirSync(settingsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, settingsDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'settings-' + uniqueSuffix + path.extname(file.originalname));
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

// POST /api/uploads/settings-image
router.post('/settings-image', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'ไม่พบไฟล์ที่อัปโหลด' });
    }
    const publicPath = `/uploads/settings/${req.file.filename}`;
    res.json({ path: publicPath });
});

export default router;

