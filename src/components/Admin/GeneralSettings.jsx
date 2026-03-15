import { useState, useEffect } from 'react';
import { settingsAPI, uploadsAPI, resolveAssetUrl } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import MapPicker from './MapPicker';
import './GeneralSettings.css';

export default function GeneralSettings() {
    const { showToast } = useNotification();
    const [settings, setSettings] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState({}); // Stores which groups are expanded
    
    // Icon Picker State
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [activeFacilityIndex, setActiveFacilityIndex] = useState(null);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [uploadingKey, setUploadingKey] = useState(null);

    // List of available icons in the public/assets/images folder
    const availableIcons = [
        '/assets/images/ปลอดภัย 24 ชม..gif',
        '/assets/images/ที่จอดรถ.gif',
        '/assets/images/Wi-Fi.gif',
        '/assets/images/เฟอร์นิเจอร์ครบ.gif',
        '/assets/images/checklist.gif',
        '/assets/images/handshake.gif',
        '/assets/images/ไอเดีย.gif',
        '/assets/images/award.gif',
        '/assets/images/clock About.gif',
        '/assets/images/graduation-cap About.gif',
        '/assets/images/loyalty About.gif',
        '/assets/images/paper-document About.gif',
        '/assets/images/output-onlinegiftools.gif',
        '/assets/images/output-onlinegiftools (1).gif',
        '/assets/images/output-onlinegiftools (2).gif'
    ];

    const toggleGroup = (index) => {
        setExpandedGroups(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    useEffect(() => {
        async function loadSettings() {
            try {
                const data = await settingsAPI.get();
                setSettings(data);
            } catch (error) {
                showToast('ไม่สามารถโหลดการตั้งค่าได้', 'error');
            }
        }
        loadSettings();
    }, []);

    if (!settings) return null;

    function handleChange(key, value) {
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    }

    async function handleSave() {
        try {
            await settingsAPI.update(settings);
            setHasChanges(false);
            showToast('บันทึกการตั้งค่าเรียบร้อยแล้ว', 'success');
        } catch (error) {
            showToast(error.message || 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า', 'error');
        }
    }

    async function handleImageUpload(fieldKey, file) {
        if (!file) return;
        try {
            setUploadingKey(fieldKey);
            const result = await uploadsAPI.uploadSettingsImage(file);
            if (result.path) {
                handleChange(fieldKey, result.path);
                showToast('อัปโหลดรูปภาพเรียบร้อยแล้ว', 'success');
            }
        } catch (error) {
            showToast(error.message || 'อัปโหลดรูปภาพไม่สำเร็จ', 'error');
        } finally {
            setUploadingKey(null);
        }
    }

    async function handleReset() {
        try {
            const fresh = await settingsAPI.get();
            setSettings(fresh);
            setHasChanges(false);
        } catch (error) {
            showToast('ไม่สามารถดึงข้อมูลตั้งค่าใหม่ได้', 'error');
        }
    }

    // --- Facilities helpers ---
    const getFacilities = () => {
        return settings.homeFacilities || [];
    };

    const updateFacility = (index, field, value) => {
        const facs = [...getFacilities()];
        facs[index] = { ...facs[index], [field]: value };
        handleChange('homeFacilities', facs);
    };

    const addFacility = () => {
        const facs = [...getFacilities(), { title: '', description: '', icon: '' }];
        handleChange('homeFacilities', facs);
    };

    const removeFacility = (index) => {
        const facs = getFacilities().filter((_, i) => i !== index);
        handleChange('homeFacilities', facs);
    };

    // --- Amenities helpers ---
    const getAmenities = () => {
        return settings.roomAmenities || [];
    };

    const updateAmenity = (index, field, value) => {
        const ams = [...getAmenities()];
        ams[index] = { ...ams[index], [field]: value };
        // auto-generate ID if title changed and no id exists
        if (field === 'label' && !ams[index].id) {
            ams[index].id = value.toLowerCase().replace(/[^a-z0-9ก-ฮ]/g, '') || `am_${Date.now()}`;
        }
        handleChange('roomAmenities', ams);
    };

    const addAmenity = () => {
        const ams = [...getAmenities(), { id: `am_${Date.now()}`, label: '', icon: '' }];
        handleChange('roomAmenities', ams);
    };

    const removeAmenity = (index) => {
        const ams = getAmenities().filter((_, i) => i !== index);
        handleChange('roomAmenities', ams);
    };

    const settingGroups = [
        {
            title: 'ตั้งค่าหน้าหลัก (เว็บไซต์)',
            fields: [
                {
                    key: 'businessName',
                    label: 'ชื่อหอพัก / ธุรกิจ',
                    description: 'ชื่อหลักที่แสดงบนหน้า Home',
                    type: 'text',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                },
                {
                    key: 'homeHeroSubtitle',
                    label: 'คำโปรย (Subtitle)',
                    description: 'ข้อความสั้นๆ ใต้ชื่อหอพักในหน้า Home',
                    type: 'text',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                },
                {
                    key: 'homeContactPhone',
                    label: 'เบอร์โทรศัพท์ (ติดต่อเช่า)',
                    description: 'เบอร์โทรที่แสดงในส่วนติดต่อเราบนหน้า Home',
                    type: 'text',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                },
                {
                    key: 'homeContactLineId',
                    label: 'LINE ID (ติดต่อเช่า)',
                    description: 'ไอดีไลน์ที่แสดงในส่วนติดต่อเราบนหน้า Home',
                    type: 'text',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                },
                {
                    key: 'homeContactBadge',
                    label: 'ป้ายกำกับ (Badge)',
                    description: 'ข้อความเล็กๆ ด้านบนหัวข้อส่วนติดต่อ เช่น "ติดต่อเรา"',
                    type: 'text',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                },
                {
                    key: 'homeContactHeading',
                    label: 'หัวข้อส่วนติดต่อ',
                    description: 'ข้อความหัวข้อหลัก เช่น "พร้อมให้บริการทุกวัน" (ใช้ \\n เพื่อขึ้นบรรทัดใหม่)',
                    type: 'text',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></svg>
                },
                {
                    key: 'homeContactSubtitle',
                    label: 'คำอธิบายส่วนติดต่อ',
                    description: 'ข้อความอธิบายใต้หัวข้อ เช่น "สนใจจองห้องพัก ติดต่อเราได้เลย!"',
                    type: 'text',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg>
                },
                {
                    key: 'homeMapLocation',
                    label: 'ตำแหน่งแผนที่ Google Maps',
                    description: 'คลิกปุ่มด้านล่างเพื่อปักหมุดตำแหน่งที่ตั้งหอพักบนแผนที่',
                    type: 'map',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                },
                {
                    key: 'homeLocationMediaUrls',
                    label: 'รูป/วิดีโอสำหรับป็อปอัพสถานที่',
                    description: 'ใส่ URL รูปหรือวิดีโอ (เช่น .jpg, .png, .mp4, .webm) 1 บรรทัดต่อ 1 ไฟล์ ลำดับจะใช้ตามบรรทัดที่กรอก',
                    type: 'textarea',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="14" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="M21 17l-5-4-3 3-2-2-4 3" /></svg>
                }
            ]
        },
        {
            title: 'ตั้งค่าใบแจ้งหนี้ (บิล)',
            fields: [
                {
                    key: 'invoiceTitle',
                    label: 'หัวข้อใบแจ้งหนี้',
                    description: 'ข้อความบรรทัดแรกสุดของบิล เช่น "บิลค่าเช่าห้องแถว นรสิงห์"',
                    type: 'text',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                },
                {
                    key: 'headerSubtitle',
                    label: 'ข้อความ Subtitle (Header)',
                    description: 'ข้อความด้านล่างชื่อหลักในส่วนหัวบิล',
                    type: 'text',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
                },
                {
                    key: 'paymentNote',
                    label: 'ข้อความเตือนการชำระเงิน',
                    description: 'ข้อความเงื่อนไขการชำระเงินที่แสดงท้ายบิล',
                    type: 'textarea',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                },
                {
                    key: 'contactInfo',
                    label: 'ข้อมูลติดต่อ (ท้ายบิล)',
                    description: 'เบอร์โทรศัพท์หรือช่องทางติดต่อที่แสดงท้ายบิล',
                    type: 'textarea',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                }
            ]
        },
        {
            title: 'ตั้งค่าการจอง (มัดจำ)',
            fields: [
                {
                    key: 'bookingDepositAmount',
                    label: 'จำนวนเงินมัดจำ (บาท)',
                    description: 'จำนวนเงินที่ใช้เป็นค่ามัดจำในการจองห้อง (ตัวเลขบาท)',
                    type: 'text',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                },
                {
                    key: 'bookingDepositToggleLabel',
                    label: 'ข้อความปุ่มแสดงช่องทางชำระเงิน',
                    description: 'ข้อความบนปุ่ม เช่น "ดูช่องทางการชำระเงินมัดจำ (500 บาท)"',
                    type: 'text',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 12h8" /></svg>
                },
                {
                    key: 'bookingDepositSlipLabel',
                    label: 'ข้อความหัวข้อสลิปโอน',
                    description: 'เช่น "สลิปโอนเงินมัดจำ 500 บาท"',
                    type: 'text',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2z" /></svg>
                },
                {
                    key: 'bookingDepositNote',
                    label: 'หมายเหตุค่ามัดจำ',
                    description: 'ข้อความอธิบายใต้ช่องสลิป เช่น "ค่ามัดจำ 500 บาท จะถูกหักจากค่าเช่าเดือนแรก"',
                    type: 'textarea',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                },
                {
                    key: 'bookingPaymentBankLabel',
                    label: 'ชื่อธนาคาร / ประเภทบัญชี',
                    description: 'เช่น "ธนาคารกสิกรไทย (KBank)"',
                    type: 'text',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /></svg>
                },
                {
                    key: 'bookingPaymentBankAccount',
                    label: 'เลขที่บัญชีธนาคาร',
                    description: 'เช่น "012-3-45678-9"',
                    type: 'text',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 10h20" /></svg>
                },
                {
                    key: 'bookingPaymentBankAccountName',
                    label: 'ชื่อบัญชีธนาคาร',
                    description: 'เช่น "หอพักนรสิงห์"',
                    type: 'text',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M6 20v-1a4 4 0 014-4h4a4 4 0 014 4v1" /></svg>
                },
                {
                    key: 'bookingPaymentBankIconText',
                    label: 'ตัวอักษรบนไอคอนธนาคาร',
                    description: 'ตัวอักษรที่แสดงในกล่องสีของธนาคาร เช่น K, S, T',
                    type: 'text',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M10 8h4l-4 8h4" /></svg>
                },
                {
                    key: 'bookingPaymentBankIconImage',
                    label: 'ที่อยู่รูปโลโก้ธนาคาร',
                    description: 'ใส่ path รูปในเว็บ หรือวางลิงก์รูปภาพ (URL) โดยตรง เช่น https://example.com/logo.png (ถ้าเว้นว่างจะใช้ตัวอักษรแทน)',
                    type: 'text',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="14" rx="2" /><circle cx="8.5" cy="10.5" r="1.5" /><path d="M21 15l-5-4-3 3-2-2-4 3" /></svg>
                },
                {
                    key: 'bookingPromptpayTitle',
                    label: 'หัวข้อ PromptPay',
                    description: 'เช่น "พร้อมเพย์ (PromptPay) QR Code"',
                    type: 'text',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                },
                {
                    key: 'bookingPromptpayImage',
                    label: 'ที่อยู่รูป QR Code',
                    description: 'ใส่ path รูปในเว็บ หรือวางลิงก์รูปภาพ (URL) โดยตรง เช่น https://example.com/qr.png',
                    type: 'text',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="14" rx="2" /><circle cx="8.5" cy="10.5" r="1.5" /><path d="M21 15l-5-4-3 3-2-2-4 3" /></svg>
                },
                {
                    key: 'bookingPromptpayName',
                    label: 'ชื่อเจ้าของ PromptPay',
                    description: 'เช่น "นายนรสิงห์ ใจดี"',
                    type: 'text',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a6.5 6.5 0 0113 0" /></svg>
                },
                {
                    key: 'bookingLineLoginClientId',
                    label: 'LINE Login Channel ID',
                    description: 'ใส่ Channel ID จาก LINE Developers Console เพื่อเปิดใช้ปุ่ม "ยืนยัน login LINE" ในฟอร์มจอง (ถ้าเว้นว่างจะแสดงช่องกรอก LINE ID แบบเดิม)',
                    type: 'text',
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                }
            ]
        }
    ];

    return (
        <div className="general-settings" id="generalSettingsPage">
            <h2 className="admin-page-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
                ตั้งค่าทั่วไป
            </h2>

            <div className="settings-groups">
                {settingGroups.map((group, groupIndex) => (
                    <div className="settings-group" key={groupIndex}>
                        <div 
                            className={`settings-group-header ${expandedGroups[groupIndex] ? 'expanded' : ''}`}
                            onClick={() => toggleGroup(groupIndex)}
                        >
                            <h3 className="settings-group-title">{group.title}</h3>
                            <svg 
                                className={`chevron-icon ${expandedGroups[groupIndex] ? 'expanded' : ''}`} 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>
                        {expandedGroups[groupIndex] && (
                            <div className="settings-cards">
                            {group.fields.map(field => (
                                <div className="setting-card glass-card" key={field.key}>
                                    <div className="setting-card-header">
                                        <div className="setting-icon">{field.icon}</div>
                                        <div>
                                            <h4 className="setting-label">{field.label}</h4>
                                            <p className="setting-desc">{field.description}</p>
                                        </div>
                                    </div>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            className="input setting-input"
                                            value={settings[field.key] !== undefined ? settings[field.key] : ''}
                                            onChange={e => handleChange(field.key, e.target.value)}
                                            rows={3}
                                        />
                                    ) : field.type === 'map' ? (
                                        <div className="map-setting-field">
                                            <div className="map-coords-display">
                                                {settings.homeMapLocation?.lat ? (
                                                    <span className="coords-text">
                                                        📌 Lat: <strong>{Number(settings.homeMapLocation.lat).toFixed(4)}</strong>, Lng: <strong>{Number(settings.homeMapLocation.lng).toFixed(4)}</strong>
                                                    </span>
                                                ) : (
                                                    <span className="coords-text muted">ยังไม่ได้ระบุตำแหน่ง</span>
                                                )}
                                            </div>
                                            <button 
                                                className="map-pin-btn"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setShowMapPicker(true);
                                                }}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                ปักหมุดบนแผนที่
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="text"
                                                className="input setting-input"
                                                value={settings[field.key] !== undefined ? settings[field.key] : ''}
                                                onChange={e => handleChange(field.key, e.target.value)}
                                                placeholder={(field.key === 'bookingPaymentBankIconImage' || field.key === 'bookingPromptpayImage') ? 'เช่น /path/to/image.png หรือ https://...' : undefined}
                                            />
                                            {(field.key === 'bookingPaymentBankIconImage' || field.key === 'bookingPromptpayImage') && (
                                                <div className="setting-upload-row">
                                                    <label className="upload-btn">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            style={{ display: 'none' }}
                                                            onChange={e => handleImageUpload(field.key, e.target.files[0])}
                                                        />
                                                        {uploadingKey === field.key ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปจากเครื่อง'}
                                                    </label>
                                                    {settings[field.key] && (
                                                        <div className="upload-preview">
                                                            <div className="upload-preview-thumb">
                                                                <img src={resolveAssetUrl(settings[field.key])} alt="preview" />
                                                            </div>
                                                            <div className="upload-preview-text">
                                                                <span className="upload-preview-label">ใช้รูป:</span>
                                                                <span className="upload-preview-name">
                                                                    {settings[field.key].startsWith('http') ? 'ลิงก์รูปภาพ (URL)' : settings[field.key].split('/').pop()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}

                            {/* Facilities Editor - only in Website group (index 0) */}
                            {groupIndex === 0 && (
                                <div className="setting-card glass-card facilities-editor-card">
                                    <div className="setting-card-header">
                                        <div className="setting-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="3" width="7" height="7" />
                                                <rect x="14" y="3" width="7" height="7" />
                                                <rect x="3" y="14" width="7" height="7" />
                                                <rect x="14" y="14" width="7" height="7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="setting-label">สิ่งอำนวยความสะดวก (Facilities)</h4>
                                            <p className="setting-desc">จัดการรายการสิ่งอำนวยความสะดวกที่แสดงบนหน้า Home</p>
                                        </div>
                                    </div>

                                    <div className="facilities-list">
                                        {getFacilities().map((fac, i) => (
                                            <div className="facility-edit-item" key={i}>
                                                <div 
                                                    className="facility-edit-preview clickable" 
                                                    onClick={() => {
                                                        setActiveFacilityIndex(i);
                                                        setShowIconPicker(true);
                                                    }}
                                                    title="คลิกเพื่อเปลี่ยนไอคอน"
                                                >
                                                    {fac.icon && fac.icon.startsWith('/') ? (
                                                        <img src={fac.icon} alt={fac.title} className="facility-preview-img" />
                                                    ) : (
                                                        <span className="facility-preview-emoji">{fac.icon || '⭐'}</span>
                                                    )}
                                                </div>
                                                <div className="facility-edit-fields">
                                                    <input
                                                        type="text"
                                                        className="input setting-input"
                                                        placeholder="ชื่อ (เช่น ฟรี Wi-Fi)"
                                                        value={fac.title || ''}
                                                        onChange={e => updateFacility(i, 'title', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="input setting-input"
                                                        placeholder="คำอธิบาย (เช่น อินเทอร์เน็ตความเร็วสูง)"
                                                        value={fac.description || ''}
                                                        onChange={e => updateFacility(i, 'description', e.target.value)}
                                                    />
                                                    <button 
                                                        className="facility-select-icon-btn"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setActiveFacilityIndex(i);
                                                            setShowIconPicker(true);
                                                        }}
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                                            <polyline points="21 15 16 10 5 21" />
                                                        </svg>
                                                        เลือกไอคอน
                                                    </button>
                                                </div>
                                                <button 
                                                    className="facility-delete-btn" 
                                                    onClick={() => removeFacility(i)}
                                                    title="ลบรายการนี้"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button className="facility-add-btn" onClick={addFacility}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="16" />
                                            <line x1="8" y1="12" x2="16" y2="12" />
                                        </svg>
                                        เพิ่มสิ่งอำนวยความสะดวก
                                    </button>
                                </div>
                            )}

                            {/* Room Amenities Editor - also in Website group (index 0) or create its own place */}
                            {groupIndex === 0 && (
                                <div className="setting-card glass-card amenities-editor-card" style={{ marginTop: '20px' }}>
                                    <div className="setting-card-header">
                                        <div className="setting-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="setting-label">สิ่งอำนวยความสะดวกในห้องพัก (Room Amenities)</h4>
                                            <p className="setting-desc">จัดการรายการสิ่งอำนวยความสะดวกที่แสดงให้เจ้าของเลือกและการ์ดห้องพัก</p>
                                        </div>
                                    </div>

                                    <div className="facilities-list" style={{ marginTop: '15px' }}>
                                        {getAmenities().map((am, i) => (
                                            <div className="facility-edit-item" key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <input
                                                    type="text"
                                                    className="input setting-input"
                                                    placeholder="ไอคอน (Emoji เช่น ❄️)"
                                                    value={am.icon || ''}
                                                    onChange={e => updateAmenity(i, 'icon', e.target.value)}
                                                    style={{ width: '80px', textAlign: 'center' }}
                                                />
                                                <input
                                                    type="text"
                                                    className="input setting-input"
                                                    placeholder="ชื่อ (เช่น แอร์, เตียง)"
                                                    value={am.label || ''}
                                                    onChange={e => updateAmenity(i, 'label', e.target.value)}
                                                    style={{ flex: 1 }}
                                                />
                                                <button 
                                                    className="facility-delete-btn" 
                                                    onClick={() => removeAmenity(i)}
                                                    title="ลบรายการนี้"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button className="facility-add-btn" onClick={addAmenity} style={{ marginTop: '15px' }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="16" />
                                            <line x1="8" y1="12" x2="16" y2="12" />
                                        </svg>
                                        เพิ่มสิ่งอำนวยความสะดวกใหม่
                                    </button>
                                </div>
                            )}
                        </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="settings-actions">
                <button
                    className="action-btn save-settings-btn"
                    onClick={handleSave}
                    disabled={!hasChanges}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                    </svg>
                    บันทึกการตั้งค่า
                </button>
                <button
                    className="action-btn reset-settings-btn"
                    onClick={handleReset}
                    disabled={!hasChanges}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                    </svg>
                    ยกเลิกการเปลี่ยนแปลง
                </button>
            </div>

            {/* Icon Picker Modal */}
            {showIconPicker && (
                <div className="icon-picker-overlay" onClick={() => setShowIconPicker(false)}>
                    <div className="icon-picker-modal" onClick={e => e.stopPropagation()}>
                        <div className="icon-picker-header">
                            <h3>เลือกไอคอนสำหรับสิ่งอำนวยความสะดวก</h3>
                            <button className="icon-picker-close" onClick={() => setShowIconPicker(false)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="icon-picker-grid">
                            {availableIcons.map((iconPath, index) => (
                                <div 
                                    key={index}
                                    className={`icon-picker-item ${getFacilities()[activeFacilityIndex]?.icon === iconPath ? 'selected' : ''}`}
                                    onClick={() => {
                                        updateFacility(activeFacilityIndex, 'icon', iconPath);
                                        setShowIconPicker(false);
                                    }}
                                >
                                    <img src={iconPath} alt={`Icon ${index}`} />
                                    <span className="icon-name">{iconPath.split('/').pop().replace('.gif', '')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Map Picker Modal */}
            {showMapPicker && (
                <MapPicker
                    lat={settings.homeMapLocation?.lat || 14.8829}
                    lng={settings.homeMapLocation?.lng || 102.0196}
                    onLocationChange={(lat, lng) => {
                        handleChange('homeMapLocation', { lat, lng });
                    }}
                    onClose={() => setShowMapPicker(false)}
                />
            )}
        </div>
    );
}
