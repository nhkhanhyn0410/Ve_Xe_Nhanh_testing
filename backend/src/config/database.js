import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const connectDB = async () => {
    try {
        const MONGODB_URL = process.env.MONGODB_URI;

        const conn = await mongoose.connect(MONGODB_URL);

        logger.success(`MongoDB Đã kết nối: ${conn.connection.host}`);

        //Connection events
        mongoose.connection.on('error', (err) => {
            logger.error('Lỗi khi kết nối MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB Đã ngắt kết nối')
        });
    } catch (error) {
        logger.error('Lỗi kết nối với MongoDb: ', error.message);
    }
};

export default connectDB;