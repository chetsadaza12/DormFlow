import { useEffect, useState } from 'react';
import { authAPI } from '../../services/api';

const STORAGE_KEY_DRAFT = 'booking_draft';
const STORAGE_KEY_LINE = 'line_user_for_booking';

export default function LineCallbackPage({ onDone }) {
    const [status, setStatus] = useState('กำลังดำเนินการ...');
    const [error, setError] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state'); // roomNumber
        const err = params.get('error');

        if (err) {
            setError(err === 'ACCESS_DENIED' ? 'ยกเลิกการเข้าสู่ระบบ LINE' : 'เกิดข้อผิดพลาด');
            return;
        }

        if (!code) {
            setError('ไม่พบ authorization code');
            return;
        }

        const redirectUri = `${window.location.origin}${window.location.pathname}`;
        const draft = sessionStorage.getItem(STORAGE_KEY_DRAFT);
        let clientId = '';
        try {
            const parsed = draft ? JSON.parse(draft) : {};
            clientId = parsed.lineClientId || '';
        } catch (e) {}

        if (!clientId) {
            setError('ไม่พบ LINE Channel ID กรุณาตั้งค่าใน Admin');
            return;
        }

        (async () => {
            try {
                setStatus('กำลังยืนยันตัวตน...');
                const result = await authAPI.lineToken(code, redirectUri, clientId);
                sessionStorage.setItem(STORAGE_KEY_LINE, result.lineUserId || '');
                setStatus('สำเร็จ! กำลังกลับ...');
                const returnUrl = `/?lineCallback=1&room=${encodeURIComponent(state || '')}`;
                setTimeout(() => window.location.replace(returnUrl), 500);
            } catch (err) {
                setError(err.message || 'ยืนยัน LINE ไม่สำเร็จ');
            }
        })();
    }, []);

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: 20,
            fontFamily: 'system-ui, sans-serif', background: 'var(--bg-secondary, #1e293b)',
            color: 'var(--text-primary, #fff)'
        }}>
            {error ? (
                <>
                    <p style={{ color: '#f87171', marginBottom: 16, textAlign: 'center' }}>{error}</p>
                    <button
                        type="button"
                        onClick={() => window.location.replace('/')}
                        style={{
                            padding: '10px 20px',
                            borderRadius: 999,
                            border: 'none',
                            background: '#e2e8f0',
                            color: '#0f172a',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        กลับหน้าหลัก
                    </button>
                </>
            ) : (
                <>
                    <div style={{ width: 40, height: 40, border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
                    <p>{status}</p>
                </>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export { STORAGE_KEY_DRAFT, STORAGE_KEY_LINE };
