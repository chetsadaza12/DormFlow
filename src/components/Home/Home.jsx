import React, { useState, useEffect } from 'react';
import { roomAPI, settingsAPI } from '../../services/api';
import BookingForm from '../Booking/BookingForm';
import { STORAGE_KEY_DRAFT, STORAGE_KEY_LINE } from '../Auth/LineCallbackPage';
import './Home.css';

const parseLocationMedia = (urlsString) => {
    if (!urlsString || typeof urlsString !== 'string') return [];
    const items = urlsString
        .split(/\r?\n|,/)
        .map(s => s.trim())
        .filter(Boolean);
    return items.map(src => {
        const lower = src.toLowerCase();
        const isVideo = /\.(mp4|webm|ogg)$/i.test(lower);
        return {
            type: isVideo ? 'video' : 'image',
            src,
            title: ''
        };
    });
};

const Home = ({ onNavigateToBilling, onNavigateToAdmin }) => {
    const [allRooms, setAllRooms] = useState([]);
    const [availableAmenities, setAvailableAmenities] = useState([]);
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
    const [bookingRoom, setBookingRoom] = useState(null); // room number for booking modal
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [locationMediaIndex, setLocationMediaIndex] = useState(0);
    const [locationMedia, setLocationMedia] = useState([]);

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
                    if (settingsObj.roomAmenities && Array.isArray(settingsObj.roomAmenities)) {
                        setAvailableAmenities(settingsObj.roomAmenities);
                    }
                    if (typeof settingsObj.homeLocationMediaUrls === 'string') {
                        setLocationMedia(parseLocationMedia(settingsObj.homeLocationMediaUrls));
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

    const [lineCallbackRoom, setLineCallbackRoom] = useState(null);
    const [lineCallbackLineId, setLineCallbackLineId] = useState('');
    const [lineCallbackDraft, setLineCallbackDraft] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('lineCallback') === '1') {
            try {
                const lineId = sessionStorage.getItem(STORAGE_KEY_LINE) || '';
                const draftRaw = sessionStorage.getItem(STORAGE_KEY_DRAFT);
                let draft = null;
                if (draftRaw) {
                    draft = JSON.parse(draftRaw);
                    sessionStorage.removeItem(STORAGE_KEY_DRAFT);
                }
                sessionStorage.removeItem(STORAGE_KEY_LINE);
                const room = params.get('room') || (draft?.roomNumber ?? '');
                setLineCallbackLineId(lineId);
                setLineCallbackDraft(draft);
                setLineCallbackRoom(room);
                setBookingRoom(room);
                window.history.replaceState({}, '', window.location.pathname);
            } catch (e) {}
        }
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
                                <button
                                    type="button"
                                    className="location-info-btn"
                                    onClick={() => setShowLocationModal(true)}
                                >
                                    ดูที่ตั้งหอพักและรายละเอียดเพิ่มเติม
                                </button>
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
                                                            <div className="room-info-top" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                                                <div className="price-tag">
                                                                    <span className="currency">฿</span>
                                                                    <span className="amount">{room.roomRent.toLocaleString()}</span>
                                                                    <span className="period">/ เดือน</span>
                                                                </div>
                                                                <div className="amenities-list">
                                                                    {(room.amenities && room.amenities.length > 0 ? room.amenities : ['aircon', 'bed', 'waterheater', 'wifi']).map(amId => {
                                                                        const info = availableAmenities.find(a => a.id === amId) || { id: amId, label: amId, icon: '✨', title: amId };
                                                                        return (
                                                                            <span key={amId} className="amenity" title={info.title || info.label}>
                                                                                <i className="icon-am">{info.icon}</i> {info.label}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                            <div className="room-action-bottom">
                                                                <button onClick={() => setBookingRoom(room.roomNumber)} className="action-btn modern-btn">สนใจจองห้องนี้</button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="occupied-state">
                                                            <div className="occupied-icon">🔒</div>
                                                            <p>ห้องนี้มีผู้เช่าแล้ว</p>
                                                            {room.tenantName && (
                                                                <span className="tenant-name-only">{room.tenantName}</span>
                                                            )}
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

            {/* Booking Modal */}
            {bookingRoom && (
                <BookingForm
                    roomNumber={bookingRoom}
                    onClose={() => { setBookingRoom(null); setLineCallbackRoom(null); setLineCallbackLineId(''); setLineCallbackDraft(null); }}
                    onSuccess={() => {}}
                    initialLineId={lineCallbackRoom ? lineCallbackLineId : undefined}
                    initialDraft={lineCallbackRoom ? lineCallbackDraft : undefined}
                />
            )}

            {/* Location Detail Modal */}
            {showLocationModal && (
                <div className="location-modal-overlay" onClick={() => setShowLocationModal(false)}>
                    <div className="location-modal" onClick={e => e.stopPropagation()}>
                        <button className="location-modal-close" onClick={() => setShowLocationModal(false)}>
                            ×
                        </button>
                        <div className="location-modal-header">
                            <h3>ที่ตั้งหอพักและบรรยากาศโดยรอบ</h3>
                            <p>ดูแผนที่ เส้นทาง และข้อมูลติดต่อของ {businessName}</p>
                        </div>
                        <div className="location-modal-body">
                            <div className="location-modal-media">
                                {locationMedia.length > 0 && (
                                    <>
                                        <div className="location-media-main">
                                            {locationMedia[locationMediaIndex].type === 'video' ? (
                                                <video
                                                    key={locationMedia[locationMediaIndex].src}
                                                    src={locationMedia[locationMediaIndex].src}
                                                    controls
                                                    className="location-media-element"
                                                />
                                            ) : (
                                                <img
                                                    src={locationMedia[locationMediaIndex].src}
                                                    alt={locationMedia[locationMediaIndex].title || 'ภาพหอพัก'}
                                                    className="location-media-element"
                                                />
                                            )}
                                            {locationMedia.length > 1 && (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="location-media-nav prev"
                                                        onClick={() =>
                                                            setLocationMediaIndex((locationMediaIndex - 1 + locationMedia.length) % locationMedia.length)
                                                        }
                                                    >
                                                        ‹
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="location-media-nav next"
                                                        onClick={() =>
                                                            setLocationMediaIndex((locationMediaIndex + 1) % locationMedia.length)
                                                        }
                                                    >
                                                        ›
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        {locationMedia.length > 1 && (
                                            <div className="location-media-thumbs">
                                                {locationMedia.map((item, idx) => (
                                                    <button
                                                        key={item.src}
                                                        type="button"
                                                        className={`location-media-thumb ${idx === locationMediaIndex ? 'active' : ''}`}
                                                        onClick={() => setLocationMediaIndex(idx)}
                                                    >
                                                        {item.type === 'video' ? (
                                                            <span className="thumb-video-label">วีดีโอ</span>
                                                        ) : (
                                                            <img src={item.src} alt={item.title || 'ภาพ'} />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="location-modal-info">
                                <h4>ข้อมูลติดต่อ</h4>
                                <p><strong>ชื่อหอพัก:</strong> {businessName}</p>
                                <p><strong>โทรศัพท์:</strong> {homeContactPhone}</p>
                                <p><strong>LINE:</strong> {homeContactLineId}</p>
                                <p className="location-modal-note">
                                    จากแผนที่สามารถดูเส้นทางมายังหอพักได้อย่างชัดเจน เหมาะสำหรับส่งให้ผู้เช่าใหม่ หรือใช้วางแผนเดินทางล่วงหน้า
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
