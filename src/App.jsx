import { useState, useEffect } from 'react';
import { useBilling } from './hooks/useBilling';
import LineCallbackPage from './components/Auth/LineCallbackPage';
import Header from './components/Header/Header';
import RoomSearch from './components/RoomSearch/RoomSearch';
import BillingForm from './components/BillingForm/BillingForm';
import InvoiceSummary from './components/InvoiceSummary/InvoiceSummary';
import PrintInvoice from './components/PrintInvoice/PrintInvoice';
import AdminPanel from './components/Admin/AdminPanel';
import Home from './components/Home/Home';
import './App.css';

function App() {
    const {
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
        setRoomNumber,
        setCurrentWaterMeter,
        setCurrentElectricMeter,
        setCurrentFine,
        setCurrentFineNote,
        searchRoom,
        calculateBill,
        saveBill,
        resetAll
    } = useBilling();

    const [showPrint, setShowPrint] = useState(false);
    const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'billing' | 'admin'
    const [isLineCallback, setIsLineCallback] = useState(false);

    useEffect(() => {
        setIsLineCallback(window.location.pathname === '/line-callback');
    }, []);

    if (isLineCallback) {
        return <LineCallbackPage />;
    }

    function handlePrint() {
        if (!isBillSaved) {
            saveBill();
        }
        setShowPrint(true);
    }

    function handleNewBill() {
        resetAll();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ===== Admin Page =====
    if (currentPage === 'admin') {
        return <AdminPanel onBackToBilling={() => setCurrentPage('billing')} />;
    }

    // ===== Home Page =====
    if (currentPage === 'home') {
        return <Home onNavigateToBilling={() => setCurrentPage('billing')} onNavigateToAdmin={() => setCurrentPage('admin')} />;
    }

    // ===== Billing Page (เดิม) =====
    return (
        <div className="app" id="billingApp">
            <Header onNavigateHome={() => setCurrentPage('home')} onNavigateAdmin={() => setCurrentPage('admin')} />



            <main className="app-main">
                <div className="app-container">
                    {/* Room Search Section */}
                    <RoomSearch
                        roomNumber={roomNumber}
                        setRoomNumber={setRoomNumber}
                        onSearch={searchRoom}
                        roomData={roomData}
                        isSearching={isSearching}
                        error={!roomData ? error : ''}
                    />

                    {/* Billing Form Section */}
                    {roomData && (
                        <BillingForm
                            roomData={roomData}
                            currentWaterMeter={currentWaterMeter}
                            setCurrentWaterMeter={setCurrentWaterMeter}
                            currentElectricMeter={currentElectricMeter}
                            setCurrentElectricMeter={setCurrentElectricMeter}
                            currentFine={currentFine}
                            setCurrentFine={setCurrentFine}
                            currentFineNote={currentFineNote}
                            setCurrentFineNote={setCurrentFineNote}
                            onCalculate={calculateBill}
                            billingResult={billingResult}
                            error={roomData ? error : ''}
                        />
                    )}

                    {/* Invoice Summary Section */}
                    {billingResult && (
                        <InvoiceSummary
                            billingResult={billingResult}
                            onSaveBill={saveBill}
                            onPrint={handlePrint}
                            isBillSaved={isBillSaved}
                        />
                    )}

                    {/* New Bill Button */}
                    {billingResult && (
                        <div className="new-bill-wrapper">
                            <button className="new-bill-btn" onClick={handleNewBill} id="newBillBtn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                คิดบิลห้องใหม่
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="app-footer no-print">
                <p>© 2026 Narasing Billing System</p>
            </footer>

            {/* Print Invoice Overlay */}
            {showPrint && (
                <PrintInvoice
                    billingResult={billingResult}
                    onClose={() => setShowPrint(false)}
                />
            )}
        </div>
    );
}

export default App;
