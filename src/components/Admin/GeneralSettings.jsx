import { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import './GeneralSettings.css';

export default function GeneralSettings() {
    const { showToast } = useNotification();
    const [settings, setSettings] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState({}); // Stores which groups are expanded
    
    // Icon Picker State
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [activeFacilityIndex, setActiveFacilityIndex] = useState(null);

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
                                    ) : (
                                        <input
                                            type="text"
                                            className="input setting-input"
                                            value={settings[field.key] !== undefined ? settings[field.key] : ''}
                                            onChange={e => handleChange(field.key, e.target.value)}
                                        />
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
        </div>
    );
}
