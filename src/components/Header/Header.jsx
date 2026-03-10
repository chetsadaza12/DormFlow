import { useState, useEffect } from 'react';
import { formatThaiDate } from '../../utils/calculations';
import { settingsAPI } from '../../services/api';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import './Header.css';

export default function Header({ onNavigateHome, onNavigateAdmin }) {
    const [settings, setSettings] = useState({ headerSubtitle: 'กำลังโหลด...' });

    useEffect(() => {
        async function loadSettings() {
            try {
                const data = await settingsAPI.get();
                setSettings(data);
            } catch (error) {
                console.error(error);
            }
        }
        loadSettings();
    }, []);

    return (
        <header className="header" id="mainHeader">
            <div className="header-inner">
                <div className="header-brand">
                    <div className="header-icon">
                        <div className="header-icon-anim" />
                    </div>
                    <div className="header-text">
                        <h1 className="header-title">ระบบคิดบิลค่าน้ำค่าไฟ</h1>
                        <p className="header-subtitle">{settings.headerSubtitle}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    {onNavigateHome && (
                        <button className="header-nav-btn no-print" onClick={onNavigateHome}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            หน้าหลัก
                        </button>
                    )}
                    {onNavigateAdmin && (
                        <button className="header-nav-btn no-print" onClick={onNavigateAdmin}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                            </svg>
                            ระบบหลังบ้าน
                        </button>
                    )}
                    <ThemeToggle />
                    <div className="header-date">
                        <div className="header-date-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <span>{formatThaiDate()}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

