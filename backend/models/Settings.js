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
    
    // Billing Settings
    invoiceTitle: 'บิลค่าเช่าห้องแถว นรสิงห์',
    headerSubtitle: 'Narasing Billing System',
    paymentNote: 'ชำระเงินทุกวันที่ 5 ของทุกเดือนหรือเกินกำหนดวันชำระนั้นๆ ปรับเพิ่มวันละ 100 บาท',
    contactInfo: 'ช่องทางการติดต่อ สอบถาม 092-5152-870 โก้ / 082-508-8909 พอล',
    
    // Pricing
    waterRate: 18,
    electricRate: 8,
    roomRent: 0
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
