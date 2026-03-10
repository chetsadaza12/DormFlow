import React, { useState, useEffect } from 'react';
import { roomAPI } from '../../services/api';
import './Home.css';

const Home = ({ onNavigateToBilling, onNavigateToAdmin }) => {
    const [availableRooms, setAvailableRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAvailableRooms = async () => {
            try {
                setIsLoading(true);
                const rooms = await roomAPI.getAll(); // Temporarily using getAll and filtering client side if the new endpoint isn't fully ready, or we can use a new method if we add it to api.js. Let's add it to api.js next.
                // Assuming we update api.js to have getAvailable()
                // const rooms = await roomAPI.getAvailable();
                setAvailableRooms(rooms.filter(r => r.isOccupied === false || r.isOccupied === undefined));
            } catch (err) {
                setError('ไม่สามารถโหลดข้อมูลห้องว่างได้');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAvailableRooms();
    }, []);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <header className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1>หอพักนรสิงห์</h1>
                    <p>ที่พักคุณภาพ สะอาด ปลอดภัย เดินทางสะดวกสบาย</p>
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

            {/* Available Rooms Section */}
            <section id="available-rooms" className="available-rooms-section">
                <h2>ห้องว่างพร้อมเข้าอยู่</h2>
                
                {isLoading ? (
                    <div className="loading-spinner">กำลังโหลดข้อมูล...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : availableRooms.length === 0 ? (
                    <div className="no-rooms-message">
                        <h3>😔 ขณะนี้ห้องพักเต็มทุกห้อง</h3>
                        <p>กรุณาติดตามหรือติดต่อสอบถามล่วงหน้า</p>
                    </div>
                ) : (
                    <div className="rooms-grid">
                        {availableRooms.map(room => (
                            <div key={room._id || room.roomNumber} className="room-card">
                                <div className="room-image-placeholder">
                                    <span>ห้อง {room.roomNumber}</span>
                                </div>
                                <div className="room-details">
                                    <div className="room-header">
                                        <h3>ห้อง {room.roomNumber}</h3>
                                        <span className="status-badge available">ว่าง</span>
                                    </div>
                                    <p className="room-price">
                                        เริ่มต้น <span className="price">{room.roomRent.toLocaleString()}</span> บาท/เดือน
                                    </p>
                                    <div className="room-features">
                                        <span>❄️ แอร์</span>
                                        <span>🛏️ เตียง</span>
                                        <span>🚿 น้ำอุ่น</span>
                                    </div>
                                    <a href="#contact" className="contact-btn">สนใจติดต่อเช่า</a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Contact Section */}
            <section id="contact" className="contact-section">
                <h2>ติดต่อสอบถาม / จองห้องพัก</h2>
                <div className="contact-info">
                    <div className="contact-card">
                        <h3>📞 โทรศัพท์</h3>
                        <p>092-5152-870 (โก้)</p>
                        <p>082-508-8909 (พอล)</p>
                    </div>
                    <div className="contact-card">
                        <h3>💬 LINE ID</h3>
                        <p>narasing.dorm</p>
                        <p className="hint">(แอดไลน์เพื่อสอบถามรายละเอียดเพิ่มเติม)</p>
                    </div>
                    <div className="contact-card">
                        <h3>📍 ที่ตั้ง</h3>
                        <p>หอพักนรสิงห์</p>
                        <p className="hint">(แผนที่ Google Maps)</p>
                    </div>
                </div>
            </section>

            {/* Footer with Admin Access */}
            <footer className="home-footer">
                <p>© 2026 Narasing Apartment. All rights reserved.</p>
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
