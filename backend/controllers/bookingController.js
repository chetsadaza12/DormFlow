import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import path from 'path';
import fs from 'fs';
import { sendLineNotification } from '../services/lineService.js';

// GET /api/bookings — ดึงรายการจองทั้งหมด
export const getAll = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลการจองได้' });
    }
};

// GET /api/bookings/stats — สถิติการจอง
export const getStats = async (req, res) => {
    try {
        const [total, pending, approved, rejected, depositVerified, depositPending] = await Promise.all([
            Booking.countDocuments(),
            Booking.countDocuments({ status: 'pending' }),
            Booking.countDocuments({ status: 'approved' }),
            Booking.countDocuments({ status: 'rejected' }),
            Booking.countDocuments({ depositVerified: true }),
            Booking.countDocuments({ depositSlip: { $ne: '' }, depositVerified: false })
        ]);
        res.json({ total, pending, approved, rejected, depositVerified, depositPending });
    } catch (err) {
        res.status(500).json({ error: 'ไม่สามารถดึงสถิติได้' });
    }
};

// POST /api/bookings — สร้างการจองใหม่ (with file upload)
export const create = async (req, res) => {
    try {
        const { name, phone, lineId, roomNumber, moveInDate, message } = req.body;
        const depositSlip = req.file ? `/uploads/slips/${req.file.filename}` : '';

        const booking = new Booking({ name, phone, lineId, roomNumber, moveInDate, message, depositSlip });
        await booking.save();
        res.status(201).json(booking);
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        res.status(500).json({ error: 'ไม่สามารถสร้างการจองได้' });
    }
};

// PUT /api/bookings/:id/status — อัพเดทสถานะ (อนุมัติแล้วจะใส่ข้อมูลผู้จองลงห้อง)
export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'สถานะไม่ถูกต้อง' });
        }
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!booking) return res.status(404).json({ error: 'ไม่พบการจองนี้' });

        if (status === 'approved' && booking.roomNumber) {
            const room = await Room.findOne({ roomNumber: String(booking.roomNumber).trim() });
            if (room) {
                await Room.findOneAndUpdate(
                    { roomNumber: room.roomNumber },
                    {
                        isOccupied: true,
                        tenantName: booking.name || '',
                        tenantPhone: booking.phone || '',
                        tenantLineId: booking.lineId || ''
                    },
                    { new: true }
                );
            }
        }

        // LINE notifications by status
        if (booking.lineId) {
            try {
                if (status === 'approved') {
                    await sendLineNotification(
                        booking.lineId,
                        `การจองห้อง ${booking.roomNumber} ของคุณได้รับการอนุมัติแล้ว\nวันเข้าพัก: ${booking.moveInDate || '-'}`
                    );
                } else if (status === 'rejected') {
                    await sendLineNotification(
                        booking.lineId,
                        `ขออภัย การจองห้อง ${booking.roomNumber} ของคุณไม่ได้รับการอนุมัติ`
                    );
                } else if (status === 'pending') {
                    await sendLineNotification(
                        booking.lineId,
                        `การจองห้อง ${booking.roomNumber} ของคุณถูกเปลี่ยนสถานะเป็น \"รอดำเนินการ\"`
                    );
                }
            } catch (err) {
                console.error('LINE notify (status) error:', err);
            }
        }

        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: 'ไม่สามารถอัพเดทสถานะได้' });
    }
};

// PUT /api/bookings/:id/verify-deposit — ยืนยันมัดจำ
export const verifyDeposit = async (req, res) => {
    try {
        const { verified } = req.body;
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { depositVerified: verified },
            { new: true }
        );
        if (!booking) return res.status(404).json({ error: 'ไม่พบการจองนี้' });

        if (booking.lineId) {
            try {
                if (verified) {
                    await sendLineNotification(
                        booking.lineId,
                        `หอพักได้ยืนยันว่ามัดจำของคุณสำหรับห้อง ${booking.roomNumber} เข้าระบบเรียบร้อยแล้ว ขอบคุณครับ`
                    );
                } else {
                    await sendLineNotification(
                        booking.lineId,
                        `สถานะยืนยันมัดจำสำหรับห้อง ${booking.roomNumber} ถูกยกเลิก หากสงสัยกรุณาติดต่อหอพัก`
                    );
                }
            } catch (err) {
                console.error('LINE notify (deposit) error:', err);
            }
        }

        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: 'ไม่สามารถอัพเดทสถานะมัดจำได้' });
    }
};

// DELETE /api/bookings/:id — ลบการจอง
export const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) return res.status(404).json({ error: 'ไม่พบการจองนี้' });

        // Delete slip file if exists
        if (booking.depositSlip) {
            const filePath = path.join(process.cwd(), booking.depositSlip);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        if (booking.lineId) {
            try {
                await sendLineNotification(
                    booking.lineId,
                    `การจองห้อง ${booking.roomNumber} ของคุณถูกลบออกจากระบบแล้ว หากไม่ได้เป็นผู้ดำเนินการ โปรดติดต่อหอพัก`
                );
            } catch (err) {
                console.error('LINE notify (delete) error:', err);
            }
        }

        res.json({ message: 'ลบการจองสำเร็จ' });
    } catch (err) {
        res.status(500).json({ error: 'ไม่สามารถลบการจองได้' });
    }
};
