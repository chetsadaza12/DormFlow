import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';
import connectDB from './config/db.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);

// Routes
import roomRoutes from './routes/roomRoutes.js';
import billRoutes from './routes/billRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ========== Middleware ==========
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [])
    ],
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ========== Routes ==========
app.use('/api/rooms', roomRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Narasing Billing API is running' });
});

// ========== Start Server ==========
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
