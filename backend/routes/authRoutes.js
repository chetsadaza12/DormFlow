import express from 'express';

const router = express.Router();

// POST /api/auth/line-token — แลก code เป็น LINE user info (ต้องมี LINE_CHANNEL_SECRET ใน .env)
router.post('/line-token', async (req, res) => {
    try {
        const { code, redirectUri } = req.body;
        const clientId = req.body.clientId || process.env.LINE_CHANNEL_ID;
        const clientSecret = process.env.LINE_CHANNEL_SECRET;

        if (!code || !redirectUri || !clientId || !clientSecret) {
            console.log('[LINE] invalid request body to /auth/line-token', {
                hasCode: !!code,
                redirectUri,
                clientId,
                hasClientSecret: !!clientSecret
            });
            return res.status(400).json({
                error: 'ต้องมี code, redirectUri และตั้งค่า LINE Channel (Client ID + Secret)',
                details: {
                    hasCode: !!code,
                    hasRedirectUri: !!redirectUri,
                    hasClientId: !!clientId,
                    hasClientSecret: !!clientSecret
                }
            });
        }

        const formBody = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            client_secret: clientSecret
        }).toString();

        const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formBody
        });

        const tokenData = await tokenRes.json();
        if (!tokenRes.ok) {
            return res.status(400).json({
                error: tokenData.error_description || tokenData.error || 'LINE Login ไม่สำเร็จ'
            });
        }

        if (!tokenData.id_token) {
            return res.status(400).json({ error: 'ไม่ได้รับ ID token จาก LINE' });
        }

        const payload = JSON.parse(
            Buffer.from(tokenData.id_token.split('.')[1], 'base64').toString()
        );
        const lineUserId = payload.sub || '';

        res.json({ lineUserId, displayName: payload.name || '' });
    } catch (err) {
        console.error('LINE token exchange error:', err);
        res.status(500).json({ error: err.message || 'เกิดข้อผิดพลาด' });
    }
});

export default router;
