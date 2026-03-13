/**
 * API Service Layer
 * ตัวกลางเรียก Backend API แทน localStorage
 */

const API_BASE = 'http://localhost:5000/api'; // Development
// const API_BASE = 'https://narasing-billing-backend.onrender.com/api'; // Production

async function request(url, options = {}) {
    const res = await fetch(`${API_BASE}${url}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาด');
    }
    return data;
}

// ========== ROOM API ==========

export const roomAPI = {
    getAll: async () => {
        const data = await request('/rooms');
        return data.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true, sensitivity: 'base' }));
    },

    getByNumber: (roomNumber) => request(`/rooms/${roomNumber}`),

    create: (roomData) => request('/rooms', {
        method: 'POST',
        body: JSON.stringify(roomData)
    }),

    update: (roomNumber, updates) => request(`/rooms/${roomNumber}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
    }),

    delete: (roomNumber) => request(`/rooms/${roomNumber}`, {
        method: 'DELETE'
    }),

    updateMeters: (roomNumber, waterMeter, electricMeter) => request(`/rooms/${roomNumber}/meters`, {
        method: 'PUT',
        body: JSON.stringify({ waterMeter, electricMeter })
    })
};

// ========== BILL API ==========

export const billAPI = {
    getAll: (roomNumber) => {
        const query = roomNumber ? `?room=${roomNumber}` : '';
        return request(`/bills${query}`);
    },

    getById: (id) => request(`/bills/${id}`),

    create: (billData) => request('/bills', {
        method: 'POST',
        body: JSON.stringify(billData)
    }),

    update: (id, updates) => request(`/bills/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
    }),

    delete: (id) => request(`/bills/${id}`, {
        method: 'DELETE'
    }),

    deleteMultiple: (ids) => request('/bills/bulk', {
        method: 'DELETE',
        body: JSON.stringify({ ids })
    }),

    getDashboardStats: () => request('/bills/stats/dashboard')
};

// ========== SETTINGS API ==========

export const settingsAPI = {
    get: () => request('/settings'),

    update: (settings) => request('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
    }),

    getRates: () => request('/settings/rates'),

    updateRates: (rates) => request('/settings/rates', {
        method: 'PUT',
        body: JSON.stringify(rates)
    }),

    applyRatesToAllRooms: (rates) => request('/settings/rates/apply-all', {
        method: 'PUT',
        body: JSON.stringify(rates)
    })
};

// ========== BOOKING API ==========

export const bookingAPI = {
    getAll: () => request('/bookings'),

    create: async (data) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('phone', data.phone);
        formData.append('lineId', data.lineId || '');
        formData.append('roomNumber', data.roomNumber);
        formData.append('moveInDate', data.moveInDate);
        formData.append('message', data.message || '');
        if (data.depositSlip) {
            formData.append('depositSlip', data.depositSlip);
        }

        const res = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            body: formData
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'เกิดข้อผิดพลาด');
        return result;
    },

    updateStatus: (id, status) => request(`/bookings/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    }),

    verifyDeposit: (id, verified) => request(`/bookings/${id}/verify-deposit`, {
        method: 'PUT',
        body: JSON.stringify({ verified })
    }),

    delete: (id) => request(`/bookings/${id}`, {
        method: 'DELETE'
    }),

    getStats: () => request('/bookings/stats')
};
