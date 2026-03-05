import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Routes
import roomRoutes from './routes/roomRoutes.js';
import billRoutes from './routes/billRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ========== Middleware ==========
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// ========== Routes ==========
app.use('/api/rooms', roomRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/settings', settingsRoutes);

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
