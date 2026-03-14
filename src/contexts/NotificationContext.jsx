import { createContext, useContext, useState, useCallback } from 'react';
import './NotificationCenter.css';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    // Toasts State
    const [toasts, setToasts] = useState([]);

    // Confirm Modal State
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        message: '',
        onConfirm: null,
        onCancel: null
    });

    // --- Toast Methods ---
    const showToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(2);
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // --- Confirm Methods ---
    // รองรับ 2 รูปแบบ: showConfirm(msg) คืน Promise<boolean> หรือ showConfirm(msg, onConfirm, onCancel)
    const showConfirm = useCallback((message, onConfirm, onCancel = null) => {
        if (typeof onConfirm === 'function') {
            setConfirmState({
                isOpen: true,
                message,
                onConfirm,
                onCancel
            });
            return Promise.resolve(false);
        }
        return new Promise(resolve => {
            setConfirmState({
                isOpen: true,
                message,
                onConfirm: () => { resolve(true); },
                onCancel: () => { resolve(false); }
            });
        });
    }, []);

    const handleConfirm = () => {
        if (confirmState.onConfirm) confirmState.onConfirm();
        closeConfirm();
    };

    const handleCancel = () => {
        if (confirmState.onCancel) confirmState.onCancel();
        closeConfirm();
    };

    const closeConfirm = () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        // Delay clearing data slightly so animation can finish before content disappears
        setTimeout(() => {
            setConfirmState({
                isOpen: false,
                message: '',
                onConfirm: null,
                onCancel: null
            });
        }, 300);
    };

    return (
        <NotificationContext.Provider value={{ showToast, showConfirm }}>
            {children}

            {/* --- Confirm Modal UI --- */}
            {confirmState.isOpen && (
                <div className="custom-confirm-overlay">
                    <div className="custom-confirm-modal">
                        <div className="custom-confirm-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <p className="custom-confirm-text">{confirmState.message}</p>
                        <div className="custom-confirm-actions">
                            <button className="confirm-btn-cancel" onClick={handleCancel}>ยกเลิก</button>
                            <button className="confirm-btn-ok" onClick={handleConfirm}>ตกลง</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Toast Container UI --- */}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast-item toast-${toast.type}`}>
                        {toast.type === 'success' ? (
                            <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        ) : toast.type === 'error' ? (
                            <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                        ) : (
                            <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                        )}
                        <span className="toast-message">{toast.message}</span>
                        <button className="toast-close" onClick={() => removeToast(toast.id)}>
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
