import { WebSocketServer, WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';

// 1. Ініціалізація
const wss = new WebSocketServer({ port: 8080 });
const prisma = new PrismaClient();

console.log('🚀 Smart IoT Server started on port 8080');

// Розширюємо стандартний тип WebSocket, щоб додати прапорець isAlive та MAC
interface ExtWebSocket extends WebSocket {
    isAlive: boolean;
    deviceMac?: string; // Зберігаємо MAC прямо в сокеті для зручності
}

// "Телефонна книга": зберігаємо зв'язок MAC -> WebSocket
const devices = new Map<string, ExtWebSocket>();

// --- ТИПИ ПОВІДОМЛЕНЬ ---
type RegisterMessage = { type: 'REGISTER'; mac: string; };
type AccessCheckMessage = { type: 'ACCESS_CHECK'; mac: string; payload: string; direction?: string; };
type DoorEventMessage = { type: 'DOOR_EVENT'; mac: string; payload: string; };
type EventMessage = { type: 'EVENT'; mac: string; payload: string; direction?: string; };
type CommandMessage = { type: 'COMMAND'; target: string; command: string; };
type PassageConfirmedMessage = { type: 'PASSAGE_CONFIRMED'; mac: string; payload: string; direction?: string; };
type IntrusionAlertMessage = { type: 'INTRUSION_ALERT'; mac: string; };

type IotMessage = RegisterMessage | AccessCheckMessage | EventMessage | CommandMessage | DoorEventMessage | PassageConfirmedMessage | IntrusionAlertMessage;

function isIotMessage(obj: unknown): obj is IotMessage {
    if (typeof obj !== 'object' || obj === null) return false;
    const record = obj as Record<string, unknown>;
    if (typeof record.type !== 'string') return false;
    return ['REGISTER', 'ACCESS_CHECK', 'EVENT', 'COMMAND', 'DOOR_EVENT', 'PASSAGE_CONFIRMED', 'INTRUSION_ALERT'].includes(record.type);
}

// --- HEARTBEAT (Перевірка життя) ---
const interval = setInterval(() => {
    (wss.clients as Set<ExtWebSocket>).forEach((ws) => {
        if (!ws.isAlive) {
            console.log(`💀 Found dead connection: ${ws.deviceMac || 'unknown'}`);
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('close', () => {
    clearInterval(interval);
});

// --- ГОЛОВНА ЛОГІКА ---

wss.on('connection', (socket: WebSocket) => {
    const ws = socket as ExtWebSocket;

    ws.isAlive = true;
    console.log('New client connected');

    ws.on('pong', () => {
        ws.isAlive = true;
    });

    const sendToClient = (client: WebSocket, data: object) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    };

    ws.on('message', async (data) => {
        try {
            const rawParsed: unknown = JSON.parse(data.toString());

            if (!isIotMessage(rawParsed)) {
                console.warn('⚠️ Unknown message format:', rawParsed);
                return;
            }

            const msg = rawParsed;

            // --- 1. РЕЄСТРАЦІЯ (ОНОВЛЕНО) ---
            if (msg.type === 'REGISTER') {
                const macUpper = msg.mac.toUpperCase();
                console.log(`📡 Device requesting registration: ${macUpper}`);

                // Шукаємо пристрій у базі
                const deviceRecord = await prisma.device.findUnique({
                    where: { macAddress: macUpper }
                });

                if (!deviceRecord) {
                    console.warn(`❌ UNAUTHORIZED DEVICE BLOCKED: ${macUpper}`);
                    ws.send('UNAUTHORIZED'); // Повідомляємо ESP32, щоб вона засвітила червоні діоди

                    // Відключаємо невідомий пристрій через секунду, щоб він встиг отримати повідомлення
                    setTimeout(() => ws.terminate(), 1000);
                    return;
                }

                // Якщо пристрій існує в базі, пускаємо його
                if (devices.has(macUpper)) {
                    const oldSocket = devices.get(macUpper);
                    if (oldSocket && oldSocket !== ws) {
                        oldSocket.terminate();
                    }
                }

                ws.deviceMac = macUpper;
                devices.set(macUpper, ws);

                await prisma.device.update({
                    where: { id: deviceRecord.id },
                    data: { isOnline: true, lastSeen: new Date() }
                });

                ws.send('REGISTER_OK');
                console.log(`✅ Device Authorized & Online: ${deviceRecord.name} (${macUpper})`);
            }

            // --- 2. ПЕРЕВІРКА ДОСТУПУ ---
            else if (msg.type === 'ACCESS_CHECK') {
                const uidString = msg.payload.replace('UID:', '');
                const currentMac = msg.mac.toUpperCase();
                const direction = msg.direction || 'ENTRY';

                // Додаткова перевірка безпеки: чи цей MAC взагалі авторизований в поточній сесії?
                if (ws.deviceMac !== currentMac) {
                    console.warn(`⚠️ SECURITY ALERT: Unregistered socket trying to send ACCESS_CHECK as ${currentMac}`);
                    return;
                }

                console.log(`🔍 Access Check: ${uidString} @ ${currentMac} (Dir: ${direction})`);

                const deviceRecord = await prisma.device.findUnique({ where: { macAddress: currentMac } });
                if (!deviceRecord) return; // Про всяк випадок

                await prisma.device.update({
                    where: { id: deviceRecord.id },
                    data: { isOnline: true, lastSeen: new Date() }
                });

                const user = await prisma.user.findUnique({ where: { cardUid: uidString } });
                let accessGranted = false;

                if (user && user.isActive) {
                    if (direction === 'ENTRY') {
                        if (!user.isInside) {
                            accessGranted = true;
                        } else {
                            console.log(`⛔ ANTI-PASSBACK: ${user.name} вже всередині!`);
                        }
                    } else if (direction === 'EXIT') {
                        if (user.isInside) {
                            accessGranted = true;
                        } else {
                            console.log(`⛔ ANTI-PASSBACK: ${user.name} намагається вийти, хоча він не заходив!`);
                        }
                    }
                }

                if (accessGranted) {
                    ws.send('ACCESS_GRANTED');
                } else {
                    ws.send('ACCESS_DENIED');

                    await prisma.log.create({
                        data: {
                            accessGranted: false,
                            cardUid: uidString,
                            deviceId: deviceRecord.id,
                            userId: user ? user.id : null,
                            direction: direction,
                            eventType: 'ACCESS'
                        }
                    });

                    const eventMsg = { type: 'EVENT', mac: currentMac, payload: msg.payload, direction };
                    wss.clients.forEach(client => { if (client !== ws) sendToClient(client, eventMsg); });
                }
            }

            // --- 3. ФІЗИЧНИЙ ПРОХІД ПІДТВЕРДЖЕНО ---
            else if (msg.type === 'PASSAGE_CONFIRMED') {
                const uidString = msg.payload.replace('UID:', '');
                const currentMac = msg.mac.toUpperCase();
                const direction = msg.direction || 'ENTRY';

                if (ws.deviceMac !== currentMac) return;

                console.log(`🏃‍♂️ PASSAGE CONFIRMED: ${uidString} went ${direction}`);

                const deviceRecord = await prisma.device.findUnique({ where: { macAddress: currentMac } });
                const user = await prisma.user.findUnique({ where: { cardUid: uidString } });

                if (user && deviceRecord) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { isInside: (direction === 'ENTRY') }
                    });

                    await prisma.log.create({
                        data: {
                            accessGranted: true,
                            cardUid: uidString,
                            deviceId: deviceRecord.id,
                            userId: user.id,
                            direction: direction,
                            eventType: 'ACCESS'
                        }
                    });

                    const eventMsg = { type: 'EVENT', mac: currentMac, payload: msg.payload, direction };
                    wss.clients.forEach(client => { if (client !== ws) sendToClient(client, eventMsg); });
                }
            }

            // --- 4. ПОДІЇ ГЕРКОНА ---
            else if (msg.type === 'DOOR_EVENT') {
                if (ws.deviceMac !== msg.mac.toUpperCase()) return;
                const doorState = msg.payload;
                const doorUpdateMsg = { type: 'DOOR_UPDATE', state: doorState, mac: msg.mac };
                wss.clients.forEach(client => { if (client !== ws) sendToClient(client, doorUpdateMsg); });
            }

            // --- 5. ТРИВОГА ВЗЛОМУ ---
            else if (msg.type === 'INTRUSION_ALERT') {
                const currentMac = msg.mac.toUpperCase();
                if (ws.deviceMac !== currentMac) return;

                console.log(`🚨 УВАГА! ВЗЛОМ ДВЕРЕЙ НА ПРИСТРОЇ: ${currentMac}`);

                const deviceRecord = await prisma.device.findUnique({ where: { macAddress: currentMac } });

                if (deviceRecord) {
                    await prisma.log.create({
                        data: {
                            accessGranted: false,
                            cardUid: 'ВЗЛОМ',
                            deviceId: deviceRecord.id,
                            userId: null,
                            direction: 'ENTRY',
                            eventType: 'INTRUSION'
                        }
                    });

                    const alertMsg = { type: 'EVENT', mac: currentMac, payload: 'INTRUSION', direction: 'ENTRY' };
                    wss.clients.forEach(client => { if (client !== ws) sendToClient(client, alertMsg); });
                }
            }

            // --- 6. ПРОСТІ ПОДІЇ (Сканування картки при реєстрації) ---
            else if (msg.type === 'EVENT') {
                if (ws.deviceMac !== msg.mac.toUpperCase()) return;
                const eventMsg = {
                    type: 'EVENT',
                    mac: msg.mac,
                    payload: msg.payload,
                    direction: msg.direction
                };
                wss.clients.forEach(client => {
                    if (client !== ws) sendToClient(client, eventMsg);
                });
            }

            // --- 7. КОМАНДИ (START_SCAN від фронтенду) ---
            else if (msg.type === 'COMMAND') {
                console.log(`📡 Broadcasting COMMAND: ${msg.command}`);
                wss.clients.forEach(client => {
                    const extClient = client as ExtWebSocket;
                    // Надсилаємо команду тільки авторизованим пристроям
                    if (extClient.deviceMac && client.readyState === WebSocket.OPEN) {
                        client.send(msg.command);
                    }
                });
            }

        } catch (e) {
            console.error('❌ Error processing message:', e);
        }
    });

    // --- ОБРОБКА ВІДКЛЮЧЕННЯ ---
    ws.on('close', async () => {
        if (ws.deviceMac) {
            console.log(`🔌 Disconnected: ${ws.deviceMac}`);
            devices.delete(ws.deviceMac);

            const currentActiveSocket = devices.get(ws.deviceMac);
            if (!currentActiveSocket) {
                await prisma.device.update({
                    where: { macAddress: ws.deviceMac },
                    data: { isOnline: false }
                }).catch(err => console.error("DB Error:", err));
            }
        }
    });
});