/**
 * Database Configuration
 * TODO: เลือกและตั้งค่าฐานข้อมูลที่ต้องการใช้
 * 
 * ตัวเลือก:
 * 1. MySQL / MariaDB (ใช้ mysql2 หรือ sequelize)
 * 2. MongoDB (ใช้ mongoose)
 * 3. SQLite (ใช้ better-sqlite3) - สำหรับทดสอบ
 * 4. PostgreSQL (ใช้ pg หรือ sequelize)
 */

// ============ ตัวอย่าง MySQL (Sequelize) ============
// import { Sequelize } from 'sequelize';
//
// const sequelize = new Sequelize(
//     process.env.DB_NAME,
//     process.env.DB_USER,
//     process.env.DB_PASSWORD,
//     {
//         host: process.env.DB_HOST,
//         port: process.env.DB_PORT,
//         dialect: 'mysql',
//         logging: false
//     }
// );
//
// export default sequelize;

// ============ ตัวอย่าง MongoDB (Mongoose) ============
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully!');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

export default connectDB;
