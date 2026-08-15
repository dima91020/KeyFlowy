import WebSocket from 'ws';
import readline from 'readline';

const WS_URL = process.env.WS_URL || 'ws://localhost:8080';
const DEFAULT_MAC = process.env.DEVICE_MAC || '24:0A:C4:00:01:01';
const DEVICE_KEY = process.env.DEVICE_KEY || 'dev_key_main_turnstile_01';

console.log('\x1b[36m%s\x1b[0m', '================================================');
console.log('\x1b[36m%s\x1b[0m', '   SMART ACCESS CONTROL - DEVICE SIMULATOR       ');
console.log('\x1b[36m%s\x1b[0m', '================================================');
console.log(`Connecting to Gateway: ${WS_URL}`);
console.log(`Device MAC: ${DEFAULT_MAC}`);

const ws = new WebSocket(WS_URL);
let isRegistered = false;
let autoSimulationTimer: NodeJS.Timeout | null = null;

const DEMO_CARDS = [
    { name: 'Admin (Dmytro)', uid: 'A1-B2-C3-D4' },
    { name: 'Alice (Engineer)', uid: '4B-88-C1-20' },
    { name: 'Bob (Frontend)', uid: '9F-21-E4-10' },
    { name: 'Clara (Blocked)', uid: '3E-55-AA-77' },
    { name: 'Guest Active', uid: '77-11-22-33' },
    { name: 'Unknown Card', uid: '99-88-77-66' },
];

function printHelp() {
    console.log('\n\x1b[33m%s\x1b[0m', '--- Interactive Simulator Menu ---');
    console.log(' [1] Scan Card (Swipe NFC Tag at Entry)');
    console.log(' [2] Scan Card (Swipe NFC Tag at Exit)');
    console.log(' [3] Confirm Passage (Physical Door / Turnstile passed)');
    console.log(' [4] Toggle Door Sensor (OPEN / CLOSED)');
    console.log(' [5] Trigger Intrusion Alert (Tamper/Forced Entry)');
    console.log(' [6] Toggle Auto-Simulation (Automated realistic traffic)');
    console.log(' [c] Custom UID Entry');
    console.log(' [h] Help menu');
    console.log(' [q] Quit simulator\n');
}

ws.on('open', () => {
    console.log('\x1b[32m%s\x1b[0m', `[CONNECTED] Connected to WebSocket gateway.`);

    const registerMsg = {
        type: 'REGISTER',
        mac: DEFAULT_MAC,
        key: DEVICE_KEY,
    };
    ws.send(JSON.stringify(registerMsg));
    console.log(`[HANDSHAKE] Dispatched REGISTER handshake for MAC: ${DEFAULT_MAC}`);
});

ws.on('message', (data) => {
    try {
        const msg = JSON.parse(data.toString());
        const time = new Date().toLocaleTimeString();

        if (msg.type === 'SYSTEM') {
            if (msg.command === 'REGISTER_OK') {
                isRegistered = true;
                console.log('\x1b[32m%s\x1b[0m', `[${time}] [ONLINE] Device registered successfully.`);
                printHelp();
            } else if (msg.command === 'UNAUTHORIZED' || msg.command === 'AUTH_FAILED') {
                console.log('\x1b[31m%s\x1b[0m', `[${time}] [ERROR] Registration failed: ${msg.command}`);
            }
        } else if (msg.type === 'ACCESS_RESPONSE') {
            if (msg.status === 'GRANTED') {
                console.log('\x1b[32m%s\x1b[0m', `[${time}] [ACCESS GRANTED] Relay activated for ${msg.relayTime}s (Type: ${msg.relayType})`);
            } else {
                console.log('\x1b[31m%s\x1b[0m', `[${time}] [ACCESS DENIED] (${msg.reason ?? 'UNKNOWN'})`);
            }
        } else if (msg.type === 'COMMAND') {
            if (msg.command === 'UNLOCK') {
                console.log('\x1b[35m%s\x1b[0m', `[${time}] [REMOTE UNLOCK] Relay triggered for ${msg.relayTime || 5}s`);
                setTimeout(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(
                            JSON.stringify({
                                type: 'PASSAGE_CONFIRMED',
                                mac: DEFAULT_MAC,
                                payload: 'UID:REMOTE',
                                direction: 'ENTRY',
                            })
                        );
                        console.log('\x1b[35m%s\x1b[0m', `[${time}] [PASSAGE] Remote passage physically executed.`);
                    }
                }, 1000);
            } else if (msg.command === 'UPDATE_CONFIG') {
                console.log('\x1b[34m%s\x1b[0m', `[${time}] [CONFIG UPDATE] Relay Time = ${msg.relayTime}s, Type = ${msg.relayType}`);
            } else if (msg.command === 'RESET_WIFI') {
                console.log('\x1b[31m%s\x1b[0m', `[${time}] [RESET] Simulating WiFi memory erase & reboot.`);
            }
        }
    } catch {
        console.log('[RAW]', data.toString());
    }
});

ws.on('close', () => {
    console.log('\x1b[31m%s\x1b[0m', 'Disconnected from WebSocket gateway.');
    if (autoSimulationTimer) clearInterval(autoSimulationTimer);
    process.exit(0);
});

ws.on('error', (err) => {
    console.error('\x1b[31m%s\x1b[0m', `WebSocket Error: ${err.message}`);
});

let doorOpened = false;

function handleCommand(cmd: string) {
    const trimmed = cmd.trim().toLowerCase();

    if (trimmed === 'q') {
        ws.close();
        process.exit(0);
    }

    if (!isRegistered) {
        console.log('\x1b[33m%s\x1b[0m', 'Waiting for device registration...');
        return;
    }

    switch (trimmed) {
        case '1': {
            const randomCard = DEMO_CARDS[Math.floor(Math.random() * DEMO_CARDS.length)];
            console.log(`\n[SCAN ENTRY] Card: ${randomCard.name} [UID: ${randomCard.uid}]`);
            ws.send(
                JSON.stringify({
                    type: 'ACCESS_CHECK',
                    mac: DEFAULT_MAC,
                    payload: `UID:${randomCard.uid}`,
                    direction: 'ENTRY',
                })
            );
            break;
        }
        case '2': {
            const randomCard = DEMO_CARDS[Math.floor(Math.random() * DEMO_CARDS.length)];
            console.log(`\n[SCAN EXIT] Card: ${randomCard.name} [UID: ${randomCard.uid}]`);
            ws.send(
                JSON.stringify({
                    type: 'ACCESS_CHECK',
                    mac: DEFAULT_MAC,
                    payload: `UID:${randomCard.uid}`,
                    direction: 'EXIT',
                })
            );
            break;
        }
        case '3': {
            const randomCard = DEMO_CARDS[1];
            console.log(`\n[PASSAGE CONFIRM] Confirming passage for ${randomCard.name}...`);
            ws.send(
                JSON.stringify({
                    type: 'PASSAGE_CONFIRMED',
                    mac: DEFAULT_MAC,
                    payload: `UID:${randomCard.uid}`,
                    direction: 'ENTRY',
                })
            );
            break;
        }
        case '4': {
            doorOpened = !doorOpened;
            const state = doorOpened ? 'OPENED' : 'CLOSED';
            console.log(`\n[SENSOR] Door magnetic sensor state: ${state}`);
            ws.send(
                JSON.stringify({
                    type: 'DOOR_EVENT',
                    mac: DEFAULT_MAC,
                    payload: state,
                })
            );
            break;
        }
        case '5': {
            console.log('\n[INTRUSION] Simulating Door Forced Open event...');
            ws.send(
                JSON.stringify({
                    type: 'INTRUSION_ALERT',
                    mac: DEFAULT_MAC,
                })
            );
            break;
        }
        case '6': {
            if (autoSimulationTimer) {
                clearInterval(autoSimulationTimer);
                autoSimulationTimer = null;
                console.log('\n[AUTO] Automated simulation stopped.');
            } else {
                console.log('\n[AUTO] Automated traffic simulation started (interval: 4s)...');
                autoSimulationTimer = setInterval(() => {
                    const card = DEMO_CARDS[Math.floor(Math.random() * DEMO_CARDS.length)];
                    const dir = Math.random() > 0.5 ? 'ENTRY' : 'EXIT';
                    console.log(`[AUTO SCAN] ${card.name} (${dir})`);
                    ws.send(
                        JSON.stringify({
                            type: 'ACCESS_CHECK',
                            mac: DEFAULT_MAC,
                            payload: `UID:${card.uid}`,
                            direction: dir,
                        })
                    );
                }, 4000);
            }
            break;
        }
        case 'h':
            printHelp();
            break;
        default:
            console.log('Unknown command. Type "h" for help.');
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', (line) => {
    handleCommand(line);
});
