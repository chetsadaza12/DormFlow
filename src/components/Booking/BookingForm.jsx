import { useState } from 'react';
import { bookingAPI } from '../../services/api';
import './BookingForm.css';

export default function BookingForm({ roomNumber, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        lineId: '',
        roomNumber: roomNumber || '',
        moveInDate: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    function handleChange(e) {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!formData.name.trim() || !formData.phone.trim()) {
            setError('กรุณากรอกชื่อและเบอร์โทรศัพท์');
            return;
        }

        try {
            setIsSubmitting(true);
            await bookingAPI.create({
                ...formData,
                moveInDate: formData.moveInDate || null
            });
            setSubmitted(true);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="booking-overlay" onClick={onClose}>
            <div className="booking-modal" onClick={e => e.stopPropagation()}>
                <button className="booking-close-btn" onClick={onClose}>✕</button>

                {submitted ? (
                    <div className="booking-success">
                        <div className="success-icon">🎉</div>
                        <h2>ส่งข้อมูลเรียบร้อย!</h2>
                        <p>ขอบคุณที่สนใจจองห้องพัก เราจะติดต่อกลับโดยเร็วที่สุดครับ</p>
                        <button className="booking-done-btn" onClick={onClose}>ปิด</button>
                    </div>
                ) : (
                    <>
                        <div className="booking-header">
                            <div className="booking-header-icon">📋</div>
                            <h2>จองห้องพัก</h2>
                            <p>ห้อง <strong>{formData.roomNumber}</strong></p>
                        </div>

                        {error && <div className="booking-error">{error}</div>}

                        <form onSubmit={handleSubmit} className="booking-form">
                            <div className="booking-field">
                                <label>ชื่อ - นามสกุล <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="กรอกชื่อ - นามสกุล"
                                    required
                                />
                            </div>

                            <div className="booking-field">
                                <label>เบอร์โทรศัพท์ <span className="required">*</span></label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="0XX-XXX-XXXX"
                                    required
                                />
                            </div>

                            <div className="booking-field">
                                <label>LINE ID</label>
                                <input
                                    type="text"
                                    name="lineId"
                                    value={formData.lineId}
                                    onChange={handleChange}
                                    placeholder="LINE ID (ถ้ามี)"
                                />
                            </div>

                            <div className="booking-field">
                                <label>วันที่ต้องการเข้าอยู่</label>
                                <input
                                    type="date"
                                    name="moveInDate"
                                    value={formData.moveInDate}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="booking-field full-width">
                                <label>ข้อความเพิ่มเติม</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="มีอะไรอยากสอบถามเพิ่มเติม..."
                                    rows={3}
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="booking-submit-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="btn-loading">กำลังส่ง...</span>
                                ) : (
                                    <span>ส่งข้อมูลจอง</span>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
