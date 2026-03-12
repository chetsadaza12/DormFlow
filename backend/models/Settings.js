import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        default: ''
    }
}, {
    timestamps: true
});

// Default settings values
settingsSchema.statics.defaults = {
    // Website Settings
    businessName: 'นรสิงห์',
    homeHeroSubtitle: 'ที่พักคุณภาพ สะอาด ปลอดภัย เดินทางสะดวกสบาย',
    homeContactPhone: '092-5152-870 โก้ / 082-508-8909 พอล',
    homeContactLineId: 'narasing.dorm',
    homeContactBadge: 'ติดต่อเรา',
    homeContactHeading: 'พร้อมให้บริการ\nทุกวัน',
    homeContactSubtitle: 'สนใจจองห้องพัก สอบถามรายละเอียดเพิ่มเติม ติดต่อเราได้เลย!',
    homeMapLocation: { lat: 14.8829, lng: 102.0196 },
    homeFacilities: [
        { title: 'ปลอดภัย 24 ชม.', description: 'รปภ. และกล้องวงจรปิด ทุกชั้น', icon: '/assets/images/ปลอดภัย 24 ชม..gif' },
        { title: 'ที่จอดรถ', description: 'กว้างขวาง ร่มรื่น เพียงพอต่อผู้เช่า', icon: '/assets/images/ที่จอดรถ.gif' },
        { title: 'ฟรี Wi-Fi', description: 'อินเทอร์เน็ตความเร็วสูง ครอบคลุมทุกพื้นที่', icon: '/assets/images/Wi-Fi.gif' },
        { title: 'เฟอร์นิเจอร์ครบ', description: 'พร้อมเข้าอยู่ได้ทันที ไม่ต้องซื้อเพิ่ม', icon: '/assets/images/เฟอร์นิเจอร์ครบ.gif' }
    ],
    
    // Billing Settings
    invoiceTitle: 'บิลค่าเช่าห้องแถว นรสิงห์',
    headerSubtitle: 'Narasing Billing System',
    paymentNote: 'ชำระเงินทุกวันที่ 5 ของทุกเดือนหรือเกินกำหนดวันชำระนั้นๆ ปรับเพิ่มวันละ 100 บาท',
    contactInfo: 'ช่องทางการติดต่อ สอบถาม 092-5152-870 โก้ / 082-508-8909 พอล',
    
    // Pricing
    waterRate: 18,
    electricRate: 8,
    roomRent: 0,

    // Amenities options
    roomAmenities: [
        { id: 'aircon', label: 'แอร์', icon: '❄️' },
        { id: 'bed', label: 'เตียง', icon: '🛏️' },
        { id: 'waterheater', label: 'น้ำอุ่น', icon: '🚿' },
        { id: 'wifi', label: 'WiFi', icon: '📶' },
        { id: 'tv', label: 'ทีวี', icon: '📺' },
        { id: 'fridge', label: 'ตู้เย็น', icon: '🧊' }
    ]
};

// Get all settings as a flat object
settingsSchema.statics.getAll = async function () {
    const docs = await this.find({});
    const result = { ...this.defaults };
    docs.forEach(doc => {
        result[doc.key] = doc.value;
    });
    return result;
};

// Set multiple settings at once
settingsSchema.statics.setMultiple = async function (settings) {
    const ops = Object.entries(settings).map(([key, value]) => ({
        updateOne: {
            filter: { key },
            update: { $set: { key, value } },
            upsert: true
        }
    }));
    if (ops.length > 0) {
        await this.bulkWrite(ops);
    }
    return this.getAll();
};

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
