import { useState, useEffect } from 'react';
import { roomAPI, settingsAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import './RoomManager.css';

export default function RoomManager() {
    const [rooms, setRooms] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        roomNumber: '', tenantName: '', lastWaterMeter: 0,
        lastElectricMeter: 0, waterRate: 18, electricRate: 8,
        roomRent: 0, isOccupied: true
    });
    const [error, setError] = useState('');
    const { showToast, showConfirm } = useNotification();

    // Pagination & Search State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const data = await roomAPI.getAll();
            setRooms(data);
        } catch (err) {
            showToast(err.message || 'ไม่สามารถโหลดข้อมูลห้องได้', 'error');
        }
    }

    async function openAddModal() {
        try {
            const rates = await settingsAPI.getRates();
            setEditingRoom(null);
            setFormData({
                roomNumber: '', tenantName: '', lastWaterMeter: 0,
                lastElectricMeter: 0, waterRate: rates.waterRate, electricRate: rates.electricRate,
                roomRent: 0, isOccupied: true
            });
            setError('');
            setShowModal(true);
        } catch (err) {
            showToast('ไม่สามารถดึงอัตราค่าบริการเริ่มต้นได้', 'error');
        }
    }

    function openEditModal(room) {
        setEditingRoom(room.roomNumber);
        setFormData({ ...room });
        setError('');
        setShowModal(true);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!formData.roomNumber.trim()) {
            setError('กรุณากรอกเลขห้อง');
            return;
        }

        try {
            if (editingRoom) {
                await roomAPI.update(editingRoom, formData);
            } else {
                await roomAPI.create(formData);
            }

            setShowModal(false);
            loadData();
            if (!editingRoom) {
                setCurrentPage(1);
                setSearchTerm('');
            }
            showToast(editingRoom ? 'อัปเดตข้อมูลห้องสำเร็จ' : 'เพิ่มห้องใหม่สำเร็จ', 'success');
        } catch (err) {
            setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    }

    function handleDelete(roomNumber) {
        showConfirm(`ยืนยันลบห้อง ${roomNumber}?`, async () => {
            try {
                await roomAPI.delete(roomNumber);
                loadData();
                showToast(`ลบห้อง ${roomNumber} สำเร็จ`, 'success');
            } catch (err) {
                showToast(err.message || 'เกิดข้อผิดพลาดในการลบห้อง', 'error');
            }
        });
    }

    function handleChange(field, value) {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    // ============ SEARCH & PAGINATION COMPUTATION ============
    const filteredRooms = rooms.filter(room =>
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.tenantName && room.tenantName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRooms = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="room-manager" id="roomManagerPage">
            <div className="page-header">
                <h2 className="admin-page-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    จัดการห้อง
                </h2>
                <div className="header-actions" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="search-box glass-card" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="ค้นหาเลขห้อง หรือ ชื่อผู้เช่า..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', width: '200px', fontSize: '0.9rem' }}
                        />
                    </div>
                    <button className="add-btn" onClick={openAddModal}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        เพิ่มห้องใหม่
                    </button>
                </div>
            </div>

            <div className="glass-card room-table-card">
                <div className="table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>เลขห้อง</th>
                                <th>ผู้เช่า</th>
                                <th>สถานะ</th>
                                <th className="align-right">มิเตอร์น้ำ</th>
                                <th className="align-right">มิเตอร์ไฟ</th>
                                <th className="align-right">ค่าน้ำ/หน่วย</th>
                                <th className="align-right">ค่าไฟ/หน่วย</th>
                                <th className="align-right">ค่าเช่า</th>
                                <th className="actions-col">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRooms.length > 0 ? (
                                currentRooms.map(room => (
                                    <tr key={room.roomNumber}>
                                        <td className="room-cell">{room.roomNumber}</td>
                                        <td>{room.tenantName || '-'}</td>
                                        <td>
                                            <span className={`status-badge ${room.isOccupied ? 'occupied' : 'vacant'}`}>
                                                {room.isOccupied ? 'มีคนเช่า' : 'ว่าง'}
                                            </span>
                                        </td>
                                        <td className="align-right">{room.lastWaterMeter.toLocaleString()}</td>
                                        <td className="align-right">{room.lastElectricMeter.toLocaleString()}</td>
                                        <td className="align-right">{room.waterRate}</td>
                                        <td className="align-right">{room.electricRate}</td>
                                        <td className="align-right">{room.roomRent.toLocaleString()}</td>
                                        <td className="actions-col">
                                            <button className="icon-btn edit-icon" onClick={() => openEditModal(room)} title="แก้ไข">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                            </button>
                                            <button className="icon-btn delete-icon" onClick={() => handleDelete(room.roomNumber)} title="ลบ">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center py-4 text-gray-400">ไม่พบข้อมูลห้อง</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer with Items per page & Pagination */}
                <div className="table-footer">
                    <div className="items-per-page">
                        <span className="items-label">แสดงทีละ:</span>
                        <select
                            className="input select-mini"
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value="5">5 ห้อง</option>
                            <option value="8">8 ห้อง</option>
                            <option value="15">15 ห้อง</option>
                            <option value="50">50 ห้อง</option>
                            <option value="100">100 ห้อง</option>
                        </select>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-container">
                            <button
                                className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                                ก่อนหน้า
                            </button>

                            <div className="pagination-numbers">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                                    <button
                                        key={num}
                                        onClick={() => paginate(num)}
                                        className={`pagination-num ${currentPage === num ? 'active' : ''}`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>

                            <button
                                className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                ถัดไป
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Room Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">{editingRoom ? `แก้ไขห้อง ${editingRoom}` : 'เพิ่มห้องใหม่'}</h3>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>เลขห้อง</label>
                                    <input type="text" className="input" value={formData.roomNumber}
                                        onChange={e => handleChange('roomNumber', e.target.value)} disabled={!!editingRoom} />
                                </div>
                                <div className="form-group">
                                    <label>ชื่อผู้เช่า</label>
                                    <input type="text" className="input" value={formData.tenantName}
                                        onChange={e => handleChange('tenantName', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>เลขมิเตอร์น้ำ</label>
                                    <input type="number" className="input" value={formData.lastWaterMeter}
                                        onChange={e => handleChange('lastWaterMeter', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>เลขมิเตอร์ไฟ</label>
                                    <input type="number" className="input" value={formData.lastElectricMeter}
                                        onChange={e => handleChange('lastElectricMeter', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>ค่าน้ำ/หน่วย (บาท)</label>
                                    <input type="number" className="input" value={formData.waterRate}
                                        onChange={e => handleChange('waterRate', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>ค่าไฟ/หน่วย (บาท)</label>
                                    <input type="number" className="input" value={formData.electricRate}
                                        onChange={e => handleChange('electricRate', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>ค่าเช่าห้อง (บาท)</label>
                                    <input type="number" className="input" value={formData.roomRent}
                                        onChange={e => handleChange('roomRent', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>สถานะ</label>
                                    <select className="input" value={formData.isOccupied ? 'true' : 'false'}
                                        onChange={e => handleChange('isOccupied', e.target.value === 'true')}>
                                        <option value="true">มีคนเช่า</option>
                                        <option value="false">ว่าง</option>
                                    </select>
                                </div>
                            </div>

                            {error && <p className="form-error">{error}</p>}

                            <div className="modal-actions">
                                <button type="submit" className="submit-btn">
                                    {editingRoom ? 'บันทึกการแก้ไข' : 'เพิ่มห้อง'}
                                </button>
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                                    ยกเลิก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
