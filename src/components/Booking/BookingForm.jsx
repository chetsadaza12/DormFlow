import { useState, useRef, useEffect } from 'react';
import { bookingAPI, settingsAPI, resolveAssetUrl } from '../../services/api';
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
    const [slipFile, setSlipFile] = useState(null);
    const [slipPreview, setSlipPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [showPaymentInfo, setShowPaymentInfo] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const [paymentSettings, setPaymentSettings] = useState({
        bookingDepositAmount: 500,
        bookingDepositToggleLabel: 'ดูช่องทางการชำระเงินมัดจำ (500 บาท)',
        bookingDepositSlipLabel: 'สลิปโอนเงินมัดจำ 500 บาท',
        bookingDepositNote: 'ค่ามัดจำ 500 บาท จะถูกหักจากค่าเช่าเดือนแรก',
        bookingPaymentBankLabel: 'ธนาคารกสิกรไทย (KBank)',
        bookingPaymentBankAccount: '012-3-45678-9',
        bookingPaymentBankAccountName: 'หอพักนรสิงห์',
        bookingPaymentBankIconText: 'K',
        bookingPaymentBankIconImage: '',
        bookingPromptpayTitle: 'พร้อมเพย์ (PromptPay) QR Code',
        bookingPromptpayImage: '/qr-promptpay.png',
        bookingPromptpayName: 'นายนรสิงห์ ใจดี'
    });

    useEffect(() => {
        async function loadSettings() {
            try {
                const settings = await settingsAPI.get();
                setPaymentSettings(prev => ({
                    ...prev,
                    bookingDepositAmount: settings.bookingDepositAmount ?? prev.bookingDepositAmount,
                    bookingDepositToggleLabel: settings.bookingDepositToggleLabel ?? prev.bookingDepositToggleLabel,
                    bookingDepositSlipLabel: settings.bookingDepositSlipLabel ?? prev.bookingDepositSlipLabel,
                    bookingDepositNote: settings.bookingDepositNote ?? prev.bookingDepositNote,
                    bookingPaymentBankLabel: settings.bookingPaymentBankLabel ?? prev.bookingPaymentBankLabel,
                    bookingPaymentBankAccount: settings.bookingPaymentBankAccount ?? prev.bookingPaymentBankAccount,
                    bookingPaymentBankAccountName: settings.bookingPaymentBankAccountName ?? prev.bookingPaymentBankAccountName,
                    bookingPaymentBankIconText: settings.bookingPaymentBankIconText ?? prev.bookingPaymentBankIconText,
                    bookingPaymentBankIconImage: settings.bookingPaymentBankIconImage ?? prev.bookingPaymentBankIconImage,
                    bookingPromptpayTitle: settings.bookingPromptpayTitle ?? prev.bookingPromptpayTitle,
                    bookingPromptpayImage: settings.bookingPromptpayImage ?? prev.bookingPromptpayImage,
                    bookingPromptpayName: settings.bookingPromptpayName ?? prev.bookingPromptpayName
                }));
            } catch (e) {
                // ถ้าดึงการตั้งค่าไม่ได้ ให้ใช้ค่าเริ่มต้นต่อไป
                console.error('ไม่สามารถโหลดการตั้งค่าการจองได้', e);
            }
        }

        loadSettings();
    }, []);

    function handleChange(e) {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSlipChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('ไฟล์ต้องมีขนาดไม่เกิน 5MB');
            return;
        }

        setSlipFile(file);
        setSlipPreview(URL.createObjectURL(file));
        setError('');
    }

    function removeSlip() {
        setSlipFile(null);
        setSlipPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!formData.name.trim() || !formData.phone.trim()) {
            setError('กรุณากรอกชื่อและเบอร์โทรศัพท์');
            return;
        }

        if (!formData.moveInDate) {
            setError('กรุณาระบุวันที่ต้องการเข้าอยู่');
            return;
        }

        if (!slipFile) {
            const amount = paymentSettings.bookingDepositAmount || 500;
            setError(`กรุณาแนบสลิปโอนเงินมัดจำ ${amount} บาท`);
            return;
        }

        try {
            setIsSubmitting(true);
            await bookingAPI.create({
                ...formData,
                depositSlip: slipFile
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
                        <div className="success-icon-wrap">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        </div>
                        <h2>ส่งข้อมูลเรียบร้อย!</h2>
                        <p>ขอบคุณที่สนใจจองห้องพัก เราจะตรวจสอบสลิปและติดต่อกลับโดยเร็วที่สุดครับ</p>
                        <button className="booking-done-btn" onClick={onClose}>ปิด</button>
                    </div>
                ) : (
                    <>
                        <div className="booking-header">
                            <div className="booking-header-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
                            </div>
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
                                <label>วันที่ต้องการเข้าอยู่ <span className="required">*</span></label>
                                <input
                                    type="date"
                                    name="moveInDate"
                                    value={formData.moveInDate}
                                    onChange={handleChange}
                                    required
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

                            {/* Payment Info Toggle */}
                            <div className="booking-field full-width">
                                <button
                                    type="button"
                                    className="payment-toggle-btn"
                                    onClick={() => setShowPaymentInfo(!showPaymentInfo)}
                                >
                                    <span className="payment-toggle-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                    </span>
                                    {showPaymentInfo ? 'ซ่อนช่องทางการชำระเงิน' : paymentSettings.bookingDepositToggleLabel}
                                    <svg className={`chevron ${showPaymentInfo ? 'up' : 'down'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                                </button>
                                
                                {showPaymentInfo && (
                                    <div className="payment-info-box fade-in">
                                        <div className="payment-method">
                                            <div className="bank-icon kbank">
                                                {paymentSettings.bookingPaymentBankIconImage ? (
                                                    <img
                                                        src={resolveAssetUrl(paymentSettings.bookingPaymentBankIconImage)}
                                                        alt={paymentSettings.bookingPaymentBankLabel || 'Bank Logo'}
                                                    />
                                                ) : (
                                                    (paymentSettings.bookingPaymentBankIconText || 'K')
                                                )}
                                            </div>
                                            <div className="payment-details">
                                                <span className="payment-title">{paymentSettings.bookingPaymentBankLabel}</span>
                                                <span className="payment-acc">{paymentSettings.bookingPaymentBankAccount}</span>
                                                <span className="payment-name">ชื่อบัญชี: {paymentSettings.bookingPaymentBankAccountName}</span>
                                            </div>
                                        </div>
                                        <div className="payment-divider"></div>
                                        <div className="payment-method promptpay-method">
                                            <div className="payment-details promptpay-details">
                                                <span className="payment-title">{paymentSettings.bookingPromptpayTitle}</span>
                                                <img src={resolveAssetUrl(paymentSettings.bookingPromptpayImage)} alt="QR Code PromptPay" className="promptpay-qr-img" />
                                                <span className="payment-name">ชื่อ-สกุล: {paymentSettings.bookingPromptpayName}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Deposit Slip Upload */}
                            <div className="booking-field full-width">
                                <label>{paymentSettings.bookingDepositSlipLabel} <span className="required">*</span></label>
                                <div className="slip-upload-area">
                                    {slipPreview ? (
                                        <div className="slip-preview">
                                            <img src={slipPreview} alt="สลิปโอนเงิน" />
                                            <button type="button" className="slip-remove-btn" onClick={removeSlip}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="slip-dropzone" htmlFor="slipInput">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                                <polyline points="17 8 12 3 7 8" />
                                                <line x1="12" y1="3" x2="12" y2="15" />
                                            </svg>
                                            <span className="slip-dropzone-text">คลิกเพื่ออัปโหลดสลิป</span>
                                            <span className="slip-dropzone-hint">JPG, PNG, WEBP (ไม่เกิน 5MB)</span>
                                        </label>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        id="slipInput"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleSlipChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                <p className="slip-note">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                                    {paymentSettings.bookingDepositNote}
                                </p>
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
