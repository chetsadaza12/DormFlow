/**
 * Mock Data - ข้อมูลจำลองห้องพัก
 * ใช้ localStorage เป็น persistent storage
 */

const STORAGE_KEY = 'narasing_rooms_data';
const BILLS_KEY = 'narasing_bills_data';

// ข้อมูลเริ่มต้น (ถ้ายังไม่มีใน localStorage)
const initialRooms = [
    {
        roomNumber: '101',
        tenantName: 'คุณสมชาย',
        lastWaterMeter: 1520,
        lastElectricMeter: 4830,
        waterRate: 18,
        electricRate: 8,
        roomRent: 3500,
        lastBillingDate: '2026-02-01'
    },
    {
        roomNumber: '102',
        tenantName: 'คุณสมหญิง',
        lastWaterMeter: 980,
        lastElectricMeter: 3200,
        waterRate: 18,
        electricRate: 8,
        roomRent: 3500,
        lastBillingDate: '2026-02-01'
    },
    {
        roomNumber: '103',
        tenantName: 'คุณวิชัย',
        lastWaterMeter: 2100,
        lastElectricMeter: 5640,
        waterRate: 18,
        electricRate: 8,
        roomRent: 4000,
        lastBillingDate: '2026-02-01'
    },
    {
        roomNumber: '201',
        tenantName: 'คุณนภา',
        lastWaterMeter: 750,
        lastElectricMeter: 2890,
        waterRate: 18,
        electricRate: 8,
        roomRent: 3800,
        lastBillingDate: '2026-02-01'
    },
    {
        roomNumber: '202',
        tenantName: 'คุณอนันต์',
        lastWaterMeter: 1890,
        lastElectricMeter: 6100,
        waterRate: 18,
        electricRate: 8,
        roomRent: 3800,
        lastBillingDate: '2026-02-01'
    },
    {
        roomNumber: '203',
        tenantName: 'คุณพิมพ์',
        lastWaterMeter: 430,
        lastElectricMeter: 1560,
        waterRate: 18,
        electricRate: 8,
        roomRent: 4000,
        lastBillingDate: '2026-02-01'
    },
    {
        roomNumber: '301',
        tenantName: 'คุณธนา',
        lastWaterMeter: 1200,
        lastElectricMeter: 3980,
        waterRate: 18,
        electricRate: 8,
        roomRent: 4200,
        lastBillingDate: '2026-02-01'
    },
    {
        roomNumber: '302',
        tenantName: 'คุณรัตนา',
        lastWaterMeter: 560,
        lastElectricMeter: 2350,
        waterRate: 18,
        electricRate: 8,
        roomRent: 4200,
        lastBillingDate: '2026-02-01'
    }
];

/**
 * Initialize data - โหลดจาก localStorage หรือใช้ข้อมูลเริ่มต้น
 */
function loadRooms() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error loading rooms:', e);
    }
    // ถ้าไม่มีข้อมูลใน localStorage → ใช้ข้อมูลเริ่มต้น
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRooms));
    return [...initialRooms];
}

function saveRooms(rooms) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
}

/**
 * ค้นหาห้องจากเลขห้อง
 */
export function getRoomByNumber(roomNumber) {
    const rooms = loadRooms();
    return rooms.find(r => r.roomNumber === roomNumber.trim()) || null;
}

/**
 * ดึงรายชื่อห้องทั้งหมด
 */
export function getAllRooms() {
    return loadRooms();
}

/**
 * อัพเดตเลขมิเตอร์หลังจากออกบิล
 */
export function updateRoomMeters(roomNumber, newWaterMeter, newElectricMeter) {
    const rooms = loadRooms();
    const idx = rooms.findIndex(r => r.roomNumber === roomNumber);
    if (idx >= 0) {
        rooms[idx].lastWaterMeter = newWaterMeter;
        rooms[idx].lastElectricMeter = newElectricMeter;
        rooms[idx].lastBillingDate = new Date().toISOString().split('T')[0];
        saveRooms(rooms);
        return rooms[idx];
    }
    return null;
}

/**
 * บันทึกประวัติบิล
 */
export function saveBillRecord(bill) {
    try {
        const stored = localStorage.getItem(BILLS_KEY);
        const bills = stored ? JSON.parse(stored) : [];
        bills.push({
            ...bill,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        });
        localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
        return true;
    } catch (e) {
        console.error('Error saving bill:', e);
        return false;
    }
}

/**
 * ดึงประวัติบิลทั้งหมด
 */
export function getBillHistory(roomNumber) {
    try {
        const stored = localStorage.getItem(BILLS_KEY);
        const bills = stored ? JSON.parse(stored) : [];
        if (roomNumber) {
            return bills.filter(b => b.roomNumber === roomNumber);
        }
        return bills;
    } catch (e) {
        console.error('Error loading bills:', e);
        return [];
    }
}
