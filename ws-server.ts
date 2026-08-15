import { WebSocketServer, WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';
import { evaluateAccessRequest, AccessCheckUser } from './app/lib/access-control';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const wss = new WebSocketServer({ port: PORT });
const prisma = new PrismaClient();

// Simple structured logger
const logger = {
    info: (msg: string, meta?: Record<string, unknown>) => {
        const time = new Date().toISOString();
        console.log(`[${time}] [INFO] ${msg}`, meta ? JSON.stringify(meta) : '');
    },
    warn: (msg: string, meta?: Record<string, unknown>) => {
        const time = new Date().toISOString();
        console.warn(`[${time}] [WARN] ${msg}`, meta ? JSON.stringify(meta) : '');
    },
    error: (msg: string, error?: unknown) => {
        const time = new Date().toISOString();
        console.error(`[${time}] [ERROR] ${msg}`, error ?? '');
    },
    audit: (action: string, details: Record<string, unknown>) => {
        const time = new Date().toISOString();
        console.log(`[${time}] [AUDIT] ${action}:`, JSON.stringify(details));
    },
};

interface ExtWebSocket extends WebSocket {
    isAlive: boolean;
    deviceMac?: string;
}

const devices = new Map<string, ExtWebSocket>();
const pendingRemoteUnlocks = new Map<string, { userId: string; direction: string }>();

// Protocol Message Types
export type RegisterMessage = { type: 'REGISTER'; mac: string; key?: string };
export type AccessCheckMessage = { type: 'ACCESS_CHECK'; mac: string; payload: string; direction?: 'ENTRY' | 'EXIT' };
export type DoorEventMessage = { type: 'DOOR_EVENT'; mac: string; payload: 'OPENED' | 'CLOSED' };
export type EventMessage = { type: 'EVENT'; mac: string; payload: string; direction?: string };
export type CommandMessage = { type: 'COMMAND'; target: string; command: string; userId: string };
export type PassageConfirmedMessage = { type: 'PASSAGE_CONFIRMED'; mac: string; payload: string; direction?: 'ENTRY' | 'EXIT' };
export type IntrusionAlertMessage = { type: 'INTRUSION_ALERT'; mac: string };

export type IotMessage =
    | RegisterMessage
    | AccessCheckMessage
    | EventMessage
    | CommandMessage
    | DoorEventMessage
    | PassageConfirmedMessage
    | IntrusionAlertMessage;

function isIotMessage(obj: unknown): obj is IotMessage {
    if (typeof obj !== 'object' || obj === null) return false;
    const record = obj as Record<string, unknown>;
    if (typeof record.type !== 'string') return false;
    return [
        'REGISTER',
        'ACCESS_CHECK',
        'EVENT',
        'COMMAND',
        'DOOR_EVENT',
        'PASSAGE_CONFIRMED',
        'INTRUSION_ALERT',
    ].includes(record.type);
}

function broadcastToClients(data: object, filterWs?: WebSocket) {
    const payload = JSON.stringify(data);
    wss.clients.forEach((client) => {
        if (client !== filterWs && client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
}

// Reset devices status on boot
async function resetDeviceStatus() {
    try {
        await prisma.device.updateMany({
            data: { isOnline: false },
        });
        logger.info('Device online states synchronized to OFFLINE on gateway boot.');
    } catch (error) {
        logger.error('Failed to reset device statuses on startup', error);
    }
}
resetDeviceStatus();

// Heartbeat & Watchdog Ping Interval (every 10s)
const interval = setInterval(async () => {
    const activeMacs: string[] = [];

    (wss.clients as Set<ExtWebSocket>).forEach((ws) => {
        if (!ws.isAlive) {
            logger.warn(`Watchdog terminated dead connection: ${ws.deviceMac || 'unregistered-client'}`);
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
                data: { lastSeen: new Date() },
            });
        } catch (e) {
            logger.error('DB Error updating device lastSeen', e);
        }
    }
}, 10000);

wss.on('close', () => {
    clearInterval(interval);
});

// Main Gateway Event Loop
wss.on('connection', (socket: WebSocket) => {
    const ws = socket as ExtWebSocket;
    ws.isAlive = true;
    logger.info('New client connection established');

    ws.on('pong', () => {
        ws.isAlive = true;
    });

    ws.on('message', async (data) => {
        try {
            const rawParsed: unknown = JSON.parse(data.toString());

            if (!isIotMessage(rawParsed)) {
                logger.warn('Unknown message format received', { rawParsed });
                return;
            }

            const msg = rawParsed;

            // 1. DEVICE REGISTRATION & HANDSHAKE
            if (msg.type === 'REGISTER') {
                const macUpper = msg.mac.toUpperCase();
                logger.info(`Device requesting registration: ${macUpper}`);

                const deviceRecord = await prisma.device.findUnique({
                    where: { macAddress: macUpper },
                });

                if (!deviceRecord) {
                    logger.warn(`Unauthorized device registration blocked: ${macUpper}`);
                    ws.send(JSON.stringify({ type: 'SYSTEM', command: 'UNAUTHORIZED' }));
                    setTimeout(() => ws.terminate(), 1000);
                    return;
                }

                // If device has a configured key, verify token
                if (deviceRecord.deviceKey && msg.key && deviceRecord.deviceKey !== msg.key) {
                    logger.warn(`Device key authentication failed for: ${macUpper}`);
                    ws.send(JSON.stringify({ type: 'SYSTEM', command: 'AUTH_FAILED' }));
                    setTimeout(() => ws.terminate(), 1000);
                    return;
                }

                // Evict duplicate connection if any
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
                    data: { isOnline: true, lastSeen: new Date() },
                });

                ws.send(JSON.stringify({ type: 'SYSTEM', command: 'REGISTER_OK' }));
                logger.info(`Device authorized and connected: ${deviceRecord.name} (${macUpper})`);

                broadcastToClients({ type: 'DEVICE_STATUS', mac: macUpper, isOnline: true });
            }

            // 2. NFC / RFID ACCESS CHECK
            else if (msg.type === 'ACCESS_CHECK') {
                const uidString = msg.payload.replace('UID:', '').trim();
                const currentMac = msg.mac.toUpperCase();
                const direction: 'ENTRY' | 'EXIT' = (msg.direction as 'ENTRY' | 'EXIT') || 'ENTRY';

                if (ws.deviceMac !== currentMac) {
                    logger.warn(`Security alert: Unregistered socket attempted ACCESS_CHECK as ${currentMac}`);
                    return;
                }

                const deviceRecord = await prisma.device.findUnique({
                    where: { macAddress: currentMac },
                });
                if (!deviceRecord) return;

                await prisma.device.update({
                    where: { id: deviceRecord.id },
                    data: { isOnline: true, lastSeen: new Date() },
                });

                const userRecord = await prisma.user.findUnique({
                    where: { cardUid: uidString },
                    include: { allowedDevices: true },
                });

                const accessUser: AccessCheckUser | null = userRecord
                    ? {
                          id: userRecord.id,
                          name: userRecord.name,
                          role: userRecord.role,
                          isActive: userRecord.isActive,
                          isInside: userRecord.isInside,
                          validFrom: userRecord.validFrom,
                          validUntil: userRecord.validUntil,
                          allowedDevices: userRecord.allowedDevices,
                      }
                    : null;

                const decision = evaluateAccessRequest(accessUser, currentMac, direction);

                if (decision.granted) {
                    logger.info(`Access GRANTED for ${userRecord?.name ?? uidString} at ${currentMac} (${direction})`);
                    ws.send(
                        JSON.stringify({
                            type: 'ACCESS_RESPONSE',
                            status: 'GRANTED',
                            relayTime: deviceRecord.relayTime || 5,
                            relayType: deviceRecord.relayType || 'NO',
                        })
                    );
                } else {
                    logger.warn(`Access DENIED for card [${uidString}] at ${currentMac}: ${decision.reason}`);
                    ws.send(
                        JSON.stringify({
                            type: 'ACCESS_RESPONSE',
                            status: 'DENIED',
                            reason: decision.code,
                        })
                    );

                    // Record rejected access attempt
                    await prisma.log.create({
                        data: {
                            accessGranted: false,
                            cardUid: uidString,
                            deviceId: deviceRecord.id,
                            userId: userRecord ? userRecord.id : null,
                            userName: userRecord ? userRecord.name : null,
                            userRole: userRecord ? userRecord.role : null,
                            direction: direction,
                            eventType: 'ACCESS',
                        },
                    });

                    broadcastToClients(
                        { type: 'EVENT', mac: currentMac, payload: msg.payload, direction },
                        ws
                    );
                }
            }

            // 3. PHYSICAL PASSAGE CONFIRMED (AFTER SENSOR / RELAY TRIGGER)
            else if (msg.type === 'PASSAGE_CONFIRMED') {
                const uidString = msg.payload.replace('UID:', '').trim();
                const currentMac = msg.mac.toUpperCase();
                const direction: 'ENTRY' | 'EXIT' = (msg.direction as 'ENTRY' | 'EXIT') || 'ENTRY';

                if (ws.deviceMac !== currentMac) return;

                // Handle Remote Unlock Confirmation
                if (uidString === 'REMOTE') {
                    const pendingInfo = pendingRemoteUnlocks.get(currentMac);
                    if (pendingInfo) {
                        logger.audit('Remote Passage Confirmed', { mac: currentMac, userId: pendingInfo.userId });

                        const [deviceRecord, user] = await Promise.all([
                            prisma.device.findUnique({ where: { macAddress: currentMac } }),
                            prisma.user.findUnique({ where: { id: pendingInfo.userId } }),
                        ]);

                        if (user && deviceRecord) {
                            const isInsideNow = pendingInfo.direction === 'ENTRY';
                            await prisma.user.update({
                                where: { id: user.id },
                                data: { isInside: isInsideNow },
                            });

                            await prisma.log.create({
                                data: {
                                    accessGranted: true,
                                    cardUid: 'REMOTE',
                                    deviceId: deviceRecord.id,
                                    userId: user.id,
                                    userName: user.name,
                                    userRole: user.role,
                                    direction: pendingInfo.direction,
                                    eventType: 'ACCESS',
                                },
                            });

                            broadcastToClients({
                                type: 'EVENT',
                                mac: currentMac,
                                payload: 'UID:REMOTE',
                                direction: pendingInfo.direction,
                            });
                        }
                        pendingRemoteUnlocks.delete(currentMac);
                    }
                    return;
                }

                // Handle Card Physical Passage Confirmation
                logger.info(`Passage Confirmed: ${uidString} went ${direction} at ${currentMac}`);

                const [deviceRecord, user] = await Promise.all([
                    prisma.device.findUnique({ where: { macAddress: currentMac } }),
                    prisma.user.findUnique({ where: { cardUid: uidString } }),
                ]);

                if (user && deviceRecord) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { isInside: direction === 'ENTRY' },
                    });

                    await prisma.log.create({
                        data: {
                            accessGranted: true,
                            cardUid: uidString,
                            deviceId: deviceRecord.id,
                            userId: user.id,
                            userName: user.name,
                            userRole: user.role,
                            direction: direction,
                            eventType: 'ACCESS',
                        },
                    });

                    broadcastToClients(
                        { type: 'EVENT', mac: currentMac, payload: msg.payload, direction },
                        ws
                    );
                }
            }

            // 4. DOOR MAGNETIC SENSOR STATUS UPDATE
            else if (msg.type === 'DOOR_EVENT') {
                if (ws.deviceMac !== msg.mac.toUpperCase()) return;
                broadcastToClients({ type: 'DOOR_UPDATE', state: msg.payload, mac: msg.mac }, ws);
            }

            // 5. INTRUSION / TAMPER ALERT
            else if (msg.type === 'INTRUSION_ALERT') {
                const currentMac = msg.mac.toUpperCase();
                if (ws.deviceMac !== currentMac) return;

                logger.warn(`CRITICAL INTRUSION DETECTED AT: ${currentMac}`);

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
                            eventType: 'INTRUSION',
                        },
                    });

                    broadcastToClients(
                        { type: 'EVENT', mac: currentMac, payload: 'INTRUSION', direction: 'ENTRY' },
                        ws
                    );
                }
            }

            // 6. GENERIC EVENT RELAY
            else if (msg.type === 'EVENT') {
                if (ws.deviceMac !== msg.mac.toUpperCase()) return;
                broadcastToClients(
                    {
                        type: 'EVENT',
                        mac: msg.mac,
                        payload: msg.payload,
                        direction: msg.direction,
                    },
                    ws
                );
            }

            // 7. ADMIN REMOTE COMMANDS (UNLOCK, CONFIG, RESET_WIFI)
            else if (msg.type === 'COMMAND') {
                const { target, command, userId } = msg;
                const macUpper = target.toUpperCase();

                if (!userId) {
                    logger.warn(`Command rejected: No userId provided for command ${command}`);
                    return;
                }

                const [user, deviceRecord] = await Promise.all([
                    prisma.user.findUnique({
                        where: { id: userId },
                        include: { allowedDevices: true },
                    }),
                    prisma.device.findUnique({
                        where: { macAddress: macUpper },
                    }),
                ]);

                if (!user || !user.isActive || !deviceRecord) {
                    logger.warn(`Command rejected: User inactive or device not found for target ${macUpper}`);
                    return;
                }

                if (command === 'RESET_WIFI' && user.role !== 'ADMIN') {
                    logger.warn(`Security alert: Non-admin ${user.name} attempted factory reset on ${macUpper}`);
                    return;
                }

                const hasAccess =
                    user.role === 'ADMIN' ||
                    user.allowedDevices.some((d) => d.macAddress.toUpperCase() === macUpper);

                if (!hasAccess) {
                    logger.warn(`Command blocked: User ${user.name} lacks permissions for ${macUpper}`);
                    return;
                }

                const targetSocket = devices.get(macUpper);

                if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
                    if (command === 'OPEN_DOOR' || command === 'UNLOCK') {
                        targetSocket.send(
                            JSON.stringify({
                                type: 'COMMAND',
                                command: 'UNLOCK',
                                relayTime: deviceRecord.relayTime || 5,
                                relayType: deviceRecord.relayType || 'NO',
                            })
                        );

                        logger.audit('Remote Unlock Triggered', { target: macUpper, initiatedBy: user.name });

                        const newDirection = user.isInside ? 'EXIT' : 'ENTRY';
                        pendingRemoteUnlocks.set(macUpper, { userId: user.id, direction: newDirection });

                        setTimeout(() => {
                            if (pendingRemoteUnlocks.has(macUpper)) {
                                pendingRemoteUnlocks.delete(macUpper);
                                logger.info(`Remote unlock timeout for ${macUpper}. Door was not opened.`);
                            }
                        }, 10000);
                    } else if (command === 'UPDATE_CONFIG') {
                        targetSocket.send(
                            JSON.stringify({
                                type: 'COMMAND',
                                command: 'UPDATE_CONFIG',
                                relayTime: deviceRecord.relayTime || 5,
                                relayType: deviceRecord.relayType || 'NO',
                            })
                        );
                        logger.audit('Device Config Updated', { target: macUpper, updatedBy: user.name });
                    } else if (command === 'RESET_WIFI') {
                        targetSocket.send(
                            JSON.stringify({
                                type: 'COMMAND',
                                command: 'RESET_WIFI',
                            })
                        );
                        logger.audit('Factory Reset Sent', { target: macUpper, initiatedBy: user.name });
                    } else {
                        targetSocket.send(
                            JSON.stringify({
                                type: 'COMMAND',
                                command: command,
                            })
                        );
                    }
                } else {
                    logger.warn(`Failed to dispatch command "${command}": Device ${macUpper} is OFFLINE`);
                }
            }
        } catch (e) {
            logger.error('Error processing gateway message', e);
        }
    });

    ws.on('close', async () => {
        if (ws.deviceMac) {
            logger.info(`Device disconnected: ${ws.deviceMac}`);
            devices.delete(ws.deviceMac);

            const currentActiveSocket = devices.get(ws.deviceMac);
            if (!currentActiveSocket) {
                await prisma.device
                    .update({
                        where: { macAddress: ws.deviceMac },
                        data: { isOnline: false },
                    })
                    .catch((err) => logger.error('DB Error updating device offline state', err));

                broadcastToClients({ type: 'DEVICE_STATUS', mac: ws.deviceMac, isOnline: false });
            }
        }
    });
});

logger.info(`Smart ACS WebSocket Gateway running on ws://localhost:${PORT}`);