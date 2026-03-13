import { useState, useEffect } from 'react';
import { bookingAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import './BookingManager.css';

const STATUS_MAP = {
    pending: { label: 'รอดำเนินการ', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.12)' },
    approved: { label: 'อนุมัติแล้ว', color: '#34d399', bg: 'rgba(16, 185, 129, 0.12)' },
    rejected: { label: 'ปฏิเสธ', color: '#f87171', bg: 'rgba(239, 68, 68, 0.12)' }
};

const API_HOST = 'http://localhost:5000';

export default function BookingManager() {
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, depositVerified: 0, depositPending: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [viewingSlip, setViewingSlip] = useState(null);
    const { showToast, showConfirm } = useNotification();

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            setIsLoading(true);
            const [data, statsData] = await Promise.all([
                bookingAPI.getAll(),
                bookingAPI.getStats()
            ]);
            setBookings(data);
            setStats(statsData);
        } catch (err) {
            showToast('ไม่สามารถโหลดข้อมูลการจองได้', 'error');
        } finally {
            setIsLoading(false);
        }
    }

    async function handleUpdateStatus(id, status) {
        const label = STATUS_MAP[status]?.label || status;
        const confirmed = await showConfirm(`ต้องการเปลี่ยนสถานะเป็น "${label}" ใช่ไหม?`);
        if (!confirmed) return;

        try {
            await bookingAPI.updateStatus(id, status);
            showToast(`อัพเดทสถานะเป็น "${label}" สำเร็จ`, 'success');
            loadData();
        } catch (err) {
            showToast('ไม่สามารถอัพเดทสถานะได้', 'error');
        }
    }

    async function handleVerifyDeposit(id, verified) {
        const msg = verified ? 'ยืนยันว่ามัดจำเข้าแล้ว?' : 'ยกเลิกการยืนยันมัดจำ?';
        const confirmed = await showConfirm(msg);
        if (!confirmed) return;

        try {
            await bookingAPI.verifyDeposit(id, verified);
            showToast(verified ? 'ยืนยันมัดจำสำเร็จ' : 'ยกเลิกการยืนยันมัดจำ', 'success');
            loadData();
        } catch (err) {
            showToast('ไม่สามารถอัพเดทสถานะมัดจำได้', 'error');
        }
    }

    async function handleDelete(id) {
        const confirmed = await showConfirm('ต้องการลบการจองนี้ใช่ไหม?');
        if (!confirmed) return;

        try {
            await bookingAPI.delete(id);
            showToast('ลบการจองสำเร็จ', 'success');
            loadData();
        } catch (err) {
            showToast('ไม่สามารถลบการจองได้', 'error');
        }
    }

    const filteredBookings = bookings.filter(b => {
        const matchesSearch = !searchTerm ||
            b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.phone.includes(searchTerm) ||
            b.roomNumber.includes(searchTerm);
        const matchesFilter = filterStatus === 'all' || b.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('th-TH', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    }

    function formatDateTime(dateStr) {
        return new Date(dateStr).toLocaleString('th-TH', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    if (isLoading) {
        return <div className="bm-loading">กำลังโหลดข้อมูล...</div>;
    }

    return (
        <div className="booking-manager">
            <h2 className="admin-page-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
                การจองห้องพัก
            </h2>

            {/* Stats Cards */}
            <div className="bm-stats">
                <div className={`bm-stat-card ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>
                    <span className="bm-stat-num">{stats.total}</span>
                    <span className="bm-stat-label">ทั้งหมด</span>
                </div>
                <div className={`bm-stat-card pending ${filterStatus === 'pending' ? 'active' : ''}`} onClick={() => setFilterStatus('pending')}>
                    <span className="bm-stat-num">{stats.pending}</span>
                    <span className="bm-stat-label">รอดำเนินการ</span>
                </div>
                <div className={`bm-stat-card approved ${filterStatus === 'approved' ? 'active' : ''}`} onClick={() => setFilterStatus('approved')}>
                    <span className="bm-stat-num">{stats.approved}</span>
                    <span className="bm-stat-label">อนุมัติแล้ว</span>
                </div>
                <div className={`bm-stat-card rejected ${filterStatus === 'rejected' ? 'active' : ''}`} onClick={() => setFilterStatus('rejected')}>
                    <span className="bm-stat-num">{stats.rejected}</span>
                    <span className="bm-stat-label">ปฏิเสธ</span>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="bm-toolbar glass-card">
                <div className="bm-search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        className="input"
                        placeholder="ค้นหาชื่อ, เบอร์โทร, เลขห้อง..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="bm-filter-pills">
                    {['all', 'pending', 'approved', 'rejected'].map(s => (
                        <button
                            key={s}
                            className={`bm-pill ${filterStatus === s ? 'active' : ''}`}
                            onClick={() => setFilterStatus(s)}
                        >
                            {s === 'all' ? 'ทั้งหมด' : STATUS_MAP[s].label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Booking Cards */}
            {filteredBookings.length === 0 ? (
                <div className="bm-empty glass-card">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="bm-empty-icon">
                        <rect x="2" y="3" width="20" height="18" rx="2" /><line x1="8" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="12" y2="14" />
                    </svg>
                    <p>ยังไม่มีรายการจอง</p>
                </div>
            ) : (
                <div className="bm-list">
                    {filteredBookings.map(booking => {
                        const statusInfo = STATUS_MAP[booking.status];
                        return (
                            <div key={booking._id} className={`bm-card glass-card ${booking.status}`}>
                                <div className="bm-card-header">
                                    <div className="bm-card-room">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                        ห้อง {booking.roomNumber}
                                    </div>
                                    <span
                                        className="bm-status-badge"
                                        style={{ color: statusInfo.color, background: statusInfo.bg }}
                                    >
                                        {statusInfo.label}
                                    </span>
                                </div>

                                <div className="bm-card-body">
                                    <div className="bm-info-row">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        <span>{booking.name}</span>
                                    </div>
                                    <div className="bm-info-row">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                                        <a href={`tel:${booking.phone}`}>{booking.phone}</a>
                                    </div>
                                    {booking.lineId && (
                                        <div className="bm-info-row">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                                            <span>LINE: {booking.lineId}</span>
                                        </div>
                                    )}
                                    <div className="bm-info-row">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                        <span>เข้าอยู่: {formatDate(booking.moveInDate)}</span>
                                    </div>
                                    {booking.message && (
                                        <div className="bm-info-row bm-message">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg>
                                            <span>{booking.message}</span>
                                        </div>
                                    )}
                                    <div className="bm-info-row bm-timestamp">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                        <span>จองเมื่อ: {formatDateTime(booking.createdAt)}</span>
                                    </div>

                                    {/* Deposit Section */}
                                    <div className="bm-deposit-section">
                                        <div className="bm-deposit-header">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                                            <span>มัดจำ ฿{booking.depositAmount || 500}</span>
                                            <span className={`bm-deposit-badge ${booking.depositVerified ? 'verified' : 'unverified'}`}>
                                                {booking.depositVerified ? '✓ เข้าแล้ว' : '⏳ รอตรวจสอบ'}
                                            </span>
                                        </div>
                                        {booking.depositSlip ? (
                                            <div className="bm-slip-thumbnail" onClick={() => setViewingSlip(`${API_HOST}${booking.depositSlip}`)}>
                                                <img src={`${API_HOST}${booking.depositSlip}`} alt="สลิป" />
                                                <div className="bm-slip-overlay">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                                                    ดูสลิป
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bm-no-slip">ไม่มีสลิป</div>
                                        )}
                                        {booking.depositSlip && !booking.depositVerified && (
                                            <button className="bm-verify-btn" onClick={() => handleVerifyDeposit(booking._id, true)}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                                ยืนยันมัดจำเข้าแล้ว
                                            </button>
                                        )}
                                        {booking.depositVerified && (
                                            <button className="bm-unverify-btn" onClick={() => handleVerifyDeposit(booking._id, false)}>
                                                ยกเลิกการยืนยัน
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="bm-card-actions">
                                    {booking.status !== 'approved' && (
                                        <button className="bm-action-btn approve" onClick={() => handleUpdateStatus(booking._id, 'approved')}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                                            อนุมัติ
                                        </button>
                                    )}
                                    {booking.status !== 'rejected' && (
                                        <button className="bm-action-btn reject" onClick={() => handleUpdateStatus(booking._id, 'rejected')}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            ปฏิเสธ
                                        </button>
                                    )}
                                    {booking.status !== 'pending' && (
                                        <button className="bm-action-btn reset" onClick={() => handleUpdateStatus(booking._id, 'pending')}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>
                                            รอดำเนินการ
                                        </button>
                                    )}
                                    <button className="bm-action-btn delete" onClick={() => handleDelete(booking._id)}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                        ลบ
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Slip Lightbox */}
            {viewingSlip && (
                <div className="bm-slip-lightbox" onClick={() => setViewingSlip(null)}>
                    <div className="bm-slip-lightbox-content" onClick={e => e.stopPropagation()}>
                        <button className="bm-slip-lightbox-close" onClick={() => setViewingSlip(null)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                        <img src={viewingSlip} alt="สลิปโอนเงิน" />
                    </div>
                </div>
            )}
        </div>
    );
}
