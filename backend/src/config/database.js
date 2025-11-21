import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const MONGODB_URL = process.env.MONGODB_URI;

        const conn = await mongoose.connect(MONGODB_URL);

        console.log(`## MongoDB Đã kết nối: ${conn.connection.host}`);

        //Connection events
        mongoose.connection.on('error', (err) => {
            console.error('*# Lỗi khi kết nối MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('!# MongoDB Đã ngắt kết nối')
        });
    } catch (error) {
        console.error('*# Lỗi kết nối với MongoDb: ', error.message);
    }
};

export default connectDB;