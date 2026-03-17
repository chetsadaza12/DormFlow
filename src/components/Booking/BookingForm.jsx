import { useState, useRef, useEffect } from 'react';
import { bookingAPI, settingsAPI, resolveAssetUrl } from '../../services/api';
import { STORAGE_KEY_DRAFT, STORAGE_KEY_LINE } from '../Auth/LineCallbackPage';
import './BookingForm.css';

export default function BookingForm({ roomNumber, onClose, onSuccess, initialLineId, initialDraft }) {
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
        bookingPromptpayName: 'นายนรสิงห์ ใจดี',
        bookingLineLoginClientId: ''
    });

    useEffect(() => {
        if (initialLineId || initialDraft) {
            setFormData(prev => {
                const next = { ...prev };
                if (initialLineId) next.lineId = initialLineId;
                if (initialDraft) {
                    if (initialDraft.name) next.name = initialDraft.name;
                    if (initialDraft.phone) next.phone = initialDraft.phone;
                    if (initialDraft.moveInDate) next.moveInDate = initialDraft.moveInDate;
                    if (initialDraft.message) next.message = initialDraft.message;
                    if (initialDraft.roomNumber) next.roomNumber = initialDraft.roomNumber;
                }
                return next;
            });
        }
    }, [initialLineId, initialDraft]);

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
        bookingPromptpayName: settings.bookingPromptpayName ?? prev.bookingPromptpayName,
        bookingLineLoginClientId: settings.bookingLineLoginClientId ?? prev.bookingLineLoginClientId
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
                                {paymentSettings.bookingLineLoginClientId ? (
                                    <>
                                        <label>รับข้อความแจ้งเตือนผ่าน LINE</label>
                                        {formData.lineId ? (
                                            <div className="line-linked-state">
                                                <span className="line-linked-check">✓</span>
                                                <span>เชื่อมต่อ LINE เพื่อรับแจ้งเตือนแล้ว</span>
                                                <button type="button" className="line-unlink-btn" onClick={() => setFormData(prev => ({ ...prev, lineId: '' }))}>
                                                    ยกเลิก
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                className="line-login-btn"
                                                onClick={() => {
                                                    const redirectUri = `${window.location.origin}/line-callback`;
                                                    const state = formData.roomNumber || '';
                                                    sessionStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify({
                                                        roomNumber: formData.roomNumber,
                                                        name: formData.name,
                                                        phone: formData.phone,
                                                        moveInDate: formData.moveInDate,
                                                        message: formData.message,
                                                        lineClientId: paymentSettings.bookingLineLoginClientId
                                                    }));
                                                    const authUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${encodeURIComponent(paymentSettings.bookingLineLoginClientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=profile%20openid`;
                                                    window.location.href = authUrl;
                                                }}
                                            >
                                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                                                </svg>
                                                เข้าสู่ระบบด้วย LINE
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <label>LINE ID</label>
                                        <input
                                            type="text"
                                            name="lineId"
                                            value={formData.lineId}
                                            onChange={handleChange}
                                            placeholder="LINE ID (ถ้ามี)"
                                        />
                                    </>
                                )}
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
