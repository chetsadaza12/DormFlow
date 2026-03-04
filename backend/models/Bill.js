/**
 * Bill Model Schema
 * TODO: ใช้ ORM/ODM ตามฐานข้อมูลที่เลือก
 * 
 * Fields:
 * - roomNumber (String, required) - เลขห้อง
 * - tenantName (String) - ชื่อผู้เช่า
 * - billingDate (Date) - วันที่ออกบิล
 * - water (Object)
 *     - lastMeter (Number)
 *     - currentMeter (Number)
 *     - units (Number)
 *     - rate (Number)
 *     - amount (Number)
 * - electric (Object)
 *     - lastMeter (Number)
 *     - currentMeter (Number)
 *     - units (Number)
 *     - rate (Number)
 *     - amount (Number)
 * - fineAmount (Number) - ค่าปรับ
 * - fineNote (String) - หมายเหตุค่าปรับ
 * - roomRent (Number) - ค่าเช่า
 * - total (Number) - ยอดรวม
 * - createdAt (Date)
 * - updatedAt (Date)
 */

export default {};
