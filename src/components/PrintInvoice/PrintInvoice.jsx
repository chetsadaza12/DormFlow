import { formatShortDate } from '../../utils/calculations';
import './PrintInvoice.css';

export default function PrintInvoice({ billingResult, onClose }) {
    if (!billingResult) return null;

    function handlePrint() {
        window.print();
    }

    const billingDate = new Date(billingResult.billingDate);
    const thaiYear = billingDate.getFullYear() + 543;
    const formattedDate = `${String(billingDate.getDate()).padStart(2, '0')} - ${String(billingDate.getMonth() + 1).padStart(2, '0')} - ${thaiYear}`;

    return (
        <div className="print-overlay" id="printInvoiceOverlay">
            <div className="print-container">
                {/* Close Button (no-print) */}
                <button className="close-btn no-print" onClick={onClose} id="closePrintBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Invoice Content */}
                <div className="invoice-paper" id="invoicePaper">
                    <div className="invoice-header">
                        <h1 className="invoice-title">บิลค่าเช่าห้องแถว นรสิงห์</h1>
                    </div>

                    <div className="invoice-room">
                        <h2>ห้อง {billingResult.roomNumber}</h2>
                    </div>

                    <div className="invoice-date">
                        <p>{formattedDate}</p>
                    </div>

                    {/* Detail Table */}
                    <table className="invoice-table-v2">
                        <thead>
                            <tr>
                                <th>รายการ</th>
                                <th className="align-right">เลขครั้งก่อน</th>
                                <th className="align-right">เลขครั้งนี้</th>
                                <th className="align-right">จำนวนหน่วยที่ใช้</th>
                                <th className="align-right">หน่วยละ</th>
                                <th className="align-right">ราคาสุทธิ ต่อรายการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="center-text">ค่าน้ำ</td>
                                <td className="align-right">{billingResult.water.lastMeter}</td>
                                <td className="align-right">{billingResult.water.currentMeter}</td>
                                <td className="align-right">{billingResult.water.units.toFixed(2)}</td>
                                <td className="align-right">{billingResult.water.rate}</td>
                                <td className="align-right">{billingResult.water.amount.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="center-text">ค่าไฟ</td>
                                <td className="align-right">{billingResult.electric.lastMeter}</td>
                                <td className="align-right">{billingResult.electric.currentMeter}</td>
                                <td className="align-right">{billingResult.electric.units.toFixed(2)}</td>
                                <td className="align-right">{billingResult.electric.rate}</td>
                                <td className="align-right">{billingResult.electric.amount.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="center-text" colSpan={5}>
                                    ค่าปรับ {billingResult.fineNote ? `(${billingResult.fineNote})` : ''}
                                </td>
                                <td className="align-right">{billingResult.fineAmount > 0 ? billingResult.fineAmount.toFixed(2) : '0'}</td>
                            </tr>
                            <tr>
                                <td className="center-text" colSpan={5}>ค่าเช่า</td>
                                <td className="align-right">{billingResult.roomRent}</td>
                            </tr>
                            <tr className="total-row-v2">
                                <td className="td-strong" colSpan={5}>รวม</td>
                                <td className="align-right td-strong">{billingResult.total.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Footer Notes */}
                    <div className="invoice-notes-box">
                        <p>ชำระเงินทุกวันที่ 5 ของทุกเดือนหรือเกินกำหนดวันชำระนั้นๆ ปรับเพิ่มวันละ 100 บาท</p>
                    </div>

                    <div className="invoice-footer-contact">
                        <p>ช่องทางการติดต่อ สอบถาม 092-5152-870 โก้ / 082-508-8909 พอล</p>
                    </div>
                </div>

                {/* Action Buttons (no-print) */}
                <div className="print-actions no-print">
                    <button className="print-action-btn" onClick={handlePrint} id="printActionBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 6 2 18 2 18 9" />
                            <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                            <rect x="6" y="14" width="12" height="8" />
                        </svg>
                        พิมพ์
                    </button>
                    <button className="close-action-btn" onClick={onClose}>
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
}
