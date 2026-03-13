import WebSocket from 'ws';

// Налаштування
const WS_URL = 'ws://localhost:8080';
const MY_MAC = 'TEST-DEVICE-01'; // Наша тестова MAC-адреса

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
    console.log(`🔌 Connected to server as ${MY_MAC}`);

    // 1. РЕЄСТРАЦІЯ
    const registerMsg = {
        type: 'REGISTER',
        mac: MY_MAC
    };
    ws.send(JSON.stringify(registerMsg));
    console.log('📤 Sent REGISTER command');
});

ws.on('message', (data) => {
    const command = data.toString();
    console.log(`📩 Received command: ${command}`);

    // 2. ОБРОБКА КОМАНДИ "START_SCAN"
    if (command === 'START_SCAN') {
        console.log('👀 Scanning started... (Waiting 3s)');

        setTimeout(() => {
            const fakeUid = generateRandomUid();
            console.log(`✅ Card Detected! UID: ${fakeUid}`);

            // 3. ВІДПРАВКА ПОДІЇ НА СЕРВЕР
            const eventMsg = {
                type: 'EVENT',
                mac: MY_MAC,
                payload: `UID:${fakeUid}` // Формат, який чекає фронтенд
            };
            ws.send(JSON.stringify(eventMsg));
            console.log('📤 Sent UID to server');

        }, 3000);
    }
});

// Допоміжна функція для генерації випадкового UID
function generateRandomUid() {
    const bytes = Array.from({ length: 4 }, () =>
        Math.floor(Math.random() * 255).toString(16).toUpperCase().padStart(2, '0')
    );
    return bytes.join('-');
}