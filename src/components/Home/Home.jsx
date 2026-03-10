import React, { useState, useEffect } from 'react';
import { roomAPI, settingsAPI } from '../../services/api';
import './Home.css';

const Home = ({ onNavigateToBilling, onNavigateToAdmin }) => {
    const [allRooms, setAllRooms] = useState([]);
    const [businessName, setBusinessName] = useState('หอพักนรสิงห์');
    const [homeHeroSubtitle, setHomeHeroSubtitle] = useState('ที่พักคุณภาพ สะอาด ปลอดภัย เดินทางสะดวกสบาย');
    const [homeContactPhone, setHomeContactPhone] = useState('092-5152-870 โก้ / 082-508-8909 พอล');
    const [homeContactLineId, setHomeContactLineId] = useState('narasing.dorm');

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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
                    <div className="facility-item">
                        <span className="facility-icon">🛡️</span>
                        <h3>ปลอดภัย 24 ชม.</h3>
                        <p>รปภ. และกล้องวงจรปิด ทุกชั้น</p>
                    </div>
                    <div className="facility-item">
                        <span className="facility-icon">🚗</span>
                        <h3>ที่จอดรถ</h3>
                        <p>กว้างขวาง ร่มรื่น เพียงพอต่อผู้เช่า</p>
                    </div>
                    <div className="facility-item">
                        <span className="facility-icon">📶</span>
                        <h3>ฟรี Wi-Fi</h3>
                        <p>อินเทอร์เน็ตความเร็วสูง ครอบคลุมทุกพื้นที่</p>
                    </div>
                    <div className="facility-item">
                        <span className="facility-icon">🛏️</span>
                        <h3>เฟอร์นิเจอร์ครบ</h3>
                        <p>พร้อมเข้าอยู่ได้ทันที ไม่ต้องซื้อเพิ่ม</p>
                    </div>
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
                        {/* Summary Bar */}
                        <div className="room-summary-bar">
                            <div className="summary-stat total">
                                <span className="stat-label">ห้องทั้งหมด</span>
                                <span className="stat-value">{allRooms.length}</span>
                            </div>
                            <div className="summary-stat available">
                                <span className="stat-label">ห้องว่าง</span>
                                <span className="stat-value">{allRooms.filter(r => r.isOccupied === false || r.isOccupied === undefined).length}</span>
                            </div>
                            <div className="summary-stat occupied">
                                <span className="stat-label">มีผู้เช่าแล้ว</span>
                                <span className="stat-value">{allRooms.filter(r => r.isOccupied === true).length}</span>
                            </div>
                        </div>

                        {/* Rooms Grid */}
                        <div className="rooms-grid">
                            {allRooms.map(room => {
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
                    </div>
                )}
            </section>

            {/* Contact Section */}
            <section id="contact" className="contact-section">
                <h2>ติดต่อสอบถาม / จองห้องพัก</h2>
                <div className="contact-info">
                    <div className="contact-card modern">
                        <div className="contact-icon">📞</div>
                        <h3>โทรศัพท์</h3>
                        <p>{homeContactPhone}</p>
                    </div>
                    <div className="contact-card modern">
                        <div className="contact-icon">💬</div>
                        <h3>LINE ID</h3>
                        <p className="highlight-text">{homeContactLineId}</p>
                        <p className="hint">แอดไลน์เพื่อสอบถามรายละเอียด</p>
                    </div>
                    <div className="contact-card modern">
                        <div className="contact-icon">📍</div>
                        <h3>ที่ตั้ง</h3>
                        <p>{businessName}</p>
                        <p className="hint">แผนที่ Google Maps</p>
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
