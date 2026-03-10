import { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import './GeneralSettings.css';

export default function GeneralSettings() {
    const { showToast } = useNotification();
    const [settings, setSettings] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState({}); // Stores which groups are expanded

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
        </div>
    );
}
