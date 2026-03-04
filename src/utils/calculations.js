/**
 * Calculation utilities - สูตรคำนวณค่าน้ำค่าไฟ
 */

/**
 * คำนวณค่าน้ำ
 * @param {number} currentMeter - เลขมิเตอร์น้ำปัจจุบัน
 * @param {number} lastMeter - เลขมิเตอร์น้ำเดือนที่แล้ว
 * @param {number} rate - ราคาต่อหน่วย
 * @returns {{ units: number, amount: number }}
 */
export function calculateWaterBill(currentMeter, lastMeter, rate) {
    const units = Math.max(0, currentMeter - lastMeter);
    const amount = units * rate;
    return { units, amount };
}

/**
 * คำนวณค่าไฟ
 * @param {number} currentMeter - เลขมิเตอร์ไฟปัจจุบัน
 * @param {number} lastMeter - เลขมิเตอร์ไฟเดือนที่แล้ว
 * @param {number} rate - ราคาต่อหน่วย
 * @returns {{ units: number, amount: number }}
 */
export function calculateElectricBill(currentMeter, lastMeter, rate) {
    const units = Math.max(0, currentMeter - lastMeter);
    const amount = units * rate;
    return { units, amount };
}

/**
 * คำนวณยอดรวมทั้งหมด
 * @param {number} waterAmount - ค่าน้ำ
 * @param {number} electricAmount - ค่าไฟ
 * @param {number} roomRent - ค่าเช่าห้อง
 * @param {number} fineAmount - ค่าปรับ
 * @returns {number}
 */
export function calculateTotal(waterAmount, electricAmount, roomRent, fineAmount = 0) {
    return waterAmount + electricAmount + roomRent + fineAmount;
}

/**
 * Format ตัวเลขเป็นสกุลเงินไทย
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 2
    }).format(amount);
}

/**
 * Format วันที่เป็นภาษาไทย
 * @param {Date} date
 * @returns {string}
 */
export function formatThaiDate(date = new Date()) {
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
}

/**
 * Format วันที่สั้นภาษาไทย
 */
export function formatShortDate(date = new Date()) {
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
