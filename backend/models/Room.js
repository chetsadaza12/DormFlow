/**
 * Room Model Schema
 * TODO: ใช้ ORM/ODM ตามฐานข้อมูลที่เลือก
 * 
 * Fields:
 * - roomNumber (String, unique, required) - เลขห้อง
 * - tenantName (String) - ชื่อผู้เช่า
 * - lastWaterMeter (Number) - เลขมิเตอร์น้ำล่าสุด
 * - lastElectricMeter (Number) - เลขมิเตอร์ไฟล่าสุด
 * - waterRate (Number) - อัตราค่าน้ำต่อหน่วย
 * - electricRate (Number) - อัตราค่าไฟต่อหน่วย
 * - roomRent (Number) - ค่าเช่าห้อง
 * - lastBillingDate (Date) - วันที่ออกบิลล่าสุด
 * - isOccupied (Boolean) - สถานะมีคนเช่าหรือไม่
 * - createdAt (Date)
 * - updatedAt (Date)
 */

export default {};
