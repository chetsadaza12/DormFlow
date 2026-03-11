import React, { useState, useEffect } from 'react';
import { roomAPI, settingsAPI } from '../../services/api';
import './Home.css';

const Home = ({ onNavigateToBilling, onNavigateToAdmin }) => {
    const [allRooms, setAllRooms] = useState([]);
    const [businessName, setBusinessName] = useState('หอพักนรสิงห์');
    const [homeHeroSubtitle, setHomeHeroSubtitle] = useState('ที่พักคุณภาพ สะอาด ปลอดภัย เดินทางสะดวกสบาย');
    const [homeContactPhone, setHomeContactPhone] = useState('092-5152-870 โก้ / 082-508-8909 พอล');
    const [homeContactLineId, setHomeContactLineId] = useState('narasing.dorm');
    const [homeMapLocation, setHomeMapLocation] = useState({ lat: 14.8829, lng: 102.0196 });
    const [facilities, setFacilities] = useState([
        { title: 'ปลอดภัย 24 ชม.', description: 'รปภ. และกล้องวงจรปิด ทุกชั้น', icon: '/assets/images/ปลอดภัย 24 ชม..gif' },
        { title: 'ที่จอดรถ', description: 'กว้างขวาง ร่มรื่น เพียงพอต่อผู้เช่า', icon: '/assets/images/ที่จอดรถ.gif' },
        { title: 'ฟรี Wi-Fi', description: 'อินเทอร์เน็ตความเร็วสูง ครอบคลุมทุกพื้นที่', icon: '/assets/images/Wi-Fi.gif' },
        { title: 'เฟอร์นิเจอร์ครบ', description: 'พร้อมเข้าอยู่ได้ทันที ไม่ต้องซื้อเพิ่ม', icon: '/assets/images/เฟอร์นิเจอร์ครบ.gif' }
    ]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState(null); // null | 'all' | 'available' | 'occupied'

    const handleFilterClick = (filterType) => {
        setSelectedFilter(prev => prev === filterType ? null : filterType);
    };

    const getFilteredRooms = () => {
        if (!selectedFilter || selectedFilter === 'all') return allRooms;
        if (selectedFilter === 'available') return allRooms.filter(r => r.isOccupied === false || r.isOccupied === undefined);
        if (selectedFilter === 'occupied') return allRooms.filter(r => r.isOccupied === true);
        return allRooms;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [rooms, settingsObj] = await Promise.all([
                    roomAPI.getAll(),
                    settingsAPI.get()
                ]);
                
                if (settingsObj) {
                    if (settingsObj.businessName) setBusinessName(settingsObj.businessName);
                    if (settingsObj.homeHeroSubtitle) setHomeHeroSubtitle(settingsObj.homeHeroSubtitle);
                    if (settingsObj.homeContactPhone) setHomeContactPhone(settingsObj.homeContactPhone);
                    if (settingsObj.homeContactLineId) setHomeContactLineId(settingsObj.homeContactLineId);
                    if (settingsObj.homeMapLocation) setHomeMapLocation(settingsObj.homeMapLocation);
                    if (settingsObj.homeFacilities && Array.isArray(settingsObj.homeFacilities)) {
                        setFacilities(settingsObj.homeFacilities);
                    }
                }
                
                
                // Sort rooms by roomNumber to ensure they display in order
                const sortedRooms = rooms.sort((a, b) => {
                    const numA = a.roomNumber.toString().padStart(5, '0');
                    const numB = b.roomNumber.toString().padStart(5, '0');
                    return numA.localeCompare(numB);
                });
                
                setAllRooms(sortedRooms);
            } catch (err) {
                setError('ไม่สามารถโหลดข้อมูลหน้าหลักได้');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <header className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1>{businessName}</h1>
                    <p>{homeHeroSubtitle}</p>
                    <button className="cta-button" onClick={() => document.getElementById('available-rooms').scrollIntoView({ behavior: 'smooth' })}>
                        ดูห้องว่างวันนี้
                    </button>
                </div>
            </header>

            {/* Facilities Section */}
            <section className="facilities-section">
                <h2>สิ่งอำนวยความสะดวกของเรา</h2>
                <div className="facilities-grid">
                    {facilities.map((facility, index) => (
                        <div className="facility-item" key={index}>
                            {facility.icon && facility.icon.startsWith('/') ? (
                                <img className="facility-icon-gif" src={facility.icon} alt={facility.title} />
                            ) : (
                                <span className="facility-icon">{facility.icon || '⭐'}</span>
                            )}
                            <h3>{facility.title}</h3>
                            <p>{facility.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Room Status Section */}
            <section id="available-rooms" className="room-status-section">
                <h2>สถานะห้องพัก</h2>
                
                {isLoading ? (
                    <div className="loading-spinner">กำลังโหลดข้อมูล...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <div className="room-dashboard">
                        {/* Summary Bar - Clickable Filter Tabs */}
                        <div className="room-summary-bar">
                            <div 
                                className={`summary-stat total ${selectedFilter === 'all' ? 'active' : ''}`}
                                onClick={() => handleFilterClick('all')}
                            >
                                <span className="stat-label">ห้องทั้งหมด</span>
                                <span className="stat-value">{allRooms.length}</span>
                                <span className="stat-hint">คลิกเพื่อดู</span>
                            </div>
                            <div 
                                className={`summary-stat available ${selectedFilter === 'available' ? 'active' : ''}`}
                                onClick={() => handleFilterClick('available')}
                            >
                                <span className="stat-label">ห้องว่าง</span>
                                <span className="stat-value">{allRooms.filter(r => r.isOccupied === false || r.isOccupied === undefined).length}</span>
                                <span className="stat-hint">คลิกเพื่อดู</span>
                            </div>
                            <div 
                                className={`summary-stat occupied ${selectedFilter === 'occupied' ? 'active' : ''}`}
                                onClick={() => handleFilterClick('occupied')}
                            >
                                <span className="stat-label">มีผู้เช่าแล้ว</span>
                                <span className="stat-value">{allRooms.filter(r => r.isOccupied === true).length}</span>
                                <span className="stat-hint">คลิกเพื่อดู</span>
                            </div>
                        </div>

                        {/* Rooms Grid - Hidden by default, shown when filter is selected */}
                        {selectedFilter === null ? (
                            <div className="room-grid-placeholder">
                                <div className="placeholder-icon">👆</div>
                                <p>คลิกเลือกประเภทห้องด้านบนเพื่อดูรายละเอียด</p>
                            </div>
                        ) : (
                            <div className="rooms-grid">
                                {getFilteredRooms().map(room => {
                                    const isAvailable = room.isOccupied === false || room.isOccupied === undefined;
                                    
                                    return (
                                        <div key={room._id || room.roomNumber} className={`room-card modern ${isAvailable ? 'available' : 'occupied'}`}>
                                            <div className="room-card-inner">
                                                <div className="room-header-modern">
                                                    <div className="room-number-badge">
                                                        ห้อง {room.roomNumber}
                                                    </div>
                                                    <div className={`status-badge modern ${isAvailable ? 'available' : 'occupied'}`}>
                                                        {isAvailable ? 'ว่าง' : 'ไม่ว่าง'}
                                                    </div>
                                                </div>
                                                
                                                <div className="room-details-modern">
                                                    {isAvailable ? (
                                                        <>
                                                            <div className="price-tag">
                                                                <span className="currency">฿</span>
                                                                <span className="amount">{room.roomRent.toLocaleString()}</span>
                                                                <span className="period">/ เดือน</span>
                                                            </div>
                                                            <div className="amenities-list">
                                                                <span className="amenity" title="เครื่องปรับอากาศ"><i className="icon-ac">❄️</i> แอร์</span>
                                                                <span className="amenity" title="เตียงนอน"><i className="icon-bed">🛏️</i> เตียง</span>
                                                                <span className="amenity" title="เครื่องทำน้ำอุ่น"><i className="icon-heater">🚿</i> น้ำอุ่น</span>
                                                                <span className="amenity" title="ฟรี WiFi"><i className="icon-wifi">📶</i> WiFi</span>
                                                            </div>
                                                            <a href="#contact" className="action-btn modern-btn">สนใจจองห้องนี้</a>
                                                        </>
                                                    ) : (
                                                        <div className="occupied-state">
                                                            <div className="occupied-icon">🔒</div>
                                                            <p>ห้องนี้มีผู้เช่าแล้ว</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Contact & Map Section - Premium Design */}
            <section id="contact" className="contact-map-section">
                <div className="contact-map-wrapper">
                    {/* Left: Contact Info Panel */}
                    <div className="contact-panel">
                        <div className="contact-panel-header">
                            <span className="contact-badge">ติดต่อเรา</span>
                            <h2>พร้อมให้บริการ<br/>ทุกวัน</h2>
                            <p className="contact-subtitle">สนใจจองห้องพัก สอบถามรายละเอียดเพิ่มเติม ติดต่อเราได้เลย!</p>
                        </div>
                        <div className="contact-items">
                            <a href={`tel:${homeContactPhone.split(' ')[0]}`} className="contact-item-card">
                                <div className="contact-item-info">
                                    <span className="contact-item-label">โทรศัพท์</span>
                                    <span className="contact-item-value">{homeContactPhone}</span>
                                </div>
                                <span className="contact-item-arrow">→</span>
                            </a>
                            <a href={`https://line.me/R/ti/p/@${homeContactLineId}`} target="_blank" rel="noopener noreferrer" className="contact-item-card">
                                <div className="contact-item-info">
                                    <span className="contact-item-label">LINE ID</span>
                                    <span className="contact-item-value line-value">{homeContactLineId}</span>
                                </div>
                                <span className="contact-item-arrow">→</span>
                            </a>
                            <div className="contact-item-card">
                                <div className="contact-item-info">
                                    <span className="contact-item-label">ที่ตั้ง</span>
                                    <span className="contact-item-value">{businessName}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Right: Map */}
                    <div className="map-panel">
                        <iframe 
                            title="Location Map"
                            className="map-iframe"
                            loading="lazy" 
                            allowFullScreen 
                            referrerPolicy="no-referrer-when-downgrade" 
                            src={`https://maps.google.com/maps?q=${homeMapLocation?.lat || 14.8829},${homeMapLocation?.lng || 102.0196}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* Footer with Admin Access */}
            <footer className="home-footer">
                <p>© 2026 {businessName}. All rights reserved.</p>
                <div className="hidden-admin-links">
                    <button onClick={onNavigateToBilling} className="text-btn">ระบบคิดบิล</button>
                    <span>|</span>
                    <button onClick={onNavigateToAdmin} className="text-btn">ระบบจัดการ(Admin)</button>
                </div>
            </footer>
        </div>
    );
};

export default Home;
