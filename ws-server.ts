import { WebSocketServer, WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const wss = new WebSocketServer({ port: PORT });
const prisma = new PrismaClient();

async function resetDeviceStatus() {
    try {
        await prisma.device.updateMany({
            data: { isOnline: false }
        });
        console.log('🔄 All devices reset to OFFLINE status on boot.');
    } catch (error) {
        console.error('❌ Failed to reset device statuses:', error);
    }
}
resetDeviceStatus();

interface ExtWebSocket extends WebSocket {
    isAlive: boolean;
    deviceMac?: string;
}

const devices = new Map<string, ExtWebSocket>();

const pendingRemoteUnlocks = new Map<string, { userId: string, direction: string }>();

type RegisterMessage = { type: 'REGISTER'; mac: string; };
type AccessCheckMessage = { type: 'ACCESS_CHECK'; mac: string; payload: string; direction?: string; };
type DoorEventMessage = { type: 'DOOR_EVENT'; mac: string; payload: string; };
type EventMessage = { type: 'EVENT'; mac: string; payload: string; direction?: string; };
type CommandMessage = { type: 'COMMAND'; target: string; command: string; userId: string; };
type PassageConfirmedMessage = { type: 'PASSAGE_CONFIRMED'; mac: string; payload: string; direction?: string; };
type IntrusionAlertMessage = { type: 'INTRUSION_ALERT'; mac: string; };

type IotMessage = RegisterMessage | AccessCheckMessage | EventMessage | CommandMessage | DoorEventMessage | PassageConfirmedMessage | IntrusionAlertMessage;

function isIotMessage(obj: unknown): obj is IotMessage {
    if (typeof obj !== 'object' || obj === null) return false;
    const record = obj as Record<string, unknown>;
    if (typeof record.type !== 'string') return false;
    return ['REGISTER', 'ACCESS_CHECK', 'EVENT', 'COMMAND', 'DOOR_EVENT', 'PASSAGE_CONFIRMED', 'INTRUSION_ALERT'].includes(record.type);
}

const interval = setInterval(async () => {
    const activeMacs: string[] = [];

    (wss.clients as Set<ExtWebSocket>).forEach((ws) => {
        if (!ws.isAlive) {
            console.log(`💀 Found dead connection: ${ws.deviceMac || 'unknown'}`);
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();

        if (ws.deviceMac) {
            activeMacs.push(ws.deviceMac);
        }
    });

    if (activeMacs.length > 0) {
        try {
            await prisma.device.updateMany({
                where: { macAddress: { in: activeMacs } },
                data: { lastSeen: new Date() }
            });
        } catch (e) {
            console.error("❌ DB Error updating lastSeen:", e);
        }
    }
}, 10000);

wss.on('close', () => {
    clearInterval(interval);
});

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

            if (msg.type === 'REGISTER') {
                const macUpper = msg.mac.toUpperCase();
                console.log(`📡 Device requesting registration: ${macUpper}`);

                const deviceRecord = await prisma.device.findUnique({
                    where: { macAddress: macUpper }
                });

                if (!deviceRecord) {
                    console.warn(`❌ UNAUTHORIZED DEVICE BLOCKED: ${macUpper}`);
                    ws.send(JSON.stringify({ type: 'SYSTEM', command: 'UNAUTHORIZED' }));
                    setTimeout(() => ws.terminate(), 1000);
                    return;
                }

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

                ws.send(JSON.stringify({ type: 'SYSTEM', command: 'REGISTER_OK' }));
                console.log(`✅ Device Authorized & Online: ${deviceRecord.name} (${macUpper})`);

                const statusMsg = { type: 'DEVICE_STATUS', mac: macUpper, isOnline: true };
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(statusMsg));
                });
            }

            else if (msg.type === 'ACCESS_CHECK') {
                const uidString = msg.payload.replace('UID:', '');
                const currentMac = msg.mac.toUpperCase();
                const direction = msg.direction || 'ENTRY';

                if (ws.deviceMac !== currentMac) {
                    console.warn(`⚠️ SECURITY ALERT: Unregistered socket trying to send ACCESS_CHECK as ${currentMac}`);
                    return;
                }

                console.log(`🔍 Access Check: ${uidString} @ ${currentMac} (Dir: ${direction})`);

                const deviceRecord = await prisma.device.findUnique({ where: { macAddress: currentMac } });
                if (!deviceRecord) return;

                await prisma.device.update({
                    where: { id: deviceRecord.id },
                    data: { isOnline: true, lastSeen: new Date() }
                });

                const user = await prisma.user.findUnique({
                    where: { cardUid: uidString },
                    include: { allowedDevices: true }
                });

                let accessGranted = false;

                if (user && user.isActive) {
                    const now = new Date();

                    const isStarted = !user.validFrom || now >= user.validFrom;
                    const isNotExpired = !user.validUntil || now <= user.validUntil;

                    const hasDeviceAccess = user.role === 'ADMIN' || user.allowedDevices.some(d => d.macAddress.toUpperCase() === currentMac);

                    if (isStarted && isNotExpired && hasDeviceAccess) {
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
                    } else {
                        if (!isStarted || !isNotExpired) {
                            console.log(`⛔ Access denied for ${user.name}: Card expired or not yet valid.`);
                        } else if (!hasDeviceAccess) {
                            console.log(`⛔ Access denied for ${user.name}: No permission for this door.`);
                        }
                    }
                }

                if (accessGranted) {
                    ws.send(JSON.stringify({
                        type: 'ACCESS_RESPONSE',
                        status: 'GRANTED',
                        relayTime: deviceRecord.relayTime || 5,
                        relayType: deviceRecord.relayType || 'NO'
                    }));
                } else {
                    ws.send(JSON.stringify({
                        type: 'ACCESS_RESPONSE',
                        status: 'DENIED'
                    }));

                    await prisma.log.create({
                        data: {
                            accessGranted: false,
                            cardUid: uidString,
                            deviceId: deviceRecord.id,
                            userId: user ? user.id : null,
                            userName: user ? user.name : null,      // SNAPSHOT
                            userRole: user ? user.role : null,      // SNAPSHOT
                            direction: direction,
                            eventType: 'ACCESS'
                        }
                    });

                    const eventMsg = { type: 'EVENT', mac: currentMac, payload: msg.payload, direction };
                    wss.clients.forEach(client => { if (client !== ws) sendToClient(client, eventMsg); });
                }
            }

            else if (msg.type === 'PASSAGE_CONFIRMED') {
                const uidString = msg.payload.replace('UID:', '');
                const currentMac = msg.mac.toUpperCase();
                const direction = msg.direction || 'ENTRY';

                if (ws.deviceMac !== currentMac) return;

                if (uidString === 'REMOTE') {
                    const pendingInfo = pendingRemoteUnlocks.get(currentMac);

                    if (pendingInfo) {
                        console.log(`🏃‍♂️ PASSAGE CONFIRMED: Remote unlock completed physically on ${currentMac}`);

                        const deviceRecord = await prisma.device.findUnique({ where: { macAddress: currentMac } });
                        const user = await prisma.user.findUnique({ where: { id: pendingInfo.userId } });

                        if (user && deviceRecord) {
                            const isInsideNow = pendingInfo.direction === 'ENTRY';
                            await prisma.user.update({
                                where: { id: user.id },
                                data: { isInside: isInsideNow }
                            });

                            await prisma.log.create({
                                data: {
                                    accessGranted: true,
                                    cardUid: 'REMOTE',
                                    deviceId: deviceRecord.id,
                                    userId: user.id,
                                    userName: user.name,            // SNAPSHOT
                                    userRole: user.role,            // SNAPSHOT
                                    direction: pendingInfo.direction,
                                    eventType: 'ACCESS'
                                }
                            });

                            const wsMessage = {
                                type: 'EVENT',
                                mac: currentMac,
                                payload: 'UID:REMOTE',
                                direction: pendingInfo.direction
                            };
                            wss.clients.forEach(client => {
                                if (client.readyState === WebSocket.OPEN) {
                                    client.send(JSON.stringify(wsMessage));
                                }
                            });
                        }
                        pendingRemoteUnlocks.delete(currentMac);
                    } else {
                        console.warn(`⚠️ Received PASSAGE_CONFIRMED for REMOTE, but no pending user found for MAC: ${currentMac}`);
                    }
                    return;
                }

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
                            userName: user.name,                    // SNAPSHOT
                            userRole: user.role,                    // SNAPSHOT
                            direction: direction,
                            eventType: 'ACCESS'
                        }
                    });

                    const eventMsg = { type: 'EVENT', mac: currentMac, payload: msg.payload, direction };
                    wss.clients.forEach(client => { if (client !== ws) sendToClient(client, eventMsg); });
                }
            }

            else if (msg.type === 'DOOR_EVENT') {
                if (ws.deviceMac !== msg.mac.toUpperCase()) return;
                const doorState = msg.payload;
                const doorUpdateMsg = { type: 'DOOR_UPDATE', state: doorState, mac: msg.mac };
                wss.clients.forEach(client => { if (client !== ws) sendToClient(client, doorUpdateMsg); });
            }

            else if (msg.type === 'INTRUSION_ALERT') {
                const currentMac = msg.mac.toUpperCase();
                if (ws.deviceMac !== currentMac) return;

                console.log(`🚨 УВАГА! ВЗЛОМ ДВЕРЕЙ НА ПРИСТРОЇ: ${currentMac}`);

                const deviceRecord = await prisma.device.findUnique({ where: { macAddress: currentMac } });

                if (deviceRecord) {
                    await prisma.log.create({
                        data: {
                            accessGranted: false,
                            cardUid: 'INTRUSION',
                            deviceId: deviceRecord.id,
                            userId: null,
                            userName: null,
                            userRole: null,
                            direction: 'ENTRY',
                            eventType: 'INTRUSION'
                        }
                    });

                    const alertMsg = { type: 'EVENT', mac: currentMac, payload: 'INTRUSION', direction: 'ENTRY' };
                    wss.clients.forEach(client => { if (client !== ws) sendToClient(client, alertMsg); });
                }
            }

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

            else if (msg.type === 'COMMAND') {
                const { target, command, userId } = msg;
                const macUpper = target.toUpperCase();

                if (!userId) {
                    console.warn(`❌ Command blocked: No userId provided for ${command}`);
                    return;
                }

                const [user, deviceRecord] = await Promise.all([
                    prisma.user.findUnique({
                        where: { id: userId },
                        include: { allowedDevices: true }
                    }),
                    prisma.device.findUnique({
                        where: { macAddress: macUpper }
                    })
                ]);

                if (!user || !user.isActive || !deviceRecord) {
                    console.warn(`❌ Command blocked: User not found, inactive, or device not found`);
                    return;
                }

                // Додатковий захист для критичної команди RESET_WIFI
                if (command === 'RESET_WIFI' && user.role !== 'ADMIN') {
                    console.warn(`🚫 SECURITY ALERT: User ${user.name} (Role: ${user.role}) attempted to Factory Reset device ${macUpper}`);
                    return;
                }

                let hasAccess = false;
                if (user.role === 'ADMIN') {
                    hasAccess = true;
                } else {
                    hasAccess = user.allowedDevices.some(d => d.macAddress.toUpperCase() === macUpper);
                }

                if (!hasAccess) {
                    console.warn(`❌ Command blocked: User ${user.name} has no access to ${macUpper}`);
                    return;
                }

                const targetSocket = devices.get(macUpper);

                if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {

                    if (command === 'OPEN_DOOR' || command === 'UNLOCK') {
                        targetSocket.send(JSON.stringify({
                            type: 'COMMAND',
                            command: 'UNLOCK',
                            relayTime: deviceRecord.relayTime || 5,
                            relayType: deviceRecord.relayType || 'NO'
                        }));

                        console.log(`✅ Command "UNLOCK" sent to device ${macUpper} by ${user.name}`);

                        const newDirection = user.isInside ? 'EXIT' : 'ENTRY';
                        pendingRemoteUnlocks.set(macUpper, { userId: user.id, direction: newDirection });
                        console.log(`⏳ Waiting for physical door opening by ${user.name}...`);

                        setTimeout(() => {
                            if (pendingRemoteUnlocks.has(macUpper)) {
                                pendingRemoteUnlocks.delete(macUpper);
                                console.log(`⏱️ Remote unlock timeout for ${macUpper}. Door was not opened.`);
                            }
                        }, 10000);

                    } else if (command === 'UPDATE_CONFIG') {
                        targetSocket.send(JSON.stringify({
                            type: 'COMMAND',
                            command: 'UPDATE_CONFIG',
                            relayTime: deviceRecord.relayTime || 5,
                            relayType: deviceRecord.relayType || 'NO'
                        }));
                        console.log(`🔄 Config update sent to device ${macUpper} by ${user.name}`);

                    } else if (command === 'RESET_WIFI') {
                        targetSocket.send(JSON.stringify({
                            type: 'COMMAND',
                            command: 'RESET_WIFI'
                        }));
                        console.log(`⚠️ CRITICAL: Factory Wi-Fi Reset sent to device ${macUpper} by Admin ${user.name}`);

                    } else {
                        targetSocket.send(JSON.stringify({
                            type: 'COMMAND',
                            command: command
                        }));
                        console.log(`✅ Command "${command}" sent to device ${macUpper} by ${user.name}`);
                    }
                } else {
                    console.warn(`⚠️ Failed to send command: Device ${macUpper} is offline`);
                }
            }

        } catch (e) {
            console.error('❌ Error processing message:', e);
        }
    });

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

                const statusMsg = { type: 'DEVICE_STATUS', mac: ws.deviceMac, isOnline: false };
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(statusMsg));
                });
            }
        }
    });
});