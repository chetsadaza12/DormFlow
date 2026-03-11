import { useState, useEffect, useRef } from 'react';
import './MapPicker.css';

export default function MapPicker({ lat, lng, onLocationChange, onClose }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [currentLat, setCurrentLat] = useState(lat || 14.8829);
    const [currentLng, setCurrentLng] = useState(lng || 102.0196);
    const [leafletLoaded, setLeafletLoaded] = useState(false);

    // Load Leaflet from CDN
    useEffect(() => {
        if (window.L) {
            setLeafletLoaded(true);
            return;
        }

        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => setLeafletLoaded(true);
        document.head.appendChild(script);

        return () => {
            // Cleanup is optional, keeping CDN resources for reuse
        };
    }, []);

    // Initialize map
    useEffect(() => {
        if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;

        const L = window.L;
        const map = L.map(mapRef.current).setView([currentLat, currentLng], 15);

        L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            attribution: '© Google Maps',
            maxZoom: 20
        }).addTo(map);

        // Add marker
        const marker = L.marker([currentLat, currentLng], { draggable: true }).addTo(map);
        
        // Marker drag
        marker.on('dragend', () => {
            const pos = marker.getLatLng();
            setCurrentLat(pos.lat);
            setCurrentLng(pos.lng);
        });

        // Click on map to move marker
        map.on('click', (e) => {
            marker.setLatLng(e.latlng);
            setCurrentLat(e.latlng.lat);
            setCurrentLng(e.latlng.lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

        // Fix map size after render
        setTimeout(() => map.invalidateSize(), 100);

        return () => {
            map.remove();
            mapInstanceRef.current = null;
            markerRef.current = null;
        };
    }, [leafletLoaded]);

    // Search location using Nominatim (free)
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
            );
            const results = await response.json();
            if (results.length > 0) {
                const { lat: newLat, lon: newLng } = results[0];
                const parsedLat = parseFloat(newLat);
                const parsedLng = parseFloat(newLng);
                setCurrentLat(parsedLat);
                setCurrentLng(parsedLng);
                if (mapInstanceRef.current && markerRef.current) {
                    mapInstanceRef.current.setView([parsedLat, parsedLng], 16);
                    markerRef.current.setLatLng([parsedLat, parsedLng]);
                }
            } else {
                alert('ไม่พบตำแหน่งที่ค้นหา ลองใช้ชื่อสถานที่อื่น');
            }
        } catch (err) {
            alert('เกิดข้อผิดพลาดในการค้นหา');
        } finally {
            setIsSearching(false);
        }
    };

    const handleConfirm = () => {
        onLocationChange(currentLat, currentLng);
        onClose();
    };

    return (
        <div className="map-picker-overlay" onClick={onClose}>
            <div className="map-picker-modal" onClick={e => e.stopPropagation()}>
                <div className="map-picker-header">
                    <h3>📍 เลือกตำแหน่งที่ตั้งหอพัก</h3>
                    <button className="map-picker-close" onClick={onClose}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="map-picker-search">
                    <input 
                        type="text" 
                        placeholder="ค้นหาสถานที่... เช่น หอพักนรสิงห์ นครราชสีมา"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch} disabled={isSearching}>
                        {isSearching ? '⏳' : '🔍'} ค้นหา
                    </button>
                </div>

                <p className="map-picker-hint">คลิกบนแผนที่หรือลากหมุดเพื่อเปลี่ยนตำแหน่ง</p>

                <div className="map-picker-container" ref={mapRef}>
                    {!leafletLoaded && (
                        <div className="map-loading">กำลังโหลดแผนที่...</div>
                    )}
                </div>

                <div className="map-picker-coords">
                    <span>📌 Lat: <strong>{currentLat.toFixed(6)}</strong></span>
                    <span>📌 Lng: <strong>{currentLng.toFixed(6)}</strong></span>
                </div>

                <div className="map-picker-actions">
                    <button className="map-picker-cancel" onClick={onClose}>ยกเลิก</button>
                    <button className="map-picker-confirm" onClick={handleConfirm}>
                        ✅ ยืนยันตำแหน่งนี้
                    </button>
                </div>
            </div>
        </div>
    );
}
