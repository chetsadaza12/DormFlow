import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'กรุณากรอกชื่อผู้จอง']
    },
    phone: {
        type: String,
        required: [true, 'กรุณากรอกเบอร์โทรศัพท์']
    },
    lineId: {
        type: String,
        default: ''
    },
    roomNumber: {
        type: String,
        required: [true, 'กรุณาระบุห้องที่สนใจ']
    },
    moveInDate: {
        type: Date,
        required: [true, 'กรุณาระบุวันที่ต้องการเข้าอยู่']
    },
    message: {
        type: String,
        default: ''
    },
    depositSlip: {
        type: String,
        default: ''
    },
    depositAmount: {
        type: Number,
        default: 500
    },
    depositVerified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
