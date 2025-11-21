import express from 'express';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server đang hoạt động tốt - TEST',
        timestamp: new Date().toISOString()
    });
});

// API routes will be added here
// Example:
// import authRoutes from './api/v1/auth.routes.js';
// router.use('/api/v1/auth', authRoutes);

export default router;
