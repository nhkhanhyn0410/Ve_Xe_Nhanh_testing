import http from 'http';
import app from './app.js';

const PORT = process.env.PORT || 5500;
const API_VERSION = process.env.API_VERSION || 'v1';
const server = http.createServer(app);

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Server đang chạy ở chế độ ${process.env.NODE_ENV} trên port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 API endpoint: http://localhost:${PORT}/api/${API_VERSION}`);
    console.log(`🔌 Máy chủ WebSocket sẵn sàng cập nhật theo thời gian thực`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ TỪ CHỐI KHÔNG ĐƯỢC XỬ LÝ! Tắt...');
    console.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Tắt...');
    server.close(() => {
        console.log('💥 Process terminated!');
    });
});

export default app;