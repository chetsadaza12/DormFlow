const LINE_PUSH_URL = 'https://api.line.me/v2/bot/message/push';

export async function sendLineNotification(toUserId, message) {
    const accessToken = process.env.LINE_MESSAGE_ACCESS_TOKEN;
    if (!accessToken || !toUserId) {
        return;
    }

    const messages = Array.isArray(message)
        ? message
        : [{ type: 'text', text: message }];

    try {
        const res = await fetch(LINE_PUSH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                to: toUserId,
                messages
            })
        });
        if (!res.ok) {
            const text = await res.text();
            console.error('LINE push failed:', res.status, text);
        }
    } catch (err) {
        console.error('LINE push message error:', err);
    }
}

