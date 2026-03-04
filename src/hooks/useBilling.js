import { useState, useCallback } from 'react';
import { getRoomByNumber, updateRoomMeters, saveBillRecord } from '../data/mockData';
import { calculateWaterBill, calculateElectricBill, calculateTotal } from '../utils/calculations';

/**
 * Custom Hook - useBilling
 * จัดการ state และ logic ทั้งหมดของระบบคิดบิล
 */
export function useBilling() {
    const [roomNumber, setRoomNumber] = useState('');
    const [roomData, setRoomData] = useState(null);
    const [currentWaterMeter, setCurrentWaterMeter] = useState('');
    const [currentElectricMeter, setCurrentElectricMeter] = useState('');
    const [currentFine, setCurrentFine] = useState('');
    const [currentFineNote, setCurrentFineNote] = useState('');
    const [billingResult, setBillingResult] = useState(null);
    const [error, setError] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isBillSaved, setIsBillSaved] = useState(false);

    /**
     * ค้นหาข้อมูลห้อง
     */
    const searchRoom = useCallback((number) => {
        const num = number || roomNumber;
        if (!num.trim()) {
            setError('กรุณากรอกเลขห้อง');
            return;
        }

        setIsSearching(true);
        setError('');
        setBillingResult(null);
        setCurrentWaterMeter('');
        setCurrentElectricMeter('');
        setCurrentFine('');
        setCurrentFineNote('');
        setIsBillSaved(false);

        // จำลอง delay เล็กน้อยเหมือนดึงจากฐานข้อมูล
        setTimeout(() => {
            const room = getRoomByNumber(num);
            if (room) {
                setRoomData(room);
                setError('');
            } else {
                setRoomData(null);
                setError(`ไม่พบข้อมูลห้อง "${num}"`);
            }
            setIsSearching(false);
        }, 300);
    }, [roomNumber]);

    /**
     * คำนวณบิล
     */
    const calculateBill = useCallback(() => {
        if (!roomData) return;

        // ถ้ายังกรอกไม่ครบ ไม่ต้องทำอะไร (ซ่อน error และ result)
        if (!currentWaterMeter || !currentElectricMeter) {
            setBillingResult(null);
            setError('');
            return;
        }

        const waterMeter = parseFloat(currentWaterMeter);
        const electricMeter = parseFloat(currentElectricMeter);
        const fineAmount = parseFloat(currentFine) || 0;

        if (isNaN(waterMeter) || isNaN(electricMeter)) {
            setBillingResult(null);
            setError('');
            return;
        }

        let errors = [];

        if (waterMeter < roomData.lastWaterMeter) {
            errors.push(`มิเตอร์น้ำน้อยกว่าเดือนที่แล้ว (${roomData.lastWaterMeter.toLocaleString()})`);
        }

        if (electricMeter < roomData.lastElectricMeter) {
            errors.push(`มิเตอร์ไฟน้อยกว่าเดือนที่แล้ว (${roomData.lastElectricMeter.toLocaleString()})`);
        }

        if (errors.length > 0) {
            setError(errors.join(' | '));
        } else {
            setError('');
        }

        const water = calculateWaterBill(waterMeter, roomData.lastWaterMeter, roomData.waterRate);
        const electric = calculateElectricBill(electricMeter, roomData.lastElectricMeter, roomData.electricRate);
        const total = calculateTotal(water.amount, electric.amount, roomData.roomRent, fineAmount);

        setBillingResult({
            roomNumber: roomData.roomNumber,
            tenantName: roomData.tenantName,
            billingDate: new Date().toISOString(),
            water: {
                lastMeter: roomData.lastWaterMeter,
                currentMeter: waterMeter,
                units: water.units,
                rate: roomData.waterRate,
                amount: water.amount
            },
            electric: {
                lastMeter: roomData.lastElectricMeter,
                currentMeter: electricMeter,
                units: electric.units,
                rate: roomData.electricRate,
                amount: electric.amount
            },
            fineAmount,
            fineNote: currentFineNote.trim(),
            roomRent: roomData.roomRent,
            total
        });
    }, [roomData, currentWaterMeter, currentElectricMeter, currentFine, currentFineNote]);

    /**
     * บันทึกบิลและอัพเดตมิเตอร์
     */
    const saveBill = useCallback(() => {
        if (!billingResult) return false;

        // บันทึกประวัติบิล
        const saved = saveBillRecord(billingResult);

        // อัพเดตเลขมิเตอร์เป็นเดือนล่าสุด
        if (saved) {
            updateRoomMeters(
                billingResult.roomNumber,
                billingResult.water.currentMeter,
                billingResult.electric.currentMeter
            );
            setIsBillSaved(true);
        }

        return saved;
    }, [billingResult]);

    /**
     * รีเซ็ตทุกอย่าง
     */
    const resetAll = useCallback(() => {
        setRoomNumber('');
        setRoomData(null);
        setCurrentWaterMeter('');
        setCurrentElectricMeter('');
        setCurrentFine('');
        setCurrentFineNote('');
        setBillingResult(null);
        setError('');
        setIsBillSaved(false);
    }, []);

    return {
        // State
        roomNumber,
        roomData,
        currentWaterMeter,
        currentElectricMeter,
        currentFine,
        currentFineNote,
        billingResult,
        error,
        isSearching,
        isBillSaved,
        // Setters
        setRoomNumber,
        setCurrentWaterMeter,
        setCurrentElectricMeter,
        setCurrentFine,
        setCurrentFineNote,
        // Actions
        searchRoom,
        calculateBill,
        saveBill,
        resetAll
    };
}
