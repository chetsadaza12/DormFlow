/**
 * Seed Script - นำข้อมูลห้องเริ่มต้นเข้า MongoDB
 * รัน: node seed.js
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Room from './models/Room.js';
import Settings from './models/Settings.js';

dotenv.config();

const initialRooms = [
    { roomNumber: '101', tenantName: '-', lastWaterMeter: 1900, lastElectricMeter: 5100, waterRate: 0, electricRate: 1, roomRent: 3500, isOccupied: false },
    { roomNumber: '102', tenantName: 'คุณสมหญิง', lastWaterMeter: 980, lastElectricMeter: 3200, waterRate: 1, electricRate: 1, roomRent: 3500, isOccupied: true },
    { roomNumber: '103', tenantName: 'คุณวิชัย', lastWaterMeter: 2230, lastElectricMeter: 13200, waterRate: 1, electricRate: 1, roomRent: 4000, isOccupied: true },
    { roomNumber: '201', tenantName: 'คุณนภา', lastWaterMeter: 750, lastElectricMeter: 2890, waterRate: 1, electricRate: 1, roomRent: 3800, isOccupied: true },
    { roomNumber: '202', tenantName: 'คุณอนันต์', lastWaterMeter: 1891, lastElectricMeter: 6120, waterRate: 1, electricRate: 1, roomRent: 3800, isOccupied: true },
    { roomNumber: '203', tenantName: 'คุณพิมพ์', lastWaterMeter: 500, lastElectricMeter: 1570, waterRate: 1, electricRate: 1, roomRent: 4000, isOccupied: true },
    { roomNumber: '301', tenantName: 'คุณธนา', lastWaterMeter: 1200, lastElectricMeter: 3980, waterRate: 1, electricRate: 1, roomRent: 4200, isOccupied: true },
    { roomNumber: '302', tenantName: 'คุณรัตนา', lastWaterMeter: 560, lastElectricMeter: 2350, waterRate: 1, electricRate: 1, roomRent: 4200, isOccupied: true }
];

const defaultSettings = {
    businessName: 'นรสิงห์',
    invoiceTitle: 'บิลค่าเช่าห้องแถว นรสิงห์',
    headerSubtitle: 'Narasing Billing System',
    paymentNote: 'ชำระเงินทุกวันที่ 5 ของทุกเดือนหรือเกินกำหนดวันชำระนั้นๆ ปรับเพิ่มวันละ 100 บาท',
    contactInfo: 'ช่องทางการติดต่อ สอบถาม 092-5152-870 โก้ / 082-508-8909 พอล',
    waterRate: 18,
    electricRate: 8
};

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Room.deleteMany({});
        console.log('🗑️  Cleared existing rooms');

        // Insert rooms
        await Room.insertMany(initialRooms);
        console.log(`📦 Inserted ${initialRooms.length} rooms`);

        // Insert default settings
        await Settings.setMultiple(defaultSettings);
        console.log('⚙️  Default settings saved');

        console.log('\n🎉 Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
}

seed();
