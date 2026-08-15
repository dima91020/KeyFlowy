import WebSocket from 'ws';

const WS_URL = process.env.WS_URL || 'ws://localhost:8080';
const MY_MAC = 'TEST-DEVICE-01';

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
    console.log(`[Mock Device] Connected to gateway as ${MY_MAC}`);

    const registerMsg = {
        type: 'REGISTER',
        mac: MY_MAC
    };
    ws.send(JSON.stringify(registerMsg));
    console.log('[Mock Device] Dispatched REGISTER handshake');
});

ws.on('message', (data) => {
    const command = data.toString();
    console.log(`[Mock Device] Received command: ${command}`);

    if (command === 'START_SCAN') {
        console.log('[Mock Device] Scanning started (3s timer)...');

        setTimeout(() => {
            const fakeUid = generateRandomUid();
            console.log(`[Mock Device] Card detected: ${fakeUid}`);

            const eventMsg = {
                type: 'EVENT',
                mac: MY_MAC,
                payload: `UID:${fakeUid}`
            };
            ws.send(JSON.stringify(eventMsg));
            console.log('[Mock Device] Sent scanned UID to gateway');
        }, 3000);
    }
});

function generateRandomUid() {
    const bytes = Array.from({ length: 4 }, () =>
        Math.floor(Math.random() * 255).toString(16).toUpperCase().padStart(2, '0')
    );
    return bytes.join('-');
}